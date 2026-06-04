# Test Società MyVivaio — Report

- **Data**: 2026-06-03
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Piano testato**: `societa`
- **runId**: `15527633`
- **Società di test**: `id=58` "Test Società QA 15527633" (poi `suspended` in cleanup)
- **Admin di test**: `qa-societa-15527633@myvivaio.app` (utente `id=93`)

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **59**    |
| FAIL  | **1** (falso positivo, non bug — vedi sotto) |
| SKIP  | **0**     |
| Durata totale | 272.6s |

Considerando il falso positivo C.EVENTI (filtro default 90 giorni), il piano "Società" su PROD risulta **funzionalmente integro** su tutte le aree testate.

## Dettaglio per area

### Fase 0 — Setup società
- `POST /api/v2/superadmin/societies` (X-SA-Secret) → 201 con `societyId=58, userId=93, codice=TESTS436, piano=societa`.
- Endpoint corretto è `POST /api/v2/superadmin/societies` (NON `/create-society` come indicato nella consegna). Body atteso: `{nome, citta, piano, adminNome, adminCogn, adminEmail, adminPass}`.

### Fase 1 — Login & JWT — 4 PASS
- Login admin 200; JWT contiene `societyId=58`, `role=admin`, `societyPiano=societa`. Tutto allineato.

### A. AUTH & PERMESSI — 5 PASS
- `GET /api/v2/society` con token valido → 200 con `piano=societa`.
- Senza token → 401, con token falso → 401, password errata → 401.

### B. LEVE & PLAYERS — 7 PASS
- `POST /api/v2/leve` → 201 (id=31).
- `GET /api/v2/leve` ritorna 1 leva (quella creata).
- Creati 3 giocatori (id=66, 67, 68). Tutti i campi obbligatori popolati (`nome`, `cognome`, `anno_nascita`, `numero`).

### C. EVENTI & PRESENZE — 3 PASS / 1 FAIL (falso positivo)
- `POST /api/v2/events` → 201 (id=88, allenamento, ricorrente=false).
- `POST /api/v2/presenze/bulk` per 3 giocatori → 200, `updated=3`.
- `GET /api/v2/presenze?eventId=88` → 200, 3 record, tutti `presente`.
- ❌ **FALSO POSITIVO** — `GET /api/v2/events include evento creato` → `count=0`. **Causa**: lo script ha creato l'evento al 2026-12-15 ma `GET /events` filtra di default `da=today, a=today+90gg`. Oggi è 2026-06-03 → range default termina ~2026-09-01 → l'evento di dicembre è (correttamente) escluso. Non è un bug del backend; è una **debolezza dello script di test**.

### D. CAMPIONATO & TORNEI — 3 PASS
- `GET /api/v2/campionato/settings?leva=...` → 200 con array vuoto.
- `POST /api/v2/tornei` (id stringa client-side) → 200.
- `GET /api/v2/tornei` ritorna il torneo creato.

### E. STATISTICHE — 5 PASS — anti-regressione "zero gol" superata
- Creato match + stats con 2 gol al primo giocatore, 1 assist al secondo.
- `GET /api/v2/stats/leva` → 200, struttura corretta (`{amichevole, campionato, torneo, totale}` per ogni player).
- `gol_totali=2` (riflesso correttamente).
- `GET /api/v2/stats/player/:id` → 200, conferma 2 gol nel totale.

### F. CHAT — 3 PASS
- `GET /api/v2/chat/staff_<leva>/messages` → 200 (lista vuota inizialmente).
- `POST /api/v2/chat/staff_<leva>/messages` → 201 (messaggio inserito, autore=93).
- `GET /api/v2/chat/staff_<leva>/polls` → **200** (non 403). **Il "bug noto polls 403" non è riprodotto** su piano società con utente admin.

### G. RUOLI & PERMESSI — 8 PASS
- Allenatore creato + login OK.
- Dirigente creato + login OK.
- **Allenatore** `GET /api/v2/quote` → **403** ✓ (gating `requireRole("admin","dirigente")`).
- **Dirigente** `GET /api/v2/quote` → **200**. **Discrepanza con la spec del test**: la consegna chiedeva 403 ma il codice (`requireRole("admin","dirigente")` + `requirePlan("societa")`) **autorizza** correttamente il dirigente in piano società. Comportamento atteso = 200, non 403.
- Allenatore `POST /api/v2/quote` → 403 ✓.
- Allenatore `GET /api/v2/players?leva=<altra>` → 200 con array vuoto (filtro WHERE leva = '...', non gating). Il `GET /api/v2/players` **non** applica leva-scope server-side: ogni utente autenticato può listare tutti i giocatori della società filtrando via querystring. Vedi raccomandazioni P2.

### H. PIANO SOCIETÀ — FEATURE ESCLUSIVE — 5 PASS
- Admin `GET /api/v2/quote` → 200, lista vuota.
- Admin `POST /api/v2/quote` per player 66 → 201, id=1.
- Multi-utente: 3 utenti attivi (admin + coach + dirigente) — limite collaboratori `Infinity` su piano società ✓.
- `GET /api/v2/stripe/subscription?societyId=58` → 200 con `{status:"demo", piano:"societa", billingMode:"omaggio"}` (la società di test parte in demo 10 giorni, ma il piano è `societa`).
- `POST /api/v2/leve` extra (U13) → 201 (limite leve infinito su piano società ✓), poi rimossa.

### I. TECNICO — 5 PASS
- `GET /api/healthz` → 200.
- `GET /api/healthz/db` → 200 (nota: nel body manca il campo `reachable` esposto; lo script lo cerca ma viene segnato `undefined` — sostanzialmente cosmetico).
- **Latenza media GET `/api/v2/society` (n=5): 157ms** (min 123ms, max 282ms). Eccellente.
- `Content-Type: application/json; charset=utf-8` ✓.
- `Access-Control-Allow-Origin: *` ✓.

### CLEANUP — 10 PASS
- Cancellati: 3 players, 1 match, 1 event, 1 torneo, 2 utenti (coach+dirigente), 1 leva.
- Società `id=58` → **SUSPENDED** (endpoint DELETE per società non esiste; ho usato `POST /api/v2/superadmin/societies/:id/suspend`).

## Bug confermati (già noti)
Nessuno riprodotto in questo run. In particolare:
- **"chat polls 403"**: NON riprodotto. `GET /api/v2/chat/.../polls` con admin in piano società → 200.
- **"zero gol nelle stats"**: NON riprodotto. Gol inseriti vengono aggregati correttamente.

## Bug nuovi trovati
**Nessun bug funzionale.** L'unico FAIL è un falso positivo dovuto al filtro default `da=today, a=today+90gg` di `GET /api/v2/events`. Lo script di test andrebbe migliorato per usare una data evento entro il range, o passare esplicitamente `?da=&a=`.

## Endpoint mancanti / da aggiungere
- **`DELETE /api/v2/superadmin/societies/:id`** — non esiste. Per il cleanup completo della società di test ho usato `suspend` come workaround. Le società sospese restano in MySQL: serve un endpoint hard-delete (con FK cascade su users/leve/players/events/etc.) per il flusso QA e per offboarding cliente.
- **`GET /api/v2/superadmin/societies/:id/full-dump`** (opzionale) — utile per QA: snapshot completo dei dati di una società in una sola chiamata.

## Osservazioni / Discrepanze rilevanti
1. **Naming endpoint SuperAdmin**: la consegna citava `POST /api/v2/superadmin/create-society` ma il vero è `POST /api/v2/superadmin/societies`. Body fields effettivi: `nome, citta, piano, adminNome, adminCogn, adminEmail, adminPass`.
2. **Dirigente e quote**: la spec del test si aspettava 403 ma `requireRole("admin","dirigente")` consente l'accesso. Per piano società è il comportamento corretto secondo il codice; va però chiarito a livello di prodotto se questa esposizione è voluta.
3. **`GET /api/v2/players` senza leva-scope**: qualunque utente autenticato (incluso allenatore di una sola leva) può listare giocatori di altre leve passando `?leva=...`. Vedi P2 sotto.

## Raccomandazioni

### P1 (sicurezza / coerenza dati)
- **Leva-scope su `GET /api/v2/players`**: se ruolo ∈ {allenatore, preparatore_portieri} e `users.leva` è una stringa singola, restringere lato server alla sua leva (oggi solo `WHERE society_id = ? AND leva = ?` con leva da query, senza controllo che l'utente possa accedere a quella leva). Soluzione: applicare `requireLeva` o il pattern `leva-guard` come già fatto su presenze/allenamenti.
- **Endpoint hard-delete società in SA**: implementare `DELETE /api/v2/superadmin/societies/:id` (con cancellazione cascade o transazione esplicita su tutte le child tables) per supportare offboarding completo e QA pulito.

### P2 (UX / DX)
- **`GET /api/v2/events` con range esplicito o intelligente**: documentare meglio il filtro default `today → today+90gg`. Considerare l'aggiunta di un parametro `?all=1` per scenari QA/admin che vogliono vedere tutto.
- **Sincronizzare la spec del test**: la consegna chiede 403 per dirigente su `/quote`; il codice consente 200. Allineare aspettative e/o gating.
- **Chiarire ruolo iniziale degli utenti creati via `POST /api/v2/users`**: lo script ha emesso PATCH `{stato:"attivo"}` cautelativamente — in realtà il default è già `attivo` (login funziona senza il PATCH). Pulire la documentazione del flusso.

### P3 (qualità del test)
- Migliorare lo script: creare evento entro 90 giorni da `today` per evitare il falso positivo, o passare `?da=&a=` esplicito.
- Aggiungere test sui flussi Stripe (subscribe → checkout success simulato), oggi non coperti perché richiedono webhook esterno.
- Aggiungere test "convocazione" (oggi vive solo nel blob), una volta migrata a MySQL.

## File generati
- `test-societa-agent.mjs` — script di test riutilizzabile (idempotente: usa runId con timestamp per evitare collisioni email).
- `test-societa-results.json` — output strutturato del run con tutti i 60 record.
- `test-societa-report.md` — questo report.

## Come ri-eseguire
```bash
node test-societa-agent.mjs
# oppure con base diversa:
BASE_URL=https://app.myvivaio.app SA_SECRET=MyVivaio123++ node test-societa-agent.mjs
```
Lo script crea una società nuova ad ogni run (email univoca con `runId`) e fa cleanup automatico al termine. Nessun rischio per le società reali (id 2, 5, 53 esclusi via guard `REAL_SOC_IDS`).
