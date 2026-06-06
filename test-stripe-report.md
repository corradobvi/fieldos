# Test Stripe / Pagamenti — MyVivaio

- **Data**: 2026-06-05
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Bundle attivo**: `2026-06-04-v24-stable` (commit `cbebaf0`)
- **runId**: dal JSON `test-stripe-results.json`
- **Durata**: 9.0s

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **29**    |
| FAIL  | **6**     |
| SKIP  | **6** (Baiardo no-creds + endpoint inesistenti) |

## ⚠️ Modalità Stripe: **LIVE** in produzione

Confermato dal prefix `cs_live_*` nell'URL di checkout creato dal test. Tutti gli abbonamenti reali e i checkout (anche quelli "di test" se completati) finiscono su Stripe LIVE. Il test ha **creato realmente 3 sessioni di checkout LIVE** su Stripe — sono visibili nel dashboard come `expired/abandoned` (nessuna carta inserita, no addebito), ma esistono. **Pulire il dashboard Stripe** post-test se necessario.

## 🚨 BUG CRITICI P0 (sicurezza)

### #1 — Endpoint Stripe senza `requireAuth`

**5 su 6 endpoint** della famiglia `/api/v2/stripe/*` sono accessibili **senza autenticazione**:

| Endpoint | Verifica eseguita | Esito reale | Impatto |
|----------|-------------------|:----------:|---------|
| `POST /stripe/create-checkout` | senza token | **200 + URL checkout LIVE** | Chiunque crea sessioni di pagamento per qualsiasi email |
| `GET /stripe/subscription?societyId=X` | sempre | 200 | Leggi stato sub, customer Stripe, 4-cifre carta, period_end di chiunque |
| `POST /stripe/customer-portal` | sempre | 200 | Apri portal Stripe per gestire abbonamento altrui (incl. cambio piano, cancel) |
| `POST /stripe/cancel` | sempre | 200 | **Cancella l'abbonamento di chiunque** conoscendo `societyId` |
| `GET /stripe/invoices?societyId=X` | sempre | 200 | Vedi importi e date fatture di chiunque |
| `POST /stripe/webhook` | con/senza sig | 400 corretto | ✅ sicuro (signature obbligatoria) |

**Severità**: P0. Un attaccante che conosce un `societyId` numerico (1-99) può:
- Cancellare abbonamento di qualsiasi società in 1 chiamata
- Iniettare URL phishing facendo pagare a un utente vittima

**Fix proposto**: aggiungere `requireAuth` + verifica `req.jwtUser.societyId === Number(societyId)` (o `is_account_owner=1`) su tutti gli endpoint eccetto webhook.

### #2 — Manca `billing_cycle_anchor=1ago2026`

```ts
// stripe.ts:222-228 (pre-launch giu-lug 2026)
if (String(intervallo) === "annuale") {
  const anchorTs = getPreLaunchAnchorTs();
  if (anchorTs) {
    params["subscription_data[trial_end]"] = Math.floor((Date.now() + DEMO_DAYS * 86400 * 1000) / 1000);
  }
}
```

Il pre-launch dà solo `trial_end = oggi + 14gg` ma **NON** setta `billing_cycle_anchor = anchorTs`. Conseguenza: il primo addebito di un utente che si abbona oggi (2026-06-05) sarà il **2026-06-19**, NON il **2026-08-01** come da spec "tutti pagano dal 1 agosto".

**Severità**: P1. Fattura il primo abbonamento del cliente nel periodo sbagliato. Va aggiunto `billing_cycle_anchor=anchorTs` + `proration_behavior=none` (o `create_prorations`).

### #3 — `APP_URL` env var potenzialmente non settata

```ts
// stripe.ts:194
const appUrl = process.env.APP_URL ?? "https://workspacefieldos-production.up.railway.app";
```

Se `APP_URL` non è settato su Railway, gli utenti dopo il pagamento vengono reindirizzati al vecchio dominio Railway (`workspacefieldos-production.up.railway.app/payment-success`) invece di `app.myvivaio.app`. **Verificare nel dashboard Railway** che `APP_URL=https://app.myvivaio.app` sia presente.

## Checklist pre go-live Stripe

- [x] **`allow_promotion_codes: true`** — `stripe.ts:231`, presente su ogni checkout session
- [ ] **`billing_cycle_anchor=1 agosto 2026`** — **MANCA**, vedi bug #2
- [ ] **`success_url` / `cancel_url` corretti** — dipendono da `APP_URL` env var, vedi bug #3
- [x] **`STRIPE_WEBHOOK_SECRET` env var** — usato in `stripe.ts:246`, e verificato funzionante (signature finta → 400, stale → 400)
- [x] **Modalità LIVE** — confermato `cs_live_*` nell'URL di checkout
- [x] **`metadata[societyId]`** — settato in `stripe.ts:216-218` (solo se non demo)
- [x] **Webhook signature verification** — implementata correttamente: HMAC-SHA256, timing-safe compare, anti-replay (timestamp >5 min → 400 `stale_event`)
- [ ] **`requireAuth` su tutti gli endpoint** — **MANCA su 5/6**, vedi bug #1

## Bug trovati

1. **P0** — `/stripe/create-checkout` accessibile senza auth → chiunque crea checkout per qualsiasi email (test confermato: SENZA token → 200 + URL cs_live_*)
2. **P0** — `/stripe/subscription`, `/stripe/invoices`, `/stripe/customer-portal`, `/stripe/cancel` tutti senza auth → leggi/modifica abbonamento altrui conoscendo societyId
3. **P1** — `billing_cycle_anchor` non settato per pre-launch → addebito primo abbonamento NON il 1 agosto
4. **P2** — `APP_URL` fallback è vecchio dominio Railway; se env var manca → success/cancel su dominio sbagliato

## Endpoint inesistenti / SKIP giustificati

- `GET /api/v2/stripe/payment-methods` — non esiste come endpoint dedicato. Dato disponibile dentro `/stripe/subscription` come campo `paymentMethod: {brand, last4}`. Spec va aggiornata.
- `GET /api/v2/stripe/validate-coupon` — non esiste. Stripe gestisce promo codes internamente via `allow_promotion_codes:true` + configurazione coupon sul **Stripe Dashboard** (Products → Coupons → Promotion Codes). Il codice `FOUNDERS2026` va creato lì.
- **Baiardo `id=53` (mister_pro omaggio)** — SKIP: nessuna credenziale admin Baiardo fornita. Bene rispettare la regola "NON modificare dati società reali". Per un test futuro, Corrado può fare login dal browser e copiare il JWT dal localStorage.

## Webhook eventi gestiti (lettura statica `stripe.ts`)

| Evento | Riga | Azione |
|--------|-----:|--------|
| `checkout.session.completed` | 283 | UPDATE `societies` (status=active, piano, customer_id, sub_id); update SA blob; gating su `billing_mode='omaggio'` |
| `customer.subscription.updated` | 352 | UPDATE `societies.subscription_status` + piano da `priceIdToPiano(price.id)` |
| `customer.subscription.deleted` | 386 | UPDATE `societies` (status=canceled, stato=sospesa); update SA blob; audit log; email cliente |
| `invoice.payment_failed` | 508 | UPDATE `societies` (status=past_due, payment_failed_at); update SA blob; audit log; email cliente con attempt_count + next_payment_attempt |

Tutti gli handler:
- Rispettano `billing_mode='omaggio'` (non toccano piano per società omaggio)
- Hanno fallback non-bloccanti per il blob SA (catch + log warn)
- Audit log nella tabella `sa_audit_log` con metadata Stripe complete

## Raccomandazioni prima del 1/8/2026

### P0 (obbligatorie pre go-live)
1. **Aggiungi `requireAuth` su `/stripe/create-checkout`, `/stripe/subscription`, `/stripe/customer-portal`, `/stripe/cancel`, `/stripe/invoices`**. Pattern:
   ```ts
   router.post("/stripe/cancel", requireAuth, async (req, res) => {
     const callerSocId = req.jwtUser!.societyId;
     const reqSocId = Number(req.body.societyId);
     if (callerSocId !== reqSocId) return res.status(403).json({error:"forbidden"});
     // ... resto handler
   });
   ```
   Per `/stripe/cancel` aggiungi anche `requireRole("admin")` + check `is_account_owner=1` (solo il proprietario può cancellare).

2. **Setta `APP_URL=https://app.myvivaio.app` su Railway** (verifica dashboard env vars).

3. **Aggiungi `billing_cycle_anchor` per pre-launch**:
   ```ts
   if (String(intervallo) === "annuale") {
     const anchorTs = getPreLaunchAnchorTs();
     if (anchorTs) {
       params["subscription_data[billing_cycle_anchor]"] = anchorTs;
       params["subscription_data[proration_behavior]"]   = "none";
       // trial_end opzionale, decidi se vuoi 14gg gratis o no
     }
   }
   ```
   Senza questo, il signup di luglio fattura a luglio + 1 mese invece che il 1 agosto.

### P1 (raccomandate)
4. **Coupon FOUNDERS2026** — crearlo sul Dashboard Stripe come Promotion Code, eligible products = solo Annual prices (`STRIPE_PRICE_MISTER_ANNUALE`, `STRIPE_PRICE_MISTER_PRO_ANNUALE`, `STRIPE_PRICE_SOCIETA_ANNUALE`). Sconto -30% forever.
5. **Idempotency keys** — aggiungere `Idempotency-Key: <uuid>` su `stripePost` calls per evitare double-charge in caso di retry.
6. **Rate limiting** su `/stripe/create-checkout` (oggi nessun limit → DoS facile).
7. **Verifica fallback `STRIPE_WEBHOOK_SECRET`** in produzione: `stripe.ts:248-251` fa `sendStatus(200)` silent se manca. Cambiare in `500 server_not_configured` per evidenziare misconfig.

### P2 (cleanup)
8. Pulire le 3 sessioni di test create durante questo run dal dashboard Stripe LIVE (sono in stato `open` con email `qa-stripe-*@myvivaio.app`).
9. Documentare nella spec del test che `/payment-methods` e `/validate-coupon` non sono endpoint.

## Conclusione

Il backend Stripe è **funzionalmente solido** (webhook signature OK, payload corretti, handler completi) **ma con anomalie di sicurezza P0 critiche da fixare prima del go-live**. La modalità LIVE è già attiva e il rischio è reale: chiunque conosca un `societyId` può oggi cancellare abbonamenti altrui o creare phishing-checkout.

## File generati
- `test-stripe-agent.mjs` — script ~280 righe, 41 record di test
- `test-stripe-results.json` — output JSON
- `test-stripe-report.md` — questo report

Tutti untracked. Niente commit (come da istruzione "solo test + report").
