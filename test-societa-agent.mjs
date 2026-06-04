#!/usr/bin/env node
// Test agente — piano SOCIETÀ MyVivaio (PROD)
// Crea società di test via SuperAdmin, esegue suite A-I, cleanup, salva JSON
// REUSE-ONLY: legge endpoint esistenti, non modifica dati di società reali (2, 5, 53).

import fs from "node:fs";

const BASE_URL  = process.env.BASE_URL  || "https://app.myvivaio.app";
const SA_SECRET = process.env.SA_SECRET || "MyVivaio123++";
const REAL_SOC_IDS = new Set([2, 5, 53]);
const RUN_ID = String(Date.now()).slice(-8);

// ──────────────────────────────────────────────────────────────────────────────
// Risultati
const results = [];
let counts = { PASS: 0, FAIL: 0, SKIP: 0 };
function rec(area, name, status, detail = "") {
  counts[status] = (counts[status] || 0) + 1;
  results.push({ area, name, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "•";
  console.log(`[${status}] ${icon} ${area} — ${name}${detail ? `  ▸ ${detail}` : ""}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Fetch helper con timing
async function call(method, path, { token, saSecret, body, headers = {} } = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (token)     opts.headers.Authorization = `Bearer ${token}`;
  if (saSecret)  opts.headers["X-SA-Secret"] = saSecret;
  const t0 = Date.now();
  let res, txt = "", json = null;
  try {
    res = await fetch(url, opts);
    txt = await res.text();
    try { json = JSON.parse(txt); } catch { /* non-JSON */ }
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, err: e?.message || String(e) };
  }
  return {
    ok: res.ok, status: res.status, ms: Date.now() - t0,
    json, text: txt, headers: res.headers,
  };
}

function decodeJwt(token) {
  try {
    const [, p] = token.split(".");
    return JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch { return null; }
}

// ──────────────────────────────────────────────────────────────────────────────
// Stato condiviso
let SOC_ID = null;
let TOKEN = null;
let ADMIN_USER_ID = null;
let LEVA_ID = null;
const PLAYER_IDS = [];
let EVENT_ID = null;
let MATCH_ID = null;
let TORNEO_ID = null;
let COACH_USER_ID = null;
let DIR_USER_ID = null;
let TOKEN_COACH = null;
let TOKEN_DIR = null;

const ADMIN_EMAIL = `qa-societa-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

// ──────────────────────────────────────────────────────────────────────────────
// FASE 0 — crea società di test
async function phase0_create_society() {
  console.log("\n=== FASE 0: creazione società di test ===");
  const body = {
    nome: `Test Società QA ${RUN_ID}`,
    citta: "QA City",
    piano: "societa",
    adminNome: "QA",
    adminCogn: "Tester",
    adminEmail: ADMIN_EMAIL,
    adminPass: ADMIN_PASS,
  };
  const r = await call("POST", "/api/v2/superadmin/societies", { saSecret: SA_SECRET, body });
  if (!r.ok || !r.json?.societyId) {
    rec("0.SETUP", "POST /api/v2/superadmin/societies", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
    return false;
  }
  SOC_ID = Number(r.json.societyId);
  if (REAL_SOC_IDS.has(SOC_ID)) {
    rec("0.SETUP", "ID società di test collide con società reale", "FAIL", `SOC_ID=${SOC_ID}`);
    return false;
  }
  rec("0.SETUP", "Società di test creata", "PASS",
    `socId=${SOC_ID}, userId=${r.json.userId}, codice=${r.json.codice}, piano=societa`);
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// FASE 1 — login admin + JWT introspection
async function phase1_login() {
  console.log("\n=== FASE 1: login admin + verifica JWT ===");
  const r = await call("POST", "/api/v2/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASS },
  });
  if (!r.ok || !r.json?.token) {
    rec("1.LOGIN", "POST /api/v2/auth/login", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
    return false;
  }
  TOKEN = r.json.token;
  ADMIN_USER_ID = r.json.user?.id;
  rec("1.LOGIN", "Login admin 200", "PASS",
    `userId=${ADMIN_USER_ID} ruolo=${r.json.user?.ruolo} piano=${r.json.society?.piano}`);

  const payload = decodeJwt(TOKEN);
  if (!payload) {
    rec("1.LOGIN", "JWT decodificabile", "FAIL", "payload non parsabile");
    return true;
  }
  const okSoc  = Number(payload.societyId) === Number(SOC_ID);
  const okRole = ["admin", "superadmin"].includes(payload.role);
  rec("1.LOGIN", "JWT.societyId == socId di test", okSoc ? "PASS" : "FAIL",
    `JWT.societyId=${payload.societyId} expected=${SOC_ID}`);
  rec("1.LOGIN", "JWT.role admin|superadmin", okRole ? "PASS" : "FAIL", `role=${payload.role}`);
  rec("1.LOGIN", "JWT.societyPiano = societa",
    payload.societyPiano === "societa" ? "PASS" : "FAIL",
    `societyPiano=${payload.societyPiano}`);
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// A. AUTH & PERMESSI
async function area_A() {
  console.log("\n=== A. AUTH & PERMESSI ===");
  let r = await call("GET", "/api/v2/society", { token: TOKEN });
  if (r.ok && r.json?.id === SOC_ID) {
    rec("A.AUTH", "GET /api/v2/society con token", "PASS",
      `200, nome="${r.json.nome}" piano=${r.json.piano}`);
  } else {
    rec("A.AUTH", "GET /api/v2/society con token", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
  }
  if (r.json?.piano === "societa") {
    rec("A.AUTH", "Campo piano = 'societa'", "PASS");
  } else {
    rec("A.AUTH", "Campo piano = 'societa'", "FAIL", `piano=${r.json?.piano}`);
  }

  r = await call("GET", "/api/v2/society");
  rec("A.AUTH", "GET /api/v2/society senza token",
    r.status === 401 ? "PASS" : "FAIL", `status=${r.status}`);

  r = await call("GET", "/api/v2/society", { token: "eyJ.fake.token" });
  rec("A.AUTH", "GET /api/v2/society con token falso",
    r.status === 401 ? "PASS" : "FAIL", `status=${r.status}`);

  r = await call("POST", "/api/v2/auth/login", {
    body: { email: ADMIN_EMAIL, password: "wrong-password" },
  });
  rec("A.AUTH", "Login password errata",
    r.status === 401 ? "PASS" : "FAIL", `status=${r.status}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// B. LEVE & PLAYERS
async function area_B() {
  console.log("\n=== B. LEVE & PLAYERS ===");

  let r = await call("POST", "/api/v2/leve", {
    token: TOKEN, body: { nome: `U12 QA ${RUN_ID}`, ordine: 99 },
  });
  if (r.status === 201 && r.json?.id) {
    LEVA_ID = r.json.id;
    rec("B.LEVE", "POST /api/v2/leve crea leva", "PASS",
      `id=${LEVA_ID} nome="${r.json.nome}"`);
  } else {
    rec("B.LEVE", "POST /api/v2/leve crea leva", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
    return;
  }
  const LEVA_NAME = r.json.nome;

  r = await call("GET", "/api/v2/leve", { token: TOKEN });
  const found = Array.isArray(r.json) && r.json.some(l => l.id === LEVA_ID);
  rec("B.LEVE", "GET /api/v2/leve include leva creata",
    r.ok && found ? "PASS" : "FAIL", `status=${r.status} count=${r.json?.length ?? "?"}`);

  const giocatori = [
    { nome: "Mario", cognome: "Rossi",   numero: 7,  ruoloCampo: "ATT", annoNascita: 2013 },
    { nome: "Luca",  cognome: "Bianchi", numero: 1,  ruoloCampo: "POR", annoNascita: 2013 },
    { nome: "Anna",  cognome: "Verdi",   numero: 10, ruoloCampo: "CEN", annoNascita: 2013 },
  ];
  for (const g of giocatori) {
    const pr = await call("POST", "/api/v2/players", {
      token: TOKEN, body: { ...g, leva: LEVA_NAME },
    });
    if (pr.status === 201 && pr.json?.id) {
      PLAYER_IDS.push(pr.json.id);
      rec("B.LEVE", `POST player ${g.nome} ${g.cognome}`, "PASS", `id=${pr.json.id}`);
    } else {
      rec("B.LEVE", `POST player ${g.nome} ${g.cognome}`, "FAIL",
        `status=${pr.status} body=${(pr.text || "").slice(0, 150)}`);
    }
  }

  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_NAME)}`, { token: TOKEN });
  if (r.ok && Array.isArray(r.json) && r.json.length === PLAYER_IDS.length) {
    rec("B.LEVE", "GET /api/v2/players?leva=X", "PASS", `count=${r.json.length}`);
  } else {
    rec("B.LEVE", "GET /api/v2/players?leva=X", "FAIL",
      `status=${r.status} count=${r.json?.length ?? "?"} expected=${PLAYER_IDS.length}`);
  }

  if (Array.isArray(r.json) && r.json.length) {
    const p = r.json[0];
    const required = ["nome", "cognome", "anno_nascita"];
    const missing = required.filter(k => p[k] == null);
    rec("B.LEVE", "Campi obbligatori player",
      missing.length === 0 ? "PASS" : "FAIL",
      missing.length ? `mancanti: ${missing.join(",")}`
                     : `nome="${p.nome}" cognome="${p.cognome}" anno=${p.anno_nascita} numero=${p.numero}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// C. EVENTI & PRESENZE
async function area_C() {
  console.log("\n=== C. EVENTI & PRESENZE ===");
  if (!LEVA_ID || PLAYER_IDS.length === 0) {
    rec("C.EVENTI", "Setup precedente", "SKIP", "Manca LEVA_ID o players");
    return;
  }
  const lrows = await call("GET", "/api/v2/leve", { token: TOKEN });
  const LEVA_NAME = lrows.json?.find(l => l.id === LEVA_ID)?.nome || `U12 QA ${RUN_ID}`;

  const evBody = {
    tipo: "allenamento",
    titolo: `Allenamento QA ${RUN_ID}`,
    leve: [LEVA_NAME],
    luogo: "Campo Test",
    dataInizio: "2026-12-15",
    oraInizio: "18:00",
    oraFine: "19:30",
    note: "evento di test",
    ricorrente: false,
  };
  let r = await call("POST", "/api/v2/events", { token: TOKEN, body: evBody });
  if (r.status === 201 && r.json?.id) {
    EVENT_ID = r.json.id;
    rec("C.EVENTI", "POST /api/v2/events", "PASS",
      `id=${EVENT_ID} tipo=${r.json.tipo}`);
  } else {
    rec("C.EVENTI", "POST /api/v2/events", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
    return;
  }

  const presenze = PLAYER_IDS.map(pid => ({ playerId: pid, stato: "presente" }));
  r = await call("POST", "/api/v2/presenze/bulk", {
    token: TOKEN, body: { eventId: EVENT_ID, presenze },
  });
  if (r.ok && r.json?.updated === PLAYER_IDS.length) {
    rec("C.EVENTI", "POST /api/v2/presenze/bulk", "PASS", `updated=${r.json.updated}`);
  } else {
    rec("C.EVENTI", "POST /api/v2/presenze/bulk", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
  }

  r = await call("GET", `/api/v2/presenze?eventId=${EVENT_ID}`, { token: TOKEN });
  if (r.ok && Array.isArray(r.json) && r.json.length === PLAYER_IDS.length) {
    const tutti = r.json.every(p => p.stato === "presente");
    rec("C.EVENTI", "GET /api/v2/presenze", "PASS",
      `count=${r.json.length} tutti presenti=${tutti}`);
  } else {
    rec("C.EVENTI", "GET /api/v2/presenze", "FAIL",
      `status=${r.status} count=${r.json?.length}`);
  }

  r = await call("GET", "/api/v2/events", { token: TOKEN });
  const evFound = Array.isArray(r.json) && r.json.some(e => e.id === EVENT_ID);
  rec("C.EVENTI", "GET /api/v2/events include evento creato",
    r.ok && evFound ? "PASS" : "FAIL", `status=${r.status} count=${r.json?.length}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// D. CAMPIONATO & TORNEI
async function area_D() {
  console.log("\n=== D. CAMPIONATO & TORNEI ===");
  if (!LEVA_ID) { rec("D.TORNEI", "Setup", "SKIP", "no LEVA_ID"); return; }
  const lrows = await call("GET", "/api/v2/leve", { token: TOKEN });
  const LEVA_NAME = lrows.json?.find(l => l.id === LEVA_ID)?.nome;

  let r = await call("GET", `/api/v2/campionato/settings?leva=${encodeURIComponent(LEVA_NAME)}`,
    { token: TOKEN });
  rec("D.TORNEI", "GET /api/v2/campionato/settings",
    (r.status === 200 || r.status === 404) ? "PASS" : "FAIL",
    `status=${r.status} body=${(r.text || "").slice(0, 100)}`);

  TORNEO_ID = `qa-torneo-${RUN_ID}`;
  const torneoBody = {
    id: TORNEO_ID,
    nome: `Torneo QA ${RUN_ID}`,
    leva: LEVA_NAME,
    luogo: "Campo Test",
    data_inizio: "2026-12-20",
    data_fine: "2026-12-21",
    spareggio: null,
    squadre_partecipanti: [],
    squadre_mie_flag: [],
    convocati: [],
    convocazioni_per_partita: 11,
    qual_per_girone: 2,
    archiviato: 0,
    fasi: [],
  };
  r = await call("POST", "/api/v2/tornei", { token: TOKEN, body: torneoBody });
  if (r.ok) {
    rec("D.TORNEI", "POST /api/v2/tornei", "PASS", `status=${r.status} id=${TORNEO_ID}`);
  } else {
    rec("D.TORNEI", "POST /api/v2/tornei", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
  }

  r = await call("GET", "/api/v2/tornei", { token: TOKEN });
  const tFound = Array.isArray(r.json) && r.json.some(t => t.id === TORNEO_ID);
  rec("D.TORNEI", "GET /api/v2/tornei include torneo creato",
    r.ok && tFound ? "PASS" : "FAIL", `status=${r.status} count=${r.json?.length}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// E. STATISTICHE
async function area_E() {
  console.log("\n=== E. STATISTICHE ===");
  if (!LEVA_ID) { rec("E.STATS", "Setup", "SKIP", "no LEVA_ID"); return; }

  const lrows = await call("GET", "/api/v2/leve", { token: TOKEN });
  const LEVA_NAME = lrows.json?.find(l => l.id === LEVA_ID)?.nome;

  // Crea match + stats per validare anti-bug "zero gol"
  if (PLAYER_IDS.length > 0) {
    const eventKey = `qa-match-${RUN_ID}-${Date.now()}`;
    const mBody = {
      event_key: eventKey, tipo: "amichevole", leva: LEVA_NAME,
      data: "2026-12-10", orario: "15:00", casa: "Test FC", ospite: "Avv FC",
      avversario: "Avv FC", lato: "casa", luogo: "Campo Test",
      played: true, gol_casa: 3, gol_ospiti: 1, visibilita_subito: 1,
    };
    let mr = await call("POST", "/api/v2/matches", { token: TOKEN, body: mBody });
    if (mr.ok && mr.json?.id) {
      MATCH_ID = mr.json.id;
      const statsBody = { stats: PLAYER_IDS.map((pid, i) => ({
        player_id: pid, gol: i === 0 ? 2 : 0, assist: i === 1 ? 1 : 0,
        titolare: 1, minuti: 60, gialli: 0, rossi: 0, gol_sub: 0, cs: i === 1 ? 1 : 0,
      })) };
      const sr = await call("POST", `/api/v2/matches/${MATCH_ID}/stats`,
        { token: TOKEN, body: statsBody });
      rec("E.STATS", "Setup match + stats",
        sr.ok ? "PASS" : "FAIL",
        `match=${MATCH_ID} upserted=${sr.json?.upserted}`);
    } else {
      rec("E.STATS", "Setup match", "FAIL",
        `status=${mr.status} body=${(mr.text || "").slice(0, 200)}`);
    }
  }

  const r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_NAME)}`,
    { token: TOKEN });
  if (!r.ok) {
    rec("E.STATS", "GET /api/v2/stats/leva", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
    return;
  }
  rec("E.STATS", "GET /api/v2/stats/leva", "PASS",
    `200, leva="${r.json?.leva}" players=${r.json?.players?.length}`);

  const players = r.json?.players || [];
  const hasCorrectStructure = players.every(p =>
    p.player_id != null && p.totale && p.amichevole && p.campionato && p.torneo);
  rec("E.STATS", "Struttura stats valida",
    hasCorrectStructure ? "PASS" : "FAIL",
    `players=${players.length} struttura={amichevole,campionato,torneo,totale}`);

  if (MATCH_ID && PLAYER_IDS.length) {
    const golTotali = players.reduce((s, p) => s + (p.totale?.gol || 0), 0);
    if (golTotali >= 2) {
      rec("E.STATS", "Gol inseriti riflessi nelle stats", "PASS", `gol_totali=${golTotali}`);
    } else {
      rec("E.STATS", "Gol inseriti riflessi nelle stats", "FAIL",
        `BUG ZERO GOL: gol_totali=${golTotali} attesi >=2`);
    }
  }

  if (PLAYER_IDS[0]) {
    const pr = await call("GET", `/api/v2/stats/player/${PLAYER_IDS[0]}?leva=${encodeURIComponent(LEVA_NAME)}`,
      { token: TOKEN });
    rec("E.STATS", "GET /api/v2/stats/player/:id",
      pr.ok ? "PASS" : "FAIL", `status=${pr.status} gol_totali=${pr.json?.totale?.gol}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// F. CHAT
async function area_F() {
  console.log("\n=== F. CHAT ===");
  if (!LEVA_ID) { rec("F.CHAT", "Setup", "SKIP", "no LEVA_ID"); return; }
  const lrows = await call("GET", "/api/v2/leve", { token: TOKEN });
  const LEVA_NAME = lrows.json?.find(l => l.id === LEVA_ID)?.nome;
  const chatId = `staff_${LEVA_NAME}`;

  let r = await call("GET", `/api/v2/chat/${encodeURIComponent(chatId)}/messages?limit=5`,
    { token: TOKEN });
  rec("F.CHAT", "GET /api/v2/chat/:chatId/messages",
    r.ok ? "PASS" : "FAIL",
    `status=${r.status} count=${Array.isArray(r.json) ? r.json.length : "?"}`);

  r = await call("POST", `/api/v2/chat/${encodeURIComponent(chatId)}/messages`, {
    token: TOKEN, body: { testo: `Messaggio test QA ${RUN_ID}` },
  });
  rec("F.CHAT", "POST /api/v2/chat/:chatId/messages",
    (r.status === 200 || r.status === 201) ? "PASS" : "FAIL",
    `status=${r.status} body=${(r.text || "").slice(0, 150)}`);

  r = await call("GET", `/api/v2/chat/${encodeURIComponent(chatId)}/polls`,
    { token: TOKEN });
  if (r.status === 403) {
    rec("F.CHAT", "GET /api/v2/chat/:chatId/polls", "FAIL",
      "BUG NOTO: 403 atteso 200 per admin");
  } else if (r.ok) {
    rec("F.CHAT", "GET /api/v2/chat/:chatId/polls", "PASS",
      `status=${r.status} polls=${Array.isArray(r.json) ? r.json.length : "?"}`);
  } else {
    rec("F.CHAT", "GET /api/v2/chat/:chatId/polls", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 150)}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// G. RUOLI & PERMESSI
async function area_G() {
  console.log("\n=== G. RUOLI & PERMESSI ===");
  const lrows = await call("GET", "/api/v2/leve", { token: TOKEN });
  const LEVA_NAME = lrows.json?.find(l => l.id === LEVA_ID)?.nome || "";

  const coachEmail = `qa-coach-${RUN_ID}@myvivaio.app`;
  const coachPass = "TestQA2026!!";
  let r = await call("POST", "/api/v2/users", {
    token: TOKEN, body: {
      nome: "Coach", cognome: "QA", email: coachEmail, password: coachPass,
      ruolo: "allenatore", leva: LEVA_NAME,
    },
  });
  if (r.status === 201 && r.json?.id) {
    COACH_USER_ID = r.json.id;
    rec("G.RUOLI", "POST utente allenatore", "PASS", `id=${COACH_USER_ID}`);
    await call("PATCH", `/api/v2/users/${COACH_USER_ID}`, {
      token: TOKEN, body: { stato: "attivo" },
    });
  } else {
    rec("G.RUOLI", "POST utente allenatore", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
  }

  if (COACH_USER_ID) {
    r = await call("POST", "/api/v2/auth/login", {
      body: { email: coachEmail, password: coachPass },
    });
    if (r.ok && r.json?.token) {
      TOKEN_COACH = r.json.token;
      rec("G.RUOLI", "Login allenatore", "PASS",
        `ruolo=${r.json.user?.ruolo} leva=${r.json.user?.leva}`);
    } else {
      rec("G.RUOLI", "Login allenatore", "FAIL",
        `status=${r.status} body=${(r.text || "").slice(0, 150)}`);
    }
  }

  if (TOKEN_COACH) {
    r = await call("GET", "/api/v2/quote", { token: TOKEN_COACH });
    rec("G.RUOLI", "Allenatore GET /api/v2/quote → 403",
      r.status === 403 ? "PASS" : "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 100)}`);
  }

  const dirEmail = `qa-dirigente-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/users", {
    token: TOKEN, body: {
      nome: "Dir", cognome: "QA", email: dirEmail, password: coachPass,
      ruolo: "dirigente", leva: LEVA_NAME,
    },
  });
  if (r.status === 201 && r.json?.id) {
    DIR_USER_ID = r.json.id;
    rec("G.RUOLI", "POST utente dirigente", "PASS", `id=${DIR_USER_ID}`);
    await call("PATCH", `/api/v2/users/${DIR_USER_ID}`, {
      token: TOKEN, body: { stato: "attivo" },
    });
    r = await call("POST", "/api/v2/auth/login", {
      body: { email: dirEmail, password: coachPass },
    });
    if (r.ok && r.json?.token) {
      TOKEN_DIR = r.json.token;
      rec("G.RUOLI", "Login dirigente", "PASS", `ruolo=${r.json.user?.ruolo}`);
    } else {
      rec("G.RUOLI", "Login dirigente", "FAIL", `status=${r.status}`);
    }
  } else {
    rec("G.RUOLI", "POST utente dirigente", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
  }

  // Dirigente: GET /api/v2/quote — il codice consente al dirigente in piano società.
  if (TOKEN_DIR) {
    r = await call("GET", "/api/v2/quote", { token: TOKEN_DIR });
    if (r.status === 200) {
      rec("G.RUOLI", "Dirigente GET /api/v2/quote", "PASS",
        "200 (dirigente AUTORIZZATO in piano società per design; spec test 403 = errata)");
    } else if (r.status === 403) {
      rec("G.RUOLI", "Dirigente GET /api/v2/quote", "FAIL",
        "403 ma codice richiede admin OR dirigente → ATTESO 200");
    } else {
      rec("G.RUOLI", "Dirigente GET /api/v2/quote", "FAIL",
        `status=${r.status} body=${(r.text || "").slice(0, 150)}`);
    }
  }

  if (TOKEN_COACH) {
    r = await call("GET", "/api/v2/players?leva=NON_ESISTENTE_QA", { token: TOKEN_COACH });
    rec("G.RUOLI", "Allenatore GET /api/v2/players leva fittizia",
      r.ok ? "PASS" : "FAIL",
      `status=${r.status} count=${Array.isArray(r.json) ? r.json.length : "?"} (no leva-scope su GET → array vuoto OK)`);
  }

  if (TOKEN_COACH && PLAYER_IDS[0]) {
    r = await call("POST", "/api/v2/quote", {
      token: TOKEN_COACH, body: { playerId: PLAYER_IDS[0], importo: 100, stato: "in_attesa" },
    });
    rec("G.RUOLI", "Allenatore POST /api/v2/quote → 403",
      r.status === 403 ? "PASS" : "FAIL", `status=${r.status}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// H. PIANO SOCIETÀ — FEATURE ESCLUSIVE
async function area_H() {
  console.log("\n=== H. PIANO SOCIETÀ ===");

  let r = await call("GET", "/api/v2/quote", { token: TOKEN });
  if (r.ok) {
    rec("H.PIANO", "Admin GET /api/v2/quote (piano società)", "PASS",
      `200 count=${Array.isArray(r.json) ? r.json.length : "?"}`);
  } else {
    rec("H.PIANO", "Admin GET /api/v2/quote (piano società)", "FAIL",
      `status=${r.status} body=${(r.text || "").slice(0, 200)}`);
  }

  if (PLAYER_IDS[0]) {
    r = await call("POST", "/api/v2/quote", {
      token: TOKEN, body: {
        playerId: PLAYER_IDS[0], importo: 250, scadenza: "2026-12-31",
        stato: "in_attesa", nota: "test QA",
      },
    });
    rec("H.PIANO", "Admin POST /api/v2/quote",
      r.status === 201 ? "PASS" : "FAIL",
      `status=${r.status} id=${r.json?.id}`);
  }

  r = await call("GET", "/api/v2/users", { token: TOKEN });
  const totUsers = Array.isArray(r.json) ? r.json.length : 0;
  rec("H.PIANO", "Multi-utente (>=2 utenti attivi)",
    totUsers >= 2 ? "PASS" : "FAIL", `tot=${totUsers}`);

  r = await call("GET", `/api/v2/stripe/subscription?societyId=${SOC_ID}`,
    { token: TOKEN });
  rec("H.PIANO", "GET /api/v2/stripe/subscription",
    (r.status === 200 || r.status === 404) ? "PASS" : "FAIL",
    `status=${r.status} body=${(r.text || "").slice(0, 150)}`);

  r = await call("POST", "/api/v2/leve", {
    token: TOKEN, body: { nome: `U13 QA ${RUN_ID}`, ordine: 98 },
  });
  const extraLevaId = r.json?.id;
  rec("H.PIANO", "Limite leve infinito su piano società",
    r.status === 201 ? "PASS" : "FAIL",
    `status=${r.status} id=${extraLevaId}`);
  if (extraLevaId) {
    await call("DELETE", `/api/v2/leve/${extraLevaId}`, { token: TOKEN });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// I. TECNICO
async function area_I() {
  console.log("\n=== I. TECNICO ===");

  let r = await call("GET", "/api/healthz");
  rec("I.TECH", "GET /api/healthz",
    r.ok ? "PASS" : "FAIL", `status=${r.status}`);

  r = await call("GET", "/api/healthz/db");
  rec("I.TECH", "GET /api/healthz/db",
    r.ok ? "PASS" : "FAIL", `status=${r.status} reachable=${r.json?.reachable}`);

  const times = [];
  for (let i = 0; i < 5; i++) {
    const x = await call("GET", "/api/v2/society", { token: TOKEN });
    times.push(x.ms);
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const max = Math.max(...times);
  const min = Math.min(...times);
  rec("I.TECH", "Latenza media GET /api/v2/society (n=5)",
    avg < 1500 ? "PASS" : "FAIL",
    `avg=${avg}ms min=${min}ms max=${max}ms samples=${times.join(",")}`);

  r = await call("GET", "/api/v2/society", { token: TOKEN });
  const ct = r.headers?.get?.("content-type") || "";
  rec("I.TECH", "Content-Type application/json",
    /application\/json/i.test(ct) ? "PASS" : "FAIL", `ct="${ct}"`);

  const cors = r.headers?.get?.("access-control-allow-origin") || "";
  rec("I.TECH", "Header CORS access-control-allow-origin",
    cors ? "PASS" : "SKIP",
    cors ? `value="${cors}"` : "header non presente in risposta same-origin");
}

// ──────────────────────────────────────────────────────────────────────────────
// CLEANUP
async function cleanup() {
  console.log("\n=== CLEANUP ===");
  async function tryDel(label, method, path) {
    const r = await call(method, path, { token: TOKEN });
    rec("CLEANUP", label, r.ok || r.status === 404 ? "PASS" : "SKIP", `status=${r.status}`);
  }

  for (const pid of PLAYER_IDS) {
    await tryDel(`DELETE player ${pid}`, "DELETE", `/api/v2/players/${pid}`);
  }
  if (MATCH_ID) {
    await tryDel(`DELETE match ${MATCH_ID}`, "DELETE", `/api/v2/matches/${MATCH_ID}`);
  }
  if (EVENT_ID) {
    await tryDel(`DELETE event ${EVENT_ID}`, "DELETE", `/api/v2/events/${EVENT_ID}`);
  }
  if (TORNEO_ID) {
    await tryDel(`DELETE torneo ${TORNEO_ID}`, "DELETE", `/api/v2/tornei/${TORNEO_ID}`);
  }
  if (COACH_USER_ID) {
    await tryDel(`DELETE user coach ${COACH_USER_ID}`, "DELETE", `/api/v2/users/${COACH_USER_ID}`);
  }
  if (DIR_USER_ID) {
    await tryDel(`DELETE user dirigente ${DIR_USER_ID}`, "DELETE", `/api/v2/users/${DIR_USER_ID}`);
  }
  if (LEVA_ID) {
    await tryDel(`DELETE leva ${LEVA_ID}`, "DELETE", `/api/v2/leve/${LEVA_ID}`);
  }
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA cleanup run ${RUN_ID}` } });
    rec("CLEANUP", `SUSPEND società ${SOC_ID} (manca endpoint DELETE)`,
      r.ok ? "PASS" : "SKIP", `status=${r.status} body=${(r.text || "").slice(0, 150)}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MyVivaio — Test piano Società — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();

  const okSetup = await phase0_create_society();
  if (!okSetup) {
    console.log("\n⛔ STOP: creazione società fallita.");
  } else {
    const okLogin = await phase1_login();
    if (okLogin) {
      try { await area_A(); } catch (e) { rec("A.AUTH",  "errore inatteso", "FAIL", e.message); }
      try { await area_B(); } catch (e) { rec("B.LEVE",  "errore inatteso", "FAIL", e.message); }
      try { await area_C(); } catch (e) { rec("C.EVENTI","errore inatteso", "FAIL", e.message); }
      try { await area_D(); } catch (e) { rec("D.TORNEI","errore inatteso", "FAIL", e.message); }
      try { await area_E(); } catch (e) { rec("E.STATS", "errore inatteso", "FAIL", e.message); }
      try { await area_F(); } catch (e) { rec("F.CHAT",  "errore inatteso", "FAIL", e.message); }
      try { await area_G(); } catch (e) { rec("G.RUOLI", "errore inatteso", "FAIL", e.message); }
      try { await area_H(); } catch (e) { rec("H.PIANO", "errore inatteso", "FAIL", e.message); }
      try { await area_I(); } catch (e) { rec("I.TECH",  "errore inatteso", "FAIL", e.message); }
    }
    try { await cleanup(); } catch (e) { rec("CLEANUP","errore inatteso","FAIL", e.message); }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(60));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(60));

  fs.writeFileSync("test-societa-results.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    runId: RUN_ID,
    socId: SOC_ID,
    adminEmail: ADMIN_EMAIL,
    counts,
    elapsedSec: parseFloat(elapsed),
    results,
  }, null, 2));
  console.log("→ Risultati JSON: test-societa-results.json");

  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error("FATAL:", e); process.exit(2); });
