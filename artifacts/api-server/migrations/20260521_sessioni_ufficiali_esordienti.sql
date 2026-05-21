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


-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICA FINALE
-- ════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) AS totale_esordienti FROM sessioni_libreria
WHERE ufficiale_myvivaio = TRUE AND eta_leva = 'esordienti';
