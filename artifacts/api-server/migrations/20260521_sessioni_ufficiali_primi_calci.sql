-- ═══════════════════════════════════════════════════════════════════════════
-- MyVivaio — Sessioni Ufficiali Categoria PRIMI CALCI (U6/U7)
-- File:    20260521_sessioni_ufficiali_primi_calci.sql
-- Totale:  70 sessioni · 10 per ciascuna delle 7 categorie
-- Data:    2026-05-21
-- Autore:  MyVivaio Editorial Team
-- ───────────────────────────────────────────────────────────────────────────
-- STEP A (questo file): 35 INSERT
--   riscaldamento 10, tecnica_individuale 10, tattica 5, possesso_palla 10
-- STEP B (da appendere): 35 INSERT
--   tattica 5, finalizzazione 10, atletica_fisico 10, portieri 10
-- ───────────────────────────────────────────────────────────────────────────
-- FILOSOFIA PRIMI CALCI: è gioco, non allenamento. La palla è un''amica.
-- Ogni esercizio è travestito da gioco. Zero agonismo. Zero eliminazioni.
-- Attenzione max 8-10 min. Spazi 5x5-10x10m. Max 2v2/3v3.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── IDEMPOTENZA ────────────────────────────────────────────────────────────
-- Ogni INSERT usa SELECT … WHERE NOT EXISTS su (titolo, eta_leva, ufficiale_myvivaio).
-- ─────────────────────────────────────────────────────────────────────────────


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: riscaldamento (10 sessioni · 5-10 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il semaforo magico',
  'Ogni bambino ha la sua palla e si muove libero in uno spazio 10x10m. Tu fai da semaforo con le casacche colorate: verde alzata = corri con la palla, gialla = rallenta e tocca la palla con un piede solo, rossa = piede sulla palla e fermo come una statua. Cambia i colori ogni 5-8 secondi, lentamente all''inizio poi sempre più veloce. Alla fine urla ''verde superveloce!'' e tutti corrono in cerchio intorno allo spazio. L''obiettivo non è andare veloci, è reagire insieme: ridi con loro quando qualcuno fa confusione, premia tutti alla fine. Variante: aggiungi il colore blu = salta sopra la palla con tutt''e due i piedi.',
  7, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('semaforo', 'reazione', 'palla', 'colori', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il semaforo magico' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gli orsetti vanno a raccogliere il miele',
  'Spargi 10-12 coni colorati in uno spazio 10x10m: ogni cono è un alveare pieno di miele. Ogni bambino è un orsetto con la sua palla (il suo barattolo). Devono condurre la palla fino a un cono, toccare il cono con la mano libera (prendono il miele!) e andare al prossimo. Conta ad alta voce quanti alveari visita ogni orsetto in 60 secondi. Non c''è gara: ogni orsetto batte il suo record personale. Festeggia ogni bambino con un applauso a fine turno. Variante: alcuni coni sono ''alveari vuoti'' (li dici tu) e l''orsetto deve evitarli e trovare un altro.',
  8, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('conduzione', 'coni', 'orientamento', 'gioco', 'inclusione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gli orsetti vanno a raccogliere il miele' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Serpentino degli animali',
  'I bambini si mettono in fila indiana con la palla tra i piedi. Il primo della fila è il ''capo animale'' e decide come muoversi: come un granchio (di lato), come un canguro (a saltelli), come un elefante (lento e pesante). Tutti imitano facendo avanzare la palla allo stesso modo. Ogni 30 secondi il capo animale va in fondo e chi era secondo diventa il nuovo capo. Ridi con loro quando inventano movimenti assurdi — è fantastico. Non esiste una tecnica giusta o sbagliata: l''importante è che la palla rimanga vicina ai piedi e che tutti ridano.',
  7, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('animali', 'imitazione', 'coordinazione', 'palla', 'divertimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Serpentino degli animali' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La pioggia di stelle (tocchi sul posto)',
  'Ogni bambino sta con la palla ferma davanti a sé in uno spazio libero. Tu sei la nuvola magica: quando dici ''pioggia'' battono colpi veloci sulla palla con un piede solo (più tocchi possibile), quando dici ''arcobaleno'' la girano piano intorno con la suola, quando dici ''stella cadente'' la spingono avanti di 2 passi e tornano. Inizia con ritmo lento, poi accelera. Non serve contare i tocchi: quello che conta è che tutti partecipino e nessuno si senta in difetto. Variante: ''fulmine'' = saltano sopra la palla con entrambi i piedi e atterrano morbidi come gatti.',
  6, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('tocchi', 'ritmo', 'fantasia', 'palla', 'attivazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La pioggia di stelle (tocchi sul posto)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'I robot si svegliano',
  'I bambini camminano rigidi come robot (braccia tese, passi meccanici) spingendo la palla con il piede. Quando dici ''aggiornamento!'' si fermano, fanno 3 tocchi sulla palla con il piede destro, 3 con il sinistro, e ripartono. Quando dici ''batteria scarica'' rallentano fino quasi a fermarsi. Quando dici ''turbo!'' accelerano al massimo per 5 secondi poi tornano a ritmo normale. Nessun robot è più bravo dell''altro: sono tutti modelli diversi con caratteristiche diverse. Festeggia il robot più creativo, il robot più veloce, il robot più preciso — tutti ricevono un titolo.',
  7, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('robot', 'tocchi', 'fantasia', 'coordinazione', 'ritmo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'I robot si svegliano' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La caccia al dinosauro',
  'In uno spazio 10x10m metti 2-3 coni grandi colorati: sono i dinosauri addormentati. I bambini conducono la palla liberi nello spazio evitando i dinosauri. Quando dici ''il dinosauro si sveglia!'' indicano tutti insieme il cono più vicino a loro. Chi è riuscito a evitarlo ride e batte le mani. Non c''è nessuno che vince o perde: l''obiettivo è vedere chi riesce a stare lontano da tutti i dinosauri allo stesso tempo. Variante: tu muovi lentamente un cono (il dinosauro cammina) e i bambini devono tenergli lontana la palla. Tienilo divertente e leggero.',
  8, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('dinosauri', 'spazio', 'conduzione', 'evitare', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La caccia al dinosauro' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pirati sull''isola (giro della palla)',
  'Ogni bambino è un pirata con il suo tesoro (la palla). Si muovono liberi in uno spazio 8x8m. Quando dici ''tempesta!'' devono raggiungere un''isola (un cono grande) e girare intorno ad essa con la palla. Quando dici ''mare calmo'' si allontanano di nuovo. Le isole devono bastare per tutti: nessun pirata rimane senza isola. Varia le tempeste con altri comandi: ''squalo!'' = tutti al centro, ''vento!'' = cambio di direzione. Il clima deve essere sempre festoso — un pirata che inciampa è un pirata che sta imparando a navigare.',
  8, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('pirati', 'coni', 'spazio', 'cambi direzione', 'fantasia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pirati sull''isola (giro della palla)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il vulcano che trema',
  'Metti una palla grande al centro (il vulcano). I bambini conducono le loro palline intorno al vulcano in cerchio senza toccarla. Quando dici ''eruzione!'' devono allontanarsi il più veloce possibile verso i bordi dello spazio. Quando dici ''torna al vulcano'' tornano piano in cerchio. Ripeti 4-5 volte con tempi diversi per sorprenderli. Aggiungi ''mini-eruzione'' = si allontanano di 3 passi soltanto. Ridi con loro quando si scontrano nella corsa in avanti — l''importante è che tutti corrano e tornino, non chi arriva prima. Nessuna eliminazione.',
  7, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('vulcano', 'cerchio', 'reazione', 'spazio', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il vulcano che trema' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Supereroi in pattuglia',
  'Ogni bambino sceglie il suo supereroe preferito (tu lasci scegliere liberamente: Superman, Spiderman, una principessa, un personaggio inventato). Poi conducono la palla in giro per lo spazio 10x10m usando il ''superpiede magico'': il piede che usa il loro supereroe preferito. Ogni 30 secondi chiedi ''il supereroe cambia potere!'' e cambiano piede. Quando dici ''missione completata!'' si fermano e mostrano la loro posa da supereroe. Non c''è tecnica giusta: stai solo attivando la loro fantasia e facendo muovere i piedi. Applaudi ogni posa.',
  8, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('supereroi', 'fantasia', 'piede', 'conduzione', 'creatività'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Supereroi in pattuglia' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il gatto e la coda magica',
  'Ogni bambino ha una codina colorata infilata nei pantaloncini (la coda del gatto) e la sua palla. Si muovono nell''area 10x10m conducendo la palla. Tu, come ''orco dispettoso'', provi a prendere le code con le mani (non si sputa, non si spinge). Chi perde la coda la recupera da terra, fa 5 tocchi sulla palla e rientra subito — nessuno sta fermo, nessuno è eliminato. Variante: metti un bambino volontario a fare l''orco al posto tuo, per 30 secondi, poi si scambia. Importante: ridi insieme a loro quando perdi, sii il primo a sdrammatizzare.',
  8, 'riscaldamento', 'primi_calci',
  JSON_ARRAY('codine', 'gatto', 'conduzione', 'reazione', 'inclusione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il gatto e la coda magica' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tecnica_individuale (10 sessioni · 8-15 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla conosce i miei piedi',
  'Ogni bambino sta fermo con la palla davanti. Spieghi che la palla è nuova e vuole conoscere tutte le parti del piede. Prima si presenta al ''piede magico'' (interno): spingila piano a destra e a sinistra. Poi al ''piede coraggioso'' (esterno): porta la palla fuori con il bordo esterno. Poi alla ''suola del re'': rotolala avanti e indietro sotto la pianta del piede. Non serve che la tecnica sia perfetta — ogni bambino sta scoprendo come funziona il suo piede con la sua palla. Festeggia chi prova qualcosa di nuovo, non chi lo fa meglio.',
  10, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('piede', 'tocchi', 'scoperta', 'palla amica', 'sensazioni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla conosce i miei piedi' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La lumachina con la casa (conduzione lenta)',
  'Le lumachine si muovono lente ma non perdono mai la casa (la palla). In uno spazio 8x8m ogni bambino conduce la palla piano piano verso un cono lontano, la gira intorno (come la lumachina gira intorno a un ostacolo) e torna. Devono tenerla vicina ai piedi: se la palla si allontana troppo, la lumachina ha ''perso la casa'' e la va a recuperare senza fretta. Nessuna gara di velocità — anzi, più sono lenti e più la stanno facendo bene. Variante: la lumachina incontra un''altra lumachina e si dicono ciao con le palle (le avvicinano e le allontanano). Delizioso per lavorare sul tocco morbido.',
  10, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('lumachina', 'conduzione', 'controllo', 'tocco morbido', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La lumachina con la casa (conduzione lenta)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il treno e la locomotiva',
  'Ogni bambino conduce la palla (la locomotiva) lungo percorsi liberi nello spazio 10x10m. Stazione 1: cammino normale con la palla vicina. Stazione 2: accelero per 3 passi e freno (piede sulla palla). Stazione 3: cambio binario — cambio direzione con un tocco interno. Il mister dice ''fischio!'' e tutti fanno un fischio con la bocca e ripartono in una direzione nuova. Non ci sono stazioni fisiche: il treno scegle da solo dove andare. L''obiettivo è che ogni bambino senta di poter controllare dove va la palla. Premia chi inventa percorsi buffi.',
  10, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('treno', 'conduzione', 'frenata', 'cambi direzione', 'libertà'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il treno e la locomotiva' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Batti e fuggi con la palla fantasma',
  'Ogni bambino ha la palla ferma davanti. Devi mostrare come si dà un calcio leggero con l''interno del piede facendo finta che la palla ''scappi''. Il bambino la rincorre, la ferma con la suola (il piede-tetto) e ripete. Chiama questo movimento ''batti e fuggi''. Dopo 3-4 ripetizioni da fermi, si mettono a camminare e lo fanno in movimento: spingono avanti la palla di un passo, la rincorrono, la fermano. Non spiegare tecnica del passaggio: stai solo insegnando che il piede può spingere la palla e il piede può fermarla. Varia la forza: ''palla timida'' = calcio leggerissimo, ''palla coraggiosa'' = calcio deciso.',
  12, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('calcio', 'stop', 'suola', 'interno piede', 'ritmo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Batti e fuggi con la palla fantasma' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla che dorme e si sveglia',
  'La palla dorme (sta ferma) e il bambino deve svegliarla con un tocco gentile. Poi la palla corre (il bambino la spinge avanti) e il bambino la deve fermare (piede sopra). Poi la palla torna a dormire. Fate questo ritmo insieme: dormire — svegliare — correre — fermare. Ogni ciclo dura circa 5 secondi. Il mister batte le mani per scandire il ritmo: lento all''inizio, poi un po'' più veloce. Non esistono errori: se la palla scappa troppo lontano, il bambino ''va a svegliare la palla che è fuggita nel bosco''. Variante: la palla dorme ma ha un sogno — cioè gira intorno ai piedi del bambino con la suola.',
  10, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('suola', 'stop', 'ritmo', 'controllo', 'palla amica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla che dorme e si sveglia' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il cobra che striscia (conduzione esterna)',
  'Il cobra si muove con ondulazioni: la palla va un po'' a destra (spingila con l''interno del piede destro) e un po'' a sinistra (interno del piede sinistro) mentre avanzi lentamente. Ogni bambino è un cobra silenzioso che striscia nel campo 8x8m senza colpire gli altri cobra. Quando dici ''cobra si ferma!'' tutti fermano la palla con la suola e si immobilizzano come statue. Poi ripartono. Il cobra non ha fretta — più è sinuoso, più è bello. Questa è la base del dribbling, ma i bambini stanno solo facendo fare al cobra la sua danza. Premia i cobra più creativi.',
  12, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('cobra', 'dribbling base', 'alternanza piedi', 'controllo', 'fantasia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il cobra che striscia (conduzione esterna)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Acchiappa l''ombra della palla',
  'Ogni bambino spinge piano la palla avanti di un passo, poi deve ''acchiappare la sua ombra'' mettendo il piede sopra prima che rotoli troppo. Rifate questo 5 volte. Poi alza la difficoltà: spingila di DUE passi e corri ad acchiapparla. Poi TRE passi. Il gioco è vedere fino a quanti passi riesci ad acchiapparla prima che scappi oltre il bordo. Non è una gara con gli altri — ogni bambino ha il suo record da battere. Dai un nome alle distanze: ''ombra corta'' = 1 passo, ''ombra lunga'' = 3 passi, ''ombra fuggiasca'' = quanti passi vuole il bambino. Ridi con loro quando la palla scappa.',
  10, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('stop', 'suola', 'distanza', 'controllo', 'record personale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Acchiappa l''ombra della palla' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla fa il giro del mondo',
  'Ogni bambino sta fermo con la palla ai piedi. Il compito è far girare la palla INTORNO ai propri piedi usando solo la suola, senza toccarla con le mani. Senso orario per 5 giri, poi senso antiorario per 5 giri. Poi: gira attorno al piede destro soltanto, poi solo il sinistro. Poi: falla fare il giro del mondo intorno a tutte e due le gambe insieme. Non importa se qualcuno la tocca con le mani all''inizio — il gioco è esplorare. Variante: ''giro del mondo con gli occhi chiusi per 3 secondi'' (li faranno riaprire subito ridendo). Celebra ogni piccola scoperta.',
  10, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('suola', 'giro palla', 'equilibrio', 'controllo', 'scoperta'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla fa il giro del mondo' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il gigante e il topolino',
  'Il bambino impara che il piede può fare cose diverse a seconda della forza. Gigante = calcio forte, la palla rotola lontana (5-6 metri). Topolino = calcio leggerissimo, la palla avanza di 30 cm. Fate 3 turni: prima solo gigante, poi solo topolino, poi alternati. Poi la sfida: il bambino deve far arrivare la palla ESATTAMENTE su un cono lontano 3 metri usando un solo calcio. Non è una gara — è un''esplorazione della forza. Ogni bambino farà forza diversa, e va benissimo. Variante: ''orso'' = forza media, lavora sulla calibrazione intermedia.',
  12, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('forza', 'dosaggio', 'calcio', 'fantasia', 'sensazioni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il gigante e il topolino' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tocca e scappa (finta del coniglio)',
  'Il coniglio tocca la carota (la palla) con il piede destro — UNO — poi con il sinistro — DUE — poi scappa di lato con la palla al piede. È la prima finta: tocco a destra, tocco a sinistra, scatto laterale. Fate prima solo il ritmo ''uno-due-scappa'' sul posto, poi con piccolo movimento. Non chiamarla mai ''finta tecnica'' o ''cambio di direzione'': è quello che fa il coniglio per non farsi prendere dalla volpe. Il bambino sta imparando l''alternanza rapidissima dei piedi. Premia ogni coniglio che scappa — non chi lo fa meglio ma chi ci prova con più energia.',
  12, 'tecnica_individuale', 'primi_calci',
  JSON_ARRAY('coniglio', 'finta', 'alternanza piedi', 'ritmo', 'scatto'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tocca e scappa (finta del coniglio)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (5 sessioni · 10-15 min) [STEP A — le altre 5 nello STEP B]
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tutti in casa (occupare lo spazio)',
  'Lo spazio 10x10m è ''la casa'' e i bambini sono le stanze. Il problema dei Primi Calci è che si ammucchiano tutti sulla palla. Il gioco: ogni bambino ha il suo ''angolino'' contrassegnato da un cono colorato — è la sua stanza. Quando dici ''esplora!'' si muovono liberamente nello spazio con la palla. Quando dici ''a casa!'' tornano ognuno nel proprio angolino. Non serve spiegare niente di tattico: stai semplicemente insegnando che lo spazio è grande e c''è posto per tutti. Variante: chiama le stanze per colore — ''chi è nella stanza rossa si muove, gli altri restano fermi''.',
  12, 'tattica', 'primi_calci',
  JSON_ARRAY('spazio', 'posizione', 'coni', 'casa', 'gruppo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tutti in casa (occupare lo spazio)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Non svegliate l''orco (no ammucchiamento)',
  'Al centro dello spazio 10x10m metti un cono grande: è l''orco che dorme. I bambini devono muoversi con la palla in tutto lo spazio SENZA avvicinarsi troppo all''orco E senza avvicinarsi troppo ai compagni (se si scontrano, l''orco si sveglia e ruggisce). Quando dici ''l''orco sbadiglia!'' si immobilizzano tutti. Quando dici ''si riaddormenta'' ripartono. Il messaggio è: usa tutto lo spazio, stai lontano dagli altri, trova posto libero. Nessun bambino viene rimproverato se si ammucchia — l''orco reagisce al gruppo, non al singolo.',
  12, 'tattica', 'primi_calci',
  JSON_ARRAY('spazio libero', 'gruppo', 'orco', 'no ammucchiamento', 'fantasia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Non svegliate l''orco (no ammucchiamento)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Seguimi! (tutti attacco, tutti dietro)',
  'Gioco 3v0: tre bambini con una palla sola si muovono insieme verso due coni-porta (distanti 2 metri) in fondo allo spazio. L''obiettivo è arrivarci INSIEME — non solo chi ha la palla. Quando la palla entra tra i coni, tutti e tre festeggiano. Poi tornano indietro tutti insieme. Non si parla di chi attacca e chi difende: qui ''tutti vanno verso la porta'' è già un concetto enorme per U6/U7. Variante: il mister insegue i tre bambini camminando (non corre mai) — devono arrivare ai coni prima di essere ''raggiunti''. Tienilo giocoso e ridanciano.',
  12, 'tattica', 'primi_calci',
  JSON_ARRAY('gruppo', 'porta', 'insieme', 'attacco', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Seguimi! (tutti attacco, tutti dietro)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La missione dello spazio vuoto',
  'In uno spazio 10x10m con 4 bambini e una palla: chi ha la palla deve trovarsi uno spazio vuoto per stare (non vicino ai compagni). Quando il mister dice ''missione!'' chi ha la palla si muove verso lo spazio vuoto più grande che vede. Gli altri lo imitano spostandosi anche loro. Non c''è passaggio, non c''è avversario: si esplora solo il concetto di ''dove c''è posto''. Variante: metti un hula hoop a terra — è il ''posto più speciale''. Chi riesce ad arrivarci con la palla per primo (senza correre) ha trovato il posto magico. Cambia spesso il bambino con la palla.',
  12, 'tattica', 'primi_calci',
  JSON_ARRAY('spazio vuoto', 'movimento', 'gruppo', 'esplorazione', 'palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La missione dello spazio vuoto' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il re del castello (1v1 giocoso)',
  'Due bambini, uno spazio 5x5m, due coni-porta per parte (distanti 2 metri). Un bambino è il ''re del castello'' e cerca di portare la palla nella porta del compagno. L''altro bambino cerca di fare lo stesso. Non spiegare marcatura, pressing o tackle — lascia che si muovano istintivamente. Dopo 30-40 secondi scambia le coppie. Regola fondamentale: non si spinge, non ci si butta. Se la palla esce, si ricomincia dal centro. Non conta chi segna di più: ogni scambio è una partitella nuova. Fai fare al meno timido la prima partitella come esempio.',
  13, 'tattica', 'primi_calci',
  JSON_ARRAY('1v1', 'castello', 'porta', 'mini-partita', 'gioco libero'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il re del castello (1v1 giocoso)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (10 sessioni · 10-15 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passa la palla all''amico (coppia)',
  'Due bambini, una palla, due coni distanti 4 metri (non di più). Uno spinge la palla verso l''altro con il piede interno (''il piede abbraccio''). L''altro la ferma con la suola e rispedisce indietro. Non si parla di passaggio o ricezione — si parla di ''mandare la palla all''amico'' e ''prendere la palla dell''amico''. Fate 5 scambi, poi i bambini si avvicinano a 3 metri, poi si allontanano a 5 metri. L''obiettivo è sentire la differenza di forza necessaria. Ricorda: se la palla devia, va storta, rimbalza — è normalissimo e va festeggiato lo stesso. Il tentativo vale quanto la riuscita.',
  10, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('passaggio', 'coppia', 'interno piede', 'amico', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passa la palla all''amico (coppia)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla viaggiatrice (triangolo di amici)',
  'Tre bambini formano un triangolo con i coni (lati di 4-5 metri). Una palla viaggia da uno all''altro: A manda a B, B manda a C, C manda ad A. Il mister conta le ''tappe del viaggio'' ad alta voce: ''1, 2, 3, 4...'' ogni volta che la palla arriva. Non c''è fretta: quando la palla si ferma a metà, il bambino più vicino va a prenderla e ricomincia. Variante: il mister urla ''inversione!'' e la palla gira nel senso opposto. L''obiettivo vero è che i bambini alzino gli occhi per cercare il compagno — anche solo per un secondo.',
  12, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('triangolo', 'passaggio', 'gruppo', 'cooperazione', 'alzare occhi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla viaggiatrice (triangolo di amici)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La patata bollente (passaggio veloce)',
  'La palla è una patata bollente: appena ce l''hai, la mandi subito all''amico! In coppia o trio, spazio 5x5m. Chi riceve la palla deve spedirla via il prima possibile verso un compagno. Non si conta quanti secondi ci vuole — il mister fa solo finta di togliersi qualcosa di caldo dalle mani quando la palla arriva e loro imitano ridendo. Variante: aggiungi un terzo bambino in mezzo che cerca di intercettare la patata (ma cammina, non corre). Se ci riesce scambia ruolo con chi ha fatto il passaggio difettoso. Mantieni il clima giocoso — la ''patata che scotta'' è un''immagine che rimane.',
  11, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('passaggio rapido', 'patata bollente', 'cooperazione', 'ritmo', 'divertimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La patata bollente (passaggio veloce)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il tesoro protetto (2v1 semplice)',
  'Due bambini hanno la palla (il tesoro). Un bambino è il ''guardiano'' che cammina (non corre) cercando di toccare la palla. I due con la palla se la passano per tenerla lontana dal guardiano. Spazio 6x6m. Il guardiano ha 30 secondi di tempo: se tocca la palla scambia ruolo. Se non ce la fa, i due tesoro-custodi festeggiano. L''obiettivo non è battere il guardiano ma capire che ''se passo all''amico, il guardiano non può stare da tutte le parti''. Non nominarla mai ''superiorità numerica'' — è solo ''il guardiano non può stare dove siamo in due''.',
  12, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('2v1', 'tesoro', 'passaggio', 'spazio libero', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il tesoro protetto (2v1 semplice)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passa e corri dall''amico',
  'In coppia: A manda la palla a B e poi CORRE verso B. B ferma la palla, la rimanda ad A che è in corsa, e poi corre anche lui. I due si scambiano posizione ogni passaggio. Spazio 8 metri tra loro. All''inizio andrà storto quasi tutto — e va bene così. Ridi con loro quando la palla va altrove. Spiega il concetto con le braccia: ''manda la palla dove stai andando tu, non dove sei adesso''. Questa idea (passaggio in avanti rispetto al movimento del compagno) è enorme per U6/U7 e non devono capirla oggi — devono solo provarci e divertirsi.',
  12, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('passaggio in movimento', 'corsa', 'coppia', 'coordinazione', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passa e corri dall''amico' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Chiama il mio nome e passa',
  'In gruppo da 3-4 bambini con una palla sola nello spazio 8x8m. Regola: prima di mandare la palla devi chiamare il nome del compagno a cui la vuoi mandare. ''Marco!'' — poi spedisci la palla verso Marco. Marco la ferma e chiama il prossimo. Se la palla va storta non importa — l''importante è aver chiamato il nome. Questo semplice gesto insegna che il passaggio ha un destinatario. Variante: invece del nome si usa un gesto (mano alzata = sono qui, mandamela a me). L''obiettivo emotivo è che ogni bambino senta di essere ''visto'' e chiamato dai compagni.',
  12, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('passaggio', 'comunicazione', 'nome', 'gruppo', 'destinatario'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Chiama il mio nome e passa' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla che rimbalza tra i castelli',
  'Due coni-porta per ogni bambino (2 bambini = 4 coni totali, due porte per parte). Ogni bambino protegge i suoi due coni stando in mezzo. Devono mantenere la palla tra di loro cercando di farla passare tra i coni dell''altro (segnano un punto) SENZA essere aggressivi — solo con un passaggio/tiro morbido. Non c''è un portiere: i coni sono il bersaglio. Se la palla esce si ricomincia. Nessuno conta i punti ad alta voce — il mister li conta mentalmente e annuncia solo ''bella giocata!'' o ''ottimo tentativo!''. Il clima è esplorativo, non agonistico.',
  13, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('coni', 'bersaglio', 'tiro morbido', 'mini-gioco', 'spazio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla che rimbalza tra i castelli' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il cerchio magico (mantieni il possesso)',
  'Quattro bambini formano un cerchio grande (circa 5 metri di diametro) con i coni. Una palla sola gira nel cerchio: ogni bambino la tocca una volta e la manda al compagno di fianco. Obiettivo: far girare la palla per tutto il cerchio senza che esca. Ogni volta che completa un giro completo battono tutti le mani. Non c''è un avversario: l''unico ''nemico'' è la palla che scappa fuori dal cerchio. Variante: la palla può andare anche al bambino non direttamente di fianco (uno skip). L''importante è che tutti tocchino la palla ogni giro. Il cerchio magico si rompe se uno è escluso.',
  12, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('cerchio', 'passaggio', 'gruppo', 'inclusione', 'ritmo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il cerchio magico (mantieni il possesso)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Palla al capitano dei pirati',
  'Un bambino è il capitano dei pirati (sta al centro di uno spazio 8x8m). Gli altri stanno ai bordi con le palle. Il capitano cammina verso uno dei bordi: il bambino sul bordo deve mandargli la palla con un rotolino. Il capitano la ferma con la suola, la rimanda indietro, e si gira verso un altro bordo. Cambio capitano ogni 40 secondi. L''obiettivo del capitano è ricevere e rimandare il più velocemente possibile. L''obiettivo dei bambini al bordo è ''mandare la palla dove sta andando il capitano''. Nessun errore viene sottolineato: ogni passaggio è un regalo al capitano.',
  12, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('capitano', 'passaggio', 'ricezione', 'centro-bordo', 'ruolo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Palla al capitano dei pirati' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Due contro il mago (2v1 con il mister)',
  'Il mister è il ''mago'' che cammina lentamente nello spazio 8x8m cercando di toccare la palla con un bastoncino immaginario (la mano aperta). Due bambini si passano la palla per tenerla lontana dal mago. Il mago non corre mai, non si butta, fa solo passi lenti e teatrali. Ogni volta che il mago ''quasi'' tocca la palla, urla ''ci sono quasi!'' e loro ridono e fuggono. Ogni 60 secondi il mago ''perde i suoi poteri'' e i bambini festeggiano. L''importante è che il mago perda sempre alla fine — i bambini devono sentirsi capaci. Cambia coppie ogni turno.',
  13, 'possesso_palla', 'primi_calci',
  JSON_ARRAY('mago', '2v1', 'mister', 'cooperazione', 'gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Due contro il mago (2v1 con il mister)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

-- STEP A COMPLETATO — 35 INSERT (riscaldamento 10, tecnica_individuale 10, tattica 5, possesso_palla 10)
-- STEP B da appendere separatamente.

-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (5 sessioni finali · 10-15 min) [STEP B — completa il blocco a 10]
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Aiuta il compagno bloccato',
  'Un bambino porta la palla verso un cono-destinazione nello spazio 8x8m. A un certo punto il mister urla ''bloccato!'' e quel bambino si ferma immobile con la palla ferma. Gli altri devono ''sbloccarlo'' andando a toccargli la spalla. Chi lo sblocca, prende la palla e riparte verso un nuovo cono, finché non viene bloccato a sua volta. Nessuno resta mai fermo più di 10 secondi. L''obiettivo è che i bambini guardino i compagni, non solo la propria palla. Questo è il germe del ''vedo il compagno e lo aiuto'' — il concetto tattico più importante a 6 anni. Festeggia chi sblocca velocemente.',
  11, 'tattica', 'primi_calci',
  JSON_ARRAY('aiuto', 'compagno', 'gruppo', 'spazio', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Aiuta il compagno bloccato' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La squadra degli esploratori (3v0)',
  'Tre bambini, una palla, nessun avversario. Devono portare la palla dall''altra parte dello spazio 10x10m TUTTI INSIEME, toccandola almeno una volta a testa prima di arrivare. Non conta la velocità: conta che tutti partecipino. Il mister dà un punto-stella ogni volta che un bambino che non aveva ancora toccato la palla la riceve. A fine turno si contano le stelle — e ne vince tante quante sono i bambini che hanno toccato la palla. Sono i primi passi verso ''la squadra condivide la palla''. Cambia composizione dei trio ogni giro. Il bello è che non può vincere uno solo.',
  12, 'tattica', 'primi_calci',
  JSON_ARRAY('esploratori', 'trio', 'condivisione', 'tutti toccano', 'cooperazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La squadra degli esploratori (3v0)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Lo specchio del mister',
  'Il mister si muove lentamente nello spazio 10x10m con la palla. I bambini devono imitare esattamente quello che fa il mister: si avvicina a un cono (anche loro), accelera (anche loro), si ferma (anche loro). Poi il mister chiama un bambino a fare il ''mister-specchio'' e gli altri imitano lui. Questo insegna l''attenzione collettiva — tutti guardano la stessa cosa, tutti reagiscono insieme. Per U6/U7 è già tattica avanzata. Variante: due mister-specchio contemporaneamente, i bambini scelgono quale imitare. Il caos risultante è normale e divertente.',
  11, 'tattica', 'primi_calci',
  JSON_ARRAY('imitazione', 'attenzione', 'gruppo', 'specchio', 'reazione collettiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Lo specchio del mister' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tutti in barca (cambio di campo)',
  'Lo spazio 10x10m è il mare. I bambini hanno le palle (i salvagente). Quando dici ''cambiate barca!'' devono raggiungere il lato opposto del campo conducendo la palla, senza scontrarsi tra di loro. Chi arriva può aiutare chi è ancora in mezzo urlando ''dai, vieni qui!''. Nessuno resta bloccato, nessuno è eliminato. Il mister conta ad alta voce quanto ci vogliono tutti ad arrivare: 10, 9, 8... e alla fine tutti festeggiano. Variante: aggiungi due ''squali'' (coni) in mezzo che i bambini devono evitare cambiando direzione. Il gioco insegna il cambio di campo e il movimento collettivo senza che nessuno lo percepisca come tattica.',
  12, 'tattica', 'primi_calci',
  JSON_ARRAY('cambio campo', 'barca', 'gruppo', 'spazio', 'movimento collettivo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tutti in barca (cambio di campo)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Mini regno 2v2 (la prima partitella)',
  'Due coppie, uno spazio 8x8m, due mini-porte (2 coni per parte a 2 metri di distanza). Si gioca 2v2 libero, regole semplicissime: si spinge la palla con il piede, non si tocca con le mani, non si spinge il compagno. Niente altro. Nessuno fa il portiere fisso: chiunque si avvicina alla porta del proprio team la difende. Giocate da 2 minuti, poi cambio squadre. Non conta il risultato: il mister non annuncia chi ha segnato di più. Annuncia invece ''bell''azione!'', ''bella corsa!'', ''bravo che hai aiutato il compagno!''. È la prima esperienza di partita in assoluto per molti di loro — deve essere solo bella.',
  13, 'tattica', 'primi_calci',
  JSON_ARRAY('2v2', 'mini-partita', 'primo gioco', 'regno', 'libertà'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Mini regno 2v2 (la prima partitella)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: finalizzazione (10 sessioni · 8-15 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Abbatti il castello del drago',
  'Costruisci un ''castello'' con 3-4 coni impilati o ravvicinati al centro. I bambini, a turno, si avvicinano a 2-3 metri e tirano la palla per abbatterlo. Ogni bambino fa 3 tiri. Dopo ogni tiro il mister (o un bambino) rimette in piedi il castello. Non si conta chi batte più coni: si conta quante volte il gruppo insieme riesce ad abbatterlo tutto. La celebrazione è collettiva. Variante: il drago ha due castelli in posti diversi dello spazio — i bambini scelgono quale attaccare. Il tiro non deve essere forte: deve solo raggiungere il bersaglio. Premia chi prova con coraggio, non chi butta più forte.',
  10, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('drago', 'bersaglio', 'tiro', 'coni', 'festeggiare'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Abbatti il castello del drago' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il cannone dei pirati (tiro alla porta)',
  'Due coni distanti 2 metri formano la porta del tesoro. I bambini si mettono in fila a 3 metri dalla porta, ognuno con la sua palla. A turno fanno ''BOOM!'' (il suono del cannone) e sparano la palla verso la porta. Dopo ogni tiro prendono la palla e tornano in fila. Il mister conta ad alta voce ''BOOM UNO, BOOM DUE...'' ogni volta che la palla passa tra i coni. Nessuno sbaglia mai: o è ''un bel boom!'' o è ''boom potente ma un po'' storto, ci riprovi!''. Variante: allarga la porta a 3 metri per i bambini più incerti, stringe a 1,5 m per i più sicuri di sé. Tutti sparano, tutti ridono, tutti segnano prima o poi.',
  10, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('pirati', 'porta', 'tiro', 'cannonata', 'inclusione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il cannone dei pirati (tiro alla porta)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gol nel buco del coniglio',
  'Metti due coni molto vicini (1 metro di distanza) come ''buco del coniglio''. I bambini partono da 2-3 metri, conducono la palla qualche passo e la spingono nel buco. Il coniglio ''entra'' se la palla passa tra i coni. Ogni bambino ha 4 tentativi. Dopo ogni tentativo prende la palla e riparte. Il mister festeggia ogni ''coniglio entrato'' con un suono buffo (imitando il coniglio che sparisce nella buca). Variante: aggiungi un secondo buco dall''altra parte — il bambino sceglie quale buco prendere. Questo allena la scelta di un bersaglio preciso a distanza ravvicinata, senza pressione.',
  9, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('coniglio', 'precisione', 'bersaglio stretto', 'tiro', 'scelta'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gol nel buco del coniglio' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpisci il mostro addormentato',
  'Un cono grande colorato sta al centro: è il mostro addormentato. I bambini, da 3 metri, cercano di colpirlo con la palla. Se lo colpiscono il mister fa la voce del mostro svegliato (ruggito buffo) e poi si riaddormenta. Tutti ridono. Il bambino recupera la palla e riparte. Non c''è turno rigido: appena uno ha finito l''altro parte. Il mister aggiusta la distanza: 2 metri per chi è più insicuro, 4 per chi vuole una sfida. Il mostro non punisce mai — si sveglia e si riaddormenta con grazia. Variante: metti tre coni-mostro in punti diversi e i bambini scelgono quale svegliare. Libertà di scelta = sicurezza.',
  11, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('mostro', 'bersaglio', 'tiro', 'colpire', 'distanza variabile'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpisci il mostro addormentato' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La porta arcobaleno (tiro con rincorsa)',
  'Due coni colorati (uno giallo, uno rosso) formano la porta. Il bambino parte da 4 metri, fa TRE passi di rincorsa e tira. Il mister dice solo ''tre passi e BOOM''. La rincorsa serve per darsi il tempo di prepararsi, non per tirare forte. Ogni bambino fa 5 tiri. Tra un tiro e l''altro recupera la palla camminando — niente corse frenetiche. Variante: il bambino può scegliere con quale piede tirare, e il mister nota (non giudica) le preferenze. Alla fine si chiede a ognuno ''con quale piede hai tirato di più?'' — prime domande sulla lateralità senza nominarla mai come concetto.',
  11, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('rincorsa', 'tiro', 'lateralità', 'arcobaleno', 'porta'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La porta arcobaleno (tiro con rincorsa)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tira e raggiungi (movimento dopo il tiro)',
  'Il bambino tira la palla verso la porta (2 coni, 2 metri), poi CORRE a recuperarla oltre la porta. Torna di corsa, si rimette a 3 metri e ritira. Ogni bambino fa il giro 4 volte di fila. Il mister conta il tempo: ''dai, quante volte riesci in 30 secondi?'' — non per creare ansia ma per dargli un ritmo. La corsa dopo il tiro è un''azione nuova per loro: imparano che dopo aver calciato ci si muove. Variante: la porta è un cerchio disegnato a terra (con un cinesino) e la palla deve fermarsi DENTRO il cerchio senza rimbalzare fuori. Diverso ma ugualmente fattibile.',
  10, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('tiro', 'movimento', 'recupero palla', 'ritmo', 'porta'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tira e raggiungi (movimento dopo il tiro)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La grotta dell''orso (tiro basso)',
  'La ''grotta'' è una porta bassissima: un pallone grande o uno zaino a terra tra due coni bassi. Il bambino deve far passare la palla SOTTO senza sollevarla — deve strisciare come un serpente (tiro piatto, piede che segue la palla vicino al suolo). Da 2-3 metri. Questo insegna il tiro rasoterra senza mai nominar tecnica. Ogni bambino ha 4 tentativi. Variante: la grotta si ''restringe'' (avvicina i coni) per chi riesce facilmente. Il mister festeggia di più chi prova il tiro più difficile rispetto a chi segna con quello facile. L''ambizione è premiata quanto il risultato.',
  10, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('tiro basso', 'orso', 'precisione', 'rasoterra', 'grotta'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La grotta dell''orso (tiro basso)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sfida al bersaglio colorato',
  'Appoggia 3 coni colorati contro il muro o in fila a terra. Rosso = 1 punto, giallo = 2 punti, verde = 3 punti (il più piccolo o quello al centro). I bambini tirano dalla stessa distanza di 3 metri cercando il bersaglio che vogliono. Ogni bambino fa 3 tiri. Però NON si annunciano i punti ad alta voce nella classifica: il bambino conta i suoi punti per sé e li dice al mister sottovoce. Non esiste un vincitore annunciato. La sfida è con sé stessi: ''l''ultima volta ho fatto 4 punti, adesso provo a fare di più''. Variante: i bersagli si spostano ogni turno — il verde diventa quello in mezzo a sorpresa.',
  12, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('bersaglio', 'colori', 'scelta', 'tiro', 'sfida personale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sfida al bersaglio colorato' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gol dei supereroi (tiro in corsa)',
  'I bambini conducono la palla per 4-5 metri lungo una ''pista'' segnata da cinesini, e alla fine c''è la porta (2 coni a 2 metri). Devono tirare mentre camminano — non si fermano davanti alla porta. Il mister dice ''non frenare! il supereroe tira senza fermarsi!''. Non importa se va storto: quello che si impara è che la palla si può spingere anche senza fermarsi prima. 3 giri a testa. Variante: la pista è curva (i cinesini formano un arco) quindi il bambino arriva alla porta da un angolo. Più divertente e più realistico. Ogni gol è celebrato con la posa del supereroe preferito del bambino.',
  12, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('supereroi', 'tiro in corsa', 'porta', 'pista', 'movimento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gol dei supereroi (tiro in corsa)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La porta della giungla (tiro libero)',
  'Due coni, 2 metri di apertura, a 4 metri dai bambini. La porta è quella della giungla segreta. I bambini tirano liberamente a turno rapido: uno tira, recupera, torna in fila, il prossimo parte. Nessuna istruzione tecnica: lascia che ognuno sviluppi il proprio modo di tirare. Il mister osserva senza correggere la tecnica — fa solo domande curiose: ''con che parte del piede l''hai mandato?'', ''hai sentito che bella sensazione?''. Ogni bambino scopre da solo che l''interno del piede dà più controllo. Variante: chiudi gli occhi per 1 secondo prima di tirare (li apri nel momento del tiro) — si concentrano di più per il gesto.',
  11, 'finalizzazione', 'primi_calci',
  JSON_ARRAY('giungla', 'tiro libero', 'scoperta', 'porta', 'sensazioni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La porta della giungla (tiro libero)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: atletica_fisico (10 sessioni · 8-12 min)
-- NOTA: per Primi Calci è MOTRICITÀ LUDICA (sviluppo motorio globale)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La sfilata degli animali (andature)',
  'I bambini si muovono liberi in uno spazio 10x10m imitando gli animali che chiami: orso = a 4 zampe lento, rana = saltelli sulle due gambe, granchio = di lato con passi incrociati, elefante = passi pesanti e lenti dondolando, farfalla = braccia aperte che svolazzano. Non c''è palla in questa sessione — è puro sviluppo del corpo. Ogni animale dura 20-30 secondi. Chiedi a fine giro ''quale animale preferisci?'' e ognuno fa il suo preferito per 30 secondi. L''obiettivo è esplorare quante cose può fare il corpo: girare, saltare, strisciare, bilanciarsi. Non ci sono animali ''sbagliati'' — si accettano gli animali inventati.',
  9, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('animali', 'andature', 'corpo', 'coordinazione', 'fantasia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La sfilata degli animali (andature)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Salta le pozzanghere (salti e atterraggi)',
  'Metti 6-8 cinesini piatti a terra in modo casuale: sono le pozzanghere. I bambini devono attraversare lo spazio 10x10m SALTANDO ogni pozzanghera con entrambi i piedi. Chi tocca la pozzanghera si ''bagna'' (effetto sonoro buffo del mister). Poi le pozzanghere diventano ''fuoco'' (salti più alti), poi ''ghiaccio'' (atterraggio morbido, silenzioso). Non c''è gara: ogni bambino percorre il campo a modo suo. Variante: salta con UN solo piede — prima destro, poi sinistro. L''atterraggio morbido è importantissimo a questa età: insegna a smorzare il peso con le ginocchia flesse.',
  10, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('salti', 'atterraggio', 'equilibrio', 'cinesini', 'lateralità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Salta le pozzanghere (salti e atterraggi)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il ponte e il tunnel (su e giù con il corpo)',
  'I bambini si mettono in coppia. Uno fa il ''ponte'' (a 4 zampe con la schiena alta), l''altro striscia sotto come un serpente. Poi si scambiano. Poi uno fa il ''tunnel'' (in piedi con le gambe aperte) e l''altro passa sotto carponi. Poi si scambiano. Non serve spiegare a cosa serve: stanno esplorando lo spazio sopra e sotto, la flessibilità, l''equilibrio sulle braccia. Variante: il ponte si abbassa piano piano mentre il serpente deve passare — quanto riesce a strisciare basso? Festeggia i ponti più creativi e i serpenti più silenziosi. È un gioco cooperativo: il ponte deve reggere e il serpente deve passare.',
  9, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('coppia', 'ponte', 'tunnel', 'flessibilità', 'cooperazione corporea'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il ponte e il tunnel (su e giù con il corpo)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La statua di ghiaccio (equilibrio su un piede)',
  'Il mister dice ''ghiaccio!'' e tutti si fermano su UN piede come statue di ghiaccio per 5 secondi. Chi posa l''altro piede a terra ''si scioglie'' (effetto sonoro buffo) e deve scrollarsi di dosso il ghiaccio immaginario (agitando il corpo) prima di ricongelarsi. Poi si cammina di nuovo liberi, e al prossimo ''ghiaccio!'' cambiano piede. Aggiunge difficoltà: ''ghiaccio con le braccia in alto'', ''ghiaccio con gli occhi chiusi per 3 secondi''. L''equilibrio monopodalico è fondamentale a U6/U7 e questo gioco lo allena senza che nessuno lo percepisca come esercizio. La statua che regge più a lungo non vince niente — tutte le statue sono bellissime.',
  9, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('equilibrio', 'un piede', 'statua', 'ghiaccio', 'concentrazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La statua di ghiaccio (equilibrio su un piede)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La missione spaziale (percorso motorio)',
  'Crea un piccolo percorso di 4 stazioni in 8 metri: stazione 1: salta sopra un cinesino piatto — stazione 2: gira intorno a un cono — stazione 3: striscia sotto un elastico basso (o le braccia del mister aperte) — stazione 4: cammina in equilibrio su una linea a terra (cinesino rettilineo). Ogni bambino è un astronauta in missione. Fanno il percorso una volta di seguito senza fretta. Il mister annuncia ogni stazione come se fosse una sfida spaziale: ''Stai attraversando il campo di asteroidi!'' ecc. Non si cronometra, non si conta chi finisce prima. Variante: il percorso si fa al contrario. La creatività del mister nelle descrizioni vale quanto il percorso stesso.',
  11, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('percorso motorio', 'spazio', 'astronauta', 'coordinazione', 'sequenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La missione spaziale (percorso motorio)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Destra o sinistra? (scoperta della lateralità)',
  'Il mister alza la mano destra: tutti alzano la loro mano destra. Poi sinistra. Poi piede destro in avanti. Poi piede sinistro. Poi si cammina nello spazio e il mister dice ''tocca il ginocchio destro!'' o ''alza il braccio sinistro!''. Poi la sfida: mentre si cammina, il mister dice un colore di casacca sparsa a terra — ''rosso'' = ci si ferma con il piede destro sopra, ''blu'' = piede sinistro sopra. Non si corregge mai chi sbaglia la destra/sinistra — a 6 anni è normalissimo fare confusione. Si ride insieme e si riprova. Variante: il mister sbaglia apposta e i bambini lo correggono — si invertono i ruoli.',
  10, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('lateralità', 'destra', 'sinistra', 'corpo', 'coordinazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Destra o sinistra? (scoperta della lateralità)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il robot balla (ritmo e coordinazione)',
  'Il mister batte le mani creando un ritmo (lento-lento-veloce-veloce). I bambini muovono le braccia come robot seguendo il ritmo. Poi aggiungono i piedi: passo a destra, passo a sinistra, seguendo il ritmo. Poi si aggiunge la palla: la passano da una mano all''altra a ritmo (non si usa il piede qui). Poi la mettono a terra e la toccano col piede destro poi sinistro a ritmo. Il mister può usare una musica semplice. Non c''è un robot giusto o sbagliato: ogni robot balla a modo suo. Variante: un bambino inventa il ritmo e gli altri lo seguono. Questo momento vale più di qualsiasi esercizio: li fa sentire autori.',
  10, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('ritmo', 'coordinazione', 'robot', 'musica', 'braccia e piedi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il robot balla (ritmo e coordinazione)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il gigante addormentato si alza (alzate e abbassate)',
  'I bambini cominciano accucciati come giganti che dormono. Quando il mister dice ''il gigante si alza!'' si alzano lentamente fino in punta di piedi con le braccia al cielo. Quando dice ''si riaddormenta'' si riaccucciano piano. Poi velocizza: alzate rapide, abbassate lente. Poi aggiunge movimento: il gigante si alza e fa 3 passi, poi si riaddormenta dove si trova. Poi il gigante porta un oggetto immaginario pesantissimo (cammino lento e faticoso). L''obiettivo è esplorare alto-basso, veloce-lento, pesante-leggero con il corpo. Variante: abbinato a un suono — fischio acuto = in piedi, fischio grave = accucciato.',
  9, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('gigante', 'alto basso', 'velocità', 'corpo', 'equilibrio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il gigante addormentato si alza (alzate e abbassate)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corri e abbraccia il cono (accelerazione breve)',
  'Spargi 6 coni colorati nello spazio 10x10m. I bambini camminano liberi. Quando il mister urla un colore (es. ''ROSSO!'') tutti corrono verso il cono rosso più vicino e lo abbracciano (lo toccano con entrambe le mani). Poi tornano a camminare. Le accelerazioni durano 3-4 secondi al massimo. Non ci sono eliminazioni: tutti trovano un cono. Si lavora sull''accelerazione breve, sulla reazione al segnale e sull''orientamento spaziale. Variante: il mister urla due colori in fila — i bambini toccano prima uno poi l''altro. Le sequenze brevi attivano la memoria a breve termine oltre alla coordinazione.',
  9, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('accelerazione', 'reazione', 'coni colorati', 'orientamento', 'sprint breve'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corri e abbraccia il cono (accelerazione breve)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La nuvola morbida (atterraggi e cadute sicure)',
  'Si impara a cadere in modo sicuro e a fare movimenti a terra. Il mister mostra come ci si siede a terra velocemente senza farsi male (''atterraggio sulla nuvola''), come si rotola su un fianco, come ci si rialza senza usare le mani. I bambini provano su erba o su tappeto. Poi il gioco: chi riesce ad ''atterrare sulla nuvola'' il più silenziosamente possibile? Chi fa meno rumore è quello che ha trovato la nuvola più morbida. Variante: il mister conta ''3-2-1-NUVOLA!'' e tutti atterrano insieme. Non c''è paura della caduta: si trasforma in un''avventura. Fondamentale a questa età per prevenire paure durante il gioco.',
  10, 'atletica_fisico', 'primi_calci',
  JSON_ARRAY('caduta sicura', 'nuvola', 'terra', 'morbido', 'sicurezza corporea'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La nuvola morbida (atterraggi e cadute sicure)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: portieri (10 sessioni · 8-15 min)
-- NOTA: a questa età NON esiste ''il portiere''. Tutti ruotano per 1-2 min.
-- Obiettivo: scoprire il piacere di parare con le mani e con il corpo.
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tutti portieri per un minuto',
  'Una porta formata da 2 coni a 2 metri. I bambini fanno a turno il portiere: ogni bambino sta in porta per 60 secondi mentre gli altri, a turno, tirano morbidamente da 2-3 metri. Il ''portiere'' prova a prendere la palla con le mani, oppure a bloccarla con i piedi, oppure a fermarla con il petto — qualsiasi parte del corpo va bene. Il mister celebra ogni parata con un ''CHE PARATA!''. Quando la palla passa, il mister dice ''bella prova, ci riprovi!''. Non si conta quanti gol subisce ogni portiere. L''obiettivo è che ogni bambino senta il brivido di stare in porta almeno una volta. Cambia portiere ogni minuto senza eccezioni.',
  12, 'portieri', 'primi_calci',
  JSON_ARRAY('portiere a turno', 'parata', 'mani', 'inclusione', 'rotazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tutti portieri per un minuto' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il muro magico (blocca la palla)',
  'Il bambino in porta diventa un ''muro magico'' — deve impedire alla palla di passare usando qualsiasi parte del corpo. Il mister tira morbidamente palline direttamente verso il bambino da 2 metri: al petto, ai piedi, verso una mano. Il bambino blocca come può — non si insegna la tecnica della presa, si lascia che il corpo reagisca. Dopo 5 palline scambia con un altro bambino. Il muro magico non deve essere perfetto: ogni blocco è un successo, anche quello fortunoso. Variante: il mister tira piano verso un lato e il bambino deve spostarsi di mezzo passo per bloccarla — primo passo verso il concetto di ''muoversi verso la palla''.',
  10, 'portieri', 'primi_calci',
  JSON_ARRAY('muro', 'blocco', 'tutto il corpo', 'parata', 'reazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il muro magico (blocca la palla)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Prendi la palla che rotola (presa bassa)',
  'Il mister (o un bambino) fa rotolare la palla lentamente sul terreno verso il portiere. Il portiere deve accucciarsi e prendere la palla con entrambe le mani, ''abbracciandola'' al petto. Poi la rimanda con le mani al tiratore. Non si nomina mai la ''tecnica del portiere'' — si dice solo ''abbraccia la palla, non lasciarla scappare''. Da 3 metri di distanza, palla che rotola lenta. Ogni bambino fa 4 prese a testa. Variante: il portiere si trova seduto a terra e deve alzarsi rapidamente per prendere la palla che rotola. Questo livello in più non è richiesto ma se un bambino lo fa spontaneamente si festeggia come una parata da campione.',
  9, 'portieri', 'primi_calci',
  JSON_ARRAY('presa bassa', 'mani', 'abbraccia palla', 'portiere', 'rotolamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Prendi la palla che rotola (presa bassa)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il guardiano del castello (porta + movimento)',
  'La porta è un ''castello'' con due coni colorati. Il guardiano (il portiere) deve proteggere il castello spostandosi davanti ai coni. Il mister tira palline dolci da 2-3 metri, alternando a destra e sinistra. Il guardiano impara che a volte si sposta a destra, a volte a sinistra — ma non si insegna come deciderlo: lo scopre da solo. Ogni bambino è il guardiano per 60 secondi. Il castello non è mai ''conquistato'': ogni palla che passa è un tentativo valoroso dell''attaccante, non una colpa del guardiano. Variante: il guardiano può usare anche i piedi per deviare la palla.',
  11, 'portieri', 'primi_calci',
  JSON_ARRAY('castello', 'guardiano', 'movimento laterale', 'porta', 'spostamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il guardiano del castello (porta + movimento)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tuffati sulla nuvola (primo tuffo ludico)',
  'Su un tappetino o su erba morbida: il mister fa rotolare la palla sul lato destro del portiere. Il bambino fa un piccolo spostamento laterale e si butta a lato per ''abbracciare la palla sulla nuvola''. Non è un tuffo tecnico — è un rotolamento su un fianco per raggiungere la palla. Si fa prima senza palla (semplice rotolamento di lato su erba) per prendere confidenza. Poi si aggiunge la palla. Ogni bambino fa 2-3 prove per lato. Il mister fa vedere lui stesso come si fa, ridendo insieme a loro se va male. Nessuna paura: la nuvola è morbida e ci si può cadere sopra tutte le volte che si vuole.',
  12, 'portieri', 'primi_calci',
  JSON_ARRAY('tuffo ludico', 'tappetino', 'nuvola', 'lato', 'coraggio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tuffati sulla nuvola (primo tuffo ludico)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La palla ti cerca (reazione e posizione)',
  'Il portiere (un bambino per volta) sta al centro della porta con gli occhi chiusi. Il mister conta ''3-2-1'' e tira piano la palla verso di lui. Al ''1'' il bambino apre gli occhi e reagisce. La palla è lentissima — ha tutto il tempo per muoversi. Non si parla di posizione dei piedi o delle mani: si lavora solo sul ''apri gli occhi, guarda la palla, raggiungila''. Il momento dell''apertura degli occhi è molto emozionante per loro. Variante: il bambino non chiude gli occhi ma guarda da un''altra parte e si gira al segnale. Ogni bambino fa 3 turni. Festeggia ogni reazione, anche quelle un po'' tardive.',
  10, 'portieri', 'primi_calci',
  JSON_ARRAY('reazione', 'occhi chiusi', 'portiere', 'prontezza', 'sorpresa'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La palla ti cerca (reazione e posizione)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Il gigante delle porte (porta grande)',
  'La porta è enorme: 4-5 coni su una linea di 5 metri. Il ''gigante'' (portiere) cammina avanti e indietro lungo la linea cercando di fermare le palle dei compagni che tirano da 3-4 metri. La porta è intenzionalmente grande: è quasi impossibile coprirla tutta, e va benissimo. L''obiettivo non è para tutto — è sentirsi grandi e potenti nella porta. Il gigante può scegliere dove stare e come spostarsi. Ogni parata è festeggiata con urlo da gigante (il mister lo insegna: ''RUGGITO DEL GIGANTE!''). Variante: la porta si riduce via via man mano che il gigante para — diventa sempre più grande come gigante.',
  11, 'portieri', 'primi_calci',
  JSON_ARRAY('gigante', 'porta grande', 'copertura', 'libertà', 'potenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Il gigante delle porte (porta grande)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rimanda con le mani (rinvio del portiere)',
  'Il portiere prende la palla (rotolata o tirata morbida) e la rimanda ai compagni lanciandola con le mani. Prima con due mani da sotto (lancio basso, la palla rotola), poi con una mano da sopra (lancio medio). Non si parla di tecnica del rinvio: si parla di ''manda la palla a chi la vuole''. I compagni alzano la mano per chiedere la palla. Ogni portiere fa 4 prese-e-rimandi, poi scambio. L''obiettivo è che il portiere impari che dopo aver parato la palla si manda a un compagno — il filo tra portiere e giocatori di movimento. Variante: il portiere chiama il nome del compagno prima di mandarla (come nella sessione di possesso ''Chiama il mio nome e passa'').',
  12, 'portieri', 'primi_calci',
  JSON_ARRAY('rinvio', 'mani', 'portiere', 'compagno', 'rilancio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rimanda con le mani (rinvio del portiere)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Non far cadere il pallone (presa alta)',
  'Il mister lancia in aria la palla MOLTO lentamente e a bassa traiettoria verso il portiere — quasi un lancio parabolico corto da 1-2 metri. Il bambino deve prenderla al volo prima che tocchi terra. Non si chiede tecnica: ''prendi con tutte e due le mani e tienila stretta come un tesoro''. Ogni bambino fa 4 prese. Chi fa cadere la palla ride con il mister (''il tesoro è scappato!'') e riprova. Gradualmente alza leggermente la traiettoria per i bambini più sicuri. Variante: il mister lancia due palloni in sequenza veloce — il bambino prende il primo, lo lascia cadere morbido a terra, e prende il secondo. Sviluppa coordinazione occhio-mano.',
  10, 'portieri', 'primi_calci',
  JSON_ARRAY('presa alta', 'volo', 'mani', 'coordinazione occhio-mano', 'tesoro'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Non far cadere il pallone (presa alta)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'La porta invisibile (comunicazione del portiere)',
  'Il portiere sta in porta. Gli attaccanti tirano, ma PRIMA di tirare devono aspettare che il portiere dica ''sono pronto!''. Il portiere impara a comunicare quando è in posizione. Semplice come concetto, rivoluzionario per U6/U7: stanno imparando che il portiere ha una voce e che il gioco si ferma se lui non è pronto. Ogni 3 tiri si cambia portiere. Il mister rinforza: ''il portiere ha detto pronto? Aspettiamo!'' e celebra ogni ''sono pronto!'' come una cosa importante. Variante: il portiere può anche dire ''aspetta!'' se ha bisogno di sistemarsi — e tutti aspettano davvero. Che lezione di rispetto reciproco.',
  11, 'portieri', 'primi_calci',
  JSON_ARRAY('comunicazione', 'portiere', 'voce', 'sono pronto', 'rispetto'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'La porta invisibile (comunicazione del portiere)' AND eta_leva = 'primi_calci' AND ufficiale_myvivaio = TRUE
);

-- STEP B COMPLETATO — 35 INSERT (tattica 5, finalizzazione 10, atletica_fisico 10, portieri 10)
-- TOTALE FILE: 70 INSERT (Step A 35 + Step B 35)

SELECT COUNT(*) AS totale_primi_calci FROM sessioni_libreria WHERE ufficiale_myvivaio=TRUE AND eta_leva='primi_calci';
