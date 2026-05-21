-- ═══════════════════════════════════════════════════════════════════════════
-- MyVivaio — Sessioni Ufficiali Categoria JUNIORES (U17/U18/U19)
-- File:    20260521_sessioni_ufficiali_juniores.sql
-- Totale:  70 sessioni · 10 per ciascuna delle 7 categorie
-- Data:    2026-05-21
-- Autore:  MyVivaio Editorial Team
-- Round:   5 di N (Rounds 1-4 Pulcini/Esordienti/Giovanissimi/Allievi già caricati)
-- ───────────────────────────────────────────────────────────────────────────
-- NOTA: ALTER TABLE mister_id INT NULL già eseguito nel Round 1 (Pulcini).
--       Non ripetuto qui.
-- ───────────────────────────────────────────────────────────────────────────
-- STEP A: 35 INSERT — riscaldamento (10), tecnica_individuale (10),
--         tattica (10), possesso_palla (prime 5 su 10).
-- STEP B: le restanti 35 verranno appese separatamente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── IDEMPOTENZA ────────────────────────────────────────────────────────────
-- Ogni INSERT usa SELECT … WHERE NOT EXISTS su (titolo, eta_leva, ufficiale_myvivaio).
-- Puoi eseguire questo script più volte senza creare duplicati.
-- ─────────────────────────────────────────────────────────────────────────────


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: riscaldamento (10 sessioni · 15-25 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione nel modulo di gara: 4-3-3 con circolazione tra linee',
  'Undici giocatori in posizione di 4-3-3 su metà campo. Il mister dirige prima i movimenti senza palla (30 secondi per ogni linea), poi introduce il pallone. La palla circola dai difensori ai centrocampisti fino agli attaccanti seguendo le linee del modulo: il mediano basso si abbassa tra i difensori, le mezzali si alzano, le ali si allargano. Nessun avversario, solo movimenti posizionali codificati. Obiettivo: il riscaldamento nel modulo di gara non è solo attivazione fisica ma ripasso mentale automatico dei movimenti del ruolo. Per i Juniores ogni seduta parte dalla consapevolezza tattica del proprio spazio in campo. Variante: il mister sposta un giocatore di ruolo ogni 3 minuti. Chi prende il nuovo posto adatta i movimenti senza istruzioni verbali.',
  20, 'riscaldamento', 'juniores',
  JSON_ARRAY('4-3-3', 'circolazione', 'modulo', 'riscaldamento', 'posizionamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione nel modulo di gara: 4-3-3 con circolazione tra linee' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondò 10v4 con transizione immediata su porta piccola',
  '10 giocatori ai bordi di un quadrato 18x18m tengono palla contro 4 al centro. Quando i 4 recuperano devono raggiungere una mini-porta a 15m entro 5 secondi. Chi perde palla si aggiunge ai difensori. Partenza con due tocchi, poi un tocco al fischio del mister. Obiettivo: il rondò con uscita in transizione è il riscaldamento ideale per i Juniores perché attiva subito la lettura della transizione offensiva post-recupero. La regola dei 5 secondi crea urgenza e simula la counter-press reale di inizio allenamento. Variante: i 4 in mezzo possono segnare solo se tutti e 4 hanno toccato palla dopo il recupero. Allena la transizione collettiva invece di quella individuale, che è il problema più comune in questa fascia d''età.',
  20, 'riscaldamento', 'juniores',
  JSON_ARRAY('rondò', 'transizione', 'riscaldamento', 'pressing', 'reattività'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondò 10v4 con transizione immediata su porta piccola' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Schema di passaggi per linee difesa-centrocampo a ritmo crescente',
  'Due file di giocatori: difensori e centrocampisti. Schema fisso a specchio: il terzino riceve dal portiere, scarica al mediano sceso tra i difensori, il mediano gioca all''ala risalita in fascia, l''ala restituisce all''altro mediano che verticalizza. 5 minuti lento, 5 minuti a ritmo normale, 5 minuti intenso. Portiere incluso come costruttore. Obiettivo: il passaggio in schema per linee simula i meccanismi di costruzione del modulo senza la pressione dell''avversario. Per i Juniores è il modo corretto di riscaldare gli automatismi di gioco con palla. Variante: al fischio del mister lo schema si inverte — la palla torna indietro invece di proseguire. Allena la capacità di leggere l''ordine tattico in corsa senza tempo di reazione.',
  18, 'riscaldamento', 'juniores',
  JSON_ARRAY('costruzione', 'schema', 'riscaldamento', 'passaggi', 'linee di gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Schema di passaggi per linee difesa-centrocampo a ritmo crescente' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione pliometrica specifica calcio: potenza e reattività',
  'Circuito a 4 stazioni da 3 minuti ciascuna con 30 secondi di pausa. Stazione 1: salti su ostacoli bassi (30cm) con sprint di 8m. Stazione 2: balzi laterali su linea con cambio di direzione al segnale. Stazione 3: skip alto sul posto poi accelerazione esplosiva di 10m. Stazione 4: passaggi in coppia a 8m con scatto obbligatorio dopo ogni ricezione. 2 giri completi. Obiettivo: la pliometria specifica per il calcio a livello Juniores deve combinare lavoro esplosivo e sensazione di palla. Le stazioni di potenza alternano a stazioni con palla per mantenere il focus calcistico anche nel riscaldamento atletico. Variante: stazione 1 diventa salti monopiede. Chi registra differenza di potenza tra piede destro e sinistro lavora sull''asimmetria nella progressione.',
  22, 'riscaldamento', 'juniores',
  JSON_ARRAY('pliometria', 'potenza', 'riscaldamento atletico', 'esplosività', 'reattività'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione pliometrica specifica calcio: potenza e reattività' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Movimenti senza palla nel 4-2-3-1: focus sul trequartista',
  'Undici giocatori sul campo in 4-2-3-1. Il trequartista lavora su 4 movimenti codificati senza pallone: inserimento centrale tra le linee, movimento di spalla verso il terzino, rotazione verso il centravanti, uscita in fascia a destra. Il mister indica il movimento con cartelli numerati. Gli altri 10 adattano la posizione al movimento del trequartista. Poi si introduce la palla. Obiettivo: nel 4-2-3-1 il trequartista ha più libertà di movimento di qualsiasi altro. Riscaldare i suoi movimenti e la reazione collettiva dei compagni è lavoro tattico che si fa prima di allenare la partita reale. Variante: si cambia il giocatore che interpreta il ruolo ogni 4 minuti. Allena la comprensione del ruolo da parte di tutta la squadra.',
  22, 'riscaldamento', 'juniores',
  JSON_ARRAY('4-2-3-1', 'trequartista', 'movimenti senza palla', 'riscaldamento', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Movimenti senza palla nel 4-2-3-1: focus sul trequartista' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Controllo orientato verso spazio libero su stimolo casuale',
  'Coppie a 10m di distanza. Il servitore lancia palle di altezza variabile (bassa, media, alta) senza comunicarlo. Il ricevente fa un controllo orientato verso uno dei 4 spazi liberi indicati da coni intorno a lui. Il controllo deve sempre andare verso lo spazio non occupato. 10 ripetizioni per lato, poi distanza a 15m. Obiettivo: il controllo orientato è il fondamentale che distingue il centrocampista di livello. Per i Juniores deve essere automatico in qualsiasi condizione posturale e con palle di traiettoria imprevedibile. Variante: aggiungi un difensore passivo a 2m che occupa uno degli spazi. Il ricevente deve orientarsi verso lo spazio NON occupato leggendo la posizione del difensore prima ancora di ricevere.',
  20, 'riscaldamento', 'juniores',
  JSON_ARRAY('controllo orientato', 'postura', 'riscaldamento tecnico', 'lettura', 'fondamentali'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Controllo orientato verso spazio libero su stimolo casuale' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing triggers: simulazione match-specific su costruzione avversaria',
  'Metà campo. Una squadra finge di costruire (portiere + difensori + centrocampista) seguendo istruzioni del mister. L''altra squadra simula il pressing su trigger codificati: retropassaggio al portiere, passaggio al difensore centrale sotto pressione, rimessa laterale in zona alta. Al trigger la squadra in pressing scatta. Nessun contatto, solo posizionamento e timing. 3 trigger per 7 minuti ciascuno. Obiettivo: il riscaldamento su pressing triggers attiva la mentalità difensiva collettiva prima del lavoro principale. I Juniores devono arrivare al blocco tattico con i trigger già nella memoria muscolare. Variante: la squadra che costruisce introduce finte sui trigger. Il pressing deve distinguere il trigger reale da quello simulato.',
  22, 'riscaldamento', 'juniores',
  JSON_ARRAY('pressing triggers', 'riscaldamento tattico', 'collettivo', 'difesa', 'mentale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing triggers: simulazione match-specific su costruzione avversaria' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Duelli 1v1 in corsie strette con transizione offensiva immediata',
  'Campo diviso in 4 corsie strette di 5x20m. Coppie di giocatori in ogni corsia. Chi ha la palla cerca di portarla oltre la linea di fondo. Chi difende deve recuperarla. 8 ripetizioni per coppia poi rotazione delle coppie nelle corsie. Intensità progressiva: prime 3 ripetizioni al 60%, poi 80%, poi 100%. Obiettivo: il duello 1v1 in corsia è il riscaldamento che attiva subito la mentalità competitiva e il contrasto fisico. Per i Juniores ogni riscaldamento deve avere una componente di sfida reale perché la motivazione massimale arriva solo con la competizione. Variante: chi vince la corsia può subito attaccare una porta piccola a 15m. Il duello diventa transizione offensiva immediata.',
  20, 'riscaldamento', 'juniores',
  JSON_ARRAY('1v1', 'duello', 'riscaldamento', 'competitivo', 'transizione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Duelli 1v1 in corsie strette con transizione offensiva immediata' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso cardio con interrupt di sprint ogni 60 secondi',
  'Possesso libero 8v3 su campo ridotto 25x25m. Regola: ogni 60 secondi il mister fischia e tutti gli 8 in possesso fanno uno sprint verso la linea laterale e tornano entro 5 secondi. La palla resta ferma. Poi si riprende il possesso immediatamente. 5 cicli da 2 minuti. Obiettivo: il possesso con interrupt di sprint è un riscaldamento cardio che mantiene il focus tecnico. Il cambio improvviso di ritmo simula il pattern reale di gara: fasi di gestione alternate a scatti brevi e intensi. Variante: lo sprint viene eseguito solo da chi ha sbagliato l''ultimo passaggio. Gli altri restano in campo. Crea pressione tecnica indiretta e mantiene la concentrazione alta durante tutta la fase di riscaldamento.',
  20, 'riscaldamento', 'juniores',
  JSON_ARRAY('possesso', 'cardio', 'riscaldamento', 'cambio ritmo', 'sprint'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso cardio con interrupt di sprint ogni 60 secondi' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Linea difensiva a 4: scalatura coordinata su stimolo del portiere',
  'Linea difensiva a 4 più portiere su metà campo difensivo. Il mister posiziona la palla in varie zone usando coni colorati. La linea scala in base alla posizione: palla sul lato = terzino accorcia, mediano scala, libero copre, altro terzino si alza in diagonale. Prima lento su istruzioni dirette, poi a ritmo normale, poi con palla in movimento reale. Obiettivo: la linea difensiva deve ragionare come unità coordinata, non come 4 individui indipendenti. Per i Juniores la scalatura a tutto campo è il lavoro che trasforma 4 buoni difensori in una linea efficace. Variante: aggiungi un attaccante che si muove liberamente. La linea deve scalare in funzione dell''attaccante oltre che della palla, gestendo due input simultanei.',
  20, 'riscaldamento', 'juniores',
  JSON_ARRAY('linea difensiva', 'scalatura', 'riscaldamento difensivo', 'coordinamento', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Linea difensiva a 4: scalatura coordinata su stimolo del portiere' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tecnica_individuale (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Controllo in doppia marcatura con uscita sul corridoio libero',
  'Due difensori a 1.5m attorno al ricevente. Servitore a 12m lancia palle di traiettoria variabile. Il ricevente controlla e deve uscire dalla pressione doppia verso uno dei corridoi liberi indicati da coni colorati (6 corridoi possibili). 10 ripetizioni per giocatore. Progressione: riduzione del tempo tra un difensore e l''altro fino a 0.5 secondi. Obiettivo: la doppia marcatura in ricezione è la situazione più difficile tecnicamente. Chi sa uscire da una doppia con il primo controllo è un centrocampista di livello senior. Variante: uno dei due difensori arriva in ritardo di 1 secondo. Il ricevente deve leggere quale difensore è già vicino e orientarsi verso il lato dell''altro prima ancora del contatto con la palla.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('controllo orientato', 'doppia marcatura', 'pressing', 'tecnica', 'centrocampista'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Controllo in doppia marcatura con uscita sul corridoio libero' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passaggio filtrante di prima su movimento in profondità',
  'Campo 40x30m. Tre linee di giocatori: difensori, centrocampisti, attaccanti. Il centrocampista riceve dal difensore e deve immediatamente passare di prima al movimento in profondità dell''attaccante. L''attaccante parte al momento del passaggio difensore-centrocampista. 8 serie per combinazione. Progressione: un difensore segue l''attaccante, il filtrante deve passare prima che il difensore si riposizioni. Obiettivo: il passaggio filtrante di prima è il fondamentale offensivo che sblocca la difesa compatta. Per i Juniores deve essere automatico e non dipendere dalla visione periferica ma dalla lettura preventiva del movimento. Variante: il centrocampista ha 2 attaccanti che si muovono in direzioni diverse. Deve scegliere quale è smarcato al momento del touch.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('passaggio filtrante', 'prima intenzione', 'profondità', 'tecnica', 'offensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passaggio filtrante di prima su movimento in profondità' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Conduzione ad alta velocità con stop brusco e ripartenza esplosiva',
  'Percorso di 30m con 4 variazioni: accelerazione massima in partenza, stop brusco al primo cono, ripartenza esplosiva, dribbling a X con cambio di piede al secondo cono, sprint finale verso porta e tiro. 6 serie per giocatore alternando piede dominante e non. Portiere in porta. Obiettivo: fermarsi e ripartire in conduzione è tecnicamente più difficile dell''accelerazione continua perché richiede controllo dell''inerzia corporea. Per i Juniores la variazione di ritmo in conduzione deve essere un''arma, non un problema. Variante: dopo lo stop brusco il mister indica con cartello colorato se continuare verso porta o cambiare corsia. Allena la lettura tattica durante la conduzione a velocità di gara.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('conduzione', 'stop brusco', 'ripartenza', 'velocità', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Conduzione ad alta velocità con stop brusco e ripartenza esplosiva' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpo di testa in corsa su cross con timing da crossatore',
  'Crossatore dalla fascia, 2 attaccanti in area. Cross alto, entrambi si inseriscono in corsa: uno attacca il primo palo, l''altro il secondo. Chi colpisce mira verso il palo lontano rispetto alla propria posizione. 8 serie da 4 cross per lato. Progressione: un difensore entra 1 secondo dopo il cross. Portiere in porta. Obiettivo: il timing dell''inserimento — partire esattamente quando il crossatore alza la testa — deve essere automatico per i Juniores. Non si allena la testa in sé, si allena la lettura del momento giusto per staccare. Variante: il crossatore può anche servire bassa. L''attaccante deve leggere la traiettoria durante la corsa e adattare il gesto tecnico: colpo di testa se alta, piede di prima se bassa.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('colpo di testa', 'cross', 'timing', 'inserimento', 'attaccante'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpo di testa in corsa su cross con timing da crossatore' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stop di coscia con proiezione offensiva immediata verso porta',
  'Servitore con lancio alto da 20m. Il giocatore stoppa di coscia e deve concludere entro 2 tocchi verso porta a 25m. Portiere in porta. 8 serie da 5 stop per lato. Progressione: riduzione a 1 tocco (stop orientato direttamente verso porta). Obiettivo: lo stop di coscia con proiezione offensiva immediata è un fondamentale raramente allenato nei settori giovanili. Per i Juniores prossimi alla prima squadra gestire palle alte con segmenti non convenzionali e trasformarle in occasioni da gol distingue il giocatore completo. Variante: il servitore alterna palle di coscia e di petto senza comunicarlo. Il giocatore sceglie il segmento corretto nella traiettoria ascendente del pallone, non durante la discesa.',
  22, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('stop di coscia', 'conclusione', 'segmenti corporei', 'tecnica', 'offensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stop di coscia con proiezione offensiva immediata verso porta' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cambio campo di collo esterno su fascia opposta',
  'Due file di giocatori ai lati opposti del campo (40m di distanza). Il giocatore A con palla esegue un cambio campo preciso di collo esterno verso il giocatore B posizionato alla fascia opposta. B controlla e restituisce verso una terza posizione. 6 serie per piede. Progressione: il ricevente si muove nei 2 secondi prima del passaggio. Obiettivo: il cambio campo di collo esterno è il passaggio più difficile tecnicamente nel calcio. Per i Juniores è uno strumento tattico fondamentale per spostare la difesa avversaria rapidamente. Un cambio campo preciso vale quanto un dribbling riuscito in termini di spazio creato. Variante: il passaggio deve trovare il ricevente in corsa verso la linea laterale. Il passante anticipa la traiettoria di movimento del compagno.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('cambio campo', 'collo esterno', 'passaggio lungo', 'tecnica', 'ampiezza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cambio campo di collo esterno su fascia opposta' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finta di corpo in corsia laterale con accelerazione al fondo',
  'Corsia laterale 8m di larghezza. Il giocatore ha palla ai piedi, un difensore passivo occupa lo spazio centrale. Il giocatore esegue una finta di corpo convincente verso l''interno e accelera verso il fondo in corsia esterna. 8 serie per lato. Progressione: il difensore diventa semi-attivo e può spostarsi di 1m lateralmente. Obiettivo: la finta di corpo in corsia deve essere eseguita a velocità di gara, non di allenamento. La differenza sta nell''impegno reale del peso corporeo verso la falsa direzione. Per i Juniores questa è la finta che produce i cross più pericolosi. Variante: il mister indica prima della partenza se la finta deve portare all''interno o all''esterno. Allena l''esecuzione di finte diverse su indicazione tattica.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('finta di corpo', 'dribbling', 'corsia offensiva', 'ala', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finta di corpo in corsia laterale con accelerazione al fondo' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro a giro su palla messa in corsa da posizione angolata',
  'Giocatori in corsa da posizione angolata a 25m. La palla viene messa in movimento da un servitore che la passa rasoterra verso l''area. Il tiratore corre in diagonale e colpisce con collo interno cercando il giro verso il palo lontano. Portiere in porta. 6 serie da 5 tiri per lato. Progressione: un difensore entra dalla parte opposta, il tiratore accelera il gesto per anticiparlo. Obiettivo: il tiro a giro da posizione angolata è l''arma del giocatore di secondo livello offensivo. Per i Juniores la coordinazione tra la traiettoria di corsa e il punto di contatto sulla palla deve essere automatizzata a velocità di gara reale. Variante: scelta libera giro verso palo lontano o tiro potente verso palo vicino. Il portiere non sa cosa aspettarsi.',
  25, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('tiro a giro', 'collo interno', 'palo lontano', 'tiro in corsa', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro a giro su palla messa in corsa da posizione angolata' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Riduzione tocchi in triangolo: da 3 a 2 a 1 tocco obbligatorio',
  'Tre giocatori formano un triangolo a 8m di distanza. Prima fase: 3 tocchi (stop, guarda, gioca). Seconda fase: 2 tocchi (controllo orientato più passaggio). Terza fase: 1 tocco obbligatorio. Ogni fase dura 6 minuti. Il triangolo si sposta sul campo ogni 2 minuti. Obiettivo: la riduzione progressiva dei tocchi forza l''adattamento tecnico e mentale. Chi sa giocare a un tocco in un triangolo ristretto ha automatizzato la lettura della posizione dei compagni prima di ricevere la palla. Per i Juniores questo è il test più onesto del livello tecnico individuale. Variante: il quarto giocatore entra come difensore nel triangolo. La sua presenza rende ogni tocco una scelta tattica reale, non solo tecnica.',
  28, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('riduzione tocchi', 'prima intenzione', 'triangolo', 'tecnica', 'lettura'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Riduzione tocchi in triangolo: da 3 a 2 a 1 tocco obbligatorio' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rimessa in gioco del portiere su bersagli in movimento',
  'Il portiere esegue rimesse con piede e con la mano verso compagni che si muovono su corsie predefinite. 4 corsie: terzino DX, terzino SX, mezzala DX, mezzala SX. Ogni compagno si muove su 3 tagli diversi (verso porta, in fascia, in profondità). Il portiere deve leggere il taglio e lanciare dove il compagno arriverà, non dove si trova ora. 5 serie per bersaglio. Obiettivo: la rimessa precisa trasforma il portiere in un''arma offensiva. Per i Juniores il portiere che distribuisce con precisione vale due difensori aggiuntivi. Variante: il mister mostra un cartello con il nome di un avversario che sta pressando. Il portiere sceglie la rimessa più sicura in base alla posizione del pressing comunicato.',
  22, 'tecnica_individuale', 'juniores',
  JSON_ARRAY('portiere', 'rimessa in gioco', 'distribuzione', 'precisione', 'tecnica portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rimessa in gioco del portiere su bersagli in movimento' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (10 sessioni · 30-50 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Costruzione bassa 3+1 in uscita dal pressing alto: schemi A B C',
  '3 difensori più 1 mediano abbassato formano il rombo di costruzione bassa. Contro 4 avversari in pressing ultra-offensivo. Si lavora su 3 schemi: schema A — uscita sul terzino libero in fascia, schema B — portiere incluso come quinto uomo fuori area, schema C — palla lunga sulla punta come soluzione di sfogo quando entrambi i terzini sono coperti. 10 minuti per schema con pressing reale. Obiettivo: la costruzione bassa sotto pressing è il fondamentale tattico del calcio moderno. Per i Juniores padroneggiare i 3 schemi in situazione di pressing reale è l''obiettivo della seduta. Variante: l''avversario pressa con 5 giocatori invece di 4. Il gruppo deve trovare l''adattamento spontaneo senza istruzioni del mister.',
  45, 'tattica', 'juniores',
  JSON_ARRAY('costruzione bassa', 'pressing alto', 'schemi', 'tattica', 'uscita dalla pressione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Costruzione bassa 3+1 in uscita dal pressing alto: schemi A B C' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing a uomo con trigger codificati su costruzione avversaria',
  'Campo intero 11v11. Una squadra costruisce, l''altra pressa a uomo. Trigger codificati: 1) retropassaggio al portiere — l''attaccante scatta sul portiere, 2) terzino riceve in zona difensiva — mezzala scala immediata, 3) il costruttore tiene palla per più di 2 secondi — pressing collettivo. Prima si lavora su un trigger alla volta (10 minuti ciascuno), poi i trigger si mescolano nel gioco reale. Obiettivo: senza trigger il pressing diventa una corsa inutile. I Juniores devono capire che è il momento del trigger che determina il successo del pressing. Variante: l''avversario impara i trigger e li evita deliberatamente. La squadra in pressing identifica nuovi trigger autonomamente durante il gioco.',
  45, 'tattica', 'juniores',
  JSON_ARRAY('pressing a uomo', 'trigger', 'tattica difensiva', 'scalate', 'pressing collettivo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing a uomo con trigger codificati su costruzione avversaria' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Transizione offensiva: verticalizzazione obbligatoria nei 3 secondi',
  'Campo intero 11v11. Lavoro specifico sulla transizione offensiva. Quando la squadra recupera palla ha 3 secondi per verticalizzare verso la porta avversaria. Se non verticalizza, la palla va all''avversario. Prima in situazioni costruite dal mister, poi in situazione di gioco reale con conteggio ad alta voce dal portiere. Obiettivo: i 3 secondi dopo il recupero sono il momento di massima vulnerabilità dell''avversario — è impreparato e il suo blocco è aperto. La transizione offensiva immediata è il gesto tattico che crea più gol nel calcio moderno a livello senior. Variante: la verticalizzazione vale solo se arriva a un attaccante già in corsa. Se l''attaccante è fermo, non conta.',
  40, 'tattica', 'juniores',
  JSON_ARRAY('transizione offensiva', 'verticalizzazione', 'recupero palla', 'tattica', '3 secondi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Transizione offensiva: verticalizzazione obbligatoria nei 3 secondi' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Fuorigioco proattivo coordinato: linea e timing con il portiere',
  'Linea difensiva a 4 su metà campo. Un attaccante a centrocampo riceve palla dal mister e parte in profondità. La linea scala in avanti coordinata per catturare il fuorigioco al momento della ricezione dell''attaccante. Segnale d''uscita: il mister tocca la palla verso l''attaccante. Il portiere coordina con voce alta. 5 minuti senza attaccante (solo movimenti), poi con attaccante, poi con 2 attaccanti da direzioni diverse. Obiettivo: il fuorigioco proattivo è un''arma tattica che richiede coordinazione perfetta. Per i Juniores il timing collettivo si stabilisce in allenamento con il portiere come coordinatore della linea. Variante: uno dei due attaccanti parte in anticipo. La linea decide in tempo reale se salire o restare.',
  40, 'tattica', 'juniores',
  JSON_ARRAY('fuorigioco', 'linea difensiva', 'tattica difensiva', 'coordinamento', 'timing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Fuorigioco proattivo coordinato: linea e timing con il portiere' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rotazioni di reparto in 4-3-3: centrocampo in fase di possesso',
  'Campo intero 11v11. Lavoro specifico sulle rotazioni del reparto centrocampisti in 4-3-3. Tre movimenti codificati: 1) il mediano basso scende tra i difensori per costruire a 3, 2) la mezzala si alza alle spalle del difensore avversario, 3) l''altra mezzala si allarga nella fascia liberata dall''ala che rientra a piede invertito. Prima senza avversari (10 min), poi con centrocampisti avversari semi-attivi (15 min), poi situazione reale (20 min). Obiettivo: le rotazioni di reparto sono il cuore del calcio moderno. Per i Juniores capire che il proprio ruolo in possesso è diverso da quello in non possesso è il passaggio mentale che distingue il calciatore completo. Variante: il mister segnala al centravanti di scendere come trequartista aggiunto. Tutti adattano le rotazioni al movimento non codificato.',
  45, 'tattica', 'juniores',
  JSON_ARRAY('rotazioni', '4-3-3', 'centrocampo', 'possesso', 'tattica offensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rotazioni di reparto in 4-3-3: centrocampo in fase di possesso' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Counter-press: riaggressione collettiva entro 5 secondi dalla perdita',
  'Campo intero 11v11. Lavoro sul counter-press. Quando la squadra perde palla, tutti i giocatori nel raggio di 10m devono riaggredire entro 5 secondi. Chi è fuori dal raggio si posiziona a bloccare le linee di passaggio. Prima si lavora sulla fase di possesso controllata, poi sulla perdita e sulla counter-press. Il portiere conta i secondi ad alta voce. Obiettivo: il counter-press è la forma difensiva più efficace nel calcio moderno — la palla è più recuperabile subito dopo la perdita perché l''avversario non ha ancora protetto. Per i Juniores la mentalità della riaggressione deve diventare riflesso automatico. Variante: chi pressa entra in campo solo se può raggiungere l''avversario entro la distanza di tocco fisico.',
  40, 'tattica', 'juniores',
  JSON_ARRAY('counter-press', 'riaggressione', 'tattica difensiva', 'pressing', '5 secondi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Counter-press: riaggressione collettiva entro 5 secondi dalla perdita' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita palla a 5 contro pressing 4-4-2 con portiere costruttore',
  'Campo intero. La squadra costruisce con portiere più 4 difensori più centrocampista abbassato (costruzione a 5). L''avversario pressa in 4-4-2. Tre schemi di uscita: lungo sulla punta, corto sul terzino libero, portiere che esce fuori area per ricevere di piede. 15 minuti per schema. Obiettivo: l''uscita dalla pressione del 4-4-2 richiede riconoscere chi è libero prima di ricevere la palla. Il passaggio deve essere già deciso all''atto della ricezione, non dopo. Per i Juniores questo automatismo è la differenza tra costruire e subire. Variante: l''avversario pressa con 5 giocatori aggiungendo una mezzala. La squadra trova l''uomo libero in meno tempo perché c''è meno spazio disponibile.',
  45, 'tattica', 'juniores',
  JSON_ARRAY('uscita dal pressing', 'costruzione a 5', '4-4-2', 'portiere', 'tattica offensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita palla a 5 contro pressing 4-4-2 con portiere costruttore' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rifinitura tra le linee: smarcamento nel mezzo tra centrocampo e difesa',
  'Campo intero 11v11. Il giocatore designato (trequartista o seconda punta) lavora sui movimenti per ricevere tra la linea di centrocampo e quella difensiva avversaria. 4 movimenti codificati: scambio di posizione con la mezzala, rientro dal lato del terzino, terzo tempo su schema di rimessa, inserimento centrale su cambio campo. Prima con avversari fissi (coni), poi in movimento. Obiettivo: la rifinitura tra le linee costringe la difesa ad uscire dalla propria struttura, aprendo spazi per gli attaccanti. Per i Juniores è il concetto tattico avanzato che sblocca la difesa compatta organizzata. Variante: chi riceve tra le linee ha solo 2 tocchi. Allena la qualità tecnica sotto pressione nella zona più pericolosa del campo.',
  45, 'tattica', 'juniores',
  JSON_ARRAY('rifinitura tra le linee', 'trequartista', 'tattica offensiva', 'smarcamento', 'difesa compatta'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rifinitura tra le linee: smarcamento nel mezzo tra centrocampo e difesa' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Blocco basso 4-1-4-1: linee compatte e pressing reattivo sul secondo tempo',
  'Campo intero. La squadra si organizza in 4-1-4-1 con blocco basso (linea di centrocampo a 30m dalla propria porta). L''avversario costruisce e cerca di penetrare. La squadra lavora su: distanze tra linee (max 10m), pressing reattivo quando l''avversario entra in zona pericolosa, uscita sul secondo tempo del costruttore. 5 situazioni costruite, poi 20 minuti di partita con regola di non abbandonare il blocco se non per pressing reattivo codificato. Obiettivo: il blocco basso compatto massimizza la difficoltà di penetrazione. Per i Juniores è la base del gioco difensivo organizzato a livello senior. Variante: l''avversario usa uno-due veloci. La difesa deve capire quando il pressing a scalare è più efficace dell''attesa.',
  40, 'tattica', 'juniores',
  JSON_ARRAY('blocco basso', '4-1-4-1', 'tattica difensiva', 'compattezza', 'pressing reattivo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Blocco basso 4-1-4-1: linee compatte e pressing reattivo sul secondo tempo' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  '3-5-2 in non possesso: scalate del quinto e marcature preventive',
  'Campo intero. La squadra in 3-5-2 in fase di non possesso. Lavoro sulle scalate: quando l''avversario costruisce sul lato, il quinto di centrocampo scala sul terzino avversario, il mediano abbassato copre il centro, il difensore centrale del lato avanza in copertura. Prima su movimenti codificati senza palla, poi con avversari che costruiscono in 11v11. Obiettivo: nel 3-5-2 in non possesso le scalate del quinto di centrocampo determinano sia la copertura della fascia che la qualità del pressing laterale. Per i Juniores capire questo meccanismo è fondamentale perché è il modulo più usato nel calcio professionistico italiano. Variante: l''avversario usa il terzo uomo per bypassare il pressing. Il mediano anticipa il terzo uomo prima della ricezione.',
  45, 'tattica', 'juniores',
  JSON_ARRAY('3-5-2', 'non possesso', 'marcature preventive', 'quinto di centrocampo', 'scalate'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = '3-5-2 in non possesso: scalate del quinto e marcature preventive' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (prime 5 sessioni · 25-40 min) [Step A]
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso posizionale 9v6 con 8 passaggi obbligatori pre-verticalizzazione',
  'Campo 50x40m. 9 giocatori in possesso contro 6 in pressing. Regola: prima di poter verticalizzare verso la porta si devono completare 8 passaggi consecutivi. Se i 6 recuperano palla, il contatore si azzera. La verticalizzazione è valida solo se arriva a un attaccante oltre la linea dei 6 avversari. 4 partite da 8 minuti. Obiettivo: i passaggi obbligatori pre-verticalizzazione forzano la pazienza posizionale. Per i Juniores il possesso non è fine a se stesso ma preparazione dell''azione offensiva. Sapere quando è il momento giusto per verticalizzare è una decisione tattica matura. Variante: il contatore riparte da zero se lo stesso giocatore tocca la palla due volte consecutive. Allena la circolazione fluida senza portatori di palla dominanti.',
  35, 'possesso_palla', 'juniores',
  JSON_ARRAY('possesso posizionale', 'verticalizzazione', 'passaggi obbligatori', 'pazienza tattica', 'possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso posizionale 9v6 con 8 passaggi obbligatori pre-verticalizzazione' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso a 3 tocchi obbligatori con smarcamenti coordinati',
  'Campo 45x35m. Prima 8v4, poi 9v5, poi 10v6. Regola: 3 tocchi obbligatori per chi ha palla — tocco 1 controllo, tocco 2 preparazione, tocco 3 passaggio. Nessuno può tenere oltre 3 tocchi. Il pressing si supera solo con i movimenti senza palla: chi non si smarca non riceve. Obiettivo: il possesso a 3 tocchi con vincolo forza i compagni a smarcarsi in continuazione. Per i Juniores questo è il lavoro posizionale più importante: chi si smarca al momento giusto rispetto al tocco del portatore dimostra senso del tempo. Variante: al fischio del mister si passa a 2 tocchi obbligatori ogni 4 minuti. L''adattamento al vincolo crescente è il test della qualità tecnica collettiva del gruppo.',
  30, 'possesso_palla', 'juniores',
  JSON_ARRAY('3 tocchi', 'smarcamenti', 'tempo di passaggio', 'possesso', 'coordinamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso a 3 tocchi obbligatori con smarcamenti coordinati' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 10v4 su campo intero con ripartenza obbligata dal portiere',
  'Campo intero. 10 giocatori in possesso contro 4 in pressing, portieri alle due porte. Regola: la palla deve sempre ripartire dal portiere se esce in rimessa laterale o da fondo. Chi ha palla è protetto dal pressing se è dentro i 5m dalla propria porta. Il team in possesso costruisce dalla difesa, porta la palla oltre la linea di centrocampo, poi conclude o continua a costruire. Obiettivo: questo formato di possesso simula il gioco reale in modo fedele. Per i Juniores include tutte le fasi: possesso, transizione sul fallo laterale, costruzione dal basso obbligata. Variante: un''isola neutra di 3m al centro del campo dove chi porta palla è protetto dal pressing per 2 secondi. Simula il ricevitore tra le linee in zona di rifinitura.',
  38, 'possesso_palla', 'juniores',
  JSON_ARRAY('possesso', 'costruzione dal basso', 'portieri', 'campo intero', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 10v4 su campo intero con ripartenza obbligata dal portiere' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gioco di posizione 8v8+2 jolly su campo diviso in 9 settori',
  'Campo diviso in 9 settori (3x3). Due jolly sempre con chi ha palla (superiorità 10v8 in possesso). Regola principale: la palla non può stare nello stesso settore per più di 3 secondi. Chi supera il limite cede il possesso. La circolazione deve essere costante e il cambio di settore avviene con passaggi veloci o conduzione. Obiettivo: il gioco di posizione su 9 settori allena la consapevolezza spaziale ad alto livello. I Juniores devono capire la funzione di ogni settore nel possesso: settori laterali per allargare, centrali per filtrare, difensivi per costruire. Variante: il jolly può usare solo un tocco. Aumenta la velocità di circolazione e riduce la possibilità di tenere palla nel proprio settore.',
  35, 'possesso_palla', 'juniores',
  JSON_ARRAY('gioco di posizione', '9 settori', 'jolly', 'possesso', 'consapevolezza spaziale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gioco di posizione 8v8+2 jolly su campo diviso in 9 settori' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso full-field 11v11 con counter-press obbligato post-perdita',
  'Campo intero 11v11 con portieri. La squadra in possesso deve superare 3 linee di pressing avversarie (difesa, centrocampo, attacco) per arrivare in porta. Chi perde palla deve immediatamente fare counter-press. Si contano i gol e anche i possessi completati oltre la terza linea avversaria. Obiettivo: questo è il formato di possesso più vicino alla partita vera. Per i Juniores l''obiettivo non è tenere la palla ma portarla dove fa male. Ogni possesso ha uno scopo offensivo dichiarato. Variante: chi perde palla nella propria metà campo concede una rimessa laterale avversaria nella propria metà campo (penalità di posizione). Allena la cura del pallone nella zona di massimo rischio.',
  38, 'possesso_palla', 'juniores',
  JSON_ARRAY('possesso full-field', 'counter-press', 'portieri', 'pressing', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso full-field 11v11 con counter-press obbligato post-perdita' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- STEP A COMPLETATO — 35 INSERT (riscaldamento 10, tecnica_individuale 10, tattica 10, possesso_palla 5)
-- STEP B da appendere separatamente.


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (5 sessioni restanti · 25-40 min) [Step B]
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso zona-mista: marcatura stretta sul portatore e copertura di zona',
  'Campo 45x35m. 8 in possesso contro 5 in pressing organizzato zona-mista: 1 difensore marca stretto il portatore di palla, gli altri 4 proteggono zone fisse senza inseguire. Il team in possesso sposta la palla abbastanza velocemente da rendere inefficace la marcatura stretta. Cambio di pressing ogni 6 minuti. Obiettivo: la zona-mista è il sistema difensivo più usato nel calcio professionistico italiano. Per i Juniores capire come il possesso si adatta a seconda che l''avversario marchi a uomo o a zona è una competenza tattica fondamentale. Variante: il marcatore stretto può cambiare obiettivo solo dopo 3 secondi dal tocco avversario. Chi è in possesso deve sfruttare quei 3 secondi per impostare l''azione senza pressione ravvicinata.',
  30, 'possesso_palla', 'juniores',
  JSON_ARRAY('zona-mista', 'possesso', 'marcatura', 'tattica difensiva', 'pressing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso zona-mista: marcatura stretta sul portatore e copertura di zona' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Costruzione dal basso con vincolo di 5 tocchi massimi in zona difensiva',
  'Campo intero. In zona difensiva ogni giocatore tocca palla al massimo 5 volte prima di giocarla. Nessun portatore di palla gira su se stesso per liberarsi: gioca in avanti o laterale. L''avversario pressa con 6 giocatori nella metà campo difensiva. Obiettivo: il vincolo dei 5 tocchi in zona difensiva forza la circolazione veloce e previene la perdita palla in zone pericolose. Per i Juniores questo è il vincolo implicito che un allenatore di prima squadra impone nel costruire dal basso. Chi rispetta il vincolo in allenamento lo rispetta automaticamente in gara. Variante: nella zona difensiva il portiere è l''unico che può toccare senza limite. Questo lo rende il punto di scarico naturale del pressing, come nel calcio reale.',
  35, 'possesso_palla', 'juniores',
  JSON_ARRAY('costruzione dal basso', '5 tocchi', 'possesso', 'vincolo', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Costruzione dal basso con vincolo di 5 tocchi massimi in zona difensiva' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cambio di fronte obbligatorio prima di ogni verticalizzazione',
  'Campo intero 11v11 con portieri. Regola: la squadra in possesso non puo verticalizzare verso porta se non ha effettuato almeno 1 cambio di fronte (passaggio oltre 25m da fascia a fascia) nelle ultime 5 azioni. Se lo fa, concede rimessa dal fondo all''avversario. Obiettivo: il cambio di fronte obbligatorio insegna a spostare la difesa prima di attaccarla. Per i Juniores è il principio tattico fondamentale del calcio posizionale: non si attacca dove la difesa è compatta, ma dove si è appena creato spazio con il movimento della palla in ampiezza. Variante: il cambio di fronte deve avvenire con un tocco obbligatorio. Allena la tecnica del passaggio lungo preciso a velocità di gara con la pressione della regola.',
  38, 'possesso_palla', 'juniores',
  JSON_ARRAY('cambio di fronte', 'verticalizzazione', 'possesso', 'ampiezza', 'posizionale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cambio di fronte obbligatorio prima di ogni verticalizzazione' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Mantenimento del possesso nella metà campo avversaria',
  'Campo 40x35m posizionato nella metà campo avversaria. 9 in possesso contro 6 in pressing. Chi è in possesso non puo uscire dalla metà campo avversaria: se la palla supera la linea mediana, va all''avversario. Ogni possesso mantenuto per 8 passaggi vale 1 punto. Obiettivo: tenere palla nella metà campo avversaria è il lavoro più difficile perché lo spazio è ridotto e il pressing avversario è in superiorità. Per i Juniores questo formato allena la qualità tecnica sotto pressione nella zona più pericolosa per la difesa avversaria — quella dove si fanno i gol. Variante: ogni volta che la squadra in possesso tocca la linea di fondo avversaria con la palla vale 2 punti. Sposta l''obiettivo dal mantenimento puro alla minaccia offensiva concreta.',
  35, 'possesso_palla', 'juniores',
  JSON_ARRAY('possesso in zona offensiva', 'pressing', 'qualità tecnica', 'tattica', 'possesso'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Mantenimento del possesso nella metà campo avversaria' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso in inferiorità numerica 7v9: qualità tecnica sotto pressione',
  'Campo 40x30m. 7 giocatori in possesso contro 9 in pressing. L''inferiorità numerica è intenzionale. Il team di 7 puo uscire solo se mantiene palla per almeno 4 passaggi consecutivi senza errori. Se i 9 recuperano segnano in porta piccola. Obiettivo: allenarsi in inferiorità numerica è il modo più efficace per sviluppare qualità tecnica sotto pressione. Il possesso in 7v9 forza movimenti più veloci, controlli più precisi e letture anticipate della posizione degli avversari. Per i Juniores questo è il formato che simula la pressione psicologica di giocare in 10 uomini. Variante: un jolly extra si aggiunge dal bordo del campo ogni 90 secondi. Il suo ingresso simula il cambio tattico in corso di gara.',
  30, 'possesso_palla', 'juniores',
  JSON_ARRAY('inferiorità numerica', 'possesso', 'pressione', 'qualità tecnica', 'resilienza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso in inferiorità numerica 7v9: qualità tecnica sotto pressione' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: finalizzazione (10 sessioni · 25-40 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finalizzazione in transizione 4v3 con verticalizzazione immediata',
  'Azione parte da centrocampo: 4 attaccanti contro 3 difensori in transizione offensiva su campo intero. La palla parte dal mister (simula il recupero reale). I 4 devono concludere entro 8 secondi dalla ricezione. Portiere in porta. 4 serie da 5 azioni. Obiettivo: la finalizzazione in transizione 4v3 allena la decisione offensiva ad alta velocità. Per i Juniores il problema principale è perdere tempo nel momento di massima superiorità numerica. Chi finalizza meglio in transizione ha già deciso il tiro prima di ricevere la palla. Variante: i difensori partono con 5m di vantaggio. Il tempo a disposizione si riduce. Allena la verticalizzazione immediata senza ricercare la combinazione quando il vantaggio di tempo è ridotto.',
  30, 'finalizzazione', 'juniores',
  JSON_ARRAY('transizione offensiva', '4v3', 'finalizzazione', 'verticalizzazione', 'decisione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finalizzazione in transizione 4v3 con verticalizzazione immediata' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro su seconda palla dopo cross respinto in area',
  'Crossatore sulla fascia. Un difensore in area respinge il cross. La seconda palla cade fuori area (15-22m). Il centrocampista inserisce sul rimbalzo e tira di prima o con stop orientato. Portiere in porta. 6 serie da 5 cross per lato. Obiettivo: la seconda palla dopo il cross respinto è una delle situazioni offensive più frequenti e meno allenate nel settore giovanile. Per i Juniores il centrocampista che attacca sistematicamente la seconda palla con intenzione offensiva è un''arma tattica che produce gol spesso imprevedibili per la difesa. Variante: il difensore respinge sia di testa che di piede senza comunicarlo. Il centrocampista legge la traiettoria del rimbalzo nella corsa di avvicinamento all''area.',
  28, 'finalizzazione', 'juniores',
  JSON_ARRAY('seconda palla', 'cross', 'centrocampista', 'finalizzazione', 'rimbalzo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro su seconda palla dopo cross respinto in area' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finalizzazione della seconda punta su sponda del centravanti',
  'Il centravanti riceve di spalle a 20m, protegge e scarica immediatamente per la seconda punta in corsa. La seconda punta conclude di prima o con un tocco. Portiere in porta. 6 serie da 5 combinazioni per lato. Progressione: un difensore entra sul centravanti. Obiettivo: la combinazione centravanti-seconda punta è il meccanismo offensivo che sfrutta la capacità del centravanti di tenere palla sotto pressione. Per i Juniores il timing dell''inserimento della seconda punta è la chiave: parte quando il centravanti riceve, non quando scarica. Variante: il centravanti puo scegliere di girarsi direttamente se non è pressato. La seconda punta legge la scelta e adatta il movimento tra il taglio in profondità e il supporto laterale.',
  28, 'finalizzazione', 'juniores',
  JSON_ARRAY('seconda punta', 'centravanti', 'sponda', 'finalizzazione', 'combinazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finalizzazione della seconda punta su sponda del centravanti' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Calci di punizione diretti: schemi per posizioni frontali e laterali',
  'Lavoro sui calci di punizione diretti. 3 posizioni: frontale a 20m (schema a barriera), laterale DX a 22m (schema giro sul palo lontano), laterale SX a 22m (schema potenza sul palo vicino). 5 esecuzioni per schema per ogni tiratore specializzato. Difesa con barriera e portiere. Obiettivo: i calci di punizione a livello Juniores devono avere tiratori specializzati con schema fisso. Non tutti tirano le punizioni: il tiratore conosce il proprio schema, il portiere conosce la traiettoria e la difesa conosce la zona da proteggere. Variante: la difesa sposta la barriera di 1m lateralmente a propria scelta prima del tiro. Il tiratore adatta la traiettoria nel run-up oppure sceglie un''alternativa tattica codificata.',
  35, 'finalizzazione', 'juniores',
  JSON_ARRAY('calcio di punizione', 'palla inattiva', 'schema', 'finalizzazione', 'specializzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Calci di punizione diretti: schemi per posizioni frontali e laterali' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro di potenza da fuori area su combinazione rapida a tre',
  'Tre giocatori a semicerchio a 22-25m dalla porta. Passaggi veloci, al terzo passaggio chi è in condizione tira di potenza (collo pieno) senza apertura verso l''area. Portiere in porta. 10 minuti di schema, poi partitella 6v6 con bonus punto su gol da fuori area. Obiettivo: il tiro di potenza da fuori area costringe la difesa ad alzare la linea e crea spazi per gli attaccanti alle spalle. Per i Juniores la qualità del tiro da fuori area è un''arma tattica che si allena meno di quanto si usa. Un tiro deciso e angolato da 25m vale quanto un dribbling riuscito. Variante: il difensore entra nel raggio del tiro dopo il secondo passaggio. Il tiratore anticipa il movimento e trova il corridoio libero per il tiro.',
  28, 'finalizzazione', 'juniores',
  JSON_ARRAY('tiro da fuori area', 'potenza', 'combinazione', 'finalizzazione', 'collo pieno'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro di potenza da fuori area su combinazione rapida a tre' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cross teso a rientrare dalla fascia con attaccante in anticipo',
  'L''ala parte dal vertice dell''area, conduce verso il fondo, crossa teso a rientrare verso il centro. L''attaccante parte dal secondo palo in anticipo e attacca la traiettoria del cross in corsa. Difensore in area. Portiere in porta. 6 serie da 4 cross per lato. Obiettivo: il cross teso a rientrare (inswinger) è tecnicamente il più difficile da difendere perché la palla viene verso la porta. Per i Juniores l''attaccante deve imparare che sull''inswinger si anticipa il difensore con il timing di partenza, non con la velocità in corsa. Variante: il crossatore puo scegliere di tagliare verso l''area invece di crossare. L''attaccante legge il gesto del crossatore durante la corsa di inserimento e adatta la traiettoria.',
  30, 'finalizzazione', 'juniores',
  JSON_ARRAY('cross a rientrare', 'inswinger', 'attaccante', 'timing', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cross teso a rientrare dalla fascia con attaccante in anticipo' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Inserimento in area su cross del terzino sovrapposto',
  'Schema a tre: ala-terzino-attaccante. L''ala parte palla al piede, il terzino si sovrappone in fascia. L''ala passa al terzino sovrapposto e rientra in area. Il terzino crossa. L''attaccante e l''ala rientrata attaccano l''area. Difensore e portiere in porta. 6 serie per lato. Obiettivo: la sovrapposizione del terzino crea il 2v1 sulla fascia. Per i Juniores la sincronizzazione tra il rientro dell''ala in area e il cross del terzino è la chiave: l''ala deve essere già in area quando il cross parte, non quando il terzino alza la testa. Variante: il terzino puo scegliere di entrare in area lui stesso invece di crossare. L''attaccante legge la scelta e libera lo spazio centrale.',
  30, 'finalizzazione', 'juniores',
  JSON_ARRAY('sovrapposizione', 'terzino', 'cross', 'inserimento', 'sincronizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Inserimento in area su cross del terzino sovrapposto' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Conclusione in area affollata: protezione palla e girata con due difensori',
  'L''attaccante riceve spalle alla porta a 12m con 2 difensori ravvicinati. Deve proteggere per massimo 2 secondi e scegliere: girata verso il palo lontano, layoff per il centrocampista che inserisce, oppure resistenza al contrasto guadagnando il fallo. Portiere in porta. 8 serie da 6 ripetizioni con rotazione dei ruoli. Obiettivo: in area affollata l''attaccante non ha né tempo né spazio. La decisione va presa prima di ricevere. Per i Juniores questo fondamentale tecnico-tattico è il più difficile da automatizzare perché unisce forza fisica, tecnica di protezione e lettura della posizione difensiva. Variante: i difensori non foulano mai. L''attaccante crea l''opportunità con la tecnica pura, non aspettando il contatto.',
  28, 'finalizzazione', 'juniores',
  JSON_ARRAY('area affollata', 'protezione palla', 'attaccante', 'finalizzazione', 'fondamentale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Conclusione in area affollata: protezione palla e girata con due difensori' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro al volo su cross alto: coordinazione e anticipazione del punto di contatto',
  'Crossatore sulla fascia, cross alto verso il centro dell''area. Il giocatore arriva in corsa dalla zona di centrocampo e colpisce al volo — di collo pieno se la palla è all''altezza giusta, di testa se è troppo alta. Portiere in porta, difensore in area. 6 serie da 5 cross per lato. Obiettivo: il tiro al volo è il gesto tecnico più spettacolare e meno allenato nel settore giovanile. Per i Juniores la chiave non è la potenza ma la coordinazione tra il punto di contatto e la traiettoria del cross. Chi tocca nel punto giusto va in rete con poca forza. Variante: il crossatore comunica la traiettoria con un gesto della mano 1 secondo prima del cross. Il tiratore adatta la tecnica in anticipo tra volo e colpo di testa.',
  28, 'finalizzazione', 'juniores',
  JSON_ARRAY('tiro al volo', 'cross alto', 'coordinazione', 'tecnica', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro al volo su cross alto: coordinazione e anticipazione del punto di contatto' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Corner offensivi con blocco coordinato e taglio al secondo palo',
  'Calci d''angolo offensivi con schema a blocco. Schema 1: attaccante blocca il difensore per liberare il compagno al secondo palo. Schema 2: corner corto con rientro e cross teso al centro. Schema 3: cross teso al primo palo con attaccante in anticipo sulla traiettoria. 5 esecuzioni per schema. Difesa di 5 più portiere. Obiettivo: i calci d''angolo con blocco coordinato sono il sistema più efficace a livello senior perché neutralizzano la marcatura difensiva. Per i Juniores il blocco deve essere legale (corpo fermo, nessuna spinta). Variante: la difesa usa marcatura a zona invece di a uomo. Il team in attacco adatta gli schemi senza blocchi espliciti, usando invece tagli incrociati.',
  35, 'finalizzazione', 'juniores',
  JSON_ARRAY('corner', 'blocco', 'palla inattiva', 'schema', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Corner offensivi con blocco coordinato e taglio al secondo palo' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: atletica_fisico (10 sessioni · 22-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sprint lattacidi ripetuti con recupero attivo tecnico',
  '8 sprint su 15m con 30 secondi di recupero attivo (palleggi in coppia). 6 sprint su 20m con 45 secondi di recupero. 4 sprint su 30m con 60 secondi di recupero. Il recupero attivo è sempre con palla: mai camminata passiva. Obiettivo: il lavoro lattacido specifico per il calcio si allena con sprint brevi e medi ad intensità massimale. Il recupero attivo con palla mantiene il focus tecnico anche nella fase di deossidazione muscolare. Per i Juniores che si avvicinano al calcio senior questo è il formato più efficace per sviluppare la capacità di sprint ripetuti lungo tutta la gara. Variante: durante il recupero attivo chi sbaglia il passaggio aggiunge uno sprint bonus di 10m. Crea pressione tecnica anche nella fase di recupero.',
  25, 'atletica_fisico', 'juniores',
  JSON_ARRAY('sprint lattacidi', 'velocità', 'resistenza', 'recupero attivo', 'intensità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sprint lattacidi ripetuti con recupero attivo tecnico' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Potenza esplosiva: squat jump integrati con tecnica di palla immediata',
  'Sequenza per gruppo: 5 squat jump esplosivi (salti verticali da posizione piegata), poi ricezione di palla da compagno a 10m, controllo orientato e passaggio verso terzo compagno. 3 secondi di pausa, poi ripeti. 6 serie da 4 ripetizioni. Obiettivo: il sistema nervoso è massimalmente attivato subito dopo i salti esplosivi. Ricevere e passare in quella condizione allena la tecnica sotto stress neuromuscolare elevato. Per i Juniores questo tipo di lavoro migliora la qualità tecnica nelle situazioni di massima fatica fisica, che è quando la tecnica collassa per la maggior parte dei giocatori. Variante: porta i squat jump a 8 prima del tocco di palla. Il coordinamento tecnico sotto maggiore fatica è il test del livello tecnico reale.',
  28, 'atletica_fisico', 'juniores',
  JSON_ARRAY('squat jump', 'potenza esplosiva', 'tecnica sotto fatica', 'neuromuscolare', 'forza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Potenza esplosiva: squat jump integrati con tecnica di palla immediata' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Resistenza aerobica specifica: 6v6 continuo ad alta intensità',
  'Campo 35x25m, 6v6 senza pause vere. Chi non si muove senza palla non gioca. Il mister conta ogni 3 minuti: la squadra con meno movimento senza palla in quel periodo fa 3 sprint a bordo campo. Partite da 5 minuti con 1 minuto di recupero. 5 partite totali. Obiettivo: la resistenza aerobica nel calcio non si allena con la corsa continua ma con il formato di partita ad alta intensità. Per i Juniores il 6v6 continuo è il modo più fedele di simulare il carico aerobico reale di 90 minuti. Variante: chi perde palla deve fare pressing immediato. Se non lo fa entro 2 secondi, la sua squadra cede il possesso senza che la palla venga toccata dall''avversario. Unisce resistenza aerobica e mentalità del counter-press.',
  30, 'atletica_fisico', 'juniores',
  JSON_ARRAY('resistenza aerobica', '6v6', 'intensità', 'movimento senza palla', 'specifico calcio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Resistenza aerobica specifica: 6v6 continuo ad alta intensità' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Accelerazione sui primi 10 metri da 5 posizioni di partenza diverse',
  'Sprint su 10m partendo da 5 posizioni: in piedi frontale, in piedi laterale, seduto a terra, da prono (pancia in giù), da ginocchia. 6 ripetizioni per posizione con 20 secondi di pausa. Intensità massimale. Obiettivo: la maggior parte delle situazioni di gara richiede sprint brevi da posizioni scomode — dopo un contrasto, dopo una caduta, da posizione laterale. Per i Juniores allenarsi da posizioni diverse è più specifico del classico sprint da fermo perché simula le condizioni reali. Variante: aggiungi una palla che parte 0.5 secondi prima dello sprint. Il giocatore deve raggiungerla entro i 10m. Allena il tempo di reazione visiva alla palla in condizioni di partenza scomoda.',
  22, 'atletica_fisico', 'juniores',
  JSON_ARRAY('accelerazione', 'sprint breve', 'posizioni diverse', 'velocità reattiva', 'specifico calcio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Accelerazione sui primi 10 metri da 5 posizioni di partenza diverse' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Forza funzionale: circuito a 5 stazioni con palla e peso corporeo',
  '5 stazioni da 45 secondi con 20 secondi di pausa. Stazione 1: lunges alternati con ricezione di palla in posizione bassa. Stazione 2: plank laterale con passaggio in coppia. Stazione 3: step-up su panchina con palla in mano. Stazione 4: Nordic hamstring curl (protezione bicipite femorale). Stazione 5: jumping jacks con palla tra i piedi. 2 giri completi. Obiettivo: la forza funzionale specifica per il calcio combina lavoro di forza con la gestione della palla. Per i Juniores la prevenzione infortuni muscolari (hamstring, quadricipiti) è la priorità nel settore giovanile di alto livello. Variante: stazione 4 diventa Nordic hamstring curl con palla da lanciare al momento della discesa. Abbina forza eccentrica e tecnica di palla sotto sforzo.',
  28, 'atletica_fisico', 'juniores',
  JSON_ARRAY('forza funzionale', 'prevenzione infortuni', 'Nordic curl', 'circuito', 'peso corporeo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Forza funzionale: circuito a 5 stazioni con palla e peso corporeo' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Agilità e cambio di direzione: T-test con varianti reattive e con palla',
  'T-test standard (3 ripetizioni). Poi variante 1: T-test con palla ai piedi in conduzione. Poi variante 2: T-test con cambio di direzione su segnale visivo del mister non predefinito. 4 serie per variante. Obiettivo: il T-test è il test di agilità più usato nel calcio professionistico. Per i Juniores la variante con palla e quella reattiva trasformano un test fisico in un esercizio specifico di agilità calcistica. Il cambio di direzione reattivo è più vicino alla gara del cambio pianificato perché non permette anticipazione. Variante: T-test in coppia in gara diretta. Chi arriva prima alla fine parte con 0.5 secondi di vantaggio nel turno successivo. La competizione aumenta l''intensità.',
  25, 'atletica_fisico', 'juniores',
  JSON_ARRAY('T-test', 'agilità', 'cambio direzione', 'velocità reattiva', 'specifico calcio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Agilità e cambio di direzione: T-test con varianti reattive e con palla' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Resistenza lattacida: 3v3 massimale con recupero passivo programmato',
  'Campo 20x15m. 3v3 ad intensità massimale. 30 secondi di gioco alla massima intensità, poi 60 secondi di recupero passivo fuori dal campo. 8 cicli per ogni trio. Il pressing è totale durante i 30 secondi attivi. Obiettivo: la resistenza lattacida si allena con sforzi brevi e massimali seguiti da recupero adeguato. Per i Juniores il 3v3 massimale sviluppa la capacità di sostenere il pressing ultra-offensivo ripetuto per tutta la gara. Il recupero passivo è deliberato: a livello senior non si recupera correndo. Variante: nei 60 secondi di recupero ogni giocatore deve toccare la palla almeno 5 volte (palleggio individuale). Mantiene la coordinazione e la sensazione di palla anche in stato di affaticamento lattacido elevato.',
  28, 'atletica_fisico', 'juniores',
  JSON_ARRAY('lattacido', '3v3', 'massimale', 'recupero passivo', 'resistenza specifica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Resistenza lattacida: 3v3 massimale con recupero passivo programmato' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Prevenzione infortuni: propriocezione e stabilizzazione articolare',
  'Circuito a 4 stazioni da 40 secondi. Stazione 1: equilibrio monopiede su superficie instabile con lanci e prese di palla in coppia. Stazione 2: squat monopiede controllato alternando piede destro e sinistro. Stazione 3: salti laterali su linea con atterraggio monopiede e 3 secondi di stabilizzazione. Stazione 4: camminata sulle punte dei piedi con palla che ruota in cerchio attorno al corpo. 3 giri completi. Obiettivo: la propriocezione è la capacità del sistema nervoso di riconoscere la posizione del corpo nello spazio. Per i Juniores è la prevenzione principale delle distorsioni alla caviglia e ai legamenti del ginocchio. Variante: stazione 1 in coppia con passaggi a 5m. Chi perde l''equilibrio durante la ricezione aggiunge 3 flessioni.',
  22, 'atletica_fisico', 'juniores',
  JSON_ARRAY('propriocezione', 'prevenzione infortuni', 'stabilizzazione', 'monopiede', 'articolare'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Prevenzione infortuni: propriocezione e stabilizzazione articolare' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Velocità reattiva: avvio da posizione scomoda su segnale acustico',
  'Tre file di giocatori seduti di spalle alla porta. Fischio singolo: si girano e scattano verso la palla a 10m. Fischio doppio: si girano e scattano verso la palla a 20m in senso opposto. Fischio triplo: si girano, ricevono dal compagno a 5m e concludono verso porta. 4 serie da 6 segnali misti. Obiettivo: la velocità reattiva da posizione scomoda è la forma di velocità più specifica per il calcio. In gara non si scatta mai da posizione ottimale. Per i Juniores l''allenamento da posizione scomoda migliora i tempi di reazione nelle situazioni di duello e di secondo tempo sulla palla. Variante: i segnali diventano visivi invece che acustici (cartello colorato del mister). Allena la velocità reattiva visiva.',
  22, 'atletica_fisico', 'juniores',
  JSON_ARRAY('velocità reattiva', 'posizione scomoda', 'segnale acustico', 'sprint', 'reazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Velocità reattiva: avvio da posizione scomoda su segnale acustico' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Forza relativa: circuito isometrico-balistico per calciatori senior',
  '6 stazioni da 40 secondi con 20 secondi di pausa. Stazione 1: wall squat isometrico (3 ripetizioni da 40 secondi). Stazione 2: sprint di 10m immediatamente dopo. Stazione 3: plank frontale 30 secondi. Stazione 4: sprint di 5m dopo il plank. Stazione 5: isometrica monopiede 20 secondi per piede. Stazione 6: salto verticale massimale immediato. 2 giri. Obiettivo: la combinazione isometrica-balistica sviluppa la capacità di generare forza esplosiva partendo da posizione statica. Per i Juniores questo si traduce in scatto rapido dopo un contrasto o una fase difensiva statica prolungata. Variante: dopo ogni stazione isometrica si aggiunge una ricezione di palla a difficoltà crescente. Allena la tecnica in stato di pre-fatica.',
  28, 'atletica_fisico', 'juniores',
  JSON_ARRAY('isometrico', 'balistico', 'forza relativa', 'esplosività', 'forza specifica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Forza relativa: circuito isometrico-balistico per calciatori senior' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: portieri (10 sessioni · 28-38 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate su tiri potenti da distanza con recupero posizionale rapido',
  'Tiri potenti da 20-25m alternati da angoli diversi: centro, angolo DX, angolo SX. Il portiere para e recupera la posizione di base entro 2 secondi per il tiro successivo. 5 serie da 6 tiri con 90 secondi di pausa. Progressione: riduzione del tempo tra un tiro e il successivo a 1.5 secondi. Obiettivo: i tiri potenti da distanza richiedono non solo la parata ma la resistenza fisica e mentale alle serie ravvicinate. Per i portieri Juniores la velocità di recupero posizionale dopo una parata è il fondamentale che più spesso fa la differenza in gara. Variante: uno dei 6 tiri della serie è un pallonetto da 30m senza preavviso. Il portiere adatta il posizionamento durante la corsa del tiratore invece di restare sulla linea.',
  30, 'portieri', 'juniores',
  JSON_ARRAY('tiri potenti', 'recupero posizionale', 'parata', 'portiere', 'resistenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate su tiri potenti da distanza con recupero posizionale rapido' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sequenza uscita alta su cross più gestione immediata del 1v1',
  'Il portiere gestisce un cross alto (uscita o parata sulla linea). Entro 2 secondi il mister lancia una palla in area verso un attaccante che parte da posizione laterale. Il portiere rientra e gestisce il 1v1. 6 serie da 4 azioni. Obiettivo: la transizione da uscita alta a gestione del 1v1 è la situazione più difficile per un portiere. Per i portieri Juniores questo lavoro allena la capacità di resettare mentalmente la posizione dopo l''uscita e di gestire due situazioni consecutive di massimo rischio senza pausa. Variante: tra l''uscita e il 1v1 il portiere deve distribuire ai piedi verso un difensore libero. Gestisce 3 azioni consecutive di tipo diverso in rapida successione.',
  35, 'portieri', 'juniores',
  JSON_ARRAY('uscita alta', '1v1', 'sequenza', 'portiere', 'gestione consecutiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sequenza uscita alta su cross più gestione immediata del 1v1' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Costruzione con i piedi in 4-2-3-1 contro 5 schemi di pressing diversi',
  'Campo intero. Il portiere lavora sulla costruzione in 4-2-3-1 contro 5 schemi di pressing: 1) punta sola chiude il difensore centrale, 2) punta più mezzala coprono anche il terzino, 3) due punte più un mediano, 4) pressing ultra-alto su tutti i difensori, 5) pressing asimmetrico su un solo lato. Per ogni schema il portiere trova la soluzione corretta. 8 minuti per schema. Obiettivo: il portiere che sa uscire da 5 schemi di pressing diversi è un portiere di prima squadra. Per i Juniores questo è il lavoro di transizione verso il calcio adulto. Variante: il mister non comunica lo schema di pressing. Il portiere lo riconosce durante il movimento difensivo avversario prima di ricevere.',
  35, 'portieri', 'juniores',
  JSON_ARRAY('costruzione con piedi', '4-2-3-1', 'pressing', 'portiere', 'schemi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Costruzione con i piedi in 4-2-3-1 contro 5 schemi di pressing diversi' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate basse angolate: copertura del palo vicino e tuffo sul palo lontano',
  'Tiratore a 18m in posizione angolata. Tiro rasoterra angolato verso il palo vicino. Il portiere copre il palo vicino con il corpo prima di buttarsi. Poi variante: tiro verso il palo lontano. Il portiere si sposta da un palo all''altro su 10 tiri consecutivi. 4 serie. Obiettivo: la tecnica corretta sulle parate basse angolate è copri prima il palo vicino, poi esplodi verso il palo lontano. Chi esplode prima di coprire il palo vicino viene sempre battuto sul primo palo. Per i portieri Juniores questa sequenza tecnica deve essere automatica. Variante: il tiratore sceglie liberamente tra tiro rasoterra e tiro in altezza senza comunicarlo. Il portiere mantiene la posizione di copertura corretta per entrambe le situazioni.',
  28, 'portieri', 'juniores',
  JSON_ARRAY('parata bassa', 'palo vicino', 'tuffo', 'portiere', 'tecnica di parata'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate basse angolate: copertura del palo vicino e tuffo sul palo lontano' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Comunicazione difensiva: il portiere come regista della linea',
  'Partitella 9v9 su campo intero. Regola: il portiere deve dare almeno 3 istruzioni tattiche vocali ad alta voce ogni 2 minuti (es. "terzino su", "linea", "uomo al centro"). Se non lo fa, la sua squadra cede un calcio di punizione in posizione avanzata. Il mister conta le istruzioni. Obiettivo: il portiere come regista difensivo non è un ruolo accessorio. Per i portieri Juniores la comunicazione difensiva è il lavoro che evita i gol presi per mancanza di informazioni sulla posizione degli attaccanti. Un portiere silenzioso lascia la difesa cieca. Variante: il mister finge di essere sordo a turno su un difensore. Il portiere deve compensare la mancanza di comunicazione del difensore comunicando lui stesso in modo più insistente.',
  35, 'portieri', 'juniores',
  JSON_ARRAY('comunicazione', 'portiere', 'regista difensivo', 'linea difensiva', 'vocale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Comunicazione difensiva: il portiere come regista della linea' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita bassa 1v1 con valutazione della distanza e gestione del secondo attaccante',
  'Palla lanciata in profondità verso un attaccante che parte da centrocampo. Il portiere esce. Se raggiunge la palla prima dell''attaccante la gioca con i piedi verso un difensore libero. Se l''attaccante la raggiunge prima, gestisce il 1v1. 8 serie per portiere. Progressione: l''attaccante parte 1 secondo prima. Obiettivo: la decisione di uscire o restare deve essere automatica in base alla distanza dalla palla. Per i portieri Juniores il principio è: se raggiungi la palla con 2 passi prima dell''attaccante, esci. Altrimenti attendi il 1v1. Variante: un secondo attaccante parte da posizione laterale. Il portiere considera la posizione del secondo attaccante prima di decidere se uscire.',
  30, 'portieri', 'juniores',
  JSON_ARRAY('uscita bassa', '1v1', 'decisione portiere', 'profondità', 'tecnica portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita bassa 1v1 con valutazione della distanza e gestione del secondo attaccante' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate ravvicinate su deviazioni e colpi di testa in area piccola',
  'Il portiere è posizionato 1.5m avanti dalla linea. Il mister calcia da 8m verso porta. Nell''area piccola c''è un attaccante che puo deviare la palla prima che arrivi al portiere. Il portiere legge la possibile deviazione e adatta la parata. 6 serie da 5 tiri. Obiettivo: le parate su deviazioni ravvicinate richiedono la lettura anticipata della traiettoria modificata. La palla cambia direzione a meno di 3m. Per i portieri Juniores la posizione iniziale del corpo è tutto: chi si posiziona bene para anche le deviazioni. Variante: l''attaccante sceglie liberamente se deviare o lasciare passare. Il portiere legge il corpo dell''attaccante prima del contatto con la palla per anticipare la sua scelta.',
  28, 'portieri', 'juniores',
  JSON_ARRAY('deviazione', 'parata ravvicinata', 'area piccola', 'portiere', 'lettura'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate ravvicinate su deviazioni e colpi di testa in area piccola' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Portiere costruttore: uscita corta a 3 contro pressing a 2 punte',
  'Il portiere lavora sulla costruzione corta con i 2 difensori centrali quando il pressing avversario chiude i terzini. Schema: portiere riceve il retropassaggio, valuta la pressione, distribuisce al difensore centrale libero che apre sul terzino. Prima senza avversari (schema fisso), poi con pressing reale a 2 punte. Obiettivo: la costruzione a 3 sotto pressing a 2 punte è la situazione tattica più comune per un portiere a livello senior. Per i portieri Juniores padroneggiare questa uscita corta è il requisito base per il calcio adulto. Variante: il pressing passa a 3 giocatori aggiungendo una mezzala. Il portiere valuta se la costruzione corta è ancora sicura o se il rilancio lungo è la scelta corretta.',
  30, 'portieri', 'juniores',
  JSON_ARRAY('portiere costruttore', 'retropassaggio', 'pressing', 'costruzione a 3', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Portiere costruttore: uscita corta a 3 contro pressing a 2 punte' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gestione delle palle inattive difensive: calci d''angolo e punizioni avversarie',
  'Il portiere gestisce le palle inattive in difesa. Schema 1: calcio d''angolo avversario — il portiere coordina difesa a zona o a uomo con istruzioni vocali prima del corner. Schema 2: punizione da posizione laterale — posiziona la barriera e copre il secondo palo. Schema 3: punizione frontale — decide se barriera a 9.15m oppure barriera ridotta per mantenere visione. 5 esecuzioni per schema. Obiettivo: le palle inattive producono il 25-30% dei gol nel calcio moderno. Per i portieri Juniores la gestione della palla inattiva difensiva è il lavoro meno allenato ma più redditizio. Variante: il mister varia lo schema della palla inattiva avversaria senza comunicarlo. Il portiere adatta le istruzioni al tipo di schema letto in tempo reale.',
  35, 'portieri', 'juniores',
  JSON_ARRAY('palle inattive', 'calci d''angolo', 'punizione', 'portiere', 'organizzazione difensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gestione delle palle inattive difensive: calci d''angolo e punizioni avversarie' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate ad alta intensità in serie: resistenza specifica del portiere',
  '4 serie da 8 tiri consecutivi con 90 secondi di pausa tra le serie. I tiri arrivano alternati senza ordine predefinito: 2 rasoterra angolati, 2 alti angolati, 2 centrali a mezza altezza, 2 ravvicinati da 12m. Tempo tra un tiro e il successivo: 4 secondi. Obiettivo: la resistenza specifica del portiere si allena con serie ravvicinate di alta intensità. Le ultime parate della serie simulano la parata decisiva al 90° minuto sotto massima stanchezza fisica. Per i portieri Juniores mantenere la tecnica di parata invariata dalla prima all''ottava parata della serie è il vero obiettivo. Variante: quarta serie con 2.5 secondi tra i tiri. Il portiere para da posizione non ottimale — allena la parata in condizioni di emergenza.',
  30, 'portieri', 'juniores',
  JSON_ARRAY('resistenza specifica', 'parate in serie', 'alta intensità', 'portiere', 'tecnica sotto fatica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate ad alta intensità in serie: resistenza specifica del portiere' AND eta_leva = 'juniores' AND ufficiale_myvivaio = TRUE
);


-- STEP B COMPLETATO — 35 INSERT (possesso_palla 5, finalizzazione 10, atletica_fisico 10, portieri 10)
-- TOTALE FILE: 70 INSERT (Step A 35 + Step B 35)

SELECT COUNT(*) AS totale_juniores FROM sessioni_libreria WHERE ufficiale_myvivaio = TRUE AND eta_leva = 'juniores';
