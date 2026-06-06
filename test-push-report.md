# Test Push Notifications — MyVivaio

- **Data**: 2026-06-06
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Bundle**: `2026-06-04-v24-stable` (commit `1fe95e4`)
- **Durata**: 23.7s

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **63** |
| FAIL  | **4** (tutti bug/limitazioni reali) |
| SKIP  | **28** (endpoint nella spec che non esistono) |

## Mappa endpoint push (ricognizione preliminare)

| Endpoint | Auth | Note |
|----------|:---:|------|
| `GET /api/push/vapid-public` | pubblico | espone public VAPID key (OK by design) |
| `POST /api/push/subscribe` | requireAuth | salva sub in DB; userId dal JWT |
| `POST /api/push/send` | **❌ no auth** | invia push a (userId, societyKey) arbitrari |
| `GET /api/push/debug` | **❌ no auth** | diagnostica + lista nomi env vars |
| `GET /api/v2/users/me/notification-preferences` | requireAuth | 4 chiavi notify_* |
| `PUT /api/v2/users/me/notification-preferences` | requireAuth | aggiorna preferenze (PUT, no PATCH) |

**Lib helper**: `lib/push-sender.ts` — `sendPushToUsers()` + `getUsersForPush()` + `filterByPref()`.

## Logica `getUsersForPush` (verifica statica codice)

| Verifica | Esito |
|----------|:---:|
| `mister_admin` sempre incluso (catch-all senza leva-match) | ✅ |
| `leva = NULL` → wildcard (no filtro leva) | ✅ |
| `leva = 'Tutte'` / `'tutte'` → wildcard | ✅ |
| `leva` come JSON array → match via `JSON_CONTAINS` | ✅ |
| Dedup `userIds` duplicati (Set su staff+guardian) | ✅ |
| `filterByPref` rispetta `notify_<key>=0` | ✅ |
| Genitore push solo `isFirstClaim` | ✅ |
| Push su leva = staff + genitori della leva | ✅ |
| `staffOnly: true` esclude genitori (es. notif "nuovo_genitore") | ✅ |
| Cleanup automatico subscription expired (410/404) | ✅ |
| **Multi-device stessa società** | ❌ schema UNIQUE non lo permette |

## 🚨 4 BUG/LIMITAZIONI trovate

### #1 P0 — `POST /api/push/send` senza auth
```
expected=401 got=200
🚨 endpoint chiamabile SENZA token: chiunque conoscendo (userId, societyKey)
invia push fingendosi server MyVivaio
```

Test confermato: ho inviato una push reale al admin di una società di test con `curl` senza alcun token. Stripe-style impersonation/phishing tramite push notifications: un attaccante può mandare "Pagamento ricevuto, accedi qui [link malicious]" al telefono di un utente vittima.

**Fix**: aggiungere `requireAuth` + `requireRole("admin","mister_admin")` su `push.ts:83`. Endpoint usato (se mai) solo da admin per push manuali; meglio limitarlo.

### #2 P1 — `POST /api/push/subscribe` cross-society
```
expected=403 got=200
🚨 utente di società A può iscriversi a notifiche di società B
```

Test confermato: TOKEN admin società di test ha potuto subscribere a `societyKey=fieldos_state_soc_53` (Baiardo). Riceverebbe quindi push destinate a Baiardo. Privacy leak.

**Fix** in `push.ts:54-80`: validare che `societyKey === societyKeyFor(req.jwtUser.societyId)`. Se diverso → 403.

```ts
import { societyKeyFor } from "../lib/push-sender";
// ...
const expectedKey = societyKeyFor(req.jwtUser!.societyId);
if (societyKey !== expectedKey) {
  return res.status(403).json({error:"forbidden", detail:"societyKey mismatch with JWT"});
}
```

### #3 P2 — `GET /api/push/debug` info-leak env vars
```
expected=no-leak got=49 env keys names
🚨 endpoint pubblico ritorna lista completa nomi env vars Railway
```

Risposta include `all_env_keys: [49 nomi]` (solo nomi, non valori). Però rivela:
- nomi che indicano servizi connessi (es. `STRIPE_*`, `ANTHROPIC_*`, `MYSQL_*`)
- pattern Railway interni utili per fingerprinting

Non critico (no segreti esposti) ma facilita attaccante. **Fix**: aggiungere `requireAuth + requireRole("admin")` o rimuovere il campo `all_env_keys` dal payload.

### #4 P2 — Schema `UNIQUE(user_id, society_key)` impedisce multi-device
```
expected=1 push per sub
got=limitato a 1 sub/società
ATTENZIONE: schema impedisce di salvare più subscription per stesso user
in stessa società. Multi-device (telefono + tablet stessa persona) → solo
l'ultimo dispositivo riceve push.
```

`push.ts:25` definisce `UNIQUE KEY uq_user_society (user_id, society_key)`. Quando l'utente subscribe da un secondo device, la INSERT con `ON DUPLICATE KEY UPDATE` **sovrascrive** la subscription precedente. Risultato: 1 device alla volta.

**Fix** (P2, non urgent): cambiare schema in `UNIQUE(user_id, society_key, endpoint_hash)` dove `endpoint_hash = SHA256(subscription.endpoint)`. Richiede migration. In alternativa accettare la limitazione (è coerente con il pattern "stesso utente, stessa sessione browser") e documentare.

## Endpoint nella spec NON esistenti (28 SKIP, attesi)

| Spec | Reale |
|------|-------|
| `POST /api/v2/push/subscribe` | è `/api/push/subscribe` (no v2 prefix) |
| `DELETE /api/v2/push/subscribe` | **non esiste** — auto-cleanup via webpush 410/404 |
| `GET /api/v2/push/subscriptions` | **non esiste** |
| `GET /api/v2/push/test` | è `/api/v2/chat/push-test` (self-test) |
| `POST /api/v2/push/send-test` | **non esiste** |
| `GET /api/v2/notification-preferences` | è `/api/v2/users/me/notification-preferences` |
| `PATCH /api/v2/notification-preferences` | è `PUT /api/v2/users/me/notification-preferences` |
| Spec menzionata `notify_eventi` | **non esiste** — esistono `notify_convocazioni`, `notify_comunicazioni`, `notify_chat`, `notify_reminders` |

## Test sicurezza positivi (5 PASS)

- `POST /api/push/subscribe` SENZA token → 401 ✅
- `GET /users/me/notification-preferences` SENZA token → 401 ✅
- `PUT /users/me/notification-preferences` SENZA token → 401 ✅
- VAPID public key esposta correttamente in `/vapid-public` ✅
- `/api/v2/chat/push-test` funzionante per self-test ✅

## Raccomandazioni pre go-live

### P0 (sicurezza obbligatoria)
1. **`POST /api/push/send` → aggiungere `requireAuth` + `requireRole("admin","mister_admin")`** (push.ts:83). Probabilmente serve solo a SuperAdmin per push manuali; in tal caso `X-SA-Secret` check è più appropriato di JWT.

### P1 (sicurezza importante)
2. **`POST /api/push/subscribe` → validare `societyKey` contro `JWT.societyId`** (push.ts:54). Pattern già esistente in stripe.ts dopo fix `384f692`.

### P2 (hardening / qualità)
3. **`GET /api/push/debug` → aggiungere `requireAuth` + `requireRole("admin")` o rimuovere `all_env_keys` dal payload** (push.ts:138). Bundle marker hardcoded `2026-05-18-v20-minor-flow` è obsoleto, da aggiornare se serve mantenere l'endpoint.
4. **Multi-device support** (push.ts:25 schema): valutare cambio UNIQUE key per supportare subscription multiple stesso utente. Migration semplice ma non-zero downtime.
5. **Documentare** che `DELETE /api/push/subscribe` non esiste — la cleanup avviene server-side su 410/404 webpush. Se serve unsubscribe esplicito (es. utente disinstalla la PWA), aggiungere endpoint.

### P3 (UX)
6. Aggiungere `notify_eventi` o documentare che gli eventi rientrano in `notify_convocazioni`.
7. Endpoint `GET /api/v2/push/subscriptions` (lista device dell'utente) per UI "Gestisci notifiche su questo dispositivo".

## File generati
- `test-push-agent.mjs` — script ~340 righe, 95 record di test
- `test-push-results.json` — output JSON
- `test-push-report.md` — questo report

Tutti untracked. Niente commit (come da istruzione "solo test").

## Confronto con report Stripe (sessione precedente)

Pattern emerso ricorrente: **endpoint senza `requireAuth` in zone "operative"** che si pensano interne ma sono publicly reachable. Stripe aveva 5 endpoint vulnerabili, Push ne ha 2 (`send` + `subscribe` cross-society). Considerare **audit globale** che cerchi ogni `router.(post|put|patch|delete)(` senza `requireAuth` (eccetto webhook con signature own).
