-- ═══════════════════════════════════════════════════════════════════════════
-- MyVivaio — Sessioni Ufficiali Categoria ALLIEVI (U15/U16)
-- File:    20260521_sessioni_ufficiali_allievi.sql
-- Totale:  70 sessioni · 10 per ciascuna delle 7 categorie
-- Data:    2026-05-21
-- Autore:  MyVivaio Editorial Team
-- Round:   4 di N (Rounds 1-3 Pulcini/Esordienti/Giovanissimi già caricati)
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
  'Possesso 6v3 ad alta intensità con uscite rapide',
  'Campo 25x25m, 6 tengono contro 3 che pressano. Regola: massimo 2 tocchi obbligatori da subito, senza fase di rodaggio. Girate da 3 minuti con 45 secondi di recupero attivo. Quando i 3 recuperano palla, devono uscire dallo spazio entro 5 secondi passando per un cono esterno. Obiettivo: attivazione intensa e immediata. Gli Allievi devono partire già ad alta intensità cardiovascolare e cognitiva. Variante: i 3 in pressing si alternano ogni minuto senza pausa. Chi esce dal pressing non si ferma: entra subito a fare pressing sul campo accanto. Nessun momento di stop passivo durante il riscaldamento. A questa età il riscaldamento ''morbido'' non è più necessario e rischia di abbassare il livello di concentrazione per tutta la sessione.',
  20, 'riscaldamento', 'allievi',
  JSON_ARRAY('possesso', 'pressing', 'intensità', 'riscaldamento'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 6v3 ad alta intensità con uscite rapide' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Riscaldamento tattico su modulo 4-3-3',
  'Campo intero, tutta la squadra si posiziona sul modulo 4-3-3. Muovono la palla seguendo i principi di circolazione: palla al terzino che attira il pressing, il difensore centrale scarica sul mediano basso, il mediano smista sulla mezzala. Tutte le posizioni si muovono mantenendo le distanze del modulo. Prima senza opposizione, poi con 3 pressatori semi-attivi. Obiettivo: riscaldare su una struttura che useranno in partita. I movimenti di posizione senza palla si imparano meglio quando le gambe sono ancora fresche. Variante: entra una seconda linea di pressing (5 giocatori pressano). La squadra deve uscire con la palla mantenendo il modulo e il portiere viene coinvolto come primo costruttore.',
  20, 'riscaldamento', 'allievi',
  JSON_ARRAY('4-3-3', 'modulo', 'circolazione', 'riscaldamento', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Riscaldamento tattico su modulo 4-3-3' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione neuromuscolare con scaletta e tiro',
  'Scaletta agility orizzontale. Sequenza: piede alternato classico, poi laterale, poi laterale incrociato. Al termine di ogni passaggio nella scaletta: ricezione di un passaggio dal lato (compagno con cesta), controllo orientato e tiro in porta entro 1.5 secondi. 8 serie per tipo di scaletta, recupero 30 secondi tra le serie. Obiettivo: attivazione specifica del sistema neuro-muscolare degli arti inferiori. Per gli Allievi la scaletta integrata con il gesto tecnico è il modo più efficiente per scaldare contemporaneamente velocità di gambe e automatismi tecnici. Variante: tra la scaletta e la ricezione aggiungi un ostacolo da saltare. La sequenza diventa: scaletta, salto, controllo, tiro. Simula la catena motoria di una situazione di gara reale.',
  15, 'riscaldamento', 'allievi',
  JSON_ARRAY('scaletta agility', 'neuromuscolare', 'tiro', 'riscaldamento', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione neuromuscolare con scaletta e tiro' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuito tecnico-atletico in campo intero',
  '4 stazioni da 45 secondi con 15 secondi di spostamento. Stazione 1: conduzione veloce tra sagome a slalom per 20m. Stazione 2: passaggio a parete di prima alternando piede destro e sinistro. Stazione 3: scaletta agility a velocità massima. Stazione 4: tiro in porta con recupero sprint al centro. 3 giri completi. Obiettivo: riscaldamento tecnico-atletico ad alta densità senza spiegazioni frontali. Gli Allievi entrano subito in ritmo di lavoro. Variante: nella seconda tornata le stazioni 1 e 3 diventano lavoro atletico puro (sprint massimali e balzi). La variazione lavoro tecnico-atletico mantiene alta la frequenza cardiaca e stimola entrambi i sistemi metabolici.',
  20, 'riscaldamento', 'allievi',
  JSON_ARRAY('circuito', 'tecnica', 'atletismo', 'riscaldamento', 'intensità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuito tecnico-atletico in campo intero' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Partitella di attivazione 6v6 a tocchi limitati',
  'Due campi da 30x25m, partitelle da 6v6 in contemporanea. Regola: massimo 2 tocchi per tutto il riscaldamento. Nessuna eccezione. Le prime due serie da 4 minuti a intensità progressiva, la terza a piena intensità. Recupero 60 secondi camminando tra le serie. Obiettivo: la limitazione dei tocchi in un gruppo con la capacità tecnica degli Allievi genera automaticamente pressing alto, movimento continuo senza palla e velocità di pensiero elevata. Non è riscaldamento passivo — è un 6v6 ad alto contenuto cognitivo. Variante: ogni 2 minuti un giocatore per squadra diventa portiere di campo (può toccare la palla con le mani ma solo in movimento). La variazione mantiene l''allerta tattica nella fase di attivazione.',
  20, 'riscaldamento', 'allievi',
  JSON_ARRAY('6v6', 'due tocchi', 'riscaldamento', 'intensità', 'pressing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Partitella di attivazione 6v6 a tocchi limitati' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing coordinato su rimessa laterale avversaria',
  'Tutta la squadra in formazione 4-3-3. La squadra avversaria esegue rimesse laterali a diverse altezze del campo. La squadra deve organizzare il pressing: chi va sul portatore, chi scala sui riceventi, chi copre il centro. Prima senza opposizione (tu muovi la palla lentamente), poi a ritmo crescente, poi opposizione piena. Obiettivo: il riscaldamento tattico su palla inattiva avversaria è uno dei lavori più utili per gli Allievi. Le rimesse laterali in gara sono frequenti e spesso sfruttate male dalla squadra in pressing. Variante: aggiungi la regola per cui il pressing deve essere completato entro 5 secondi dalla rimessa. Chi non taglia la linea di passaggio nel tempo dato paga 5 flessioni.',
  22, 'riscaldamento', 'allievi',
  JSON_ARRAY('pressing', 'rimessa laterale', 'organizzazione', 'riscaldamento', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing coordinato su rimessa laterale avversaria' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Andature calcistiche avanzate con palla e sprint',
  'Percorso di 30m sul lato del campo. Sequenza: skip alto con lavoro attivo delle braccia, corsa calciata con estensione completa, galoppata laterale, skip en dedans, corsa incrociata frontale. Ogni andatura andata di 30m, ritorno jogging. Ultime due andature finiscono con sprint di 15m a massima velocità. Seconda tornata: stesse andature ma ogni giocatore porta palla nella prima metà e la passa a un compagno fermo a metà percorso. Obiettivo: meccanica di corsa corretta e attivazione muscolare specifica. Variante: aggiungi un cambio di direzione a 15m prima dello sprint finale. Il corpo deve adattarsi al cambio senza perdere velocità. Utile per i meccanismi di taglio che gli Allievi usano frequentemente in gara.',
  15, 'riscaldamento', 'allievi',
  JSON_ARRAY('andature', 'meccanica di corsa', 'sprint', 'riscaldamento', 'atletismo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Andature calcistiche avanzate con palla e sprint' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Riscaldamento con pressing su fase di costruzione',
  'Metà campo, 6 giocatori costruiscono dal basso contro 4 pressatori. I costruttori hanno 5 secondi per uscire dalla propria trequarti senza perdere palla. I 4 pressatori possono recuperare palla solo nella zona avanzata. Prima serie: pressatori al 60%, seconda: 80%, terza: piena intensità. Obiettivo: riscaldamento con tema tattico specifico collegato alla gara. Gli Allievi si attivano lavorando su una situazione reale. Variante: il portiere entra nella costruzione come nono giocatore (7 contro 4). Il pressing ora deve prevedere la copertura del portiere uscente. Il portiere si allena sulla costruzione dal basso contemporaneamente al resto della squadra, ottimizzando il tempo totale del riscaldamento.',
  22, 'riscaldamento', 'allievi',
  JSON_ARRAY('costruzione dal basso', 'pressing', 'riscaldamento', 'portiere', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Riscaldamento con pressing su fase di costruzione' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondò 8v4 a due tocchi per attivazione rapida',
  'Campo 35x35m, 8 in possesso contro 4 che pressano. Regola unica: massimo 2 tocchi, senza eccezioni e senza fase di rodaggio. Girate da 3 minuti con 1 minuto di recupero attivo (jogging perimetrale). I 4 difensori ruotano ogni girata. Obiettivo: riscaldamento ad alta intensità cognitiva e tecnica senza spiegazioni aggiuntive. Un 8v4 a 2 tocchi è già noto agli Allievi e genera automaticamente il ritmo e la concentrazione giusti. Variante: a metà della terza girata i tocchi salgono a 3 ma i difensori raddoppiano su chi tiene palla più di 2 secondi. Mantiene alta la pressione difensiva su chi rallenta nel possesso e simula la situazione reale di gara.',
  18, 'riscaldamento', 'allievi',
  JSON_ARRAY('rondò', '8v4', 'due tocchi', 'riscaldamento', 'attivazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondò 8v4 a due tocchi per attivazione rapida' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attivazione con possesso e cambio fronte rapido',
  'Campo intero, 10 giocatori in possesso distribuiti sul modulo. La palla deve arrivare da un lato all''altro del campo in massimo 4 passaggi. Ogni cambio di fronte completato vale 1 punto. Prima senza difensori, poi con 3 pressatori che cercano di bloccare il cambio. Obiettivo: riscaldamento con concetto tattico diretto — il cambio di fronte come strumento per mettere la difesa in difficoltà. Per gli Allievi il riscaldamento deve avere sempre un obiettivo tattico dichiarato. Variante: il cambio di fronte deve avvenire con un passaggio diretto lungo di almeno 30m. Allena la tecnica del passaggio lungo in un contesto di riscaldamento ad alta specificità.',
  20, 'riscaldamento', 'allievi',
  JSON_ARRAY('cambio fronte', 'possesso', 'passaggio lungo', 'riscaldamento', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attivazione con possesso e cambio fronte rapido' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tecnica_individuale (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Controllo in velocità e girata a pressione alta',
  'Gruppi da 3 in un triangolo 10x10m. Un giocatore al centro riceve da un lato con un difensore che entra dopo 1.5 secondi. Deve controllare in velocità, girarsi e passare verso il terzo lato prima che il difensore arrivi. 8 ripetizioni al centro, poi si scambia. Progressione: il difensore entra dopo 1 secondo. Poi entra insieme alla palla (piena intensità). Obiettivo: il controllo in velocità con difensore alle spalle è il fondamentale tecnico più richiesto in gara per una mezzala. La differenza tra un Allievo e un giocatore adulto spesso sta proprio qui: chi controlla in velocità e chi no. Variante: il passaggio finale deve essere filtrante, non laterale. Allena la catena controllo-girata-filtrante che è il movimento base del centrocampista moderno.',
  25, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('controllo orientato', 'girata', 'pressione', 'mezzala', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Controllo in velocità e girata a pressione alta' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Passaggio filtrante di prima su linee oblique',
  'Campo 30x20m, 4 giocatori su una griglia a rombo. La palla gira sul rombo di prima. Ogni terzo passaggio deve essere filtrante (obliquo) verso il centro del rombo dove un compagno si è smarcato. Il compagno controlla e rimette in circolazione. 6 rotazioni, poi cambio di ruolo. Regola: massimo 1 secondo di pausa tra ricezione e passaggio. Obiettivo: il passaggio filtrante di prima è il colpo più difficile del centrocampista. Richiede visione anticipata, lettura del movimento del ricevente e tecnica di esecuzione precisa. Per gli Allievi va codificato come automatismo, non come situazione eccezionale. Variante: aggiungi un difensore al centro del rombo che cerca di intercettare il filtrante. Il passaggiatore valuta lo spazio libero prima di eseguire.',
  23, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('passaggio filtrante', 'rombo', 'prima', 'tecnica', 'visione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Passaggio filtrante di prima su linee oblique' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Dribbling con finta e conclusione in area di rigore',
  'Attaccante parte da 25m, riceve palla da un servitore laterale, conduce verso l''area con un difensore semi-attivo che segue a 2m. A 16m esegue una finta codificata (elastico, body feint o stepover doppio) e conclude in porta. Il difensore diventa attivo dopo la finta. 4 serie per tipo di finta, 6 ripetizioni a serie. Obiettivo: la finta funzionale in area è un fondamentale offensivo che distingue un attaccante capace da uno prevedibile. Per gli Allievi la finta individuale non si allena abbastanza: c''è troppa enfasi sulla tattica e poca sulla tecnica in velocità. Variante: aggiungi un secondo difensore che entra dalla linea laterale dopo 2 secondi dalla finta. L''attaccante legge entrambi e decide la conclusione più veloce.',
  25, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('dribbling', 'finta', 'conclusione', 'area di rigore', '1v1'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Dribbling con finta e conclusione in area di rigore' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Colpo di testa offensivo su cross da posizione avanzata',
  'Tre file: crossatori sul lato, attaccanti dalla metà campo, difensori in marcatura. Il cross arriva da posizione avanzata (non dal fondo) con traiettoria che curva verso il primo palo. L''attaccante legge la traiettoria e schiaccia verso il basso. Il difensore contrasta attivamente. 8 cross per lato, poi rotazione. Obiettivo: il colpo di testa su cross avanzato ha traiettoria diversa da quello su cross dal fondo. Gli Allievi spesso sanno colpire su cross dal fondo ma faticano su palloni tagliati dalla trequarti. Variante: il crossatore può servire sul secondo palo invece del primo. L''attaccante non sa in anticipo dove arriva: deve leggere la traiettoria e adattare il movimento di attacco.',
  28, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('colpo di testa', 'cross avanzato', 'attaccante', 'gioco aereo', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Colpo di testa offensivo su cross da posizione avanzata' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Conduzione con cambio di passo e stop orientato',
  '10 coni in un percorso misto (slalom più stop obbligatori su ogni terzo cono). Il giocatore conduce a ritmo variabile: veloce tra un cono e l''altro, stop con suola sul cono designato, poi accelerazione esplosiva verso il cono successivo. Progressione: aggiungi una finta su ogni stop (come se stessi andando a sinistra poi cambi a destra). 3 serie da 5 ripetizioni per piede. Obiettivo: la variazione di ritmo nella conduzione è il fondamentale che separa i conduttori efficaci da quelli prevedibili. La pausa prima dell''accelerazione è il momento in cui si mette in difficoltà il difensore. Variante: aggiungi un difensore reale che segue il conduttore. Non può intervenire ma deve restare a meno di 2m. Simula la pressione costante in conduzione tipica del livello Allievi.',
  22, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('conduzione', 'cambio di passo', 'stop orientato', 'variazione ritmo', 'tecnica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Conduzione con cambio di passo e stop orientato' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro di collo pieno dalla distanza su palla mossa',
  'Giocatore parte da 30m, riceve un passaggio di ritorno da un compagno a 22m e si ritrova in corsa verso porta. Tiro di collo pieno senza fermare la palla. 5 serie da 6 tiri, alternando lato destro e sinistro dello uno-due. Il portiere difende. Obiettivo: il tiro di collo pieno su palla in movimento è il fondamentale offensivo più efficace dalla distanza. Per gli Allievi va allenato in condizioni di corsa con palla mossa, non da fermi. Chi tira bene da 25-30m in movimento ha un''arma in più in gara. Variante: il passaggio di ritorno può arrivare basso o in aria. Se la palla è in quota, il giocatore colpisce al volo. Allena la reattività tecnica al tipo di palla che arriva.',
  25, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('tiro', 'collo pieno', 'distanza', 'palla mossa', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro di collo pieno dalla distanza su palla mossa' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Cross tecnico dal fondo e dalla trequarti a bersaglio',
  'Crossatori distribuiti sul lato: metà crossano dal fondo (linea di fondo), metà crossano dalla trequarti. Ogni crossatore esegue 5 cross per posizione verso bersagli fissi in area (coni che simulano primo palo, secondo palo, centro). Chi colpisce il bersaglio guadagna 1 punto. Obiettivo: la tecnica del cross deve essere allenata separatamente per posizione. Il cross dal fondo e il cross dalla trequarti hanno traiettorie e tecnica di esecuzione completamente diverse. Variante: il bersaglio viene comunicato dal mister mezzo secondo prima del cross. Il crossatore deve adattare la traiettoria all''ultimo momento. Simula la situazione di gara in cui si crossa verso dove si vedono gli attaccanti posizionarsi.',
  25, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('cross', 'trequarti', 'precisione', 'tecnica', 'bersaglio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Cross tecnico dal fondo e dalla trequarti a bersaglio' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Ricezione spalle alla porta e girata con difensore',
  'Fila di attaccanti a 22m dalla porta. Il difensore sta tra il servitore e la porta. Palla di prima tesa dal servitore. L''attaccante riceve di spalle con il difensore addosso, protegge per meno di 1 secondo e sceglie: girarsi e tirare, oppure scaricare laterale e rientrare in profondità. Il difensore contrasta da subito. 6 ripetizioni per lato poi rotazione. Obiettivo: la ricezione di spalle con difensore ravvicinato per gli Allievi deve essere automatizzata in condizioni di piena opposizione. Variante: il servitore può passare teso, alto o rasoterra senza comunicarlo. L''attaccante adatta il tipo di protezione alla traiettoria. La varietà del servizio simula la variabilità delle palle in gara.',
  25, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('ricezione di spalle', 'girata', 'difensore', 'attaccante', 'fondamentali'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Ricezione spalle alla porta e girata con difensore' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rimessa laterale con schema codificato per zona',
  'Squadra in posizione su metà campo. Rimessa laterale da tre zone diverse: difensiva, centrocampo, offensiva. Per ogni zona uno schema diverso: in zona difensiva la rimessa va al libero per costruire, in zona centrocampo si usa lo schema cortissimo (muro e cambio di fronte), in zona offensiva si attacca l''area. 5 ripetizioni per schema, poi libera scelta. Obiettivo: la rimessa laterale in gara è spesso eseguita senza schema. Per gli Allievi deve essere codificata in base alla zona del campo. Variante: il difensore avversario conosce lo schema standard e cerca di bloccarlo. Chi in attacco legge per primo la pressione difensiva e adatta lo schema guadagna 2 punti.',
  22, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('rimessa laterale', 'schema', 'zona', 'tecnica', 'palla inattiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rimessa laterale con schema codificato per zona' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Stop di petto e coscia con controllo orientato in serie',
  'Servitore con cesta a 12m. Lancia palle di diversa altezza: alta (testa), media (petto), bassa in volo (coscia). Il giocatore sceglie il segmento corporeo corretto, fa lo stop orientato verso una delle tre direzioni che indichi (destra, sinistra, avanti) e completa con un passaggio verso un bersaglio. 10 ripetizioni per tipo di palla. Obiettivo: lo stop con segmenti del corpo diversi dal piede è spesso trascurato. Per gli Allievi il controllo di petto e coscia deve essere affidabile in qualsiasi condizione. Variante: aggiungi un difensore che entra 1.5 secondi dopo il lancio. Il controllo deve essere orientato verso lo spazio libero. Allena la lettura della posizione difensiva prima del contatto con la palla.',
  22, 'tecnica_individuale', 'allievi',
  JSON_ARRAY('stop petto', 'stop coscia', 'controllo orientato', 'tecnica', 'fondamentali'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Stop di petto e coscia con controllo orientato in serie' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (10 sessioni · 30-45 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Fase di possesso in 4-3-3: principi e circolazione',
  'Campo intero, 10v10. La squadra in possesso lavora sulla circolazione del 4-3-3: il terzino riceve, il mediano basso si abbassa per dare linea, la mezzala opposta si allarga, il centravanti cerca la profondità. Prima senza opposizione (tu fermi il gioco e correggi), poi con pressing semi-attivo, poi opposizione reale. Obiettivo: i principi di circolazione del 4-3-3 non devono essere uno schema ma abitudini di movimento automatiche. Per gli Allievi questa è la sessione tattica fondamentale: chi capisce il 4-3-3 in possesso capisce il calcio moderno. Variante: aggiungi il portiere come costruttore aggiunto. Il possesso parte sempre dal portiere che distribuisce usando i corridoi del modulo.',
  40, 'tattica', 'allievi',
  JSON_ARRAY('4-3-3', 'possesso', 'circolazione', 'modulo', 'principi di gioco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Fase di possesso in 4-3-3: principi e circolazione' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Pressing ultra-offensivo: trigger, scalate e coperture',
  'Campo intero, 11v11. La squadra in pressing lavora su tre trigger codificati: retropassaggio al portiere, passaggio al terzino sotto pressione, rimessa laterale avversaria in zona alta. Al trigger la punta scatta sul portatore, la mezzala scala sul ricevente più vicino, il mediano copre il centro. Prima su campo dimezzato, poi campo intero. Obiettivo: il pressing ultra-offensivo coordinato su trigger è il sistema difensivo più redditizio. Chi recupera palla in zona offensiva avversaria ha già mezzo gol fatto. Variante: la squadra avversaria conosce i trigger e li evita. La squadra in pressing deve trovare nuovi trigger o modificare i tempi. Insegna l''adattamento tattico in tempo reale.',
  40, 'tattica', 'allievi',
  JSON_ARRAY('pressing', 'trigger', 'scalate', 'ultra-offensivo', 'tattica difensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Pressing ultra-offensivo: trigger, scalate e coperture' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Transizione difensiva: da perdita a blocco difensivo',
  'Campo intero, 11v11. La squadra perde palla su tuo fischio in diverse zone del campo. Deve organizzare la transizione difensiva: i 4 più vicini al pallone formano il primo blocco di pressing, la linea difensiva scala e si compatta, il portiere scala e comunica la linea. Prima lavori sulla transizione da zona offensiva (la più difficile), poi da centrocampo, poi da zona difensiva. Obiettivo: la transizione difensiva è il momento di maggiore vulnerabilità. Gli Allievi spesso restano paralizzati dopo la perdita di palla. Variante: aggiungi un timer di 4 secondi dal fischio. Se la squadra non si è compattata nel tempo, la squadra avversaria ottiene un punto libero.',
  35, 'tattica', 'allievi',
  JSON_ARRAY('transizione difensiva', 'blocco difensivo', 'pressing', 'organizzazione', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Transizione difensiva: da perdita a blocco difensivo' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Costruzione dal basso 4-2-3-1 con uscita dal pressing',
  'Metà campo difensivo, squadra in 4-2-3-1 contro pressing avversario 4-4-2 che pressa fino alla trequarti. Il portiere distribuisce ai due mediani bassi che devono trovare la via di uscita. I terzini si allargano, il trequartista abbassa per dare linea. Prima con pressing al 50%, poi al 100%. Obiettivo: il 4-2-3-1 in uscita palla è uno degli schemi più usati nel calcio moderno. I due mediani bassi devono sapere dove ricevere, quando girarsi e dove smistare. Per gli Allievi è il momento di capire che il centrocampo è il cervello della squadra. Variante: il portiere può lanciare direttamente sul trequartista che si abbassa. L''uscita diventa verticale. Allena la lettura del pressing avversario da parte del portiere.',
  38, 'tattica', 'allievi',
  JSON_ARRAY('4-2-3-1', 'costruzione dal basso', 'mediano basso', 'uscita pressing', 'modulo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Costruzione dal basso 4-2-3-1 con uscita dal pressing' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Difesa a zona e marcatura preventiva del trequartista',
  'Campo intero, 9v9. La squadra difende a zona 4-4-2. Obiettivo specifico: il centrocampista offensivo avversario non deve mai ricevere palla tra le linee senza essere seguito. Il mediano più vicino scala preventivamente prima che la palla arrivi. Prima senza palla (solo movimenti), poi con palla. Obiettivo: la marcatura preventiva del giocatore tra le linee è uno dei concetti più importanti della difesa a zona moderna. Un trequartista libero tra le linee è pericolosissimo. Variante: l''avversario mette due giocatori tra le linee (trequartista e mezzala). Il mediano deve scegliere quale marcare preventivamente. Allena la lettura della situazione difensiva e la comunicazione per assegnarsi le marcature.',
  35, 'tattica', 'allievi',
  JSON_ARRAY('difesa a zona', 'marcatura preventiva', 'trequartista', '4-4-2', 'tattica difensiva'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Difesa a zona e marcatura preventiva del trequartista' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Attacco alla profondità: tagli, sovrapposizioni e scambi',
  'Metà campo offensivo, 8 giocatori in 4-3-3. Tre situazioni codificate: situazione A — ala taglia dentro e terzino sovrappone, situazione B — centravanti scende incontro e mezzala taglia in profondità, situazione C — scambio ala-mezzala. 5 ripetizioni per situazione, poi libera scelta. Obiettivo: i movimenti offensivi coordinati tra ala, terzino e mezzala devono diventare automatici. Per gli Allievi non devono pensarci, devono farli. Variante: il difensore avversario conosce le situazioni e cerca di bloccarle. L''attaccante legge quale situazione usare in base alla pressione difensiva. Allena la lettura della difesa come input per la scelta del movimento offensivo.',
  38, 'tattica', 'allievi',
  JSON_ARRAY('taglio', 'sovrapposizione', 'ala', 'terzino', 'attacco'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Attacco alla profondità: tagli, sovrapposizioni e scambi' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Organizzazione difensiva su calci piazzati avversari',
  'Campo intero. Tre situazioni di palla inattiva avversaria: calcio d''angolo da destra, calcio d''angolo da sinistra, punizione frontale a 20m. Per ogni situazione la squadra si organizza in schema difensivo codificato (uomo, zona o misto). Prima lavori sul posizionamento da fermo, poi con il battitore che serve, poi con attaccanti che attaccano. Obiettivo: le palle inattive avversarie sono una delle fonti principali di gol subiti. Avere uno schema difensivo codificato riduce significativamente il rischio. Variante: cambia lo schema difensivo a ogni serie (prima marcatura a uomo, poi zona pura). I giocatori devono adattarsi allo schema chiamato prima del tiro.',
  35, 'tattica', 'allievi',
  JSON_ARRAY('calci piazzati', 'difesa', 'schema', 'palla inattiva', 'organizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Organizzazione difensiva su calci piazzati avversari' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Transizione offensiva rapida in 4v4 più portieri',
  'Campo 50x40m, 4v4 più portieri con 4 giocatori fuori campo per lato. Quando una squadra recupera palla, i 4 giocatori fuori entrano immediatamente e la squadra attacca 8v4. La difesa deve reggere per 10 secondi poi entrano anche i loro 4. Il passaggio da 4 a 8 deve avvenire entro 3 secondi dal recupero. Obiettivo: la transizione offensiva rapida con sovranumerosità è la situazione più produttiva in gara. Gli Allievi devono sfruttarla sistematicamente. Variante: la fase offensiva 8v4 deve arrivare a conclusione entro 8 secondi dal recupero. Se non ci arriva si ricomincia. Crea urgenza reale e insegna che la velocità della ripartenza è più importante della qualità del possesso.',
  35, 'tattica', 'allievi',
  JSON_ARRAY('transizione offensiva', 'sovranumerosità', 'velocità', 'ripartenza', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Transizione offensiva rapida in 4v4 più portieri' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Linea di pressione a centrocampo: il blocco medio',
  'Campo intero, 11v11. La squadra difende con blocco medio: linea di pressione sul centrocampo. Quando la palla supera la linea verso la propria trequarti, tutta la squadra scala di 10m e si ricompatta. Quando la palla torna al centrocampo avversario, la squadra si rialza alla linea di pressione. Prima con palla lenta, poi con palla veloce. Obiettivo: il blocco medio con linea di pressione mobile è uno dei sistemi difensivi più efficaci nel calcio giovanile avanzato. Per gli Allievi capire la linea di pressione significa capire il calcio moderno. Variante: cambia la posizione della linea di pressione ogni 10 minuti (alta, media, bassa). Allena i tre tipi di difesa in una sola sessione.',
  40, 'tattica', 'allievi',
  JSON_ARRAY('linea di pressione', 'blocco medio', 'difesa', 'organizzazione', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Linea di pressione a centrocampo: il blocco medio' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Fase di non possesso: difesa 4-4-2 bassa compatta',
  'Campo intero, 11v11. La squadra difende in 4-4-2 basso. Le due punte restano davanti alla linea difensiva. Le due linee da 4 devono mantenersi a meno di 12m di distanza tra loro. Prima lavori sulle distanze senza palla (squadra che si muove lateralmente su fischio), poi con palla. Obiettivo: la difesa 4-4-2 bassa richiede disciplina collettiva. Variante: aggiungi la regola per cui la squadra deve recuperare palla entro 20 secondi dall''inizio dell''azione avversaria. Se non ci riesce, concede un punto. Insegna che la difesa bassa non è resistere passivamente ma è un sistema per creare la situazione giusta per recuperare palla con efficacia.',
  38, 'tattica', 'allievi',
  JSON_ARRAY('4-4-2', 'difesa bassa', 'compattezza', 'non possesso', 'organizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Fase di non possesso: difesa 4-4-2 bassa compatta' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (prime 5 sessioni su 10 · 25-35 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 9v5 su campo intero con verticalizzazioni',
  'Campo intero, 9 in possesso contro 5 difensori. La squadra guadagna 1 punto ogni 8 passaggi consecutivi e 2 punti se la palla raggiunge la zona avanzata (ultimi 20m del campo). I 5 difensori guadagnano 1 punto se recuperano palla e raggiungono una delle due mini-porte laterali. Obiettivo: possesso finalizzato alla progressione. Ogni possesso deve tendere verso la zona avanzata, non girare fine a sé stesso. Per gli Allievi il possesso senza obiettivo non ha senso tattico. Variante: la verticalizzazione deve avvenire con un filtrante (non uno spiovente). Allena la tecnica del passaggio filtrante in un contesto di possesso ad alta densità e intensità.',
  30, 'possesso_palla', 'allievi',
  JSON_ARRAY('possesso', 'verticalizzazione', 'campo intero', '9v5', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 9v5 su campo intero con verticalizzazioni' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso posizionale 5v5 su griglia a 9 zone',
  'Campo 40x30m diviso in 9 zone (griglia 3x3). Regola: la squadra in possesso deve occupare almeno 4 zone diverse contemporaneamente. Se si compatta su meno di 4 zone, il possesso viene annullato. I difensori cercano di ridurre le zone occupate dagli avversari. Obiettivo: il gioco posizionale richiede occupazione equilibrata del campo. Per gli Allievi questa regola formalizza un concetto che si sente spesso ma non si pratica abbastanza in allenamento. Variante: aggiungi portieri laterali come jolly. La squadra in possesso ha un''uscita sicura sui lati. Ma i portieri jolly possono essere marcati. La scelta di usare il jolly o meno diventa una decisione tattica.',
  28, 'possesso_palla', 'allievi',
  JSON_ARRAY('gioco posizionale', 'zone', 'occupazione campo', 'possesso', 'tattica'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso posizionale 5v5 su griglia a 9 zone' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso con transizioni ad alta intensità 8v8',
  'Campo intero, 8v8. Ogni possesso termina quando la squadra tira in porta o perde palla. Quando si perde palla, la transizione deve essere immediata: i due più vicini pressano subito, gli altri si riorganizzano. Chi recupera palla ha 5 secondi per arrivare a tiro o si rigioca dal centro. Obiettivo: possesso finalizzato con transizioni rapide. Non è possesso difensivo: ogni possesso deve arrivare a tiro. Per gli Allievi il collegamento tra possesso e finalizzazione deve essere fluido. Variante: aggiungi la regola per cui il possesso deve durare almeno 4 passaggi prima di poter tirare. Obbliga a costruire l''azione invece di cercare subito il tiro.',
  30, 'possesso_palla', 'allievi',
  JSON_ARRAY('possesso', 'transizioni', '8v8', 'intensità', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso con transizioni ad alta intensità 8v8' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circolazione 4-3-3 a due tocchi con pressing reale',
  'Campo intero, 10 giocatori in 4-3-3. Circolano la palla con massimo 2 tocchi seguendo gli schemi di circolazione del modulo. Tu fermi il gioco quando le distanze si allargano o un giocatore si posiziona male. Progressione: aggiungi 3 pressatori, poi 5. Obiettivo: la circolazione nel modulo con la limitazione di tocchi crea automatismi di movimento preventivo. Gli Allievi che sanno dove andare prima di ricevere giocano molto meglio. Variante: ogni 5 passaggi uno deve essere obbligatoriamente filtrante verso un attaccante che taglia. Rompe la tendenza a girare la palla in orizzontale senza cercare la profondità. Il ritmo del possesso deve accelerare man mano che il pressing aumenta.',
  30, 'possesso_palla', 'allievi',
  JSON_ARRAY('4-3-3', 'circolazione', 'due tocchi', 'pressing', 'modulo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circolazione 4-3-3 a due tocchi con pressing reale' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 8v4 con recupero e riorganizzazione rapida',
  'Campo 45x35m, 8 in possesso contro 4. Quando i 4 recuperano palla, escono dallo spazio e raggiungono una delle due mini-porte laterali entro 5 secondi (2 punti). Gli 8 devono recuperare entro 5 secondi (1 punto). Regola aggiuntiva: chi perde palla deve essere il primo a riconquistarla (pressing individuale immediato). Obiettivo: il possesso in superiorità non è solo tecnica ma richiede la mentalità di recovery immediato. Per gli Allievi la transizione da possessori a difensori deve avvenire in meno di 1 secondo mentale. Variante: riduci il campo a 30x25m. Il pressing dei 4 diventa molto più efficace. Allena la capacità tecnica sotto pressione estrema in spazio ristretto.',
  30, 'possesso_palla', 'allievi',
  JSON_ARRAY('possesso', 'recupero palla', '8v4', 'transizione', 'pressing individuale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 8v4 con recupero e riorganizzazione rapida' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

-- ════════════════════════════════════════════════════════════════════════════
-- STEP A COMPLETATO — 35 INSERT (riscaldamento 10, tecnica_individuale 10,
-- tattica 10, possesso_palla 5). STEP B da appendere separatamente.
-- ════════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (5 sessioni restanti · 25-35 min) [Step B]
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 7v7+2 jolly su campo ridotto con superiorità',
  'Campo 40x30m, 7v7 con 2 jolly sempre con chi ha il pallone (superiorità 9v7 in possesso). Il team in possesso deve fare almeno 6 passaggi consecutivi poi puo segnare in una delle due porte piccole. I jolly si spostano sempre nel campo del team in possesso. Cambio ogni 8 minuti di chi fa i jolly. Obiettivo: giocare in superiorità numerica crea abitudini di circolazione. Gli Allievi imparano che il possesso è gestione degli spazi e delle superiorità numeriche locali, non solo tenere la palla. Variante: i jolly giocano a un tocco. Obliga chi costruisce a passare in velocita e chi riceve ad avere il piede già pronto prima del contatto.',
  30, 'possesso_palla', 'allievi',
  JSON_ARRAY('jolly', 'superiorità numerica', 'possesso', 'campo ridotto', 'circolazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 7v7+2 jolly su campo ridotto con superiorità' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rondò 8v3 con verticalizzazioni obbligatorie',
  'Quadrato 15x15m. Rondò 8v3 classico ma con regola aggiuntiva: ogni 5 passaggi orizzontali, il team in possesso deve cercare una verticalizzazione verso il compagno nel mezzo del quadrato. Se la verticalizzazione viene intercettata dai 3, il team in possesso va in mezzo. Obiettivo: il rondò puro insegna a tenere la palla ma non allena la verticalizzazione decisionale. Per gli Allievi è fondamentale che il possesso abbia sempre uno scopo offensivo. Variante: la verticalizzazione deve passare tra le gambe di uno dei 3 difensori per valere doppio. Allena la qualita tecnica del passaggio filtrante.',
  25, 'possesso_palla', 'allievi',
  JSON_ARRAY('rondò', 'verticalizzazione', 'possesso', 'decisione', 'passaggio filtrante'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rondò 8v3 con verticalizzazioni obbligatorie' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso in blocco medio sotto pressing avversario',
  'Campo intero diviso in 3 fasce orizzontali. La squadra in possesso organizza il proprio blocco nella fascia centrale (linea mediana ±15m). La squadra avversaria pressa con 6-7 giocatori. Chi è in possesso deve mantenere la palla per 30 secondi consecutivi senza uscire dal blocco centrale, poi puo cercare la verticalizzazione verso la fascia offensiva. Obiettivo: il mantenimento del possesso nel blocco medio è una scelta tattica precisa: si rinuncia alla profondità immediata per ristrutturare e aspettare il momento giusto per attaccare. Per gli Allievi questa pazienza tattica è un salto di qualita mentale. Variante: ogni verticalizzazione riuscita vale 1 punto. Chi accumula 3 punti in 10 minuti vince il set.',
  30, 'possesso_palla', 'allievi',
  JSON_ARRAY('blocco medio', 'pressing', 'possesso', 'pazienza tattica', 'verticalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso in blocco medio sotto pressing avversario' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso con cambio di fronte su griglia a tre corsie',
  'Campo 50x35m diviso in 3 corsie verticali. Il team in possesso (9 giocatori) puo stare in una corsia alla volta finché un passaggio trasversale non sposta il possesso nell''altra corsia. Il cambio di fronte obbligatorio ogni 3 passaggi allarga il gioco e crea superiorità. Il team difensivo (6 giocatori) deve scalare velocemente. Obiettivo: il cambio di fronte è il meccanismo principale per spostare la difesa avversaria e creare spazio. Gli Allievi devono imparare che non si attacca dove la difesa è compatta ma dove si è creato spazio. Variante: il passaggio di cambio di fronte deve avvenire con un tocco. Allena la tecnica del passaggio lungo e preciso.',
  28, 'possesso_palla', 'allievi',
  JSON_ARRAY('cambio di fronte', 'corsie', 'possesso', 'ampiezza', 'circolazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso con cambio di fronte su griglia a tre corsie' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Possesso 10v6 con costruzione dal portiere obbligata',
  'Campo intero, 10 in possesso contro 6 in pressing. I 10 devono sempre iniziare l''azione dal portiere (costruzione dal basso obbligata). Il portiere distribuisce ai difensori che costruiscono usando i principi del modulo. I 6 in pressing entrano solo dopo che il portiere ha giocato la prima palla. Se recuperano palla vanno in porta. Obiettivo: la costruzione dal basso sotto pressing è il fondamentale del calcio moderno che separa le squadre di qualita. Per gli Allievi è il test della fiducia tecnica nei fondamentali. Variante: dopo 5 passaggi di costruzione, il mister decide con la voce se la squadra puo verticalizzare o deve continuare a costruire. Allena l''esecuzione di ordini tattici in corso di gioco.',
  32, 'possesso_palla', 'allievi',
  JSON_ARRAY('costruzione dal basso', 'portiere', 'possesso', 'pressing', 'modulo'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Possesso 10v6 con costruzione dal portiere obbligata' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: finalizzazione (10 sessioni · 25-35 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finalizzazione su cross basso dal fondo con difensore',
  'Crossatore dalla linea di fondo, conduce e crossa basso sul primo o secondo palo. Un attaccante e un difensore si contendono la palla in area. L''attaccante deve arrivare al cross prima del difensore o girare di prima. 8 ripetizioni per crossatore, poi rotazione. Portiere in porta. Obiettivo: il cross basso rasoterra è il piu difficile da difendere perché il portiere non puo uscire. Gli Allievi in attacco devono imparare ad anticipare la traiettoria del cross basso e inserirsi in corsa davanti al difensore. Variante: il crossatore non comunica se andrà sul primo o secondo palo. L''attaccante deve leggere la traiettoria del cross durante la corsa e adattare l''inserimento.',
  30, 'finalizzazione', 'allievi',
  JSON_ARRAY('cross basso', 'inserimento', 'finalizzazione', 'difensore', 'attaccante'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finalizzazione su cross basso dal fondo con difensore' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Combinazione con sovrapposizione terzino e tiro in area',
  'Schema a tre: terzino-mezzala-attaccante. Il terzino parte palla al piede, passa alla mezzala, si sovrappone in corsia. La mezzala tiene, poi serve il terzino in sovrapposizione. Il terzino entra in area e crossa o tira. L''attaccante attacca l''area. Schema fisso per 10 minuti poi con opposizione semi-attiva. Portiere in porta. Obiettivo: la sovrapposizione è il meccanismo che crea superiorità numerica sulla fascia. Per gli Allievi capire quando e come usarla è un''abitudine tattica che trasforma il gioco sulla fascia. Variante: la mezzala puo scegliere di non servire la sovrapposizione ma di tirare direttamente dal limite. Il terzino deve leggere se il passaggio arriva o no e decidere se continuare o rientrare.',
  30, 'finalizzazione', 'allievi',
  JSON_ARRAY('sovrapposizione', 'terzino', 'combinazione', 'finalizzazione', 'fascia'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Combinazione con sovrapposizione terzino e tiro in area' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro di prima intenzione su palla tagliata in area',
  'Servitore laterale taglia la palla bassa in area verso il centro. L''attaccante arriva da profondità in corsia centrale, colpisce di prima intenzione senza stop. 6 serie da 5 tiri. Portiere in porta. Variazione: palla tagliata dal lato opposto per cambiare l''angolo di arrivo. Obiettivo: il tiro di prima su palla tagliata è tecnicamente difficile perché la palla viene verso il corpo. Gli Allievi devono imparare a leggere la traiettoria tagliata e posizionare il corpo già nella corsa prima del contatto. Variante: aggiungi un difensore che entra 2 secondi dopo il taglio. L''attaccante decide se tirare subito o proteggere e attendere il supporto.',
  25, 'finalizzazione', 'allievi',
  JSON_ARRAY('tiro di prima', 'palla tagliata', 'finalizzazione', 'tecnica di tiro', 'corsa'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro di prima intenzione su palla tagliata in area' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Finalizzazione in superiorità numerica 3v2',
  'Azione parte da centrocampo: 3 attaccanti contro 2 difensori su campo intero. I 3 devono concludere in porta. I difensori scalano ma non foulano. Se recuperano palla ripartono in 2v1 verso la porta opposta. 3 serie da 6 azioni per gruppo. Portiere in porta. Obiettivo: il 3v2 allena la decisione offensiva in superiorità numerica. Per gli Allievi il principio chiave è: chi ha la palla in area tira, chi è senza palla occupa i corridoi liberi senza sovrapporsi al tiratore. Variante: uno dei 3 attaccanti viene neutralizzato dal mister dopo l''avvio. I 2 restanti devono concludere l''azione in 2v2 adattando il piano originale.',
  28, 'finalizzazione', 'allievi',
  JSON_ARRAY('3v2', 'superiorità numerica', 'decisione', 'finalizzazione', 'transizione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Finalizzazione in superiorità numerica 3v2' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sponda e tiro: combinazione attaccante fisso e tiratore',
  'Due attaccanti: uno fa da sponda, l''altro tira. Palla dal servitore a centrocampo. L''attaccante sponda riceve di spalle, protegge e scarica nello spazio. L''attaccante tiratore corre in profondità, riceve e conclude. Portiere in porta. 6 ripetizioni poi si scambiano i ruoli. Obiettivo: la combinazione sponda-tiro è il meccanismo di sblocco quando la difesa è compatta. L''attaccante sponda deve proteggere abbastanza a lungo da permettere al tiratore di entrare nella posizione ottimale. Variante: aggiungi un difensore centrale. La sponda deve calcolare se il tiratore ha lo spazio per ricevere o se è meglio girarsi direttamente verso la porta.',
  28, 'finalizzazione', 'allievi',
  JSON_ARRAY('sponda', 'combinazione', 'attaccante', 'finalizzazione', 'profondità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sponda e tiro: combinazione attaccante fisso e tiratore' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uno contro uno in area con portiere in uscita',
  'Pallone servito da centrocampo verso un attaccante in area. Il portiere esce 1v1. L''attaccante deve scartare il portiere o superarlo con un tocco morbido. 8 ripetizioni per attaccante. Progressione: la palla parte più lontana, il portiere ha più tempo per scalare la posizione. Obiettivo: l''uno contro uno con il portiere in uscita è uno scenario che mette in difficoltà gli attaccanti giovani. Per gli Allievi il principio è: leggi la posizione del portiere prima di ricevere, decidi cosa fare nella corsa e non cambiare idea durante l''esecuzione. Variante: il portiere puo scegliere di non uscire e restare in porta. L''attaccante deve riconoscere la scelta del portiere e adattare la conclusione di conseguenza.',
  25, 'finalizzazione', 'allievi',
  JSON_ARRAY('1v1', 'portiere in uscita', 'attaccante', 'finalizzazione', 'decisione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uno contro uno in area con portiere in uscita' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Tiro da fuori area su combinazione rapida a tre',
  'Tre giocatori a semicerchio a 22-25m dalla porta. Passaggi veloci tra loro (uno-due), al terzo passaggio chi è in condizione tira di collo pieno. Portiere in porta. 10 minuti di schema fisso, poi partitella 6v6 con obbligo di tiro entro 8 secondi dall''ingresso in zona offensiva. Obiettivo: il tiro da fuori area è un''arma tattica che sposta la difesa e crea angoli di conclusione inattesi. Gli Allievi devono sentire il momento del tiro nella combinazione come naturale e non come ultima opzione. Variante: uno dei tre ha il compito di intercettare il tiro. Chi subisce il tiro intercettato va a difendere al posto del portiere.',
  25, 'finalizzazione', 'allievi',
  JSON_ARRAY('tiro da fuori', 'combinazione', 'collo pieno', 'finalizzazione', 'decisione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Tiro da fuori area su combinazione rapida a tre' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Calcio d''angolo offensivo con schemi codificati',
  'Lavoro specifico sui calci d''angolo offensivi. Schema 1: cross corto con rientro a cercare il secondo palo. Schema 2: traversone teso sul primo palo con attaccante che anticipa. Schema 3: corner corto con rimessa per tiro dal limite. 5 ripetizioni per schema. Difesa di 4 e portiere in porta. Obiettivo: i calci d''angolo rappresentano circa il 15% dei gol nel calcio moderno. Per gli Allievi ogni calcio d''angolo deve avere uno schema codificato riconoscibile da tutti. Variante: la difesa conosce gli schemi in anticipo. Chi attacca deve modificare lo schema sul momento usando segnali gestuali tra compagni.',
  28, 'finalizzazione', 'allievi',
  JSON_ARRAY('calcio d''angolo', 'schema', 'palla inattiva', 'finalizzazione', 'gol'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Calcio d''angolo offensivo con schemi codificati' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Dribbling in area con conclusione angolata sul palo lontano',
  'Attaccante parte da posizione laterale con difensore alle spalle a 3m. Conduce in area, dribbling con finta di corpo, conclusione angolata verso il palo lontano. Il difensore entra in pressing dopo 2 secondi. 6 ripetizioni per lato alternando piede dominante e non. Portiere in porta. Obiettivo: il dribbling in area con conclusione angolata è il gesto tecnico che distingue gli attaccanti di livello. La finta deve portare il difensore verso il lato sbagliato prima della conclusione. Variante: il difensore entra subito senza ritardo. L''attaccante deve aumentare la velocita del dribbling e ridurre i tempi di preparazione del tiro simulando pressione reale.',
  25, 'finalizzazione', 'allievi',
  JSON_ARRAY('dribbling in area', 'finta', 'conclusione angolata', 'palo lontano', 'attaccante'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Dribbling in area con conclusione angolata sul palo lontano' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Inserimento al secondo palo su cross in corsa',
  'Crossatore sulla fascia. Il cross viene messo sul secondo palo. Un attaccante inserisce in corsa dal secondo palo, l''altro occupa il primo palo come disturbatore del difensore. Portiere in porta. Il timing dell''inserimento è la chiave: parte quando il crossatore alza la testa. 6 serie da 4 cross per lato. Obiettivo: l''inserimento al secondo palo è l''azione su cross che produce piu gol nel calcio moderno. Per gli Allievi il timing dell''inserimento si allena solo con molte ripetizioni sistematiche. Variante: il mister dice al crossatore se crossare sul primo o secondo palo solo al momento dell''esecuzione. Chi attacca deve leggere la direzione del cross durante la corsa.',
  30, 'finalizzazione', 'allievi',
  JSON_ARRAY('secondo palo', 'inserimento', 'cross', 'timing', 'finalizzazione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Inserimento al secondo palo su cross in corsa' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: atletica_fisico (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Sprint ripetuti con variazione di distanza e direzione',
  'Serie di sprint su distanze variabili: 10m, 20m, 30m con cambio di direzione al 50% del percorso (cono intermedio). 6 serie da 4 sprint con 30 secondi di recupero attivo (camminata). Intensita massimale su ogni sprint. Obiettivo: la variazione di distanza nei sprint impedisce al corpo di adattarsi a un solo schema motorio. Per gli Allievi la capacita di accelerare e decelerare rapidamente è spesso piu importante della velocita massimale nel calcio. Variante: aggiungi un compagno che parte 0.5 secondi prima. Raggiungerlo diventa lo stimolo competitivo che aumenta l''intensita senza bisogno di cronometro.',
  25, 'atletica_fisico', 'allievi',
  JSON_ARRAY('sprint', 'velocità', 'cambio direzione', 'accelerazione', 'intensità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Sprint ripetuti con variazione di distanza e direzione' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Potenza aerobica: interval training 1:1 con palla',
  'Campo intero. 30 secondi di lavoro ad alta intensita (8v8 in zona ridotta) alternati a 30 secondi di recupero attivo (palleggi in piccoli gruppi). 8 cicli. Nella fase ad alta intensita la palla è sempre in gioco con pressing reale. Obiettivo: la potenza aerobica si allena meglio con stimoli di durata media ad alta intensita. Il formato con palla aumenta la motivazione e rende il lavoro specifico al calcio. Per gli Allievi l''interval training con palla è superiore al lavoro atletico senza pallone perché mantiene il focus tecnico-tattico anche sotto stress fisico. Variante: nella fase ad alta intensita una squadra pressa sempre alta. Cambia la squadra che pressa ogni due cicli.',
  30, 'atletica_fisico', 'allievi',
  JSON_ARRAY('interval training', 'potenza aerobica', 'intensità', 'pressing', 'palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Potenza aerobica: interval training 1:1 con palla' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Circuito coordinazione-velocità con scala agility',
  'Stazione 1: scala agility (4 varianti: fronte, laterale, skip, cross). Stazione 2: salti su ostacoli bassi alternati a sprint di 10m. Stazione 3: cerchi a terra per coordinazione e cambio di direzione rapido. 3 giri del circuito con 45 secondi per stazione. Pausa 2 minuti tra i giri. Obiettivo: la coordinazione neuro-motoria per gli Allievi è ancora in fase di sviluppo. Il lavoro su scala agility e cerchi migliora la rapidita dei piedi che si trasferisce direttamente nella tecnica di dribbling e nei cambi di direzione in corsa. Variante: esecuzione in coppia in competizione sulla velocita. Chi finisce prima la stazione parte in anticipo sullo sprint finale di 10m.',
  25, 'atletica_fisico', 'allievi',
  JSON_ARRAY('scala agility', 'coordinazione', 'velocità', 'circuito', 'agilità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Circuito coordinazione-velocità con scala agility' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Duello fisico 1v1 con contrasto e recupero della palla',
  'Corridoio stretto 5x15m. Due giocatori con spalle alla linea di partenza. Segnale del mister: si girano e uno dei due ha la palla. Chi ce l''ha cerca di avanzare verso una linea a 15m, l''altro deve recuperarla. 3 serie da 6 duelli. Alternare il ruolo attaccante-difensore. Obiettivo: il duello fisico diretto allena la mentalita competitiva e la capacita di reggere il contrasto con correttezza tecnica. Per gli Allievi che si avvicinano al calcio senior questo tipo di lavoro fisico diretto è fondamentale. Variante: aggiungi una porta piccola a ciascun lato. Chi recupera la palla deve attaccare la porta opposta. Trasforma il duello fisico in una transizione reale.',
  30, 'atletica_fisico', 'allievi',
  JSON_ARRAY('duello fisico', 'contrasto', '1v1', 'recupero palla', 'forza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Duello fisico 1v1 con contrasto e recupero della palla' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Forza esplosiva: salti monopiede e sprint abbinati',
  'Sequenza per ciascun giocatore: 5 salti monopiede (alternare il piede), poi sprint immediato di 10m. Pausa 40 secondi. 6 serie. Progressione: sostituisci i salti monopiede con squat jump esplosivo. Obiettivo: la forza esplosiva degli arti inferiori è direttamente correlata alla velocita di accelerazione nei primi 5-10 metri. Per gli Allievi l''abbinamento salto-sprint allena la sequenza neuromuscolare dell''accelerazione breve che serve nei contrasti e negli inserimenti in area. Variante: aggiungi un pallone prima dei 5 salti. Il giocatore deve palleggiare 10 volte senza farlo cadere. Il pallone introduce attenzione divisa durante il lavoro esplosivo.',
  28, 'atletica_fisico', 'allievi',
  JSON_ARRAY('forza esplosiva', 'salti', 'sprint', 'accelerazione', 'potenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Forza esplosiva: salti monopiede e sprint abbinati' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Agilità reattiva con palla su stimolo visivo del mister',
  'Giocatore con palla ai piedi in uno spazio 8x8m. Il mister usa cartelli colorati: rosso = cambio di direzione a sinistra, giallo = cambio a destra, verde = accelerazione in avanti. Il giocatore reagisce al cartello mentre conduce. 3 serie da 90 secondi con 30 secondi di pausa. Obiettivo: l''agilita reattiva a stimolo visivo è diversa dall''agilita pianificata su percorso predefinito. In gara il calcio è sempre reattivo. Per gli Allievi la combinazione tra controllo della palla e reazione rapida a stimolo esterno migliora la coordinazione tecnico-atletica. Variante: aggiungi un difensore che segue il conduttore a meno di 2m senza toccare la palla. La pressione aumenta la difficolta della risposta al segnale.',
  25, 'atletica_fisico', 'allievi',
  JSON_ARRAY('agilità reattiva', 'stimolo visivo', 'conduzione', 'coordinazione', 'velocità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Agilità reattiva con palla su stimolo visivo del mister' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Core e stabilizzazione: circuito funzionale a corpo libero',
  'Circuito 6 stazioni, 40 secondi lavoro e 20 secondi pausa per stazione. Stazioni: plank frontale, plank laterale destro, plank laterale sinistro, superman prono, bridge con sollevamento alternato delle gambe, rotazione del tronco in posizione seduta. 2 giri completi. Obiettivo: la stabilita del core è la base di ogni gesto tecnico nel calcio. Tiro, controllo, contrasto fisico dipendono dalla stabilita lombare e addominale. Per gli Allievi è un lavoro spesso trascurato ma che riduce gli infortuni alla schiena e migliora la tecnica di tiro. Variante: esegui il plank frontale con una mano che tocca alternativamente la spalla opposta. L''asimmetria del movimento aumenta la richiesta di stabilita dinamica.',
  20, 'atletica_fisico', 'allievi',
  JSON_ARRAY('core', 'stabilizzazione', 'plank', 'forza funzionale', 'prevenzione infortuni'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Core e stabilizzazione: circuito funzionale a corpo libero' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Resistenza lattacida: 5v5 con pressing obbligato dopo perdita',
  'Campo 30x25m, 5v5. Regola: chi perde palla deve fare pressing immediato con tutti e 5 i giocatori. Se recupera palla entro 5 secondi guadagna 1 punto bonus. Partite da 4 minuti con 2 minuti di recupero. 5 partite totali. Obiettivo: il lavoro lattacido si allena meglio con formati competitivi reali. Il pressing immediato dopo la perdita palla è la forma atletica piu intensa nel calcio moderno e richiede forza, velocita e resistenza specifica combinati. Variante: chi non va in pressing entro 2 secondi dalla perdita palla fa 3 flessioni a bordo campo e poi rientra. Allena la risposta automatica e immediata alla perdita del possesso.',
  30, 'atletica_fisico', 'allievi',
  JSON_ARRAY('resistenza lattacida', 'pressing', 'intensità', '5v5', 'recupero palla'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Resistenza lattacida: 5v5 con pressing obbligato dopo perdita' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Reazione a segnale: sprint su stimolo acustico variato',
  'Tre file di giocatori a centrocampo. Segnale 1 (fischio singolo): sprint verso porta destra. Segnale 2 (doppio fischio): sprint verso porta sinistra. Segnale 3 (pausa di 3 secondi poi fischio): partenza in ritardo per gestire l''attesa. 4 serie da 8 sprint per tipo di segnale. Obiettivo: il tempo di reazione è un''abilita allenabile. Per gli Allievi distinguere tra segnale acustico semplice e doppio migliora la discriminazione sensoriale che si applica in gara nel leggere i comandi vocali dei compagni e i segnali arbitrali. Variante: segnali mescolati in modo casuale. Chi parte nella direzione sbagliata torna alla partenza senza contare la ripetizione.',
  20, 'atletica_fisico', 'allievi',
  JSON_ARRAY('reazione', 'stimolo acustico', 'sprint', 'tempo di reazione', 'velocità'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Reazione a segnale: sprint su stimolo acustico variato' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Riscaldamento atletico progressivo con palla',
  '5 minuti di palleggi liberi in coppia a distanza crescente (5m poi 10m poi 15m). Poi 5 minuti di uno-due con corsa: ogni uno-due obbliga il ricevente a scattare di 10m dopo il passaggio. Poi 5 minuti di possesso 4v1 con spostamento del rondò ogni 60 secondi. Chiusura con 5 sprint di attivazione a ritmo crescente. Obiettivo: il riscaldamento con palla mantiene il focus tecnico anche nelle fasi di preparazione fisica. Per gli Allievi il warm-up senza palla è demotivante. Questo formato rispetta la specificita atletica del calcio. Variante: nella fase degli uno-due lo scatto è verso un cono a 15m. Il giocatore controlla la palla al cono e torna al trotterello. Aggiunge tecnica al lavoro aerobico.',
  22, 'atletica_fisico', 'allievi',
  JSON_ARRAY('riscaldamento', 'attivazione', 'palla', 'progressivo', 'specifico calcio'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Riscaldamento atletico progressivo con palla' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: portieri (10 sessioni · 30-45 min)
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscite alte su cross con attaccante in pressione',
  'Portiere in porta. Crossatore sulla fascia, un attaccante in area contestato da un difensore. Il cross arriva alto. Il portiere decide se uscire e prendere il cross (chiamando la palla ad alta voce) oppure restare sulla linea. 8 serie da 5 cross per lato. Obiettivo: la decisione sull''uscita alta è il momento di maggior rischio per un portiere. Per i portieri Allievi il principio è: se posso prendere la palla con due mani a braccia tese esco, altrimenti resto. La voce durante l''uscita è obbligatoria per comunicare ai difensori. Variante: il difensore puo ostacolare attivamente il portiere in uscita occupando spazio. Il portiere deve trovare il momento giusto prima che il difensore si posizioni.',
  35, 'portieri', 'allievi',
  JSON_ARRAY('uscita alta', 'cross', 'portiere', 'decisione', 'voce'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscite alte su cross con attaccante in pressione' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate in tuffo su tiri angolati a media distanza',
  'Tiratore a 18-20m in posizione angolata. Tiro forte angolato sul palo vicino e lontano alternati. Il portiere parte dalla posizione di base a 1-2m avanti dalla linea. 10 tiri per lato poi 10 tiri centrali. Intensita progressiva. Obiettivo: le parate in tuffo su tiri angolati richiedono la corretta lettura dell''angolazione prima del tiro. Il portiere deve iniziare lo spostamento laterale al momento del backswing del tiratore, non dopo che la palla è partita. Variante: il tiratore fa una finta prima del tiro reale. Il portiere deve non reagire alle finte mantenendo la posizione di base fino al contatto effettivo con la palla.',
  30, 'portieri', 'allievi',
  JSON_ARRAY('parata in tuffo', 'tiro angolato', 'posizionamento', 'portiere', 'riflessi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate in tuffo su tiri angolati a media distanza' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Costruzione dal basso con i piedi: schema corto e lungo',
  'Portiere con palla ai piedi. Schema corto: portiere-difensore-terzino. Schema lungo: portiere rilancia lungo sul terzino opposto o sulla punta. 15 minuti senza avversari, poi 15 minuti con 2 avversari in pressing. Il portiere sceglie lo schema in base alla posizione del pressing. Obiettivo: il portiere moderno è il costruttore principale. Per i portieri Allievi la distribuzione con i piedi deve essere allenata tanto quanto la parata. La decisione tra schema corto e lungo dipende dalla lettura del pressing avversario prima di ricevere la palla. Variante: se il pressing è attivo sulla difesa, obbligo di rilancio lungo. Il portiere deve leggere la posizione del pressing in anticipo.',
  30, 'portieri', 'allievi',
  JSON_ARRAY('costruzione dal basso', 'piedi', 'portiere', 'distribuzione', 'pressing'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Costruzione dal basso con i piedi: schema corto e lungo' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Reattività su doppia parata ravvicinata consecutiva',
  'Due tiratori a 8-10m dalla porta con angoli diversi. Primo tiro, il portiere para. Seconda palla immediatamente dal secondo tiratore entro 1 secondo. Il portiere deve rialzarsi o riorientarsi per la seconda parata. 6 serie da 5 doppi tiri. Obiettivo: la doppia parata allena la reattivita immediata dopo una para. Spesso il gol non arriva al primo tiro ma al secondo su rimbalzo. Per i portieri Allievi questo lavoro migliora il recupero posizionale rapido e la mentalita di reazione istantanea. Variante: il secondo tiro arriva dalla stessa posizione ma con forza imprevedibile (rasoterra o in aria). Il portiere non sa se aspettarsi un tiro basso o un pallonetto.',
  25, 'portieri', 'allievi',
  JSON_ARRAY('doppia parata', 'reattività', 'riflessi', 'portiere', 'recupero posizionale'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Reattività su doppia parata ravvicinata consecutiva' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Posizionamento e angolazione: scalatura sulla linea di porta',
  'Mister posizionato con coni in varie zone offensive: centro area, laterale, fuori area. Il portiere deve spostarsi per coprire l''angolo corretto e chiudere lo spazio. Prima solo posizionamento senza tiro. Il mister valuta la copertura degli angoli. Poi aggiunge tiri a sorpresa dalla posizione mostrata. Obiettivo: il posizionamento corretto riduce l''area di porta esposta al tiro del 40-50%. Per i portieri Allievi la scalatura sulla linea deve diventare un automatismo in funzione della posizione della palla, non una risposta al tiro già partito. Variante: posiziona due potenziali tiratori simultaneamente. Il portiere trova la posizione di compromesso che copre al meglio entrambi gli angoli.',
  25, 'portieri', 'allievi',
  JSON_ARRAY('posizionamento', 'angolazione', 'scalatura', 'portiere', 'copertura angoli'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Posizionamento e angolazione: scalatura sulla linea di porta' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Uscita bassa 1v1 con attaccante lanciato in profondità',
  'Pallone lanciato in profondità verso un attaccante che parte da centrocampo. Il portiere deve uscire sul corridoio di palla per ridurre l''angolo. Tecnica: corpo basso, braccia aperte, aspettare la scelta dell''attaccante prima di buttarsi. 8 serie per portiere. Obiettivo: l''uscita bassa 1v1 è la situazione piu frequente dopo un errore difensivo. Per i portieri Allievi il principio è: uscire veloce per ridurre l''angolo, fermarsi a 3m dall''attaccante, attendere la conclusione. Non buttarsi mai prima della scelta dell''attaccante. Variante: l''attaccante puo scaricare lateralmente verso un secondo attaccante. Il portiere deve rientrare in porta rapidamente. Allena il recupero posizionale dopo l''uscita.',
  30, 'portieri', 'allievi',
  JSON_ARRAY('uscita bassa', '1v1', 'portiere', 'profondità', 'tecnica portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Uscita bassa 1v1 con attaccante lanciato in profondità' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Rilancio con mano e piede: precisione su bersagli in campo',
  'Quattro bersagli distribuiti sul campo: 2 in zona di centrocampo (terzini), 2 in zona offensiva (punte). Il portiere alterna: rimessa dal basso con la mano, lancio con parabola, calcio di rinvio di collo pieno, calcio di rinvio di collo esterno. 5 ripetizioni per bersaglio per tipo di rilancio. Obiettivo: la precisione del rilancio trasforma il portiere in un''arma offensiva. Per i portieri Allievi il rilancio corto preciso verso il terzino vale quanto una parata difficile perché mantiene il possesso. Variante: il bersaglio (compagno) si muove nei 3 secondi prima del rilancio. Il portiere deve lanciare dove il compagno arriverà, non dove si trova al momento del lancio.',
  25, 'portieri', 'allievi',
  JSON_ARRAY('rilancio', 'precisione', 'distribuzione', 'portiere', 'piedi'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Rilancio con mano e piede: precisione su bersagli in campo' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Gioco aereo: uscita con presa e pugno su cross alto',
  'Crossatore alterna cross alti al centro dell''area. Il portiere lavora su due risposte: uscita con presa a due mani (quando il cross è nella sua zona di competenza), pugno di rimessa (quando è troppo vicino agli attaccanti). Un attaccante ostacola legalmente. Il portiere comunica la scelta con la voce prima di eseguire. 10 serie da 4 cross per lato. Obiettivo: la gestione del gioco aereo divide i portieri di livello alto da quelli medi. La decisione presa-pugno deve essere automatica in base alla traiettoria del cross e alla posizione degli attaccanti. Variante: il mister varia silenziosamente la traiettoria del cross (alto o piatto). Il portiere deve leggere il gesto tecnico del crossatore prima che la palla parta.',
  30, 'portieri', 'allievi',
  JSON_ARRAY('gioco aereo', 'cross alto', 'presa', 'pugno', 'portiere'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Gioco aereo: uscita con presa e pugno su cross alto' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Portiere come costruttore nella difesa a 4',
  'Partitella 9v9 su campo intero con regola aggiuntiva: il portiere deve essere coinvolto in almeno 3 azioni di costruzione ogni 2 minuti. Se non lo coinvolgono, i difensori fanno 2 giri del campo al trotto. Il portiere lavora su: apertura laterale ai terzini, appoggio corto al centrale, uscita fuori area per ricevere di piede sotto pressing. Obiettivo: il portiere come costruttore non è un ruolo accessorio. Per i portieri Allievi che ambiscono al calcio senior integrare il portiere nella costruzione è un passaggio obbligato. Variante: al segnale del mister la squadra avversaria va in pressing alto sul portiere. Il portiere sceglie tra costruire corto (rischio alto) o rilancio lungo (sicuro ma perde possesso).',
  35, 'portieri', 'allievi',
  JSON_ARRAY('costruttore', 'portiere', 'difesa a 4', 'pressing alto', 'distribuzione'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Portiere come costruttore nella difesa a 4' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);

INSERT INTO sessioni_libreria (id, mister_id, societa_id, titolo, descrizione, durata_minuti, categoria, eta_leva, tag, visibilita, ufficiale_myvivaio, origine_ai, usata_count)
SELECT UUID(), NULL, NULL,
  'Parate in serie da posizioni diverse con quarto tiro a sorpresa',
  'Tre tiratori in posizione fissa: centro area (10m), angolo destro area (14m), angolo sinistro area (14m). Tiro in sequenza rapida: centro poi angolo destro entro 3 secondi poi angolo sinistro entro 3 secondi. 4 serie da 3 tiri consecutivi. Pausa 90 secondi tra serie. Obiettivo: in partita i tiri non arrivano con tempo di recupero. La serie rapida allena il recupero posizionale automatico dopo ogni parata. Per i portieri Allievi è il test finale di agilita, riflessi e posizionamento unificati. Variante: aggiungi un quarto tiratore in posizione casuale dopo i 3 tiri fissi. Il portiere non conosce la posizione del quarto tiro. Allena la reattivita allo stimolo imprevedibile.',
  30, 'portieri', 'allievi',
  JSON_ARRAY('parate in serie', 'riflessi', 'reattività', 'portiere', 'sequenza'),
  'pubblica', TRUE, FALSE, 0
WHERE NOT EXISTS (
  SELECT 1 FROM sessioni_libreria WHERE titolo = 'Parate in serie da posizioni diverse con quarto tiro a sorpresa' AND eta_leva = 'allievi' AND ufficiale_myvivaio = TRUE
);


-- STEP B COMPLETATO — 35 INSERT (possesso_palla 5, finalizzazione 10, atletica_fisico 10, portieri 10)
-- TOTALE FILE: 70 INSERT (Step A 35 + Step B 35)

SELECT COUNT(*) AS totale_allievi FROM sessioni_libreria WHERE ufficiale_myvivaio = TRUE AND eta_leva = 'allievi';
