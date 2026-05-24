// Dataset demo Stella Azzurra ASD — 4 leve (U6/U10/U14/U18), 58 giocatori, 16 utenti
// Generato server-side: le date sono relative al momento della chiamata
export function buildStellaDemoState(): Record<string, unknown> {
  const now = Date.now();
  const DAY = 86_400_000;

  // ── Date helpers ──────────────────────────────────────────────
  function toYmd(d: Date): string {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function lastN(n: number, dow: number): string[] {
    const r: string[] = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    while (r.length < n) {
      if (d.getDay() === dow) r.unshift(toYmd(new Date(d)));
      d.setDate(d.getDate() - 1);
    }
    return r;
  }
  function nextDow(dow: number, after?: Date): string {
    const d = after ? new Date(after) : new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
    return toYmd(d);
  }
  function addDays(base: string, n: number): string {
    return toYmd(new Date(new Date(base).getTime() + n * DAY));
  }

  // ── Pseudo-random ─────────────────────────────────────────────
  function pr(s: number): number {
    const x = Math.sin(s + 1) * 10_000;
    return x - Math.floor(x);
  }

  // ── Date anchors ──────────────────────────────────────────────
  const pastSat = lastN(16, 6);   // 16 past Saturdays, index 0 = oldest
  const pastTue = lastN(18, 2);
  const pastThu = lastN(18, 4);
  const nxtTue  = nextDow(2);
  const nxtThu  = nextDow(4);
  const nxtSat  = nextDow(6);
  const nxtSat2 = nextDow(6, new Date(nxtSat));
  const nxtSat3 = nextDow(6, new Date(nxtSat2));
  const trainDates = [...pastTue, ...pastThu].sort();

  // ── Stat helpers ──────────────────────────────────────────────
  function mkPresAll(id: number, n: number, prob: number) {
    return trainDates.slice(-n).map((date, i) => {
      const r = pr(id * 100 + i);
      return { date, status: r < prob ? 'p' : r < prob + 0.06 ? 'j' : 'a' };
    });
  }
  function mkPresPartite(id: number, dates: string[]) {
    return dates.map((date, i) => ({ date, status: pr(id * 200 + i) < 0.88 ? 'p' : 'a' }));
  }
  function mkPartiteStats(id: number, n: number, ruolo: string) {
    const gp = ruolo === 'A' ? 0.32 : ruolo === 'C' ? 0.13 : ruolo === 'D' ? 0.04 : 0;
    const ap = ruolo === 'A' ? 0.10 : ruolo === 'C' ? 0.18 : ruolo === 'D' ? 0.05 : 0;
    return Array.from({ length: n }, (_, i) => ({
      gol: pr(id * 13 + i * 7) < gp ? (pr(id * 17 + i) < 0.15 ? 2 : 1) : 0,
      ass: pr(id * 11 + i * 5) < ap ? 1 : 0,
    }));
  }
  function pp(id: number) { return 0.72 + pr(id * 7) * 0.22; }

  // ── Player factory ────────────────────────────────────────────
  function mkPlayer(
    id: number, nome: string, cogn: string, num: string, ruolo: string,
    anno: number, leva: string, matchDates: string[], trainN: number
  ) {
    return {
      id, nome, cogn, soprannome: '', num, ruolo, anno, tel: '', leva,
      partite: mkPartiteStats(id, matchDates.length, ruolo),
      presAll: mkPresAll(id, trainN, pp(id)),
      presPartite: mkPresPartite(id, matchDates),
      assenzeAvvisate: [],
    };
  }

  // ── Match date sequences ──────────────────────────────────────
  // pastSat[0]=oldest, pastSat[15]=most recent
  const dU6  = pastSat.slice(-6);   // 6 played Saturdays
  const dU10 = pastSat.slice(-9);   // 9 played
  const dU14 = pastSat.slice(-14);  // 14 played (skip 2 oldest)
  const dU18 = pastSat.slice(-11);  // 11 played

  // ── Players ───────────────────────────────────────────────────
  const players = [
    // U6 (IDs 1–14, nati 2019–2020)
    mkPlayer(1,'Giovanni','Piccoli','1','P',2020,'U6',dU6,12),
    mkPlayer(2,'Luca','Verdi','2','D',2020,'U6',dU6,12),
    mkPlayer(3,'Marco','Blu','3','D',2019,'U6',dU6,12),
    mkPlayer(4,'Simone','Neri','4','C',2020,'U6',dU6,12),
    mkPlayer(5,'Matteo','Rosa','5','C',2019,'U6',dU6,12),
    mkPlayer(6,'Andrea','Gialli','6','C',2020,'U6',dU6,12),
    mkPlayer(7,'Filippo','Marini','7','A',2019,'U6',dU6,12),
    mkPlayer(8,'Lorenzo','Pili','8','A',2020,'U6',dU6,12),
    mkPlayer(9,'Daniele','Conti','9','D',2019,'U6',dU6,12),  // figlio di utente 7
    mkPlayer(10,'Riccardo','Amato','10','C',2020,'U6',dU6,12),
    mkPlayer(11,'Cristian','Bello','11','A',2019,'U6',dU6,12),
    mkPlayer(12,'Thomas','Galli','12','D',2020,'U6',dU6,12),
    mkPlayer(13,'Kevin','Moro','13','C',2020,'U6',dU6,12),
    mkPlayer(14,'Davide','Santi','14','A',2019,'U6',dU6,12),
    // U10 (IDs 15–28, nati 2015–2016)
    mkPlayer(15,'Marco','Ferretti','8','C',2015,'U10',dU10,18), // figlio di utente 6
    mkPlayer(16,'Giovanni','Mancini','1','P',2015,'U10',dU10,18),
    mkPlayer(17,'Matteo','Ricci','12','P',2015,'U10',dU10,18),
    mkPlayer(18,'Andrea','Esposito','2','D',2015,'U10',dU10,18),
    mkPlayer(19,'Davide','Romano','3','D',2016,'U10',dU10,18),
    mkPlayer(20,'Lorenzo','Colombo','4','D',2015,'U10',dU10,18),
    mkPlayer(21,'Federico','Costa','5','D',2015,'U10',dU10,18),
    mkPlayer(22,'Nicolò','Gallo','6','D',2016,'U10',dU10,18),
    mkPlayer(23,'Riccardo','Barbieri','7','C',2015,'U10',dU10,18),
    mkPlayer(24,'Simone','Martinelli','10','C',2016,'U10',dU10,18),
    mkPlayer(25,'Tommaso','De Luca','13','C',2015,'U10',dU10,18),
    mkPlayer(26,'Alessandro','Greco','14','A',2015,'U10',dU10,18),
    mkPlayer(27,'Filippo','Lombardi','15','A',2016,'U10',dU10,18),
    mkPlayer(28,'Mattia','Fontana','9','A',2015,'U10',dU10,18),
    // U14 (IDs 29–43, nati 2011–2012)
    mkPlayer(29,'Luca','Marino','10','C',2011,'U14',dU14,28),  // demo.giocatore + figlio di utente 8
    mkPlayer(30,'Giorgio','Santoro','1','P',2011,'U14',dU14,28),
    mkPlayer(31,'Paolo','Amato','9','A',2011,'U14',dU14,28),
    mkPlayer(32,'Sergio','Marini','2','D',2012,'U14',dU14,28),
    mkPlayer(33,'Antonio','Ferrara','3','D',2011,'U14',dU14,28),
    mkPlayer(34,'Roberto','Moreno','11','A',2012,'U14',dU14,28),
    mkPlayer(35,'Carlo','Riva','7','C',2011,'U14',dU14,28),
    mkPlayer(36,'Stefano','Mele','6','D',2011,'U14',dU14,28),
    mkPlayer(37,'Giuseppe','Neri','5','D',2012,'U14',dU14,28),
    mkPlayer(38,'Mario','Conte','4','D',2011,'U14',dU14,28),
    mkPlayer(39,'Fabio','Guerra','8','C',2012,'U14',dU14,28),
    mkPlayer(40,'Enzo','Palma','12','C',2011,'U14',dU14,28),
    mkPlayer(41,'Bruno','Serra','14','A',2012,'U14',dU14,28),
    mkPlayer(42,'Claudio','Villa','13','C',2011,'U14',dU14,28),
    mkPlayer(43,'Leonardo','Fabbri','15','A',2012,'U14',dU14,28),
    // U18 (IDs 44–58, nati 2007–2008)
    mkPlayer(44,'Alessandro','Rossi','9','A',2007,'U18',dU18,22), // figlio di utente 9
    mkPlayer(45,'Matteo','Bianchi','1','P',2007,'U18',dU18,22),
    mkPlayer(46,'Luca','Conti','4','D',2008,'U18',dU18,22),
    mkPlayer(47,'Marco','Greco','5','D',2007,'U18',dU18,22),
    mkPlayer(48,'Andrea','Serra','7','C',2008,'U18',dU18,22),
    mkPlayer(49,'Federico','Neri','8','C',2007,'U18',dU18,22),
    mkPlayer(50,'Davide','Ricci','10','C',2007,'U18',dU18,22),
    mkPlayer(51,'Simone','Ferrari','11','A',2008,'U18',dU18,22),
    mkPlayer(52,'Lorenzo','Costa','6','D',2007,'U18',dU18,22),
    mkPlayer(53,'Roberto','Mele','3','D',2008,'U18',dU18,22),
    mkPlayer(54,'Claudio','Barbieri','2','D',2007,'U18',dU18,22),
    mkPlayer(55,'Francesco','Martini','13','C',2008,'U18',dU18,22),
    mkPlayer(56,'Gianni','Moreno','14','A',2007,'U18',dU18,22),
    mkPlayer(57,'Enrico','Riva','15','A',2008,'U18',dU18,22),
    mkPlayer(58,'Nicola','Verde','16','C',2007,'U18',dU18,22),
  ]; // 14+14+15+15 = 58 ✓

  // ── Player photos (DiceBear SVG avatars) ─────────────────────
  const playerPhotos: Record<string, string> = {};
  players.forEach(p => {
    playerPhotos[String(p.id)] = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.nome + '_' + p.cogn)}`;
  });

  // ── Campionati ────────────────────────────────────────────────
  let _mId = 1;

  function buildLeague(
    teamName: string,
    rivals: string[],
    playedDates: string[],   // chronological, oldest first
    futureDates: string[],
    levaPlayerIds: number[],
    ourGoals: number[],
    theirGoals: number[],
    baseId: number
  ) {
    _mId = baseId;
    const total = playedDates.length + futureDates.length;
    const matches: any[] = [];
    for (let g = 1; g <= total; g++) {
      const played = g <= playedDates.length;
      const date   = played ? playedDates[g - 1] : futureDates[g - playedDates.length - 1];
      const ri     = (g - 1) % rivals.length;
      const rival  = rivals[ri];
      const isHome = g % 2 === 1;
      const seed0  = baseId * 1000 + g * 17;
      const golOur = played ? (ourGoals[g - 1]   ?? Math.floor(pr(seed0)      * 4)) : 0;
      const golRiv = played ? (theirGoals[g - 1] ?? Math.floor(pr(seed0 + 3)  * 3)) : 0;

      const stats: any[] = [];
      if (played) {
        levaPlayerIds.forEach(pid => {
          const p = players.find(x => x.id === pid);
          if (!p) return;
          const s = (p as any).partite[g - 1];
          if (s && (s.gol > 0 || s.ass > 0)) stats.push({ playerId: pid, gol: s.gol, assist: s.ass });
        });
      }

      matches.push({
        id: _mId++, giornata: g, data: date,
        orario: isHome ? '10:30' : '09:00',
        casa:   isHome ? teamName : rival,
        ospite: isHome ? rival    : teamName,
        luogo:  isHome ? 'Campo Via Larga 12, Milano' : `Campo ${rival}`,
        played, golCasa: isHome ? golOur : golRiv, golOspiti: isHome ? golRiv : golOur, stats,
      });
      // Two parallel matches in this giornata
      for (let k = 1; k <= 2; k++) {
        const r1 = rivals[(ri + k) % rivals.length];
        const r2 = rivals[(ri + k + 2) % rivals.length];
        const s2 = baseId * 1000 + g * 17 + k * 100;
        matches.push({
          id: _mId++, giornata: g, data: date,
          orario: k === 1 ? '11:30' : '15:00',
          casa: r1, ospite: r2,
          luogo: `Campo ${r1}`,
          played,
          golCasa:   played ? Math.floor(pr(s2 + 1) * 4) : 0,
          golOspiti: played ? Math.floor(pr(s2 + 5) * 3) : 0,
          stats: [],
        });
      }
    }
    return matches;
  }

  const u6R  = ['ASD Aquile Piccole','CS Junior Milano','Calcio Amici U6','FC Piccoli Leoni','GS Primaleva'];
  const u10R = ['Falchi SC','Aquile FC','Leoni ASD','Pantere 2012','Tigri Calcio'];
  const u14R = ['FC Giovanissimi','Atletico U14','Sporting Junior','Real Calcio','Panthers U14'];
  const u18R = ['FC Allievi','Atletico Senior','Sporting U18','Real Calcio U18','Juniores Elite'];

  const campionato = {
    U6:  {
      nome:'Torneo Primavera U6 2025/26', stagione:'2025/26',
      squadre:['Stella Azzurra ASD U6',...u6R],
      partite: buildLeague('Stella Azzurra ASD U6', u6R, dU6, [nxtSat],
        Array.from({length:14},(_,i)=>i+1),
        [2,1,3,2,4,1],[1,1,0,2,0,2], 1),
    },
    U10: {
      nome:'Campionato Provinciale U10 Girone B', stagione:'2025/26',
      squadre:['Stella Azzurra ASD U10',...u10R],
      partite: buildLeague('Stella Azzurra ASD U10', u10R, dU10, [nxtSat],
        Array.from({length:14},(_,i)=>i+15),
        [3,2,4,1,2,3,1,2,3],[1,2,0,2,0,1,2,0,1], 100),
    },
    U14: {
      nome:'Campionato Regionale U14 Girone C', stagione:'2025/26',
      squadre:['Stella Azzurra ASD U14',...u14R],
      partite: buildLeague('Stella Azzurra ASD U14', u14R, dU14, [nxtSat2, nxtSat3],
        Array.from({length:15},(_,i)=>i+29),
        [2,3,1,2,4,0,3,2,1,3,2,1,4,2],[0,1,1,0,1,2,1,1,2,0,1,1,0,1], 300),
    },
    U18: {
      nome:'Campionato Provinciale U18 Girone A', stagione:'2025/26',
      squadre:['Stella Azzurra ASD U18',...u18R],
      partite: buildLeague('Stella Azzurra ASD U18', u18R, dU18, [nxtSat2, nxtSat3],
        Array.from({length:15},(_,i)=>i+44),
        [2,1,3,0,2,3,1,2,0,3,2],[1,2,1,1,0,1,2,1,1,1,0], 500),
    },
  };

  // ── Tornei ────────────────────────────────────────────────────
  let torneoId   = 1;
  let faseId     = 1;
  let tornMatchN = 700;

  function tm(casa: string, ospite: string, date: string | null, played: boolean, gc: number, go: number) {
    return { id: 'tm' + tornMatchN++, data: date, casa, ospite, played, golCasa: gc, golOspiti: go, stats: [], visibilitaSubito: played };
  }

  function mkTorneo(
    nome: string, leva: string, luogo: string, di: string, df: string,
    squads: string[], partite: any[], archiviato: boolean
  ) {
    const myTeam = `Stella Azzurra ASD ${leva}`;
    return {
      id: 't' + torneoId++, nome, leva, luogo, dataInizio: di, dataFine: df,
      tipo: 2,
      spareggio: ['scontro_diretto','dr_generale','gf_generale'],
      squadrePartecipanti: squads,
      fasi: [{ id: 'f' + faseId++, nome: 'Girone Unico', tipo: 'girone', faseGruppo: null, squads, partite }],
      convocati: [],
      archiviato,
      squadreMieFlag: [myTeam],
      convocazioniPerPartita: false,
    };
  }

  // Date shortcuts
  const s0 = pastSat[0]  ?? addDays(nxtSat, -77);
  const s1 = pastSat[1]  ?? addDays(nxtSat, -70);
  const s2 = pastSat[2]  ?? addDays(nxtSat, -63);
  const s3 = pastSat[3]  ?? addDays(nxtSat, -56);
  const s4 = pastSat[4]  ?? addDays(nxtSat, -49);
  const s5 = pastSat[5]  ?? addDays(nxtSat, -42);
  const s6 = pastSat[6]  ?? addDays(nxtSat, -35);

  const u6Sq   = ['Stella Azzurra ASD U6','Falchi Mini','Aquile Piccole','Leoni Baby'];
  const u10Sq  = ['Stella Azzurra ASD U10','Falchi SC','Aquile FC','Leoni ASD'];
  const u14Sq  = ['Stella Azzurra ASD U14','FC Giovanissimi','Atletico U14','Sporting Junior'];
  const u18Sq  = ['Stella Azzurra ASD U18','FC Allievi','Atletico Senior','Sporting U18'];

  const tornei = [
    mkTorneo('Torneo Invernale U6',         'U6',  'Milano',  s0, s2,     u6Sq, [
      tm('Stella Azzurra ASD U6','Falchi Mini',  s0, true,  3,1),
      tm('Aquile Piccole','Leoni Baby',          s0, true,  1,2),
      tm('Falchi Mini','Leoni Baby',             s1, true,  0,2),
      tm('Stella Azzurra ASD U6','Aquile Piccole',s1,true, 2,0),
      tm('Leoni Baby','Stella Azzurra ASD U6',   s2, true,  1,2),
      tm('Falchi Mini','Aquile Piccole',          s2, true,  1,0),
    ], true),
    mkTorneo('Coppa Primavera U6',           'U6',  'Milano',  nxtSat,  nxtSat2, u6Sq, [
      tm('Stella Azzurra ASD U6','Leoni Baby',  nxtSat,  false,0,0),
      tm('Falchi Mini','Aquile Piccole',         nxtSat,  false,0,0),
      tm('Aquile Piccole','Stella Azzurra ASD U6',nxtSat2,false,0,0),
      tm('Leoni Baby','Falchi Mini',             nxtSat2, false,0,0),
    ], false),
    mkTorneo('Torneo di Pasqua U10',         'U10', 'Milano',  s1, s3,     u10Sq, [
      tm('Stella Azzurra ASD U10','Falchi SC',  s1, true,  2,1),
      tm('Aquile FC','Leoni ASD',               s1, true,  0,2),
      tm('Falchi SC','Leoni ASD',               s2, true,  1,1),
      tm('Stella Azzurra ASD U10','Aquile FC',  s2, true,  3,0),
      tm('Leoni ASD','Stella Azzurra ASD U10',  s3, true,  0,3),
      tm('Falchi SC','Aquile FC',               s3, true,  2,1),
    ], true),
    mkTorneo('Torneo Città di Milano U10',   'U10', 'Milano',  nxtSat, nxtSat3,  u10Sq, [
      tm('Stella Azzurra ASD U10','Leoni ASD',  nxtSat,  false,0,0),
      tm('Falchi SC','Aquile FC',               nxtSat,  false,0,0),
      tm('Aquile FC','Stella Azzurra ASD U10',  nxtSat2, false,0,0),
      tm('Leoni ASD','Falchi SC',               nxtSat2, false,0,0),
      tm('Stella Azzurra ASD U10','Falchi SC',  nxtSat3, false,0,0),
      tm('Aquile FC','Leoni ASD',               nxtSat3, false,0,0),
    ], false),
    mkTorneo('Torneo Provinciale U14 Primavera','U14','Milano', s2, s5,  u14Sq, [
      tm('Stella Azzurra ASD U14','FC Giovanissimi',s2, true,  3,1),
      tm('Atletico U14','Sporting Junior',           s2, true,  1,2),
      tm('FC Giovanissimi','Sporting Junior',        s3, true,  0,1),
      tm('Stella Azzurra ASD U14','Atletico U14',   s3, true,  2,0),
      tm('Sporting Junior','Stella Azzurra ASD U14',s4, true,  1,2),
      tm('FC Giovanissimi','Atletico U14',           s4, true,  3,2),
      tm('Stella Azzurra ASD U14','Sporting Junior', s5, true,  4,0),
      tm('Atletico U14','FC Giovanissimi',           s5, true,  1,1),
    ], true),
    mkTorneo('Coppa Giovani U14',            'U14', 'Monza',   nxtSat, nxtSat2, u14Sq, [
      tm('Stella Azzurra ASD U14','Atletico U14',   nxtSat,  false,0,0),
      tm('FC Giovanissimi','Sporting Junior',        nxtSat,  false,0,0),
      tm('Sporting Junior','Stella Azzurra ASD U14',nxtSat2, false,0,0),
      tm('Atletico U14','FC Giovanissimi',           nxtSat2, false,0,0),
    ], false),
    mkTorneo('Memorial Rossi U18',           'U18', 'Milano',  s3, s6,  u18Sq, [
      tm('Stella Azzurra ASD U18','FC Allievi',     s3, true,  2,0),
      tm('Atletico Senior','Sporting U18',           s3, true,  1,1),
      tm('FC Allievi','Sporting U18',               s4, true,  0,2),
      tm('Stella Azzurra ASD U18','Atletico Senior',s4, true,  3,1),
      tm('Sporting U18','Stella Azzurra ASD U18',   s5, true,  0,1),
      tm('FC Allievi','Atletico Senior',             s5, true,  2,2),
    ], true),
    mkTorneo('Torneo Fine Stagione U18',     'U18', 'Bergamo', nxtSat2, nxtSat3, u18Sq, [
      tm('Stella Azzurra ASD U18','Sporting U18',   nxtSat2, false,0,0),
      tm('FC Allievi','Atletico Senior',             nxtSat2, false,0,0),
      tm('Atletico Senior','Stella Azzurra ASD U18',nxtSat3, false,0,0),
      tm('Sporting U18','FC Allievi',               nxtSat3, false,0,0),
    ], false),
  ]; // 8 tornei (2 per leva) ✓

  // ── Events ────────────────────────────────────────────────────
  const events = [
    {id:1,title:'Allenamento U6/U10',type:'allenamento',date:nxtTue,start:'17:30',end:'18:30',luogo:'Campo Via Larga 12, Milano',note:'',recur:'none',recurUntil:null,leve:['U6','U10'],createdBy:'demo.mister@stellaazzurra.it'},
    {id:2,title:'Allenamento U14/U18',type:'allenamento',date:nxtTue,start:'18:30',end:'20:00',luogo:'Campo Via Larga 12, Milano',note:'',recur:'none',recurUntil:null,leve:['U14','U18'],createdBy:'mister.u14@stellaazzurra.it'},
    {id:3,title:'Allenamento U6/U10',type:'allenamento',date:nxtThu,start:'17:30',end:'18:30',luogo:'Campo Via Larga 12, Milano',note:'',recur:'none',recurUntil:null,leve:['U6','U10'],createdBy:'demo.mister@stellaazzurra.it'},
    {id:4,title:'Allenamento U14/U18',type:'allenamento',date:nxtThu,start:'18:30',end:'20:00',luogo:'Campo Via Larga 12, Milano',note:'',recur:'none',recurUntil:null,leve:['U14','U18'],createdBy:'mister.u14@stellaazzurra.it'},
    {id:5,title:'Campionato G10 — Stella vs Tigri',type:'partita',date:nxtSat,start:'10:30',end:'12:00',luogo:'Campo Via Larga 12, Milano',note:'Partita in casa — porta i supporter!',recur:'none',recurUntil:null,leve:['U10'],createdBy:'demo.admin@stellaazzurra.it'},
    {id:6,title:'Coppa Primavera — U6',type:'partita',date:nxtSat,start:'09:30',end:'11:00',luogo:'Campo Via Larga 12, Milano',note:'Prima partita del torneo! Portare tuta ufficiale.',recur:'none',recurUntil:null,leve:['U6'],createdBy:'mister.u6@stellaazzurra.it'},
    {id:7,title:'Campionato G15 — U14 Trasferta',type:'partita',date:nxtSat2,start:'11:30',end:'13:00',luogo:'Campo FC Giovanissimi, Via Torino 8',note:'Trasferta. Ritrovo ore 10:30 al campo.',recur:'none',recurUntil:null,leve:['U14'],createdBy:'mister.u14@stellaazzurra.it'},
    {id:8,title:'Campionato G12 — Stella vs Atletico Senior',type:'partita',date:nxtSat2,start:'14:30',end:'16:30',luogo:'Campo Via Larga 12, Milano',note:'Derby casalingo! Ingresso libero.',recur:'none',recurUntil:null,leve:['U18'],createdBy:'mister.u18@stellaazzurra.it'},
  ];

  // ── Convocazioni ──────────────────────────────────────────────
  const convocazioni = [
    {
      id:1, eventId:5, leva:'U10',
      ritrovo:'09:45', divisa:'Casa',
      note:'Partita decisiva per il secondo posto. Portare borraccia!',
      playerIds:[15,16,18,19,20,21,23,24,26,27,28],
      createdBy:2, createdAt:now-DAY, sentAt:now-DAY,
    },
    {
      id:2, eventId:7, leva:'U14',
      ritrovo:'10:30', divisa:'Trasferta',
      note:'Ritrovo alle 10:30 al campo. Tuta da gara obbligatoria.',
      playerIds:[29,30,31,32,33,34,35,36,37,39,41,43],
      createdBy:3, createdAt:now-2*DAY, sentAt:now-2*DAY,
    },
  ];

  // ── Comunicazioni ─────────────────────────────────────────────
  const t7  = now - 7*DAY, t4 = now - 4*DAY, t3 = now - 3*DAY, t2 = now - 2*DAY, t1 = now - DAY;
  const comunicazioni = [
    {id:1,scope:'pubblica',tipo:'info',titolo:'🏆 Benvenuti nella stagione 2025/26!',testo:'Inizia ufficialmente la stagione 2025/26 per tutte le leve di Stella Azzurra ASD. Tante novità in arrivo: nuovi tornei, campionati e attività. Forza Stella! 💙⭐',mittente:'Marco Rossi',mittenteId:1,ts:t7,readBy:[1,2,3,4,5,6],commentiAbilitati:true,commenti:[{id:1,userId:2,testo:'Grande stagione che ci aspetta! I ragazzi U10 sono carichi 💪',ts:t7+3_600_000}],sondaggio:null},
    {id:2,scope:'leva:U10',tipo:'urgente',titolo:'⚠️ Cambio campo — Allenamento Martedì',testo:"L'allenamento di martedì si svolgerà sul Campo B (lato via Roma) causa manutenzione sul Campo A. Stesso orario 17:30.",mittente:'Andrea Bianchi',mittenteId:2,ts:t3,readBy:[1,2,6],commentiAbilitati:false,commenti:[],sondaggio:null},
    {id:3,scope:'leva:U14',tipo:'evento',titolo:'🏟️ Coppa Giovani U14 — Monza 21/22 Giugno',testo:"La nostra U14 è qualificata alla Coppa Giovani U14 a Monza! Registrazione entro 15 giugno. Dettagli dal mister Sofia.",mittente:'Sofia Ferrari',mittenteId:3,ts:t2,readBy:[1,3,4,14],commentiAbilitati:false,commenti:[],sondaggio:null},
    {id:4,scope:'leva:U10',tipo:'sondaggio',titolo:'📊 Disponibilità allenamenti estivi',testo:"Stiamo pianificando gli allenamenti estivi (luglio). Confermate la disponibilità della vostra famiglia.",mittente:'Andrea Bianchi',mittenteId:2,ts:t1,readBy:[1,2,6],commentiAbilitati:false,commenti:[],sondaggio:{domanda:'Siete disponibili per allenamenti a luglio?',opzioni:['Sì, tutte le settimane','Sì, alcune settimane','No, non saremo disponibili'],anonimo:false,scadenza:null,chiuso:false,voti:[{userId:1,opzioneIdx:0,nome:'Marco Rossi'},{userId:2,opzioneIdx:0,nome:'Andrea Bianchi'},{userId:6,opzioneIdx:1,nome:'Claudia Romano'}]}},
    {id:5,scope:'leva:U18',tipo:'info',titolo:'📋 Rinnovo tessere FIGC — scadenza 30 giugno',testo:"Ricordiamo che le tessere FIGC scadono il 30 giugno. Portare documento d'identità per il rinnovo. Contattare la segreteria.",mittente:'Marco Rossi',mittenteId:1,ts:t4,readBy:[1,5,9,12],commentiAbilitati:false,commenti:[],sondaggio:null},
    {id:6,scope:'leva:U6',tipo:'info',titolo:'🎉 Sabato debutto alla Coppa Primavera!',testo:"Sabato la nostra U6 gioca la prima partita della Coppa Primavera! Arrivo ore 09:15. Scarpini, parastinchi e sorrisi 😄 Sarà divertentissimo!",mittente:'Luca Colombo',mittenteId:4,ts:t1,readBy:[1,4,7],commentiAbilitati:true,commenti:[{id:2,userId:7,testo:'Tommy non stava nella pelle ieri sera! 🥳',ts:t1+1_800_000}],sondaggio:null},
    {id:7,scope:'leva:U14',tipo:'urgente',titolo:'⚠️ Quote mensili U14 — scadenza 31 maggio',testo:"Ricordiamo che le quote mensili per U14 scadono il 31 maggio. Pagate tramite app nella sezione Quote. Grazie.",mittente:'Marco Rossi',mittenteId:1,ts:t3,readBy:[1,3,4,8],commentiAbilitati:false,commenti:[],sondaggio:null},
    {id:8,scope:'leva:U18',tipo:'sondaggio',titolo:'📊 Disponibilità trasferta Bergamo',testo:"Confermate la disponibilità per il Torneo Fine Stagione a Bergamo (data da definire).",mittente:'Elena Martini',mittenteId:5,ts:t2,readBy:[1,5,9,11],commentiAbilitati:false,commenti:[],sondaggio:{domanda:'Partecipi alla trasferta di Bergamo?',opzioni:['Sì','No','Devo confermare'],anonimo:false,scadenza:null,chiuso:false,voti:[{userId:1,opzioneIdx:0,nome:'Marco Rossi'},{userId:5,opzioneIdx:0,nome:'Elena Martini'},{userId:9,opzioneIdx:2,nome:'Paolo Bianchi'}]}},
  ];

  // ── Chat messages ─────────────────────────────────────────────
  const chatMessaggi = [
    {id:1, chatId:'allenatori', userId:1, text:'Riunione tecnica venerdì sera alle 20:00? Pianifichiamo le convocazioni di sabato.', ts:t7+3_600_000},
    {id:2, chatId:'allenatori', userId:2, text:'Ok! Ho già selezionato i 12 per U10 💪', ts:t7+7_200_000},
    {id:3, chatId:'allenatori', userId:3, text:'Ci sono. Per U14 ho qualche dubbio su 2 ragazzi, ne parliamo venerdì.', ts:t7+10_800_000},
    {id:4, chatId:'allenatori', userId:5, text:'U18 confermata. Buon lavoro a tutti!', ts:t7+14_400_000},
    {id:5, chatId:'allenatori', userId:1, text:'Ricordo: portare anche il prospetto quote — parecchie pendenti in U14.', ts:t3},
    {id:6, chatId:'leva_U10',  userId:6, text:'Ciao! A che ora si gioca sabato?', ts:t2+3_600_000},
    {id:7, chatId:'leva_U10',  userId:2, text:'Fischio 10:30. Ritrovo 09:45 al Campo Via Larga. Forza Stella! ⚽', ts:t2+7_200_000},
    {id:8, chatId:'leva_U10',  userId:6, text:'Grazie mister! Marco è carichissimo 😄', ts:t2+9_000_000},
    {id:9, chatId:'leva_U10',  userId:2, text:'Convocazioni inviate. Controllate le notifiche nell\'app.', ts:t1},
    {id:10,chatId:'leva_U14',  userId:8, text:'Mister, mio figlio ha un leggero raffreddore — può allenarsi giovedì?', ts:t3+3_600_000},
    {id:11,chatId:'leva_U14',  userId:3, text:'Se non c\'è febbre può venire, valutiamo sul campo. Porta k-way per sicurezza.', ts:t3+7_200_000},
    {id:12,chatId:'leva_U14',  userId:8, text:'Perfetto, grazie Sofia!', ts:t3+9_000_000},
    {id:13,chatId:'leva_U14',  userId:3, text:'Attenzione: ritrovo sabato alle 10:30, non 11:30! Trasferta!', ts:t1+3_600_000},
    {id:14,chatId:'leva_U6',   userId:7, text:"Prima partita di Tommy! Che emozione! 🎉", ts:t1+1_000_000},
    {id:15,chatId:'leva_U6',   userId:4, text:'Sarà bellissimo! Portate le fotocamere — faremo ricordi indimenticabili.', ts:t1+3_600_000},
    {id:16,chatId:'leva_U18',  userId:9, text:'Mister, possiamo sapere la formazione di sabato?', ts:t2+1_000_000},
    {id:17,chatId:'leva_U18',  userId:5, text:'Formazione dopo allenamento venerdì. Concentratevi sul recupero!', ts:t2+5_000_000},
    {id:18,chatId:'amm_6',     userId:6, text:'Buonasera, quando si paga la quota mensile?', ts:t1+2_000_000},
    {id:19,chatId:'amm_6',     userId:1, text:"Le quote scadono il 31 di ogni mese. Puoi pagarle dall'app nella sezione Quote. Grazie!", ts:t1+5_000_000},
  ];

  // ── Users (16) ────────────────────────────────────────────────
  const users = [
    {id:1, nome:'Marco',    cogn:'Rossi',    email:'demo.admin@stellaazzurra.it',     pass:'Demo2025!', role:'admin',      leva:'Tutte', stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999, is_account_owner:true},
    {id:2, nome:'Andrea',   cogn:'Bianchi',  email:'demo.mister@stellaazzurra.it',    pass:'Demo2025!', role:'allenatore', leva:'U10',   stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:3, nome:'Sofia',    cogn:'Ferrari',  email:'mister.u14@stellaazzurra.it',     pass:'Demo2025!', role:'allenatore', leva:'U14',   stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:4, nome:'Luca',     cogn:'Colombo',  email:'mister.u6@stellaazzurra.it',      pass:'Demo2025!', role:'allenatore', leva:'U6',    stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:5, nome:'Elena',    cogn:'Martini',  email:'mister.u18@stellaazzurra.it',     pass:'Demo2025!', role:'allenatore', leva:'U18',   stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:6, nome:'Claudia',  cogn:'Romano',   email:'demo.genitore@stellaazzurra.it',  pass:'Demo2025!', role:'genitore',   leva:'U10',   stato:'attivo', figli:['Marco Ferretti'], figlio:'Marco Ferretti', anno:null, societaId:99999},
    {id:7, nome:'Roberto',  cogn:'Conti',    email:'genitore.u6@stellaazzurra.it',    pass:'Demo2025!', role:'genitore',   leva:'U6',    stato:'attivo', figli:['Daniele Conti'],  figlio:'Daniele Conti',  anno:null, societaId:99999},
    {id:8, nome:'Anna',     cogn:'Ferretti', email:'genitore.u14@stellaazzurra.it',   pass:'Demo2025!', role:'genitore',   leva:'U14',   stato:'attivo', figli:['Luca Marino'],    figlio:'Luca Marino',    anno:null, societaId:99999},
    {id:9, nome:'Paolo',    cogn:'Bianchi',  email:'genitore.u18@stellaazzurra.it',   pass:'Demo2025!', role:'genitore',   leva:'U18',   stato:'attivo', figli:['Alessandro Rossi'],figlio:'Alessandro Rossi',anno:null,societaId:99999},
    {id:10,nome:'Luca',     cogn:'Marino',   email:'demo.giocatore@stellaazzurra.it', pass:'Demo2025!', role:'giocatore',  leva:'U14',   stato:'attivo', figli:[],                 figlio:null,          anno:2011, societaId:99999},
    {id:11,nome:'Alessandro',cogn:'Rossi',   email:'giocatore.u18@stellaazzurra.it',  pass:'Demo2025!', role:'giocatore',  leva:'U18',   stato:'attivo', figli:[],                 figlio:null,          anno:2007, societaId:99999},
    {id:12,nome:'Giorgio',  cogn:'Russo',    email:'dirigente@stellaazzurra.it',      pass:'Demo2025!', role:'dirigente',  leva:'Tutte', stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:13,nome:'Davide',   cogn:'Costa',    email:'assistente.u10@stellaazzurra.it', pass:'Demo2025!', role:'allenatore', leva:'U10',   stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:14,nome:'Simone',   cogn:'Verde',    email:'assistente.u14@stellaazzurra.it', pass:'Demo2025!', role:'allenatore', leva:'U14',   stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:15,nome:'Valentina',cogn:'Neri',     email:'segreteria@stellaazzurra.it',     pass:'Demo2025!', role:'dirigente',  leva:'Tutte', stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
    {id:16,nome:'Federico', cogn:'Mele',     email:'medico@stellaazzurra.it',         pass:'Demo2025!', role:'dirigente',  leva:'Tutte', stato:'attivo', figli:[],                 figlio:null,          anno:null, societaId:99999},
  ]; // 16 utenti ✓

  // ── Quote ─────────────────────────────────────────────────────
  // Schema: { id, playerId, parentUserId, leva, importo, scadenza, nota, stato, pagatoAt, createdBy, createdAt }
  const mEnd  = toYmd(new Date(now + 7  * DAY));   // fine mese ~corrente
  const mPast = toYmd(new Date(now - 25 * DAY));   // mese scorso
  const quotes: any[] = [];
  let qId = 1;

  function addQuotes(levaName: string, importo: number, levaPlayers: any[], parentMap: Record<number,number>) {
    levaPlayers.forEach((p, i) => {
      const n = levaPlayers.length;
      const stato = i < Math.floor(n * 0.60) ? 'pagato' : i < Math.floor(n * 0.90) ? 'attesa' : 'scaduto';
      quotes.push({
        id: qId++, playerId: p.id,
        parentUserId: parentMap[p.id] ?? null,
        leva: levaName, importo,
        scadenza: stato === 'scaduto' ? mPast : mEnd,
        nota: stato === 'scaduto' ? 'Quota scaduta — contattare famiglia' : '',
        stato,
        pagatoAt: stato === 'pagato' ? now - Math.floor(pr(p.id * 3 + 7) * 20) * DAY : null,
        createdBy: 1, createdAt: now - 30 * DAY,
      });
    });
  }

  addQuotes('U10', 60, players.filter(p => p.leva === 'U10'), { 15: 6 });
  addQuotes('U14', 70, players.filter(p => p.leva === 'U14'), { 29: 8 });
  addQuotes('U18', 80, players.filter(p => p.leva === 'U18').slice(0, 10), { 44: 9 });

  // ── Documenti (cert. medici con scadenze miste) ───────────────
  const CERT_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI2YwZjRmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMWEzZjhmIj5DZXJ0aWZpY2F0bzwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzFhM2Y4ZiI+TWVkaWNvPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2Ij5bRGVtb108L3RleHQ+PC9zdmc+';
  const exp1Y  = toYmd(new Date(now + 365 * DAY));
  const exp6M  = toYmd(new Date(now + 180 * DAY));
  const exp3M  = toYmd(new Date(now +  90 * DAY));
  const exp2W  = toYmd(new Date(now +  14 * DAY));   // in scadenza presto
  const expPst = toYmd(new Date(now -  30 * DAY));   // scaduto
  const expPst2= toYmd(new Date(now -   5 * DAY));   // scaduto recentemente
  const exps10 = [exp1Y, exp6M, exp1Y, exp3M, exp1Y, exp6M, exp1Y, exp2W, expPst, expPst2];

  const documenti: any[] = [];
  let docId = 1;

  // U10: cert medici per i primi 10 giocatori (mix scadenze)
  players.filter(p => p.leva === 'U10').slice(0, 10).forEach((p, i) => {
    documenti.push({
      id: docId++, playerId: p.id, tipo: 'cert_medico',
      tipoLabel: 'Certificato medico sportivo',
      nomeFile: `cert_${p.cogn.toLowerCase()}.jpg`,
      data: CERT_SVG, dataScadenza: exps10[i],
      uploadedBy: 2, uploadedAt: now - Math.floor(pr(p.id * 3) * 60) * DAY,
      fileType: 'img',
    });
  });

  // U14: cert medici per i primi 10 giocatori
  players.filter(p => p.leva === 'U14').slice(0, 10).forEach((p, i) => {
    documenti.push({
      id: docId++, playerId: p.id, tipo: 'cert_medico',
      tipoLabel: 'Certificato medico sportivo',
      nomeFile: `cert_${p.cogn.toLowerCase()}.jpg`,
      data: CERT_SVG, dataScadenza: exps10[i],
      uploadedBy: 3, uploadedAt: now - Math.floor(pr(p.id * 5) * 60) * DAY,
      fileType: 'img',
    });
  });

  // U10: moduli di iscrizione per 4 giocatori
  [15, 16, 18, 19].forEach(pid => {
    const p = players.find(x => x.id === pid)!;
    documenti.push({
      id: docId++, playerId: pid, tipo: 'modulo_iscrizione',
      tipoLabel: 'Modulo di iscrizione', nomeFile: `iscrizione_${p.cogn.toLowerCase()}.pdf`,
      data: CERT_SVG, dataScadenza: null,
      uploadedBy: 1, uploadedAt: now - 180 * DAY,
      fileType: 'img',
    });
  });

  // ── Final state object ────────────────────────────────────────
  return {
    USERS_DB: users, nextUserId: 17,
    players, nextPlayerId: 59,
    leve: ['U6', 'U10', 'U14', 'U18'], currentLeva: 'U14',
    events,
    eventTypes: [
      {id:'allenamento', label:'🏃 Allenamento', color:'#047857'},
      {id:'partita',     label:'⚽ Partita',     color:'#1a3f8f'},
      {id:'evento',      label:'🎉 Evento',      color:'#f59e0b'},
      {id:'torneo',      label:'🏆 Torneo',      color:'#e03055'},
    ],
    nextEventId: events.length + 1, nextEventTypeId: 100,
    convocazioni, nextConvocazioneId: convocazioni.length + 1,
    disponibilita: [], nextDisponibilitaId: 1,
    notifiche: [], nextNotificaId: 1,
    inviti: [], codiceSocieta: 'STELLA25',
    pendingUsers: [], nextPendingUserId: 1,
    chatMessaggi, nextChatMsgId: chatMessaggi.length + 1,
    chatLastSeen: {}, torneoChats: {},
    amichevoli: [], nextAmichevoleId: 1,
    campionato,
    nextCampId: 5,
    tornei, nextTorneoId: torneoId, nextFaseId: faseId, nextTornMatchId: tornMatchN,
    comunicazioni, nextComunicazioneId: comunicazioni.length + 1, nextCommentoId: 10,
    mediaItems: [], nextMediaId: 1,
    playerPhotos, squadFotos: {},
    nomeSocieta: 'Stella Azzurra ASD',
    coloriPrimari: '#1a3f8f', coloriAccento: '#FFD700',
    quotes, nextQuoteId: quotes.length + 1,
    quoteSettings: { periodicitaGiorni: 30, scadenzaGiorni: 7 },
    documenti, nextDocId: documenti.length + 1,
    campi: [
      {id:1, nome:'Campo Principale', indirizzo:'Via Larga 12, Milano', superficie:'Erba sintetica', capienza:300, note:'', usageCount:72},
      {id:2, nome:'Campo B',          indirizzo:'Via Roma 5, Milano',   superficie:'Erba sintetica', capienza:200, note:'Lato nord', usageCount:38},
    ],
    nextCampoId: 3,
    indisponibilita: [], nextIndispId: 1,
    levaConvSettings: {}, adminAsMister: {},
    demoResetAt: now + 7 * DAY,
  };
}
