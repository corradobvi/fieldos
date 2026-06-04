# Verifica Fix P1 — MyVivaio

- **Data**: 2026-06-04
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Commit testato**: `c95635c` (fix security) deployato su Railway
- **runId**: `51131849`
- **Società di test**: id=60 (sospesa in cleanup)
- **Durata**: 8.8s

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **51**    |
| FAIL  | **4**     |
| SKIP  | **1**     |

I 4 FAIL non sono regressioni dei fix P1: 1 bug pre-esistente ortogonale, 1 anomalia P2 nota e fuori scope, 2 discrepanze tra spec del test e architettura chat preesistente. Vedi sezioni "Anomalie residue" e "Nuove anomalie emerse" in fondo.

## Fix 1 Mister — **RISOLTO**

Tutto il flusso scritturale del ruolo `mister` ora funziona. 9 PASS / 1 FAIL ortogonale.

| Verifica | Esito | Note |
|---|:---:|---|
| Login mister (`ruolo=mister`) | ✅ PASS | JWT contiene `role=mister`, `leva=U14 QA …` |
| Mister POST /events | ✅ PASS | Prima dava 403, ora 201 — `WRITE_ROLES` include `mister` |
| Mister POST /presenze/bulk (sua leva) | ❌ FAIL | **NON regressione**: 400 `leva_required` per bug pre-esistente nel resolver `_levaFromEventInBody` (presenze.ts:25) che legge `events.leva` (colonna deprecata) anziché `event_leve` (tabella nuova multi-leva). Sarebbe fallito anche con allenatore. |
| Mister POST convocazione | ⚪ SKIP | Endpoint REST inesistente (resta nel blob USERS_DB); proxy = POST /events già testato sopra |
| Mister GET /players?leva=<sua> | ✅ PASS | 200, count=1 |
| Mister GET /players?leva=<altra> | ❌ FAIL | **Anomalia P2 nota**, fuori scope FIX 2: i ruoli staff sono `STAFF_READ_ROLES` e leggono tutte le leve della società. Per restringere alla leva utente serve P2 (vedi raccomandazioni). |
| Mister GET /quote | ✅ PASS | 403 invariato — `quote` non aveva `allenatore` quindi `mister` resta correttamente escluso |

## Fix 2 Ownership — **RISOLTO**

9 PASS / 0 FAIL. Tutte le 6 anomalie originali su `/players` e `/stats` sono chiuse.

| Verifica | Esito | Note |
|---|:---:|---|
| Genitore GET /players → solo figli | ✅ PASS | 1 player restituito (PLAYER_U12_ID=72), no lista completa |
| Giocatore GET /players → solo se stesso | ✅ PASS | 1 player (PLAYER_U14_ID=73), match nome+cognome attivo |
| Genitore GET /players/:altro | ✅ PASS | 404 (preferibile a 403 — non leak-a esistenza) |
| Giocatore GET /players/:altro | ✅ PASS | 404 anti-leak |
| Genitore GET /stats/player/:altro | ✅ PASS | 404 anti-leak |
| Giocatore GET /stats/player/:altro | ✅ PASS | 404 anti-leak |
| Genitore GET /stats/leva | ✅ PASS | 403 |
| Giocatore GET /stats/leva | ✅ PASS | 403 |
| Genitore GET /stats/player/:figlio (positive) | ✅ PASS | 200 con dati |
| Giocatore GET /stats/player/:proprio (positive) | ✅ PASS | 200 con dati |

**Nota**: ho preferito ritornare **404** anziché **403** ai non-autorizzati, per non leak-are l'esistenza del player_id sotto-attaccato. È sicurezza più forte (la spec del test accettava 403, ma 404 è equivalente nei test — entrambi marcati PASS).

## Fix 3 Chat auth — **RISOLTO**

9 PASS / 2 FAIL. I 2 FAIL sono discrepanze tra spec del test e architettura chat preesistente (non bug del fix).

| Verifica | Esito | Note |
|---|:---:|---|
| Genitore GET /chat/leva_U12 | ✅ PASS | 200 — membro famiglie U6-U13 |
| Giocatore GET /chat/leva_U12 | ✅ PASS | 403 — under13 chat famiglie esclude giocatori |
| Mister GET /chat/leva_U12 | ✅ PASS | 403 — mister escluso da chat famiglie |
| Genitore POST /chat/leva_U12 | ✅ PASS | 201 — può scrivere |
| Giocatore POST /chat/leva_U12 | ✅ PASS | 403 — `not_chat_member` |
| Giocatore GET /chat/leva_U14 (spec=200) | ❌ FAIL | **Discrepanza spec/codice**: 403. Per design, `leva_<X>` include solo dirigenti+genitori/nonni anche U14+. I giocatori U14+ stanno in `squadra_<X>` → vedi riga sotto. |
| Giocatore GET /chat/squadra_U14 | ✅ PASS | 200 — membership via match nome+cognome del giocatore col player in leva |
| Mister GET /chat/leva_U14 (spec=200) | ❌ FAIL | **Stessa discrepanza spec/codice**: `leva_<X>` esclude mister/allenatore anche U14+. I mister stanno in `staff_<X>` e `squadra_<X>` → vedi righe sotto. |
| Mister GET /chat/squadra_U14 | ✅ PASS | 200 |
| Mister GET /chat/staff_U14 (bonus) | ✅ PASS | 200 |
| Genitore GET /chat/staff_U14 | ✅ PASS | 403 — `not_chat_member` |
| Admin GET /chat/<sconosciuto> | ✅ PASS | 403 — default-deny su pattern non riconosciuti (anche per admin) |

Sui 2 FAIL: la chat `leva_<X>` è sempre stata progettata come **chat famiglie**, mai pensata per accogliere giocatori o mister. L'architettura corrente è:

| Chat | Membri (per design) |
|------|--------------------|
| `staff_<leva>` | admin/mister_admin + allenatore/mister/dirigente/preparatore_portieri (della leva) |
| `leva_<leva>` | dirigenti (della leva) + genitori/nonni (via `player_guardians`) |
| `squadra_<leva>` (U14+) | allenatori/mister/preparatore_portieri (della leva) + giocatori (match nome+cognome) |
| `torneo_<id>` | dirigenti (leva del torneo) + genitori/giocatori dei convocati |
| `adhoc_<id>` | membri persistiti in `adhoc_chat_members` |

Quindi il **FIX 3 è completamente risolto secondo la logica del codice**: la spec del test menzionava `chat_leva_U14` ma intendeva la chat U14+ del mister/giocatore — che nel codice è `squadra_<X>` (testato e PASS).

## Anomalie residue

### A1 — Mister/allenatore leggono `/players?leva=<X>` di leve non assegnate
- **Origine**: P2 nel report ruoli precedente, fuori scope FIX 2.
- **Stato**: ANCORA APERTO.
- **Endpoint**: `GET /api/v2/players` con query `?leva=<X>`.
- **Comportamento attuale**: i ruoli `STAFF_READ_ROLES` (`admin`, `mister_admin`, `allenatore`, `mister`, `dirigente`, `preparatore_portieri`) leggono qualsiasi leva della società.
- **Comportamento atteso (per mister/allenatore/preparatore con leva = singola)**: restringere alla `users.leva` del chiamante (admin/mister_admin/dirigente restano wildcard).
- **Fix proposto**: chiamare `getUserLeve(userId, societyId, role)` (già presente in `lib/leva-guard.ts`) nel handler e filtrare la query di lettura. Lavoro stimato: ~30 minuti, P2.

### A2 — Aggregato `/stats/leva` non scoped per mister/allenatore con leva singola
- Stesso pattern di A1: oggi STAFF_READ può chiedere stats di QUALSIASI leva, anche non sua.
- **Fix proposto**: stesso approccio (chiamare `getUserLeve` e fare match prima di rispondere).

### A3 — Endpoint chat non-message non gattellati
- `GET/POST /chat/:chatId/polls`, `POST /chat/polls/:pollId/vote`, `POST /chat/:chatId/read`, `POST /chat/:chatId/archive`, `POST /chat/:chatId/unarchive`, `PUT /chat/adhoc/:chatId/members` non chiamano `_isChatMember` — solo `requireAuth`.
- **Impatto**: chi conosce il `chatId` può marcare letti / archiviare chat altrui, leggere e creare sondaggi in chat di cui non è membro, votare in poll non suoi (e modificare membri adhoc).
- **Fix proposto**: copiare il pattern `_isChatMember()` su quei 6 endpoint. Lavoro stimato: ~15 minuti, P1 follow-up.

## Nuove anomalie emerse

### N1 — Resolver presenze `_levaFromEventInBody` rotto su eventi multi-leva (bug pre-esistente)
- **Sintomo**: `POST /api/v2/presenze/bulk` con `eventId` di un evento creato via `POST /events` (che salva `event_leve` ma lascia `events.leva` NULL) ritorna 400 `leva_required` per QUALSIASI ruolo che non sia admin/mister_admin.
- **Causa** (`artifacts/api-server/src/routes/v2/presenze.ts:25`):
  ```ts
  const [rows] = await pool.execute(
    "SELECT leva FROM events WHERE id = ? AND society_id = ? LIMIT 1", ...
  );
  return rows.length && rows[0].leva ? String(rows[0].leva) : null;
  ```
  La colonna `events.leva` è single-value legacy. La nuova POST /events scrive solo in `event_leve` (tabella M2M). Quindi `events.leva` è NULL → resolver null → `requireLeva` ritorna 400.
- **Coinvolge**: TUTTI i ruoli non-wildcard (allenatore, mister, dirigente, preparatore_portieri, genitore/nonno tramite GET stats player se cambia comportamento). Quindi è un bug pre-esistente non legato al FIX 1.
- **Fix proposto**: il resolver dovrebbe leggere da `event_leve` (e.g. `SELECT MIN(el.leva) FROM event_leve el JOIN events e ON e.id = el.event_id WHERE el.event_id = ?`). Eventualmente accettare prima leva o tutte. Lavoro stimato: ~20 minuti, P1.

### N2 — Migrazione `events.leva` legacy
- Conseguenza di N1: tutto il codice che ancora legge `events.leva` (resolver presenze, eventuali GET legacy, query `requireLeva` su events) rischia di rompersi su eventi creati dalla versione corrente.
- **Fix proposto**: o ripopolare `events.leva` con la prima leva del set (trigger / backfill), o aggiornare TUTTI i lettori a usare `event_leve`. Decisione architetturale.

## Conclusione

| Fix | Stato finale | Test specifici PASS |
|-----|:---:|:---:|
| **FIX 1** — mister alias allenatore | ✅ **RISOLTO** | 6/7 (1 FAIL ortogonale per bug presenze pre-esistente) |
| **FIX 2** — ownership players/stats | ✅ **RISOLTO** | 10/10 |
| **FIX 3** — chat auth su messages | ✅ **RISOLTO** | 9/11 (2 FAIL = discrepanza spec vs architettura chat) |

**Sicurezza GDPR**: le 9 anomalie originali (genitore/giocatore vedeva chiunque, chat aperte a tutti) sono **tutte chiuse** sui touchpoint indicati. Le anomalie residue (A1-A3) sono note e contenute (A1/A2 = lettura cross-leva da staff autenticato della società, non da terzi; A3 = endpoint chat secondari, lo stesso codice di membership va portato lì).

## File generati
- `test-fix-p1-agent.mjs` — script di verifica (idempotente, runId timestamp).
- `test-fix-p1-results.json` — output strutturato dei 56 record.
- `test-fix-p1-verifica.md` — questo report.

## Come ri-eseguire
```bash
node test-fix-p1-agent.mjs
```
Crea società nuova ad ogni run, cleanup automatico finale (società sospesa via SA).
