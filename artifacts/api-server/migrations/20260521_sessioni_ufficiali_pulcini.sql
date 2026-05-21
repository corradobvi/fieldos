-- ═══════════════════════════════════════════════════════════════════════════
-- MyVivaio — Sessioni Ufficiali Categoria PULCINI (U8/U10)
-- File:    20260521_sessioni_ufficiali_pulcini.sql
-- Totale:  70 sessioni · 10 per ciascuna delle 7 categorie
-- Data:    2026-05-21
-- Autore:  MyVivaio Editorial Team
-- ───────────────────────────────────────────────────────────────────────────
-- PRE-REQUISITO: mister_id nella tabella originale è INT NOT NULL.
-- Per i contenuti ufficiali MyVivaio (senza autore) occorre renderlo nullable.
-- L''ALTER qui sotto è idempotente su MySQL 8 (MODIFY non fallisce se già NULL).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE sessioni_libreria MODIFY mister_id INT NULL;

-- ─── IDEMPOTENZA ────────────────────────────────────────────────────────────
-- Ogni INSERT usa SELECT … WHERE NOT EXISTS su (titolo, eta_leva, ufficiale_myvivaio).
-- Puoi eseguire questo script più volte senza creare duplicati.
-- ─────────────────────────────────────────────────────────────────────────────


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: riscaldamento (10 sessioni · 10-15 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tecnica_individuale (10 sessioni · 15-25 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: tattica (10 sessioni · 20-30 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: possesso_palla (10 sessioni · 15-25 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: finalizzazione (10 sessioni · 15-25 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: atletica_fisico (10 sessioni · 10-20 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- CATEGORIA: portieri (10 sessioni · 15-25 min)
-- ════════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICA FINALE
-- ════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) AS totale_pulcini FROM sessioni_libreria
WHERE ufficiale_myvivaio = TRUE AND eta_leva = 'pulcini';
