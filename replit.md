# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **fieldos** (`artifacts/fieldos`) — FieldOS Polis ASD: single-file HTML app for soccer club management (login with 5 roles: admin, allenatore, dirigente, genitore, giocatore; rosa, presenze, convocazioni, statistiche, calendario, classifica, pagamenti, impostazioni). The whole app lives in `index.html`.
  - Persistence: localStorage key `fieldos_state_v1`, auto-saved every 1.5s and on logout/pagehide. Persisted entities: USERS_DB, players, leve, currentLeva, events, eventTypes, convocazioni, disponibilita, notifiche, inviti (+ their nextIds). Reset: `__fieldosResetState()` in console. `window.__fieldosSaveState()` forces an immediate save (used by `completeOnboarding` so the just-created user/notifica/invito-used flag survive `bootApp`'s `restoreState` call).
  - Creazione utenti da admin (modale `mNewUser`): campo `#uPass` con bottone `🎲 Genera` (`genPassword()` produce password leggibile cons-voc-cons + 2 cifre, no caratteri ambigui). In creazione: password obbligatoria (>=4 char), pre-popolata via `genPassword()` all'apertura. In modifica: campo vuoto = nessun cambio, label "Reimposta password (opzionale)". Dopo creazione (o reset password in modifica) si apre `mCredsOut` con email+password readonly e bottoni copia singola/entrambe (`showCredsModal`/`copyCredsField`/`copyCredsBoth`). `saveUser` valida la password lunghezza minima e usa il valore reale invece del precedente hardcoded `'temp1234'`.
  - Inviti genitori: `inviti[]` con token random (crypto), `expiresAt` 30gg, flag `used`. Modale `mInvita` (2 step: form → link condivisibile via copia/mailto/wa.me). Bottone "📧 Invita genitore" visibile a admin/allenatore/dirigente in Rosa e Impostazioni. Onboarding via URL `?invito=TOKEN` apre `mOnboard` (step1 account, step2 selezione figli con ricerca/checkbox), crea utente `genitore`, login automatico, notifica `invito_accettato` all'invitante, URL pulito con `history.replaceState`. Link "Hai ricevuto un invito?" sul login screen apre `prompt()` per incollare URL/token manualmente. `checkInvitoFromUrl()` agganciato al boot (setTimeout 50ms post `restoreState`).
  - Modali aperte sopra il login screen: `#loginScreen` ha `z-index:9999`, le `.ov` di default `1000`, quindi `#mSelfReg` e `#mOnboard` hanno override CSS `z-index:10001` per essere visibili sopra il login. Da rispettare per qualsiasi altra modale che debba aprirsi prima del login.
  - Registrazione autonoma genitore con codice società + approvazione admin: stato `codiceSocieta` (string, vuoto = disattivata), `pendingUsers[]` `{id,nome,cogn,email,pass,role,figli,richiestaTs}`, `nextPendingUserId`. Card "🔑 Iscrizione genitori" in Impostazioni (admin-only) con campo `#setCodice` + bottoni `🎲 Genera` (`POLIS-XXXX` consonanti+cifre senza ambigui) / `📋 Copia` / `💾 Salva`. Storage uppercase, match case-insensitive. Link "Sei un genitore? Registrati con il codice società →" sul login apre modale `mSelfReg` 4 step: codice → account (email univoca vs USERS_DB+pendingUsers, pass ≥6) → selezione figli (multi-checkbox dalla rosa, almeno 1) → conferma. `submitSelfReg` aggiunge a `pendingUsers` e notifica `richiesta_iscrizione` a tutti gli admin via `pushNotifica`. Riquadro giallo `#pendingUsersBox` sopra la tabella utenti in Impostazioni mostra le richieste in attesa con `✅ Approva` (ricontrolla email univoca, ricalcola `levaFinal` dai figli attualmente in rosa, crea utente attivo) / `✕ Rifiuta` (con `confirm()`). `doLogin` è case-insensitive sull'email, intercetta `pendingUsers` con messaggio "in attesa di approvazione" e blocca `stato==='sospeso'`. Tutto persistito nello snapshot. Funzioni: `genCodiceSocietaSuggested/UI`, `copyCodiceSocieta`, `saveCodiceSocieta`, `refreshCodiceUI/StatoUI`, `openSelfReg`, `srShowStep`, `srNextStep1/2`, `srBackStep`, `renderSrRoster`, `submitSelfReg`, `approvePending`, `rejectPending`, `renderPendingUsersBox`. `renderUsersTable` chiama in cima `renderPendingUsersBox` + `refreshCodiceUI`. `refreshPendingUsersBadge` mostra il count di `pendingUsers` come pallino numerico sulla voce sidebar `.ni[data-pg="impostazioni"]` solo per `me.role==='admin'`; viene chiamato in coda a `refreshNotificheBadge` (così si aggiorna al login e a ogni ricezione notifica) e direttamente in fondo a `approvePending`/`rejectPending`.
  - Ruolo `dirigente`: color #0e6e9c, nav simile allenatore senza statistiche/pagamenti, può invitare genitori e usare la rosa in lettura. Demo: dirigente@polis.it / dir123 (Anna Verdi, leva U12).
  - Chat (sezione 💬): gruppi creati automaticamente (no creazione manuale, modale `mChat` rimossa). Funzioni in `getChatsForUser(user)`:
    * "Staff Tecnico" — membri: tutti gli `allenatore` + `admin` (admin spettatore). Visibile solo a allenatori e admin.
    * "Leva X · Famiglie" (una per ogni leva esistente) — membri: `genitore` con almeno un figlio matchato a un `player.leva===X` (case-insensitive su `Nome Cognome`, supporta sia `figli[]` sia legacy `figlio` stringa) + `dirigente` con `user.leva===X` + `admin`. Visibile solo se l'utente ne è membro; admin vede tutte.
    * Giocatori non vedono nessuna chat (voce rimossa dal nav).
    * Storage: `chatMessaggi[]` `{id,chatId,userId,text,ts}`, `nextChatMsgId`, `chatLastSeen{userId:{chatId:ts}}` — tutti persistiti nello snapshot.
    * Badge sidebar reali via `refreshChatBadges()` (somma `chatUnreadCount` per ogni chat dell'utente). `selectChat` chiama `markChatRead`.
    * Sicurezza: `sendMsg` verifica membership prima di pushare; click handler della lista usa `data-chatid` + `addEventListener` (no inline `onclick` con stringhe interpolate, evita XSS via nomi leva inseriti dall'admin); colori sanitizzati in `renderChatList` con regex hex/rgb; tutto il testo passa da `escapeHtml`.
    * Limite: messaggistica solo locale al browser (no backend), quindi utenti su dispositivi diversi non si scambiano messaggi davvero.
  - Presenze: per-date attendance `{date,status}` editable only by allenatore; genitori/giocatori have a read-only register and an "Avvisa assenza" modal that flags `assenzeAvvisate` on the player.
  - Convocazioni: tied to `events` of type `partita` or `torneo` (single events only — recurring partite are excluded by `upcomingPartiteEvents`). Genitore/giocatore set per-player `disponibilita` (disponibile/indisponibile + motivo). When the allenatore opens the convocation modal, players marked indisponibile are greyed and their checkbox is disabled (and auto-deselected if previously convoked). On save, `pushNotifica` sends a notification to the convoked player + their parents (`recipientsForPlayer`); these appear as toast on next login (`showUnreadConvToast`) and as cards in pg-comunicazioni (`renderNotificheInComm`), and update the sidebar badge (`refreshNotificheBadge`).
  - Referential cleanup: deleting a player calls `purgePlayerRefs` (removes from convocazioni + disponibilità); deleting an event calls `purgeEventRefs`.
  - Quick-nav presenze: chip carousel `presQuickNav` (id `presDateChips`) lets the coach jump between training dates with ‹/› arrows or direct click; `📍 Oggi` button snaps to today (or nearest training). All wired in `renderPresenze` via `renderPresQuickChips`/`presStepDate`/`presGoToday`.
  - Calendario → Presenze shortcut: opening an `allenamento` event modal shows a green `✅ Apri presenze` button (`btnOpenPres` → `openPresenzeFromEvento`) that switches `currentLeva`/`currentPresDate` and navigates to the registry.
  - Anagrafica giocatore: in addition to `pAnagStats` (presenze allenamenti), a second box `pConvStats` rendered by `renderPConvStats` shows the player's call-up history for past partite/tornei (% convocato, response reliability, last 6 events).
  - **Panoramica società** (pagina `pg-panoramica`, `renderPanoramica`): nuova "schermata d'arrivo" dopo il login, visibile a tutti i ruoli. Voce sidebar `{id:'panoramica',ic:'🏟️',lb:'Panoramica'}` come PRIMO item sotto sezione `{s:'Società'}` per tutti i 5 ruoli. `bootApp` ora chiama `goTo('panoramica')` (era `'dashboard'`). `goTo` chiama `renderPanoramica()` quando la pagina diventa attiva. Contenuto: header banner gradient blu con saluto personalizzato + 4 card: ⚽ "Prossime partite per leva" (per ogni leva visibile, prossima partita/torneo/amichevole con data/luogo/tipo via `panoNextMatchForLeva`), 📊 "Ultimi risultati" (placeholder informativo per ora — verrà popolato dalla tappa 2 con risultati e marcatori), 🏃 "Prossimi allenamenti" (top 6 cross-leva via `panoNextTrainingsForLeva` che usa `getTrainingDatesForLeva` per espandere le ricorrenze), ⚡ "Scorciatoie" (4 bottoni rapidi). Filtro leve per ruolo via `panoVisibleLeve()`: admin/allenatore/dirigente vedono tutte le leve, genitore solo leve dei figli, giocatore solo la sua. Helper interni: `panoNextMatchForLeva`, `panoLastMatchForLeva`, `panoNextTrainingsForLeva`, `panoFmtDateShort`, `panoEventTypeLabel`, `panoEventTypeColor`. Tutto dipende dallo state esistente, niente nuovi campi nello snapshot.
- **api-server** (`artifacts/api-server`) — Express API server (currently unused by FieldOS).
- **mockup-sandbox** (`artifacts/mockup-sandbox`) — Vite component preview sandbox.
