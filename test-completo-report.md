# Test Completo Bottone per Bottone — MyVivaio

- **Data prima esecuzione**: 2026-06-04 (208/10/48)
- **Data aggiornamento finale**: 2026-06-05 (221/1/50 dopo fix backend + fix script)
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Piano**: `societa`
- **Bundle attivo al run finale**: `2026-06-04-v24-stable` (commit `5b9d997`)
- **Società di test**: creata, popolata, sospesa in cleanup

## Riepilogo run finale

| Esito | Conteggio |
|------:|:----------|
| PASS  | **221** |
| FAIL  | **1** (bug backend NEW emerso post fix-script) |
| SKIP  | **50** (endpoint nella spec non esistenti — attesi) |
| Durata | 58.3s |

## Storia evolutiva dei FAIL

### Run #1 — 10 FAIL (2026-06-04)
- 5 × `GET /comunicazioni` → 500
- 1 × `CHAT mister leva_U12` → 200 atteso 403
- 4 × `POST /allenamenti` → 400 (test con body sbagliato)

### Run #2 — 0 FAIL strutturali, scoperto 1 bug nascosto
Tutti i 10 FAIL precedenti chiusi con 3 commit + 1 fix di test:

| Commit | Fix |
|--------|-----|
| `14574cf` | `LIMIT ? OFFSET ?` con `pool.execute` → interpolazione client-side dopo sanitize int. Risolve 5 FAIL comunicazioni 500. |
| `5b9d997` | Resolver chat `leva_<X>` ora age-based: `/^U(\d+)/` con n<14 → solo dirigente; altrimenti include allenatore/mister/mister_admin. Risolve 1 FAIL mister leva_U12. |
| script | `leva_id` (snake_case INT) invece di `levaId` (camelCase) nel body `POST /allenamenti`. Risolve 2 FAIL admin/mister. |
| | **Emerso 1 FAIL NUOVO P0**: vedi sotto. |

## 🚨 BUG BACKEND NEW (P0) — Genitore può creare allenamenti

```
[FAIL] ALLENAMENTI [genitore] POST /allenamenti → 403  expected=403 got=201
body: {"id":"d6612e03-...","leva_id":53,"societa_id":70,"creato_da":145,"titolo":"Test genitore",...}
```

### Causa
`POST /api/v2/allenamenti` (allenamenti.ts:468) ha solo:
```ts
router.post("/allenamenti",
  requireAuth,
  requirePermission("modifica_piano_allenamento"),  // ← fail-open su NULL!
  requireLeva(_levaFromLevaIdInBody),
  ...
);
```
Nessun `requireRole(...)`. Il check `requirePermission` in `lib/permissions.ts:21` ha policy **fail-open** su `permissions=NULL`:

```ts
// NULL permissions → no restrictions configured → pass (backward compatible)
if (rows[0].permissions === null || rows[0].permissions === undefined) { next(); return; }
```

Il default `users.permissions = NULL`. Il genitore (privo di permissions esplicite) **passa qualsiasi permission check**. Inoltre `requireLeva` per il genitore matcha la leva del figlio (linkato via `player_guardians`), quindi:
- `requireLeva(_levaFromLevaIdInBody)` → leva U12 corrisponde alla leva del figlio → next()
- `requirePermission("modifica_piano_allenamento")` → permissions=NULL → next()
- handler → INSERT → 201

Il giocatore non è bloccato dalla stessa logica ma dal `requireLeva`: assegnato a U16, prova allenamento U12 → 403 leva_forbidden. Se avesse provato un allenamento U16 avrebbe creato anche lui.

### Impatto
Tutti gli endpoint gated SOLO da `requirePermission` (senza `requireRole`) sono vulnerabili agli utenti consumer (genitore/giocatore/nonno) con `permissions=NULL`:
- `POST /allenamenti` ← confermato vulnerabile
- `PATCH /allenamenti/:id`
- `DELETE /allenamenti/:id`
- `POST /allenamenti/:id/sessioni/riordina`
- `POST /allenamenti/:id/sessioni`
- `PATCH /allenamenti/:id/sessioni/:sessioneId`
- `DELETE /allenamenti/:id/sessioni/:sessioneId`
- `POST /allenamenti/sessioni-libreria` + `PATCH` + `DELETE`
- `POST /allenamenti/:id/note-vocali`
- `DELETE /allenamenti/note-vocali/:id`

Tutti `requirePermission("modifica_piano_allenamento")` senza `requireRole` aggiuntivo.

### Severità
**P0/P1 (sicurezza)**: un genitore può:
- creare allenamenti finti nella società
- modificare/cancellare allenamenti reali
- inquinare la libreria sessioni società
- riordinare le sessioni di un allenamento di mister altri

L'unico limite è `requireLeva` che restringe alla leva del figlio (per genitore) o nessuna (per giocatore: blocca tutto perché serve match nome+cognome con player nella leva).

### Fix proposto (NON applicato in questa sessione perché fuori scope task)

**Opzione A** (chirurgica, raccomandata): aggiungere `requireRole(...STAFF_ROLES)` a `POST/PATCH/DELETE /allenamenti*` davanti al permission check.

**Opzione B** (architetturale): cambiare la policy `requirePermission` da fail-open a fail-closed per i ruoli non-staff. Ovvero:
```ts
if (rows[0].permissions === null || ...) {
  // Fail-closed: per consumer roles richiedi permission esplicite
  if (req.jwtUser.role === "genitore" || req.jwtUser.role === "nonno" || req.jwtUser.role === "giocatore") {
    res.status(403).json({ error: "permission_denied", permission: key });
    return;
  }
  next(); return;
}
```
B è più sicura ma può rompere flussi backward-compat se ci sono permissions=NULL su utenti staff legacy.

## Anomalie P2 confermate ancora aperte

Già documentate in report precedenti, fuori scope di questo run:

- **A1**: mister/allenatore lettura cross-leva `/players?leva=`
- **A2**: stesso su `/stats/leva`
- **A4**: `GET /society` aperto a tutti i ruoli (spec: 403 per consumer)
- **A5**: `/presenze?eventId=` senza scope ownership
- **A6**: `/tornei` senza scope ownership

## Endpoint nella spec NON esistenti (50 SKIP, attesi)

| Spec | Reale |
|------|-------|
| `PATCH /society`/`/players/:id`/`/leve/:id`/`/events/:id`/`/quote/:id` | `PUT` (no PATCH) |
| `PATCH /matches/:id` / `/tornei/:id` | `POST` con stesso event_key/id (UPSERT) |
| `PATCH /comunicazioni/:id` | non esiste (solo POST + DELETE) |
| `PATCH /me` / `GET /me` | non esiste (usa `/account/consents`) |
| `GET /chats` | non esiste (lista derivata client-side) |
| `GET /society/subscription` | `GET /stripe/subscription?societyId=` |
| `GET /campionato/giornate` / `POST /campionato/genera` | non esistono |
| `POST /tornei/:id/genera` | non esiste |
| `GET /tornei/:id` | non esiste (solo lista `/tornei`) |
| `GET /allenamenti/presenze` | usa `/presenze?eventId=` |
| `GET/PATCH /notification-preferences` | `GET/PUT /users/me/notification-preferences` |
| `POST/DELETE /api/v2/push/subscribe` | `POST/DELETE /api/push/subscribe` (no v2) |
| `DELETE /presenze` | non esiste (UPSERT idempotente via INSERT/UPDATE) |

**Convenzione del progetto**: PUT (non PATCH) per update completi; UPSERT POST per matches/tornei. La spec del test usa PATCH per convenzione REST classica. Decidere se uniformare lato backend o lato spec.

## Riepilogo finale

- ✅ **5 bug backend reali risolti** (`14574cf` comunicazioni + `5b9d997` chat famiglie)
- ✅ **2 bug test risolti** (allenamenti body camelCase→snake_case)
- 🚨 **1 bug backend NEW emerso** (genitore POST /allenamenti — `requirePermission` fail-open)
- 📋 **5 anomalie P2 ancora aperte** (lista cross-leva/ownership scope)
- ✅ **50 SKIP attesi** (endpoint spec non implementati nel backend)

## File generati
- `test-completo-agent.mjs` — script (~750 righe, 150+ test). Corretto in body POST /allenamenti.
- `test-completo-results.json` — snapshot run finale (221/1/50)
- `test-completo-report.md` — questo report

## Prossimi step suggeriti

1. **P0**: applicare Opzione A (`requireRole` su tutti i POST/PATCH/DELETE allenamenti) — fix chirurgico ~10 minuti.
2. **P0**: rivalutare la policy fail-open di `requirePermission` (Opzione B). Audit di tutti gli endpoint che usano solo `requirePermission` senza `requireRole`.
3. **P2**: affrontare A1/A2/A4/A5/A6 in batch — richiede `getUserLeve()` + ownership checks su list endpoints.
4. **Docs**: aggiornare CLAUDE.md o spec con convenzione PUT/UPSERT (no PATCH per update completi).
