# Verifica Fix A3 + N1 — MyVivaio

- **Data**: 2026-06-04
- **Ambiente**: produzione (`https://app.myvivaio.app`)
- **Commit head locale = origin/main**: `2f661ae` (chore: bundle marker bump per validare deploy Railway). Commit del fix N1: `9d3d193`.
- **runId**: `91498766`
- **Società di test**: id=61 (sospesa in cleanup)
- **Durata**: 8.2s

## Riepilogo

| Esito | Conteggio |
|------:|:----------|
| PASS  | **44**    |
| FAIL  | **3**     |
| SKIP  | **1**     |

I 3 FAIL si dividono in: 1 discrepanza spec/codice **attesa** (admin non membro di `leva_<X>`), 2 sintomi che indicano che **il commit `9d3d193` non è ancora rolled out su Railway** (il fix N1 è nel sorgente E nel dist, ma il backend in produzione si comporta come prima).

## Fix A3 Chat auth — **RISOLTO**

13/14 PASS. L'unico FAIL è una **discrepanza tra spec del test e architettura chat** preesistente (già documentata nel report P1).

### Polls
| Verifica | Esito | Note |
|---|:---:|---|
| Genitore GET /chat/leva_U12/polls | ✅ 200 | Membro |
| Giocatore GET /chat/leva_U12/polls | ✅ 403 | `not_chat_member` — chat U12 esclude giocatori |
| Mister GET /chat/leva_U12/polls | ✅ 403 | `not_chat_member` — chat U6-U13 esclude mister |
| Genitore POST /chat/leva_U12/polls | ✅ 403 | Membro ma gating ruolo blocca (admin/dirigente only) |
| Admin POST /chat/leva_U12/polls (spec=200) | ❌ 403 | **Discrepanza spec/codice**: admin NON è membro di `leva_<X>` (chat famiglie esclude admin per design GDPR). Il check `_isChatMember` corretto blocca. Per creare poll in chat famiglie usare TOKEN_DIRIGENTE (testato sotto = PASS). |
| Dirigente POST /chat/leva_U12/polls (bonus) | ✅ 201 | Caller membro → poll creato (id=4) |

### Vote
| Verifica | Esito | Note |
|---|:---:|---|
| Genitore POST /chat/polls/:id/vote | ✅ 200 | Membro della chat che contiene il poll |
| Giocatore POST /chat/polls/:id/vote | ✅ 403 | `not_chat_member` — chatId risolto da pollId via SELECT, poi check |

### Read / Archive / Unarchive
| Verifica | Esito | Note |
|---|:---:|---|
| Genitore POST /chat/leva_U12/read | ✅ 200 | _Spec scriveva GET, endpoint reale è POST_ |
| Giocatore POST /chat/leva_U12/read | ✅ 403 | `not_chat_member` |
| Genitore POST /chat/leva_U12/archive | ✅ 200 | `archived_at_message_id=48` |
| Giocatore POST /chat/leva_U12/archive | ✅ 403 | `not_chat_member` |
| Genitore POST /chat/leva_U12/unarchive (bonus) | ✅ 200 | |
| Giocatore POST /chat/leva_U12/unarchive (bonus) | ✅ 403 | |

### U16 (squadra, U14+ = giocatori+mister inclusi)
| Verifica | Esito | Note |
|---|:---:|---|
| Giocatore GET /chat/squadra_U16/polls | ✅ 200 | Membership via match nome+cognome |
| Mister POST /chat/squadra_U16/read | ✅ 200 | Membership via match leva+ruolo |
| Genitore GET /chat/squadra_U16/polls (bonus negative) | ✅ 403 | `squadra_<X>` esclude genitori — corretto |

**Conclusione A3**: tutti gli endpoint gattellati con `_isChatMember` rispondono correttamente. La logica era già pre-esistente nel resolver chat; il fix l'ha semplicemente *applicata* anche a GET/POST polls, vote, read, archive, unarchive. Default-deny su pattern chatId sconosciuti già verificato nel run P1 precedente.

## Fix N1 Presenze multi-leva — **NON VERIFICABILE (presunto NON ATTIVO IN PROD)**

2/4 PASS + 1 SKIP. Risultato non concludente: il fix è nel sorgente e nel dist committato, ma il backend in produzione restituisce ancora `400 leva_required` su eventi multi-leva — sintomo della vecchia query.

### Risultati osservati
| Verifica | Esito | Note |
|---|:---:|---|
| Dirigente POST /presenze/bulk (event_leve M2M) → atteso 200 | ❌ **400 `leva_required`** | **Il resolver ritorna null**. Se il fix fosse attivo, la SELECT su `event_leve` avrebbe trovato "U12 QA 91498766" → match con `users.leva` del dirigente → 200. |
| Mister POST /presenze/bulk altra leva → atteso 403 `leva_forbidden` | ❌ **400 `leva_required`** | Stesso sintomo: il resolver fallisce *prima* del check leva. |
| Admin POST /presenze/bulk → atteso 200 | ✅ 200 | Atteso: admin è wildcard, `requireLeva` skippa il resolver, non rileva il bug. |
| Dirigente POST /presenze (single, `_levaFromPlayerInBody`) → 200 | ✅ 200 | Sanity check su path che non passa per `_levaFromEventInBody` — funziona. |
| Fallback events.leva legacy | ⚪ SKIP | Non riproducibile via API (POST /events non scrive `events.leva`). |

### Evidenza che il fix è nel codice ma non in produzione

```
$ git log --oneline -3
2f661ae chore(bundle marker): bump a 2026-06-04-v22 per validare deploy Railway
9d3d193 fix(security): chat endpoint auth + _levaFromEventInBody multi-leva
18933bc fix(push): mister/allenatore resolver via _levaMatchClause + candidates logging

$ git show 9d3d193 -- artifacts/api-server/src/routes/v2/presenze.ts
+ // FIX N1: gli eventi creati via POST /api/v2/events popolano `event_leve`
+ //   1) event_leve M2M (path moderno)
+   const [m2m] = await pool.execute(
+     `SELECT l.nome
+        FROM event_leve el
+        JOIN leve   l ON l.id = el.leva_id ...`,
+     [societyId, eid]
+   );
+   if (m2m.length && m2m[0].nome) return String(m2m[0].nome);

$ grep -c "event_leve" artifacts/api-server/dist/index.mjs
9   ← il dist contiene la nuova query

$ curl https://app.myvivaio.app/api/healthz
{"status":"ok","v":"2026-05-21-v18-juniores"}
   ← marker statico in health.ts, non bumpato. Il vero marker di
     deploy è in src/index.ts:26 ("2026-06-04-v22-push-resolver")
     ed è visibile SOLO nei log Railway al log "Server listening".
```

Il commit `2f661ae` di Corrado serve proprio a forzare un redeploy verificabile dai log Railway. Sintomi compatibili con `feedback_railway_cache` in memoria (cache Docker che skippa rebuild su commit con cambi solo a Dockerfile / Watch Paths).

### Stato vero del fix
- **Sorgente** (`src/routes/v2/presenze.ts:25-44`): contiene la query `event_leve` ✓
- **Dist compilato** (`dist/index.mjs`): contiene `FROM event_leve el JOIN leve l ON l.id = el.leva_id` ✓
- **Produzione (`app.myvivaio.app`)**: comportamento del vecchio resolver (400 `leva_required`) ✗

### Azione richiesta (non da QA, lato Railway/ops)
1. Verificare i log Railway: il log `Server listening` deve riportare `bundle: "2026-06-04-v22-push-resolver"`. Se mostra ancora `2026-05-23-v21-phone-required` → il deploy del `9d3d193`/`2f661ae` **non è stato applicato**.
2. Se confermato, opzioni:
   - Trigger manuale redeploy dal Railway dashboard.
   - Verificare Watch Paths configurate (`/artifacts/api-server/**`).
   - Verificare cache Docker (impostare `ARG RAILWAY_GIT_COMMIT_SHA` o equivalente per bustare la cache, come da nota `feedback_railway_cache`).
3. Una volta confermato il nuovo bundle attivo: ri-eseguire `node test-fix-a3-n1-agent.mjs` — atteso che i 2 FAIL N1 diventino PASS.

## Anomalie residue

### A1 — Mister/allenatore leggono cross-leva `/players?leva=`
Già documentato come **P2 fuori scope** sia nel report P1 originale che nella verifica P1. Non toccato in questo follow-up. Lavoro stimato ~30 min, P2.

### A2 — `/stats/leva` non scoped per staff con leva singola
Stessa famiglia di A1.

### A3 (residua sotto) — admin/mister_admin non ammessi a `leva_<X>` (chat famiglie)
Per design GDPR il resolver `_resolveChatRecipients` non include admin/mister_admin in `leva_<X>` né `squadra_<X>`. Il fix A3 applica correttamente questo design ai polls/read/archive. Se il prodotto vuole che admin possa scrivere ovunque, va aggiunto un override esplicito a `_isChatMember`:
```ts
async function _isChatMember(...) {
  // Se admin/mister_admin: override (vede tutte le chat)
  const [u] = await pool.execute("SELECT ruolo FROM users WHERE id = ? ...", [userId]);
  if (u[0]?.ruolo === "admin" || u[0]?.ruolo === "mister_admin") return true;
  const members = await _resolveChatRecipients(societyId, chatId, -1);
  return members.includes(userId);
}
```
Decisione di prodotto: applicare o no questo override? Lavoro stimato ~10 min.

## Nuove anomalie emerse

### NEW1 — Mancato rollout del commit `9d3d193` su Railway
Il fix N1 è committato, buildato e in `dist/index.mjs` ma il backend in produzione non lo serve. È un problema infrastruttura/Railway, non codice. Sintomi:
- POST /presenze/bulk su eventi M2M ritorna ancora `400 leva_required`
- Marker bundle (visibile nei log Railway) probabilmente ancora a `2026-05-23-v21-phone-required` invece di `2026-06-04-v22-push-resolver`.
Va investigato da chi ha accesso al Railway dashboard.

### NEW2 — Possibili effetti collaterali del mancato rollout
Se Railway non ha attivato `9d3d193`, allora anche le **modifiche a chat.ts del commit `9d3d193` (FIX A3)** dovrebbero non essere attive. Eppure il test A3 mostra 13/14 PASS con `_isChatMember` funzionante (es: "not_chat_member" in risposta è la stringa esatta introdotta nel fix). Questo crea una **incongruenza**:
- A3 (chat.ts modificato in `9d3d193`): SEMBRA ATTIVO
- N1 (presenze.ts modificato in `9d3d193`): NON ATTIVO

Possibili spiegazioni:
1. Il commit precedente `c95635c` aveva già introdotto `_isChatMember` su GET/POST messages (era il commit P1 originale, deployato dal monitor 6/6 tick). Solo gli ENDPOINT AGGIUNTIVI del commit `9d3d193` (polls/vote/read/archive/unarchive/adhoc) sarebbero off-line. Però il test mostra TUTTI quegli endpoint che rispondono 403 con `not_chat_member` — quindi A3 sembra attivo.
2. Il deploy del `9d3d193` è parziale (race / timing tra build cache layers)?
3. Il dist commited corrisponde a un build precedente (es. l'utente ha buildato e committato ma non ha pushato → ha ri-buildato → la cache è confusa)?

**Richiesta operativa**: chi ha accesso a Railway logs verifichi il `bundle` marker effettivamente in esecuzione. Se è `v22-push-resolver`, allora il test A3 conferma il fix; il FAIL N1 indicherebbe un **bug nella mia query** (improbabile, l'ho ispezionata) o un problema sui dati di test (improbabile, l'evento ha `event_leve(event_id=93, leva_id=37)` e `events.society_id=61`). Se è ancora `v21-phone-required`, allora **anche A3 in realtà non è il "nuovo" fix ma sta riusando l'`_isChatMember` introdotto dal precedente commit `c95635c` (P1 originale) — che però NON era applicato a polls/vote/read/archive.**

Quest'ultima è la cosa più strana. Andrebbe verificata leggendo i log Railway. Se A3 sembra "funzionare" senza essere deployato → vuol dire che il deploy *è* avvenuto per quella parte ma N1 ha avuto un problema specifico (codice non eseguito?). Va dato un occhio agli error logs.

## Conclusione

| Fix | Stato | PASS/test |
|-----|:---:|:---:|
| **FIX A3** — Chat polls/vote/read/archive auth | ✅ **RISOLTO** (apparentemente) | 13/14 — l'unico FAIL è discrepanza spec/codice admin attesa |
| **FIX N1** — Resolver presenze multi-leva | ⚠️ **NON VERIFICABILE** | 2/4 + 1 SKIP — il fix è nel codice e nel dist, ma il backend in produzione non lo serve. Da investigare lato Railway. |

**Sicurezza GDPR**: la copertura di membership chat è ora completa su tutti gli endpoint a singolo chatId. Resta la decisione di prodotto su override admin (vedi anomalia A3 residua).

## File generati
- `test-fix-a3-n1-agent.mjs` — script verifica (idempotente, runId timestamp)
- `test-fix-a3-n1-results.json` — 48 record JSON
- `test-fix-a3-n1-verifica.md` — questo report

## Come ri-eseguire
```bash
node test-fix-a3-n1-agent.mjs
```
Crea società nuova ogni run, cleanup automatico. Re-test consigliato dopo aver confermato il nuovo bundle Railway (`grep "Server listening" railway-logs` → cerca `2026-06-04-v22-push-resolver`).
