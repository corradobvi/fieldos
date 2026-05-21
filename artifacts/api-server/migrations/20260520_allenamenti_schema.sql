-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAZIONE: Sezione Allenamenti — schema iniziale
-- File:    20260520_allenamenti_schema.sql
-- Feature: Mister Pro + Società  ·  Lancio previsto settembre 2026
-- ───────────────────────────────────────────────────────────────────────────
-- NOTA TIPI PK/FK
--   Le PK delle nuove tabelle usano VARCHAR(36) UUID (generato lato app).
--   Le FK verso tabelle esistenti (users, societies, leve) usano INT per
--   coerenza con lo schema legacy (INT AUTO_INCREMENT su quei campi).
--   Le FK tra sole nuove tabelle usano VARCHAR(36) ↔ VARCHAR(36).
-- ───────────────────────────────────────────────────────────────────────────
-- ESECUZIONE: NON eseguire in produzione senza backup.
--   Comando: vedi 20260520_allenamenti_seed.sql in fondo.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. sessioni_libreria ────────────────────────────────────────────────────
--  Catalogo riutilizzabile di esercitazioni/sessioni.
--  Una sessione può essere privata (del mister) o pubblica (condivisa).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessioni_libreria (
  id                 VARCHAR(36)  NOT NULL,
  mister_id          INT          NOT NULL,     -- FK → users.id
  societa_id         INT          NULL,         -- FK → societies.id; NULL se mister freelance
  titolo             VARCHAR(200) NOT NULL,
  descrizione        TEXT         NOT NULL,
  durata_minuti      SMALLINT     NOT NULL,
  categoria          ENUM(
                       'tecnica_individuale',
                       'tattica',
                       'possesso_palla',
                       'finalizzazione',
                       'atletica_fisico',
                       'portieri'
                     ) NOT NULL,
  eta_leva           ENUM(
                       'pulcini',
                       'esordienti',
                       'giovanissimi',
                       'allievi',
                       'juniores'
                     ) NOT NULL,
  tag                JSON         DEFAULT NULL, -- array di stringhe es. ["1v1","pressing"]
  visibilita         ENUM('privata','pubblica') NOT NULL DEFAULT 'privata',
  ufficiale_myvivaio BOOLEAN      NOT NULL DEFAULT FALSE, -- TRUE solo per contenuti ufficiali MyVivaio
  origine_ai         BOOLEAN      NOT NULL DEFAULT FALSE, -- TRUE se generata con AI
  usata_count        INT          NOT NULL DEFAULT 0,     -- counter inserimenti in allenamenti
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_mister_id     (mister_id),
  INDEX idx_societa_id    (societa_id),
  INDEX idx_visibilita    (visibilita),
  INDEX idx_categoria_eta (categoria, eta_leva),
  INDEX idx_ufficiale     (ufficiale_myvivaio),
  FOREIGN KEY fk_sl_mister   (mister_id)  REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY fk_sl_societa  (societa_id) REFERENCES societies(id) ON DELETE SET NULL
);

-- ─── 2. allenamenti ──────────────────────────────────────────────────────────
--  Una seduta di allenamento pianificata per una leva in una data.
--  durata_totale_minuti viene ricalcolato dalla somma delle sessioni collegate.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allenamenti (
  id                   VARCHAR(36)  NOT NULL,
  leva_id              INT          NOT NULL,   -- FK → leve.id
  societa_id           INT          NOT NULL,   -- FK → societies.id
  creato_da            INT          NOT NULL,   -- FK → users.id
  titolo               VARCHAR(200) NOT NULL,
  obiettivo            VARCHAR(300) NULL,
  data                 DATE         NOT NULL,
  durata_totale_minuti SMALLINT     NOT NULL DEFAULT 0,   -- aggiornato automaticamente
  visibilita_genitori  BOOLEAN      NOT NULL DEFAULT FALSE, -- FALSE=solo staff, TRUE=visibile a genitori dopo 24h
  note_testo           TEXT         NULL,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_leva_data (leva_id, data),
  INDEX idx_societa   (societa_id),
  INDEX idx_data      (data),
  FOREIGN KEY fk_all_leva    (leva_id)    REFERENCES leve(id)      ON DELETE RESTRICT,
  FOREIGN KEY fk_all_societa (societa_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY fk_all_creato  (creato_da)  REFERENCES users(id)     ON DELETE RESTRICT
);

-- ─── 3. allenamento_sessioni ─────────────────────────────────────────────────
--  Join ordinata tra un allenamento e le sessioni che lo compongono.
--  I campi _snapshot preservano il contenuto della sessione al momento
--  dell'inserimento: se la sessione di libreria viene modificata/eliminata,
--  lo storico dell'allenamento resta intatto.
--  sessione_libreria_id=NULL indica sessione manuale non salvata in libreria.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allenamento_sessioni (
  id                     VARCHAR(36)  NOT NULL,
  allenamento_id         VARCHAR(36)  NOT NULL, -- FK → allenamenti.id
  sessione_libreria_id   VARCHAR(36)  NULL,     -- FK → sessioni_libreria.id; NULL se sessione ad hoc
  ordine                 SMALLINT     NOT NULL, -- posizione nella seduta: 1, 2, 3…
  titolo_snapshot        VARCHAR(200) NOT NULL,
  descrizione_snapshot   TEXT         NOT NULL,
  durata_minuti_snapshot SMALLINT     NOT NULL,
  categoria_snapshot     VARCHAR(50)  NOT NULL,
  tag_snapshot           JSON         NULL,
  created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_allenamento_ordine (allenamento_id, ordine),
  INDEX idx_sessione_libreria  (sessione_libreria_id),
  FOREIGN KEY fk_as_allenamento (allenamento_id)       REFERENCES allenamenti(id)       ON DELETE CASCADE,
  FOREIGN KEY fk_as_libreria    (sessione_libreria_id) REFERENCES sessioni_libreria(id) ON DELETE SET NULL
);

-- ─── 4. allenamento_note_vocali ──────────────────────────────────────────────
--  Note audio registrate dal mister durante o dopo la seduta.
--  url_audio punta al path nello storage (es. S3/R2); la durata serve per UI.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allenamento_note_vocali (
  id             VARCHAR(36)  NOT NULL,
  allenamento_id VARCHAR(36)  NOT NULL, -- FK → allenamenti.id
  creato_da      INT          NOT NULL, -- FK → users.id
  url_audio      VARCHAR(500) NOT NULL,
  durata_secondi SMALLINT     NOT NULL,
  momento        ENUM('durante','dopo') NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_allenamento (allenamento_id),
  FOREIGN KEY fk_anv_allenamento (allenamento_id) REFERENCES allenamenti(id) ON DELETE CASCADE,
  FOREIGN KEY fk_anv_creato      (creato_da)      REFERENCES users(id)       ON DELETE RESTRICT
);

-- ─── 5. ai_budget_utilizzo ───────────────────────────────────────────────────
--  Traccia il consumo mensile di token AI per società (piano Società)
--  o per singolo mister (piano Mister Pro freelance).
--  Budget mensile: 35 000 token (Mister Pro), 280 000 token (Società).
--  Il CHECK garantisce che esattamente uno tra societa_id e mister_id sia valorizzato.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_budget_utilizzo (
  id               VARCHAR(36) NOT NULL,
  societa_id       INT         NULL,      -- FK → societies.id; valorizzato per piano Società
  mister_id        INT         NULL,      -- FK → users.id;     valorizzato per piano Mister Pro freelance
  mese_riferimento CHAR(7)     NOT NULL,  -- formato 'YYYY-MM', es. '2026-09'
  token_consumati  INT         NOT NULL DEFAULT 0,
  token_budget     INT         NOT NULL,  -- 35000 (Mister Pro) | 280000 (Società)
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_ai_budget_owner CHECK (
    (societa_id IS NOT NULL AND mister_id IS NULL)
    OR
    (societa_id IS NULL AND mister_id IS NOT NULL)
  ),
  UNIQUE KEY uq_ai_budget (societa_id, mister_id, mese_riferimento),
  INDEX idx_societa_mese (societa_id, mese_riferimento),
  INDEX idx_mister_mese  (mister_id,  mese_riferimento),
  FOREIGN KEY fk_abu_societa (societa_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY fk_abu_mister  (mister_id)  REFERENCES users(id)     ON DELETE CASCADE
);

-- ─── 6. ai_richieste_log ─────────────────────────────────────────────────────
--  Log di ogni singola richiesta AI per audit, debugging e analisi consumi.
--  token_totale = token_input + token_output (ridondante ma comodo per query).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_richieste_log (
  id           VARCHAR(36) NOT NULL,
  mister_id    INT         NOT NULL, -- FK → users.id
  societa_id   INT         NULL,     -- FK → societies.id; NULL se mister freelance
  tipo         ENUM(
                 'sessione_singola',
                 'allenamento_completo',
                 'spunto_rapido'
               ) NOT NULL,
  prompt_input TEXT        NOT NULL,
  token_input  INT         NOT NULL,
  token_output INT         NOT NULL,
  token_totale INT         NOT NULL,
  modello      VARCHAR(50) NOT NULL DEFAULT 'claude-sonnet-4-5-20250929',
  successo     BOOLEAN     NOT NULL DEFAULT TRUE,
  errore       TEXT        NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_mister_data  (mister_id,  created_at),
  INDEX idx_societa_data (societa_id, created_at),
  INDEX idx_tipo         (tipo),
  FOREIGN KEY fk_arl_mister  (mister_id)  REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY fk_arl_societa (societa_id) REFERENCES societies(id) ON DELETE SET NULL
);

-- ─── 7. ai_societa_allowlist ─────────────────────────────────────────────────
--  Per piano Società: il presidente/admin decide quali mister/collaboratori
--  possono usare la generazione AI. abilitato=FALSE blocca senza rimuovere la riga.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_societa_allowlist (
  id           VARCHAR(36) NOT NULL,
  societa_id   INT         NOT NULL, -- FK → societies.id
  mister_id    INT         NOT NULL, -- FK → users.id  (il mister abilitato)
  abilitato    BOOLEAN     NOT NULL DEFAULT TRUE,
  abilitato_da INT         NOT NULL, -- FK → users.id  (chi ha dato l'abilitazione)
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_allowlist (societa_id, mister_id),
  INDEX idx_societa_abilitato (societa_id, abilitato),
  FOREIGN KEY fk_asal_societa     (societa_id)   REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY fk_asal_mister      (mister_id)    REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY fk_asal_abilitato_da (abilitato_da) REFERENCES users(id)    ON DELETE RESTRICT
);

-- ─── 8. Permesso granulare: modifica_piano_allenamento ───────────────────────
--  Il sistema permessi usa già users.permissions (colonna JSON, esiste dal 2025).
--  Nessun ALTER TABLE necessario: il flag vive nel JSON esistente.
--
--  Chiave da aggiungere:  "modifica_piano_allenamento": true | false
--
--  Default per ruolo (logica frontend, stessa posizione di gestione_presenze):
--    admin / mister_admin   → sempre TRUE (bypassa JSON, come gli altri permessi)
--    allenatore titolare    → TRUE  (titolare della propria leva)
--    preparatore_portieri   → FALSE
--    dirigente              → FALSE
--    altri collaboratori    → FALSE
--
--  Etichetta UI suggerita: '🏃 Modifica piano allenamento'
--  Sezione UI: stessa card permessi collaboratori, accanto a gestione_allenamenti.
--
--  Il flag gestione_allenamenti (già presente) controlla la VISIBILITÀ della
--  sezione Allenamenti; modifica_piano_allenamento controlla la possibilità di
--  MODIFICARE/CREARE sessioni e sedute (permesso più granulare).
-- ─────────────────────────────────────────────────────────────────────────────
