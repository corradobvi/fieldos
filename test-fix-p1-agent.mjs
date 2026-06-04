#!/usr/bin/env node
// Verifica fix P1 sicurezza/GDPR — piano SOCIETÀ MyVivaio (PROD)
// Re-test ruoli mirato sulle 9 anomalie originali + verifica nuovo comportamento
// del ruolo 'mister' (alias di allenatore).
//
// Scope:
//   - 2 leve: U12 QA (under13, anno 2018) e U14 QA (over13, anno 2010)
//   - 1 player in U12 (Luca Bianchi, 2018) → genitore (papa) linkato via /claim
//   - 1 player in U14 (Marco Rossi, 2010) → giocatore over13 via match nome+cognome
//   - utenti: admin (creato dal SA), mister, allenatore, dirigente, genitore, giocatore
//
// REUSE-ONLY: nessuna modifica al codice. Niente curl manuali — tutto via script.
// Società reali (id=2, 5, 53) escluse dal hard-delete via guard.

import fs from "node:fs";

const BASE_URL  = process.env.BASE_URL  || "https://app.myvivaio.app";
const SA_SECRET = process.env.SA_SECRET || "MyVivaio123++";
const REAL_SOC_IDS = new Set([2, 5, 53]);
const RUN_ID = String(Date.now()).slice(-8);

const results = [];
let counts = { PASS: 0, FAIL: 0, SKIP: 0 };
function rec(area, name, expected, got, status, detail = "") {
  counts[status] = (counts[status] || 0) + 1;
  results.push({ area, name, expected, got, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "•";
  console.log(`[${status}] ${icon} ${area} — ${name}  expected=${expected} got=${got}${detail ? ` ▸ ${detail}` : ""}`);
}

async function call(method, path, { token, saSecret, body } = {}) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (token)    opts.headers.Authorization = `Bearer ${token}`;
  if (saSecret) opts.headers["X-SA-Secret"] = saSecret;
  const t0 = Date.now();
  let res, txt = "", json = null;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
    txt = await res.text();
    try { json = JSON.parse(txt); } catch {}
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, err: e?.message || String(e) };
  }
  return { ok: res.ok, status: res.status, ms: Date.now() - t0, json, text: txt };
}

function expectStatus(area, name, expected, r, detail = "") {
  const list = Array.isArray(expected) ? expected : [expected];
  const got = String(r.status);
  const ok = list.map(String).includes(got);
  rec(area, name, list.join("|"), got, ok ? "PASS" : "FAIL",
      detail || (r.text ? r.text.slice(0, 130) : ""));
  return ok;
}

// ──────────────────────────────────────────────────────────────────────────────
let SOC_ID = null;
let LEVA_U12_ID = null, LEVA_U12_NAME = null;
let LEVA_U14_ID = null, LEVA_U14_NAME = null;
let PLAYER_U12_ID = null; // Luca Bianchi 2018 (under13) in U12
let PLAYER_U14_ID = null; // Marco Rossi 2010 (over13) in U14
let TOKEN_ADMIN = null;
let MISTER_ID = null, TOKEN_MISTER = null;
let ALLENATORE_ID = null, TOKEN_ALLENATORE = null;
let DIRIGENTE_ID = null, TOKEN_DIRIGENTE = null;
let GENITORE_ID = null, TOKEN_GENITORE = null;
let GIOCATORE_ID = null, TOKEN_GIOCATORE = null;
let EVENT_BY_MISTER_ID = null; // tracciato per cleanup

const ADMIN_EMAIL = `qa-p1-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

// ──────────────────────────────────────────────────────────────────────────────
async function setup() {
  console.log("\n=== SETUP ===");
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test P1 QA ${RUN_ID}`, citta: "QA City", piano: "societa",
      adminNome: "QA", adminCogn: "Admin",
      adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  if (!r.ok || !r.json?.societyId) {
    rec("SETUP", "POST /superadmin/societies", "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return false;
  }
  SOC_ID = Number(r.json.societyId);
  if (REAL_SOC_IDS.has(SOC_ID)) {
    rec("SETUP", "ID società di test", "non-real", String(SOC_ID), "FAIL", "collide con società reale");
    return false;
  }
  rec("SETUP", "Crea società", "201", "201", "PASS", `socId=${SOC_ID}`);

  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  if (!r.ok || !r.json?.token) {
    rec("SETUP", "Login admin", "200", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return false;
  }
  TOKEN_ADMIN = r.json.token;
  rec("SETUP", "Login admin", "200", "200", "PASS");

  // Leve
  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U12 QA ${RUN_ID}`, ordine: 99 } });
  LEVA_U12_ID = r.json?.id; LEVA_U12_NAME = r.json?.nome;
  rec("SETUP", "Crea leva U12", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${LEVA_U12_ID} name="${LEVA_U12_NAME}"`);

  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U14 QA ${RUN_ID}`, ordine: 98 } });
  LEVA_U14_ID = r.json?.id; LEVA_U14_NAME = r.json?.nome;
  rec("SETUP", "Crea leva U14", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${LEVA_U14_ID} name="${LEVA_U14_NAME}"`);

  // Players
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Luca", cognome: "Bianchi", numero: 9, ruoloCampo: "CEN",
    annoNascita: 2018, leva: LEVA_U12_NAME,
  }});
  PLAYER_U12_ID = r.json?.id;
  rec("SETUP", "Player U12 under13", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_U12_ID}`);

  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Marco", cognome: "Rossi", numero: 7, ruoloCampo: "ATT",
    annoNascita: 2010, leva: LEVA_U14_NAME,
  }});
  PLAYER_U14_ID = r.json?.id;
  rec("SETUP", "Player U14 over13", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_U14_ID}`);

  return SOC_ID && LEVA_U12_ID && LEVA_U14_ID && PLAYER_U12_ID && PLAYER_U14_ID;
}

async function createUserAndLogin(label, ruolo, leva, email, nome = "QA", cognome = "User") {
  let r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome, cognome, email, password: "TestQA2026!!", ruolo,
    leva: leva || null,
  }});
  if (r.status !== 201 || !r.json?.id) {
    rec("SETUP", `Crea ${label} (ruolo=${ruolo})`, "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return { id: null, token: null };
  }
  const id = r.json.id;
  rec("SETUP", `Crea ${label} (ruolo=${ruolo})`, "201", "201", "PASS", `id=${id} leva=${leva || "—"}`);
  r = await call("POST", "/api/v2/auth/login", { body: { email, password: "TestQA2026!!" } });
  if (!r.ok || !r.json?.token) {
    rec("SETUP", `Login ${label}`, "200", String(r.status), "FAIL", (r.text || "").slice(0, 150));
    return { id, token: null };
  }
  rec("SETUP", `Login ${label}`, "200", "200", "PASS", `ruolo=${r.json.user?.ruolo} leva=${r.json.user?.leva ?? "null"}`);
  return { id, token: r.json.token };
}

async function setup_users() {
  console.log("\n=== UTENTI ===");
  ({ id: MISTER_ID,      token: TOKEN_MISTER }      = await createUserAndLogin(
    "mister",      "mister",      LEVA_U14_NAME, `qa-mister-${RUN_ID}@myvivaio.app`,      "Coach", "Mister"));
  ({ id: ALLENATORE_ID,  token: TOKEN_ALLENATORE }  = await createUserAndLogin(
    "allenatore",  "allenatore",  LEVA_U14_NAME, `qa-allenatore-${RUN_ID}@myvivaio.app`,  "Coach", "Allena"));
  ({ id: DIRIGENTE_ID,   token: TOKEN_DIRIGENTE }   = await createUserAndLogin(
    "dirigente",   "dirigente",   LEVA_U12_NAME, `qa-dirigente-${RUN_ID}@myvivaio.app`,   "Dir",   "Igente"));
  ({ id: GENITORE_ID,    token: TOKEN_GENITORE }    = await createUserAndLogin(
    "genitore",    "genitore",    null,          `qa-genitore-${RUN_ID}@myvivaio.app`,    "Mamma", "Bianchi"));
  // Giocatore: STESSO nome+cognome del player U14 per matching ownership
  ({ id: GIOCATORE_ID,   token: TOKEN_GIOCATORE }   = await createUserAndLogin(
    "giocatore",   "giocatore",   LEVA_U14_NAME, `qa-giocatore-${RUN_ID}@myvivaio.app`,   "Marco", "Rossi"));

  // Link genitore → player_under13 via POST /players/:id/claim
  if (TOKEN_GENITORE && PLAYER_U12_ID) {
    const r = await call("POST", `/api/v2/players/${PLAYER_U12_ID}/claim`, {
      token: TOKEN_GENITORE, body: {
        role: "papa", consent: true,
        lastNameFull: "Bianchi", birthDate: "2018-05-15",
      },
    });
    rec("SETUP", "Link genitore → player_u12 via /claim",
      "200", String(r.status), r.ok ? "PASS" : "FAIL", `guardianId=${r.json?.guardian?.id}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// FIX 1 — Mister alias di allenatore
// ──────────────────────────────────────────────────────────────────────────────
async function test_fix1() {
  console.log("\n=== FIX 1: MISTER alias allenatore ===");
  if (!TOKEN_MISTER) { rec("FIX1", "setup", "ok", "no-token", "SKIP", ""); return; }

  // POST evento (proxy convocazione) — atteso 201 (WRITE_ROLES include mister)
  let r = await call("POST", "/api/v2/events", { token: TOKEN_MISTER, body: {
    tipo: "allenamento", titolo: `Mister evt ${RUN_ID}`, leve: [LEVA_U14_NAME],
    luogo: "Campo QA", dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
  }});
  EVENT_BY_MISTER_ID = r.json?.id;
  expectStatus("FIX1", "Mister POST /events → 201 (prima 403)", [201], r,
    `id=${EVENT_BY_MISTER_ID}`);

  // POST presenza/bulk sulla SUA leva — atteso 200
  if (EVENT_BY_MISTER_ID && PLAYER_U14_ID) {
    r = await call("POST", "/api/v2/presenze/bulk", {
      token: TOKEN_MISTER, body: {
        eventId: EVENT_BY_MISTER_ID,
        presenze: [{ playerId: PLAYER_U14_ID, stato: "presente" }],
      },
    });
    expectStatus("FIX1", "Mister POST /presenze/bulk (sua leva) → 200 (prima 403)", [200], r);
  } else {
    rec("FIX1", "Mister POST /presenze/bulk", "200", "skip", "SKIP", "event non creato");
  }

  // "POST convocazione" — endpoint REST non esiste in api-server (vive nel blob).
  // Lo dichiariamo come SKIP per coerenza (lo stesso comportamento del run precedente).
  // Il proxy "convocazione" è stato testato come POST /events sopra.
  rec("FIX1", "POST convocazione (endpoint REST inesistente)",
    "endpoint", "missing", "SKIP",
    "Convocazioni vivono nel blob USERS_DB/FE; proxy REST = POST /events (vedi sopra)");

  // GET players leva ASSEGNATA (U14) — atteso 200
  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_U14_NAME)}`,
    { token: TOKEN_MISTER });
  expectStatus("FIX1", "Mister GET /players?leva=<sua> → 200", [200], r,
    Array.isArray(r.json) ? `count=${r.json.length}` : "");

  // GET players leva NON ASSEGNATA (U12)
  // SPEC: 403. CODICE post-FIX2: mister è STAFF_READ → 200 (no leva-scope su lettura).
  // Documentiamo l'esito reale + flag come anomalia residua se diverso da spec.
  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_U12_NAME)}`,
    { token: TOKEN_MISTER });
  if (r.status === 403) {
    rec("FIX1", "Mister GET /players?leva=<altra> → 403", "403", "403", "PASS",
      "leva-scope server-side attivo su lettura mister");
  } else {
    rec("FIX1", "Mister GET /players?leva=<altra> → 403", "403", String(r.status), "FAIL",
      `ANOMALIA RESIDUA (P2 noto): mister legge players di ogni leva (count=${Array.isArray(r.json)?r.json.length:"?"})`);
  }

  // GET quote — atteso 403 (invariato, quote non ha allenatore in whitelist)
  r = await call("GET", "/api/v2/quote", { token: TOKEN_MISTER });
  expectStatus("FIX1", "Mister GET /quote → 403 (invariato)", [403], r);
}

// ──────────────────────────────────────────────────────────────────────────────
// FIX 2 — Ownership players + stats
// ──────────────────────────────────────────────────────────────────────────────
async function test_fix2() {
  console.log("\n=== FIX 2: ownership players + stats ===");

  // GENITORE: GET /players → solo figlio (player_u12)
  if (TOKEN_GENITORE) {
    let r = await call("GET", "/api/v2/players", { token: TOKEN_GENITORE });
    const ids = Array.isArray(r.json) ? r.json.map(p => p.id) : [];
    const onlyChild = r.status === 200 && ids.length === 1 && ids[0] === PLAYER_U12_ID;
    rec("FIX2", "Genitore GET /players → solo figlio",
      "200 + [PLAYER_U12_ID]", `${r.status} + [${ids.join(",")}]`,
      onlyChild ? "PASS" : "FAIL",
      onlyChild ? "ownership attivo" : `attesi solo figli; ottenuti ${ids.length} player`);
  } else {
    rec("FIX2", "Genitore GET /players", "200", "no-token", "SKIP");
  }

  // GIOCATORE: GET /players → solo se stesso (player_u14)
  if (TOKEN_GIOCATORE) {
    let r = await call("GET", "/api/v2/players", { token: TOKEN_GIOCATORE });
    const ids = Array.isArray(r.json) ? r.json.map(p => p.id) : [];
    const onlySelf = r.status === 200 && ids.length === 1 && ids[0] === PLAYER_U14_ID;
    rec("FIX2", "Giocatore GET /players → solo se stesso",
      "200 + [PLAYER_U14_ID]", `${r.status} + [${ids.join(",")}]`,
      onlySelf ? "PASS" : "FAIL",
      onlySelf ? "match nome+cognome attivo" : `attesi solo proprio; ottenuti ${ids.length}`);
  } else {
    rec("FIX2", "Giocatore GET /players", "200", "no-token", "SKIP");
  }

  // GENITORE GET /players/:id NON figlio (player_u14)
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/players/${PLAYER_U14_ID}`, { token: TOKEN_GENITORE });
    // Il codice ritorna 404 (no leak), la spec chiede 403. Accetto entrambi come PASS
    // (il fix nasconde l'esistenza; 404 è preferibile).
    if (r.status === 403 || r.status === 404) {
      rec("FIX2", "Genitore GET /players/:altro → 403/404", "403|404", String(r.status), "PASS",
        r.status === 404 ? "404 anti-leak (preferibile a 403)" : "");
    } else {
      rec("FIX2", "Genitore GET /players/:altro → 403/404", "403|404", String(r.status), "FAIL",
        (r.text || "").slice(0, 130));
    }
  }

  // GIOCATORE GET /players/:id NON proprio (player_u12)
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/players/${PLAYER_U12_ID}`, { token: TOKEN_GIOCATORE });
    if (r.status === 403 || r.status === 404) {
      rec("FIX2", "Giocatore GET /players/:altro → 403/404", "403|404", String(r.status), "PASS",
        r.status === 404 ? "404 anti-leak" : "");
    } else {
      rec("FIX2", "Giocatore GET /players/:altro → 403/404", "403|404", String(r.status), "FAIL",
        (r.text || "").slice(0, 130));
    }
  }

  // GENITORE GET /stats/player/:id NON figlio
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/stats/player/${PLAYER_U14_ID}`, { token: TOKEN_GENITORE });
    if (r.status === 403 || r.status === 404) {
      rec("FIX2", "Genitore GET /stats/player/:altro → 403/404", "403|404", String(r.status), "PASS",
        r.status === 404 ? "404 anti-leak" : "");
    } else {
      rec("FIX2", "Genitore GET /stats/player/:altro → 403/404", "403|404", String(r.status), "FAIL",
        (r.text || "").slice(0, 130));
    }
  }

  // GIOCATORE GET /stats/player/:id NON proprio
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/stats/player/${PLAYER_U12_ID}`, { token: TOKEN_GIOCATORE });
    if (r.status === 403 || r.status === 404) {
      rec("FIX2", "Giocatore GET /stats/player/:altro → 403/404", "403|404", String(r.status), "PASS",
        r.status === 404 ? "404 anti-leak" : "");
    } else {
      rec("FIX2", "Giocatore GET /stats/player/:altro → 403/404", "403|404", String(r.status), "FAIL",
        (r.text || "").slice(0, 130));
    }
  }

  // GENITORE/GIOCATORE GET /stats/leva → 403
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U12_NAME)}`,
      { token: TOKEN_GENITORE });
    expectStatus("FIX2", "Genitore GET /stats/leva → 403", [403], r);
  }
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_U14_NAME)}`,
      { token: TOKEN_GIOCATORE });
    expectStatus("FIX2", "Giocatore GET /stats/leva → 403", [403], r);
  }

  // Bonus: positive path — genitore vede /stats/player/figlio
  if (TOKEN_GENITORE && PLAYER_U12_ID) {
    const r = await call("GET", `/api/v2/stats/player/${PLAYER_U12_ID}`, { token: TOKEN_GENITORE });
    expectStatus("FIX2", "Genitore GET /stats/player/:figlio → 200 (positive)", [200], r);
  }
  if (TOKEN_GIOCATORE && PLAYER_U14_ID) {
    const r = await call("GET", `/api/v2/stats/player/${PLAYER_U14_ID}`, { token: TOKEN_GIOCATORE });
    expectStatus("FIX2", "Giocatore GET /stats/player/:proprio → 200 (positive)", [200], r);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// FIX 3 — Chat auth (membership)
// ──────────────────────────────────────────────────────────────────────────────
async function test_fix3() {
  console.log("\n=== FIX 3: chat auth ===");

  const chat_leva_U12   = `leva_${LEVA_U12_NAME}`;
  const chat_leva_U14   = `leva_${LEVA_U14_NAME}`;
  const chat_squadra_U14= `squadra_${LEVA_U14_NAME}`;
  const chat_staff_U14  = `staff_${LEVA_U14_NAME}`;

  // U12 (under13) — leva chat = genitori + dirigenti (mister escluso, no giocatori)
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_leva_U12)}/messages`,
      { token: TOKEN_GENITORE });
    expectStatus("FIX3", "Genitore GET /chat/leva_U12 → 200", [200], r);
  }
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_leva_U12)}/messages`,
      { token: TOKEN_GIOCATORE });
    expectStatus("FIX3", "Giocatore GET /chat/leva_U12 → 403", [403], r,
      "U12 = under13, giocatori non in leva chat");
  }
  if (TOKEN_MISTER) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_leva_U12)}/messages`,
      { token: TOKEN_MISTER });
    expectStatus("FIX3", "Mister GET /chat/leva_U12 → 403", [403], r,
      "leva_<X> chat = dirigenti+genitori (mister escluso)");
  }

  // POST messaggio U12 genitore (membro) — atteso 200/201
  if (TOKEN_GENITORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(chat_leva_U12)}/messages`,
      { token: TOKEN_GENITORE, body: { testo: `Test genitore ${RUN_ID}` } });
    expectStatus("FIX3", "Genitore POST /chat/leva_U12 → 200/201", [200, 201], r);
  }
  // POST messaggio U12 giocatore (NON membro) — atteso 403
  if (TOKEN_GIOCATORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(chat_leva_U12)}/messages`,
      { token: TOKEN_GIOCATORE, body: { testo: `Test giocatore ${RUN_ID}` } });
    expectStatus("FIX3", "Giocatore POST /chat/leva_U12 → 403", [403], r);
  }

  // U14 (over13) — secondo la spec leva_U14 con giocatore/mister → 200.
  // CODICE: leva_<X> include solo dirigenti+genitori/nonni anche U14+ → 403.
  // I giocatori/mister U14+ stanno in squadra_<X>. Testo entrambi e segnalo.
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_leva_U14)}/messages`,
      { token: TOKEN_GIOCATORE });
    if (r.status === 200) {
      rec("FIX3", "Giocatore GET /chat/leva_U14 → 200 (spec)", "200", "200", "PASS");
    } else {
      rec("FIX3", "Giocatore GET /chat/leva_U14 → 200 (spec)", "200", String(r.status),
        "FAIL", "Spec attesa 200, ma resolver leva_<X> non include giocatori — usare squadra_<X>");
    }
    // Test alternativo: squadra_U14
    const rs = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_squadra_U14)}/messages`,
      { token: TOKEN_GIOCATORE });
    expectStatus("FIX3", "Giocatore GET /chat/squadra_U14 → 200 (codice)", [200], rs,
      "membership via match nome+cognome del giocatore con player in leva");
  }

  if (TOKEN_MISTER) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_leva_U14)}/messages`,
      { token: TOKEN_MISTER });
    if (r.status === 200) {
      rec("FIX3", "Mister GET /chat/leva_U14 → 200 (spec)", "200", "200", "PASS");
    } else {
      rec("FIX3", "Mister GET /chat/leva_U14 → 200 (spec)", "200", String(r.status),
        "FAIL", "Spec attesa 200, ma resolver leva_<X> esclude mister anche U14+ — usare squadra_<X>");
    }
    const rs = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_squadra_U14)}/messages`,
      { token: TOKEN_MISTER });
    expectStatus("FIX3", "Mister GET /chat/squadra_U14 → 200 (codice)", [200], rs);
    const rst = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_staff_U14)}/messages`,
      { token: TOKEN_MISTER });
    expectStatus("FIX3", "Mister GET /chat/staff_U14 → 200 (bonus)", [200], rst);
  }

  // GENITORE su chat staff_U14 → 403
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(chat_staff_U14)}/messages`,
      { token: TOKEN_GENITORE });
    expectStatus("FIX3", "Genitore GET /chat/staff_U14 → 403", [403], r);
  }

  // Bonus: chatId sconosciuto → 403 (default-deny)
  if (TOKEN_ADMIN) {
    const r = await call("GET", "/api/v2/chat/sconosciuto_xyz/messages", { token: TOKEN_ADMIN });
    expectStatus("FIX3", "Admin GET /chat/<sconosciuto> → 403 (default-deny)", [403], r);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\n=== CLEANUP ===");
  async function del(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    rec("CLEANUP", label, "200|204|404", String(r.status),
      r.ok || r.status === 404 ? "PASS" : "SKIP");
  }
  if (EVENT_BY_MISTER_ID) await del(`event mister ${EVENT_BY_MISTER_ID}`, `/api/v2/events/${EVENT_BY_MISTER_ID}`);
  if (GIOCATORE_ID)   await del(`user giocatore ${GIOCATORE_ID}`,  `/api/v2/users/${GIOCATORE_ID}`);
  if (GENITORE_ID)    await del(`user genitore ${GENITORE_ID}`,   `/api/v2/users/${GENITORE_ID}`);
  if (DIRIGENTE_ID)   await del(`user dirigente ${DIRIGENTE_ID}`, `/api/v2/users/${DIRIGENTE_ID}`);
  if (ALLENATORE_ID)  await del(`user allenatore ${ALLENATORE_ID}`,`/api/v2/users/${ALLENATORE_ID}`);
  if (MISTER_ID)      await del(`user mister ${MISTER_ID}`,       `/api/v2/users/${MISTER_ID}`);
  if (PLAYER_U12_ID)  await del(`player U12 ${PLAYER_U12_ID}`,    `/api/v2/players/${PLAYER_U12_ID}`);
  if (PLAYER_U14_ID)  await del(`player U14 ${PLAYER_U14_ID}`,    `/api/v2/players/${PLAYER_U14_ID}`);
  if (LEVA_U12_ID)    await del(`leva U12 ${LEVA_U12_ID}`,        `/api/v2/leve/${LEVA_U12_ID}`);
  if (LEVA_U14_ID)    await del(`leva U14 ${LEVA_U14_ID}`,        `/api/v2/leve/${LEVA_U14_ID}`);
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA P1 verifica ${RUN_ID}` } });
    rec("CLEANUP", `SUSPEND società ${SOC_ID}`, "200", String(r.status),
      r.ok ? "PASS" : "SKIP");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MyVivaio — Verifica FIX P1 — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();
  const ok = await setup();
  if (!ok) {
    console.log("\n⛔ STOP: setup fallito");
  } else {
    await setup_users();
    try { await test_fix1(); } catch (e) { rec("FIX1","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await test_fix2(); } catch (e) { rec("FIX2","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await test_fix3(); } catch (e) { rec("FIX3","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await cleanup(); } catch (e) { rec("CLEANUP","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(64));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(64));

  fs.writeFileSync("test-fix-p1-results.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    runId: RUN_ID,
    socId: SOC_ID,
    counts,
    elapsedSec: parseFloat(elapsed),
    results,
  }, null, 2));
  console.log("→ Risultati JSON: test-fix-p1-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error("FATAL:", e); process.exit(2); });
