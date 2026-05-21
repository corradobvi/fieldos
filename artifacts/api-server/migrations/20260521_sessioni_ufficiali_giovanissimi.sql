-- ═══════════════════════════════════════════════════════════════════════════
-- MyVivaio — Sessioni Ufficiali Categoria GIOVANISSIMI (U13/U14)
-- File:    20260521_sessioni_ufficiali_giovanissimi.sql
-- Totale:  70 sessioni · 10 per ciascuna delle 7 categorie
-- Data:    2026-05-21
-- Autore:  MyVivaio Editorial Team
-- Round:   3 di N (Round 1 = Pulcini, Round 2 = Esordienti, già caricati)
-- ───────────────────────────────────────────────────────────────────────────
-- NOTA: ALTER TABLE mister_id INT NULL già eseguito nel Round 1 (Pulcini).
--       Non ripetuto qui.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── IDEMPOTENZA ────────────────────────────────────────────────────────────
-- Ogni INSERT usa SELECT … WHERE NOT EXISTS su (titolo, eta_leva, ufficiale_myvivaio).
-- Puoi eseguire questo script più volte senza creare duplicati.
-- ─────────────────────────────────────────────────────────────────────────────


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: riscaldamento (10 sessioni · 15-20 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione con possesso 6v3 a pressione alta',
  'Campo 25x25m, due gruppi da 6 tengono il possesso contro 3 che pressano. Chi sbaglia va in mezzo. Girate da 3 minuti con 45 secondi di recupero. Nella prima girata lasci tocchi liberi, dalla seconda imponi massimo 2 tocchi. Aumenti gradualmente l''intensità dei difensori: prima lenti, poi a intensità media, poi piena. Obiettivo: scaldare in modo calcisticamente specifico senza corsette generiche. I Giovanissimi si attivano subito su un tema tecnico e lo percepiscono come allenamento reale. Variante: aggiungi un jolly neutro che gioca sempre col possesso, creando 7v3. Il jolly deve spostarsi continuamente per essere disponibile: allena già nel riscaldamento la lettura degli spazi liberi.',
  17, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('possesso', 'pressione', 'riscaldamento', 'attivazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione con possesso 6v3 a pressione alta' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuito agility con palla tra ostacoli alti',
  'Percorso da ripetere tre volte: 4m di scaletta agility a piede alternato, salto su 3 ostacoli da 30cm, slalom tra 5 coni con palla al piede, passaggio su bersaglio fisso a 8m, rientro in jogging. Un giocatore parte ogni 15 secondi. Prima serie lenta (focus tecnico), seconda a ritmo medio, terza a massima velocità. Recupero 60 secondi tra le serie. Obiettivo: coordinazione neuro-muscolare specifica con palla, velocità di gambe e reattività. Per i Giovanissimi la scaletta non è solo esercizio di gambe: alla fine del percorso aggiungi una ricezione e un tiro immediato in porta. Allena la transizione da lavoro atletico a gesto tecnico. Variante: nella terza serie il passaggio finale arriva in aria bassa e il giocatore stroppa e tira senza fermare la palla.',
  15, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('agility', 'scaletta', 'coordinazione', 'riscaldamento', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuito agility con palla tra ostacoli alti' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Riscaldamento con andature calcistiche strutturate',
  'Tutta la squadra in fila sul lato lungo del campo. Percorrono 20m con ogni andatura e tornano in jogging. Sequenza: skip alto, skip basso veloce, corsa calciata, balzelli a due piedi, affondi avanzanti, sprint finale su fischio. Ripeti la sequenza due volte. Seconda tornata: varianti con palla — conduzione col piede sinistro, conduzione col destro, stop e cambio direzione ogni 5m. I Giovanissimi spesso trascurano le andature perché le trovano ripetitive: spiega che i professionisti le fanno ogni giorno. Variante: aggiungi un taglio repentino a metà percorso che simula il cambio di direzione in gara. L''ultimo elemento è sempre un tiro in porta a fine percorso per collegare il lavoro fisico al gesto tecnico.',
  15, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('andature', 'corsa tecnica', 'riscaldamento', 'coordinazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Riscaldamento con andature calcistiche strutturate' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso dinamico a coppie con cambio di ruolo',
  'Coppie distribuite su tutto il campo, ogni coppia con una palla. Uno conduce, l''altro segue a 2m di distanza. Al tuo fischio si scambia: chi aveva la palla fa un passaggio all''indietro e diventa l''ombra. Progressioni: dopo il cambio la ricezione col piede debole è obbligatoria, poi aggiungi uno stop orientato verso metà campo. Nella fase finale formi coppie che si muovono in un 30x30m mantenendosi distanziate l''una dall''altra. Obiettivo: warm-up cognitivo oltre che fisico. I ragazzi devono sempre sapere dove è il compagno e anticipare il fischio. Variante: il cambio non avviene su tuo fischio ma su chiamata del compagno. Trasferisce la comunicazione verbale dentro il riscaldamento e allena la reattività all''ascolto.',
  17, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('conduzione', 'cambio ruolo', 'riscaldamento', 'coppia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso dinamico a coppie con cambio di ruolo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing cooperativo a zone come warm-up tattico',
  'Suddividi il campo in tre zone orizzontali. In ogni zona due squadrette si sfidano in mini-possesso. Al tuo fischio tutti cambiano zona ruotando di uno: chi era in basso va al centro, chi era al centro va in alto. Obiettivo di ogni zona: tenere la palla. Progressione: aggiungi la regola per cui chi perde palla deve pressare subito insieme al compagno più vicino. Obiettivo: apprendere il meccanismo del pressing cooperativo mentre ci si scalda. Per i Giovanissimi è importante che il pressing non sia individuale ma un''azione coordinata con trigger precisi. Variante: la zona centrale ha una regola speciale — chi recupera palla può ripartire in contropiede verso una mini-porta laterale. Aumenta l''intensità nella zona centrale senza cambiare la struttura.',
  18, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('pressing', 'cooperazione', 'riscaldamento', 'zone', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing cooperativo a zone come warm-up tattico' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Triangoli in movimento per attivazione tecnica',
  'Tre gruppi da 4 giocatori, ognuno con un triangolo segnato da coni (lati di 8m). I giocatori si muovono continuamente intorno al triangolo mentre si passano la palla. Regola: il passaggio può avvenire solo quando il ricevente è in movimento, chi sta fermo non può ricevere. Partenza a velocità di riscaldamento, poi aumenti gradualmente. Nella seconda metà aggiungi la limitazione di massimo 2 tocchi. Obiettivo: scaldare con un esercizio che forza il movimento senza palla, fondamentale per i Giovanissimi che tendono a fermarsi dopo aver passato. Variante: un giocatore per gruppo diventa il fulcro fisso al centro del triangolo e smista sempre di prima. Il ruolo ruota ogni 90 secondi. Chi smista deve tenersi sempre in posizione aperta per vedere tutti e tre i vertici.',
  17, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('triangolo', 'passaggio', 'movimento', 'riscaldamento', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Triangoli in movimento per attivazione tecnica' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corsa tecnica con cambio direzione a segnale',
  'Giocatori in cerchio su metà campo con una palla a testa, jogging libero, tu al centro. Quando alzi il braccio destro: stop con suola più ripartenza a destra. Braccio sinistro: stop più ripartenza a sinistra. Entrambe le braccia: conducono verso di te e ti passano. Progressioni: segnali sempre più veloci, poi fischi sovrapposti, poi comandi solo verbali (''destra'', ''sinistra'', ''a me''). Obiettivo: reattività percettiva integrata con la tecnica base di conduzione. Il cambio da segnale visivo a verbale è più difficile di quanto sembri e mantiene alta l''attenzione nel riscaldamento. Variante: il compagno di fronte diventa lui il ''mister'' e dà i segnali al gruppo. Si allena anche la responsabilità di chi guida.',
  16, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('reattività', 'conduzione', 'segnali', 'riscaldamento', 'cambio direzione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corsa tecnica con cambio direzione a segnale' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Partitella di attivazione 5v5 a due tocchi',
  'Due campi da 30x20m con porte di coni, due partitelle da 5v5 in contemporanea. Regola unica: massimo 2 tocchi. Non si tiene palla — si gioca di prima o si controlla e si passa. Prime due serie da 3 minuti a intensità moderata, terza serie a piena intensità. Pausa 60 secondi tra le serie. Obiettivo: scaldare in modo calcistico con una regola che forza il movimento senza palla e la lettura della situazione prima di ricevere. La limitazione dei tocchi costringe i ragazzi ad alzare la testa prima di ricevere: abitudine fondamentale per i Giovanissimi nel calcio strutturato. Variante: ogni 90 secondi le squadre ruotano. Chi perde sfida i vincitori dell''altro campo. Aggiunge competizione leggera senza aumentare la complessità.',
  18, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('partitella', 'due tocchi', 'riscaldamento', 'attivazione', '5v5'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Partitella di attivazione 5v5 a due tocchi' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione propriocettiva con palla a coppie',
  'Coppie a 6-8m di distanza. Prima serie: entrambi su un piede solo (alternano ogni 30 secondi) si passano la palla a terra in equilibrio monopodalico. Seconda serie: uno in equilibrio su un piede esegue stop e passaggio di ritorno. Terza serie: entrambi camminano su una linea tallone-punta e si passano in movimento. Finisce con 3 minuti di jogging progressivo verso l''80% della frequenza massima. Obiettivo: attivare caviglie, ginocchia e anche con lavoro propriocettivo specifico. I Giovanissimi sono in crescita e la prevenzione infortuni passa dall''allenamento dell''equilibrio dinamico. Variante: aggiungi variazioni di altezza del passaggio (a terra, al petto, sopra la testa) per coinvolgere tutta la catena muscolare e la reazione tecnica in condizioni di instabilità.',
  16, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('propriocezione', 'equilibrio', 'riscaldamento', 'prevenzione', 'coppia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione propriocettiva con palla a coppie' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Percorso tattico guidato come warm-up',
  'Posiziona 8 coni sul campo che rappresentano una formazione 4-3-3. I giocatori partono in due colonne dai coni terzino e raggiungono ogni cono in ordine in jogging con palla, passano a chi è già lì e si spostano al successivo. Tutti si muovono nello stesso momento seguendo il flusso prestabilito. Velocità bassa nelle prime due tornate, poi ritmo medio. Obiettivo: riscaldamento che incorpora già la consapevolezza delle posizioni in campo. I ragazzi imparano la distribuzione spaziale del modulo mentre si scaldano. Particolarmente utile prima di una sessione tattica. Variante: cambia formazione (4-4-2 o 3-5-2) per la seconda tornata. Chiedi ai giocatori di nominare la posizione ogni volta che la raggiungono. Crei consapevolezza del modulo senza spiegazioni frontali.',
  15, 'riscaldamento', 'giovanissimi',
  JSON_ARRAY('modulo', 'posizionamento', 'riscaldamento', 'tattica', '4-3-3'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Percorso tattico guidato come warm-up' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tecnica_individuale (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Controllo orientato e passaggio filtrante',
  'Terzine in un quadrato 15x15m. Un giocatore al centro. La palla arriva da un lato: il centrocampista esegue un controllo orientato verso lo spazio libero opposto e smista verso il terzo lato. Il ricevente non è mai dalla parte da dove è venuta la palla. 6 rotazioni al centro poi si scambia. Progressione: aggiungi un difensore semi-attivo che copre una linea di passaggio. Il giocatore al centro deve leggere quale lato è libero prima ancora di ricevere. Obiettivo: il controllo orientato è il fondamentale più importante per il centrocampo. A questa età va lavorato in modo strutturato e non lasciato al caso. Variante: due giocatori al centro contemporaneamente si combinano prima di smistare. Aumenta la complessità cognitiva e richiede comunicazione verbale tra i due.',
  23, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('controllo orientato', 'passaggio filtrante', 'centrocampo', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Controllo orientato e passaggio filtrante' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stop e conclusione dalla distanza su palla tesa',
  'Fila a 25m dalla porta, palloni in cesta. Il primo riceve un passaggio radente a media velocità da un compagno posto a 45 gradi. Stop col piede forte, orientamento verso porta, conclusione entro 2 secondi. Nessuna pausa tra stop e tiro. 10 ripetizioni per piede, poi scambia il lato di provenienza del passaggio. Il portiere difende attivamente. Obiettivo: allenare la catena controllo orientato-tiro in condizioni di velocità vicine alla gara. A 25m la conclusione deve avere potenza oltre che precisione. Progressione: il passaggio arriva in aria bassa e il giocatore stroppa con petto o coscia e gira verso porta senza aspettare che il pallone si fermi. Variante: il servitore diventa un difensore che chiude appena battuto il tiro. Crea urgenza reale nella finalizzazione.',
  25, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('tiro', 'controllo', 'distanza', 'tecnica', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stop e conclusione dalla distanza su palla tesa' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Dribbling tra sagome con finta e accelerazione',
  '8 sagome in zigzag su 20m. Tra la terza e la quarta c''è un portino di coni. Il giocatore conduce tra le sagome, all''ingresso del portino esegue una finta specifica (elastico, doppio passo o scavetto) e finalizza su porta regolamentare a 15m. Ogni giocatore esegue 3 serie con finte diverse obbligate. Tra le sagome la velocità è libera, la finta deve essere pulita. Obiettivo: integrare il dribbling individuale con la finalizzazione. Le sagome creano l''abitudine alla lettura dello spazio. Variante: inserisci un difensore reale dopo la quarta sagoma che cerca di chiudere il tiro. Non è passivo: deve mettere pressione temporale e psicologica al finalizzatore. Il dribbling non deve essere bello, deve essere efficace nel creare il mezzo metro necessario al tiro.',
  25, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('dribbling', 'finta', 'sagome', 'tecnica', 'accelerazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Dribbling tra sagome con finta e accelerazione' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finta laterale con accelerazione e conduzione',
  'In coppia a 8m di distanza. Un difensore di fronte. Il giocatore in possesso esegue una finta codificata (step over, body feint o stop con suola più cambio di piede) e supera il difensore inizialmente semi-passivo. Dopo aver superato, conduzione di 10m e cross o tiro sul portiere. 5 ripetizioni per lato, poi il difensore diventa completamente attivo. Obiettivo: costruire automatismi della finta e abituarsi a usarla contro un avversario reale. Per i Giovanissimi una finta semplice ben eseguita vale più di tre mosse elaborate. Variante: il difensore può scegliere su quale lato pressare, obbligando l''attaccante a leggere la posizione del difensore prima di muoversi. Si allena la componente percettiva del dribbling: non solo la tecnica ma la lettura della situazione.',
  22, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('finta', 'dribbling', '1v1', 'tecnica individuale', 'accelerazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finta laterale con accelerazione e conduzione' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Primo tocco sotto pressione e scarico veloce',
  'Quadrato 20x10m, due difensori nelle zone laterali che non entrano al centro finché la palla non è arrivata. Un attaccante al centro riceve dal servitore esterno e deve controllare e scaricare prima che i difensori entrino. Tempo massimo: 2 secondi dal controllo al passaggio. Il difensore entra dopo che la palla è partita e valuta se il controllo era orientato correttamente. Obiettivo: allenare il controllo sotto pressione simulando la situazione di centrocampo in gara. La versione con difensori ritardati costruisce l''abitudine tecnica senza frustrare. Variante: riduci il tempo a 1.5 secondi e rendi i difensori immediatamente attivi. Il servitore non comunica da dove arriva la palla: il giocatore deve essere pronto su tutti i fronti contemporaneamente.',
  20, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('primo tocco', 'pressione', 'scarico', 'tecnica', 'centrocampo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Primo tocco sotto pressione e scarico veloce' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpo di testa su cross con inserimento in area',
  'Tre file: crossatori sul lato con cesta di palloni, attaccanti che partono dalla linea di metà campo, difensori in marcatura. Il crossatore serve in area, l''attaccante scatta, il difensore segue. Il colpo di testa deve andare verso il secondo palo, non al centro. Dopo 6 ripetizioni si rotano i ruoli. Progressione: il difensore diventa sempre più aggressivo nel contrasto aereo. Obiettivo: il gioco aereo diventa fattore determinante a questa età. La tecnica corretta va costruita ora: fronte al pallone, colpo con la fronte non con il cranio, occhi aperti fino all''impatto. Variante: aggiungi un secondo attaccante che attacca il primo palo mentre il titolare attacca il secondo. Creano interferenza per il difensore e simulano la situazione di gara reale con movimenti incrociati in area.',
  28, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('colpo di testa', 'cross', 'inserimento', 'area', 'gioco aereo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpo di testa su cross con inserimento in area' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passaggio lungo preciso con il piede debole',
  'Posiziona coni target ogni 5m tra 20 e 35m da una linea di battuta. Il giocatore esegue passaggi lunghi con il piede non dominante cercando di colpire il bersaglio più lontano possibile. 5 tentativi per distanza crescente. Poi variante in movimento: conduzione di 10m e poi calcio lungo senza fermarsi. Obiettivo: il piede debole sul lungo raggio è spesso assente nei Giovanissimi. Va allenato in modo specifico e strutturato, non basta dire ''usa il sinistro''. Variante: due giocatori si scambiano passaggi lunghi entrambi col piede debole. Chi fa più centri sul bersaglio in 5 minuti vince. La competizione mantiene alta la concentrazione anche su un esercizio tecnico ripetitivo che altrimenti i ragazzi percepiscono come noioso.',
  25, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('passaggio lungo', 'piede debole', 'precisione', 'tecnica', 'fondamentali'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passaggio lungo preciso con il piede debole' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Protezione palla in 1v1 e scarico tempestivo',
  'Quadrati di 8x8m, un giocatore in possesso e un difensore. Obiettivo del possessore: proteggere la palla per 10 secondi e poi scaricare verso un servitore esterno. Obiettivo del difensore: rubare palla entro 10 secondi. Dopo ogni round si scambia. Il possessore usa il corpo come scudo: schiena al difensore, gomiti larghi, palla sul piede lontano. Obiettivo: la protezione palla col corpo è un fondamentale spesso ignorato nell''allenamento giovanile. I Giovanissimi che imparano a schermare con il corpo diventano molto più difficili da marcare nei duelli fisici. Variante: aggiungi due servitori esterni su lati diversi. Il possessore sceglie a chi scaricare in base a dove si è spostato il difensore. Allena lettura difensiva e decisione rapida dello scarico.',
  22, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('protezione palla', '1v1', 'corpo', 'scarico', 'fondamentali'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Protezione palla in 1v1 e scarico tempestivo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Ricezione di spalle e girata sul difensore',
  'Fila di attaccanti a 20m dalla porta. Servitore alle spalle in posizione da centrocampista. Il difensore sta tra i due. Il servitore passa, l''attaccante riceve di spalle al portiere col difensore addosso. Deve girarsi e calciare in porta o proteggersi e attendere il momento giusto. Il difensore interviene da subito. 5 ripetizioni a testa poi rotazione. Progressione: il servitore può cambiare lato del passaggio, obbligando l''attaccante a muoversi prima della ricezione. Obiettivo: la ricezione di spalle è tra i movimenti più difficili. Richiede forza fisica, tecnica di protezione e sensing della posizione del difensore. Variante: il servitore può tenere palla fino a 3 secondi prima di passare, allenando l''attesa e il timing del movimento del ricevente.',
  25, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('ricezione di spalle', 'girata', '1v1', 'attaccante', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Ricezione di spalle e girata sul difensore' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Smarcamento con taglio e ricezione in profondità',
  'Metà campo diviso in tre corsie verticali. Tre attaccanti, uno per corsia. Il portatore centrale lancia in profondità nella corsia di destra o sinistra. L''attaccante deve eseguire un taglio preciso (gamba di carica verso il difensore, poi esplosione sul lato opposto) per liberarsi prima di ricevere. Il difensore è presente e attivo. Obiettivo: il taglio per smarcamento in profondità è un movimento che i Giovanissimi devono padroneggiare. In gara è la differenza tra ricevere liberi o in pressing. Variante: aggiungi un segnale del portatore (braccio alzato a destra o sinistra) che indica la direzione del lancio mezzo secondo prima di eseguirlo. Allena la lettura del portatore da parte dell''attaccante prima di avviare il movimento di smarcamento.',
  25, 'tecnica_individuale', 'giovanissimi',
  JSON_ARRAY('smarcamento', 'taglio', 'profondità', 'tecnica', 'attaccante'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Smarcamento con taglio e ricezione in profondità' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (10 sessioni · 25-40 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Costruzione dal basso contro pressing su 4-3-3',
  'Metà campo difensivo, squadra in 4-3-3 (portiere, difensori, centrocampisti, due attaccanti avversari che fanno pressing). La squadra esce con la palla, quella che pressa deve recuperare entro 8 secondi. Primo step: senza opposizione, mostri i corridoi di uscita. Secondo step: pressing semi-attivo. Terzo step: opposizione piena. Obiettivo: l''uscita palla costruita è un processo collettivo con posizioni e scambi codificati. I Giovanissimi sono pronti per concetti così strutturati. Variante: il portiere inizia con palla tra le mani e ha 4 secondi per decidere se servire corto o lanciare lungo. La variabile portiere cambia completamente le posizioni di uscita dei difensori e obbliga il centrocampo ad adeguarsi in tempo reale.',
  30, 'tattica', 'giovanissimi',
  JSON_ARRAY('costruzione dal basso', 'pressing', '4-3-3', 'tattica', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Costruzione dal basso contro pressing su 4-3-3' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Linea difensiva alta e trappola fuorigioco coordinata',
  'Campo intero, 8v8. La squadra difensiva gioca con linea alta a 40m dalla propria porta. Al momento del passaggio verso un attaccante, tutta la linea si alza di 5m in sincrono. Il portiere comunica ad alta voce. Lavori progressivi: prima solo la difesa si alza senza avversari, poi con attaccanti semi-attivi, infine con opposizione piena. Obiettivo: la trappola fuorigioco coordinata richiede comunicazione e sincronia precisa. Non è una tattica rischiosa se ben allenata. Per i Giovanissimi è il momento giusto per imparare il timing del movimento difensivo collettivo. Variante: aggiungi un centrocampista difensivo che partecipa all''alzata della linea comunicando con i difensori. La comunicazione tra mediano e difesa è cruciale in gara e rarissima senza allenamento specifico.',
  35, 'tattica', 'giovanissimi',
  JSON_ARRAY('linea difensiva', 'fuorigioco', 'coordinazione', 'difesa', 'comunicazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Linea difensiva alta e trappola fuorigioco coordinata' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing ultra-offensivo: trigger e scalate',
  'Campo intero, 7v7. La squadra che pressa definisce tre trigger: passaggio al difensore centrale, passaggio indietro al portiere, rimessa laterale avversaria. Quando scatta uno dei tre trigger, la punta va sul portatore e tutti scalano su chi è vicino alla palla. Lavori progressivi: prima su campo dimezzato con pressing leggero, poi intenso, poi su campo intero. Obiettivo: il pressing ultra-offensivo ha regole precise con trigger codificati. I Giovanissimi che capiscono i trigger diventano una macchina da pressing organizzato. Variante: la squadra avversaria conosce i trigger e cerca di evitarli. Chi evita correttamente un trigger guadagna un punto bonus. Crea una sfida tattica reale in cui entrambe le squadre lavorano su un obiettivo dichiarato e consapevole.',
  32, 'tattica', 'giovanissimi',
  JSON_ARRAY('pressing', 'trigger', 'scalate', 'tattica offensiva', 'non possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing ultra-offensivo: trigger e scalate' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Transizione positiva: da recupero palla a 3v2',
  'Campo diviso a metà, due squadre da 7. Quando una squadra recupera palla, ha 5 secondi per creare una situazione di 3v2 verso la porta avversaria. Chi porta la palla in avanti chiama i due compagni più vicini che diventano la catena d''attacco. Gli altri restano a coprire. Se non si crea il 3v2 in 5 secondi, si rigioca dal centro. Obiettivo: allenare la transizione positiva come momento codificato con struttura precisa — chi porta, chi supporta, chi copre. Variante: la situazione di transizione deve passare obbligatoriamente per il mediano centrale come snodo della ripartenza. Allena il ruolo della mezzala come agente di transizione e insegna ai giocatori a identificare il compagno di riferimento nel momento della ripartenza.',
  28, 'tattica', 'giovanissimi',
  JSON_ARRAY('transizione positiva', '3v2', 'contropiede', 'tattica', 'ripartenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Transizione positiva: da recupero palla a 3v2' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Ampiezza e profondità: movimenti ala e centravanti',
  'Metà campo offensivo, 8 giocatori in 4-3-3. Le ali partono sempre larghe sui coni di fondo. Il centrocampista lancia verso un''ala che ha tre opzioni: crossare immediato, entrare e combinare col centravanti, tagliare dentro e tirare. Il centravanti si muove in base alla scelta: se l''ala taglia dentro va sul secondo palo, se l''ala crossa attacca il primo palo. Obiettivo: i movimenti di ala e centravanti devono essere coordinati e complementari. I Giovanissimi spesso si muovono a caso in area. Variante: aggiungi un difensore sull''ala e uno sul centravanti. La scelta dell''ala diventa reale: deve leggere dove è il difensore prima di decidere. La componente percettiva trasforma l''esercizio da schema fisso a situazione di gioco reale.',
  30, 'tattica', 'giovanissimi',
  JSON_ARRAY('ampiezza', 'profondità', 'ala', 'centravanti', 'movimenti offensivi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Ampiezza e profondità: movimenti ala e centravanti' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Raddoppio di marcatura e diagonale di copertura',
  'Campo intero, 8v8. La squadra che difende usa sistematicamente il raddoppio quando la palla è sul lato: il terzino sale sul portatore, il centrocampista esterno chiude il corridoio, il difensore centrale scala verso il centro con diagonale. Lavori progressivi: prima solo movimento senza palla, poi contro avversari che muovono lentamente, poi a ritmo di gara. Obiettivo: il raddoppio con copertura diagonale è un sistema difensivo completo che i Giovanissimi possono apprendere. Non è complicato se si parte dai movimenti senza palla. Variante: l''avversario ha come obiettivo specifico battere il raddoppio con un terzo uomo che arriva dall''interno. Chi riceve in quella situazione fa punto bonus. Crea la situazione di gara più frequente contro cui il raddoppio deve funzionare.',
  35, 'tattica', 'giovanissimi',
  JSON_ARRAY('raddoppio', 'diagonale', 'copertura', 'difesa', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Raddoppio di marcatura e diagonale di copertura' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Fase di non possesso compatta: blocco 4-4-2',
  'Campo intero, 9v9. La squadra in non possesso si organizza in blocco 4-4-2 basso. Le distanze tra le linee non devono mai superare 10m. Prima la squadra difende solo metà campo con le linee chiuse mentre tu muovi la palla per verificare le distanze. Poi opposizione semi-attiva, poi partita piena. Quando la palla va al centro avversario le linee si compattano ulteriormente. Quando va sul lato tutta la squadra si sposta lateralmente in blocco. Obiettivo: il blocco difensivo compatto è organizzazione attiva, non difesa passiva. Variante: aggiungi la regola per cui la squadra in non possesso deve vincere la palla entro 15 secondi altrimenti concede un punto. Crea pressione temporale reale sul recupero e insegna l''urgenza del recupero palla come obiettivo collettivo dichiarato.',
  32, 'tattica', 'giovanissimi',
  JSON_ARRAY('blocco difensivo', '4-4-2', 'non possesso', 'compattezza', 'linee'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Fase di non possesso compatta: blocco 4-4-2' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita palla dal portiere sotto pressing alto',
  'Portiere in porta con 4 difensori. Due punte avversarie fanno pressing attivo. Il portiere ha 4 secondi per distribuire la palla. I difensori si smarcano presentando sempre almeno due linee di passaggio. Lavori progressivi: senza pressing, poi leggero, poi aggressivo. Obiettivo: l''uscita palla dal portiere sotto pressing è una delle situazioni più difficili. Il portiere deve essere il primo costruttore e i difensori devono muoversi per aprirgli le linee. Per i Giovanissimi questo scenario è frequente e causa errori costosi. Variante: aggiungi un terzo pressing avversario e un quinto difensore. La situazione diventa 5v3 ma con pressione molto più realistica. Il portiere deve saper valutare quando costruire corto e quando rinviare lungo in base alla posizione degli avversari.',
  30, 'tattica', 'giovanissimi',
  JSON_ARRAY('uscita palla', 'portiere', 'pressing', 'costruzione', 'difensori'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita palla dal portiere sotto pressing alto' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Inserimento del mezzala da zona interna',
  'Metà campo offensivo, 7 giocatori in 4-3-3. Il mezzala destro o sinistro parte da posizione interna tra le linee avversarie. La circolazione palla arriva al terzino opposto, il mezzala scatta verso lo spazio che si è creato e riceve filtrante. Il centravanti si allarga, l''ala opposta rientra. 6 ripetizioni sul lato destro, poi si cambia sul sinistro. Obiettivo: l''inserimento della mezzala da zona interna è uno dei movimenti più moderni del centrocampo. I Giovanissimi che imparano a muoversi in profondità senza palla diventano molto più pericolosi. Variante: aggiungi un difensore che segue la mezzala. Il timing del movimento deve essere preciso: troppo presto e il difensore segue, troppo tardi e lo spazio si è già chiuso. Allena la lettura del momento giusto per il taglio.',
  28, 'tattica', 'giovanissimi',
  JSON_ARRAY('mezzala', 'inserimento', 'zona interna', 'centrocampo', 'taglio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Inserimento del mezzala da zona interna' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing alto coordinato su rimessa del portiere',
  'Campo intero, 8v8. Una squadra parte con il portiere in mano come da rimessa. L''altra organizza il pressing alto: la punta va sul difensore del servizio, i due centrocampisti coprono i riceventi. Regola: se il pressing recupera palla entro 10 secondi guadagna 2 punti. Se la squadra con il portiere esce pulita guadagna 1 punto. Obiettivo: il pressing organizzato su rimessa del portiere è una delle situazioni più redditizie in gara. I Giovanissimi capiscono che la rimessa è il momento migliore per pressare perché il portiere è vincolato. Variante: il portiere può decidere di lanciare lungo invece di costruire. La squadra in pressing deve avere un piano anche per il lancio lungo: chi vince il duello aereo e chi copre la seconda palla caduta.',
  30, 'tattica', 'giovanissimi',
  JSON_ARRAY('pressing alto', 'rimessa', 'portiere', 'coordinazione', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing alto coordinato su rimessa del portiere' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (prime 5 sessioni su 10 · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondo 7v3 con transizione rapida su recupero',
  'Campo 30x30m, 7 giocatori in possesso contro 3 difensori. Quando i 3 recuperano palla, diventano immediatamente i possessori e 3 degli ex possessori (chi ha perso palla più i due più vicini) diventano i nuovi difensori. Massimo 2 tocchi per chi ha il possesso. Obiettivo: il rondo 7v3 allena sia la tecnica del possesso che la transizione negativa immediata. I 3 che pressano devono farlo con intensità perché hanno un incentivo reale. Variante: i 7 in possesso devono fare almeno 10 passaggi consecutivi prima di poter liberare uno dei difensori. Crea un obiettivo intermedio che tiene alta la concentrazione e insegna la mentalità di mantenere il possesso anche quando si ha già la superiorità numerica.',
  22, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('rondo', '7v3', 'transizione', 'possesso', 'pressione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondo 7v3 con transizione rapida su recupero' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 5v5 più due jolly su metà campo',
  'Metà campo, 5 contro 5 più 2 jolly fissi ai lati che giocano sempre col possesso e hanno massimo 1 tocco. I difensori non possono toccare i jolly. Chi perde palla diventa difensore con i compagni: non c''è squadra fissa. Obiettivo: i jolly allargano il campo e costringono la squadra in possesso a usare i lati. Allena ampiezza, cambio di fronte e lettura dello spazio libero. Variante: da un certo punto i jolly possono essere marcati da un giocatore avversario. Ora la superiorità non è garantita e i giocatori devono crearla con il movimento. La complessità decisionale aumenta in modo graduale senza cambiare la struttura dell''esercizio. Chi usa meglio i jolly nei momenti critici vince il possesso.',
  25, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('possesso', 'jolly', 'ampiezza', 'metà campo', '5v5'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 5v5 più due jolly su metà campo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circolazione con variazione di ritmo lento-veloce',
  '10 giocatori su campo 40x30m, 7v3. Regola speciale: il possesso alterna fase lenta (tocchi liberi, palla tenuta) e fase veloce (3 passaggi veloci di fila obbligatori al tuo fischio). Tu fischi il cambio di fase ogni 20-30 secondi. I difensori non cambiano mai il proprio pressing: sempre al massimo. Obiettivo: allenare la variazione di ritmo nel possesso, qualità rarissima tra i Giovanissimi che spesso giocano tutto a intensità uniforme. Saper rallentare e accelerare è un''arma tattica. Variante: le fasi veloci vengono dichiarate non da te ma da un giocatore designato che chiama ''sprint'' quando vede l''opportunità. Trasferisce la lettura del momento al giocatore e insegna a prendere iniziative tattiche in modo autonomo.',
  25, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('possesso', 'variazione ritmo', 'velocità', 'tattica', 'circolazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circolazione con variazione di ritmo lento-veloce' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso posizionale con terzo uomo libero',
  'Campo 35x25m, 5v3 con jolly di sicurezza sui lati. La squadra in possesso deve sempre cercare il terzo uomo libero: chi non è marcato direttamente. Il terzo uomo cambia a ogni passaggio. Regola: prima di passare il possessore deve alzare la testa e trovare il terzo uomo. Se passa al primo disponibile senza cercarlo, fermati e analizzate insieme. Obiettivo: la lettura del terzo uomo è la base del gioco posizionale. Per i Giovanissimi è un concetto nuovo che alza la qualità del gioco. Variante: ogni terzo passaggio deve arrivare obbligatoriamente al terzo uomo identificato. Rende obbligatoria la visione periferica e insegna a programmare il passaggio due tocchi prima di ricevere la palla.',
  23, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('terzo uomo', 'gioco posizionale', 'visione', 'possesso', 'lettura'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso posizionale con terzo uomo libero' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cambio di fronte su campo largo 9v4',
  'Campo 50x35m, 9 giocatori in possesso contro 4 difensori. Per guadagnare un punto il possesso deve toccare entrambe le linee laterali (destra e sinistra) nello stesso possesso senza perdere palla. I 4 difensori cercano di impedirlo. Obiettivo: il cambio di fronte è l''abilità cruciale per aprire il gioco. I 9 in possesso capiscono subito che non si possono limitare a circolare sul lato dove è la palla. Variante: aggiungi la regola per cui il cambio di fronte deve avvenire con un passaggio diretto (da un lato all''altro in un solo tocco lungo, non graduale). Allena la tecnica del passaggio lungo in contesto di possesso reale e insegna quando è il momento giusto per cambiare fronte in un solo gesto invece di farlo con tre passaggi laterali.',
  22, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('cambio di fronte', 'ampiezza', 'campo largo', 'possesso', 'passaggio lungo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cambio di fronte su campo largo 9v4' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

-- ════════════════════════════════════════════════════════════════════════════
-- STEP A COMPLETATO — 35 INSERT (riscaldamento 10, tecnica_individuale 10,
-- tattica 10, possesso_palla 5). STEP B da appendere separatamente.
-- ════════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (sessioni 6-10 su 10 · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Mantenimento con linee verticali obbligate',
  'Campo 35x25m, 8v4. La squadra in possesso deve inserire almeno un passaggio verticale (in profondità, non laterale) ogni 5 passaggi orizzontali. Il passaggio verticale riuscito guadagna un punto. I 4 difensori cercano di intercettare i verticali che sono i più rischiosi. Obiettivo: molte squadre Giovanissimi giocano tutto di lato e non trovano mai soluzioni in verticale. Questo esercizio rompe l''abitudine e insegna quando e come verticalizzare nel possesso. Variante: il passaggio verticale può essere sostituito da un dribbling verso la linea avanzata. Allena l''alternativa del dribbling alla verticalizzazione, ugualmente efficace se eseguita al momento giusto. Per i Giovanissimi il concetto di giocare verso la porta invece di girare la palla è un salto qualitativo importante.',
  22, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('verticalizzazione', 'possesso', 'linee', 'passaggio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Mantenimento con linee verticali obbligate' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso con pressing a coppie dopo perdita palla',
  'Campo 35x35m, 7v7. Regola speciale: quando si perde palla, i due giocatori più vicini alla perdita formano subito una coppia di pressing e vanno insieme sul portatore avversario. Non è pressing individuale — sempre in due. Gli altri cinque si riorganizzano. Obiettivo: allenare la risposta collettiva immediata alla perdita di palla. Per i Giovanissimi il pressing a coppie è più efficace di quello individuale perché riduce lo spazio del portatore senza lasciare linee di passaggio aperte. Variante: aggiungi la regola per cui la coppia di pressing ha 5 secondi per recuperare la palla. Se ci riescono guadagnano 2 punti per la propria squadra. Se falliscono, la squadra avversaria ottiene 1 punto bonus. Crea urgenza reale nel pressing cooperativo.',
  25, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('pressing', 'coppia', 'transizione negativa', 'possesso', 'recupero'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso con pressing a coppie dopo perdita palla' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Triangolo mediano con vertice mobile in rotazione',
  'Tre centrocampisti (mediano basso più due mezzali) su campo 25x20m con 5 avversari che simulano il pressing su tre zone. I tre mantengono il triangolo sempre orientato verso il portatore. Quando la palla va a una mezzala, il mediano scala sulla sua linea e l''altra mezzala si allarga. Il triangolo ruota ma resta sempre formato. Progressione: aggiungi gli esterni che entrano ed escono dal triangolo. Obiettivo: il triangolo mediano è il cuore del gioco posizionale. I centrocampisti che capiscono il vertice mobile diventano molto difficili da marcare. Variante: la palla non può tornare al mediano basso per due passaggi consecutivi. Costringe le mezzali a trovare soluzioni frontali invece di appoggiarsi sempre al basso.',
  25, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('triangolo', 'mediano', 'mezzala', 'gioco posizionale', 'centrocampo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Triangolo mediano con vertice mobile in rotazione' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso su campo intero con verticalizzazione',
  'Campo intero, 8v5 con portieri. La squadra in possesso può liberare un giocatore verso la porta avversaria con un lancio filtrante. Se il giocatore arriva in area e tira, guadagna 2 punti. Se il possesso continua senza liberare nessuno, ogni 10 passaggi guadagna 1 punto. I difensori intercettano sia i passaggi orizzontali che i lanci filtranti. Obiettivo: il possesso deve avere sempre in mente la verticalizzazione verso la porta. Non è fine a sé stesso. Per i Giovanissimi il passaggio da possesso a finalizzazione deve essere fluido e rapido. Variante: il lancio filtrante deve essere preceduto da almeno 2 passaggi orizzontali che preparano lo spazio. Allena la costruzione dell''azione prima della verticalizzazione e insegna che la verticalizzazione improvvisata raramente funziona.',
  25, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('possesso', 'campo intero', 'verticalizzazione', 'filtrante', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso su campo intero con verticalizzazione' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 8v4 con zone di conquista sui lati',
  'Campo 40x30m, 8 giocatori in possesso contro 4 difensori. Sui lati corti del campo ci sono due zone di conquista da 5m. La squadra in possesso guadagna 1 punto ogni volta che porta la palla in una zona di conquista senza perderla. I difensori cercano di impedire l''accesso alle zone. Obiettivo: allenare l''uso dei lati come opzione di avanzamento. I Giovanissimi tendono a usare solo il centro. Le zone di conquista creano un incentivo reale all''uso delle fasce. Variante: le zone di conquista si spostano ogni 5 minuti: prima sui lati corti, poi sui lati lunghi, poi solo in profondità. Ogni spostamento cambia la geometria del possesso e costringe la squadra ad adattarsi continuamente agli obiettivi dichiarati.',
  25, 'possesso_palla', 'giovanissimi',
  JSON_ARRAY('possesso', 'zone laterali', 'ampiezza', 'occupazione spazio', '8v4'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 8v4 con zone di conquista sui lati' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: finalizzazione (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Combinazione 2v1 con inserimento del terzo uomo',
  'Tre attaccanti, un difensore, portiere. I tre partono da 30m e avanzano. Due portano la palla, il terzo è in posizione laterale come opzione di scarico. Obiettivo: creare e sfruttare il 2v1 con il terzo uomo disponibile. Non si tira subito — prima si costruisce la superiorità, poi si finalizza. Il difensore è attivo. Massimo 3 tocchi per il portatore prima di passare. Progressione: un secondo difensore entra dopo 3 secondi. La finestra del 2v1 si chiude più velocemente. Obiettivo: la finalizzazione a questa età non è solo tecnica del tiro ma lettura del momento giusto. Variante: il terzo uomo può inserirsi in area solo dopo che il 2v1 è stato creato con almeno uno scambio. Evita che si cerchi subito la soluzione più facile senza costruire la superiorità.',
  25, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('2v1', 'terzo uomo', 'finalizzazione', 'combinazione', 'inserimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Combinazione 2v1 con inserimento del terzo uomo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Lancio filtrante e tiro in corsa senza stop',
  'Tre corsie sul campo. In ogni corsia un attaccante parte da 40m e riceve un filtrante dal centrocampista a metà campo. Il tiro deve avvenire in corsa senza fermare la palla. Progressione: prima con pallone in mano per trovare il timing, poi con piede normale, poi con piede debole. Obiettivo: il tiro in corsa su lancio filtrante è uno dei fondamentali offensivi più importanti. A questa età va allenato con palla in movimento e con difensore reale. Il gol in contropiede nasce quasi sempre da questo schema. Variante: aggiungi un difensore che parte contemporaneamente all''attaccante. Chi arriva prima al tiro? Allena la corsa in profondità con la consapevolezza del difensore alle spalle e la decisione di quando tirare.',
  22, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('lancio filtrante', 'tiro in corsa', 'profondità', 'finalizzazione', 'contropiede'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Lancio filtrante e tiro in corsa senza stop' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cross dal fondo con attacco coordinato in area',
  'Crossatori sul lato con cesta di palloni. Tre attaccanti fuori area. Il crossatore converge verso il fondo e serve. I tre si dividono i movimenti: primo palo, secondo palo, zona di rimbalzo. Rotazione dopo ogni cross. Progressione: aggiungi un difensore per attaccante. Il cross arriva comunque. Obiettivo: i movimenti in area su cross devono essere codificati, non improvvisati. I tre attaccanti non devono fare lo stesso movimento nello stesso spazio. L''uscita dall''area prima del cross e il timing del rientro è il dettaglio che separa chi colpisce di testa libero da chi viene marcato. Variante: il crossatore può scegliere se crossare o tagliare verso il centro. I tre attaccanti leggono la scelta e adattano i movimenti: se taglia, uno offre la parete.',
  25, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('cross', 'attacco area', 'movimenti', 'finalizzazione', 'primo palo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cross dal fondo con attacco coordinato in area' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finalizzazione in 1v1 dopo superamento difensore',
  '10m prima dell''area, un difensore affronta un attaccante che arriva dal centro. Il difensore può solo rallentare nei primi 3 secondi (nessun tackle). L''attaccante sceglie la finta, supera e tira. Progressione: il difensore è autorizzato al tackle completo. Dopo 5 ripetizioni si aggiunge un secondo difensore che entra dalla linea laterale dopo 2 secondi. Obiettivo: la finalizzazione in 1v1 va allenata ad alta intensità. Il difensore passivo serve solo a costruire la tecnica: poi deve essere reale. Per i Giovanissimi concludere con pressione è più importante dell''efficacia del tiro senza pressione. Variante: il portiere può uscire a incontrare l''attaccante dopo 2 secondi. Diventa un 1v1 col portiere invece che col difensore. Cambia completamente la soluzione tecnica da adottare.',
  22, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('1v1', 'finalizzazione', 'dribbling', 'pressione', 'tiro'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finalizzazione in 1v1 dopo superamento difensore' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Palla inattiva su corner: blocco e movimento',
  'Battitore sul corner. In area avversaria tre attaccanti con compiti fissi: il primo blocca il difensore del secondo, il secondo attacca il primo palo, il terzo attacca il secondo palo. Un quarto resta al limite dell''area per il rimbalzo. 10 ripetizioni sullo stesso schema, poi si cambia l''assegnazione dei ruoli. Progressione: aggiungi i difensori in marcatura. Obiettivo: il calcio d''angolo è una delle situazioni di palla inattiva più redditizie. Uno schema codificato aumenta significativamente le probabilità di gol. Per i Giovanissimi il blocco va spiegato: non è ostruzione, è occupazione legale di spazio. Variante: aggiungi uno schema corto alternativo (battitore-terzino-cross) che il battitore può scegliere in base al posizionamento difensivo. La scelta tra schema lungo e corto allena la lettura tattica.',
  28, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('calcio d''angolo', 'palla inattiva', 'blocco', 'schema', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Palla inattiva su corner: blocco e movimento' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpo di testa su palla servita in quota',
  'Fila di attaccanti a 12m dalla porta. Servizio in quota verso l''area (lanciato dall''alto o da un crossatore). L''attaccante scatta, salta e colpisce di testa. La palla può arrivare da sinistra, destra o frontale: l''attaccante adatta la rincorsa in base alla traiettoria. Progressione: aggiungi un difensore che salta insieme — prima non contrasta, poi contrasta attivamente. Obiettivo: il colpo di testa in salto su palla alta è un fondamentale che a questa età si lavora in modo specifico. La tecnica corretta (colpo con la fronte non con il cranio, occhi aperti fino all''impatto, slancio delle braccia per il salto) deve essere automatizzata prima che l''intensità agonistica sia alta. Variante: la palla viene servita dal corner man per simulare la traiettoria reale del cross. Calcola traiettoria e timing come in gara.',
  25, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('colpo di testa', 'palla alta', 'salto', 'fondamentali', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpo di testa su palla servita in quota' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro dalla distanza dopo triangolo uno-due',
  'Giocatore parte da 25m con palla. A 20m incontra un compagno fisso. Fa uno-due e si ritrova tra 18 e 22m dalla porta. Tiro immediato entro 1.5 secondi dalla ricezione. 3 serie da 8 ripetizioni, alternando lato destro e sinistro dello uno-due. Il portiere difende attivamente. Obiettivo: il tiro dalla distanza dopo combinazione è una delle soluzioni offensive più efficaci. Lo uno-due crea mezzo metro di vantaggio sul difensore: abbastanza per tirare senza pressione diretta. Per i Giovanissimi il passaggio chiave è il timing dello uno-due: l''appoggio deve essere rapido per non perdere il vantaggio creato. Variante: aggiungi un difensore che segue il giocatore dallo uno-due. Ora il vantaggio è reale ma si chiude velocemente. Il tiro deve essere ancora più veloce.',
  22, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('tiro distanza', 'uno-due', 'combinazione', 'finalizzazione', 'potenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro dalla distanza dopo triangolo uno-due' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Contropiede 3v2 a velocità massima verso porta',
  'Due squadre da 5 più portieri su campo intero. Quando una squadra recupera palla, va in contropiede con massimo 3 giocatori (chi porta più i due più avanti). Gli altri 2 restano in copertura. La difesa ha solo 2 giocatori che rientrano. Regola: il contropiede deve arrivare a tiro entro 8 secondi dal recupero. Se non arriva a tiro si rigioca lentamente. Obiettivo: il contropiede 3v2 è una delle situazioni più prolifiche in gara. I Giovanissimi spesso rallentano troppo o coinvolgono troppi giocatori. La regola dei 3 attaccanti e degli 8 secondi crea urgenza reale. Variante: il 3v2 deve arrivare in area senza tiro dalla distanza. Costringe i giocatori a costruire il vantaggio vicino alla porta invece di tentare il gol da fuori.',
  25, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('contropiede', '3v2', 'velocità', 'finalizzazione', 'transizione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Contropiede 3v2 a velocità massima verso porta' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Combinazione ala-centravanti: dai e vai in area',
  'Ala parte dalla metà campo e avanza lungo la corsia esterna. A 25m dall''area fa uno-due con il centravanti al limite. L''ala rientra in area e il centravanti offre in profondità. Se il centravanti è pressato, l''ala può tirare direttamente. Il portiere difende. Progressione: difensore sull''ala e uno sul centravanti. Lo schema deve funzionare ugualmente: se il difensore segue il centravanti, questi fa la parete e si inserisce. Se segue l''ala, il centravanti smarca verso il secondo palo. Obiettivo: la combinazione ala-centravanti con lettura difensiva è un salto qualitativo. Non basta eseguire lo schema, bisogna leggere dove è il difensore. Variante: aggiungi un terzino avversario che entra dalla corsia esterna dopo 3 secondi. L''ala deve accelerare prima che chiuda il corridoio.',
  25, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('ala', 'centravanti', 'dai e vai', 'combinazione', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Combinazione ala-centravanti: dai e vai in area' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finalizzazione su schema palla inattiva laterale',
  'Rimessa laterale a 25m dalla porta. Due schemi codificati: schema A — la rimessa va al terzino che crossa con gli attaccanti in movimento codificato in area. Schema B — la rimessa è corta, il ricevente conduce verso il centro e tira o serve il centravanti. I giocatori scelgono lo schema in base al posizionamento dei difensori avversari. 5 ripetizioni per schema, poi libera scelta. Obiettivo: le palle inattive laterali sono spesso casuali. Avere uno schema codificato dà un vantaggio tattico reale. Per i Giovanissimi sviluppa sia la memoria tattica che la lettura della difesa. Variante: un difensore ha l''obiettivo specifico di bloccare lo schema A. Chi in attacco si accorge per primo che lo schema A è bloccato e comunica il cambio allo schema B guadagna un punto bonus.',
  25, 'finalizzazione', 'giovanissimi',
  JSON_ARRAY('palla inattiva', 'rimessa laterale', 'schema', 'finalizzazione', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finalizzazione su schema palla inattiva laterale' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: atletica_fisico (10 sessioni · 15-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Intermittente 10-20-30 con palla in campo',
  'I giocatori su tutto il campo con palla. Serie: 10 secondi di conduzione lenta, 20 secondi di corsa media con palla, 30 secondi di sprint portando la palla il più lontano possibile. Recupero 1 minuto poi si ripete. 3 serie totali. Nella terza serie al termine degli sprint il giocatore tira immediatamente in porta. Obiettivo: il lavoro intermittente 10-20-30 è uno dei protocolli più efficaci per la resistenza aerobica nei giovani. Integrarlo con la palla lo rende calcisticamente specifico. I Giovanissimi iniziano la preparazione atletica strutturata e questo protocollo è ideale come primo approccio. Variante: nella fase degli sprint il giocatore non ha la palla ma raggiunge un compagno che la tiene e la riceve col timing esatto prima di tirare.',
  20, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('intermittente', 'resistenza', 'sprint', 'aerobico', 'preparazione atletica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Intermittente 10-20-30 con palla in campo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Accelerazioni brevi con palla e cambio direzione',
  'Coppie a 15m di distanza con una palla. Uno conduce verso il compagno. A 5m esegue uno stop con suola più accelerazione a destra o sinistra, poi sprint fino alla linea opposta. Il compagno scatta verso la posizione originale del conducente. Agli estremi ci sono due porte di coni. Chi arriva alla porta giusta (comunicata dal compagno mentre si corre) fa un tiro. 5 ripetizioni per lato poi si scambia. Obiettivo: accelerazione esplosiva con cambio di direzione integrata con palla è il pattern più comune nel gioco reale. I Giovanissimi a questa età hanno le capacità coordinative per lavorarlo in modo specifico. Variante: il segnale del lato giusto viene dato con un gesto invece della voce. Allena la lettura visiva periferica mentre si corre a velocità massima.',
  20, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('accelerazione', 'cambio direzione', 'rapidità', 'esplosività', 'atletismo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Accelerazioni brevi con palla e cambio direzione' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Skip e balzelli: forza naturale e coordinazione',
  'Corridoio di 15m segnato con coni. Sequenza: 10m di skip alto, poi 5m di balzelli a due piedi su coni bassi da 10-15cm, poi sprint di 10m finale. Recupero completo 60 secondi tra le ripetizioni. 6-8 ripetizioni totali. Progressioni nelle serie successive: skip basso veloce, gambe tese, skip con rotazione del busto. Obiettivo: il lavoro di skip e balzelli a carico naturale è il modo migliore per sviluppare forza muscolare negli arti inferiori a questa età senza sovraccarichi. I Giovanissimi che lavorano con metodo costruiscono una base muscolare che previene infortuni nelle stagioni successive. Variante: alla fine del percorso aggiungi una ricezione palla servita da un compagno e un tiro immediato in porta. Integra il lavoro atletico con il gesto tecnico.',
  18, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('skip', 'balzelli', 'forza naturale', 'coordinazione', 'prevenzione infortuni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Skip e balzelli: forza naturale e coordinazione' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pliometria leggera: saltelli e rapidità coordinata',
  '5 esercizi da 30 secondi ciascuno con 30 secondi di recupero: saltello bipodalico avanti-indietro su una linea, saltello monopodalico laterale su cerchio a terra, balzo verticale con ricezione morbida, doppio saltello più sprint di 5m, box jump su gradino da 20cm e scesa controllata. 3 serie. Solo corpo libero, nessun peso. Obiettivo: la pliometria leggera a 13-14 anni è sicura e molto efficace per reattività, potenza dei balzi e coordinazione neuro-muscolare. Pone le basi per un lavoro atletico più intenso nelle stagioni successive. L''obiettivo principale è la tecnica dell''atterraggio morbido sulle punte, prima ancora della potenza del balzo. Variante: aggiungi una palla dopo ogni serie di saltelli. Il giocatore deve reagire e colpirla di testa o controllarla. Allena la reattività tecnica post-sforzo.',
  18, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('pliometria', 'saltelli', 'reattività', 'balzi', 'coordinazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pliometria leggera: saltelli e rapidità coordinata' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuito resistenza aerobica: 6 stazioni in campo',
  '6 stazioni distribuite sul campo, ogni stazione dura 40 secondi con 20 secondi di recupero in spostamento. Stazione 1: conduzione veloce in slalom tra 10 coni. Stazione 2: stop e vai a spina di pesce con 4 coni. Stazione 3: scaletta agility a velocità massima. Stazione 4: passaggio a parete e recupero sprint. Stazione 5: tiro in porta da posizione laterale. Stazione 6: jogging di recupero intorno a cono lontano. 3 giri completi. Obiettivo: il circuito intermittente allena la resistenza aerobica specifica al calcio mantenendo la componente tecnica a ogni stazione. I Giovanissimi lo vivono come allenamento intenso, non come preparazione atletica astratta. Variante: nella seconda serie le stazioni 1 e 3 diventano sprint massimali senza palla. Il contrasto lavoro tecnico-atletico puro mantiene alta l''intensità metabolica.',
  25, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('circuito', 'resistenza', 'stazioni', 'aerobico', 'intermittente'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuito resistenza aerobica: 6 stazioni in campo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Scaletta agility con uscita tecnica e tiro',
  'Scaletta orizzontale da 8-10 scalini. Al termine: ricezione di un passaggio dal lato (compagno con cesta), controllo orientato verso porta, tiro. La sequenza di scaletta varia ogni round: piede alternato classico, due piedi per scalino, laterale, laterale incrociato. Recupero 40 secondi tra le serie. 8 serie totali. Obiettivo: la scaletta integrata con uscita tecnica è il modo più efficace per lavorare sulla rapidità di gambe in contesto calcisticamente specifico. Il passaggio che arriva a fine scaletta è a altezza e forza variabile per simulare la ricezione in gara dopo uno spostamento rapido. Variante: la ricezione è col piede debole obbligatorio. Poi alterna scaletta col piede forte e ricezione col piede debole. Il lavoro asimmetrico sui due piedi è uno degli obiettivi tecnici principali dei Giovanissimi.',
  20, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('scaletta agility', 'rapidità gambe', 'tecnica', 'tiro', 'coordinazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Scaletta agility con uscita tecnica e tiro' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corsa tecnica avanzata con andature specifiche',
  'Percorso di 30m sul lato del campo. Sequenza avanzata di andature: skip alto con rotazione delle braccia, corsa calciata con ginocchio alto, balzelli con atterraggio morbido, corsa laterale a passo incrociato, corsa en dedans. Ogni andatura andata di 30m, ritorno in jogging. Totale: 8 andature diverse. Le ultime due finiscono con sprint di 10m a massima velocità. Obiettivo: le andature avanzate sviluppano la meccanica di corsa corretta che i Giovanissimi non hanno ancora automatizzato. La meccanica sbagliata può essere corretta con lavoro specifico a questa età. Variante: nelle ultime 4 andature aggiungi una palla. Il giocatore esegue l''andatura mentre porta la palla ai piedi. Aumenta la difficoltà coordinativa in modo progressivo e rende il lavoro più simile alla situazione di gara reale.',
  20, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('andature', 'corsa tecnica', 'meccanica', 'coordinazione', 'atletismo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corsa tecnica avanzata con andature specifiche' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuit training a carico naturale: 5 esercizi',
  '5 esercizi in sequenza senza attrezzi: 20 squat a carico naturale, 15 affondi avanzanti alternati, 20 skip sul posto ad alta intensità, 10 balzi verticali con ricezione morbida, 30 secondi di plank frontale. Recupero 90 secondi tra le serie. 3 serie. Obiettivo: la forza funzionale a carico naturale è la base atletica su cui costruire tutto il resto. A questa età non servono pesi o macchine: bastano 5 esercizi classici a corpo libero per sviluppare la catena cinetica degli arti inferiori e del core. I Giovanissimi che adottano questa routine vedono miglioramenti nella velocità e nella forza del tiro. Variante: rendi il circuito competitivo — chi completa le 3 serie più velocemente con buona tecnica guadagna un vantaggio nella partitella finale. La competizione aumenta l''intensità senza che tu debba spingere.',
  18, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('circuit training', 'corpo libero', 'forza', 'core', 'carico naturale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuit training a carico naturale: 5 esercizi' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Accelerazioni con reazione al segnale visivo',
  'Giocatori in posizione di attesa diversa ogni volta: in piedi, seduti, sdraiati a pancia in giù. Tu dai un segnale visivo (cono colorato alzato) o verbale (nome del giocatore). Chi riceve il segnale sprint verso un bersaglio a 15m. Chi non riceve il segnale resta fermo. Regola: non scattare prima del segnale — penalità di 5 piegamenti per chi parte in anticipo. 15-20 ripetizioni totali. Obiettivo: il tempo di reazione è una qualità atletica allenabile. La combinazione di posizione di partenza diversa e tipo di segnale variabile mantiene alta l''allerta cognitiva. Variante: il segnale per scattare viene dato da un compagno invece che da te. Il compagno può fingere prima del segnale reale. Allena l''attenzione selettiva e la capacità di non reagire agli stimoli falsi.',
  18, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('reazione', 'accelerazione', 'segnale', 'tempo reazione', 'esplosività'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Accelerazioni con reazione al segnale visivo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Partitella a campo stretto per resistenza specifica',
  'Campo 30x25m, 8v8. Partita continua senza interruzioni per 20 minuti con solo le regole del fuorigioco e del fallo pericoloso. Rimesse veloci, calci d''angolo immediati, nessun fermo. Frequenza cardiaca obiettivo: 85-90% della massima. Tu osservi e fischi solo falli pericolosi. Obiettivo: la partitella a campo stretto con poche interruzioni è il modo più efficiente per sviluppare la resistenza aerobica specifica. I Giovanissimi corrono di più quando giocano che durante le corsette. La componente agonistica aumenta automaticamente l''intensità. Variante: aggiungi la regola del gol solo di testa — ogni gol normale vale 1 punto, ogni gol di testa vale 2. Modifica l''equilibrio tattico e costringe ad alzare la palla, aumentando ulteriormente la distanza percorsa e l''intensità.',
  22, 'atletica_fisico', 'giovanissimi',
  JSON_ARRAY('partitella', 'resistenza', 'aerobico', 'campo stretto', 'intensità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Partitella a campo stretto per resistenza specifica' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: portieri (10 sessioni · 25-35 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Presa alta in salto su cross da entrambi i lati',
  'Due crossatori sui lati con cesta di palloni. Il portiere parte dalla posizione di base. Crossatore sinistra o destra serve in area alta. Il portiere deve uscire, saltare e prendere la palla con le due mani al punto più alto. Alternanza ogni 3 cross. Progressione: aggiungi un attaccante che arriva insieme (prima non contrasta, poi contrasta attivamente). Obiettivo: la presa alta in uscita su cross è uno dei momenti più difficili per il portiere. La tecnica corretta (slancio del ginocchio libero, presa ferma, atterraggio sicuro) va costruita senza pressione prima. Per i Giovanissimi la competenza aerea del portiere fa la differenza sui calci d''angolo. Variante: il cross arriva dal corner man posizionato sul corner. Più angolato e difficile da leggere: il portiere deve capire la traiettoria prima di scattare.',
  30, 'portieri', 'giovanissimi',
  JSON_ARRAY('presa alta', 'cross', 'uscita', 'portiere', 'gioco aereo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Presa alta in salto su cross da entrambi i lati' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tuffo in allungo su tiro a giro e palla angolata',
  'Tiratori a 20m in posizione di tre quarti. Battono un tiro a giro che curva verso il secondo palo. Il portiere parte dal primo palo, valuta la traiettoria e si tuffa verso il secondo palo con un passo laterale rapido prima del tuffo. Non basta allungarsi: serve muoversi prima. 10 tiri per lato, poi stesso schema dal lato opposto. Progressione: il tiratore può battere tiro teso invece che a giro. Il portiere non sa in anticipo quale arriverà. Obiettivo: il tiro a giro è tra i più difficili da parare perché cambia direzione a metà traiettoria. Allenare la lettura della curva è una competenza specifica. Variante: il tiratore può anche crossare invece di tirare. Il portiere deve uscire o restare in base alla traiettoria che capisce nei primi metri di volo della palla.',
  28, 'portieri', 'giovanissimi',
  JSON_ARRAY('tuffo', 'tiro a giro', 'parata', 'portiere', 'lettura traiettoria'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tuffo in allungo su tiro a giro e palla angolata' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita coraggiosa sul pallone conteso in area',
  'Un attaccante riceve palla a 12m dalla porta con le spalle alla porta. Si gira. Il portiere deve uscire e ridurre l''angolo in modo aggressivo entro 3 secondi. Non aspetta il tiro. Un secondo attaccante corre verso l''area per ricevere un possibile scarico. Il portiere deve uscire sul pallone primario senza perdere di vista il secondo. Progressione: l''attaccante può passare al secondo invece di tirare. Obiettivo: l''uscita coraggiosa richiede coraggio e tecnica precisa. I portieri che non escono concedono sempre la soluzione facile. Chi esce bene dimezza le possibilità di gol. Variante: l''attaccante riceve frontalmente a 16m. Il portiere decide se uscire riducendo l''angolo o restare in porta. Non c''è una risposta giusta: si allena il processo decisionale nelle situazioni di 1v1.',
  28, 'portieri', 'giovanissimi',
  JSON_ARRAY('uscita', 'coraggio', '1v1', 'portiere', 'riduzione angolo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita coraggiosa sul pallone conteso in area' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rinvio lungo con piede forte e piede debole',
  'Il portiere ha 10 palloni. 5 rinvii con il piede forte, 5 con il piede debole. Obiettivo: raggiungere il compagno più lontano in campo con precisione. La tecnica del rinvio lungo richiede rincorsa, punto di impatto sotto la palla per alzarla e seguita del piede senza bloccarsi dopo il contatto. Progressione: il rinvio deve raggiungere una zona specifica del campo (fascia destra o sinistra). Poi si aggiunge un compagno che deve ricevere in corsa. Obiettivo: il rinvio lungo preciso è un''arma offensiva del portiere moderno. I Giovanissimi che imparano a rinviare lungo con entrambi i piedi danno alla squadra una ripartenza immediata. Variante: aggiungi un difensore avversario che parte in contemporanea al rinvio. Il portiere valuta se costruire corto o rinviare lungo in base alla posizione degli avversari.',
  28, 'portieri', 'giovanissimi',
  JSON_ARRAY('rinvio', 'piede debole', 'portiere', 'fondamentali', 'distribuzione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rinvio lungo con piede forte e piede debole' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gioco coi piedi sotto pressing: costruzione bassa',
  '3 difensori più portiere contro 2 punte che fanno pressing attivo. Il portiere ha 4 secondi per distribuire la palla. I difensori si smarcano presentando almeno due linee di passaggio. Lavoro progressivo: senza pressing, poi leggero, poi aggressivo. La regola chiave: il portiere può sempre rinviare lungo se non trova il passaggio corto. Obiettivo: il gioco coi piedi del portiere sotto pressing è la competenza più richiesta nel calcio moderno. I Giovanissimi con portieri capaci coi piedi gestiscono meglio le rimesse e la costruzione. Variante: il portiere può uscire dall''area e ricevere come libero aggiuntivo. Diventa difensore aggiunto ma perde la protezione dei propri pali. Crea una scelta di rischio-beneficio reale che allena il giudizio situazionale del portiere.',
  30, 'portieri', 'giovanissimi',
  JSON_ARRAY('piedi', 'costruzione bassa', 'portiere', 'pressing', 'distribuzione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gioco coi piedi sotto pressing: costruzione bassa' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Comunicazione difensiva: organizzare la linea',
  'Il portiere con 4 difensori in posizione. La squadra avversaria simula un attacco da destra. Il portiere comunica continuamente: ''sali!'' quando la linea può alzarsi, ''rimani!'' quando la linea non si muove, ''fuorigioco!'' per la trappola. Prima senza palla: i difensori si muovono solo sui comandi del portiere. Poi con palla lenta. Poi a ritmo di gara. Obiettivo: la comunicazione verbale del portiere è una competenza che si allena, non nasce spontanea. I Giovanissimi spesso hanno portieri silenziosi. Un portiere che comanda la difesa è un valore aggiunto enorme. Variante: aggiungi due centrocampisti in schermo. Il portiere deve comunicare anche con loro per coprire gli spazi interni. La complessità della comunicazione aumenta e si avvicina alla situazione di gara reale.',
  30, 'portieri', 'giovanissimi',
  JSON_ARRAY('comunicazione', 'linea difensiva', 'portiere', 'voce', 'organizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Comunicazione difensiva: organizzare la linea' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate riflesse su serie di tiri ravvicinati',
  'Il portiere in porta, tu a 8m con cesta. Tiri in sequenza rapida (ogni 3-4 secondi) verso angoli alternati: basso destra, basso sinistra, alto destra, alto sinistra. Non aspetti che il portiere si riposizioni completamente. Deve recuperare dalla parata e rimettersi in posizione il più velocemente possibile. 4 serie da 8 tiri, recupero 90 secondi. Obiettivo: la reattività in parate consecutive è fondamentale nelle situazioni di angolo e palla rimbalzata in area. Il portiere che si riposiziona veloce dopo ogni parata è molto più efficace di chi rimane a terra. Per i Giovanissimi sviluppa la reattività riflessa e il coraggio di buttarsi ripetutamente. Variante: i tiri vengono battuti da tre tiratori che si alternano. La direzione non è prevedibile perché cambia il tiratore.',
  28, 'portieri', 'giovanissimi',
  JSON_ARRAY('parate', 'riflessi', 'reattività', 'portiere', 'tiri ravvicinati'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate riflesse su serie di tiri ravvicinati' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rilancio di mano: rullata, laterale e schiacciato',
  'Il portiere con 8 palloni. Serie 1: rullata verso un compagno a 20m (la palla deve arrivare veloce e a terra). Serie 2: lancio laterale a 25m (lancio rollante con rotazione del braccio verso l''esterno). Serie 3: lancio schiacciato verso zona specifica del campo (palla alta che arriva morbida come un passaggio aereo). 5 ripetizioni per serie. Obiettivo: il rilancio con le mani è l''alternativa al rinvio col piede. Il portiere che sa rilanciare in tre modi diversi sceglie sempre la soluzione giusta in base alla posizione del compagno. La rullata è veloce ma corta, il laterale è medio, lo schiacciato è lungo ma preciso. Variante: aggiungi un difensore avversario che tenta di intercettare il rilancio. Il portiere varia traiettoria e tipo di rilancio in base alla posizione del difensore.',
  28, 'portieri', 'giovanissimi',
  JSON_ARRAY('rilancio mano', 'rullata', 'distribuzione', 'portiere', 'fondamentali'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rilancio di mano: rullata, laterale e schiacciato' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Presa al secondo palo su cross teso e profondo',
  'Crossatori alternati sui due lati. Cross teso basso verso il secondo palo. Il portiere parte dal centro, valuta la traiettoria, si posiziona sul secondo palo e prende in anticipo sull''attaccante che arriva da dietro. Non aspetta che la palla arrivi: si muove appena il crossatore colpisce. 10 cross per lato. Progressione: il cross può essere sia teso che alzato. Il portiere distingue le traiettorie e agisce di conseguenza. Obiettivo: la presa al secondo palo richiede lettura anticipata del cross. È una delle competenze più difficili del portiere perché richiede di muoversi prima, non dopo. Per i Giovanissimi va costruita con cross prevedibili prima di passare a quelli imprevedibili. Variante: aggiungi un attaccante che sfida il portiere sulla presa. Chi arriva prima vince il duello aereo.',
  30, 'portieri', 'giovanissimi',
  JSON_ARRAY('secondo palo', 'cross', 'presa', 'portiere', 'anticipo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Presa al secondo palo su cross teso e profondo' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il portiere costruttore nella partitella 8v8',
  'Partitella 8v8 su campo intero con regola speciale: il portiere può entrare in campo come nono giocatore in possesso. Può ricevere, condurre e passare. Se perde la palla in campo, la squadra avversaria può tirare nella porta vuota. Il portiere non può superare la metà campo. La squadra avversaria ha una punta in meno quando il portiere è in campo. Obiettivo: il portiere costruttore è una tendenza del calcio moderno che i Giovanissimi devono iniziare a conoscere. L''esercizio è anche psicologico: il portiere deve avere il coraggio di uscire e rischiare. Variante: il portiere deve obbligatoriamente partecipare almeno una volta ogni 3 possessi della propria squadra. Non può restare passivo in porta se la squadra ha la palla. Crea l''abitudine alla partecipazione attiva alla manovra.',
  28, 'portieri', 'giovanissimi',
  JSON_ARRAY('portiere costruttore', 'partitella', 'piedi', 'modernità', 'costruzione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il portiere costruttore nella partitella 8v8' AND eta_leva = 'giovanissimi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICA FINALE
-- ════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) AS totale_giovanissimi FROM sessioni_libreria
WHERE ufficiale_myvivaio = TRUE AND eta_leva = 'giovanissimi';
