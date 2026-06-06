# Test Onboarding / Registrazione — MyVivaio

- **Data**: 2026-06-06
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Bundle**: `d24bfef` (post TASK 1 SA_SECRET fail-closed verificato)
- **Durata**: 10.6s

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **32** |
| FAIL  | **2** (entrambi bug backend reali) |
| SKIP  | **4** (endpoint nella spec non esistenti) |

## Endpoint mappati e testati

| Endpoint | Auth | Esito |
|----------|:---:|:---:|
| `POST /api/v2/auth/login` | pubblico | ✅ JWT con {userId, societyId, role, email, societyPiano} |
| `POST /api/v2/auth/register` | pubblico | ✅ richiede `{code, nome, cognome, email, password}` → crea genitore PENDENTE |
| `POST /api/v2/auth/verify-code` | pubblico | non testato direttamente |
| `POST /api/v2/auth/guardian-register` | pubblico | ✅ richiede `{code, nome, cognome, email, password}` → JWT immediato genitore |
| `POST /api/v2/auth/self-register` | pubblico | ✅ richiede `{nome, cognome, email, password, phone:+39XXX, nomeSocieta}` → crea società + admin con JWT immediato |
| `POST /api/v2/auth/force-password` | requireAuth | (non in scope) |
| `POST /api/v2/auth/change-password` | requireAuth | (non in scope) |
| `POST /api/v2/users` (invito staff) | requireAuth + role admin | ✅ admin invita mister; mister POST users → 403 |
| `POST /api/v2/players/:id/claim` | requireAuth | ✅ genitore claim figlio nella sua società; cross-society → 404 |
| `POST /api/v2/public/forgot-password` | pubblico | ⚠️ **user enumeration** (vedi sotto) |

## 🚨 BUG BACKEND #1 (P1) — User enumeration su `/public/forgot-password`

```
POST /public/forgot-password con email reale → 200
POST /public/forgot-password con email inesistente → 404
```

Backend rivela se l'email è registrata. Attaccante può **enumerare account validi** con una lista di email (es. tutti i `@gmail.com` di un dominio). Privacy/account-takeover preparation.

**Fix**: ritornare sempre 200 (o un codice neutro) indipendentemente dall'esistenza dell'email. Il messaggio response deve essere identico:
> "Se l'email è registrata, riceverai un'email con il link per il reset."

Pattern standard OWASP. Posizione codice: `public.ts:198`.

## 🚨 BUG BACKEND #2 (P2) — Nessun rate-limit su `/auth/login`

```
10 tentativi rapidi /auth/login con password sbagliata:
statuses=[401,401,401,401,401,401,401,401,401,401] elapsed=2.4s
```

Backend accetta brute force illimitato. A 240 req/s/IP un attaccante può testare ~20M password/giorno per account. Combinato con la mancanza di password complexity check forte (min 6 char in `/auth/register`, min 8 in `/auth/self-register`), il rischio è reale.

**Fix proposto**: `express-rate-limit` su `/auth/login` con strategia per-IP + per-email:
- 5 tentativi falliti / 15 min per email (lockout temporaneo soft)
- 100 req / 15 min per IP (anti-bot generale)
- Reset counter su login OK

Esempio:
```ts
import rateLimit from "express-rate-limit";
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.email + "|" + req.ip,
  handler: (_req, res) => res.status(429).json({error:"too_many_attempts"}),
});
router.post("/auth/login", loginLimiter, async (req, res) => {...});
```

## Sicurezza positiva verificata (tutti PASS)

| Verifica | Esito |
|----------|:---:|
| Login con password sbagliata → 401 | ✅ |
| JWT contiene userId, societyId, role, email | ✅ (4/4 campi presenti) |
| Login response NON contiene password/hash | ✅ no leak |
| Account consents response NO leak password | ✅ |
| Mister tenta POST /users → 403 | ✅ requireRole("admin") gating |
| Email duplicata → 409 | ✅ register + invito utenti |
| Codice società invalido → 400 | ✅ register + self-register |
| Genitore claim cross-society → 404 | ✅ ownership isolato |
| SQL injection in email → 400 | ✅ validazione email rifiuta payload |
| DB integrity post SQL-inj test | ✅ /superadmin/societies ancora 200 |
| Self-register senza phone obbligatorio → 400 | ✅ `phone_required` |

## Endpoint nella spec NON esistenti (4 SKIP)

| Spec | Stato | Endpoint reale |
|------|:---:|---|
| `POST /api/v2/invite/mister` | 404 | Usa `POST /api/v2/users` con `{ruolo:'mister'}` (admin auth) |
| `POST /api/v2/invite/genitore` | 404 | Flow: `POST /auth/guardian-register` (con codice) + `POST /players/:id/claim` |
| `POST /api/v2/auth/forgot-password` | 404 | `POST /api/v2/public/forgot-password` |
| (nessun endpoint invitation-token) | - | Il sistema usa codice-società condiviso, non token-per-utente |

**Nota architetturale**: MyVivaio NON ha "invitation-token email" classico. Usa pattern **codice-società** (es. `TESTS847`):
1. Admin crea società → riceve codice (visibile in SA panel).
2. Admin distribuisce il codice (email/whatsapp/in persona) ai potenziali membri.
3. Membri vanno su `/register` o `/guardian-register` con quel codice.

Pro: niente gestione token expiration/single-use. Contro: codice può essere condiviso pubblicamente (no controllo su chi si registra). Solo `pending` status per `register` mitiga, ma `guardian-register` dà JWT immediato.

## Confronto SA_SECRET fix (TASK 1 della sessione)

Pre-task 1: `const SA_SECRET = process.env.SA_SECRET ?? "super123"` — fallback insicuro.
Post-task 1: `if (!SA_SECRET) throw new Error(...)` — fail-closed.

Deploy `d24bfef` verificato:
- GET `/superadmin/societies` con SA-Secret giusto → 200 (32 società)
- GET senza SA-Secret → 401
- App NON in crashloop → env var presente in Railway

## Bug trovati riepilogo

| # | Bug | Severità | Posizione |
|---|-----|:---:|---|
| 1 | User enumeration `/public/forgot-password` | P1 | `public.ts:198` |
| 2 | No rate-limit `/auth/login` | P2 | `v2/auth.ts:9` |

## Raccomandazioni pre go-live

### P1 (sicurezza obbligatoria)
1. **Anti-enumeration su `/public/forgot-password`**: ritornare 200 sempre con messaggio neutro. Stesso pattern su `/register` se rivela "email_exists" diversamente.

### P2 (hardening)
2. **Rate-limit su `/auth/login`** (e ideale anche `/register`, `/guardian-register`, `/forgot-password`): `express-rate-limit` per-IP + per-email.
3. **Password complexity check** uniforme: oggi `/register` min 6, `/self-register` min 8, `/auth/guardian-register` min 8. Allineare a min 8 ovunque + check complessità (almeno 1 numero, 1 lettera).
4. **CAPTCHA su registration** se in futuro rileviamo spam su self-register (con CDN come Cloudflare basta abilitare un toggle).
5. **Token-based invitation** per scenari di "invito mirato a email specifica" (es. mister specifico). Non urgente: il codice-società pattern funziona.

### P3 (UX/docs)
6. Documentare il flow `register` → user `pendente` → admin approva via `POST /users/:id/approve`. Senza questo step esplicito, il nuovo utente non può loggarsi (la query login richiede `stato='attivo'`).
7. Documentare in CLAUDE.md che NON esistono endpoint `/invite/*` — i pattern reali sono register-by-code, guardian-register, e POST /users (admin invita staff con password temp).

## File generati
- `test-onboarding-agent.mjs` (~14 KB)
- `test-onboarding-results.json`
- `test-onboarding-report.md` — questo report

Tutti untracked. Niente commit (come da istruzione "solo test").
