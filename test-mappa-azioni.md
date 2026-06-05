# Mappa Azioni MyVivaio

Mappatura sezioni FE + azioni per ruolo. Base per regression test bottone-per-bottone.

**Convenzioni:**
- `LOCAL` = azione salva nel blob `USERS_DB`/`__fieldosSaveState()` (no API).
- `[label]` = testo del bottone/voce nav nell'UI in italiano.
- Gating server: `requireRole(...)` whitelist, in più `requirePermission()` o `requireLeva()` quando applicabile.
- `mister` è alias di `allenatore` lato backend (release v24-stable). Stessi permessi.
- `mister_admin` = admin "con cappello da mister" (admin + staff leva-scoped).

**Riferimenti chiave:**
- ROLE_CFG nav per ruolo: `artifacts/fieldos/index.html:4844`
- `buildSidebar(role)`: `artifacts/fieldos/index.html:5899`
- `goTo(pgId)` navigation handler: `artifacts/fieldos/index.html:6144`
- `isAdminLike()` / `hasPerm(key)`: `artifacts/fieldos/index.html:4987` / `5014`
- WRITE_ROLES backend: `["admin","allenatore","mister","dirigente","mister_admin"]` (events.ts:8, matches.ts:11)
- ADMIN_ROLES backend (players): `["admin","allenatore","mister","dirigente"]` (players.ts:9)

---

## ADMIN

### Sezione: Panoramica (`pg-panoramica`)
- [ ] Visualizza KPI società → LOCAL render da `players`, `events`, `quote`, blob
- [ ] Vai a sezione (click card) → LOCAL `goTo(<id>)`

### Sezione: Dashboard (`pg-dashboard`)
- [ ] Eventi imminenti → GET `/api/v2/events?da=<today>&a=<+90gg>`
- [ ] Quote in scadenza → GET `/api/v2/quote?stato=in_attesa`
- [ ] Comunicazioni non lette → GET `/api/v2/comunicazioni`

### Sezione: Comunicazioni (`pg-comunicazioni`)
- [ ] Lista bacheche → GET `/api/v2/comunicazioni`
- [ ] Pubblica avviso `[Nuovo avviso]` → POST `/api/v2/comunicazioni` *(requireRole + requirePermission `gestione_comunicazioni_bacheca` + leva-scope)*
- [ ] Segna come letto → POST `/api/v2/comunicazioni/:id/read`
- [ ] Elimina avviso → DELETE `/api/v2/comunicazioni/:id` *(requireRole "admin")*
- [ ] Commenta avviso → LOCAL `addCommento(commId)` (index.html:11668)

### Sezione: Chat (`pg-chat`)
- [ ] Lista chat → derivata client-side da resolver chat (staff/leva/squadra/torneo/adhoc)
- [ ] Carica messaggi → GET `/api/v2/chat/:chatId/messages` *(richiede _isChatMember)*
- [ ] Invia messaggio → POST `/api/v2/chat/:chatId/messages` *(richiede _isChatMember)*
- [ ] Lista sondaggi → GET `/api/v2/chat/:chatId/polls` *(_isChatMember)*
- [ ] Crea sondaggio `[Nuovo sondaggio]` → POST `/api/v2/chat/:chatId/polls` *(_isChatMember + requireRole admin/dirigente/mister_admin server-side)*
- [ ] Vota sondaggio → POST `/api/v2/chat/polls/:pollId/vote` *(_isChatMember)*
- [ ] Marca chat letta → POST `/api/v2/chat/:chatId/read` *(_isChatMember)*
- [ ] Lista unread (badge) → POST `/api/v2/chat/unread` body `{chatIds}`
- [ ] Archivia chat → POST `/api/v2/chat/:chatId/archive` *(_isChatMember)*
- [ ] Disarchivia → POST `/api/v2/chat/:chatId/unarchive` *(_isChatMember)*
- [ ] Crea/aggiorna membri chat adhoc → PUT `/api/v2/chat/adhoc/:chatId/members` *(anti-hijack: deve essere già membro se la chat esiste)*
- [ ] Self-test push → GET `/api/v2/chat/push-test`

### Sezione: Rosa (`pg-rosa`)
- [ ] Lista giocatori → GET `/api/v2/players` *(staff full)*, opzionale `?leva=<X>`
- [ ] Dettaglio giocatore → GET `/api/v2/players/:id`
- [ ] Aggiungi giocatore `[+ Giocatore]` → POST `/api/v2/players` *(requireRole ADMIN_ROLES)*
- [ ] Crea giocatore minore (GDPR-light) → POST `/api/v2/players/minor` *(requireRole STAFF_ROLES)*
- [ ] Modifica giocatore → PUT `/api/v2/players/:id` *(requireRole ADMIN_ROLES)*
- [ ] Elimina giocatore → DELETE `/api/v2/players/:id` *(requireRole "admin")*
- [ ] Lista guardian di un player → GET `/api/v2/players/:id/guardians` *(STAFF_ROLES)*
- [ ] Rimuovi guardian → DELETE `/api/v2/players/:playerId/guardians/:guardianId` *(STAFF_ROLES)*
- [ ] Player incompleti (GDPR) → GET `/api/v2/players/incomplete`
- [ ] Cambia foto profilo → `openPlayerPhotoUpload(playerId)` (index.html:8075) [endpoint upload custom, non v2 standard]
- [ ] Elimina giocatore corrente → LOCAL `deleteCurrentPlayer()` (index.html:8356) + DELETE API

### Sezione: Convocazioni (`pg-convocazioni`)
- [ ] Lista convocazioni → LOCAL `convocazioni[]` (blob, no endpoint REST)
- [ ] Crea convocazione → LOCAL `saveConvocazione()` (index.html:10478) + `__fieldosSaveState()`
- [ ] Modifica convocazione → LOCAL stessa funzione
- [ ] Elimina convocazione → LOCAL `deleteConvocazione()` (index.html:10533)
- [ ] Notifica convocazione → triggered da `notifyConvocazione()` interno

### Sezione: Presenze (`pg-presenze`)
- [ ] Vista griglia presenze per evento → GET `/api/v2/presenze?eventId=<id>`
- [ ] Toggle stato presenza (presente/assente/giustificato/in ritardo) → click cella `.pd` → POST `/api/v2/presenze` *(requireRole + requirePermission `gestione_presenze` + requireLeva via playerId)*
- [ ] Bulk save presenze per evento → POST `/api/v2/presenze/bulk` *(requireRole + requireLeva via eventId — FIX N1)*
- [ ] Notifica coach in caso di assenza → POST `/api/v2/presenze/notify-coaches`
- [ ] Export CSV presenze → LOCAL `exportPresenzeCSV()` (index.html:8544)

### Sezione: Statistiche (`pg-statistiche`)
- [ ] Stats per leva (aggregato giocatori) → GET `/api/v2/stats/leva?leva=<X>` *(staff-only post FIX 2)*
- [ ] Stats singolo giocatore → GET `/api/v2/stats/player/:id` *(staff full, altrimenti ownership check)*

### Sezione: Allenamenti (`pg-allenamenti`)
- [ ] Lista allenamenti programmati → GET `/api/v2/allenamenti`
- [ ] Dettaglio allenamento → GET `/api/v2/allenamenti/:id`
- [ ] Crea allenamento → POST `/api/v2/allenamenti` *(requirePermission `modifica_piano_allenamento` + requireLeva)*
- [ ] Modifica allenamento → PATCH `/api/v2/allenamenti/:id`
- [ ] Elimina allenamento → DELETE `/api/v2/allenamenti/:id`
- [ ] Riordina sessioni → POST `/api/v2/allenamenti/:id/sessioni/riordina`
- [ ] Aggiungi sessione → POST `/api/v2/allenamenti/:id/sessioni`
- [ ] Modifica sessione → PATCH `/api/v2/allenamenti/:id/sessioni/:sessioneId`
- [ ] Rimuovi sessione → DELETE `/api/v2/allenamenti/:id/sessioni/:sessioneId`
- [ ] Carica nota vocale → POST `/api/v2/allenamenti/:id/note-vocali`
- [ ] Scarica audio nota → GET `/api/v2/allenamenti/note-vocali/:id/audio`
- [ ] Elimina nota vocale → DELETE `/api/v2/allenamenti/note-vocali/:id`
- [ ] Libreria sessioni (catalogo) → GET `/api/v2/allenamenti/sessioni-libreria`
- [ ] Aggiungi a libreria → POST `/api/v2/allenamenti/sessioni-libreria`
- [ ] Modifica sessione libreria → PATCH `/api/v2/allenamenti/sessioni-libreria/:id`
- [ ] Elimina sessione libreria → DELETE `/api/v2/allenamenti/sessioni-libreria/:id`
- [ ] AI: budget rimanente → GET `/api/v2/ai/budget`
- [ ] AI: allowlist mister → GET `/api/v2/ai/allowlist`
- [ ] AI: abilita mister allowlist → POST `/api/v2/ai/allowlist`
- [ ] AI: genera spunto rapido → POST `/api/v2/ai/spunto-rapido`
- [ ] AI: genera sessione singola → POST `/api/v2/ai/sessione-singola`
- [ ] AI: genera allenamento completo → POST `/api/v2/ai/allenamento-completo`

### Sezione: Partite & Tornei (`pg-partite`)
- [ ] Lista partite → GET `/api/v2/matches`
- [ ] Lista tornei → GET `/api/v2/tornei`
- [ ] Settings campionato (giornate) → GET `/api/v2/campionato/settings?leva=<X>`
- [ ] Crea/aggiorna settings campionato → POST `/api/v2/campionato/settings` *(WRITE_ROLES + leva)*
- [ ] Elimina campionato → DELETE `/api/v2/campionato?leva=<X>` *(WRITE_ROLES + leva)*
- [ ] Aggiungi/modifica partita → POST `/api/v2/matches` *(WRITE_ROLES + leva)*
- [ ] Registra distinta + gol/assist → POST `/api/v2/matches/:matchId/stats`
- [ ] Elimina partita → DELETE `/api/v2/matches/:matchId`
- [ ] Elimina by event_key (legacy) → DELETE `/api/v2/matches/by-event-key/:eventKey`
- [ ] Crea/aggiorna torneo → POST `/api/v2/tornei` (con fasi)
- [ ] Elimina torneo → DELETE `/api/v2/tornei/:id`
- [ ] Notifica risultato (push) → POST `/api/v2/notifiche/risultato-partita`
- [ ] AI: genera bracket torneo → POST `/api/v2/ai/tornei/...`

### Sezione: Calendario (`pg-calendario`)
- [ ] Lista eventi range → GET `/api/v2/events?da=&a=&tipi=&leva_id=`
- [ ] Dettaglio evento → GET `/api/v2/events/:id`
- [ ] Crea evento (allenamento/partita/altro) → POST `/api/v2/events` *(WRITE_ROLES, supporta `ricorrente:true`+`finoAl`+`freq` per ricorrenze)*
- [ ] Modifica singolo evento → PUT `/api/v2/events/:id`
- [ ] Modifica serie da questo in poi → PUT `/api/v2/events/:id/series/from-here`
- [ ] Modifica intera serie → PUT `/api/v2/events/:id/series`
- [ ] Elimina singolo evento → DELETE `/api/v2/events/:id`
- [ ] Elimina serie da questo in poi → DELETE `/api/v2/events/:id/series/from-here`
- [ ] Elimina intera serie → DELETE `/api/v2/events/:id/series`

### Sezione: Foto & Video (`pg-fotovideo`)
- [ ] WIP — placeholder UI

### Sezione: Documenti (`pg-documenti`)
- [ ] Lista documenti → LOCAL blob (no endpoint v2 dedicato)
- [ ] Carica documento → LOCAL `saveDocumento()` (index.html:19960) [upload custom blob storage]
- [ ] Elimina documento → LOCAL `deleteDocumento(docId)` (index.html:19990)

### Sezione: Quote (`pg-pagamenti`, paywall piano società)
- [ ] Lista quote → GET `/api/v2/quote` *(requireRole admin|dirigente + requirePlan societa)*
- [ ] Crea quota → POST `/api/v2/quote`
- [ ] Modifica quota → PUT `/api/v2/quote/:id`
- [ ] Elimina quota → DELETE `/api/v2/quote/:id`
- [ ] Stripe checkout per piano → POST `/api/v2/stripe/create-checkout`
- [ ] Stato subscription società → GET `/api/v2/stripe/subscription?societyId=`
- [ ] Portal Stripe → POST `/api/v2/stripe/customer-portal`
- [ ] Cancella subscription → POST `/api/v2/stripe/cancel`
- [ ] Lista fatture → GET `/api/v2/stripe/invoices`

### Sezione: Impostazioni (`pg-impostazioni`)
- [ ] GET dati società → GET `/api/v2/society`
- [ ] Modifica società (nome, colori, logo, codice) → PUT `/api/v2/society` *(requireRole "admin" + is_account_owner)*
- [ ] Lista leve → GET `/api/v2/leve`
- [ ] Aggiungi leva → POST `/api/v2/leve` *(requireRole "admin")*
- [ ] Modifica leva → PUT `/api/v2/leve/:id`
- [ ] Elimina leva → DELETE `/api/v2/leve/:id`
- [ ] Lista utenti società → GET `/api/v2/users` *(requireRole "admin")*
- [ ] Aggiungi utente → POST `/api/v2/users`
- [ ] Modifica utente → PUT `/api/v2/users/:id`
- [ ] Patch ruolo/leva/stato → PATCH `/api/v2/users/:id` *(gating LIVE: caller deve essere admin/mister_admin in MySQL)*
- [ ] Elimina utente → DELETE `/api/v2/users/:id`
- [ ] Lista utenti in attesa approvazione → GET `/api/v2/users/pending`
- [ ] Approva utente → POST `/api/v2/users/:id/approve`
- [ ] Lista ruoli (per FE riallineamento blob) → GET `/api/v2/users/roles`
- [ ] Seleziona piano per società → POST `/api/v2/societies/select-plan`
- [ ] Preferenze notifiche → GET/PUT `/api/v2/users/me/notification-preferences`

### Sezione: Gestione Campionato (`pg-gestcomp`, admin-only)
- [ ] Editor gironi/fasi → vedi endpoint sezione Partite & Tornei
- [ ] Redirect a `pg-partite` se ruolo non autorizzato

---

## MISTER (≡ allenatore)

Stessa whitelist di **allenatore** in tutti i guard server. Vede e fa quasi tutto ciò che vede ADMIN, **escluso**:
- Sezione **Impostazioni** non in nav (gestione utenti/leve/società = solo admin/mister_admin)
- Sezione **Quote** in nav ma 403 server-side (`requireRole admin|dirigente`)
- `POST /chat/:chatId/polls`: gating server admin/dirigente/mister_admin → 403 (può LEGGERE polls, non crearli)
- `DELETE /comunicazioni/:id` → 403 (solo admin)
- `DELETE /players/:id` → 403 (solo admin)
- `DELETE /leve/:id` → 403 (solo admin)
- `POST/PUT /society` → 403 (solo admin)
- Gestione utenti `POST/PUT/DELETE /users` → 403

Sezioni visibili: Panoramica, Dashboard, Comunicazioni, Chat, Rosa, Convocazioni, Presenze, Statistiche, Allenamenti, Partite & Tornei, Calendario, Foto & Video (WIP), Documenti. Tutte le **azioni di scrittura sui dati di campo** sono permesse (events, players, presenze, matches, tornei, allenamenti, comunicazioni — purché su sua leva via `requireLeva`).

Membership chat:
- `staff_<sua leva>` → membro
- `squadra_<sua leva>` (U14+) → membro
- `leva_<X>` (chat famiglie U6-U13) → **NON membro** (esclusione per design GDPR)
- `torneo_<id>` se torneo è della sua leva → membro indiretto via dirigenti+convocati

---

## ALLENATORE

Identico a MISTER in tutti i guard (è il nome "ufficiale" del ruolo, mister è alias). Nessuna differenza funzionale.

---

## DIRIGENTE

### Sezione: Panoramica, Dashboard, Comunicazioni, Chat, Rosa, Convocazioni, Presenze, Partite & Tornei, Calendario, Foto & Video, Documenti
Azioni invariate rispetto a ADMIN su:
- `POST /events`, `POST /matches`, `POST /tornei`, `POST /presenze/bulk` (è in WRITE_ROLES + leva scope sua)
- `POST /comunicazioni` (è in whitelist)
- `POST /chat/:chatId/polls`: **autorizzato** (`requireRole admin|dirigente|mister_admin`)
- `POST/PUT/DELETE /players` (è in ADMIN_ROLES)

### Sezione: Quote (`pg-pagamenti`, piano società)
**DIFFERENZA chiave**: il dirigente è **autorizzato** a `/quote` (`requireRole admin|dirigente`). A differenza di mister/allenatore, può gestire quote.
- [ ] Lista quote → GET `/api/v2/quote` → **200** (a differenza di mister)
- [ ] Crea/modifica/elimina quote → POST/PUT/DELETE `/api/v2/quote/:id`

### Sezioni NON visibili
- **Statistiche** (no rendering in nav per dirigente, ROLE_CFG riga 4844)
- **Allenamenti** (no nav)
- **Impostazioni** (no nav)
- Su `POST /chat/:chatId/polls/:pollId/vote`: votare OK se membro (membro di `leva_<X>` se assegnato a quella leva)
- `DELETE /comunicazioni/:id` → 403 (solo admin)
- `DELETE /players/:id` → 403 (solo admin)

Membership chat (resolver):
- `staff_<sua leva>` → membro
- `leva_<sua leva>` → membro (sì, chat famiglie include dirigenti)
- `squadra_<X>` → **NON membro** (no dirigenti)
- `torneo_<id>` se leva del torneo combacia → membro

---

## PREPARATORE_PORTIERI

Sezioni: Dashboard, Rosa (filtrata "Portieri"), Presenze ("Presenze portieri"), Statistiche, Comunicazioni, Chat, Partite & Tornei, Calendario.

Permessi server:
- `POST /presenze`, `POST /presenze/bulk` → OK (è in whitelist)
- `POST /events`, `POST /matches`, `POST /tornei` → **NO** (non in WRITE_ROLES)
- `POST /players` (creazione giocatore) → **NO** (non in ADMIN_ROLES). Può solo READ.
- `POST /comunicazioni` → **NO** (non in whitelist)
- `GET /chat/squadra_<leva>` → membro (resolver squadra include preparatore_portieri della leva)

---

## MISTER_ADMIN

Admin con cappello da mister. In nav vede tutto come admin (sezioni piene). Server:
- Tutti i guard `requireRole(...)` che includono "admin" lo accettano
- Override automatico in `requirePermission` (lib/permissions.ts:12: admin || mister_admin → pass)
- `getUserLeve` wildcard (vede tutte le leve)
- Membership chat staff_<X> per ogni leva della società

Differenza pratica vs admin: nessuna sui permessi backend. Solo conceptual sul FE (alcune voci "admin" preservano la titolarità).

---

## GENITORE

### Sezione: Panoramica (`pg-panoramica`)
- [ ] Vista riassuntiva del figlio (prossimi eventi, comunicazioni)

### Sezione: Home/Dashboard (`pg-dashboard`)
- [ ] Eventi imminenti dei figli → GET `/api/v2/events?da=&a=` (filtrato client-side)

### Sezione: Presenze (`pg-presenze`)
- [ ] Storico presenze del figlio → GET `/api/v2/presenze?eventId=<X>` (per evento) [no scope ownership ATTUALMENTE, vedi anomalia A residua P2]
- [ ] Avvisa assenza `[Avvisa assenza]` → LOCAL `saveAvvisoAssenza()` (index.html:9394)

### Sezione: Convocazioni (`pg-convocazioni`)
- [ ] Lista convocazioni del figlio → LOCAL (blob, no endpoint REST)
- [ ] Conferma presenza → LOCAL `confermaPresenza(eventId, playerId)` (index.html:11097)
- [ ] Segna indisponibilità → LOCAL `saveDisponibilita()` (index.html:11146)

### Sezione: Comunicazioni (`pg-comunicazioni`)
- [ ] Lista bacheca → GET `/api/v2/comunicazioni`
- [ ] Segna come letto → POST `/api/v2/comunicazioni/:id/read`
- [ ] Commenta → LOCAL `addCommento()`
- [ ] Pubblica avviso → **403** (non in whitelist)

### Sezione: Chat (`pg-chat`)
- [ ] `leva_<sua leva figlio>` (famiglie) → GET messaggi 200, POST messaggi 200 (membro)
- [ ] `staff_<X>` → 403 (non membro)
- [ ] `squadra_<X>` (U14+) → 403 (non membro)
- [ ] `torneo_<X>` se figlio convocato → 200 (membro indiretto via player_guardians)
- [ ] Crea sondaggio → 403 (gating ruolo admin/dirigente)
- [ ] Vota sondaggio in chat di cui è membro → 200

### Sezione: Calendario (`pg-calendario`)
- [ ] Vista eventi del figlio → GET `/api/v2/events?da=&a=`

### Sezione: Allenamenti (`pg-allenamenti`)
- [ ] Lista allenamenti del figlio → GET `/api/v2/allenamenti` (la query backend espone solo lui+staff dato il ruolo, vedi `RUOLI_GENITORE` in allenamenti.ts:48)
- [ ] Dettaglio allenamento → GET `/api/v2/allenamenti/:id`
- [ ] Note vocali audio → GET `/api/v2/allenamenti/note-vocali/:id/audio` (read-only)

### Sezione: Partite & Tornei (`pg-partite-gen`, vista semplificata)
- [ ] Lista partite figlio → GET `/api/v2/matches`
- [ ] Lista tornei figlio → GET `/api/v2/tornei`

### Sezione: Foto & Video, Documenti
- [ ] WIP / lettura

### Sezione: Quote (`pg-pagamenti`, con piano società)
- [ ] Quote del figlio → **GET 403** (`requireRole admin|dirigente`)
  *Nota: questo è un gap UX — quote di pagamento dovrebbero essere visibili al genitore. Mancanza di endpoint dedicato `/api/v2/quote/mine`.*

### Azioni GDPR
- [ ] Lista giocatori da connettere → GET `/api/v2/players/pending-parental-consent`
- [ ] Claim player (collega come guardian) → POST `/api/v2/players/:id/claim`
- [ ] Accetta consenso parentale → POST `/api/v2/account/accept-parental-consent/:playerId`
- [ ] Aggiorna dati personali figlio → PATCH `/api/v2/players/:id/personal-data`
- [ ] Stato consensi → GET `/api/v2/account/consents`
- [ ] Accetta privacy → POST `/api/v2/account/accept-privacy`
- [ ] Marketing consent → PUT `/api/v2/account/marketing-consent`

### Sezioni NON visibili
- Rosa, Statistiche, Allenamenti come "gestione", Impostazioni, Gestione Campionato

### Restrizioni server-side (post FIX 2 ownership)
- `GET /players` → solo i propri figli (via `player_guardians.user_id`)
- `GET /players/:id` → 404 per player non-figlio (no leak)
- `GET /stats/player/:id` → 404 per player non-figlio
- `GET /stats/leva` → 403
- `POST/PUT/DELETE /players` → 403
- `POST /events`, `POST /matches` → 403
- `POST /quote` → 403

---

## NONNO

Identico a **GENITORE** in tutti i guard server (`RUOLI_GENITORE = new Set(["genitore","giocatore","nonno"])` in allenamenti.ts:48; `requireRole genitore|nonno` in claim e altri). Nessuna differenza funzionale.

---

## GIOCATORE (over 13)

### Sezione: Panoramica (`pg-panoramica`)
- [ ] Riassunto propria leva

### Sezione: Home/Dashboard (`pg-dashboard`)
- [ ] Prossimi eventi propri → GET `/api/v2/events`

### Sezione: Presenze (`pg-presenze`)
- [ ] Storico presenze proprio → GET `/api/v2/presenze?eventId=<X>`

### Sezione: Convocazioni (`pg-convocazioni`)
- [ ] Lista convocazioni proprie → LOCAL
- [ ] Conferma presenza → LOCAL `confermaPresenza()`
- [ ] Segna indisponibilità → LOCAL `saveDisponibilita()`

### Sezione: Comunicazioni (`pg-comunicazioni`)
- [ ] Lista bacheca → GET `/api/v2/comunicazioni`
- [ ] Segna letto → POST `/api/v2/comunicazioni/:id/read`
- [ ] Commenta → LOCAL
- [ ] Pubblica → 403

### Sezione: Le mie statistiche (`pg-statistiche`)
- [ ] Stats proprie → GET `/api/v2/stats/player/:id` (post FIX 2: 200 solo per `players.nome+cognome == users.nome+cognome`)
- [ ] Stats di altro giocatore → **404** (anti-leak)

### Sezione: Partite & Tornei (`pg-partite`)
- [ ] Lista partite leva → GET `/api/v2/matches`
- [ ] Lista tornei → GET `/api/v2/tornei`

### Sezione: Calendario, Foto & Video, Documenti
- [ ] Visualizzazione read-only

### Sezione: Chat (`pg-chat`)
- [ ] `squadra_<sua leva>` (U14+) → GET 200 (membro via match nome+cognome del giocatore con player in leva)
- [ ] `leva_<X>` (chat famiglie) → 403 (non membro)
- [ ] `staff_<X>` → 403
- [ ] `torneo_<X>` se convocato → 200 (membro indiretto)
- [ ] POST messaggio chat di cui è membro → 200
- [ ] Crea sondaggio → 403 (gating ruolo)

### Sezioni NON visibili
- Chat (in nav: alcune build mostrano "Le mie chat" filtrata, comunque accesso solo a chat di cui è membro), Rosa, Allenamenti gestione, Impostazioni, Quote
- ROLE_CFG (index.html:4844) per giocatore esclude esplicitamente: Chat, Rosa, Allenamenti, Quote, Impostazioni

### Restrizioni server-side (post FIX 2)
- `GET /players` → solo se stesso
- `GET /players/:id` → 404 per player diverso da match nome+cognome
- `GET /users` → 403 (admin-only)
- `POST/PUT/DELETE /players` → 403
- `POST /events`, `POST /matches`, `POST /presenze/bulk` → 403
- `POST /quote` → 403

---

## Endpoint senza sezione FE associata

### Diagnostici / Operativi (admin tecnico)
- `GET /api/v2/_bundle-info` — marker bundle attivo (no auth, no secret esposto)
- `GET /api/v2/schema-info` — colonne tabelle
- `GET /api/v2/health/ai-key` — config Anthropic
- `GET /api/v2/health/schema-budget` — health budget AI
- `GET /api/healthz` / `GET /api/healthz/db` — health-check Railway

### SuperAdmin (richiede `X-SA-Secret: MyVivaio123++`)
- `POST /api/v2/superadmin/societies` — crea società + admin (SA panel)
- `GET /api/v2/superadmin/societies` — lista società
- `POST /api/v2/superadmin/societies/:id/suspend`
- `POST /api/v2/superadmin/societies/:id/reactivate`
- `POST /api/v2/superadmin/societies/:id/extend-demo`
- `PATCH /api/v2/superadmin/societies/:id` — update nome/citta
- `POST /api/v2/superadmin/societies/:id/set-plan`
- `POST /api/v2/superadmin/societies/:id/set-billing-mode`
- `GET /api/v2/superadmin/societies/:id/audit-log`
- `POST /api/v2/superadmin/reset-password`
- `POST /api/v2/superadmin/migrate-polis-users`
- `POST /api/v2/superadmin/_backfill-roles`

### Diagnostic (no auth o admin secret)
- `GET /api/v2/_diag/chat` — diagnosi resolver chat
- `GET /api/v2/_diag/chat/ui` — UI HTML del diag
- `GET /api/v2/superadmin/_diag/cleanup-preview`
- `POST /api/v2/superadmin/_diag/cleanup-execute`
- `POST /api/v2/superadmin/_diag/repair-guardians`
- `POST /api/v2/superadmin/_diag/repair-players`
- `GET /api/v2/superadmin/_diag/duplicate-players-preview`
- `POST /api/v2/superadmin/_diag/delete-duplicate-players`
- `GET /api/v2/superadmin/_diag/genitore-debug`
- `GET /api/v2/superadmin/_diag/push`
- `GET /api/v2/superadmin/_diag/push-remap`
- `GET /api/v2/superadmin/_diag/chat-recipients`

### Auth & onboarding (chiamati pre-login)
- `POST /api/v2/auth/login`
- `POST /api/v2/auth/register`
- `POST /api/v2/auth/verify-code`
- `POST /api/v2/auth/guardian-register`
- `POST /api/v2/auth/force-password` *(post-login)*
- `POST /api/v2/auth/change-password` *(post-login)*
- `POST /api/v2/auth/self-register`
- `GET /api/v2/players/public-incomplete` *(no auth — flow self-register)*

### Stripe webhook & demo wa
- `POST /api/v2/stripe/webhook` — webhook Stripe
- Demo WhatsApp suite (admin-secret): `/api/v2/demo-wa/*`, `/api/v2/admin/demo-wa/*`

### Migrate & admin tooling
- `POST /api/v2/migrate` (admin)
- `POST /api/v2/_admin/migrate-grafica-url`
- `POST /api/v2/_admin/populate-grafica-url`
- `POST /api/v2/admin/reset-stella-demo`
- `GET /api/v2/admin/utm-stats`
- `POST /api/v2/admin/backfill-matches/:societaId`

### Notification routing
- `POST /api/v2/notifiche/risultato-partita` — invocato da FE dopo registrazione risultato per push a genitori/giocatori
- `POST /api/v2/presenze/notify-coaches` — push a coach in caso di assenza

---

## Note operative per il regression test

1. **Path "LOCAL"** non testabili via HTTP — vanno verificati con browser automation (Playwright/Cypress) o ispezionando il blob `USERS_DB` post-azione.
2. **Endpoint convocazioni**: NON esiste REST, vivono nel blob. Per testarle servirebbe simulare `__fieldosSaveState()` o aspettare migrazione futura.
3. **Membership chat** è derivata, non persistita: per testare basta verificare che `_resolveChatRecipients` ritorni o no l'userId per quel chatId (endpoint `/_diag/chat-recipients` lo espone).
4. **Ownership players** (post FIX 2): genitore/giocatore vedono 404 (non 403) per player non-propri → no info-leak.
5. **Mister vs allenatore**: nessuna differenza server-side (FIX 1). Il FE può differenziare visivamente con ROLE_LABELS.
6. **mister_admin** è "admin che vede staff": passa tutti i guard "admin" + scope wildcard.
7. **Quote per genitore/giocatore**: oggi 403 (richiede admin/dirigente). Manca endpoint `/quote/mine` per consumer roles. Considerare aggiunta in roadmap.
8. **Eventi**: `POST /events` con `leve: [<ID>]` (NON `[<NAME>]`) — il backend fa `parseInt(levaId)`. Errore comune nei test (vedi `test-fix-a3-n1-agent.mjs` storia di bug N1).

---

## Riferimenti file backend

| File | Endpoint principali |
|------|---------------------|
| `events.ts` | events CRUD + serie ricorrenti |
| `matches.ts` | matches + match_stats + tornei + campionato/settings |
| `players.ts` | players CRUD (con ownership post FIX 2) |
| `minors.ts` | claim, personal-data, guardian, pending-parental-consent |
| `users.ts` | users CRUD + approve + roles |
| `leve.ts` | leve CRUD (solo admin) |
| `society.ts` | GET/PUT society |
| `presenze.ts` | presenze GET/POST/bulk + notify-coaches |
| `stats.ts` | stats/leva, stats/player/:id (post FIX 2 ownership) |
| `quote.ts` | quote CRUD (admin/dirigente + piano società) |
| `comunicazioni.ts` | bacheca CRUD + read |
| `chat.ts` | messages, polls, vote, read, archive, adhoc-members (post A3 _isChatMember) |
| `events.ts` `[.]` | + event_leve M2M (FIX N1) |
| `allenamenti.ts` | allenamenti + sessioni + note-vocali + libreria |
| `ai-allenamenti.ts` | AI budget + spunto + sessione + completo |
| `ai-tornei.ts` | AI bracket torneo |
| `account.ts` | consents, accept-privacy, accept-parental-consent, marketing |
| `notification-preferences.ts` | preferences notify |
| `auth.ts` / `self-register.ts` | login, register, verify, change-pw |
| `stripe.ts` | checkout, webhook, subscription, portal, invoices |
| `notifiche-risultato.ts` | push risultato partita |
| `select-plan.ts` | switch piano società |
| `migrate.ts`, `migrate-polis.ts` | migrazione blob→MySQL (admin) |
| `superadmin.ts` | tutte le ops SA |
| `admin-*.ts` | diagnostici/operativi (admin-secret) |
