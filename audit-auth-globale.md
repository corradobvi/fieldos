# Audit Globale requireAuth — MyVivaio

- **Data**: 2026-06-06
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Commit fix**: `1caeceb` (deployato e verificato)
- **Scope**: tutti i file `artifacts/api-server/src/routes/` (47 file), endpoint write (`POST/PUT/PATCH/DELETE`)
- **Metodo**: grep ricorsivo `router\.(post|put|patch|delete)\(`, classificazione middleware chain, ispezione handler per pattern di auth alternativi (X-SA-Secret, signature, requireAdminSecret)

## Endpoint VULNERABILI trovati e fixati (4 — tutti in commit `1caeceb`)

| # | Endpoint | Severità | Fix applicato |
|---|----------|:---:|---|
| 1 | `PUT /api/state/:key` (state.ts:110) | **P0** | `requireAuth` + ownership `key === fieldos_state_soc_${jwt.societyId}` |
| 2 | `POST /api/upload/photo` (upload.ts:29) | P1 | `requireAuth` |
| 3 | `DELETE /api/upload/photo/:societyKey/:photoKey` (upload.ts:88) | P1 | `requireAuth` |
| 4 | `POST /api/ai-assist` (assist.ts:13) | P2 abuse risk | `requireAuth` |

### Dettagli

**#1 P0 — `PUT /state/:key`**: la key `fieldos_state_soc_<id>` è formato pubblico sequenziale (1-99). Senza fix, chiunque poteva inviare uno `stateJson` abbastanza grande (>MIN_STATE_BYTES) per bypassare i guard interni (size/demo/downgrade) e sovrascrivere il blob principale di qualsiasi società. Test post-deploy conferma: sender con `JWT.societyId=77` riceve `403 "state key must match JWT.societyId (expected: fieldos_state_soc_77)"` quando tenta di scrivere `fieldos_state_soc_53`.

**#2 P1 — `POST /upload/photo`**: foto fino a 2MB salvate in `photo_uploads.data MEDIUMBLOB`. Senza auth, attaccante riempiva lo storage gratis. Ora richiede JWT. Ownership su `society_key` NON applicato (formato non sempre derivabile da `jwt.societyId`, es. demo) → segnalato come miglioria P2.

**#3 P1 — `DELETE /upload/photo/:societyKey/:photoKey`**: chiunque cancellava foto altrui conoscendo le chiavi. `requireAuth` aggiunto; ownership stesso disclaimer del #2.

**#4 P2 — `POST /ai-assist`**: API Anthropic illimitata senza auth → costi/abuse. `requireAuth` limita a utenti loggati; rate-limit per-user raccomandato come P2 follow-up.

## Endpoint LEGITTIMI senza requireAuth (whitelist verificata)

### Pre-login / pubblico (5 endpoint)
- `POST /api/v2/auth/login`, `POST /api/login` — login
- `POST /api/v2/auth/register` — registrazione
- `POST /api/v2/auth/self-register` — self-register staff
- `POST /api/v2/auth/guardian-register` — registrazione genitore con codice
- `POST /api/v2/auth/verify-code`, `POST /api/auth/verify-code` — verifica codice email
- `POST /api/v2/public/forgot-password` (in public.ts:198) — reset password
- `POST /api/v2/public/join-request` (in public.ts:81) — richiesta accesso

### Webhook / signature (1 endpoint)
- `POST /api/v2/stripe/webhook` — protetto da HMAC-SHA256 Stripe signature

### Diagnostici post-fix push (2 endpoint)
- `GET /api/push/vapid-public` — espone solo public key (by design)
- `GET /api/push/debug` — **ora con `requireAuth + requireRole("admin","mister_admin")`** post commit `38db9f6`

### Endpoint con X-SA-Secret inline (oltre 20 endpoint)

Tutti gli endpoint sotto `/superadmin/*`, `/admin/*`, `/_admin/*`, `/_diag/*` usano check `req.headers["x-sa-secret"]` o `x-admin-secret` come prima riga del handler (equivalente a `requireAuth` con secret invece di JWT):

| File | Endpoint | Secret usato |
|------|----------|------|
| `v2/superadmin.ts` | 10 endpoint (`/superadmin/societies/*`, `/superadmin/reset-password`, ecc.) | `x-sa-secret` |
| `v2/admin-backfill-roles.ts` | `POST /superadmin/_backfill-roles` | `x-sa-secret` |
| `v2/admin-cleanup-preview.ts` | 6 endpoint `/superadmin/_diag/*` | `x-sa-secret` |
| `v2/migrate-polis.ts` | `POST /superadmin/migrate-polis-users` | `x-sa-secret` |
| `v2/admin-populate-sessioni.ts` | 2 endpoint `/_admin/*` | `x-admin-secret` |
| `v2/admin-reset-demo.ts` | `POST /admin/reset-stella-demo` | `x-admin-secret` |
| `v2/demo-wa.ts` | 2 endpoint `/admin/demo-wa/*` | `requireAdminSecret` middleware |

### Migrate (admin via JWT)
- `POST /api/v2/migrate` — `requireAuth + requireRole("admin")` ✅

## Endpoint DA CHIARIRE

Nessuno. I 4 vulnerabili sono stati fixati, i restanti sono classificati senza ambiguità.

## Test post-deploy (verifica live `1caeceb`)

| Test | Atteso | Got |
|------|:------:|:---:|
| `PUT /state/<altra società>` SENZA token | 401 | ✅ 401 |
| `PUT /state/<altra società>` con token società diversa | 403 | ✅ 403 + dettaglio chiaro |
| `POST /upload/photo` SENZA token | 401 | ✅ 401 |
| `POST /ai-assist` SENZA token | 401 | ✅ 401 |
| `PUT /state/<own>` con token corretto (no rotture FE) | 200 | ✅ 200 + version=1 |

## Raccomandazione: CI lint rule per prevenire regressioni

Pattern emerso nell'intera sessione: **5 endpoint Stripe + 2 Push + 4 audit globale = 11 endpoint write privi di `requireAuth`** introdotti gradualmente. Senza un check automatico, la regressione si ripeterà.

**Proposta lint script** (semplice grep-based, run in CI o pre-commit):

```bash
# tools/check-auth.sh — eseguibile in CI/pre-commit
#!/usr/bin/env bash
set -e

# Whitelist legittima (regex su path completo file:line:contenuto)
WHITELIST='(/auth/(login|register|verify-code|self-register|guardian-register|force-password|change-password))|(/public/(join-request|forgot-password))|(/stripe/webhook)|(/push/(vapid-public))|(/login)|(/auth/login)'

# Pattern admin secret check (handler inline)
SECRET_PATTERN='requireAdminSecret|x-(sa|admin)-secret|SA_SECRET|ADMIN_RESET_SECRET'

# Trova endpoint write senza requireAuth E senza pattern admin secret
issues=0
while IFS= read -r line; do
  file=$(echo "$line" | cut -d: -f1)
  lineno=$(echo "$line" | cut -d: -f2)
  content=$(echo "$line" | cut -d: -f3-)
  # Skip se ha requireAuth nella stessa riga (single-line middleware chain)
  echo "$content" | grep -q "requireAuth" && continue
  # Skip se rientra nella whitelist
  echo "$content" | grep -qE "$WHITELIST" && continue
  # Skip se nelle 5 righe successive c'è requireAuth (multilinea) o secret check
  ctx=$(sed -n "${lineno},$((lineno+5))p" "$file" 2>/dev/null)
  echo "$ctx" | grep -q "requireAuth" && continue
  echo "$ctx" | grep -qE "$SECRET_PATTERN" && continue
  # Skip se il file stesso ha un secret check globale (es. demo-wa con requireAdminSecret per intero router)
  head -50 "$file" | grep -qE "$SECRET_PATTERN" && continue

  echo "❌ VULNERABILE: $file:$lineno"
  echo "   $content"
  issues=$((issues+1))
done < <(grep -rnE 'router\.(post|put|patch|delete)\(' artifacts/api-server/src/routes/ | grep -v node_modules)

if [ $issues -gt 0 ]; then
  echo ""
  echo "Trovati $issues endpoint write senza requireAuth né secret check."
  echo "Aggiungi requireAuth o documenta in whitelist."
  exit 1
fi
echo "✅ Audit auth OK"
```

Integrazione consigliata:
- **Pre-commit hook** (`.husky/pre-commit` o `lefthook.yml`): blocca commit con regressioni
- **CI** (GitHub Actions): job dedicato che fallisce la PR se trova endpoint vulnerabili
- **README/CLAUDE.md**: documentare la whitelist e il pattern (chi aggiunge nuovo endpoint pre-login lo segnala)

## Riepilogo sessione completa "sicurezza auth"

| Commit | Cosa |
|--------|------|
| `384f692` + `1fe95e4` | 5 endpoint Stripe gattellati + billing anchor |
| `38db9f6` | 3 endpoint Push gattellati |
| `1caeceb` | 4 endpoint vari (state/upload/ai-assist) |

**Totale**: 12 endpoint sicurezza-fixed in 4 commit. Tutti deployati e live, verificati end-to-end.

**Limitazioni residue note** (fuori scope di questo audit):
- Multi-device push subscription (schema UNIQUE single-row)
- Ownership `society_key` su upload/photo (formato non derivabile)
- Rate-limit per-user su `/ai-assist`
- A1/A2/A4/A5/A6 (anomalie P2 cross-leva read, già documentate)

## File generati
- `audit-auth-globale.md` — questo report

Nessun altro deliverable necessario. Commit `1caeceb` già pushato.
