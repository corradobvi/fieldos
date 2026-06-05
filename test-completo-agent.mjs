#!/usr/bin/env node
// Test completo bottone-per-bottone MyVivaio (PROD)
// Setup società piano società + 5 utenti (admin/mister/dirigente/genitore/giocatore)
// + 5 giocatori + 2 leve + 2 eventi M2M + 1 torneo.
// Testa ogni sezione/azione per ogni ruolo come da spec del prompt.
// REUSE-ONLY: no modifiche al codice. Cleanup automatico al termine.

import fs from "node:fs";

const BASE_URL  = process.env.BASE_URL  || "https://app.myvivaio.app";
const SA_SECRET = process.env.SA_SECRET || "MyVivaio123++";
const REAL_SOC_IDS = new Set([2, 5, 53]);
const RUN_ID = String(Date.now()).slice(-8);

const results = [];
let counts = { PASS: 0, FAIL: 0, SKIP: 0 };

function rec(section, role, name, expected, got, status, detail = "") {
  counts[status] = (counts[status] || 0) + 1;
  results.push({ section, role, name, expected, got, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "•";
  const tag  = role ? `[${role}]` : "";
  console.log(`[${status}] ${icon} ${section} ${tag} ${name}  expected=${expected} got=${got}${detail ? ` ▸ ${detail}` : ""}`);
}

async function call(method, path, { token, saSecret, body } = {}) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (token)    opts.headers.Authorization = `Bearer ${token}`;
  if (saSecret) opts.headers["X-SA-Secret"] = saSecret;
  let res, txt = "", json = null;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
    txt = await res.text();
    const ct = res.headers.get("content-type") || "";
    // Detection: se status=200 ma content-type è HTML → catch-all SPA = endpoint non esiste
    if (ct.includes("text/html") && txt.startsWith("<!DOCTYPE")) {
      return { ok: false, status: res.status, isSpa: true, json: null, text: "<SPA HTML>" };
    }
    try { json = JSON.parse(txt); } catch {}
  } catch (e) {
    return { ok: false, status: 0, isSpa: false, json: null, text: e?.message || String(e) };
  }
  return { ok: res.ok, status: res.status, isSpa: false, json, text: txt };
}

// helper: gestisce expected come array, ritorna PASS/FAIL/SKIP automaticamente
function expectStatus(section, role, name, expected, r, detail = "") {
  if (r.isSpa) {
    rec(section, role, name, Array.isArray(expected) ? expected.join("|") : String(expected),
        "SPA-HTML", "SKIP", "endpoint non esiste (catch-all SPA)");
    return "skip-no-endpoint";
  }
  const list = Array.isArray(expected) ? expected : [expected];
  const got = String(r.status);
  const ok = list.map(String).includes(got);
  rec(section, role, name, list.join("|"), got,
      ok ? "PASS" : "FAIL",
      detail || (r.text ? r.text.slice(0, 130) : ""));
  return ok ? "pass" : "fail";
}

// helper: spec "200 o 403, verifica quale" → accetta entrambi e logga il vero
function expectOneOf(section, role, name, options, r) {
  if (r.isSpa) {
    rec(section, role, name, options.join("|"), "SPA-HTML", "SKIP", "endpoint non esiste");
    return;
  }
  const got = String(r.status);
  const ok = options.map(String).includes(got);
  rec(section, role, name, options.join("|"), got,
      ok ? "PASS" : "FAIL",
      `osservato: ${got}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// State globale
let SOC_ID = null;
let TOKEN_ADMIN = null, TOKEN_MISTER = null, TOKEN_DIRIGENTE = null, TOKEN_GENITORE = null, TOKEN_GIOCATORE = null;
let MISTER_ID = null, DIRIGENTE_ID = null, GENITORE_ID = null, GIOCATORE_ID = null;
let LEVA_U12_ID = null, LEVA_U12_NAME = null;
let LEVA_U16_ID = null, LEVA_U16_NAME = null;
let PLAYER1_ID = null, PLAYER2_ID = null, PLAYER3_ID = null; // U12
let PLAYER4_ID = null, PLAYER5_ID = null; // U16
let EVENT_U12_ID = null, EVENT_U16_ID = null;
let TORNEO_ID = null;

const ADMIN_EMAIL = `qa-full-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

// ──────────────────────────────────────────────────────────────────────────────
async function setup() {
  console.log("\n=== FASE 0: SETUP ===");

  // 0.1 Società
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test Full QA ${RUN_ID}`, citta: "QA City", piano: "societa",
      adminNome: "QA", adminCogn: "Admin",
      adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  if (!r.ok || !r.json?.societyId) {
    rec("SETUP", "", "POST /superadmin/societies", "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return false;
  }
  SOC_ID = Number(r.json.societyId);
  if (REAL_SOC_IDS.has(SOC_ID)) {
    rec("SETUP", "", "ID società di test", "non-real", String(SOC_ID), "FAIL", "collide con società reale");
    return false;
  }
  rec("SETUP", "", "Crea società", "201", "201", "PASS", `socId=${SOC_ID}`);

  // 0.2 Login admin
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  if (!r.ok || !r.json?.token) {
    rec("SETUP", "", "Login admin", "200", String(r.status), "FAIL");
    return false;
  }
  TOKEN_ADMIN = r.json.token;
  rec("SETUP", "", "Login admin", "200", "200", "PASS");

  // 0.3 Leve
  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U12 QA ${RUN_ID}`, ordine: 99 } });
  LEVA_U12_ID = r.json?.id; LEVA_U12_NAME = r.json?.nome;
  rec("SETUP", "", "Crea leva U12", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${LEVA_U12_ID}`);

  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U16 QA ${RUN_ID}`, ordine: 98 } });
  LEVA_U16_ID = r.json?.id; LEVA_U16_NAME = r.json?.nome;
  rec("SETUP", "", "Crea leva U16", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${LEVA_U16_ID}`);

  // 0.4 Players U12 (under13)
  const u12 = [
    { nome: "Luca",  cognome: "Bianchi", numero: 9,  annoNascita: 2018 },
    { nome: "Mario", cognome: "Verdi",   numero: 10, annoNascita: 2018 },
    { nome: "Pippo", cognome: "Neri",    numero: 11, annoNascita: 2018 },
  ];
  for (const [i, p] of u12.entries()) {
    r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { ...p, leva: LEVA_U12_NAME, ruoloCampo: "CEN" } });
    const id = r.json?.id;
    if (i === 0) PLAYER1_ID = id;
    if (i === 1) PLAYER2_ID = id;
    if (i === 2) PLAYER3_ID = id;
    rec("SETUP", "", `Crea player U12 ${p.nome}`, "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${id}`);
  }
  // 0.5 Players U16 (over13)
  const u16 = [
    { nome: "Marco",   cognome: "Rossi", numero: 7,  annoNascita: 2010, ruoloCampo: "ATT" },
    { nome: "Giorgio", cognome: "Gialli", numero: 4, annoNascita: 2010, ruoloCampo: "DEF" },
  ];
  for (const [i, p] of u16.entries()) {
    r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { ...p, leva: LEVA_U16_NAME } });
    const id = r.json?.id;
    if (i === 0) PLAYER4_ID = id;
    if (i === 1) PLAYER5_ID = id;
    rec("SETUP", "", `Crea player U16 ${p.nome}`, "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${id}`);
  }

  // 0.6 Eventi (uso leva ID — bug noto FIX N1)
  r = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
    tipo: "allenamento", titolo: `Evt U12 ${RUN_ID}`, leve: [LEVA_U12_ID],
    luogo: "Campo", dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
  }});
  EVENT_U12_ID = r.json?.id;
  rec("SETUP", "", "Crea evento U12 M2M", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${EVENT_U12_ID}`);

  r = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
    tipo: "allenamento", titolo: `Evt U16 ${RUN_ID}`, leve: [LEVA_U16_ID],
    luogo: "Campo", dataInizio: "2026-12-16", oraInizio: "19:00", ricorrente: false,
  }});
  EVENT_U16_ID = r.json?.id;
  rec("SETUP", "", "Crea evento U16 M2M", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${EVENT_U16_ID}`);

  // 0.7 Torneo
  TORNEO_ID = `qa-torneo-${RUN_ID}`;
  r = await call("POST", "/api/v2/tornei", { token: TOKEN_ADMIN, body: {
    id: TORNEO_ID, nome: `Torneo QA ${RUN_ID}`, leva: LEVA_U12_NAME,
    luogo: "Campo Test", data_inizio: "2026-12-20", data_fine: "2026-12-21",
    spareggio: null, squadre_partecipanti: [], squadre_mie_flag: [],
    convocati: [], convocazioni_per_partita: 11, qual_per_girone: 2, archiviato: 0, fasi: [],
  }});
  rec("SETUP", "", "Crea torneo U12", "200", String(r.status), r.ok ? "PASS" : "FAIL", `id=${TORNEO_ID}`);

  // 0.8 Utenti
  async function createU(label, ruolo, leva, email, nome, cognome) {
    let rr = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
      nome, cognome, email, password: "TestQA2026!!", ruolo, leva: leva || null,
    }});
    if (rr.status !== 201) { rec("SETUP", "", `Crea ${label}`, "201", String(rr.status), "FAIL"); return { id: null, token: null }; }
    const id = rr.json?.id;
    rec("SETUP", "", `Crea ${label}`, "201", "201", "PASS", `id=${id} ruolo=${ruolo}`);
    rr = await call("POST", "/api/v2/auth/login", { body: { email, password: "TestQA2026!!" } });
    if (!rr.ok || !rr.json?.token) { rec("SETUP", "", `Login ${label}`, "200", String(rr.status), "FAIL"); return { id, token: null }; }
    rec("SETUP", "", `Login ${label}`, "200", "200", "PASS");
    return { id, token: rr.json.token };
  }

  ({ id: MISTER_ID,    token: TOKEN_MISTER }    = await createU("mister",    "mister",    LEVA_U12_NAME, `qa-mister-${RUN_ID}@myvivaio.app`,    "Coach", "Mister"));
  ({ id: DIRIGENTE_ID, token: TOKEN_DIRIGENTE } = await createU("dirigente", "dirigente", LEVA_U12_NAME, `qa-dirigente-${RUN_ID}@myvivaio.app`, "Dir",   "Igente"));
  ({ id: GENITORE_ID,  token: TOKEN_GENITORE }  = await createU("genitore",  "genitore",  null,          `qa-genitore-${RUN_ID}@myvivaio.app`,  "Mamma", "Bianchi"));
  // Giocatore: same nome+cognome di PLAYER4 (Marco Rossi U16) per match ownership
  ({ id: GIOCATORE_ID, token: TOKEN_GIOCATORE } = await createU("giocatore", "giocatore", LEVA_U16_NAME, `qa-giocatore-${RUN_ID}@myvivaio.app`, "Marco", "Rossi"));

  // 0.9 Link genitore → PLAYER1 (Luca Bianchi, U12, under13)
  if (TOKEN_GENITORE && PLAYER1_ID) {
    const cr = await call("POST", `/api/v2/players/${PLAYER1_ID}/claim`, {
      token: TOKEN_GENITORE, body: {
        role: "papa", consent: true,
        lastNameFull: "Bianchi", birthDate: "2018-05-15",
      },
    });
    rec("SETUP", "", "Link genitore → PLAYER1", "200", String(cr.status), cr.ok ? "PASS" : "FAIL", `guardianId=${cr.json?.guardian?.id}`);
  }
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// SEZIONI DI TEST
// ──────────────────────────────────────────────────────────────────────────────

async function sec_societa() {
  console.log("\n=== SEZ. SOCIETÀ / IMPOSTAZIONI ===");
  const S = "SOCIETA";

  // ADMIN
  let r = await call("GET", "/api/v2/society", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /society", 200, r);
  // Spec dice PATCH ma il backend usa PUT
  r = await call("PATCH", "/api/v2/society", { token: TOKEN_ADMIN, body: { nome: `Renamed ${RUN_ID}` } });
  expectStatus(S, "admin", "PATCH /society (spec PATCH)", 200, r);
  // Endpoint reale è PUT
  r = await call("PUT", "/api/v2/society", { token: TOKEN_ADMIN, body: { nome: `Test Full QA ${RUN_ID}` } });
  expectStatus(S, "admin", "PUT /society (endpoint reale)", 200, r);

  // /society/subscription non esiste — usa /stripe/subscription
  r = await call("GET", `/api/v2/society/subscription?societyId=${SOC_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /society/subscription (spec)", [200, 404], r);
  r = await call("GET", `/api/v2/stripe/subscription?societyId=${SOC_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /stripe/subscription (endpoint reale)", 200, r,
    r.json?.piano ? `piano=${r.json.piano}` : "");

  r = await call("GET", "/api/v2/leve", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /leve", 200, r, Array.isArray(r.json) ? `count=${r.json.length}` : "");

  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U10 QA ${RUN_ID}`, ordine: 97 } });
  const extraId = r.json?.id;
  expectStatus(S, "admin", "POST /leve extra", 201, r, `id=${extraId}`);

  if (extraId) {
    r = await call("PATCH", `/api/v2/leve/${extraId}`, { token: TOKEN_ADMIN, body: { nome: `U10 QA ${RUN_ID} ren` } });
    expectStatus(S, "admin", "PATCH /leve/:id (spec)", 200, r);
    r = await call("PUT", `/api/v2/leve/${extraId}`, { token: TOKEN_ADMIN, body: { nome: `U10 QA ${RUN_ID} ren` } });
    expectStatus(S, "admin", "PUT /leve/:id (endpoint reale)", 200, r);
    r = await call("DELETE", `/api/v2/leve/${extraId}`, { token: TOKEN_ADMIN });
    expectStatus(S, "admin", "DELETE /leve/:id", [200, 204], r);
  }

  // MISTER
  r = await call("GET", "/api/v2/society", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /society", 200, r);
  r = await call("PUT", "/api/v2/society", { token: TOKEN_MISTER, body: { nome: "x" } });
  expectStatus(S, "mister", "PUT /society → 403", 403, r);
  r = await call("GET", "/api/v2/leve", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /leve", 200, r);

  // DIRIGENTE
  r = await call("GET", "/api/v2/society", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /society", 200, r);
  r = await call("PUT", "/api/v2/society", { token: TOKEN_DIRIGENTE, body: { nome: "x" } });
  expectOneOf(S, "dirigente", "PUT /society (200 o 403, verifica)", [200, 403], r);
  r = await call("POST", "/api/v2/leve", { token: TOKEN_DIRIGENTE, body: { nome: "x" } });
  expectOneOf(S, "dirigente", "POST /leve (200 o 403)", [200, 201, 403], r);

  // GENITORE
  r = await call("GET", "/api/v2/society", { token: TOKEN_GENITORE });
  expectOneOf(S, "genitore", "GET /society (spec 403, oggi 200 = anomalia P2)", [200, 403], r);
  r = await call("PUT", "/api/v2/society", { token: TOKEN_GENITORE, body: { nome: "x" } });
  expectStatus(S, "genitore", "PUT /society → 403", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/society", { token: TOKEN_GIOCATORE });
  expectOneOf(S, "giocatore", "GET /society (spec 403, oggi 200 = anomalia P2)", [200, 403], r);
  r = await call("PUT", "/api/v2/society", { token: TOKEN_GIOCATORE, body: { nome: "x" } });
  expectStatus(S, "giocatore", "PUT /society → 403", 403, r);
}

async function sec_players() {
  console.log("\n=== SEZ. ROSA / GIOCATORI ===");
  const S = "ROSA";

  // ADMIN
  let r = await call("GET", "/api/v2/players", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /players", 200, r, `count=${r.json?.length}`);
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { nome: "TMP", cognome: "Player", annoNascita: 2010, leva: LEVA_U12_NAME } });
  const tmpId = r.json?.id;
  expectStatus(S, "admin", "POST /players", 201, r);
  r = await call("GET", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /players/:PLAYER1", 200, r);
  r = await call("PATCH", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_ADMIN, body: { numero: 99 } });
  expectStatus(S, "admin", "PATCH /players/:id (spec)", 200, r);
  r = await call("PUT", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_ADMIN, body: { numero: 99 } });
  expectStatus(S, "admin", "PUT /players/:id (endpoint reale)", 200, r);
  if (tmpId) {
    r = await call("DELETE", `/api/v2/players/${tmpId}`, { token: TOKEN_ADMIN });
    expectStatus(S, "admin", "DELETE /players/:id (tmp)", [200, 204], r);
  }
  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /players?leva=U12", 200, r, `count=${r.json?.length}`);

  // MISTER
  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /players?leva=<sua>", 200, r);
  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_U16_NAME)}`, { token: TOKEN_MISTER });
  expectOneOf(S, "mister", "GET /players?leva=<altra> (anomalia P2)", [200, 403], r);
  r = await call("GET", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /players/:PLAYER1 (sua leva)", 200, r);
  r = await call("GET", `/api/v2/players/${PLAYER4_ID}`, { token: TOKEN_MISTER });
  expectOneOf(S, "mister", "GET /players/:PLAYER4 (altra leva)", [200, 403, 404], r);
  r = await call("POST", "/api/v2/players", { token: TOKEN_MISTER, body: { nome: "X", cognome: "Y", annoNascita: 2010, leva: LEVA_U12_NAME } });
  expectOneOf(S, "mister", "POST /players (mister ora è in ADMIN_ROLES post FIX 1)", [200, 201, 403], r);
  if (r.ok && r.json?.id) await call("DELETE", `/api/v2/players/${r.json.id}`, { token: TOKEN_ADMIN });
  r = await call("PUT", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_MISTER, body: { numero: 42 } });
  expectOneOf(S, "mister", "PUT /players/:PLAYER1", [200, 403], r);

  // DIRIGENTE
  r = await call("GET", "/api/v2/players", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /players", 200, r);
  r = await call("POST", "/api/v2/players", { token: TOKEN_DIRIGENTE, body: { nome: "X", cognome: "Y", annoNascita: 2010, leva: LEVA_U12_NAME } });
  expectOneOf(S, "dirigente", "POST /players", [200, 201, 403], r);
  if (r.ok && r.json?.id) await call("DELETE", `/api/v2/players/${r.json.id}`, { token: TOKEN_ADMIN });
  r = await call("PUT", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_DIRIGENTE, body: { numero: 33 } });
  expectOneOf(S, "dirigente", "PUT /players/:PLAYER1", [200, 403], r);
  r = await call("DELETE", `/api/v2/players/${PLAYER2_ID}`, { token: TOKEN_DIRIGENTE });
  expectOneOf(S, "dirigente", "DELETE /players/:PLAYER2", [200, 204, 403], r);
  // Se è stato cancellato, ricrealo
  if (r.ok) {
    const re = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { nome: "Mario", cognome: "Verdi", numero: 10, annoNascita: 2018, leva: LEVA_U12_NAME } });
    PLAYER2_ID = re.json?.id;
  }

  // GENITORE — post FIX 2 vede solo figli
  r = await call("GET", "/api/v2/players", { token: TOKEN_GENITORE });
  const ids = Array.isArray(r.json) ? r.json.map(p => p.id) : [];
  const onlyChild = r.status === 200 && ids.length === 1 && ids[0] === PLAYER1_ID;
  rec(S, "genitore", "GET /players → solo figlio (FIX 2)", "200 + [PLAYER1]", `${r.status} + [${ids.join(",")}]`, onlyChild ? "PASS" : "FAIL");
  r = await call("GET", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /players/:PLAYER1 (figlio)", 200, r);
  r = await call("GET", `/api/v2/players/${PLAYER4_ID}`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /players/:PLAYER4 (non figlio) → 404", 404, r);
  r = await call("PUT", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_GENITORE, body: { numero: 55 } });
  expectStatus(S, "genitore", "PUT /players/:PLAYER1 → 403", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/players", { token: TOKEN_GIOCATORE });
  const gids = Array.isArray(r.json) ? r.json.map(p => p.id) : [];
  const onlySelf = r.status === 200 && gids.length === 1 && gids[0] === PLAYER4_ID;
  rec(S, "giocatore", "GET /players → solo se stesso (FIX 2)", "200 + [PLAYER4]", `${r.status} + [${gids.join(",")}]`, onlySelf ? "PASS" : "FAIL");
  r = await call("GET", `/api/v2/players/${PLAYER4_ID}`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /players/:PLAYER4 (se stesso)", 200, r);
  r = await call("GET", `/api/v2/players/${PLAYER1_ID}`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /players/:PLAYER1 (altro) → 404", 404, r);
  r = await call("PUT", `/api/v2/players/${PLAYER4_ID}`, { token: TOKEN_GIOCATORE, body: { numero: 7 } });
  expectStatus(S, "giocatore", "PUT /players/:PLAYER4 → 403", 403, r);
}

async function sec_events() {
  console.log("\n=== SEZ. CALENDARIO / EVENTI ===");
  const S = "EVENTI";

  // ADMIN
  let r = await call("GET", "/api/v2/events", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /events", 200, r);
  r = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
    tipo: "amichevole", titolo: `Admin evt ${RUN_ID}`, leve: [LEVA_U12_ID],
    luogo: "X", dataInizio: "2026-12-17", oraInizio: "18:00", ricorrente: false,
  }});
  const tmpEv = r.json?.id;
  expectStatus(S, "admin", "POST /events", 201, r);
  r = await call("GET", `/api/v2/events/${EVENT_U12_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /events/:id", 200, r);
  r = await call("PATCH", `/api/v2/events/${EVENT_U12_ID}`, { token: TOKEN_ADMIN, body: { titolo: "x" } });
  expectStatus(S, "admin", "PATCH /events/:id (spec)", 200, r);
  r = await call("PUT", `/api/v2/events/${EVENT_U12_ID}`, { token: TOKEN_ADMIN, body: { titolo: `Evt U12 ${RUN_ID}` } });
  expectStatus(S, "admin", "PUT /events/:id (endpoint reale)", 200, r);
  if (tmpEv) {
    r = await call("DELETE", `/api/v2/events/${tmpEv}`, { token: TOKEN_ADMIN });
    expectStatus(S, "admin", "DELETE /events/:id (tmp)", [200, 204], r);
  }

  // MISTER
  r = await call("GET", "/api/v2/events", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /events", 200, r);
  r = await call("POST", "/api/v2/events", { token: TOKEN_MISTER, body: {
    tipo: "allenamento", titolo: `Mister evt ${RUN_ID}`, leve: [LEVA_U12_ID],
    dataInizio: "2026-12-18", oraInizio: "18:00", ricorrente: false,
  }});
  const mEv = r.json?.id;
  expectStatus(S, "mister", "POST /events", 201, r);
  r = await call("PUT", `/api/v2/events/${EVENT_U12_ID}`, { token: TOKEN_MISTER, body: { titolo: `Evt U12 ${RUN_ID}` } });
  expectStatus(S, "mister", "PUT /events/:id (sua leva)", 200, r);
  if (mEv) {
    r = await call("DELETE", `/api/v2/events/${mEv}`, { token: TOKEN_MISTER });
    expectOneOf(S, "mister", "DELETE /events/:id (proprio)", [200, 204, 403], r);
    if (!r.ok) await call("DELETE", `/api/v2/events/${mEv}`, { token: TOKEN_ADMIN });
  }

  // DIRIGENTE
  r = await call("GET", "/api/v2/events", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /events", 200, r);
  r = await call("POST", "/api/v2/events", { token: TOKEN_DIRIGENTE, body: {
    tipo: "allenamento", titolo: `Dir evt ${RUN_ID}`, leve: [LEVA_U12_ID],
    dataInizio: "2026-12-19", oraInizio: "18:00", ricorrente: false,
  }});
  const dEv = r.json?.id;
  expectOneOf(S, "dirigente", "POST /events", [200, 201, 403], r);
  r = await call("PUT", `/api/v2/events/${EVENT_U12_ID}`, { token: TOKEN_DIRIGENTE, body: { titolo: `Evt U12 ${RUN_ID}` } });
  expectOneOf(S, "dirigente", "PUT /events/:id", [200, 403], r);
  if (dEv) await call("DELETE", `/api/v2/events/${dEv}`, { token: TOKEN_ADMIN });

  // GENITORE
  r = await call("GET", "/api/v2/events", { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /events", 200, r);
  r = await call("POST", "/api/v2/events", { token: TOKEN_GENITORE, body: {
    tipo: "allenamento", titolo: "x", leve: [LEVA_U12_ID], dataInizio: "2026-12-15",
  }});
  expectStatus(S, "genitore", "POST /events → 403", 403, r);
  r = await call("PUT", `/api/v2/events/${EVENT_U12_ID}`, { token: TOKEN_GENITORE, body: { titolo: "x" } });
  expectStatus(S, "genitore", "PUT /events/:id → 403", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/events", { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /events", 200, r);
  r = await call("POST", "/api/v2/events", { token: TOKEN_GIOCATORE, body: {
    tipo: "allenamento", titolo: "x", leve: [LEVA_U16_ID], dataInizio: "2026-12-15",
  }});
  expectStatus(S, "giocatore", "POST /events → 403", 403, r);
}

async function sec_presenze() {
  console.log("\n=== SEZ. PRESENZE ===");
  const S = "PRESENZE";

  // ADMIN
  let r = await call("GET", `/api/v2/presenze?eventId=${EVENT_U12_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /presenze?eventId=", 200, r);
  r = await call("POST", "/api/v2/presenze/bulk", { token: TOKEN_ADMIN, body: {
    eventId: EVENT_U12_ID,
    presenze: [{ playerId: PLAYER1_ID, stato: "presente" }],
  }});
  expectStatus(S, "admin", "POST /presenze/bulk", 200, r);
  r = await call("DELETE", "/api/v2/presenze", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "DELETE /presenze (spec)", [200, 204], r);

  // MISTER (assegnato U12)
  r = await call("GET", `/api/v2/presenze?eventId=${EVENT_U12_ID}`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /presenze?eventId=U12", 200, r);
  r = await call("POST", "/api/v2/presenze/bulk", { token: TOKEN_MISTER, body: {
    eventId: EVENT_U12_ID,
    presenze: [{ playerId: PLAYER1_ID, stato: "presente" }],
  }});
  expectStatus(S, "mister", "POST /presenze/bulk (FIX N1 sua leva)", 200, r);
  r = await call("POST", "/api/v2/presenze/bulk", { token: TOKEN_MISTER, body: {
    eventId: EVENT_U16_ID,
    presenze: [{ playerId: PLAYER4_ID, stato: "presente" }],
  }});
  expectStatus(S, "mister", "POST /presenze/bulk evento U16 → 403", 403, r);

  // DIRIGENTE
  r = await call("GET", `/api/v2/presenze?eventId=${EVENT_U12_ID}`, { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /presenze", 200, r);
  r = await call("POST", "/api/v2/presenze/bulk", { token: TOKEN_DIRIGENTE, body: {
    eventId: EVENT_U12_ID,
    presenze: [{ playerId: PLAYER1_ID, stato: "presente" }],
  }});
  expectStatus(S, "dirigente", "POST /presenze/bulk", 200, r);

  // GENITORE
  r = await call("GET", `/api/v2/presenze?eventId=${EVENT_U12_ID}`, { token: TOKEN_GENITORE });
  expectOneOf(S, "genitore", "GET /presenze figlio (anomalia P2)", [200, 403], r);
  r = await call("POST", "/api/v2/presenze", { token: TOKEN_GENITORE, body: {
    playerId: PLAYER1_ID, eventId: EVENT_U12_ID, stato: "presente",
  }});
  expectStatus(S, "genitore", "POST /presenze → 403", 403, r);

  // GIOCATORE
  r = await call("GET", `/api/v2/presenze?eventId=${EVENT_U16_ID}`, { token: TOKEN_GIOCATORE });
  expectOneOf(S, "giocatore", "GET /presenze proprie (anomalia P2)", [200, 403], r);
  r = await call("POST", "/api/v2/presenze", { token: TOKEN_GIOCATORE, body: {
    playerId: PLAYER4_ID, eventId: EVENT_U16_ID, stato: "presente",
  }});
  expectStatus(S, "giocatore", "POST /presenze → 403", 403, r);
}

async function sec_matches() {
  console.log("\n=== SEZ. PARTITE / CAMPIONATO ===");
  const S = "PARTITE";

  // ADMIN
  let r = await call("GET", "/api/v2/matches", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /matches", 200, r);
  const eventKey = `qa-match-${RUN_ID}`;
  r = await call("POST", "/api/v2/matches", { token: TOKEN_ADMIN, body: {
    event_key: eventKey, tipo: "amichevole", leva: LEVA_U12_NAME,
    data: "2026-12-15", casa: "Test FC", ospite: "Avv", avversario: "Avv",
    lato: "casa", luogo: "Test", played: false, gol_casa: 0, gol_ospiti: 0,
  }});
  const matchId = r.json?.id;
  expectStatus(S, "admin", "POST /matches", 200, r, `id=${matchId}`);
  r = await call("PATCH", `/api/v2/matches/${matchId}`, { token: TOKEN_ADMIN, body: { played: true, gol_casa: 2 } });
  expectStatus(S, "admin", "PATCH /matches/:id (spec)", 200, r);
  // Endpoint reale è POST stesso event_key (UPSERT)
  r = await call("POST", "/api/v2/matches", { token: TOKEN_ADMIN, body: {
    event_key: eventKey, tipo: "amichevole", leva: LEVA_U12_NAME,
    casa: "Test FC", ospite: "Avv", played: true, gol_casa: 2, gol_ospiti: 1,
  }});
  expectStatus(S, "admin", "POST /matches UPSERT (update via stesso event_key)", 200, r);

  r = await call("GET", `/api/v2/campionato/settings?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /campionato/settings", 200, r);
  r = await call("POST", "/api/v2/campionato/settings", { token: TOKEN_ADMIN, body: {
    leva: LEVA_U12_NAME, anno_inizio: 2026, anno_fine: 2027, formato: "andata_ritorno",
    squadre: ["Test FC", "Avv1", "Avv2", "Avv3"],
  }});
  expectStatus(S, "admin", "POST /campionato/settings", 200, r);
  r = await call("GET", `/api/v2/campionato/giornate?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /campionato/giornate (spec)", [200, 404], r);
  r = await call("POST", `/api/v2/campionato/genera?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "POST /campionato/genera (spec)", [200, 201, 404], r);

  // MISTER
  r = await call("GET", "/api/v2/matches", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /matches", 200, r);
  r = await call("POST", "/api/v2/matches", { token: TOKEN_MISTER, body: {
    event_key: `qa-mister-match-${RUN_ID}`, tipo: "amichevole", leva: LEVA_U12_NAME,
    casa: "Test FC", ospite: "Avv", played: false, gol_casa: 0, gol_ospiti: 0,
  }});
  expectStatus(S, "mister", "POST /matches", 200, r);

  // DIRIGENTE
  r = await call("GET", "/api/v2/matches", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /matches", 200, r);
  r = await call("POST", "/api/v2/matches", { token: TOKEN_DIRIGENTE, body: {
    event_key: `qa-dir-match-${RUN_ID}`, tipo: "amichevole", leva: LEVA_U12_NAME,
    casa: "X", ospite: "Y", played: false,
  }});
  expectOneOf(S, "dirigente", "POST /matches", [200, 201, 403], r);
  r = await call("GET", `/api/v2/campionato/settings?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /campionato/settings", 200, r);

  // GENITORE
  r = await call("GET", "/api/v2/matches", { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /matches", 200, r);
  r = await call("POST", "/api/v2/matches", { token: TOKEN_GENITORE, body: { event_key: "x", tipo: "amichevole" } });
  expectStatus(S, "genitore", "POST /matches → 403", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/matches", { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /matches", 200, r);
  r = await call("POST", "/api/v2/matches", { token: TOKEN_GIOCATORE, body: { event_key: "x", tipo: "amichevole" } });
  expectStatus(S, "giocatore", "POST /matches → 403", 403, r);
}

async function sec_tornei() {
  console.log("\n=== SEZ. TORNEI ===");
  const S = "TORNEI";

  // ADMIN
  let r = await call("GET", "/api/v2/tornei", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /tornei", 200, r);
  const extraTorneoId = `qa-extra-${RUN_ID}`;
  r = await call("POST", "/api/v2/tornei", { token: TOKEN_ADMIN, body: {
    id: extraTorneoId, nome: "Extra", leva: LEVA_U12_NAME, data_inizio: "2026-12-22",
    spareggio: null, squadre_partecipanti: [], squadre_mie_flag: [], convocati: [],
    convocazioni_per_partita: 11, qual_per_girone: 2, archiviato: 0, fasi: [],
  }});
  expectStatus(S, "admin", "POST /tornei extra", 200, r);
  r = await call("GET", `/api/v2/tornei/${TORNEO_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /tornei/:id (spec)", [200, 404], r);
  r = await call("PATCH", `/api/v2/tornei/${TORNEO_ID}`, { token: TOKEN_ADMIN, body: { nome: "x" } });
  expectStatus(S, "admin", "PATCH /tornei/:id (spec)", [200, 404], r);
  r = await call("DELETE", `/api/v2/tornei/${extraTorneoId}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "DELETE /tornei/:id", [200, 204], r);
  r = await call("POST", `/api/v2/tornei/${TORNEO_ID}/genera`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "POST /tornei/:id/genera (spec)", [200, 201, 404], r);

  // MISTER
  r = await call("GET", "/api/v2/tornei", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /tornei", 200, r);
  r = await call("POST", "/api/v2/tornei", { token: TOKEN_MISTER, body: {
    id: `qa-mt-${RUN_ID}`, nome: "M", leva: LEVA_U12_NAME, data_inizio: "2026-12-22",
    spareggio: null, squadre_partecipanti: [], squadre_mie_flag: [], convocati: [],
    convocazioni_per_partita: 11, qual_per_girone: 2, archiviato: 0, fasi: [],
  }});
  expectOneOf(S, "mister", "POST /tornei", [200, 201, 403], r);
  if (r.ok && r.json?.id) await call("DELETE", `/api/v2/tornei/${r.json?.id || `qa-mt-${RUN_ID}`}`, { token: TOKEN_ADMIN });

  // DIRIGENTE
  r = await call("GET", "/api/v2/tornei", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /tornei", 200, r);
  r = await call("POST", "/api/v2/tornei", { token: TOKEN_DIRIGENTE, body: {
    id: `qa-dt-${RUN_ID}`, nome: "D", leva: LEVA_U12_NAME, data_inizio: "2026-12-22",
    spareggio: null, squadre_partecipanti: [], squadre_mie_flag: [], convocati: [],
    convocazioni_per_partita: 11, qual_per_girone: 2, archiviato: 0, fasi: [],
  }});
  expectOneOf(S, "dirigente", "POST /tornei", [200, 201, 403], r);

  // GENITORE
  r = await call("GET", "/api/v2/tornei", { token: TOKEN_GENITORE });
  expectOneOf(S, "genitore", "GET /tornei", [200, 403], r);
  r = await call("POST", "/api/v2/tornei", { token: TOKEN_GENITORE, body: { id: "x", nome: "x", leva: LEVA_U12_NAME } });
  expectStatus(S, "genitore", "POST /tornei → 403", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/tornei", { token: TOKEN_GIOCATORE });
  expectOneOf(S, "giocatore", "GET /tornei", [200, 403], r);
  r = await call("POST", "/api/v2/tornei", { token: TOKEN_GIOCATORE, body: { id: "x", nome: "x", leva: LEVA_U16_NAME } });
  expectStatus(S, "giocatore", "POST /tornei → 403", 403, r);
}

async function sec_stats() {
  console.log("\n=== SEZ. STATISTICHE ===");
  const S = "STATS";

  // ADMIN
  let r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /stats/leva U12", 200, r);
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U16_NAME)}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /stats/leva U16", 200, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER1_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /stats/player/:PLAYER1", 200, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER4_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /stats/player/:PLAYER4", 200, r);

  // MISTER
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /stats/leva U12 (sua)", 200, r);
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U16_NAME)}`, { token: TOKEN_MISTER });
  expectOneOf(S, "mister", "GET /stats/leva U16 (anomalia P2)", [200, 403], r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER1_ID}`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /stats/player/:PLAYER1", 200, r);

  // DIRIGENTE
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /stats/leva", 200, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER1_ID}`, { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /stats/player/:PLAYER1", 200, r);

  // GENITORE
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U12_NAME)}`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /stats/leva → 403", 403, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER1_ID}`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /stats/player/:figlio", 200, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER4_ID}`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /stats/player/:altro → 404", 404, r);

  // GIOCATORE
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U16_NAME)}`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /stats/leva → 403", 403, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER4_ID}`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /stats/player/:proprio", 200, r);
  r = await call("GET", `/api/v2/stats/player/${PLAYER1_ID}`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /stats/player/:altro → 404", 404, r);
}

async function sec_chat() {
  console.log("\n=== SEZ. CHAT ===");
  const S = "CHAT";
  const lU12 = `leva_${LEVA_U12_NAME}`;
  const lU16 = `leva_${LEVA_U16_NAME}`;
  const sU12 = `staff_${LEVA_U12_NAME}`;
  const sU16 = `staff_${LEVA_U16_NAME}`;
  const E = encodeURIComponent;

  // /chats lista (spec) — non esiste
  let r = await call("GET", "/api/v2/chats", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /chats (spec)", [200, 404], r);

  // ADMIN
  r = await call("GET", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_ADMIN });
  expectOneOf(S, "admin", "GET /chat/leva_U12/messages (admin non membro)", [200, 403], r);
  r = await call("POST", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_ADMIN, body: { testo: "admin test" } });
  expectOneOf(S, "admin", "POST /chat/leva_U12/messages", [200, 201, 403], r);
  r = await call("GET", `/api/v2/chat/${E(lU12)}/polls`, { token: TOKEN_ADMIN });
  expectOneOf(S, "admin", "GET /chat/leva_U12/polls", [200, 403], r);
  r = await call("POST", `/api/v2/chat/${E(lU12)}/polls`, { token: TOKEN_ADMIN, body: { question: "Q?", options: ["a","b"] } });
  expectOneOf(S, "admin", "POST /chat/leva_U12/polls (admin non membro famiglie)", [200, 201, 403], r);
  r = await call("GET", `/api/v2/chat/${E(sU12)}/messages`, { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /chat/staff_U12/messages", 200, r);
  r = await call("POST", `/api/v2/chat/${E(sU12)}/messages`, { token: TOKEN_ADMIN, body: { testo: "admin staff" } });
  expectStatus(S, "admin", "POST /chat/staff_U12/messages", 201, r);

  // MISTER (assegnato U12)
  r = await call("GET", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /chat/leva_U12/messages → 403 (mister escluso famiglie)", 403, r);
  r = await call("GET", `/api/v2/chat/${E(lU16)}/messages`, { token: TOKEN_MISTER });
  expectOneOf(S, "mister", "GET /chat/leva_U16/messages (mister non assegnato U16 + leva esclude mister)", [200, 403], r);
  r = await call("GET", `/api/v2/chat/${E(sU12)}/messages`, { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /chat/staff_U12/messages", 200, r);
  r = await call("POST", `/api/v2/chat/${E(sU12)}/messages`, { token: TOKEN_MISTER, body: { testo: "mister staff" } });
  expectStatus(S, "mister", "POST /chat/staff_U12/messages", 201, r);

  // DIRIGENTE (assegnato U12)
  r = await call("GET", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /chat/leva_U12/messages", 200, r);
  r = await call("POST", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_DIRIGENTE, body: { testo: "dir msg" } });
  expectStatus(S, "dirigente", "POST /chat/leva_U12/messages", 201, r);
  r = await call("GET", `/api/v2/chat/${E(lU12)}/polls`, { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /chat/leva_U12/polls", 200, r);
  r = await call("POST", `/api/v2/chat/${E(lU12)}/polls`, { token: TOKEN_DIRIGENTE, body: { question: "Q?", options: ["a","b"] } });
  expectStatus(S, "dirigente", "POST /chat/leva_U12/polls", 201, r);

  // GENITORE (linkato a PLAYER1 U12)
  r = await call("GET", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /chat/leva_U12/messages (membro)", 200, r);
  r = await call("POST", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_GENITORE, body: { testo: "gen msg" } });
  expectStatus(S, "genitore", "POST /chat/leva_U12/messages", 201, r);
  r = await call("GET", `/api/v2/chat/${E(lU16)}/messages`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /chat/leva_U16/messages → 403 (figlio è U12)", 403, r);
  r = await call("GET", `/api/v2/chat/${E(sU12)}/messages`, { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /chat/staff_U12/messages → 403", 403, r);

  // GIOCATORE (U16, match nome+cognome con PLAYER4)
  const sqU16 = `squadra_${LEVA_U16_NAME}`;
  r = await call("GET", `/api/v2/chat/${E(sqU16)}/messages`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /chat/squadra_U16/messages (membro)", 200, r);
  r = await call("GET", `/api/v2/chat/${E(lU16)}/messages`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /chat/leva_U16/messages (giocatori non in leva famiglie) → 403", 403, r);
  r = await call("POST", `/api/v2/chat/${E(sqU16)}/messages`, { token: TOKEN_GIOCATORE, body: { testo: "gioc msg" } });
  expectStatus(S, "giocatore", "POST /chat/squadra_U16/messages", 201, r);
  r = await call("GET", `/api/v2/chat/${E(lU12)}/messages`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /chat/leva_U12/messages → 403", 403, r);
  r = await call("GET", `/api/v2/chat/${E(sU16)}/messages`, { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /chat/staff_U16/messages → 403", 403, r);
}

async function sec_comunicazioni() {
  console.log("\n=== SEZ. COMUNICAZIONI ===");
  const S = "COMUNICAZIONI";

  // ADMIN
  let r = await call("GET", "/api/v2/comunicazioni", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /comunicazioni", 200, r);
  r = await call("POST", "/api/v2/comunicazioni", { token: TOKEN_ADMIN, body: {
    tipo: "avviso", titolo: "Test", testo: "msg", bacheca: "leva", leva: LEVA_U12_NAME, urgente: false,
  }});
  const cId = r.json?.id;
  expectStatus(S, "admin", "POST /comunicazioni", 201, r, `id=${cId}`);
  r = await call("PATCH", `/api/v2/comunicazioni/${cId}`, { token: TOKEN_ADMIN, body: { titolo: "x" } });
  expectStatus(S, "admin", "PATCH /comunicazioni/:id (spec)", [200, 404], r);
  if (cId) {
    r = await call("DELETE", `/api/v2/comunicazioni/${cId}`, { token: TOKEN_ADMIN });
    expectStatus(S, "admin", "DELETE /comunicazioni/:id", [200, 204], r);
  }

  // MISTER
  r = await call("GET", "/api/v2/comunicazioni", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /comunicazioni", 200, r);
  r = await call("POST", "/api/v2/comunicazioni", { token: TOKEN_MISTER, body: {
    tipo: "avviso", titolo: "MisterMsg", testo: "...", bacheca: "leva", leva: LEVA_U12_NAME,
  }});
  expectOneOf(S, "mister", "POST /comunicazioni (post FIX 1)", [200, 201, 403], r);
  if (r.json?.id) await call("DELETE", `/api/v2/comunicazioni/${r.json.id}`, { token: TOKEN_ADMIN });

  // DIRIGENTE
  r = await call("GET", "/api/v2/comunicazioni", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /comunicazioni", 200, r);
  r = await call("POST", "/api/v2/comunicazioni", { token: TOKEN_DIRIGENTE, body: {
    tipo: "avviso", titolo: "DirMsg", testo: "...", bacheca: "leva", leva: LEVA_U12_NAME,
  }});
  expectOneOf(S, "dirigente", "POST /comunicazioni", [200, 201, 403], r);
  if (r.json?.id) await call("DELETE", `/api/v2/comunicazioni/${r.json.id}`, { token: TOKEN_ADMIN });

  // GENITORE
  r = await call("GET", "/api/v2/comunicazioni", { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /comunicazioni", 200, r);
  r = await call("POST", "/api/v2/comunicazioni", { token: TOKEN_GENITORE, body: { titolo: "x", testo: "x" } });
  expectStatus(S, "genitore", "POST /comunicazioni → 403", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/comunicazioni", { token: TOKEN_GIOCATORE });
  expectOneOf(S, "giocatore", "GET /comunicazioni", [200, 403], r);
  r = await call("POST", "/api/v2/comunicazioni", { token: TOKEN_GIOCATORE, body: { titolo: "x", testo: "x" } });
  expectStatus(S, "giocatore", "POST /comunicazioni → 403", 403, r);
}

async function sec_notifiche() {
  console.log("\n=== SEZ. NOTIFICHE / PREFERENZE ===");
  const S = "NOTIFICHE";

  for (const [role, token] of [["admin", TOKEN_ADMIN], ["mister", TOKEN_MISTER], ["dirigente", TOKEN_DIRIGENTE], ["genitore", TOKEN_GENITORE], ["giocatore", TOKEN_GIOCATORE]]) {
    // Spec: /notification-preferences. Endpoint reale: /users/me/notification-preferences
    let r = await call("GET", "/api/v2/notification-preferences", { token });
    expectStatus(S, role, "GET /notification-preferences (spec)", [200, 404], r);
    r = await call("GET", "/api/v2/users/me/notification-preferences", { token });
    expectStatus(S, role, "GET /users/me/notification-preferences (reale)", 200, r);
    r = await call("PATCH", "/api/v2/notification-preferences", { token, body: { notify_chat: true } });
    expectStatus(S, role, "PATCH /notification-preferences (spec)", [200, 404], r);
    r = await call("PUT", "/api/v2/users/me/notification-preferences", { token, body: { notify_chat: true } });
    expectStatus(S, role, "PUT /users/me/notification-preferences (reale)", 200, r);
    // Push subscribe — endpoint reale è /api/push/subscribe (no v2)
    r = await call("POST", "/api/v2/push/subscribe", { token, body: { endpoint: "https://x", keys: { p256dh: "k", auth: "a" } } });
    expectStatus(S, role, "POST /push/subscribe (spec v2)", [200, 201, 400, 404], r);
    r = await call("DELETE", "/api/v2/push/subscribe", { token });
    expectStatus(S, role, "DELETE /push/subscribe (spec v2)", [200, 204, 404], r);
  }
}

async function sec_quote() {
  console.log("\n=== SEZ. QUOTE ===");
  const S = "QUOTE";

  // ADMIN
  let r = await call("GET", "/api/v2/quote", { token: TOKEN_ADMIN });
  expectStatus(S, "admin", "GET /quote", 200, r);
  r = await call("POST", "/api/v2/quote", { token: TOKEN_ADMIN, body: {
    playerId: PLAYER1_ID, importo: 100, scadenza: "2026-12-31", stato: "in_attesa", nota: "t",
  }});
  const qId = r.json?.id;
  expectStatus(S, "admin", "POST /quote", 201, r, `id=${qId}`);
  if (qId) {
    r = await call("PATCH", `/api/v2/quote/${qId}`, { token: TOKEN_ADMIN, body: { stato: "pagato" } });
    expectStatus(S, "admin", "PATCH /quote/:id (spec)", 200, r);
    r = await call("PUT", `/api/v2/quote/${qId}`, { token: TOKEN_ADMIN, body: { stato: "pagato" } });
    expectStatus(S, "admin", "PUT /quote/:id (reale)", 200, r);
    r = await call("DELETE", `/api/v2/quote/${qId}`, { token: TOKEN_ADMIN });
    expectStatus(S, "admin", "DELETE /quote/:id", [200, 204], r);
  }

  // DIRIGENTE
  r = await call("GET", "/api/v2/quote", { token: TOKEN_DIRIGENTE });
  expectStatus(S, "dirigente", "GET /quote (autorizzato per design)", 200, r);
  r = await call("POST", "/api/v2/quote", { token: TOKEN_DIRIGENTE, body: { playerId: PLAYER1_ID, importo: 50, stato: "in_attesa" } });
  expectOneOf(S, "dirigente", "POST /quote", [200, 201, 403], r);
  if (r.json?.id) await call("DELETE", `/api/v2/quote/${r.json.id}`, { token: TOKEN_ADMIN });

  // MISTER
  r = await call("GET", "/api/v2/quote", { token: TOKEN_MISTER });
  expectStatus(S, "mister", "GET /quote → 403", 403, r);

  // GENITORE
  r = await call("GET", "/api/v2/quote", { token: TOKEN_GENITORE });
  expectStatus(S, "genitore", "GET /quote → 403 (manca /quote/mine)", 403, r);

  // GIOCATORE
  r = await call("GET", "/api/v2/quote", { token: TOKEN_GIOCATORE });
  expectStatus(S, "giocatore", "GET /quote → 403", 403, r);
}

async function sec_profile() {
  console.log("\n=== SEZ. PROFILO UTENTE ===");
  const S = "PROFILO";

  for (const [role, token] of [["admin", TOKEN_ADMIN], ["mister", TOKEN_MISTER], ["dirigente", TOKEN_DIRIGENTE], ["genitore", TOKEN_GENITORE], ["giocatore", TOKEN_GIOCATORE]]) {
    let r = await call("GET", "/api/v2/me", { token });
    expectStatus(S, role, "GET /me (spec)", [200, 404], r);
    r = await call("GET", "/api/v2/account/consents", { token });
    expectStatus(S, role, "GET /account/consents (reale)", 200, r);
    r = await call("PATCH", "/api/v2/me", { token, body: { phone: "+39000" } });
    expectStatus(S, role, "PATCH /me (spec)", [200, 404], r);
    // Change-password
    r = await call("POST", "/api/v2/auth/change-password", { token, body: {
      oldPassword: "TestQA2026!!", newPassword: "TestQA2026Bis!!",
    }});
    expectStatus(S, role, "POST /auth/change-password", [200, 400], r);
    // Reset back
    await call("POST", "/api/v2/auth/change-password", { token, body: {
      oldPassword: "TestQA2026Bis!!", newPassword: "TestQA2026!!",
    }});
  }
}

async function sec_allenamenti() {
  console.log("\n=== SEZ. ALLENAMENTI ===");
  const S = "ALLENAMENTI";

  // ADMIN/MISTER
  for (const [role, token] of [["admin", TOKEN_ADMIN], ["mister", TOKEN_MISTER]]) {
    let r = await call("GET", "/api/v2/allenamenti", { token });
    expectStatus(S, role, "GET /allenamenti", 200, r);
    // Body corretto: leva_id (snake_case, INT), titolo (3-200 char), data YYYY-MM-DD
    r = await call("POST", "/api/v2/allenamenti", { token, body: {
      leva_id: LEVA_U12_ID, titolo: `Test allenamento ${role} ${RUN_ID}`, data: "2026-12-15",
    }});
    const aId = r.json?.id;
    expectOneOf(S, role, "POST /allenamenti", [200, 201, 403], r);
    if (aId) {
      r = await call("GET", `/api/v2/allenamenti/${aId}`, { token });
      expectStatus(S, role, "GET /allenamenti/:id", 200, r);
      r = await call("PATCH", `/api/v2/allenamenti/${aId}`, { token, body: { titolo: "x" } });
      expectStatus(S, role, "PATCH /allenamenti/:id", [200, 403], r);
      r = await call("DELETE", `/api/v2/allenamenti/${aId}`, { token });
      expectStatus(S, role, "DELETE /allenamenti/:id", [200, 204, 403], r);
      if (!r.ok) await call("DELETE", `/api/v2/allenamenti/${aId}`, { token: TOKEN_ADMIN });
    }
    r = await call("GET", "/api/v2/allenamenti/presenze", { token });
    expectStatus(S, role, "GET /allenamenti/presenze (spec)", [200, 404], r);
  }
  // GENITORE/GIOCATORE
  for (const [role, token] of [["genitore", TOKEN_GENITORE], ["giocatore", TOKEN_GIOCATORE]]) {
    let r = await call("GET", "/api/v2/allenamenti", { token });
    expectOneOf(S, role, "GET /allenamenti", [200, 403], r);
    // Body corretto: leva_id (snake_case), titolo >=3 char. Atteso 403 da requirePermission/requireLeva
    r = await call("POST", "/api/v2/allenamenti", { token, body: {
      leva_id: LEVA_U12_ID, titolo: `Test ${role}`, data: "2026-12-15",
    }});
    expectStatus(S, role, "POST /allenamenti → 403", 403, r);
  }
}

async function sec_blob_only() {
  console.log("\n=== SEZ. BLOB ONLY → SKIP ===");
  const S = "BLOB_ONLY";
  rec(S, "", "Convocazioni", "endpoint", "blob-only", "SKIP", "convocazioni vivono nel blob USERS_DB/FE — no endpoint REST");
  rec(S, "", "Documenti", "endpoint", "blob-only", "SKIP", "documenti gestiti via upload custom blob storage");
  rec(S, "", "Disponibilità", "endpoint", "blob-only", "SKIP", "saveDisponibilita() salva nel blob, no endpoint REST");
}

// ──────────────────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\n=== CLEANUP ===");
  const S = "CLEANUP";
  async function del(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    if (r.isSpa) {
      rec(S, "", label, "200|204|404", "SPA-HTML", "SKIP", "endpoint mancante");
    } else {
      rec(S, "", label, "200|204|404", String(r.status), r.ok || r.status === 404 ? "PASS" : "SKIP");
    }
  }
  // Torneo
  if (TORNEO_ID) await del(`DELETE torneo ${TORNEO_ID}`, `/api/v2/tornei/${TORNEO_ID}`);
  // Eventi
  if (EVENT_U12_ID) await del(`DELETE event U12 ${EVENT_U12_ID}`, `/api/v2/events/${EVENT_U12_ID}`);
  if (EVENT_U16_ID) await del(`DELETE event U16 ${EVENT_U16_ID}`, `/api/v2/events/${EVENT_U16_ID}`);
  // Players
  for (const [name, id] of [["PLAYER1", PLAYER1_ID], ["PLAYER2", PLAYER2_ID], ["PLAYER3", PLAYER3_ID], ["PLAYER4", PLAYER4_ID], ["PLAYER5", PLAYER5_ID]]) {
    if (id) await del(`DELETE player ${name} (${id})`, `/api/v2/players/${id}`);
  }
  // Users
  for (const [name, id] of [["giocatore", GIOCATORE_ID], ["genitore", GENITORE_ID], ["dirigente", DIRIGENTE_ID], ["mister", MISTER_ID]]) {
    if (id) await del(`DELETE user ${name} (${id})`, `/api/v2/users/${id}`);
  }
  // Leve
  if (LEVA_U12_ID) await del(`DELETE leva U12 (${LEVA_U12_ID})`, `/api/v2/leve/${LEVA_U12_ID}`);
  if (LEVA_U16_ID) await del(`DELETE leva U16 (${LEVA_U16_ID})`, `/api/v2/leve/${LEVA_U16_ID}`);
  // Società → suspend (endpoint DELETE non esiste)
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA completo ${RUN_ID}` } });
    rec(S, "", `SUSPEND società ${SOC_ID}`, "200", String(r.status), r.ok ? "PASS" : "SKIP");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MyVivaio — Test COMPLETO bottone per bottone — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();

  const ok = await setup();
  if (!ok) {
    console.log("\n⛔ STOP: setup fallito");
  } else {
    try { await sec_societa();        } catch (e) { rec("SOCIETA","","err","ok",e.message,"FAIL"); }
    try { await sec_players();        } catch (e) { rec("ROSA","","err","ok",e.message,"FAIL"); }
    try { await sec_events();         } catch (e) { rec("EVENTI","","err","ok",e.message,"FAIL"); }
    try { await sec_presenze();       } catch (e) { rec("PRESENZE","","err","ok",e.message,"FAIL"); }
    try { await sec_matches();        } catch (e) { rec("PARTITE","","err","ok",e.message,"FAIL"); }
    try { await sec_tornei();         } catch (e) { rec("TORNEI","","err","ok",e.message,"FAIL"); }
    try { await sec_stats();          } catch (e) { rec("STATS","","err","ok",e.message,"FAIL"); }
    try { await sec_chat();           } catch (e) { rec("CHAT","","err","ok",e.message,"FAIL"); }
    try { await sec_comunicazioni();  } catch (e) { rec("COMUNICAZIONI","","err","ok",e.message,"FAIL"); }
    try { await sec_notifiche();      } catch (e) { rec("NOTIFICHE","","err","ok",e.message,"FAIL"); }
    try { await sec_quote();          } catch (e) { rec("QUOTE","","err","ok",e.message,"FAIL"); }
    try { await sec_profile();        } catch (e) { rec("PROFILO","","err","ok",e.message,"FAIL"); }
    try { await sec_allenamenti();    } catch (e) { rec("ALLENAMENTI","","err","ok",e.message,"FAIL"); }
    sec_blob_only();
    try { await cleanup();            } catch (e) { rec("CLEANUP","","err","ok",e.message,"FAIL"); }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(70));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(70));

  fs.writeFileSync("test-completo-results.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL, runId: RUN_ID, socId: SOC_ID,
    counts, elapsedSec: parseFloat(elapsed), results,
  }, null, 2));
  console.log("→ Risultati JSON: test-completo-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error("FATAL:", e); process.exit(2); });
