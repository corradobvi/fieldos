export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS societies (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(255) NOT NULL,
  citta           VARCHAR(255),
  colore_primario VARCHAR(7)   DEFAULT '#1A7A4A',
  colore_accento  VARCHAR(7)   DEFAULT '#FFD93D',
  logo_url        TEXT,
  codice          VARCHAR(50)  UNIQUE,
  piano                  VARCHAR(50)  DEFAULT 'demo',
  subscription_status    VARCHAR(20)  DEFAULT 'demo',
  demo_scadenza          DATETIME,
  stato                  VARCHAR(20)  DEFAULT 'attiva',
  stripe_customer_id     VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  society_id      INT          NOT NULL,
  nome            VARCHAR(255) NOT NULL,
  cognome         VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(512) NOT NULL,
  ruolo           VARCHAR(50)  NOT NULL,
  leva            VARCHAR(100),
  stato           VARCHAR(20)  DEFAULT 'attivo',
  temp_password   BOOLEAN      DEFAULT FALSE,
  figli           TEXT,
  phone           VARCHAR(50),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email_society (email, society_id),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS players (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  society_id           INT          NOT NULL,
  nome                 VARCHAR(255) NOT NULL,
  cognome              VARCHAR(255) NOT NULL,
  soprannome           VARCHAR(255),
  numero               INT,
  ruolo_campo          VARCHAR(50),
  anno_nascita         INT,
  leva                 VARCHAR(100),
  telefono_genitore    VARCHAR(50),
  email_genitore       VARCHAR(255),
  note                 TEXT,
  foto_url             TEXT,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_players (
  user_id    INT NOT NULL,
  player_id  INT NOT NULL,
  PRIMARY KEY (user_id, player_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leve (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  ordine      INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_leva (society_id, nome),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  tipo        VARCHAR(50)  NOT NULL,
  titolo      VARCHAR(255) NOT NULL,
  leva        VARCHAR(100),
  luogo       VARCHAR(255),
  data_inizio DATE,
  ora_inizio  TIME,
  data_fine   DATE,
  ora_fine    TIME,
  note        TEXT,
  ricorrente  BOOLEAN      DEFAULT FALSE,
  freq        VARCHAR(50),
  giorni      VARCHAR(100),
  fino_al     DATE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presenze (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  player_id   INT          NOT NULL,
  event_id    INT          NOT NULL,
  stato       VARCHAR(20)  DEFAULT 'assente',
  nota        TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pres (player_id, event_id),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id)  REFERENCES events(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicazioni (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  autore_id   INT,
  tipo        VARCHAR(50),
  titolo      VARCHAR(255),
  testo       TEXT,
  bacheca     VARCHAR(100),
  leva        VARCHAR(100),
  urgente     BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicazioni_reads (
  comunicazione_id  INT NOT NULL,
  user_id           INT NOT NULL,
  letto_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comunicazione_id, user_id),
  FOREIGN KEY (comunicazione_id) REFERENCES comunicazioni(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)          REFERENCES users(id)         ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  chat_id     VARCHAR(100) NOT NULL,
  autore_id   INT,
  testo       TEXT,
  foto_url    TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat (society_id, chat_id, created_at),
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quote (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT             NOT NULL,
  player_id   INT             NOT NULL,
  importo     DECIMAL(10, 2),
  scadenza    DATE,
  stato       VARCHAR(20)     DEFAULT 'in_attesa',
  leva        VARCHAR(100),
  stagione    VARCHAR(20),
  nota        TEXT,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id)  REFERENCES players(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifiche (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  society_id  INT          NOT NULL,
  user_id     INT,
  tipo        VARCHAR(50),
  titolo      VARCHAR(255),
  messaggio   TEXT,
  letto       BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  society_key     VARCHAR(255),
  subscription    TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_push (user_id, society_key)
);

CREATE TABLE IF NOT EXISTS churn_feedback (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  society_id INT NOT NULL,
  motivo     VARCHAR(100),
  dettaglio  TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sa_audit_log (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  action            VARCHAR(50)  NOT NULL,
  target_society_id INT,
  target_email      VARCHAR(255),
  performed_by      VARCHAR(255) DEFAULT 'superadmin',
  reason            TEXT,
  metadata          JSON,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_guardians (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  player_id     INT NOT NULL,
  user_id       INT NOT NULL,
  role          VARCHAR(20) NOT NULL,
  consent_given TINYINT(1) NOT NULL DEFAULT 0,
  consent_at    DATETIME NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pg (player_id, user_id),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);
`;

// Migrations: idempotent for existing databases
// Note: no IF NOT EXISTS — error 1060 (duplicate column) is caught and ignored in the migration loop
export const MIGRATIONS_SQL = `
ALTER TABLE societies ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'demo';
ALTER TABLE users ADD COLUMN phone VARCHAR(50);
ALTER TABLE societies ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE societies ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users MODIFY COLUMN society_id INT DEFAULT NULL;
CREATE TABLE IF NOT EXISTS demo_whatsapp_contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50) NOT NULL,
  user_first_name VARCHAR(100) NOT NULL,
  user_last_name VARCHAR(100) NOT NULL,
  demo_plan_key VARCHAR(20) NOT NULL,
  status ENUM('pending','clicked','sent_manual','completed') NOT NULL DEFAULT 'pending',
  clicked_at TIMESTAMP NULL,
  manual_added_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dwc_status (status),
  INDEX idx_dwc_user (user_id)
);
ALTER TABLE users ADD COLUMN founding_promo_pending VARCHAR(20) NULL DEFAULT NULL;
ALTER TABLE societies ADD COLUMN founding_active VARCHAR(20) NULL DEFAULT NULL;
ALTER TABLE societies ADD COLUMN suspended_at DATETIME NULL;
ALTER TABLE societies ADD COLUMN suspended_reason TEXT NULL;
ALTER TABLE societies ADD COLUMN payment_failed_at DATETIME NULL;
ALTER TABLE societies ADD COLUMN billing_mode ENUM('stripe','omaggio') NOT NULL DEFAULT 'stripe';
ALTER TABLE users ADD COLUMN whatsapp_number VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN privacy_accepted_at DATETIME NULL;
ALTER TABLE users ADD COLUMN marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN marketing_consent_at DATETIME NULL;
ALTER TABLE users ADD COLUMN marketing_consent_revoked_at DATETIME NULL;
ALTER TABLE players ADD COLUMN parental_consent_given_by INT NULL;
ALTER TABLE players ADD COLUMN parental_consent_at DATETIME NULL;
ALTER TABLE players ADD COLUMN cognome_iniziale VARCHAR(10) NULL;
ALTER TABLE players ADD COLUMN birth_date DATE NULL;
ALTER TABLE players ADD COLUMN incomplete TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN permissions JSON NULL;
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id INT PRIMARY KEY,
  notify_convocazioni TINYINT(1) NOT NULL DEFAULT 1,
  notify_comunicazioni TINYINT(1) NOT NULL DEFAULT 1,
  notify_chat TINYINT(1) NOT NULL DEFAULT 1,
  notify_reminders TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessioni_libreria (
  id                 VARCHAR(36)  NOT NULL,
  mister_id          INT          NOT NULL,
  societa_id         INT          NULL,
  titolo             VARCHAR(200) NOT NULL,
  descrizione        TEXT         NOT NULL,
  durata_minuti      SMALLINT     NOT NULL,
  categoria          ENUM('tecnica_individuale','tattica','possesso_palla','finalizzazione','atletica_fisico','portieri') NOT NULL,
  eta_leva           ENUM('pulcini','esordienti','giovanissimi','allievi','juniores') NOT NULL,
  tag                JSON         DEFAULT NULL,
  visibilita         ENUM('privata','pubblica') NOT NULL DEFAULT 'privata',
  ufficiale_myvivaio BOOLEAN      NOT NULL DEFAULT FALSE,
  origine_ai         BOOLEAN      NOT NULL DEFAULT FALSE,
  usata_count        INT          NOT NULL DEFAULT 0,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sl_mister_id     (mister_id),
  INDEX idx_sl_societa_id    (societa_id),
  INDEX idx_sl_visibilita    (visibilita),
  INDEX idx_sl_categoria_eta (categoria, eta_leva),
  INDEX idx_sl_ufficiale     (ufficiale_myvivaio),
  FOREIGN KEY fk_sl_mister   (mister_id)  REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY fk_sl_societa  (societa_id) REFERENCES societies(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS allenamenti (
  id                   VARCHAR(36)  NOT NULL,
  leva_id              INT          NOT NULL,
  societa_id           INT          NOT NULL,
  creato_da            INT          NOT NULL,
  titolo               VARCHAR(200) NOT NULL,
  obiettivo            VARCHAR(300) NULL,
  data                 DATE         NOT NULL,
  durata_totale_minuti SMALLINT     NOT NULL DEFAULT 0,
  visibilita_genitori  BOOLEAN      NOT NULL DEFAULT FALSE,
  note_testo           TEXT         NULL,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_all_leva_data (leva_id, data),
  INDEX idx_all_societa   (societa_id),
  INDEX idx_all_data      (data),
  FOREIGN KEY fk_all_leva    (leva_id)    REFERENCES leve(id)      ON DELETE RESTRICT,
  FOREIGN KEY fk_all_societa (societa_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY fk_all_creato  (creato_da)  REFERENCES users(id)     ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS allenamento_sessioni (
  id                     VARCHAR(36)  NOT NULL,
  allenamento_id         VARCHAR(36)  NOT NULL,
  sessione_libreria_id   VARCHAR(36)  NULL,
  ordine                 SMALLINT     NOT NULL,
  titolo_snapshot        VARCHAR(200) NOT NULL,
  descrizione_snapshot   TEXT         NOT NULL,
  durata_minuti_snapshot SMALLINT     NOT NULL,
  categoria_snapshot     VARCHAR(50)  NOT NULL,
  tag_snapshot           JSON         NULL,
  created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_as_allenamento_ordine (allenamento_id, ordine),
  INDEX idx_as_sessione_libreria  (sessione_libreria_id),
  FOREIGN KEY fk_as_allenamento (allenamento_id)       REFERENCES allenamenti(id)       ON DELETE CASCADE,
  FOREIGN KEY fk_as_libreria    (sessione_libreria_id) REFERENCES sessioni_libreria(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS allenamento_note_vocali (
  id             VARCHAR(36)  NOT NULL,
  allenamento_id VARCHAR(36)  NOT NULL,
  creato_da      INT          NOT NULL,
  url_audio      VARCHAR(500) NOT NULL,
  durata_secondi SMALLINT     NOT NULL,
  momento        ENUM('durante','dopo') NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_anv_allenamento (allenamento_id),
  FOREIGN KEY fk_anv_allenamento (allenamento_id) REFERENCES allenamenti(id) ON DELETE CASCADE,
  FOREIGN KEY fk_anv_creato      (creato_da)      REFERENCES users(id)       ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS ai_budget_utilizzo (
  id               VARCHAR(36) NOT NULL,
  societa_id       INT         NULL,
  mister_id        INT         NULL,
  mese_riferimento CHAR(7)     NOT NULL,
  token_consumati  INT         NOT NULL DEFAULT 0,
  token_budget     INT         NOT NULL,
  created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ai_budget (societa_id, mister_id, mese_riferimento),
  INDEX idx_abu_societa_mese (societa_id, mese_riferimento),
  INDEX idx_abu_mister_mese  (mister_id,  mese_riferimento),
  FOREIGN KEY fk_abu_societa (societa_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY fk_abu_mister  (mister_id)  REFERENCES users(id)     ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ai_richieste_log (
  id           VARCHAR(36) NOT NULL,
  mister_id    INT         NOT NULL,
  societa_id   INT         NULL,
  tipo         ENUM('sessione_singola','allenamento_completo','spunto_rapido') NOT NULL,
  prompt_input TEXT        NOT NULL,
  token_input  INT         NOT NULL,
  token_output INT         NOT NULL,
  token_totale INT         NOT NULL,
  modello      VARCHAR(50) NOT NULL DEFAULT 'claude-sonnet-4-5-20250929',
  successo     BOOLEAN     NOT NULL DEFAULT TRUE,
  errore       TEXT        NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_arl_mister_data  (mister_id,  created_at),
  INDEX idx_arl_societa_data (societa_id, created_at),
  INDEX idx_arl_tipo         (tipo),
  FOREIGN KEY fk_arl_mister  (mister_id)  REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY fk_arl_societa (societa_id) REFERENCES societies(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS ai_societa_allowlist (
  id           VARCHAR(36) NOT NULL,
  societa_id   INT         NOT NULL,
  mister_id    INT         NOT NULL,
  abilitato    BOOLEAN     NOT NULL DEFAULT TRUE,
  abilitato_da INT         NOT NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_asal (societa_id, mister_id),
  INDEX idx_asal_societa_abilitato (societa_id, abilitato),
  FOREIGN KEY fk_asal_societa      (societa_id)   REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY fk_asal_mister       (mister_id)    REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY fk_asal_abilitato_da (abilitato_da) REFERENCES users(id)     ON DELETE RESTRICT
);
ALTER TABLE users ADD COLUMN is_account_owner TINYINT(1) NOT NULL DEFAULT 0;
UPDATE users u JOIN (SELECT MIN(id) AS first_id FROM users WHERE ruolo = 'admin' GROUP BY society_id) fa ON u.id = fa.first_id SET u.is_account_owner = 1 WHERE u.is_account_owner = 0
`;

export const SEED_SQL = `
INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Polis Genova', 'Genova', 'POLIS18', 'base', 'attiva');

INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Stella Azzurra Demo', 'Italia', 'STELLA25', 'demo', 'attiva');
`;
