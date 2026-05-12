# Product Marketing Context

*Last updated: 12 maggio 2026*

## Product Overview

**One-liner:** MyVivaio è la webapp di gestione pensata specificamente per il calcio giovanile italiano — la tua squadra, sempre con te.

**What it does:** MyVivaio riunisce in un'unica piattaforma tutto quello che serve a un allenatore o a una società di calcio giovanile per gestire la stagione: rosa giocatori, presenze, convocazioni, calendario, comunicazioni, partite e tornei, statistiche, foto/video, certificati medici, quote sociali. È pensata per sostituire il caos di Excel + 8 gruppi WhatsApp + carta stampata con uno strumento solo, accessibile da mobile e desktop.

**Product category:** Software gestionale per società sportive / sport management SaaS — sottocategoria verticale: calcio giovanile italiano.

**Product type:** Webapp multi-tenant SaaS (PWA installabile su mobile). Stack React + TypeScript + Vite frontend, Node.js + Express backend, PostgreSQL.

**Business model:** SaaS in abbonamento, 3 piani secchi con scelta mensile o annuale (piano annuale = "Stagione sportiva 2026/2027", 1 agosto - 31 luglio). Demo gratuita 14 giorni.

- **Mister** — 9€/mese o 79€/anno (-27%). 1 leva, 25 giocatori, tutte le funzioni essenziali.
- **Mister Pro** — 19€/mese o 159€/anno (-30%). Multi-leva (fino a 3), libreria allenamenti (da settembre 2026), 5 collaboratori.
- **Società** — 49€/mese o 419€/anno (-29%). Leve illimitate, multi-utente illimitato, quote, pagamenti integrati, archivio documenti.

Sconto Founding -30% perpetuo per i primi 30 clienti. Go-live commerciale: 1 agosto 2026.

---

## Target Audience

**Target companies:**
- ASD e SSD italiane con settore giovanile attivo (FIGC, CSI, federazioni minori)
- Scuole calcio dilettantistiche
- Coordinamenti di singole leve
- Allenatori indipendenti che operano in più contesti (campus estivi, scuole calcio scolastiche)

**Decision-makers:**
- Singolo allenatore ("mister") — decide da solo, ciclo 3-7 giorni (segmento Mister/Mister Pro)
- Presidente o segretario di società — decisione condivisa col consiglio direttivo, ciclo 30-90 giorni (segmento Società)
- Direttore sportivo o responsabile settore giovanile

**Primary use case:** Smettere di gestire una squadra o una società di calcio giovanile su WhatsApp + Excel + carta stampata.

**Jobs to be done:**
- Convocare i giocatori per partita e allenamento senza inseguire i genitori in chat
- Avere un dato preciso e tracciato su presenze, minuti, gol, assist di ogni giocatore
- Comunicare con genitori, giocatori e collaboratori senza che le info importanti si perdano nei gruppi WhatsApp
- Per le società: avere visibilità centralizzata su tutte le leve, gestire quote e pagamenti, monitorare scadenze (certificato medico)

**Use cases:**
- Mister U13 che il sabato sera fa la convocazione dal divano in 5 minuti
- Segretario ASD che a fine stagione esporta presenze e dati per i 180 tesserati
- Genitore che riceve la convocazione del figlio direttamente in app e conferma con un tap
- Dirigente di leva che controlla scadenze certificati medici di tutti i suoi giocatori
- Allenatore che condivide le sedute settimanali col preparatore atletico (Mister Pro)

---

## Personas

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| **Il Mister** (35-50, allena perché il figlio gioca, geometra/operaio/impiegato) | Tempo libero, non litigare coi genitori, far giocare i ragazzi sereno | Domenica sera distrutta a gestire convocazioni e chat genitori | "Convocare in 5 minuti dal divano. Il sabato sera è tuo." |
| **Il Mister Pro** (30-45, allena con ambizione tecnica, magari coordina più leve) | Crescere professionalmente, sedute strutturate, condividere col preparatore | Tenere insieme 2-3 squadre senza impazzire, mancanza di libreria esercizi | "Multi-leva, libreria allenamenti, collaborazione vera. Il piano del super-mister." |
| **Il Presidente / Segretario ASD** (50-65, volontario o semi-professionale) | Far funzionare la società senza esaurirsi, dare strumenti ai mister | Tutto su Excel e WhatsApp, ore di lavoro operativo ogni domenica | "Liberi il tempo del segretario. La società smette di gestirsi, inizia a pensare." |
| **Il Genitore** (35-50, di solito poco interessato all'app, vuole solo info chiare) | Sapere quando il figlio gioca, conferma/disdice presenze, vedere foto | Gruppi WhatsApp caotici, info importanti perse | "Una sola app, tutte le info del figlio. Fine." |

---

## Problems & Pain Points

**Core problem:** Il calcio giovanile italiano gestisce 180+ tesserati per società su strumenti pensati per altro: Excel, 8 gruppi WhatsApp di leva, fogli stampati, email del presidente. Il risultato è caos operativo che ruba ore ogni settimana ad allenatori volontari e segretari.

**Why alternatives fall short:**
- **Golee (competitor leader italiano):** generalista multi-sport, non specializzato sul calcio giovanile, costa 499€+IVA/anno (~609€) — non ha piano per singolo allenatore
- **SportEasy:** francese, modello per-tesserato che gonfia per società grandi, non parla italiano "del campo"
- **Excel + WhatsApp:** gratis ma costa ore di lavoro e perdita di info importanti
- **TeamPlus/iCoach e simili:** datati, generici, non hanno il dialetto del calcio giovanile italiano (leve, convocazioni, certificato medico)

**What it costs them:**
- 1-2 ore di lavoro la domenica sera per il mister medio
- 5-10 ore alla settimana per il segretario di una società da 180 tesserati
- Giocatori bloccati a inizio campionato per certificato medico scaduto (dato che nessuno teneva traccia)
- Dispute coi genitori su "mio figlio gioca poco" senza dati per rispondere

**Emotional tension:**
- Frustrazione domenica sera: "ogni settimana la stessa cosa"
- Sensazione di disorganizzazione cronica nonostante l'impegno
- Conflitti con genitori che si potevano evitare con un dato preciso
- Per i presidenti: "abbiamo bisogno di crescere come società ma non abbiamo tempo per pensare"

---

## Competitive Landscape

**Direct — Golee** (leader italiano, 7.000+ società, partner CSI ufficiale): generalista multi-sport, ottimo prodotto ma non specializzato sul calcio giovanile italiano. Plus 49,99€/mese + IVA (~609€/anno). Non ha piano per singolo allenatore. → MyVivaio costa -31% e si concentra solo sul calcio giovanile.

**Direct — SportEasy** (francese): pricing per-tesserato (0,33-0,45€/membro/mese) che gonfia per società sopra 100 tesserati. Multi-sport europeo, non sintonizzato sul dilettantistico italiano. → MyVivaio ha prezzo fisso prevedibile e linguaggio italiano del campo.

**Direct — SportAssist** (italiano, modulare, prezzo su richiesta): target società grandi, modello consulenziale. → MyVivaio è self-service, prezzo trasparente, accessibile anche a una scuola calcio piccola.

**Secondary — Excel + WhatsApp + carta stampata:** il vero competitor del 90% delle società. Gratis nominalmente, ma costo nascosto in tempo e errori. → MyVivaio sostituisce 4-5 strumenti scollegati con uno solo.

**Indirect — Non fare nulla / continuare così:** la forza dell'abitudine. Il mister volontario che "se l'è sempre cavata col gruppo WhatsApp". → MyVivaio deve dimostrare il ROI in tempo, non solo in funzionalità.

---

## Differentiation

**Key differentiators:**
- **Verticale puro sul calcio giovanile italiano** — non multi-sport, non generico. Sa cosa è una "leva", come funziona il certificato medico FIGC, perché i Pulcini hanno regole diverse dagli Allievi
- **Piano Mister a 9€/mese** — unico sul mercato italiano. Nessun competitor offre un piano per il singolo allenatore. Apre un segmento che nessuno serve
- **Architettura multi-tenant nativa** — pensata fin dall'inizio per servire più società in parallelo con permessi granulari per leva
- **Fondatore con doppia prospettiva** — ex calciatore + genitore di un bambino dei Pulcini. Conosce il problema dall'interno
- **Stagione sportiva nativa** — il piano annuale segue il calendario reale (agosto-luglio), non l'anno solare
- **Tessera giocatore stile FIFA + Foto/Video** — leve emozionali in tutti i piani, non solo gestionali

**How we do it differently:** Mentre Golee parla alla società attraverso il segretario, MyVivaio parla direttamente all'allenatore — il mister. È una strategia bottom-up: il mister entra a 9€/mese, lo usa, lo ama, e porta MyVivaio dentro la sua società. Il cavallo di Troia.

**Why that's better:** I mister sono su Instagram, le società no. Il ciclo di acquisto del singolo mister è 3-7 giorni vs 30-90 per una società. Crescita social organica + funnel breve = motore di acquisizione che i competitor non possono replicare facilmente (perché il loro pricing non lo permette).

**Why customers choose us:**
- Mister: "È l'unica app che costa meno di un caffè a settimana e mi toglie il mal di testa"
- Società: "Costa il 31% in meno di Golee ed è pensata specificamente per noi"
- Entrambi: "Il fondatore mi risponde personalmente alle email"

---

## Objections

| Objection | Response |
|-----------|----------|
| "I genitori non scaricheranno l'altra app" | Hai 14 giorni per testarlo. Polis ASD aveva la stessa paura: dopo 3 mesi i gruppi WhatsApp si sono svuotati da soli. |
| "WhatsApp è gratis, perché pagare?" | WhatsApp ti costa 1-2 ore la domenica sera. 79€/anno = 6,50€/mese, meno di un caffè a settimana. Quanto vale un'ora del tuo tempo? |
| "Siamo una piccola scuola calcio, è troppo per noi" | Per questo c'è il piano Mister a 9€/mese: una sola leva, 25 giocatori, tutte le funzioni essenziali. |
| "Golee ha più funzioni" | Sì, perché è multi-sport. Noi facciamo una cosa sola e la facciamo per il calcio giovanile italiano. E costiamo il 31% in meno. |
| "Cambiare a metà stagione è un casino" | Per questo lanciamo il 1 agosto. Hai 2 mesi per configurare prima del kickoff di settembre. Importazione dati assistita inclusa. |
| "Non sono tecnologico, non saprei usarlo" | Demo 14 giorni gratuita + ti rispondo io personalmente alle email. Polis ASD aveva 14 mister, tutti volontari, tutti autonomi in 2 settimane. |

**Anti-persona:**
- Società multi-sport che hanno bisogno di gestire calcio + basket + pallavolo (vai con Golee)
- Squadre professionistiche e settori giovanili di club di Serie A/B (hanno tool su misura)
- Allenatori che non vogliono digitalizzarsi per principio (non li convinci, non perderci tempo)
- Società che cercano solo il CRM commerciale (campagne marketing massa, fundraising avanzato) — non siamo noi

---

## Switching Dynamics

**Push (cosa li allontana da quello che usano oggi):**
- Domenica sera persa ogni settimana
- "Quanti gol ha fatto Marco quest'anno?" — non lo so
- Gruppo WhatsApp esploso col messaggio del compleanno di Marta
- Genitori che reclamano "mio figlio gioca poco" senza dati per rispondere
- Certificato medico scaduto scoperto 5 minuti prima della partita

**Pull (cosa li attrae verso MyVivaio):**
- "Convocazione in 5 minuti dal divano" — promessa concreta
- Prezzo accessibile (9€/mese per il Mister)
- Demo 14 giorni gratuita, senza carta
- Specializzazione calcio giovanile (non multi-sport generico)
- Fondatore presente, risponde alle email personalmente
- Caso reale Polis ASD: numeri verificabili

**Habit (cosa li tiene fermi):**
- "Tanto me lo ricordo a memoria"
- "Il gruppo WhatsApp funziona, perché cambiare?"
- "Cambiare a metà stagione è scomodo"
- "I genitori si lamenteranno dell'ennesima app"

**Anxiety (cosa li preoccupa nel cambiare):**
- "I genitori non lo useranno"
- "Sarà complicato configurare"
- "Sto pagando per una cosa che potrei fare gratis"
- "E se non funziona / chiudono?"
- "I dati saranno al sicuro? (GDPR, foto minorenni)"

---

## Customer Language

**How they describe the problem (verbatim):**
- "Il giovedì sera è un delirio, 30 messaggi nel gruppo"
- "La domenica sera ci metto due ore a fare le convocazioni"
- "Mio figlio non l'ha visto giocare il nonno per 3 partite di fila" (genitore)
- "Mister scusa l'ora ma volevo solo dirti una cosa" (alle 23:47 di mercoledì)
- "Tanto me lo ricordo, quanto è venuto Marco"
- "Non si capisce niente in 'sto gruppo"

**How they describe us (verbatim):**
- "La tua squadra, sempre con te" (slogan)
- "Convocare dal divano in 5 minuti"
- "Smettere di gestire il calcio giovanile su WhatsApp"
- "L'app pensata per noi mister, non per le multinazionali"

**Words to use:**
- Mister (sempre, mai "coach" o "allenatore" nei social — "allenatore" ok nei contesti formali)
- Leva (non "squadra di età", non "team")
- Convocazione (non "lista convocati")
- Settore giovanile, calcio giovanile
- Genitori (non "tutori", non "famiglie")
- Domenica sera, sabato sera, giovedì sera (i momenti di dolore reali)
- Foglio Excel, gruppo WhatsApp (i nemici concreti)
- Stagione 2026/2027 (non "anno", non "annualità")
- Polis ASD (case study reale)
- Pulcini, Esordienti, Allievi (categorie reali italiane)

**Words to avoid:**
- "Soluzione" (parola da consulente)
- "Sinergie", "valorizzare", "ottimizzare" (linguaggio aziendale)
- "Player management", "sport tech", anglismi inutili
- "Famiglie", "tutori" (parla come parlano loro)
- "Pacchetto" o "tariffa" (di' piano)
- "Provider", "vendor"
- Toni motivazionali da LinkedIn ("siamo agguerriti", "sfondare")

**Glossary:**

| Term | Meaning |
|------|---------|
| Mister | L'allenatore. Termine italiano per "coach". Nel calcio giovanile è l'unico modo in cui si chiama |
| Leva | Categoria di età (es. 2014, 2013). Una società ha tipicamente 6-10 leve attive |
| Convocazione | Lista dei giocatori che giocano una determinata partita, con info pratiche (orario, divisa, ritrovo) |
| Tesserato | Giocatore registrato FIGC o ente affiliato (CSI, ACSI, ecc.) |
| Pulcini / Esordienti / Allievi / Giovanissimi | Categorie ufficiali per età. Pulcini = 8-10 anni, Esordienti = 10-12, Giovanissimi = 12-14, Allievi = 14-16 |
| Certificato medico | Documento obbligatorio per legge per giocare. Validità tipica 1 anno. Va monitorato per scadenza |
| Dirigente | Ruolo intermedio tra società e mister, responsabile di una leva specifica |
| ASD / SSD | Forma giuridica delle società dilettantistiche italiane |
| Founding Member | I primi 30 clienti MyVivaio. Sconto -30% perpetuo |
| Stagione sportiva | Periodo agosto-luglio. È la "vera" annualità nel calcio giovanile italiano |

---

## Brand Voice

**Tone:** Diretto, italiano colloquiale, da collega che parla a un altro collega. Mai brand corporate. Su LinkedIn leggermente più formale per il pubblico B2B (presidenti, dirigenti) ma sempre umano. Empatico verso il mister volontario senza essere paternalistico.

**Style:**
- Frasi corte. Punto. Vai a capo.
- Verbi all'attivo, mai passivo
- Aneddoti concreti con nomi e dettagli (Marco, geometra, Bolzaneto, U13)
- Numeri reali quando ci sono (180 tesserati, 8 leve, 14 allenatori)
- Domande dirette al lettore ("Quanti gol ha fatto il tuo numero 9?")
- Confronti quotidiani (una pizza, un caffè a settimana, meno di Netflix)
- Confessione e autocritica > autorevolezza-da-brand ("li ho fatti tutti e tre")

**Personality:** 5 aggettivi:
1. **Diretto** — niente giri di parole
2. **Empatico** — vive il problema, non lo studia da fuori
3. **Competente** — sa di cosa parla, ex calciatore + genitore
4. **Italiano** — non un clone di SaaS USA, parla la lingua del campo
5. **Coerente** — promessa = realtà. Non over-promise

---

## Proof Points

**Metrics:**
- Polis ASD: 180 tesserati, 8 leve, 14 allenatori, 6 mesi di utilizzo
- Costo -31% vs Golee (419€/anno vs 609€/anno IVA inclusa)
- Sotto i 7€/mese il piano Mister annuale (79€/anno)
- 14 giorni demo gratuita senza carta
- 5 minuti per fare una convocazione (vs 1-2 ore col vecchio metodo)
- Zero giocatori Polis bloccati per certificato medico scaduto a inizio campionato 2025/26

**Customers:**
- **Polis ASD** (Genova, bianco-blu) — prima società adottatrice, caso studio di riferimento
- 2-3 società pilot in fase di onboarding (maggio-luglio 2026)
- 5-10 mister beta tester target

**Testimonials:**

> "Il tempo che ho liberato io e il segretario lo abbiamo investito a pensare alla società, non a gestirla operativamente."
> — Presidente di Polis ASD (da verificare/autorizzare prima della pubblicazione)

> "Adesso fa la convocazione del martedì il sabato sera, in 5 minuti dal divano. La domenica si gode la partita di Serie A."
> — Marco, mister U13 Bolzaneto (placeholder narrativo, sostituire con mister reale)

**Value themes:**

| Theme | Proof |
|-------|-------|
| Risparmio di tempo | Polis ASD: il segretario ha liberato 5-10 ore/settimana |
| Specializzazione calcio giovanile | Unico tool italiano verticale, lessico del campo (leva, convocazione, certificato medico) |
| Prezzo accessibile | 9€/mese piano Mister = unico sul mercato italiano. -31% vs Golee per le società |
| Coinvolgimento genitori | Una sola app sostituisce 8 gruppi WhatsApp |
| Dati precisi sui giocatori | Presenze, minuti, gol, assist tracciati automaticamente |
| Sicurezza dati (GDPR) | Architettura multi-tenant nativa, opt-in WhatsApp esplicito, no foto minori senza consenso |

---

## Goals

**Business goal (anno 1, agosto 2026 - luglio 2027):**
- 110+ mister paganti (mix Mister 9€ + Mister Pro 19€)
- 46 società paganti (piano Società 49€)
- MRR fine M12: ~5.500€
- Ricavo cumulato anno 1: ~26.000€
- Margine netto: 85%+

**Conversion action:**
- **Pre-lancio (maggio-luglio 2026):** iscrizione lista d'attesa Stagione 2026/27
- **Lancio (agosto 2026 in poi):** attivazione demo gratuita 14 giorni
- **Post-demo:** acquisto piano (Mister, Mister Pro o Società) — possibile codice Founding -30%

**Current metrics (maggio 2026 — pre-lancio):**
- 1 società pilot operativa (Polis ASD)
- 2-3 società pilot in onboarding
- Audience social: 0 (lancio fissato per lunedì 18 maggio 2026 ore 8:00)
- KPI mese 1 social: 100-300 follower IG, 3-10 demo da lista d'attesa

**KPI di salute da monitorare:**
- Tasso conversione demo Mister → pagante: target 25-35%
- Tasso conversione demo Società → pagante: target 15-25%
- Mix Mister vs Mister Pro: atteso 60/40
- Churn mensile Mister: < 5%
- Churn mensile Società: < 3%
- CAC Mister: < 20€ (payback 3 mesi)
- CAC Società: < 200€ (payback 6 mesi)
- LTV/CAC: > 5x su entrambi i segmenti
