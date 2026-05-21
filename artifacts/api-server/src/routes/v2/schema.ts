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
UPDATE users u JOIN (SELECT MIN(id) AS first_id FROM users WHERE ruolo = 'admin' GROUP BY society_id) fa ON u.id = fa.first_id SET u.is_account_owner = 1 WHERE u.is_account_owner = 0;
ALTER TABLE sessioni_libreria MODIFY COLUMN categoria ENUM('riscaldamento','tecnica_individuale','tattica','possesso_palla','finalizzazione','atletica_fisico','portieri') NOT NULL;
ALTER TABLE sessioni_libreria ADD COLUMN note TEXT NULL;
ALTER TABLE allenamento_sessioni ADD COLUMN note_snapshot TEXT NULL
`;

export const SEED_SQL = `
INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Polis Genova', 'Genova', 'POLIS18', 'base', 'attiva');

INSERT IGNORE INTO societies (nome, citta, codice, piano, stato)
  VALUES ('Stella Azzurra Demo', 'Italia', 'STELLA25', 'demo', 'attiva');
`;

// Sessioni ufficiali MyVivaio — categoria PULCINI (U8/U10) — 70 sessioni
// Eseguito una volta sola quando COUNT < 70 (vedi v2/index.ts ensureSchema)
export const PULCINI_SEED_SQL = `
ALTER TABLE sessioni_libreria MODIFY mister_id INT NULL;
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il postino portapalla',
  'Disponi 8-10 coni in modo casuale su un''area 15x15m: ogni cono è una casa da visitare. Ogni bambino ha la sua palla e deve condurla fino a un cono, toccarlo con la mano libera e ripartire verso un altro. L''obiettivo è visitare più case possibile in 2 minuti evitando i compagni. Tieni il conto e crea una gara tra turni: chi batte il proprio record? Variante divertente: il mister urla ''corriere express!'' e tutti devono raggiungere il cono più lontano da loro il più veloce possibile, sempre palla al piede. Ottimo per attivare gambe e concentrazione dal primo minuto senza spiegazioni lunghe.',
  12, 'riscaldamento', 'pulcini',
  JSON_ARRAY('conduzione', 'coni', 'orientamento', 'riscaldamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il postino portapalla' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Acchiappacode con pallone',
  'Ogni bambino ha una codina (o pettorina ripiegata) infilata nei pantaloncini sul dietro e una palla tra i piedi. Obiettivo: conduci la tua palla e cerca di rubare le code degli altri toccandole con la mano. Chi perde la coda va in zona recupero, fa 3 tocchi veloci sulla palla e rientra in campo. Girate da 90 secondi con pausa breve tra una e l''altra. Variante: chi non ha la coda può rubare solo ai compagni che ce l''hanno ancora, non tra di loro. Divertimento assicurato e movimento continuo: nessuno sta mai fermo, la palla è sempre tra i piedi, e l''intensità sale da sola.',
  12, 'riscaldamento', 'pulcini',
  JSON_ARRAY('codine', 'conduzione', 'reazione', 'riscaldamento', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Acchiappacode con pallone' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Semaforo con pallone',
  'Ogni bambino conduce la palla liberamente dentro un''area 15x15m. Tu fai da semaforo: verde = corri con la palla, giallo = rallenta e fai tocchi sul posto, rosso = stop con il piede sulla palla ferma. Quando chiami un colore i bambini devono reagire il più veloce possibile. Aumenta gradualmente la frequenza dei cambi per alzare l''intensità. Variante: aggiungi blu = cambio di direzione immediato, e arancio = passa la palla al compagno più vicino e ricevi indietro. Allena reazione, ascolto e tecnica base tutto in uno, senza mai fermare il gruppo per spiegazioni.',
  10, 'riscaldamento', 'pulcini',
  JSON_ARRAY('ascolto', 'reazione', 'conduzione', 'riscaldamento', 'comandi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Semaforo con pallone' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Ladri nel pollaio',
  'Prepara un quadrato 15x15m con tante palline quanti sono i bambini meno uno: c''è sempre un bambino senza palla. Chi non ha palla deve rubarla agli altri toccandola con il piede. Chi perde la palla diventa il nuovo ladro. Nessuno si ferma mai, tutti in movimento continuo nell''area. Regola fondamentale: non si può uscire dal quadrato. Variante: metti 2 bambini senza palla contemporaneamente per alzare il ritmo. Allena la protezione della palla, la conduzione sotto pressione e il senso dello spazio in modo completamente istintivo, senza che il bambino percepisca di stare lavorando su qualcosa di tecnico.',
  12, 'riscaldamento', 'pulcini',
  JSON_ARRAY('protezione palla', 'conduzione', 'riscaldamento', 'gioco', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Ladri nel pollaio' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Quattro angoli e via',
  'Metti 4 coni agli angoli di un quadrato 12x12m e chiama ogni angolo con un numero (1, 2, 3, 4). I bambini stanno al centro ognuno con la sua palla. Quando chiami un numero corrono con la palla verso quell''angolo, toccano il cono e tornano al centro. Varia la velocità delle chiamate: lenta all''inizio, poi sempre più rapida. Variante: dai due numeri in fila rapida, tipo ''2 poi 4'', e vedi chi riesce a memorizzarli entrambi. Ottimo warm-up cognitivo-motorio che allena orientamento spaziale, ascolto e prontezza nei cambi di direzione in modo sfidante ma accessibile.',
  12, 'riscaldamento', 'pulcini',
  JSON_ARRAY('velocità', 'reazione', 'orientamento', 'riscaldamento', 'coni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Quattro angoli e via' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il trenino degli attaccanti',
  'I bambini si mettono in fila indiana dietro una linea di coni, ognuno con una palla. Il primo conduce la sua palla fino a un cono a 10m, la lascia lì e torna di corsa. Il secondo parte, recupera quella palla, la conduce fino a metà, la passa al terzo che aspetta e così via. Ogni bambino ha sempre un compito attivo: nessuno aspetta mai in fila senza fare nulla. Variante: invece di lasciare la palla, il bambino gira intorno al cono e torna passandola al compagno successivo. Perfetto per rodare i movimenti dal primo secondo e mantenere alta l''attenzione di tutto il gruppo.',
  10, 'riscaldamento', 'pulcini',
  JSON_ARRAY('passaggio', 'conduzione', 'fila', 'riscaldamento', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il trenino degli attaccanti' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corsa degli animali',
  'Senza palla, i bambini si muovono liberamente nell''area. Chiami un animale e tutti imitano il suo movimento: rana = saltelli a gambe larghe, granchio = spostamento laterale accovacciati, cavallo = corsa con ginocchia alte, serpente = strisciare a terra, aquila = corsa con braccia aperte. Fai sequenze sempre più veloci. Variante con pallone: stessa cosa ma tenendo la palla in mano o portandola ai piedi dove possibile. Questo warm-up allena coordinazione globale, equilibrio e fantasia motoria in modo completamente ludico, senza spiegazioni tecniche, catturando l''attenzione dei più piccoli fin dal primo secondo.',
  10, 'riscaldamento', 'pulcini',
  JSON_ARRAY('andature', 'coordinazione', 'riscaldamento', 'ludico', 'movimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corsa degli animali' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il labirinto dei coni',
  'Disponi 8-10 coni in fila con distanze variabili (alcuni ravvicinati, altri più larghi) in uno spazio 4x14m. Ogni bambino conduce la palla a slalom tra i coni, arriva in fondo, gira intorno all''ultimo e torna. Vuoi tenere tutti in movimento: chi non ha ancora finito lascia partire il successivo dopo 5 secondi. Cronometra i turni e crea una piccola classifica divertente. Variante: aggiungi uno stop con la suola su ogni cono alternato per inserire un tocco di tecnica base. Ottimo per scaldare le caviglie, abituare il piede al pallone e introdurre la conduzione in modo naturale.',
  12, 'riscaldamento', 'pulcini',
  JSON_ARRAY('slalom', 'conduzione', 'coni', 'riscaldamento', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il labirinto dei coni' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passa e scappa',
  'I bambini si mettono in coppia a 5-6m di distanza. Uno passa la palla al compagno e scappa lateralmente di 3-4 passi. Il compagno controlla, segue con lo sguardo il movimento e ripassa al nuovo spazio. Ogni volta che si passa, ci si sposta: nessuno rimane mai fermo. Fai girare le coppie ogni 2 minuti. Variante: inserisci un terzo bambino al centro che fa il difensore passivo. I due devono calibrare i passaggi intorno a lui senza che li intercetti. Ideale per scaldare i muscoli con la palla e iniziare ad abituare i bambini al concetto chiave: dopo il passaggio ci si muove sempre.',
  10, 'riscaldamento', 'pulcini',
  JSON_ARRAY('passaggio', 'movimento', 'riscaldamento', 'cooperazione', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passa e scappa' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il re del cerchio',
  'Disegna (o segnala con coni) un cerchio di circa 4m di diametro. Due bambini entrano: uno protegge la propria palla, l''altro cerca di buttarla fuori con un tocco del piede. Chi dura 30 secondi senza perdere la palla è il re del cerchio. Rotazione rapida: chi vince resta, chi perde cede il posto al prossimo. Variante: due re contemporaneamente nello stesso cerchio, ognuno protegge la propria palla e cerca di espellere quella del rivale. Esercizio breve ma intenso: scalda le gambe in modo vivo e introduce la protezione della palla come concetto naturale, senza spiegarlo a parole.',
  12, 'riscaldamento', 'pulcini',
  JSON_ARRAY('protezione palla', 'equilibrio', 'riscaldamento', '1v1', 'cerchio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il re del cerchio' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Slalom alternato dentro-fuori',
  'Crea un percorso slalom con 7 coni distanziati di 1,5m lungo uno spazio 3x12m. All''andata il bambino conduce con l''esterno del piede, al ritorno con l''interno. Obiettivo: non toccare i coni. Chi ne tocca uno si ferma, fa 3 tocchi veloci sul posto e riparte. Cronometra i turni. Variante: esegui un giro completo solo col piede debole. Ricorda ai bambini che molti tendono a spingere troppo la palla: insegna a tenerla vicina, quasi incollata al piede durante tutto il percorso. È una correzione che vale per ogni situazione di conduzione in partita.',
  18, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('slalom', 'conduzione', 'coni', 'interno piede', 'piede debole'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Slalom alternato dentro-fuori' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stop e vai orientato',
  'Disponi coppie di coni a 8m di distanza. Il bambino si posiziona a metà. Tu (o un compagno) fai rotolare la palla verso di lui: deve stoppare con la suola o con l''interno del piede, orientarsi verso uno dei due coni e condurci. Poi torna al centro e ripete. L''obiettivo è che il primo tocco indirizzi già la palla nella direzione scelta, non la fermi solo sul posto. Variante: al posto dei coni metti due porte piccole e dopo il controllo orientato il bambino tira. Lavora su un fondamentale chiave: lo stop non è mai fine a se stesso, è già l''inizio del prossimo movimento.',
  20, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('controllo', 'stop', 'orientamento', 'ricezione', 'conduzione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stop e vai orientato' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Dribbling del cobra',
  'Ogni bambino ha una palla in uno spazio 10x10m. Spiega la mossa del cobra: avvicinarsi al cono-ostacolo lentamente, rallentare ancora, poi scattare di lato cambiando direzione all''improvviso. Fai provare tutti contro un cono fermo. Poi in coppia: uno attacca, l''altro fa resistenza passiva (mette solo il corpo, non strappa). Ogni 2 minuti si scambiano i ruoli. Variante: chi riesce a fare 3 cobra di fila senza perdere la palla è il re cobra e guadagna un punto. Introduce la finta come strumento reale, non come esercizio astratto, partendo da una situazione di gioco concreta.',
  18, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('dribbling', 'finta', '1v1', 'cambio direzione', 'guida palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Dribbling del cobra' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Piede debole è bello',
  'Tutto l''esercizio si fa col piede non dominante. Partenza semplice: ogni bambino conduce la palla da un cono all''altro a 10m usando solo il piede debole. Poi aggiungi un ostacolo al centro da girare. Obiettivo: non la velocità, ma il contatto pulito. Ricorda ai bambini che il piede debole diventa forte solo con la pratica: ogni tocco è un investimento. Variante: gara di precisione, chi riesce a far passare la palla tra due coni a 1m di distanza col piede debole guadagna un punto per la sua squadra. Sessione breve ma fondamentale: i Pulcini formano le abitudini ora, cambiarle da grandi è molto più difficile.',
  20, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('piede debole', 'conduzione', 'precisione', 'tecnica base'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Piede debole è bello' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpisci il cono',
  'Metti un cono in piedi a 6m di distanza. Ogni bambino ha 5 tiri per abbatterlo con un passaggio piatto, alternando interno del piede e collo del piede. Chi abbatte il cono fa 1 punto. Mantieni la distanza accessibile: vuoi che riescano almeno 1-2 volte su 5, non che falliscano sempre. Variante: metti 3 coni a distanze diverse (5m, 7m, 9m) e assegna punteggi crescenti. Questo esercizio lavora su precisione del passaggio, postura del corpo sulla palla e abitudine a guardare il bersaglio prima di calciare. Un''abitudine che in partita fa la differenza tra un passaggio preciso e uno sparato a caso.',
  15, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('passaggio', 'precisione', 'interno piede', 'tecnica base', 'coni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpisci il cono' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla incollata',
  'Ogni bambino conduce la palla liberamente nell''area 15x15m cercando di tenerla il più vicino possibile al piede, come incollata. Tu giri tra loro e ogni tanto sfidi un bambino: provi a toccare la palla con una bacchetta di gommapiuma. Se riesce a schermarla, fa un punto. Ogni tot secondi chiama un cambio di direzione obbligatorio. Variante: in coppia, uno conduce e l''altro cammina a fianco cercando solo di toccare la palla, non rubarla. Sviluppa la sensibilità del tocco e l''abitudine a proteggere il pallone in modo istintivo. Un fondamentale che distingue chi sa tenere palla da chi la perde sempre.',
  18, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('controllo stretto', 'conduzione', 'protezione palla', 'tecnica base'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla incollata' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rimbalzo e ricontrollo',
  'Usa un muro o una recinzione come sponda. Il bambino è a 3m e calcia con l''interno del piede, controlla il rimbalzo e ribatte. Obiettivo: fare più tocchi in 30 secondi senza perdere il controllo. Primo giro libero, secondo giro solo col piede debole, terzo giro a due tocchi (controllo più calcio). Variante: marca a terra una croce con nastro e il bambino deve controllare sempre dentro la croce prima di ribattere. Allena il controllo di palla, il timing e la reazione a rimbalzi imprevedibili. I Pulcini spesso aspettano che la palla si fermi da sola: questo li abitua ad attaccarla invece di aspettarla.',
  15, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('controllo', 'rimbalzo', 'tecnica base', 'reazione', 'interno piede'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rimbalzo e ricontrollo' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Guida e fermati!',
  'I bambini conducono la palla liberamente. Quando fischi, tutti stoppano la palla il più velocemente possibile con la suola, immobili per 2 secondi. Poi ripartono al fischio successivo. Dopo qualche giro cambia il segnale: mano destra alzata = stop con suola, mano sinistra = fermati con l''interno del piede. Variante finale: aggiungi la direzione obbligata. Dopo lo stop, indichi destra o sinistra e i bambini ripartono in quella direzione. Lavora su controllo, reazione allo stimolo visivo e prontezza nel cambio di direzione. Semplice da spiegare, intenso da eseguire, e tiene alta la concentrazione di tutti.',
  20, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('stop', 'reazione', 'conduzione', 'cambio direzione', 'tecnica base'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Guida e fermati!' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il triangolo tecnico',
  'Crea un triangolo con 3 coni a circa 5m per lato. Il bambino parte da un vertice, conduce fino al secondo, esegue uno stop e riparte verso il terzo, poi torna al primo. Al secondo cono fa un cambio di direzione con la suola, al terzo uno stop orientato verso l''esterno del triangolo. Fai girare tutti e poi aumenta: al secondo cono aggiungi una finta, al terzo uno stop con orientamento verso sinistra o destra. Variante: due bambini sul triangolo in senso contrario devono evitarsi senza fermarsi. Circuito tecnico completo che tocca conduzione, stop e cambio di direzione in un flusso continuo.',
  22, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('conduzione', 'stop', 'cambio direzione', 'finta', 'circuito'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il triangolo tecnico' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finta e supera',
  'In coppia con un difensore passivo (non strappa, mette solo il corpo), l''attaccante conduce verso il compagno fermo, esegue una finta (passo falso laterale o spostamento del peso) e accelera di lato. Distanza di partenza: 8m. Cinque ripetizioni per lato, poi si scambiano. Il difensore inizialmente è fisso, poi dopo qualche giro può muoversi leggermente. Variante: metti un piccolo cancelletto di coni dopo il difensore: l''attaccante deve passarci dentro dopo la finta per guadagnare il punto. Rafforza la gestualità della finta e il coraggio di andarci, due cose che i Pulcini sviluppano solo con molte ripetizioni in situazione.',
  18, 'tecnica_individuale', 'pulcini',
  JSON_ARRAY('finta', 'dribbling', '1v1', 'accelerazione', 'guida palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finta e supera' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Trova il buco',
  'In un quadrato 10x10m, 3 attaccanti contro 1 difensore. Gli attaccanti si passano la palla cercando lo spazio libero. Il difensore cerca di toccarla. Chi fa 7 passaggi consecutivi vince il turno. Il difensore ruota ogni 3 tentativi. L''obiettivo tattico per i Pulcini è semplice: dopo aver passato, spostati. Non stare mai fermo. Dai feedback positivi quando vedi un buon movimento. Variante: massimo 2 tocchi a testa. Chi fa 3 tocchi passa in difesa. Introduce l''idea di velocità di gioco senza spegnere la creatività. I bambini imparano che muoversi dopo il passaggio apre spazi in modo completamente naturale.',
  22, 'tattica', 'pulcini',
  JSON_ARRAY('smarcamento', 'passaggio', '3v1', 'spazio', 'movimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Trova il buco' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Difendiamo il fortino',
  '2v2 in uno spazio 12x10m con due porte piccole (coni) ai lati corti. Le due squadre si sfidano: chi segna più gol in 3 minuti vince. Chi subisce gol riprende subito da dietro la propria porta, senza interruzioni. Enfatizza il posizionamento difensivo di base: restare tra la palla e la propria porta, non inseguire tutti la stessa palla. Variante: ogni gol segnato col piede debole vale doppio. Questo piccolo formato 2v2 è perfetto per i Pulcini: ogni bambino tocca molte volte la palla e non ci sono mai momenti morti in cui qualcuno rimane spettatore passivo per più di qualche secondo.',
  25, 'tattica', 'pulcini',
  JSON_ARRAY('2v2', 'difesa', 'porta piccola', 'posizionamento', 'transizione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Difendiamo il fortino' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'L''ombra del compagno',
  'In coppia, un bambino è il leader e l''altro è l''ombra. Il leader conduce la palla liberamente nell''area 15x10m: va dove vuole, accelera, rallenta, cambia direzione. L''ombra lo segue ovunque cercando di restare sempre a meno di 2 passi di distanza senza toccare la palla. Dopo 90 secondi si scambiano. Variante più tecnica: anche l''ombra porta la palla e deve replicare ogni movimento del leader. Introduce l''idea di marcatura e di stare vicino all''avversario in forma completamente ludica, senza parlare di difesa, schemi o ruoli. I bambini capiscono il concetto attraverso il corpo, non attraverso le parole.',
  20, 'tattica', 'pulcini',
  JSON_ARRAY('marcatura', 'movimento', 'difesa', 'posizionamento', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'L''ombra del compagno' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il passaggio segreto',
  'In uno spazio 12x8m, 3 bambini formano un triangolo mobile. Uno ha la palla e gli altri si muovono liberamente nell''area. Regola unica: chi riceve deve essere in movimento quando la riceve, non fermo. Se ricevi da fermo il passaggio non vale e si ricomincia. Dà feedback semplici e positivi: ''vedi lo spazio lì?'', ''muoviti prima di ricevere!''. Dopo 5 minuti di pratica libera fai riflettere con una domanda: ''perché è più facile ricevere quando ti sei già mosso?''. Variante: aggiungi un difensore passivo al centro. I bambini capiscono da soli che muoversi apre spazi, senza bisogno di spiegazioni tattiche elaborate.',
  22, 'tattica', 'pulcini',
  JSON_ARRAY('smarcamento', 'passaggio', 'movimento', 'ricezione', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il passaggio segreto' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gioco a zone elementare',
  'Dividi il campo 15x20m in tre fasce verticali con coni. Gioco 3v3: ogni squadra ha un giocatore per fascia. Regola unica: non puoi uscire dalla tua fascia. Chi porta la palla nella fascia avversaria più esterna e la tocca a terra guadagna un punto. Non ci sono porte. Variante: dopo 5 minuti rimuovi il vincolo delle zone e vedi se i bambini mantengono istintivamente il posizionamento spaziale. Introduce la separazione del campo e il senso della propria zona in modo ludico, senza parlare di moduli o di ruoli fissi. I bambini vivono il concetto di ''campo diviso'' attraverso il gioco.',
  25, 'tattica', 'pulcini',
  JSON_ARRAY('posizionamento', 'zone', 'spazio', 'gioco di squadra', '3v3'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gioco a zone elementare' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Chi preme vince',
  'In uno spazio 10x8m, 2v2. La squadra che perde la palla deve immediatamente provarsi a recuperarla senza aspettare. Regola: non si può stare fermi più di 2 secondi senza muoversi verso la palla. Se vedi qualcuno fermo conti ad alta voce: ''uno, due...'' e se arrivi a tre la squadra che non si è mossa cede un punto all''avversario. Variante: la squadra che recupera la palla entro 5 secondi dalla perdita guadagna un punto bonus. I bambini imparano a non mollare dopo aver perso il possesso: abitudine fondamentale che si forma bene proprio in questa età, quando il pressing è ancora qualcosa di istintivo.',
  20, 'tattica', 'pulcini',
  JSON_ARRAY('pressing', 'recupero palla', '2v2', 'transizione', 'reazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Chi preme vince' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Triangolo e porta',
  'Tre bambini ai vertici di un triangolo di coni (5m per lato). Si passano la palla intorno al triangolo per 2-3 giri. Al tuo segnale, uno di loro conduce verso la porta piccola a 8m e tira. Il portiere è un quarto bambino. Non si può tirare prima del segnale: la combinazione precede sempre la conclusione. Variante: aggiungi un difensore che entra in gioco al segnale cercando di disturbare il tiro. I bambini capiscono che la combinazione serve a creare spazio per il tiro senza bisogno di una spiegazione teorica. Basta che sperimentino la differenza tra tirare dopo la combinazione e tirare subito.',
  25, 'tattica', 'pulcini',
  JSON_ARRAY('combinazione', 'passaggio', 'tiro', 'triangolo', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Triangolo e porta' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '2v1 verso la porta',
  'Due attaccanti contro un difensore verso una porta con portiere. Partono da 15m. L''attaccante con la palla decide: va da solo o cerca il compagno? Il difensore si posiziona tra i due cercando di togliere la linea di passaggio. Spiega con parole semplici: se il difensore ti viene addosso, passa. Se sta col compagno, vai tu. Rotazione rapida: dopo ogni azione tutti cambiano ruolo. Variante: l''attaccante senza palla parte 3m più indietro e deve recuperare di corsa: allena anche l''inserimento in corsa in modo naturale. Esercizio classico che funziona sempre perché crea situazioni di gioco reali e leggibili anche dai più piccoli.',
  22, 'tattica', 'pulcini',
  JSON_ARRAY('2v1', 'superiorità numerica', 'decisione', 'attacco', 'porta piccola'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '2v1 verso la porta' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attacco e difesa rapida',
  'Campo 15x10m, due squadre da 3. Una squadra attacca verso una porta piccola, l''altra difende. Appena chi attacca segna o perde la palla, i ruoli si invertono immediatamente: chi difendeva parte in contropiede verso l''altra porta. Fai girare veloce: ogni azione dura massimo 20 secondi, poi cambio. Puoi inserire la regola che il primo tocco dopo il cambio di fase deve essere un passaggio. Variante: aggiungi un jolly neutro che gioca sempre col team in possesso. Aiuta i bambini a capire la superiorità numerica e li abitua alla transizione rapida senza doverla spiegare come concetto teorico.',
  25, 'tattica', 'pulcini',
  JSON_ARRAY('transizione', 'contropiede', 'attacco', 'difesa', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attacco e difesa rapida' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il corridoio stretto',
  'Crea un corridoio 5x20m con coni ai lati. Due squadrette da 2-3 giocatori si sfidano in questo spazio ristretto con porte ai due lati corti. Lo spazio stretto costringe i bambini a usare passaggi corti, girarsi in spazi ridotti e trovare soluzioni creative. Regola aggiuntiva: non si può tornare indietro, si deve sempre procedere in avanti o lateralmente. Variante: riduci il corridoio a 3x20m e guarda come i bambini si adattano da soli. Insegna il gioco in spazio ridotto senza dirlo: i bambini trovano autonomamente le soluzioni ai problemi spaziali che l''ambiente crea, esattamente come in partita vicino alla linea laterale.',
  20, 'tattica', 'pulcini',
  JSON_ARRAY('spazio ridotto', 'passaggio corto', 'creatività', 'gioco', '2v2'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il corridoio stretto' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il quadrato del furbo',
  'Crea un quadrato 8x8m. Dentro 3 attaccanti e 1 difensore. I tre devono fare più passaggi consecutivi possibili senza che il difensore tocchi la palla. Ogni 7 passaggi di fila è un punto. Chi perde la palla per colpa propria diventa il nuovo difensore. Due regole semplici da comunicare ai bambini: dopo aver passato, spostati. E non passare a chi ha il difensore vicino. Variante: riduci il quadrato a 6x6m per alzare la difficoltà e la velocità. Classico esercizio di possesso che funziona anche con i più piccoli perché la struttura è chiarissima e il feedback (si conta ad alta voce) è immediato.',
  20, 'possesso_palla', 'pulcini',
  JSON_ARRAY('3v1', 'passaggio', 'smarcamento', 'possesso', 'quadrato'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il quadrato del furbo' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Palla avvelenata',
  'In uno spazio 12x12m, 5-6 bambini si passano una palla. Regola: chi ha la palla per più di 3 secondi è avvelenato e fa 3 saltelli prima di rientrare. Conta ad alta voce: ''uno, due, tre, avvelenato!''. Non è una punizione, è parte del gioco. Chi rientra dopo i saltelli può ricevere subito. Obiettivo: creare urgenza nel passaggio senza ansia. Variante: riduci a 2 secondi per i più bravi, aumenta a 4 per i più piccoli. Allena la velocità di decisione nel passaggio. Nei Pulcini è spesso lenta perché nessuno li obbliga a pensare in fretta: questo esercizio crea quella pressione in modo divertente.',
  18, 'possesso_palla', 'pulcini',
  JSON_ARRAY('velocità decisione', 'passaggio', 'possesso', 'tempo', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Palla avvelenata' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passa e muoviti',
  'In un rettangolo 12x8m, squadrette da 3. Regola unica: ogni volta che passi devi muoverti di almeno 3 passi prima di poter ricevere di nuovo. Chi riceve non può ripassare a chi è rimasto fermo. Dà feedback positivi quando vedi un buon movimento dopo il passaggio: ''eccolo, bravo, così!''. Variante: aggiungi un difensore passivo che può congelare (toccare la spalla) il bambino che non si è mosso dopo aver passato. Questo crea consapevolezza che il lavoro con la palla non finisce nel momento in cui la lasci. Concetto fondamentale del gioco di squadra che i Pulcini assorbono meglio con regole pratiche che con spiegazioni.',
  20, 'possesso_palla', 'pulcini',
  JSON_ARRAY('movimento senza palla', 'passaggio', 'possesso', 'smarcamento', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passa e muoviti' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '4v2 nel cerchio',
  'Crea un cerchio con coni di circa 8m di diametro. Dentro 4 attaccanti e 2 difensori. I quattro fanno più passaggi possibili senza che i due difensori tocchino palla. Quando un difensore la tocca, chi ha sbagliato il passaggio prende il suo posto. Regola utile: i quattro non possono stare tutti sul bordo, almeno uno deve stare in zona centrale. Variante: riduci il cerchio a 6m per aumentare la difficoltà. Molto efficace per i Pulcini perché la forma circolare rende evidente dove sono gli spazi liberi e incentiva il movimento senza creare confusione su dove andare come accade nei rettangoli.',
  22, 'possesso_palla', 'pulcini',
  JSON_ARRAY('4v2', 'cerchio', 'possesso', 'passaggio', 'smarcamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '4v2 nel cerchio' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Proteggi la tua palla',
  'Ogni bambino ha una palla in uno spazio 10x10m. Obiettivo: conduci la tua palla restando nell''area e allo stesso tempo prova a buttare fuori le palle degli altri con un tocco del piede. Chi perde la palla esce, fa 5 tocchi veloci e rientra. Ultimi 30 secondi: conta quante palle riesci a buttare fuori senza perdere la tua. Variante: gli ultimi 3 rimasti si sfidano in un mini 1v1v1. Lavora su protezione della palla, visione periferica e conduzione sotto pressione simultaneamente: tre aspetti del possesso in un solo esercizio caotico che somiglia molto a ciò che succede in partita.',
  18, 'possesso_palla', 'pulcini',
  JSON_ARRAY('protezione palla', 'visione', 'conduzione', '1v1', 'possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Proteggi la tua palla' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il labirinto vivente',
  'In uno spazio 10x10m, metti 3-4 bambini fermi come ostacoli con le braccia aperte. Gli altri conducono la palla tra questi ostacoli senza toccarli. Chi tocca un ostacolo si ferma 3 secondi. Dopo 1 minuto gli ostacoli si muovono lentamente (come zombi) per alzare la difficoltà. Variante: anche gli ostacoli hanno una palla e seguono le stesse regole: ora tutti si muovono. Allena la capacità di alzare la testa mentre si conduce, il dribbling in spazi stretti e la visione periferica in situazioni caotiche che ricordano una partita vera. La variante zombi piace moltissimo ai bambini di questa età.',
  20, 'possesso_palla', 'pulcini',
  JSON_ARRAY('conduzione', 'visione', 'dribbling', 'spazio ridotto', 'protezione palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il labirinto vivente' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Mantieni e conquista',
  'Campo 8x8m. Due squadre da 2. Ogni squadra ha una palla. Obiettivo doppio: mantieni il possesso della tua palla e cerca di rubare quella degli avversari. Chi controlla entrambe le palle nello stesso momento guadagna un punto. Azzeramento ogni 2 minuti. Variante: una sola palla in campo, 2v2, chi mantiene il possesso per 10 secondi guadagna il punto. Sviluppa la capacità di pensare a difendere e attaccare simultaneamente senza aspettare che sia il turno di uno o dell''altro. Per i Pulcini è molto stimolante perché il gioco ha sempre due obiettivi attivi in contemporanea, il che mantiene alta la concentrazione.',
  22, 'possesso_palla', 'pulcini',
  JSON_ARRAY('possesso', '2v2', 'protezione palla', 'duello', 'conquista'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Mantieni e conquista' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Palla al capitano',
  'In uno spazio 10x8m, due squadre da 3. Ogni squadra ha un capitano posizionato fuori dall''area, sui lati opposti. Per fare punto bisogna passare la palla al proprio capitano. Il capitano non entra in campo, può solo ricevere il passaggio. Dopo ogni punto il capitano cambia. Variante: il capitano deve controllare la palla a terra prima di restituirla ai compagni dentro il campo: si lavora anche sulla qualità del suo primo tocco. Allena la visione verso l''esterno e il passaggio in direzione diversa da quella in cui si è sotto pressione. I Pulcini imparano a cercare la soluzione fuori dall''area di pressing.',
  18, 'possesso_palla', 'pulcini',
  JSON_ARRAY('passaggio', 'visione', 'possesso', 'capitano', 'smarcamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Palla al capitano' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il cerchio rotante',
  '8 bambini formano un cerchio di 6m di diametro, con 2 dentro. I 6 sul bordo si passano la palla velocemente, i 2 dentro cercano di intercettare. Regola extra: ogni 5 passaggi riusciti, un bambino del cerchio deve attraversare l''area scambiandosi con uno dei due interni. Questo crea movimento continuo. Variante: chi intercetta non va dentro, ma chi ha sbagliato il passaggio prende il suo posto. Abbassa la soglia di frustrazione e mantiene l''energia alta. Allena passaggi veloci, visione periferica, comunicazione tra compagni e ritmo di gioco. La variante dello scambio obbligatorio impedisce che i bambini restino troppo fermi sul bordo.',
  20, 'possesso_palla', 'pulcini',
  JSON_ARRAY('cerchio', 'passaggio veloce', 'visione', 'possesso', 'comunicazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il cerchio rotante' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Scambi a catena',
  '5-6 bambini in cerchio con una sola palla. Ogni bambino ha un numero. La catena stabilita: il bambino 1 passa al 3, il 3 al 5, il 5 al 2 e così via. Ognuno sa da dove arriva la palla e dove deve mandarla. Dopo qualche giro si aumenta la velocità. Variante: aggiungi una seconda palla che segue la stessa catena ma parte 2 posizioni dopo. Ora devi gestire di passare una palla e riceverne un''altra quasi contemporaneamente: concentrazione al massimo. Allena timing del passaggio, concentrazione e tecnica base in un contesto che sembra un gioco ma è un allenamento molto efficace al possesso strutturato con senso di responsabilità.',
  20, 'possesso_palla', 'pulcini',
  JSON_ARRAY('passaggio', 'timing', 'concentrazione', 'possesso', 'catena'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Scambi a catena' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Bomba da tre posizioni',
  'Posiziona tre coni a 6m, 8m e 10m dalla porta. I bambini tirano da ciascun cono a rotazione. Dal cono più vicino possono usare qualsiasi piede, dal secondo solo il piede che dici tu, dal terzo solo il piede debole. Obiettivo: non solo segnare, ma calciare in modo corretto: piede d''appoggio di fianco alla palla, testa abbassata, colpo con il collo. Variante: sfida a squadre, chi fa più gol in 5 minuti dalla distanza intermedia vince. Costruisce fiducia nel tiro da varie posizioni e insegna che la tecnica del calcio cambia poco al variare della distanza.',
  18, 'finalizzazione', 'pulcini',
  JSON_ARRAY('tiro', 'collo piede', 'finalizzazione', 'piede debole', 'porta piccola'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Bomba da tre posizioni' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '1v1 col portiere',
  'Il bambino parte da 15m con la palla. Deve condurla fino a un cono a 8m (che simula un difensore) e poi concludere sul portiere. Tu puoi stare al cono e fare resistenza passiva. Obiettivo: aspettare il momento giusto per tirare, non troppo presto (portiere in posizione) ma nemmeno troppo tardi (angolo chiuso). Variante: aggiungi un difensore vero che parte con 2 secondi di ritardo: il bambino deve decidere più velocemente. Allena la lettura del 1v1 contro il portiere, situazione che nei Pulcini capita spesso in partita e che quasi nessuno allena specificatamente.',
  20, 'finalizzazione', 'pulcini',
  JSON_ARRAY('1v1', 'tiro', 'decisione', 'conduzione', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '1v1 col portiere' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Combinazione e conclusione',
  'In coppia, un bambino fa da assistman a 5m lateralmente dalla porta. Il tiratore parte da 12m, arriva al cono centrale (8m dalla porta), riceve il passaggio dall''assistman, controlla e tira. Dopo 5 tiri si scambiano il ruolo. Insegna un concetto per volta: oggi il controllo orientato verso porta, domani l''ampiezza del passaggio. Variante: il tiratore tira di prima se il passaggio arriva bene, senza stop. Combina il fondamentale del passaggio con la conclusione creando già una forma elementare di combinazione. I bambini sentono subito la differenza tra tirare da soli e tirare dopo un passaggio.',
  18, 'finalizzazione', 'pulcini',
  JSON_ARRAY('combinazione', 'passaggio', 'tiro', 'assistenza', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Combinazione e conclusione' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Slalom e bomba in porta',
  'Crea un percorso slalom con 5 coni in 8m. In fondo c''è una porta piccola. Il bambino percorre lo slalom e poi conclude. Tre ripetizioni a testa, poi si siede a guardare. Variante: aggiungi un avversario che parte 2 secondi dopo: il bambino deve sbrigarsi nello slalom per guadagnare tempo per il tiro. Altra variante: l''ultimo cono richiede una finta obbligatoria verso destra prima del tiro. Allena la combinazione conduzione-conclusione, uno dei pattern più frequenti nelle partite dei Pulcini dove si va spesso a rete dopo una conduzione solitaria senza avversari addosso.',
  20, 'finalizzazione', 'pulcini',
  JSON_ARRAY('slalom', 'conduzione', 'tiro', 'finalizzazione', 'coni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Slalom e bomba in porta' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La sfida dei gol',
  'Due porte piccole (coni) ai lati opposti di uno spazio 10x8m. Due bambini si sfidano: hanno ciascuno 3 palloni posizionati fuori campo. A turno entrano con un pallone e cercano di segnare in una delle due porte. Poi tocca all''altro. Chi ha più gol dopo aver usato tutti i palloni vince. Variante: entrambi entrano contemporaneamente con il loro pallone: devono sia attaccare che difendere. Si crea una situazione caotica e divertentissima. Lascia creatività totale al bambino: può tirare come vuole, da dove vuole, purché entri. Ottimo esercizio di finalizzazione libera che rimuove la pressione tecnica e lascia spazio all''istinto.',
  15, 'finalizzazione', 'pulcini',
  JSON_ARRAY('tiro libero', 'porta piccola', 'finalizzazione', '1v1', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La sfida dei gol' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Porta doppia, doppio divertimento',
  'In uno spazio 12x10m ci sono 4 porte piccole (coni), una su ogni lato del rettangolo. Una squadra attacca qualsiasi porta, l''altra difende tutte e 4. Chi attacca fa più punti in 2 minuti. Chi difende ruota i giocatori. L''attaccante deve leggere quale porta è meno presidiata e decidere rapidamente. Variante: l''attaccante guadagna 2 punti se segna nella porta più lontana da lui in quel momento. Allena la decisione rapida su dove tirare e il movimento verso la porta meno controllata: un concetto tattico-tecnico che i Pulcini assorbono senza bisogno di spiegazioni perché il gioco lo rende ovvio.',
  20, 'finalizzazione', 'pulcini',
  JSON_ARRAY('tiro', 'decisione', 'porta piccola', 'finalizzazione', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Porta doppia, doppio divertimento' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro di prima al volo',
  'Tu (o un bambino designato) lanci una palla a rimbalzo verso l''attaccante posizionato a 7m dalla porta. L''attaccante deve colpirla di prima intenzione, senza aspettare che si fermi. Il concetto chiave: il tiro di prima richiede di posizionarsi con anticipo, non di inseguire la palla. Fai molte ripetizioni: 5-6 tiri a testa per tornata. Variante: il bambino riceve di petto se la palla arriva alta, poi la controlla e tira. Allena il controllo ravvicinato e la successiva conclusione. I Pulcini spesso aspettano che la palla si fermi da sola: questo li abitua ad attaccarla invece di subirla.',
  18, 'finalizzazione', 'pulcini',
  JSON_ARRAY('tiro', 'prima intenzione', 'timing', 'finalizzazione', 'reazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro di prima al volo' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cross basso e tap-in',
  'Dividi i bambini in due file: una sul lato (crossers) e una davanti alla porta (attaccanti). Il crosser conduce la palla fino alla linea laterale a 6m dalla porta e fa un passaggio basso verso il dischetto dell''area piccola. L''attaccante arriva di corsa e colpisce di prima. Non è un cross alto: è un passaggio basso che richiede solo di arrivare al posto giusto al momento giusto. Variante: aggiungi un portiere che cerca di anticipare il passaggio. Allena il movimento dentro l''area, il timing dell''inserimento e la coordinazione occhio-palla in movimento, tutti aspetti che nelle partite dei Pulcini fanno spesso la differenza.',
  20, 'finalizzazione', 'pulcini',
  JSON_ARRAY('inserimento', 'cross', 'tap-in', 'timing', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cross basso e tap-in' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '2v1 e gol',
  'Due attaccanti contro un difensore verso una porta con portiere. Partono a 15m. L''attaccante con la palla sceglie: vai da solo o cerchi il compagno? Il difensore si posiziona togliendo la linea di passaggio o pressando chi ha la palla. Spiega con esempi pratici: ''guarda dove sta il difensore, da quella parte c''è spazio''. Rotazione veloce: dopo ogni azione cambiano i ruoli. Variante: il secondo attaccante parte arretrato e deve fare uno scatto per inserirsi in area. Lavora anche sul timing del movimento senza palla in zona di conclusione. Situazione che ricorre spesso in partita e che vale la pena allenare esplicitamente.',
  22, 'finalizzazione', 'pulcini',
  JSON_ARRAY('2v1', 'finalizzazione', 'decisione', 'inserimento', 'tiro'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '2v1 e gol' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il rigore degli eroi',
  'Gara di calci di rigore con regole speciali. Primo turno: rigore normale. Secondo turno: piede debole obbligatorio. Terzo turno: corsa di avvicinamento da sinistra invece che centrale. Quarto turno: stop su lancio tuo e poi rigore. Il portiere cambia ogni turno. Classifica finale: chi fa più gol? Variante: sfida 3v3 dove ogni bambino batte un rigore e il team con più gol vince. I bambini adorano i rigori: sfruttalo per lavorare sulla tecnica del tiro in modo motivante. Le varianti di avvicinamento riducono l''ansia da prestazione perché cambiano la situazione da quella troppo ''seria'' del rigore standard.',
  15, 'finalizzazione', 'pulcini',
  JSON_ARRAY('rigore', 'tiro', 'piede debole', 'finalizzazione', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il rigore degli eroi' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Percorso dell''astronauta',
  'Crea un circuito con 5 stazioni usando coni, cerchi a terra e paletti. Stazione 1: saltelli dentro e fuori da una serie di cerchi. Stazione 2: slalom laterale tra 4 coni. Stazione 3: saltello a piedi uniti sopra un cono basso. Stazione 4: sprint di 5m tra due coni. Stazione 5: rotolamento su erba e rialzata veloce. I bambini girano le stazioni ogni 45 secondi al fischio. Variante: aggiungi una palla alla stazione 1 da tenere in mano durante i saltelli. Circuito coordinativo che allena ogni aspetto motorio in modo breve e stimolante, perfetto per la capacità di attenzione dei Pulcini che si esaurisce in fretta se la stessa cosa dura troppo.',
  15, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('circuito', 'coordinazione', 'saltelli', 'agilità', 'motricità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Percorso dell''astronauta' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il polpo salta tutto',
  'Senza pallone. Disponi a terra cerchi colorati (o coni distesi) in linea a distanze variabili (30cm, 50cm, 80cm). I bambini saltano da un cerchio all''altro come polpi: a piedi uniti nei cerchi stretti, su un piede solo nei cerchi larghi. Chiami variazioni in corsa: ''su quella gamba sola!'' o ''salta il prossimo!''. Variante: sfida a coppie, uno esegue e l''altro conta i saltelli riusciti senza perdere equilibrio. Allena coordinazione piede-occhio, equilibrio monopodalico e coordinazione dinamica in modo completamente ludico senza nessuna componente tecnica calcistica. Ottimo da usare a fine allenamento quando l''attenzione cala.',
  12, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('saltelli', 'equilibrio', 'coordinazione', 'motricità', 'ludico'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il polpo salta tutto' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Equilibrio da campione',
  'In cerchio, ogni bambino su un piede solo. Chiami comandi: ''apri le braccia'', ''chiudi gli occhi'', ''gira la testa''. Chi perde l''equilibrio e tocca terra col secondo piede fa un saltello e riprende. Poi si cambia piede. Seconda fase: cammino in equilibrio su una linea a terra. Variante finale: in coppia, uno tenta di far perdere l''equilibrio all''altro con piccoli tocchi sulle spalle mentre lui è in equilibrio monopodalico. Allena propriocezione, equilibrio posturale e controllo corporeo: fondamentali motori che migliorano la stabilità in corsa, nei cambi di direzione e nelle situazioni di duello fisico.',
  12, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('equilibrio', 'propriocezione', 'coordinazione', 'motricità', 'postura'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Equilibrio da campione' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corsa dei granchi',
  'Tutti i bambini in posizione da granchio (seduti, mani a terra dietro, piedi a terra, pancia verso l''alto). Devono spostarsi così da una linea all''altra a 8m di distanza. Gara: chi arriva prima senza mettere le ginocchia a terra? Variante 1: spostamento laterale da granchi. Variante 2: il granchio trasporta un pallone sul ventre senza farlo cadere. Variante 3: granchi contro orsi (quadrupedia frontale), stesso percorso ma in posizione opposta. Divertentissimo: sviluppa forza delle braccia, coordinazione generale e coscienza corporea in modo assolutamente ludico. I bambini ridono, si divertono e si stancano senza accorgersene.',
  10, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('forza braccia', 'coordinazione', 'motricità', 'ludico', 'schema corporeo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corsa dei granchi' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il serpente veloce',
  'In fila indiana, i bambini tengono le spalle del compagno davanti. Il serpente si muove guidato dalla testa (il primo della fila) e segue tutti i comandi: avanzare, girare a destra, sinistra, sedersi tutti insieme, alzarsi. Dopo 1 minuto la testa va in coda e il nuovo primo guida. Variante con pallone: ogni bambino ha una palla e deve mantenerla mentre segue il compagno davanti. La sfida è non perdere la palla e non staccarsi dalla fila. Allena coordinazione di gruppo, ascolto dei comandi, equilibrio in movimento e capacità di adattarsi ai cambi repentini di direzione imposti da qualcun altro.',
  15, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('coordinazione', 'ascolto', 'gruppo', 'agilità', 'motricità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il serpente veloce' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tocca e scappa',
  'Posiziona 6 coni di 3 colori diversi (2 rossi, 2 gialli, 2 blu) sparsi nell''area 10x10m. I bambini in piedi al centro. Chiami un colore e tutti devono correre a toccare quel cono il più veloce possibile, poi tornano al centro. Chi arriva per ultimo fa una flessione divertente (tipo robot). Variante: chiami due colori in sequenza rapida. Variante avanzata: mano sinistra per il rosso, mano destra per il giallo, piede per il blu. Lavora su reazione allo stimolo visivo-uditivo, velocità di accelerazione e coordinazione mente-corpo in modo completamente ludico. La variante avanzata aggiunge la componente di discriminazione laterale.',
  12, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('reazione', 'velocità', 'coordinazione', 'agilità', 'coni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tocca e scappa' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Andature nel bosco',
  'I bambini camminano liberamente come se fossero in un bosco. Tu narri la storia: ''camminate normalmente... ora arriva il fango, alzate le ginocchia più in alto!... ora c''è l''acqua, saltellate!... ora il vento forte, piegatevi in avanti!... ora si sale sul monte, ginocchia altissime e braccia che pompano!''. Variante: aggiungi una palla da portare in mano durante le andature. Questo warm-up narrativo cattura l''attenzione dei Pulcini meglio delle andature nominate tecnicamente. Lavora su schema corporeo, coordinazione e linguaggio motorio in modo integrato. I bambini si muovono più e meglio quando c''è una storia da seguire.',
  15, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('andature', 'schema corporeo', 'coordinazione', 'motricità', 'ludico'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Andature nel bosco' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il salto della rana',
  'Ogni bambino ha una palla. Si accovaccia tenendola tra le mani. Al via fa salti da rana (balzi a gambe larghe) per raggiungere un cono a 8m di distanza, poi torna correndo. Variante 1: salto della rana portando la palla in equilibrio sulla testa. Variante 2: due rane si sfidano in gara. Variante 3: dopo ogni salto, prima di rialzarsi, il bambino fa 2 tocchi veloci sulla palla con le mani. Allena forza delle gambe, coordinazione nel saltellare portando un oggetto e resistenza muscolare della zona inferiore in modo completamente giocoso. Ottimo anche come recupero attivo tra esercizi più intensi.',
  12, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('saltelli', 'forza gambe', 'coordinazione', 'motricità', 'ludico'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il salto della rana' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuito dei supereroi',
  'Crea 4 stazioni ispirate a supereroi. Stazione Flash: sprint di 10m andata e ritorno. Stazione Spiderman: camminata mani e piedi (quadrupedia). Stazione Capitan America: salti laterali su una linea a terra. Stazione Hulk: saltelli a gambe larghe con pallone in mano. Ogni stazione dura 40 secondi, poi cambio al fischio. Fai 2 giri completi. Variante: ogni bambino sceglie il suo supereroe per l''intera stazione e fa il verso o il grido del personaggio. L''identità del supereroe aumenta la motivazione e riduce la fatica percepita: i bambini danno di più quando interpretano un personaggio che quando fanno semplicemente un esercizio.',
  18, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('circuito', 'agilità', 'coordinazione', 'forza', 'motricità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuito dei supereroi' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stretching degli animali',
  'Stretching finale in formato ludico. Chiami le pose con nomi divertenti: il gatto che dorme (schiena arcuata a terra), l''albero del gol (equilibrio su un piede con braccia alzate per 20 secondi), il cobra del campo (busto sollevato da terra sulle braccia), la tartaruga (rannicchiato), il calciatore volante (piega in avanti toccando le punte dei piedi). Ogni posa dura 20-30 secondi. Variante: crea un concorso di immobilità: chi resta più a lungo in posa senza muoversi vince. I bambini si spingono a lungo più di quanto farebbero con un semplice ''tieni la posizione''. Chiude ogni seduta con mobilità e calmata graduale.',
  12, 'atletica_fisico', 'pulcini',
  JSON_ARRAY('stretching', 'mobilità', 'flessibilità', 'defaticamento', 'ludico'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stretching degli animali' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Re del castello',
  'Crea un piccolo castello con 4 coni in quadrato 2x2m. Il portiere sta dentro e lo difende: tu (o i compagni a turno) tiri palloni a terra cercando di abbattere i coni. Il portiere para, blocca e devia. Non si usano tiri forti: obiettivo è la posizione corretta dei piedi e delle mani, non la potenza. Ogni assalto dura 60 secondi, poi si scambia con un altro bambino. Variante: due portieri difendono il castello insieme, comunicando su chi para cosa. Introduce posizione di base, copertura dello spazio e senso del campo senza mai separare il portiere dal gruppo né renderlo uno spettatore passivo durante la sessione.',
  18, 'portieri', 'pulcini',
  JSON_ARRAY('posizione base', 'parata', 'porta piccola', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Re del castello' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Para tutto!',
  'Tu (o un bambino designato) tiri da 3-5m di distanza, lentamente. Il portiere blocca con la tecnica corretta: palla alta = presa sopra la testa, palla media = presa al petto, palla bassa = inginocchiarsi e bloccare con le mani davanti. Non si chiede precisione nei tiri: si lavora sulla risposta del portiere. 6-8 tiri per turno, poi cambio. Variante: tiri da angolazioni diverse (angolo destro, sinistro, centrale) per far capire l''importanza del posizionamento preventivo. I bambini scoprono che muoversi prima del tiro è più facile che muoversi dopo: primo concetto chiave del ruolo del portiere.',
  20, 'portieri', 'pulcini',
  JSON_ARRAY('parata', 'presa', 'posizionamento', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Para tutto!' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il gatto reattivo',
  'Il portiere in piedi tra due coni a 2m di distanza. Tu sei a 4m e tieni due palle, una per mano. Ne lanci una a sorpresa verso destra o sinistra. Il portiere deve allungarsi (o buttarsi se necessario) per prendere o deviare prima che tocchi terra. Inizia lentamente, poi aumenta il ritmo. Variante: usa tre palle di colori diversi e assegna una direzione a ciascun colore: il portiere impara a leggere il segnale visivo prima del lancio invece di reagire dopo. Allena reattività, coordinazione occhio-mano e la base del movimento laterale in modo giocoso. Fondamentale che tutti i bambini dovrebbero provare, non solo chi fa il portiere.',
  18, 'portieri', 'pulcini',
  JSON_ARRAY('reattività', 'tuffo', 'laterale', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il gatto reattivo' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Mani di ferro',
  'In cerchio con 3-4 bambini, il portiere al centro. I compagni si passano la palla con le mani (stile basket) e a sorpresa la lanciano verso il portiere. Lui deve bloccarla con una presa pulita, senza farla cadere, e restituirla al lanciatore. Prima fase: lanci frontali, lenti. Seconda fase: lanci da angoli diversi. Terza fase: lanci in sequenza rapida. Variante: il portiere ha 1 minuto per bloccare più palle possibili senza farne cadere nessuna. Tieni il conto. Lavora sulla presa sicura, sul posizionamento delle mani e sulla concentrazione nel gioco aereo. Esercizio semplice che si può fare anche senza porta e senza tiri, ideale quando lo spazio è ridotto.',
  15, 'portieri', 'pulcini',
  JSON_ARRAY('presa', 'mani', 'concentrazione', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Mani di ferro' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Dove mi metto?',
  'Il portiere tra i pali (o tra due coni). Ti posizioni in vari punti del campo (angolo destro, angolo sinistro, centro) e lui deve spostarsi nel punto ottimale per coprire il tiro da quella posizione, prima ancora che tu tiri. Chiedi: ''sei pronto? Da qui dove devi stare?'' e aspetta che si posizioni. Poi tiri dolcemente. Variante: metti un attaccante che si muove con la palla senza tirare e il portiere lo segue con la posizione. Non parlare di angolo o bisettrice: dì solo ''stai dove puoi fermare la palla più facilmente''. Il portiere impara la copertura dell''angolo in modo istintivo e visivo, non attraverso un concetto geometrico astratto.',
  18, 'portieri', 'pulcini',
  JSON_ARRAY('posizionamento', 'copertura angolo', 'uscita', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Dove mi metto?' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Portiere jolly',
  '3v3 in uno spazio 15x10m con porte piccole. C''è un portiere jolly che gioca sempre con la squadra in possesso, sui lati del campo. Può ricevere il passaggio ma non segnare: deve sempre restituire ai compagni in campo. Quando la palla cambia squadra, il jolly cambia lato. Variante: il jolly può entrare in campo solo in zona offensiva per partecipare a un''azione d''attacco. Perfetto per i Pulcini: il portiere è sempre in gioco, fa molti tocchi, capisce il gioco di squadra e migliora primo tocco e passaggio senza la pressione di dover parare tutto il tempo. Il ruolo jolly abbassa l''ansia e aumenta l''engagement.',
  20, 'portieri', 'pulcini',
  JSON_ARRAY('portiere in gioco', 'tocco', 'passaggio', 'gioco squadra', 'jolly'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Portiere jolly' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Para e riparti',
  'Il portiere para un tiro dolce tuo e deve immediatamente distribuire la palla con le mani (o i piedi, a scelta) verso un cono target a 8m di distanza. La distribuzione deve essere precisa, non solo la parata. Sequenze da 5 para-distribuzioni, poi cambio. Variante: metti due coni target, uno a destra e uno a sinistra, e indica prima del tiro quello su cui distribuire: il portiere deve parare e ricordare dove mandare la palla. Lavora su due fondamentali in sequenza che in partita accadono sempre insieme: la parata non è mai il momento finale, è l''inizio di una nuova azione. Abitudine da costruire fin da piccoli.',
  20, 'portieri', 'pulcini',
  JSON_ARRAY('parata', 'distribuzione', 'rilancio', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Para e riparti' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La barriera mobile',
  'Il portiere si posiziona tra due coni distanti 4m. Ti metti a 6m con una palla che sposti lentamente a destra e sinistra senza tirare. Il portiere deve seguire il movimento aggiornando la propria posizione: quando la palla va a destra, scivola a destra restando con piedi larghi e ginocchia piegate. Poi, quando decidi, tiri dolcemente. Variante: usa un paletto o una bacchetta al posto della palla per i movimenti preparatori, così il portiere non anticipa il tiro. Allena lo scivolamento laterale dei piedi, la postura corretta e il timing del movimento. I Pulcini tendono a saltare o a irrigidirsi: questo li abitua a muoversi fluido.',
  18, 'portieri', 'pulcini',
  JSON_ARRAY('scivolamento laterale', 'postura', 'timing', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La barriera mobile' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il tuffo del felino',
  'Su erba morbida (o tappetino), il portiere in posizione di base. Sei a 3m e fai rimbalzare la palla a destra o sinistra. Il portiere si allunga (non tuffa subito: prima si allunga, poi se serve si butta) per prendere o deviare. Inizia solo sul lato forte, poi solo sul debole, poi misto. Variante: il portiere parte seduto a gambe incrociate e deve alzarsi, reagire e allungarsi tutto in uno. Allena il tuffo elementare, la tecnica di caduta sicura e la reattività in modo progressivo. Non accelerare troppo la difficoltà: meglio 20 ripetizioni ben eseguite a terra morbida che 5 tuffi brutti su cemento. La tecnica del tuffo si forma adesso.',
  22, 'portieri', 'pulcini',
  JSON_ARRAY('tuffo', 'caduta', 'reattività', 'fondamentali', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il tuffo del felino' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il portiere dei campioni',
  'Partita libera 3v3 con portieri veri in porta. Tu fischi ogni volta che il portiere fa qualcosa di buono (posizionamento corretto, presa pulita, lancio preciso) e lo celebri ad alta voce: ''hai visto come si è messo? Da portiere vero!''. Obiettivo: il portiere si sente parte del gioco, non separato. Variante: regola speciale per 5 minuti, un gol vale 2 punti ma se nasce da una distribuzione del portiere ne vale 3. Questo incentiva i compagni a valorizzare il portiere e lui a gestire la palla con sicurezza. Chiude la sessione con il portiere protagonista invece che semplice difensore della porta, ruolo che a questa età rischia di sembrare meno divertente degli altri.',
  20, 'portieri', 'pulcini',
  JSON_ARRAY('partita', 'portiere in gioco', 'distribuzione', 'fondamentali', 'gioco squadra'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il portiere dei campioni' AND eta_leva = 'pulcini' AND ufficiale_myvivaio = TRUE
);
`;


export const ESORDIENTI_SEED_SQL = `
-- ═══════════════════════════════════════════════════════════════════════════
-- MyVivaio — Sessioni Ufficiali Categoria ESORDIENTI (U11/U12)
-- File:    20260521_sessioni_ufficiali_esordienti.sql
-- Totale:  70 sessioni · 10 per ciascuna delle 7 categorie
-- Data:    2026-05-21
-- Autore:  MyVivaio Editorial Team
-- Round:   2 di N (Round 1 = Pulcini, già caricato)
-- ───────────────────────────────────────────────────────────────────────────
-- NOTA: ALTER TABLE mister_id INT NULL già eseguito nel Round 1 (Pulcini).
--       Non ripetuto qui.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── IDEMPOTENZA ────────────────────────────────────────────────────────────
-- Ogni INSERT usa SELECT … WHERE NOT EXISTS su (titolo, eta_leva, ufficiale_myvivaio).
-- Puoi eseguire questo script più volte senza creare duplicati.
-- ─────────────────────────────────────────────────────────────────────────────


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: riscaldamento (10 sessioni · 12-18 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Giro del campo con variazioni',
  'Fai partire i ragazzi in un giro del campo 30x20m in fila indiana, ognuno con la palla ai piedi. Il primo detta il ritmo. Al tuo fischio cambiano modalità: un fischio = lento col pallone vicino al piede, due fischi = sprint con palla portata largo, tre fischi = stop con suola e ripartenza in direzione inversa. Alza la frequenza dei cambi gradualmente. Variante: il capofila diventa il mister per un giro e sceglie lui il ritmo e le variazioni. Gli Esordienti capiscono la differenza tra conduzione lenta di mantenimento e conduzione veloce di progressione: un concetto che in partita usano spesso senza saperlo nominare.',
  15, 'riscaldamento', 'esordienti',
  JSON_ARRAY('conduzione', 'cambio ritmo', 'riscaldamento', 'variazioni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Giro del campo con variazioni' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Ruba bandiera a squadre',
  'In un''area 25x25m, ogni giocatore ha una codina nei pantaloncini e una palla ai piedi. Forma due squadre con codine di colori diversi. Obiettivo: rubare le codine degli avversari proteggendo la propria, senza mai perdere la palla. Chi perde la coda fa 5 tocchi veloci sul pallone e rientra subito. Girate da 90 secondi poi 20 secondi di pausa. Variante: vince la squadra che ha rubato più codine agli avversari in 2 minuti. La versione a squadre aggiunge strategia e cooperazione che gli Esordienti sanno gestire: si inizia a scegliere chi attaccare e si comunica con i compagni. Più intenso rispetto alla versione individuale Pulcini.',
  15, 'riscaldamento', 'esordienti',
  JSON_ARRAY('codine', 'conduzione', 'protezione palla', 'riscaldamento', 'squadra'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Ruba bandiera a squadre' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sprint ai coni numerati',
  'Posiziona 6 coni numerati da 1 a 6 in un''area 20x20m in modo non geometrico. I giocatori al centro, ognuno con la palla. Chiami un numero e tutti scattano verso quel cono palla al piede, lo toccano e tornano al centro. Chi arriva per ultimo fa 5 tocchi veloci sul posto. Variante: chiami due numeri in rapida successione, i giocatori vanno al primo poi al secondo prima di tornare. Aggiungi poi una regola colore: cono rosso = sprint, cono giallo = corsa laterale, cono blu = corsa all''indietro. Allena reazione, orientamento spaziale e cambio tipo di corsa. La componente cognitiva (memorizzare la sequenza) è più alta rispetto ai Pulcini, adatta agli Esordienti.',
  12, 'riscaldamento', 'esordienti',
  JSON_ARRAY('sprint', 'reazione', 'orientamento', 'riscaldamento', 'coni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sprint ai coni numerati' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressione a coppie con pallone',
  'In coppia in uno spazio 20x20m, uno conduce la palla e l''altro lo segue a distanza ravvicinata cercando di toccarlo (non di rubare la palla). Chi conduce deve usare il corpo e cambiare direzione per tenere il difensore lontano. Cambio ruoli ogni 40 secondi. Variante: lo spazio si restringe a 5x5m: il difensore può coprire meglio e l''attaccante è costretto a usare veramente il corpo per schermare. Ottimo per riscaldarsi lavorando su un concetto tecnico reale: proteggere la palla sotto pressione stretta è una delle abilità più richieste agli Esordienti, specialmente in zona di rifinitura dove gli spazi si restringono.',
  14, 'riscaldamento', 'esordienti',
  JSON_ARRAY('protezione palla', 'pressing', 'conduzione', 'riscaldamento', 'coppia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressione a coppie con pallone' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il triangolo infinito',
  'Tre giocatori ai vertici di un triangolo con coni 8m per lato. Uno passa al secondo, il secondo al terzo e così via. Regola: appena passi, scatti verso un altro vertice libero. Il triangolo si sposta continuamente nello spazio senza vertici fissi. Variante: aggiungi un difensore al centro che può intercettare. Il triangolo deve muoversi più velocemente di lui. Questo esercizio prepara fisicamente e mentalmente alla logica del gioco in triangolo, uno dei fondamentali del calcio a 7 degli Esordienti. La comunicazione diventa necessaria perché i movimenti si sovrappongono e senza coordinarsi il triangolo si rompe.',
  15, 'riscaldamento', 'esordienti',
  JSON_ARRAY('triangolo', 'passaggio', 'movimento', 'riscaldamento', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il triangolo infinito' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Riscaldamento a specchio',
  'In coppia a 3m di distanza, uno è il leader e l''altro è lo specchio. Il leader si muove liberamente: skip, saltelli, cambi di direzione, passi laterali. Lo specchio replica i movimenti in tempo reale. Dopo 45 secondi si scambiano. Seconda fase: stessa cosa ma entrambi con la palla ai piedi, il leader conduce e lo specchio replica. Variante finale: entrambi conducono verso un cono a 10m l''uno di fronte all''altro cercando di sincronizzarsi. Allena coordinazione dinamica, lettura del movimento altrui e prontezza reattiva. Ottimo prima di una sessione tattica perché attiva già la comunicazione non verbale tra compagni: gli Esordienti la sviluppano bene in questo formato.',
  14, 'riscaldamento', 'esordienti',
  JSON_ARRAY('specchio', 'reazione', 'coordinazione', 'riscaldamento', 'coppia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Riscaldamento a specchio' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rombo di passaggi in movimento',
  '4 giocatori ai vertici di un rombo 10x10m, uno ha la palla. Passano in senso orario: appena passi, scatti verso il vertice successivo nel senso del passaggio. Tutti si muovono sempre. Fai girare 2 minuti, poi inverti il senso. Variante: ogni tre giri il giocatore con palla può scegliere di cambiare direzione: chi riceve deve leggere il cambio e adattarsi. Allena il passaggio in movimento, il timing della corsa verso la nuova posizione e la lettura collettiva del senso del gioco. È più dinamico del triangolo e si presta bene come riscaldamento attivante prima di una sessione tecnica o di possesso.',
  15, 'riscaldamento', 'esordienti',
  JSON_ARRAY('rombo', 'passaggio', 'movimento', 'riscaldamento', 'timing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rombo di passaggi in movimento' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Zona libera 4v4 senza porte',
  'Su un campo 30x20m, due squadre da 4 giocano liberamente senza porte. Per fare punto bisogna raggiungere la linea di fondo avversaria con la palla al piede. Non si può uscire dal campo. Durata: 8 minuti. Variante: aggiungi due porte piccole nella zona centrale che valgono 2 punti se la palla ci passa attraverso. Questo warm-up attiva tutte le componenti del gioco in modo naturale: non serve spiegare nulla, i ragazzi si scaldano già pensando come una squadra. Gli Esordienti gestiscono bene il formato senza porte perché sviluppano soluzioni creative per avanzare che non dipendono da una singola conclusione.',
  18, 'riscaldamento', 'esordienti',
  JSON_ARRAY('4v4', 'gioco libero', 'riscaldamento', 'attivazione', 'campo grande'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Zona libera 4v4 senza porte' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passaggi incrociati in corsa',
  'Due file di giocatori ai lati opposti di un''area 25x15m, ognuna con i propri palloni. Il primo di una fila parte a condurre verso la fila opposta, il primo dell''altra fila parte contemporaneamente in direzione incrociata. A metà si passano la palla l''uno all''altro e continuano verso la fila opposta, mettendosi in coda. Variante: i due si incrociano senza passarsi la palla ma facendo una finta di corpo l''uno verso l''altro. Allena il timing del passaggio in corsa, la comunicazione non verbale e il senso dello spazio condiviso. Classico esercizio da riscaldamento tecnico usato nelle squadre giovanili professionali, proporzionato all''età Esordienti.',
  15, 'riscaldamento', 'esordienti',
  JSON_ARRAY('passaggio', 'corsa', 'incrociato', 'riscaldamento', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passaggi incrociati in corsa' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione con palla in mano',
  'Riscaldamento attivo con la palla tenuta in mano. I giocatori camminano per il campo e a ogni tuo segnale eseguono un''azione: lancio in alto e presa, rimbalzo a terra e presa al volo, lancio al compagno più vicino. Intercala con andature dinamiche: skip basso, laterale, cammino all''indietro, slancio frontale della gamba. Variante: coppie, uno lancia in alto e l''altro corre sotto per prenderla al volo. Abbina a mobilità delle anche: circonduzione, oscillazione frontale, slancio laterale. Ottimo come primo riscaldamento prima di atletica o portieri, alternativo alla solita corsa in cerchio che gli Esordienti trovano subito noiosa.',
  12, 'riscaldamento', 'esordienti',
  JSON_ARRAY('mobilità', 'attivazione', 'dinamico', 'riscaldamento', 'andature'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione con palla in mano' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tecnica_individuale (10 sessioni · 18-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Slalom con cambio lato',
  'Crea un percorso slalom con 8 coni distanziati 1,5m su uno spazio 3x15m. All''andata, il giocatore conduce con l''esterno ai coni dispari e con l''interno ai coni pari, alternando a ogni paletto. Al ritorno inverte la logica. Obiettivo: palla sotto il ginocchio, mai oltre 70cm dal piede. Cronometra e sfida il record personale. Variante avanzata: ai coni dispari fai uno stop con la suola, ai coni pari riparti senza fermarti. L''alternanza piede-piede riprogramma la coordinazione del giocatore che tende a usare sempre lo stesso piede: problema molto comune negli Esordienti che nessuno ha mai corretto durante gli anni Pulcini.',
  20, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('slalom', 'conduzione', 'alternanza piede', 'tecnica', 'coordinazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Slalom con cambio lato' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stop orientato su passaggio mosso',
  'In coppia a 10m di distanza, uno passa la palla rotolando leggermente spostata a destra o sinistra rispetto al ricevitore. Il ricevitore si muove verso la palla, la ferma col primo tocco orientandola nella direzione opposta al passante e conduce per 5m. Il primo tocco deve già portarla dove si vuole andare, non solo fermarla. Dopo 5 ripetizioni si scambiano. Variante: il passante indica la direzione (destra o sinistra) subito prima di passare. Lavora sul controllo direzionale che per gli Esordienti è ancora grezzo: l''istinto è fermare la palla, l''obiettivo acquisito è spostarsi col primo tocco. Fondamentale per guadagnare tempo e spazio in partita.',
  22, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('stop orientato', 'controllo', 'ricezione', 'primo tocco', 'orientamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stop orientato su passaggio mosso' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il muro tecnico a velocità',
  'A 3m da un muro o recinzione, il giocatore calcia con l''interno del piede, aspetta il rimbalzo e ribatte subito. Obiettivo: massimo numero di tocchi puliti in 30 secondi. Primo turno: libero. Secondo: solo piede sinistro. Terzo: alternare destro-sinistro. Quarto: stop al primo tocco, ribatte al secondo. Variante: il mister varia la distanza dal muro (2m, 4m, 6m) e il giocatore si adatta. Allena timing, tecnica del passaggio piatto, controllo del rimbalzo e velocità di esecuzione. Il muro è un alleato fondamentale per il lavoro individuale e spesso sotto-utilizzato nelle sedute degli Esordienti rispetto al lavoro in coppia.',
  20, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('muro', 'passaggio', 'prima intenzione', 'rimbalzo', 'velocità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il muro tecnico a velocità' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '1v1 in corridoio stretto',
  'Crea un corridoio 6x15m. L''attaccante parte da un''estremità con la palla, il difensore da 4m di distanza. L''attaccante deve superare il difensore e toccare la linea di fondo. Il difensore può mettere il piede sulla palla senza fare tackle duro. Se dopo 5 secondi nessuno ha prevalso, il mister fischia e si riparte. Rotazione veloce. Variante: il corridoio si restringe a 4m: il difensore copre meglio ma l''attaccante deve essere più preciso nella finta. Questo formato obbliga a fare una finta vera perché non c''è spazio per aggirare il difensore. La finta deve funzionare: non si può semplicemente correre di lato.',
  22, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('1v1', 'corridoio', 'dribbling', 'finta', 'difesa'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '1v1 in corridoio stretto' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Prima intenzione a tre',
  'Tre giocatori in fila distanziati 7m. Il primo passa al centrale, il centrale ribatte di prima al terzo, il terzo controlla e passa di nuovo al centrale. Il centrale fa solo tocchi di prima, non si ferma mai. Dopo 2 minuti il centrale ruota. Variante: i tre si spostano lentamente verso sinistra mentre eseguono, la linea si muove di 20m poi torna. Allena il tocco di prima sotto pressione temporale, il posizionamento del piede d''appoggio e la prontezza mentale del centrale che deve leggere la traiettoria in arrivo mentre già prepara il successivo tocco. Fondamentale per gli Esordienti che iniziano ad apprezzare il gioco veloce.',
  20, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('prima intenzione', 'passaggio veloce', 'trio', 'tecnica', 'timing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Prima intenzione a tre' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpo di testa piatto su lancio',
  'Lancia palloni alti con parabola morbida verso il giocatore a 5m. Deve colpire con la fronte (non con la sommità della testa), ginocchia leggermente piegate, occhi aperti fino all''impatto. Fai 5 lanci a persona, poi riposi. Variante: dopo il colpo di testa il giocatore fa uno sprint di 5m verso un cono. Il colpo di testa va insegnato con palloni leggeri e traiettorie basse. L''errore più comune è colpire con la sommità per paura della palla in faccia: correggerlo ora evita schemi scorretti difficili da rimuovere dopo. Per gli Esordienti è il momento giusto per introdurre questo fondamentale che sarà determinante nelle categorie successive.',
  20, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('colpo di testa', 'fronte', 'fondamentale', 'tecnica', 'parabola'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpo di testa piatto su lancio' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Conduzione con accelerazione programmata',
  'In uno spazio 10x30m, il giocatore conduce a ritmo normale per 10m, poi al tuo fischio accelera al massimo per 5m tenendo la palla vicina, poi torna al ritmo normale. Il cambio di ritmo deve essere netto, non graduale. 4 ripetizioni per giocatore poi pausa. Variante: il segnale di accelerazione è visivo (alzi la mano) invece che sonoro: il giocatore deve tenere la testa alzata mentre conduce per vedere il segnale. Allena il cambio di ritmo in conduzione che è uno dei movimenti più efficaci per saltare un difensore: funziona meglio di molte finte perché è imprevedibile e richiede solo coordinazione e coraggio.',
  22, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('conduzione', 'accelerazione', 'cambio ritmo', 'testa alzata', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Conduzione con accelerazione programmata' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stop di petto orientato',
  'Tu (o un compagno) lanci la palla con le mani in modo che cada verso il petto del giocatore a 8m. Deve ricevere di petto ammortizzando col torso e orientare subito il controllo verso un cono specifico (destra o sinistra). Non si aspetta che la palla si fermi: il petto la ammortizza e la orienta già. 6 lanci per giocatore, 3 per lato. Variante: dopo il controllo di petto aggiungi un passaggio immediato verso un terzo giocatore a 8m. Il controllo di petto è tecnica reale per gli Esordienti: arrivano molti palloni dalle rimesse laterali, dai lanci del portiere, dalle battute. Chi lo sa fare acquista mezzo secondo di vantaggio su tutti.',
  20, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('petto', 'controllo', 'ricezione', 'orientamento', 'ammortizzamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stop di petto orientato' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il circuito tecnico completo',
  'Crea 4 stazioni in un''area 20x20m: stazione 1 = slalom 6 coni con stop finale, stazione 2 = passaggio al muro 5 volte con rimbalzo controllato, stazione 3 = conduzione con cambio direzione su segnale, stazione 4 = stop orientato su passaggio del compagno. Ogni stazione dura 90 secondi, poi cambio al fischio. Fai 2 giri completi. Il compagno alla stazione 4 fa la palla e si alternano ogni giro. Variante: nel secondo giro aggiungi l''obbligo del piede debole a ogni stazione. Il circuito tecnico è utile per lavorare su più fondamentali in poco tempo tenendo tutti occupati. Riduce i tempi morti che sono il nemico della concentrazione degli Esordienti.',
  25, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('circuito', 'stazioni', 'multi-skill', 'piede debole', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il circuito tecnico completo' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il doppio passo verso la porta',
  'Con un difensore passivo a 5m, l''attaccante si avvicina lentamente con la palla ed esegue il doppio passo: due passi veloci simulati verso destra poi accelerazione vera verso sinistra (o viceversa). Dopo 5m di conduzione libera si ferma e torna. 6 ripetizioni per lato, poi si scambiano. Variante: il difensore dopo 3 turni inizia a muoversi leggermente cercando di leggere la finta: l''attaccante adatta il timing. Il doppio passo è una delle finte più efficaci per gli Esordienti perché richiede coordinazione piuttosto che velocità pura, ed è applicabile in situazioni reali di partita senza bisogno di spazio extra che spesso non si ha.',
  22, 'tecnica_individuale', 'esordienti',
  JSON_ARRAY('doppio passo', 'finta', '1v1', 'cambio direzione', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il doppio passo verso la porta' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (10 sessioni · 25-35 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Giocare largo: ampiezza in attacco',
  'Campo 35x25m, 5v5 più portieri. Segnala due corsie laterali di 5m con coni. Per segnare bisogna che la palla sia passata almeno una volta in una corsia laterale durante l''azione. I giocatori capiscono subito che devono usare gli spazi ai lati. Fai giocare 4 minuti, poi fermati e chiedi perché è importante andare largo. Variante: chi segna dopo aver usato entrambe le corsie in un''azione guadagna 2 punti. Allena il concetto di ampiezza in modo pratico. Gli Esordienti tendono ad addensarsi al centro: la regola crea l''abitudine di cercare gli esterni senza che tu debba ricordarglielo ogni 30 secondi durante la partita.',
  28, 'tattica', 'esordienti',
  JSON_ARRAY('ampiezza', 'corsie laterali', 'attacco', 'tattica', '5v5'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Giocare largo: ampiezza in attacco' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sostegno al portatore di palla',
  'In un''area 20x15m, 4v2. I quattro giocano a possesso con una regola specifica: chi ha la palla deve sempre vedere almeno due compagni in posizione diversa (non in fila). Se ha solo un''opzione, si ferma e aspetta che qualcuno si muova. Regola: non si può passare a chi è nella stessa linea orizzontale. Variante: aggiungi un terzo difensore per rendere più difficile trovare il sostegno. Il concetto di ''chi non ha la palla ha il compito più difficile'' diventa chiaro in modo pratico. Fermati a spiegare il perché quando lo vedi mancante durante l''esercizio, non prima: l''esempio vivo vale più della spiegazione teorica.',
  25, 'tattica', 'esordienti',
  JSON_ARRAY('sostegno', 'appoggio', 'posizionamento', 'tattica', 'possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sostegno al portatore di palla' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing coordinato sulla palla',
  'Campo 35x25m, 5v5. La squadra che perde la palla deve mettere pressing entro 3 secondi con almeno 2 giocatori verso il portatore. Quando fischi, tutti i giocatori della squadra senza palla si fermano e mostrano dove si trovano: fai vedere se sono vicini o lontani dalla palla. Variante: la squadra che recupera palla entro 4 secondi guadagna un punto bonus. Gli Esordienti iniziano a capire il pressing come gesto collettivo: non uno che insegue, ma due che chiudono gli spazi. Questo è il punto di svolta tattico rispetto ai Pulcini. Non uno che insegue, ma due che tagliano le linee di fuga.',
  30, 'tattica', 'esordienti',
  JSON_ARRAY('pressing', 'coordinazione', 'recupero palla', 'tattica', '5v5'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing coordinato sulla palla' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Transizione veloce 5v5',
  'Campo 40x30m, 5v5. Quando una squadra segna o perde la palla, quella avversaria deve iniziare la nuova azione entro 3 secondi. La partita non si ferma mai. Conti ad alta voce: ''uno, due, tre...'' e se la squadra non riparte in tempo cede un punto. Variante: chi fa più transizioni veloci in 5 minuti (contate da te) vince il set. La transizione rapida è uno dei concetti più difficili da insegnare ma più efficaci quando viene assorbito. Con gli Esordienti è il momento giusto per introdurlo: la mente è pronta ma l''abitudine non esiste ancora e va costruita con molte ripetizioni in contesto reale.',
  28, 'tattica', 'esordienti',
  JSON_ARRAY('transizione', 'velocità', 'cambio fase', '5v5', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Transizione veloce 5v5' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gioco a tre linee orizzontali',
  'Campo 40x30m diviso in tre fasce orizzontali con coni, 6v6. Ogni squadra ha 2 giocatori per fascia: 2 difensori (fascia bassa), 2 centrocampisti (fascia media), 2 attaccanti (fascia alta). Nessuno può uscire dalla propria fascia ma si possono fare passaggi tra fasce. Obiettivo: raggiungere la fascia avversaria più lontana. Variante: dopo 5 minuti rimuovi il vincolo e osserva se i ragazzi mantengono il posizionamento spontaneamente. Introduce il concetto di struttura della squadra senza usare la parola ''modulo''. I giocatori sentono fisicamente la differenza tra essere tutti insieme e avere profondità e larghezza.',
  30, 'tattica', 'esordienti',
  JSON_ARRAY('tre linee', 'ruoli', 'posizionamento', 'tattica', '6v6'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gioco a tre linee orizzontali' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita dalla pressione',
  'Un difensore ha la palla sotto pressione di un attaccante (resistenza media). Due compagni si muovono ai lati per offrirsi come appoggio. Il difensore deve scegliere chi servire e passare in modo pulito. Chi riceve è a sua volta pressato e trova un terzo appoggio: si crea una catena di 5-6 passaggi. Variante: il difensore che perde la palla per non aver cercato l''appoggio diventa il nuovo attaccante pressante. Gli Esordienti tendono ad allontanare la palla col calcio lungo quando sono pressati: questo esercizio allena la soluzione alternativa, l''appoggio corto, che è tecnicamente più difficile ma tatticamente molto più efficace in partita.',
  25, 'tattica', 'esordienti',
  JSON_ARRAY('uscita pressione', 'appoggio corto', 'difesa', 'tattica', 'passaggio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita dalla pressione' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Copertura del lato debole',
  'Campo 35x25m, 5v5. Quando la palla è sul lato destro del campo, la tua squadra scala verso quel lato compattandosi, lasciando il sinistro parzialmente scoperto ma con una linea di copertura. Fischi quando vedi il lato debole completamente privo di copertura. Fermati e mostra visivamente la posizione corretta. Variante: assegna un giocatore come responsabile del lato debole che deve sempre mantenersi a copertura mentre gli altri pressano la palla. Gli Esordienti imparano che difendere non significa inseguire tutti la stessa palla, ma che ognuno ha un ruolo anche quando la palla è lontana da lui.',
  28, 'tattica', 'esordienti',
  JSON_ARRAY('copertura', 'lato debole', 'difesa', 'compattezza', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Copertura del lato debole' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Prima linea di pressing offensivo',
  'Campo 40x30m, 5v5. La squadra in attacco non può segnare nelle prime 15 secondi: deve prima pressare gli avversari se perdono la palla. La prima linea (i due attaccanti) chiude il portiere e il difensore quando hanno la palla. Variante: un punto bonus per ogni pressing riuscito che porta al recupero entro 5 secondi. Il pressing offensivo degli Esordienti è ancora istintivo. Questo esercizio lo rende sistematico: l''attaccante più vicino pressa il portatore, quello più lontano copre la linea di passaggio. Concetto semplice da spiegare, difficile da eseguire in modo continuativo per una partita intera.',
  30, 'tattica', 'esordienti',
  JSON_ARRAY('pressing offensivo', 'prima linea', 'recupero alto', 'attacco', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Prima linea di pressing offensivo' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '5v5 con ruoli assegnati',
  'Campo 40x30m, 5v5. Assegna ruoli espliciti: portiere, due difensori, un mediano, un attaccante. Spiega brevemente ogni compito: il difensore rimane nella propria metà, il mediano collega le due fasi, l''attaccante attacca la profondità. Regola: il portiere gioca con i piedi. Fai giocare 6 minuti poi ruota i ruoli. Variante: libera tutte le restrizioni dopo 3 minuti e osserva se i ragazzi mantengono spontaneamente il posizionamento. Il primo approccio ai ruoli non deve essere rigido: l''obiettivo è che i ragazzi inizino a sentire il senso di una posizione, non che la rispettino alla perfezione ogni secondo.',
  30, 'tattica', 'esordienti',
  JSON_ARRAY('ruoli', 'posizionamento', '5v5', 'struttura', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '5v5 con ruoli assegnati' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il rombo compatto in difesa',
  'Campo 35x25m, 4v4 più portieri. La squadra in difesa mantiene un rombo compatto: i 4 giocatori non più di 10m di distanza l''uno dall''altro. Quando la palla si sposta, il rombo si sposta tutto insieme. Fischi quando vedi il rombo rotto e mostri visivamente la distanza corretta. Variante: riduci l''area a 30x20m per rendere più evidenti i buchi nel rombo difensivo. Insegna la compattezza senza parlare di difesa a zona o a uomo: i giocatori sentono fisicamente la differenza tra essere vicini e lasciare spazi. Il rombo che si muove compatto è il primo vero concetto di ''difendere come squadra'' per gli Esordienti.',
  28, 'tattica', 'esordienti',
  JSON_ARRAY('rombo difensivo', 'compattezza', 'difesa', 'posizionamento', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il rombo compatto in difesa' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondo 5v2 nel rettangolo',
  'In un rettangolo 12x8m, 5 giocatori in possesso contro 2 difensori. I cinque fanno più passaggi consecutivi senza che i due tocchino la palla. Chi sbaglia (passaggio scarso o intercettato) entra in difesa e il difensore più a lungo in campo esce. Massimo 3 tocchi per giocatore. Variante: riduci i tocchi a 2 obbligatori dopo 5 minuti. Il rondo 5v2 replica la superiorità numerica che si crea continuamente in partita. Con gli Esordienti diventa un lavoro serio: si inizia a parlare di qualità del passaggio, di dove posizionarsi rispetto al difensore e di come creare linee di passaggio pulite.',
  22, 'possesso_palla', 'esordienti',
  JSON_ARRAY('rondo', '5v2', 'possesso', 'passaggio veloce', 'pressione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondo 5v2 nel rettangolo' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso con porte di passaggio',
  'In uno spazio 25x20m, crea 4 cancelletti con coni (1m di larghezza) disposti casualmente. Due squadre da 4 giocano a possesso senza porte: per fare punto bisogna far passare la palla attraverso un cancelletto. Il difensore può chiuderlo mettendosi davanti. Variante: lo stesso cancelletto non può essere usato due volte di fila dalla stessa squadra: obbliga a cambiare lato. Allena cambio di lato e visione periferica in modo pratico. I ragazzi imparano a cercare il cancelletto libero invece di forzare sempre nella stessa direzione: comportamento esattamente uguale a quello che serve in partita per trovare il varco giusto.',
  25, 'possesso_palla', 'esordienti',
  JSON_ARRAY('cancelletti', 'possesso', 'cambio lato', 'visione', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso con porte di passaggio' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondo a due tocchi obbligatori',
  '6v2 in un cerchio di 10m. Regola fissa: massimo 2 tocchi a testa. Chi fa 3 tocchi passa in difesa immediatamente. Chi sbaglia il passaggio per imprecisione (non per il difensore) passa in difesa. I 2 tocchi creano urgenza mentale: il primo tocco prepara già il secondo. Variante: riduci il cerchio a 7m mantenendo i 2 tocchi. Il rondo a due tocchi introduce la velocità di pensiero come componente del possesso. Non basta più tenere la palla: bisogna riceverla con un''idea già pronta. Concetto che differenzia nettamente gli Esordienti dai Pulcini e che prepara alla velocità di gioco delle categorie successive.',
  20, 'possesso_palla', 'esordienti',
  JSON_ARRAY('rondo', 'due tocchi', 'velocità di pensiero', 'possesso', 'pressione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondo a due tocchi obbligatori' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso in profondità',
  'Campo 30x20m, 4v4 più due jolly alle estremità. I jolly giocano sempre con la squadra in possesso ma solo sulle linee laterali. Per fare punto bisogna passare a un jolly che fa un passaggio filtrante in profondità a un compagno che taglia. Il jolly può ricevere solo se è libero di girarsi. Variante: ogni passaggio riuscito in profondità conta come punto, indipendentemente dal gol. Allena lo smarcamento in profondità, ancora grezzo negli Esordienti. I jolly laterali rappresentano il terzo elemento che apre la difesa: il passaggio filtrante è la ricompensa dell''azione costruita con pazienza.',
  25, 'possesso_palla', 'esordienti',
  JSON_ARRAY('profondità', 'smarcamento', 'filtrante', 'jolly', 'possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso in profondità' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '3v3 con jolly neutro',
  'In un''area 20x15m, 3v3 più un jolly neutro che gioca sempre con la squadra in possesso. Il jolly non può segnare, solo passare e ricevere. La squadra in possesso ha sempre superiorità 4v3. Quando si perde la palla, il jolly cambia squadra automaticamente. Variante: il jolly deve sempre stare fuori dall''area di 5x5m intorno alla palla (niente appoggio ravvicinato), obbligandolo a offrire spazi diversi. Il jolly neutro sviluppa la consapevolezza della superiorità numerica e coinvolge i giocatori meno tecnici senza pressione eccessiva. Ottimo per variare il possesso senza cambiare l''esercizio.',
  22, 'possesso_palla', 'esordienti',
  JSON_ARRAY('jolly', '3v3', 'superiorità numerica', 'possesso', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '3v3 con jolly neutro' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso con cambio campo obbligatorio',
  'Campo 40x25m, 5v5 senza porte. Regola: ogni squadra deve completare almeno un cambio di campo (passaggio da un lato all''altro di almeno 20m) prima di poter toccare la linea di fondo. I passaggi corti sono liberi ma il cambio campo è obbligatorio. Variante: il cambio campo deve passare da un giocatore nella fascia centrale. Allena la visione di gioco lunga e il passaggio di cambio campo, uno dei fondamentali più trascurati. La regola dell''obbligo crea l''abitudine: dopo qualche sessione i ragazzi iniziano a cercare il cambio campo spontaneamente anche nelle partite ufficiali.',
  25, 'possesso_palla', 'esordienti',
  JSON_ARRAY('cambio campo', 'visione', 'passaggio lungo', 'ampiezza', 'possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso con cambio campo obbligatorio' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso con pressing time',
  'Campo 25x20m, 4v4. La squadra che perde la palla ha 4 secondi per fare un pressing collettivo con almeno 2 giocatori verso la palla. Conti ad alta voce. Se non pressano in tempo, cedono un punto. Se recuperano entro 4 secondi, guadagnano un punto bonus. Variante: riduci a 3 secondi dopo 5 minuti. Combina possesso e transizione difensiva. Gli Esordienti tendono o a pressare subito in modo caotico o ad aspettare passivi: questa regola calibra il timing corretto del pressing collettivo in modo pratico e con feedback immediato che capiscono immediatamente perché è misurabile.',
  20, 'possesso_palla', 'esordienti',
  JSON_ARRAY('pressing time', 'transizione', 'possesso', '4v4', 'recupero palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso con pressing time' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il quadrato con uscita in profondità',
  'In un quadrato 12x12m, 4v1. I quattro giocano a possesso normale. Regola speciale: quando uno vede spazio libero oltre il bordo del quadrato, può uscire conducendo. Se esce senza che il difensore lo tocchi, fa un punto. Poi si riforma il quadrato. Variante: il difensore dopo l''uscita del giocatore può inseguirlo per 5m. Combina possesso conservativo e uscita verticale. Gli Esordienti imparano che il possesso non è fine a se stesso ma serve a creare il momento giusto per verticalizzare. La scelta di quando uscire (timing) è la competenza tattica chiave di questo esercizio.',
  22, 'possesso_palla', 'esordienti',
  JSON_ARRAY('quadrato', 'uscita verticale', 'verticalizzazione', 'possesso', 'timing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il quadrato con uscita in profondità' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondo con inversione di direzione',
  '5 giocatori in cerchio (10m), 1 difensore al centro. Il cerchio può invertire la direzione del possesso in qualsiasi momento: basta che chi ha la palla passi nella direzione inversa rispetto al giro corrente. Il difensore non sa mai da dove arriverà il prossimo passaggio. Variante: l''inversione deve essere annunciata con una parola in codice prima che il passaggio parta. Sviluppa la capacità di cambiare il senso del gioco e di comunicare il cambiamento. Gli Esordienti devono imparare che il difensore si orienta in una direzione e l''inversione lo disorienta: primo concetto vero di ''leggere'' l''avversario.',
  22, 'possesso_palla', 'esordienti',
  JSON_ARRAY('cerchio', 'inversione', 'possesso', 'comunicazione', 'lettura'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondo con inversione di direzione' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Torello con jolly esterno',
  'In un rettangolo 15x10m, 4v2. I quattro giocano a possesso. Regola extra: possono passare a un jolly esterno posizionato fuori dal rettangolo su uno dei lati lunghi. Il jolly riceve, fa massimo 2 tocchi e rimanda dentro. Un difensore può uscire per pressare il jolly. Variante: due jolly sui due lati lunghi: la squadra sceglie a quale passare. Allena la visione periferica e la capacità di sfruttare il giocatore libero fuori dalla zona di pressing. Situazione che si crea spesso in partita con il terzino libero fuori dall''area di pressing avversario che riceve e smista.',
  20, 'possesso_palla', 'esordienti',
  JSON_ARRAY('jolly esterno', 'possesso', 'visione', 'uscita laterale', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Torello con jolly esterno' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: finalizzazione (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Conclusione dopo conduzione centrale',
  'In una zona centrale a 20m dalla porta, il giocatore conduce verso porta superando un cono a 12m (difensore simulato) e conclude. Non si va al massimo della velocità: l''obiettivo è la qualità del tiro dopo la conduzione. 3 ripetizioni per giocatore poi pausa. Variante: il cono diventa un difensore vero che parte 2 secondi dopo: il giocatore deve accelerare per guadagnare spazio di tiro. Seconda variante: tiro obbligatorio entro 2 secondi dall''ultimo tocco di conduzione. Allena la transizione conduzione-conclusione mantenendo qualità tecnica anche sotto pressione temporale: pattern molto frequente nel calcio degli Esordienti.',
  22, 'finalizzazione', 'esordienti',
  JSON_ARRAY('conduzione', 'tiro', 'collo piede', 'finalizzazione', 'transizione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Conclusione dopo conduzione centrale' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cross e colpo di testa in area',
  'Due file: crossers sul lato, attaccanti in area. Il crosser conduce fino alla zona del cross (15m dalla porta, 10m dal palo), alza la testa e crossa con parabola verso il punto di rigore. L''attaccante parte quando il crosser supera il cono di partenza e arriva a velocità sul punto di impatto. Obiettivo del cross: palla tra il secondo palo e il dischetto. Variante: aggiungi un difensore che parte dalla linea di fondo cercando di anticipare l''attaccante. Il cross-testa è uno dei pattern più frequenti nel calcio degli Esordienti. Con tecnica di cross corretta e buon timing di inserimento diventa il modo più efficace per segnare.',
  25, 'finalizzazione', 'esordienti',
  JSON_ARRAY('cross', 'colpo di testa', 'inserimento', 'area', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cross e colpo di testa in area' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '3v2 in progressione verso porta',
  'Tre attaccanti partono da metà campo contro due difensori schierati a 20m dalla porta. Gli attaccanti decidono come sfruttare la superiorità. Il portiere è presente. Regola: devono tirare entro 8 secondi. Fermati ogni 5 azioni e chiedi agli attaccanti com''è andata la loro scelta: hanno sfruttato la superiorità o hanno giocato 1v1? La discussione vale più di 10 ripetizioni aggiuntive. Variante: il terzo attaccante parte 5m indietro e deve recuperare di corsa, simulando l''inserimento tardivo del centrocampista. Il 3v2 è la situazione in cui gli Esordienti buttano più opportunità: hanno la superiorità ma la gestiscono male.',
  25, 'finalizzazione', 'esordienti',
  JSON_ARRAY('3v2', 'superiorità', 'decisione', 'finalizzazione', 'inserimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '3v2 in progressione verso porta' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro dalla distanza con portiere',
  'Crea tre punti di tiro a 15m, 18m e 20m dalla porta a varie angolazioni. I giocatori tirano a turno da ogni posizione, 2 tiri per posizione. Si tira solo se la palla è sotto controllo dopo la ricezione. Variante: sfida a squadre, ogni gol segnato dalla distanza massima vale 3 punti. Introduce il tiro da fuori area che per gli Esordienti è una situazione reale. Molti non tirano mai dalla distanza perché non si sentono sicuri: la ripetizione sistematica costruisce confidenza e tecnica. Il portiere presente aumenta il realismo e allena anche lui a leggere i tiri da lontano.',
  22, 'finalizzazione', 'esordienti',
  JSON_ARRAY('tiro distanza', 'collo piede', 'portiere', 'finalizzazione', 'precisione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro dalla distanza con portiere' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Inserimento in corsa e conclusione',
  'Un passante a 20m dalla porta sul lato destro. L''attaccante parte da posizione arretrata e taglia in diagonale verso l''area. Il passante aspetta che l''attaccante superi la linea del difensore per lanciare il filtrante. L''attaccante conclude di prima o con uno stop orientato. Il difensore parte passivo e dopo 3 ripetizioni prova a intercettare. Variante: l''attaccante sceglie se tagliare sul primo o secondo palo e il passante deve leggere il taglio. Allena timing del lancio e del taglio, aspetti tecnico-tattici che si sviluppano molto in questa categoria. Chi padroneggia il taglio ha un vantaggio enorme sugli avversari.',
  25, 'finalizzazione', 'esordienti',
  JSON_ARRAY('inserimento', 'taglio', 'filtrante', 'finalizzazione', 'timing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Inserimento in corsa e conclusione' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '2v2 in area con portiere',
  'In un''area 16x12m davanti alla porta, 2 attaccanti contro 2 difensori più portiere. Gli attaccanti partono dal dischetto, i difensori dalla linea di porta. Al via, gli attaccanti concludono nel minor numero di tocchi. Durata massima dell''azione: 6 secondi. Il 2v2 in area allena la capacità di decidere velocemente, di non portare troppo e di capire quando tirare e quando cedere la palla al compagno. Variante: un attaccante riceve fuori dall''area e poi entra, l''altro si smarca dall''interno. Spazio ristretto, tempo limitato, portiere presente: ogni scelta è quella giusta o sbagliata, senza zone grigie.',
  22, 'finalizzazione', 'esordienti',
  JSON_ARRAY('2v2', 'area', 'portiere', 'decisione rapida', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '2v2 in area con portiere' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sfida di tiro in contemporanea',
  'Due giocatori si sfidano: ognuno ha 3 palloni e tira verso la stessa porta da lato opposto (uno da destra, uno da sinistra). Chi fa più gol in 3 turni vince il duello. Il portiere para quello che può. Variante: entrambi tirano in sequenza alternata: il portiere si concentra su un tiro alla volta ma la pressione è sulla rapidità di esecuzione. Il formato sfida diretta aumenta la concentrazione e la qualità tecnica del tiro molto più degli esercizi ripetuti senza contesto competitivo. I ragazzi si caricano da soli senza bisogno di motivazione esterna: basta che ci sia un avversario accanto.',
  20, 'finalizzazione', 'esordienti',
  JSON_ARRAY('sfida', 'tiro', 'competizione', 'finalizzazione', 'precisione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sfida di tiro in contemporanea' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Combinazione a tre e conclusione',
  'Tre giocatori: uno fa da appoggio a 15m dalla porta sul lato, uno taglia dall''esterno verso il centro, uno è il portatore a 25m. Il portatore passa all''appoggio, l''appoggio cede il filtrante al tagliante, il tagliante conclude. Tutto senza stop: passaggio-filtrante-tiro in sequenza fluida. Difensore introdotto dopo 5 ripetizioni. Variante: il taglio può avvenire sul primo o secondo palo: la scelta è del tagliante e l''appoggio legge il movimento. Allena la combinazione a tre tocchi che è il pattern più efficace per arrivare alla conclusione negli spazi stretti del calcio a 7. Con gli Esordienti si può già insegnare questa sequenza.',
  25, 'finalizzazione', 'esordienti',
  JSON_ARRAY('combinazione', 'filtrante', 'taglio', 'conclusione', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Combinazione a tre e conclusione' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sfruttare la rimessa laterale',
  'Simula una rimessa laterale a 20m dalla porta. Il giocatore che rimette passa al compagno a 8m. Il ricevitore stoppa e scarica a un terzo che arriva di corsa da 15m e tira al volo o con controllo orientato. Tutto in meno di 4 secondi dalla rimessa. Variante: aggiungi un avversario che pressa il ricevitore subito dopo la rimessa: la soluzione deve essere ancora più rapida. Le rimesse laterali sono spesso occasioni di gol sprecato negli Esordienti perché i ragazzi non sanno come sfruttarle. Questa sequenza costruisce un pattern automatico che poi usano in partita senza pensarci.',
  22, 'finalizzazione', 'esordienti',
  JSON_ARRAY('rimessa laterale', 'combinazione', 'tiro', 'automatismo', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sfruttare la rimessa laterale' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Partita con porta grande e portieri',
  '4v4 più portieri su campo 40x30m con porte regolamentari per la categoria. Nessuna regola speciale: gioco libero. Osservi senza interrompere per 8 minuti, poi fermi e condividi una sola osservazione sulla finalizzazione (es. ''ho visto che tirate sempre sul primo palo: provate il secondo''). Riparti altri 5 minuti. Variante: aggiungi la regola che si può segnare solo dopo aver superato la metà campo con un passaggio. Chiude la sessione di finalizzazione con il contesto più reale possibile: porta grande, spazio ampio, situazione di partita vera. I fondamentali si consolidano quando vengono usati in gioco, non solo in esercizi isolati.',
  28, 'finalizzazione', 'esordienti',
  JSON_ARRAY('porta grande', 'gioco libero', 'partita', 'finalizzazione', '4v4'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Partita con porta grande e portieri' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: atletica_fisico (10 sessioni · 15-25 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Scaletta agility base',
  'Posiziona la scaletta agility a terra. I giocatori eseguono in sequenza: due piedi in ogni quadrato (ritmo normale), poi due piedi ogni quadrato (ritmo veloce), poi un piede alternato destra-sinistra, poi doppio passo laterale. Ogni sequenza circa 10 secondi, poi sprint di 5m all''uscita. 3 serie per ogni schema, pausa di 30 secondi tra le serie. Variante: alla fine della scaletta aggiungi una palla in movimento: un compagno lancia e il giocatore controlla subito dopo l''uscita. La scaletta agility per gli Esordienti è uno strumento eccellente: breve, intenso, misurabile e direttamente trasferibile alla rapidità di piedi in campo.',
  18, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('scaletta agility', 'rapidità gambe', 'coordinazione', 'piedi veloci', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Scaletta agility base' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuito di rapidità con ostacoli',
  'Crea un circuito con 4 stazioni: stazione 1 = slalom tra 6 cinesini a passo rapido, stazione 2 = saltelli sopra 4 ostacoli bassi (30cm), stazione 3 = sprint di 10m più frenata brusca più ritorno, stazione 4 = corsa laterale a zigzag tra 4 coni. Ogni stazione: 30 secondi a massima intensità, 15 secondi riposo. 3 giri completi. Variante: al secondo giro aggiungi una palla in mano durante le stazioni 1 e 4. La combinazione di ostacoli diversi allena pattern motori differenti in poco tempo. Gli Esordienti hanno bisogno di varietà negli esercizi atletici per mantenere alta la concentrazione durante l''intera sessione.',
  20, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('ostacoli', 'circuito', 'cambio direzione', 'rapidità', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuito di rapidità con ostacoli' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Skip e andature coordinative',
  'In uno spazio di 15m, su tua chiamata i giocatori eseguono: skip basso (passi veloci senza alzare i piedi), skip alto (ginocchia al petto), calciata dietro (talloni ai glutei), slancio frontale alternato, corsa laterale destra, corsa laterale sinistra, corsa all''indietro. Ogni andatura dura 10m, poi cambio. Due giri a ritmo normale e uno a ritmo elevato. Variante: alla fine ogni giocatore inventa un''andatura per 10m e gli altri la replicano. Allena il controllo neuro-muscolare, la mobilità articolare dinamica e la coscienza corporea. Le andature coordinative sono un preriscaldamento muscolare molto superiore alla corsa monotona.',
  18, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('skip', 'andature', 'coordinazione', 'mobilità', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Skip e andature coordinative' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Reazione al segnale con partenza variabile',
  'I giocatori sono in posizione di attesa variabile: seduto, sdraiato in pancia, in equilibrio su un piede, girato di spalle. Dai un segnale (fischio, mano alzata, parola) e scattano verso un cono a 10m. Chi arriva dopo fa 3 squat rapidi. Varia le posizioni di partenza a ogni segnale. Variante: al segnale si scatta verso coni di colore diverso in base a una regola (rosso = destra, giallo = sinistra). Allena la reazione allo stimolo da posizioni di partenza non standard: in partita si deve scattare in ogni momento, non sempre dalla posizione ottimale. Sviluppa la forza esplosiva da posizioni difficili.',
  20, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('reazione', 'partenza variabile', 'sprint', 'stimolo', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Reazione al segnale con partenza variabile' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Salti coordinati agli ostacoli',
  'Disponi 6 ostacoli bassi (20-30cm) in fila a distanze variabili (60cm, 80cm, 100cm). I giocatori li saltano a piedi uniti, poi su piede sinistro solo, poi su piede destro solo. Tra una serie e l''altra, 20 secondi di skip leggero. 3 serie per ogni schema. Variante: disponi gli ostacoli in forma di L invece di fila: il giocatore deve girare l''angolo mentre salta, aggiungendo coordinazione direzionale. Gli ostacoli bassi sviluppano forza esplosiva delle gambe, coordinazione podalica e capacità di controllare il corpo nel salto: fondamentale per la prevenzione degli infortuni alla caviglia negli Esordienti che crescono rapidamente.',
  18, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('saltelli', 'ostacoli', 'forza gambe', 'coordinazione', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Salti coordinati agli ostacoli' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il tabellone dei movimenti',
  'Crea 5 stazioni: 1 = 10 salti a stella, 2 = 10 squat, 3 = 10 passi laterali veloci su linea, 4 = 10 saltelli sulla scaletta (o cerchi a terra), 5 = corsa sul posto con ginocchia alte per 15 secondi. I giocatori ruotano ogni 40 secondi al fischio. 2 tornate. Variante: nella seconda tornata le ripetizioni raddoppiano per le stazioni 1-3. Ogni stazione lavora un pattern motorio diverso. Il tabellone dei movimenti è uno strumento flessibile: lo adatti agli spazi disponibili, allo stato di forma del gruppo e a cosa serve allenare quel giorno senza cambiare la struttura dell''esercizio.',
  20, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('stazioni', 'forza', 'coordinazione', 'circuito', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il tabellone dei movimenti' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Velocità di gambe nel rettangolo',
  'In un rettangolo 10x6m segnato a terra con coni. Due giocatori in fila. Il primo entra e tocca tutti e 4 gli angoli il più velocemente possibile (percorso libero). Cronometra ogni turno. Dopo ogni turno 20 secondi di riposo. Variante: il percorso è imposto (angolo 1-3-2-4 invece del più vicino): più difficile perché non segui il percorso naturale. Allena l''accelerazione brevissima, il freno e il cambio di direzione immediato. Componenti atletiche fondamentali per gli Esordienti in una fase di crescita dove la coordinazione migliora velocemente se stimolata con esercizi mirati e con feedback misurabile come il cronometro.',
  22, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('velocità gambe', 'cambio direzione', 'agility', 'rettangolo', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Velocità di gambe nel rettangolo' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corsa con variazioni tecniche',
  'I giocatori corrono in fila indiana su un rettangolo 30x20m. Al tuo segnale cambiano tipo di corsa: skip basso, skip alto, calciata, corsa laterale destra, corsa laterale sinistra, allungo. Ogni cambio dura 10m. La velocità di base è media: conta la qualità dell''esecuzione tecnica di ogni variazione. Variante: aggiungi accelerazioni a fine rettilineo: dopo ogni curva si fa uno sprint di 5m. Allena la fluidità delle variazioni tecniche nella corsa che si trasferisce direttamente alla qualità del movimento in campo. Spesso trascurata a favore di esercizi col pallone, è fondamentale per la qualità atletica generale degli Esordienti.',
  20, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('corsa', 'variazioni', 'skip', 'calciata', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corsa con variazioni tecniche' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Interval training breve',
  'Su una distanza di 20m, i giocatori eseguono 8 sprint al massimo con 20 secondi di riposo attivo (camminata) tra uno e l''altro. Poi 2 minuti di riposo completo e si ripete per 2 serie totali. Nella seconda serie aggiungi una palla: il giocatore la porta durante lo sprint tenendola vicina al piede. Variante: sostituisci la distanza lineare con uno slalom tra 4 coni a 5m. L''interval training breve è la forma di lavoro aerobico più adatta agli Esordienti: stimola la capacità anaerobica senza l''impatto psicologico del lavoro prolungato. 8 sprint di 20m con pausa replicano le distanze percorse a massima intensità in una partita a 7.',
  22, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('interval training', 'sprint', 'resistenza', 'anaerobico', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Interval training breve' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Mobilità e rinforzo caviglia',
  'Lavoro di mobilità e rinforzo preventivo. Prima fase: su un piede solo, 10 circonduzione della caviglia in senso orario e 10 antiorario. Seconda fase: saltelli brevi sul posto atterrando in punta di piede senza usare il tallone. Terza fase: cammino sulla punta per 10m, poi sui talloni per 10m. Quarta fase: stretching del polpaccio a muro per 30 secondi per gamba. Variante: esegui su erba bassa per uno stimolo propriocettivo maggiore. Il rinforzo della caviglia è fondamentale in questa fase di crescita. Gli Esordienti sono nella finestra sensibile per la coordinazione articolare: ogni minuto investito ora riduce gli infortuni nei prossimi anni.',
  18, 'atletica_fisico', 'esordienti',
  JSON_ARRAY('mobilità', 'caviglia', 'prevenzione', 'propriocezione', 'atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Mobilità e rinforzo caviglia' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: portieri (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Posizione di base e scivolamento',
  'Il portiere tra i pali. Ti sposti lentamente ai 16m con la palla da sinistra verso destra senza tirare. Il portiere segue con lo scivolamento laterale: passo laterale, non incrocio di gambe. Ogni 2-3m ti fermi e chiedi: ''sei in posizione? Riesci a coprire?'' Il portiere assesta la propria posizione. Variante: una finta rapida di 2m verso un lato poi tiro dalla posizione opposta: il portiere impara a non anticipare. Lo scivolamento senza incrociare le gambe va costruito ora: crea ritardo di reazione e difficilmente si corregge dopo i 14 anni. Fondamentale che si imposta all''inizio della carriera da portiere.',
  22, 'portieri', 'esordienti',
  JSON_ARRAY('posizione base', 'scivolamento', 'piedi', 'fondamentale', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Posizione di base e scivolamento' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Presa bassa di sicurezza',
  'Tiri a terra da 7m di distanza, a intensità crescente (lenti poi più veloci). Il portiere blocca piegando entrambe le ginocchia a terra, con le mani a paletto davanti (pollici verso l''alto, dita allargate) e poi abbraccia la palla al petto. Non si para di piede: si blocca con le mani sempre. 8 tiri a sinistra, 8 a destra, 4 centrali. Variante: il portiere parte seduto sui talloni e deve alzarsi e parare in tempo reale. La presa bassa di sicurezza elimina il rimbalzo pericoloso davanti alla porta. L''errore più comune è pararla col piede o rimbalzarla senza bloccare: correggi subito ogni volta che lo vedi.',
  22, 'portieri', 'esordienti',
  JSON_ARRAY('presa bassa', 'sicurezza', 'blocco', 'fondamentale', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Presa bassa di sicurezza' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Presa alta su traiettoria diretta',
  'Lancia palloni alti con parabola morbida direttamente verso il portiere da 8m. Deve saltare con entrambe le mani sopra la testa, formare una ''W'' con le dita (pollici vicini) e bloccare la palla. Atterraggio: piede dominante per primo. 6 lanci frontali, 6 di lato destro, 6 di lato sinistro. Variante: fai saltare il portiere partendo da una posizione inginocchiata: deve alzarsi e saltare tutto in un giro. La tecnica a ''W'' con i pollici vicini è standard ed elimina il rischio che la palla passi tra le mani. La paura del colpo in faccia porta a chiudere gli occhi: correggi subito con tante ripetizioni su parabole basse e controllate.',
  22, 'portieri', 'esordienti',
  JSON_ARRAY('presa alta', 'traiettoria', 'salto', 'fondamentale', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Presa alta su traiettoria diretta' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tuffo laterale destro-sinistro',
  'Su erba (o tappetino), portiere in posizione di base. Tiri alternati a destra e sinistra a circa 1m oltre la portata del portiere. Prima serie: 3 tiri per lato, bassa intensità. Seconda serie: 5 per lato, intensità media. Pausa 30 secondi tra le serie. Variante: sostituisci il tiro con un lancio a mano: le traiettorie sono più controllabili e il portiere capisce meglio la tecnica senza pressione. Insegna la tecnica di tuffo: partire dal piede interno (quello verso la palla), spingere lateralmente, estendersi e parare. La caduta corretta è sul fianco con la spalla che attutisce: non di schiena, non sulle mani.',
  25, 'portieri', 'esordienti',
  JSON_ARRAY('tuffo', 'laterale', 'parata', 'caduta', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tuffo laterale destro-sinistro' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita coraggiosa sul 1v1',
  'Un attaccante parte da 20m con la palla e corre verso la porta. Il portiere decide quando uscire: troppo presto e l''attaccante scarta, troppo tardi e arriva tiro da vicino. Regola semplice da comunicare: esci quando l''attaccante abbassa la testa sulla palla, non prima. Velocità di uscita: bassa all''inizio per calibrare il timing. 8 ripetizioni. Variante: l''attaccante può tirare o scartare a 10m: il portiere non sa cosa farà. Introduce l''incertezza reale dell''uscita. La gestione del 1v1 è la più difficile per un portiere giovane: non si insegna con regole rigide ma con molte ripetizioni e feedback immediato su ogni scelta.',
  25, 'portieri', 'esordienti',
  JSON_ARRAY('uscita', '1v1', 'timing', 'decisione', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita coraggiosa sul 1v1' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rinvio dal basso con il piede',
  'Il portiere tiene la palla in mano e la lascia cadere di fronte a sé. Al rimbalzo, colpisce con il collo del piede dominante verso un cono target a 20m. Obiettivo: palla bassa al target, non una bomba in cielo. 5 rinvii su cono centrale, 5 su cono destro, 5 su cono sinistro. Variante: i coni diventano compagni che si muovono: il portiere deve leggere il movimento e scegliere a chi rinviare. La tecnica è semplice: lasciare cadere la palla (non buttarla in alto) e colpirla nel momento esatto del rimbalzo. L''errore più comune è far rimbalzare la palla troppo alta: si perde il controllo della traiettoria.',
  22, 'portieri', 'esordienti',
  JSON_ARRAY('rinvio', 'piede', 'distribuzione', 'precisione', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rinvio dal basso con il piede' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Lancio laterale con la mano',
  'Il portiere riceve una palla (da te o dal difensore), la prende in braccio e la lancia lateralmente con il rollio da terra verso un compagno a 15-20m. La palla deve arrivare rotolando a terra, a velocità controllata, senza rimbalzi imprevedibili. 6 lanci a destra e 6 a sinistra. Variante: aggiungi un difensore avversario a metà della traiettoria che cerca di intercettare: il portiere deve scegliere l''angolo per evitarlo. Il lancio con il rollio laterale è la distribuzione più sicura e precisa per il portiere degli Esordienti: preferibile al lancio aereo perché riduce il rischio di intercetta e permette un controllo più facile al ricevente.',
  20, 'portieri', 'esordienti',
  JSON_ARRAY('lancio mano', 'distribuzione', 'rollio', 'precisione', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Lancio laterale con la mano' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Comunicazione difensiva semplice',
  'Durante un 4v4 su campo 30x20m, il portiere ha un compito specifico oltre a parare: comunicare ai difensori due comandi base. ''Gira'' quando il difensore ha la palla e può voltarsi. ''Attenzione'' quando c''è un avversario alle spalle. Non deve urlare tutto il tempo, solo nei momenti chiave. Fai giocare 5 minuti, poi chiedi ai difensori se i comandi sono stati utili. Variante: aggiungi il comando ''libero'' quando un compagno è smarcato e può ricevere. Il portiere che comunica è un vantaggio enorme. Questa sessione costruisce l''abitudine durante il gioco reale, non in teoria: i comandi diventano automatici solo se praticati spesso.',
  25, 'portieri', 'esordienti',
  JSON_ARRAY('comunicazione', 'comandi', 'difesa', 'guida difensiva', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Comunicazione difensiva semplice' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate in sequenza ravvicinata',
  'Il portiere para una serie di tiri ravvicinati (uno ogni 4-5 secondi) da 6-8m da angolazioni diverse. Tu (o un assistente) tiri in sequenza senza pause lunghe. Il portiere para, si rialza veloce e si rimette in posizione. Serie da 5 tiri consecutivi poi 30 secondi di pausa. Obiettivo: mantenere la qualità tecnica anche alla quinta parata, quando la stanchezza inizia a farsi sentire. Variante: il quinto tiro di ogni serie è sempre quello più difficile (angolo estremo o palla alta): allena la capacità di fare la parata difficile quando si è già affaticati. Le parate in sequenza sviluppano resistenza specifica del portiere e capacità di recupero tra uno sforzo e l''altro.',
  25, 'portieri', 'esordienti',
  JSON_ARRAY('parate', 'sequenza', 'reazione', 'resistenza', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate in sequenza ravvicinata' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Portiere protagonista nella partita',
  '5v5 più portieri su campo 40x30m. Fischi ogni volta che il portiere fa qualcosa di buono (uscita corretta, distribuzione precisa, comunicazione utile) e lo segnali ad alta voce al gruppo. Regola speciale: ogni azione deve passare dal portiere almeno una volta ogni 3 passaggi (non si gioca tutto senza mai coinvolgerlo). Variante: il gol vale doppio se nasce da una distribuzione del portiere. Crea un incentivo esplicito a coinvolgerlo nel gioco. La sessione portieri si chiude sempre nel gioco reale: i fondamentali si consolidano quando vengono usati in contesto di partita, non solo in esercizi isolati dove la posta in gioco è zero.',
  28, 'portieri', 'esordienti',
  JSON_ARRAY('partita', 'portiere in gioco', 'distribuzione', 'coinvolgimento', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Portiere protagonista nella partita' AND eta_leva = 'esordienti' AND ufficiale_myvivaio = TRUE
);
`;
