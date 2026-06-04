# Test Ruoli Società MyVivaio — Report

- **Data**: 2026-06-03
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Piano**: `societa`
- **Ruoli testati**: `mister`, `genitore`, `giocatore` (over 13)
- **runId**: `16879419`
- **Società di test**: `id=59` "Test Ruoli QA 16879419" (sospesa in cleanup)

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **48**    |
| FAIL  | **11**    |
| SKIP  | **4**     |
| Durata | 13.0s |

Gli 11 FAIL non sono falsi positivi del test: **9 sono anomalie di sicurezza** reali (endpoint che non gattellano ruolo/ownership/membership) e **2 sono un bug funzionale del ruolo `mister`** (ruolo accettato dal DB ma escluso da `WRITE_ROLES`/`ADMIN_ROLES`).

## Scoperte chiave (non emerse nel test ruoli precedente)

### Scoperta 1 — `mister` è un ruolo orfano lato API
`POST /api/v2/users` con `ruolo: "mister"` riesce (201) — quindi l'enum DB lo accetta. Login con quell'utente funziona, il JWT contiene `role=mister`. **Ma il guard `requireRole` non lo riconosce in nessun endpoint di scrittura**:

- `artifacts/api-server/src/routes/v2/events.ts:8` → `WRITE_ROLES = ["admin","allenatore","dirigente","mister_admin"]`
- `artifacts/api-server/src/routes/v2/players.ts:9` → `ADMIN_ROLES = ["admin","allenatore","dirigente"]`
- `artifacts/api-server/src/routes/v2/matches.ts:11` → `WRITE_ROLES = ["admin","allenatore","dirigente"]`
- `artifacts/api-server/src/routes/v2/presenze.ts:60` → `requireRole("admin","allenatore","dirigente","mister_admin","preparatore_portieri")`

Un utente `ruolo='mister'` può solo leggere (e nemmeno tutto): non può creare events, players, presenze, matches, tornei. **Probabilmente non era voluto che `mister` fosse un valore distinto**: il "mister" funzionale è `allenatore` (e l'admin con permessi mister estesi è `mister_admin`).

### Scoperta 2 — endpoint REST inesistenti
- **Convocazioni**: nessun endpoint REST in `api-server`. Le convocazioni vivono nel blob `USERS_DB` (FE). Tutti i test "convocazioni" sono stati segnati [SKIP] con nota.
- **Documenti**: nessun endpoint REST. Upload e gestione documenti avvengono via blob/storage diretto, non via API gattellata.

### Scoperta 3 — gating ownership/membership inesistente su 6 endpoint critici
Endpoint **autenticati** ma **non scoped** per ruolo o appartenenza:

| Endpoint | Cosa fa | Chi può accedervi (oggi) |
|----------|---------|--------------------------|
| `GET /api/v2/society` | dati società | qualsiasi utente autenticato della società |
| `GET /api/v2/players` | lista TUTTI i giocatori | idem |
| `GET /api/v2/players/:id` | dati player singolo | idem (no ownership check) |
| `GET /api/v2/stats/player/:id` | stats player singolo | idem |
| `GET /api/v2/stats/leva?leva=X` | stats di QUALSIASI leva | idem |
| `GET /api/v2/chat/:chatId/messages` | tutti i messaggi della chat | idem (no membership check) |

Conseguenza: un genitore o un giocatore può accedere a dati di altri minori/famiglie semplicemente conoscendo (o indovinando incrementando) gli ID. **È un problema GDPR**, non solo un quality issue.

## Matrice permessi risultante (ATTESO vs OSSERVATO)

`200` = accesso concesso; `403` = bloccato; **GROSSETTO** = comportamento osservato diverso dall'atteso secondo consegna.

| Ruolo     | Endpoint                                          | Atteso | Osservato | Note                                        |
|-----------|---------------------------------------------------|:------:|:--------:|---------------------------------------------|
| MISTER    | GET /society                                      | 200    | 200       | OK                                          |
| MISTER    | GET /leve                                         | 200    | 200       | OK (2 leve)                                 |
| MISTER    | GET /players?leva=sua                             | 200    | 200       | OK (count=2)                                |
| MISTER    | POST /events (proxy convocazione)                 | 201    | **403**   | Bug: 'mister' fuori da WRITE_ROLES          |
| MISTER    | GET /presenze                                     | 200    | (skip)    | Non testabile: evento mai creato            |
| MISTER    | GET /stats/leva                                   | 200    | 200       | OK                                          |
| MISTER    | GET /quote                                        | 403    | 403       | OK                                          |
| MISTER    | GET /chat/staff_sua/messages                      | 200    | 200       | OK (lista vuota)                            |
| MISTER    | POST /presenze/bulk (altra leva)                  | 403    | 403       | OK (requireLeva blocca)                     |
| MISTER    | POST /players                                     | 201    | **403**   | Bug: 'mister' fuori da ADMIN_ROLES          |
| GENITORE  | GET /society                                      | 403    | **200**   | **ANOMALIA**: gating ruolo assente          |
| GENITORE  | GET /players (lista)                              | 403    | **200**   | **ANOMALIA**: vede 3 giocatori              |
| GENITORE  | GET /players/:figlioId                            | 200    | 200       | OK                                          |
| GENITORE  | GET /players/:altroId                             | 403    | **200**   | **ANOMALIA**: no ownership check            |
| GENITORE  | POST /events                                      | 403    | 403       | OK                                          |
| GENITORE  | GET /presenze (evento figlio)                     | 200    | 200       | OK                                          |
| GENITORE  | GET /stats/player/:figlioId                       | 200    | 200       | OK                                          |
| GENITORE  | GET /stats/player/:altroId                        | 403    | **200**   | **ANOMALIA**: stats di chiunque             |
| GENITORE  | GET /quote                                        | 403    | 403       | OK                                          |
| GENITORE  | POST /quote                                       | 403    | 403       | OK                                          |
| GENITORE  | GET /chat/leva_sua/messages                       | 200    | 200       | OK                                          |
| GENITORE  | POST /chat/leva_sua/messages                      | 201    | 201       | OK                                          |
| GIOCATORE | GET /society                                      | 403    | **200**   | **ANOMALIA**                                |
| GIOCATORE | GET /players (lista)                              | 403    | **200**   | **ANOMALIA**                                |
| GIOCATORE | GET /players/:proprio                             | 200    | 200       | OK                                          |
| GIOCATORE | GET /players/:altroId                             | 403    | **200**   | **ANOMALIA**                                |
| GIOCATORE | POST /events                                      | 403    | 403       | OK                                          |
| GIOCATORE | GET /presenze                                     | 200    | 200       | OK                                          |
| GIOCATORE | GET /stats/player/:proprio                        | 200    | 200       | OK                                          |
| GIOCATORE | GET /quote                                        | 403    | 403       | OK                                          |
| GIOCATORE | POST /quote                                       | 403    | 403       | OK                                          |
| GIOCATORE | GET /chat/squadra_sua/messages                    | 200    | 200       | OK                                          |
| GIOCATORE | POST /chat/squadra_sua/messages                   | 201    | 201       | OK                                          |
| CROSS     | Genitore GET player over13 NON-figlio             | 403    | **200**   | **ANOMALIA** (=cella sopra, ribadita)       |
| CROSS     | Giocatore GET /users                              | 403    | 403       | OK                                          |
| CROSS     | Mister POST /quote                                | 403    | 403       | OK                                          |
| CROSS     | Genitore GET chat di altra leva                   | 403    | **200**   | **ANOMALIA**: no membership su chat         |

## Anomalie di sicurezza (accessi non dovuti)

Tutte confermate sul codice in `artifacts/api-server/src/routes/v2/`:

1. **`GET /api/v2/society`** (`society.ts:9`) — solo `requireAuth`, nessun controllo ruolo. Per design espone nome/colori/logo: probabilmente è considerato pubblico ai membri della società. **Tuttavia** la consegna chiede 403 per genitore/giocatore — va chiarito a livello di prodotto.
2. **`GET /api/v2/players`** (`players.ts:47`) — solo `requireAuth`. Qualsiasi utente lista tutti i giocatori della società.
3. **`GET /api/v2/players/:id`** (`players.ts:71`) — solo `requireAuth`. Nessun controllo ownership: genitore vede dati di un giocatore non-figlio.
4. **`GET /api/v2/stats/player/:playerId`** (`stats.ts:64`) — solo `requireAuth`. Stats di qualsiasi giocatore visibili a chiunque.
5. **`GET /api/v2/stats/leva`** (`stats.ts:110`) — solo `requireAuth`. Aggregato statistico di QUALSIASI leva, anche non assegnata all'utente.
6. **`GET /api/v2/chat/:chatId/messages`** (`chat.ts:12`) — solo `requireAuth`. Nessun check di membership rispetto al `chatId`: chiunque conosca il `chatId` (formato pubblico: `staff_<leva>`, `leva_<leva>`, `squadra_<leva>`) può leggere tutti i messaggi.
7. **`POST /api/v2/chat/:chatId/messages`** (`chat.ts:517`) — stesso problema: chiunque può scrivere in qualsiasi chat, anche senza membership.
8. **`POST /api/v2/account/accept-parental-consent/:playerId`** — gating corretto (`role !== "genitore" → 403`, poi check `user_players`). **Buono come pattern di riferimento per gli altri**.
9. **`POST /api/v2/chat/:chatId/polls`** — il gating è solo per CREARE (`admin/dirigente/mister_admin`), non per VOTARE/LEGGERE: di nuovo, no membership check.

Le anomalie 1-7 colpiscono tutte la stessa classe di problema: **`requireAuth` da solo non basta**. Servono uno o più di:
- `requireRole(...)` (solo certi ruoli)
- check di ownership (`user_players`/`player_guardians` per genitore-figlio, match `nome+cognome` per giocatore-player)
- check di membership chat (oggi calcolata SOLO al momento della push, non sulla lettura)

## Bug funzionali nuovi

1. **Ruolo `mister` orfano**: la POST `/api/v2/users` accetta `ruolo: "mister"` (insert riuscito, id=97), ma:
   - `WRITE_ROLES` (events.ts, matches.ts) **non include `mister`** → 403 su POST /events, /matches, /tornei.
   - `ADMIN_ROLES` (players.ts) **non include `mister`** → 403 su POST/PUT /players.
   - `presenze.ts:60` whitelist non include `mister`.
   
   Un utente creato con questo ruolo è **funzionalmente paralizzato**. Decidere se:
   (a) rimuovere `mister` dall'enum DB e bloccarlo già al POST users (errore esplicito), oppure
   (b) trattare `mister` come alias di `allenatore` ovunque (estendere le whitelist).

   Confronto: `mister_admin` è gestito correttamente in tutte le whitelist. Il problema è solo con `mister` "puro".

2. **`POST /api/v2/users` non valida `ruolo` contro whitelist**: a differenza di `PATCH /users/:id` che ha `PATCH_RUOLO_WHITELIST`, la POST accetta qualunque stringa (purché l'enum DB lo accetti). Discrepanza interna da risolvere.

## Funzionalità mancanti (endpoint REST inesistenti)

- **`GET /api/v2/convocazioni`** — non esiste. Le convocazioni vivono nel blob `USERS_DB.convocazioni` lato FE. Per QA non è possibile testare l'endpoint, e per design un'app esterna o un mister da CLI non può leggere/creare convocazioni via API.
- **`POST /api/v2/convocazioni`** — idem.
- **`GET /api/v2/documenti`** — non esiste. Documenti gestiti via upload diretto in blob storage.
- **`DELETE /api/v2/superadmin/societies/:id`** — già segnalato nel report precedente; uso `suspend` come workaround.

## Raccomandazioni

### P1 (sicurezza / GDPR — da fixare subito)
- **Aggiungere `requireRole(...STAFF_ROLES)` o controllo ownership su `GET /api/v2/players/:id`** — un genitore/giocatore non deve vedere player non collegati. Pattern: se `role ∈ {genitore, nonno}` verifica `player_guardians.user_id = jwt.userId AND player_id = :id`; se `role = giocatore` verifica match `nome+cognome`.
- **Aggiungere lo stesso controllo su `GET /api/v2/stats/player/:id`** (stesso pattern).
- **Aggiungere membership check su `GET /api/v2/chat/:chatId/messages` e `POST /chat/:chatId/messages`** — riusare il resolver `_resolveChatRecipients` (già scritto per le push) per validare anche letture/scritture.
- **`GET /api/v2/players` (lista)**: se ruolo ∈ {genitore, nonno, giocatore} ritornare solo i player di proprietà (via `player_guardians`/match nome). Oggi ritorna l'intera rosa della società.
- **`GET /api/v2/stats/leva`**: se ruolo è non-staff, restringere alla SOLA leva dell'utente (oggi nessun filtro).

### P1 (bug funzionale)
- **Decidere il destino di `ruolo='mister'`**:
  - Se è alias funzionale di `allenatore`: aggiungerlo a `WRITE_ROLES`, `ADMIN_ROLES` e alla whitelist presenze. Più semplice e backward-compatible.
  - Se non è voluto: rimuoverlo dall'enum DB e dalla creazione (rigetto 400 nel `POST /users`).

### P2 (DX / coerenza)
- Estendere `POST /api/v2/users` con la stessa whitelist ruoli di `PATCH /users/:id` (`PATCH_RUOLO_WHITELIST`).
- Documentare nella schema description che `convocazioni`/`documenti` sono **blob-only**, oppure migrarli a REST per simmetria.
- Implementare `DELETE /api/v2/superadmin/societies/:id` (già P1 nel report precedente).

### P3 (qualità del test)
- Coprire anche `ruolo='nonno'` e `ruolo='preparatore_portieri'` in un test successivo.
- Coprire il flusso GDPR `accept-parental-consent` end-to-end (oggi il claim funziona ma non testiamo l'accettazione consenso).
- Aggiungere test sull'ID-incrementing: con un genitore A creato in Società 1, provare a leggere player_id di Società 2 (cross-tenant) → atteso 404 (filtro `WHERE society_id = ?` lo dovrebbe gestire, da confermare).

## File generati
- `test-societa-ruoli-agent.mjs` — script test (idempotente, runId timestamp).
- `test-societa-ruoli-results.json` — output strutturato con 63 record.
- `test-societa-ruoli-report.md` — questo report.

## Come ri-eseguire
```bash
node test-societa-ruoli-agent.mjs
```
Lo script crea società nuova ad ogni run e fa cleanup automatico (utenti/players/leve + suspend società). Le società reali (id 2, 5, 53) sono escluse via guard `REAL_SOC_IDS`.
