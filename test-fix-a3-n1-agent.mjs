#!/usr/bin/env node
// Verifica fix A3 (chat polls/read/archive auth) + N1 (resolver presenze multi-leva)
// piano SOCIETÀ MyVivaio (PROD). NO modifiche al codice — solo test.

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
  let res, txt = "", json = null;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
    txt = await res.text();
    try { json = JSON.parse(txt); } catch {}
  } catch (e) {
    return { ok: false, status: 0, json: null, text: e?.message || String(e) };
  }
  return { ok: res.ok, status: res.status, json, text: txt };
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
let LEVA_U16_ID = null, LEVA_U16_NAME = null;
let PLAYER_U12_ID = null;  // Luca Bianchi 2018 (under13) in U12
let PLAYER_U16_ID = null;  // Marco Rossi 2010 (over13) in U16
let TOKEN_ADMIN = null;
let MISTER_ID = null, TOKEN_MISTER = null;
let DIRIGENTE_ID = null, TOKEN_DIRIGENTE = null;
let GENITORE_ID = null, TOKEN_GENITORE = null;
let GIOCATORE_ID = null, TOKEN_GIOCATORE = null;

// Eventi per test N1
let EVENT_M2M_ID = null;   // creato via POST /events → solo event_leve, events.leva NULL

const ADMIN_EMAIL = `qa-a3n1-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

let CHAT_ID_U12 = null; // leva_<U12 QA> (chat famiglie: dirigente+genitori)
let CHAT_ID_U16 = null; // squadra_<U16 QA> (chat U14+: mister/allenatore+giocatori)
let POLL_ID = null;     // POLL creato dal dirigente per test vote

// ──────────────────────────────────────────────────────────────────────────────
async function setup() {
  console.log("\n=== SETUP società + leve + players ===");
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test A3N1 QA ${RUN_ID}`, citta: "QA City", piano: "societa",
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
  CHAT_ID_U12 = `leva_${LEVA_U12_NAME}`;
  rec("SETUP", "Crea leva U12", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${LEVA_U12_ID}`);

  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U16 QA ${RUN_ID}`, ordine: 98 } });
  LEVA_U16_ID = r.json?.id; LEVA_U16_NAME = r.json?.nome;
  CHAT_ID_U16 = `squadra_${LEVA_U16_NAME}`;
  rec("SETUP", "Crea leva U16", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${LEVA_U16_ID}`);

  // Players
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Luca", cognome: "Bianchi", annoNascita: 2018, leva: LEVA_U12_NAME,
  }});
  PLAYER_U12_ID = r.json?.id;
  rec("SETUP", "Player U12 under13 (Luca Bianchi)", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_U12_ID}`);

  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Marco", cognome: "Rossi", annoNascita: 2010, leva: LEVA_U16_NAME,
  }});
  PLAYER_U16_ID = r.json?.id;
  rec("SETUP", "Player U16 over13 (Marco Rossi)", "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_U16_ID}`);

  return SOC_ID && LEVA_U12_ID && LEVA_U16_ID && PLAYER_U12_ID && PLAYER_U16_ID;
}

async function createUserAndLogin(label, ruolo, leva, email, nome, cognome) {
  let r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome, cognome, email, password: "TestQA2026!!", ruolo, leva: leva || null,
  }});
  if (r.status !== 201 || !r.json?.id) {
    rec("SETUP", `Crea ${label}`, "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return { id: null, token: null };
  }
  const id = r.json.id;
  rec("SETUP", `Crea ${label} (ruolo=${ruolo})`, "201", "201", "PASS", `id=${id}`);
  r = await call("POST", "/api/v2/auth/login", { body: { email, password: "TestQA2026!!" } });
  if (!r.ok || !r.json?.token) {
    rec("SETUP", `Login ${label}`, "200", String(r.status), "FAIL", (r.text || "").slice(0, 150));
    return { id, token: null };
  }
  rec("SETUP", `Login ${label}`, "200", "200", "PASS");
  return { id, token: r.json.token };
}

async function setup_users() {
  console.log("\n=== UTENTI ===");
  ({ id: MISTER_ID,     token: TOKEN_MISTER }     = await createUserAndLogin(
    "mister",    "mister",    LEVA_U16_NAME, `qa-mister-${RUN_ID}@myvivaio.app`,    "Coach", "Mister"));
  ({ id: DIRIGENTE_ID,  token: TOKEN_DIRIGENTE }  = await createUserAndLogin(
    "dirigente", "dirigente", LEVA_U12_NAME, `qa-dirigente-${RUN_ID}@myvivaio.app`, "Dir",   "Igente"));
  ({ id: GENITORE_ID,   token: TOKEN_GENITORE }   = await createUserAndLogin(
    "genitore",  "genitore",  null,          `qa-genitore-${RUN_ID}@myvivaio.app`,  "Mamma", "Bianchi"));
  // Giocatore = STESSO nome+cognome del PLAYER_U16 → membership squadra_U16 via match
  ({ id: GIOCATORE_ID,  token: TOKEN_GIOCATORE }  = await createUserAndLogin(
    "giocatore", "giocatore", LEVA_U16_NAME, `qa-giocatore-${RUN_ID}@myvivaio.app`, "Marco", "Rossi"));

  // Link genitore → player_under13 via /claim
  if (TOKEN_GENITORE && PLAYER_U12_ID) {
    const r = await call("POST", `/api/v2/players/${PLAYER_U12_ID}/claim`, {
      token: TOKEN_GENITORE, body: {
        role: "papa", consent: true,
        lastNameFull: "Bianchi", birthDate: "2018-05-15",
      },
    });
    rec("SETUP", "Link genitore → player_u12", "200", String(r.status),
      r.ok ? "PASS" : "FAIL", `guardianId=${r.json?.guardian?.id}`);
  }
}

async function setup_events() {
  console.log("\n=== EVENTI (per test N1) ===");
  // Evento multi-leva: POST /events popola event_leve, NON events.leva (path moderno)
  // NOTA BUG TEST PRECEDENTE: il backend (events.ts insertLeveForEvent) fa
  // parseInt(levaId) → si aspetta ID numerici, non nomi. Passare NAME produceva
  // event_leve vuoto e mascherava il fix N1 come "non funzionante".
  const r = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
    tipo: "allenamento", titolo: `N1 evt M2M ${RUN_ID}`,
    leve: [LEVA_U12_ID],  // ← ID numerico (non NAME)
    luogo: "Campo QA", dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
  }});
  EVENT_M2M_ID = r.json?.id;
  rec("SETUP", "Crea evento M2M (event_leve, events.leva NULL)",
    "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${EVENT_M2M_ID}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST A3 — Chat polls/read/archive/adhoc
// ──────────────────────────────────────────────────────────────────────────────
async function test_A3() {
  console.log("\n=== A3: Chat polls/vote/read/archive ===");

  // ── POLLS GET ──
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`,
      { token: TOKEN_GENITORE });
    expectStatus("A3", "Genitore GET /chat/leva_U12/polls → 200", [200], r);
  }
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`,
      { token: TOKEN_GIOCATORE });
    expectStatus("A3", "Giocatore GET /chat/leva_U12/polls → 403", [403], r,
      "U12 famiglie esclude giocatori");
  }
  if (TOKEN_MISTER) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`,
      { token: TOKEN_MISTER });
    expectStatus("A3", "Mister GET /chat/leva_U12/polls → 403", [403], r,
      "U12 famiglie esclude mister");
  }

  // ── POLLS POST ──
  // Genitore prova a creare poll: è membro (passa _isChatMember) ma NON è admin/dirigente → 403 gating ruolo
  if (TOKEN_GENITORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`, {
      token: TOKEN_GENITORE, body: { question: "Q?", options: ["a", "b"] },
    });
    expectStatus("A3", "Genitore POST /chat/leva_U12/polls → 403 (gating ruolo)", [403], r);
  }

  // Spec: "POST /chat/leva_U12/polls con TOKEN_ADMIN → 200"
  // CODICE: admin NON è membro di leva_<X> (resolver esclude admin da chat famiglie per design)
  // → _isChatMember false → 403. Discrepanza spec/codice, già documentata nel report P1.
  if (TOKEN_ADMIN) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`, {
      token: TOKEN_ADMIN, body: { question: "Sondaggio admin?", options: ["sì", "no"] },
    });
    if (r.status === 200 || r.status === 201) {
      rec("A3", "Admin POST /chat/leva_U12/polls → 200 (spec)", "200|201", String(r.status), "PASS",
        "admin ha membership nella chat famiglie (deviazione da design)");
    } else if (r.status === 403) {
      rec("A3", "Admin POST /chat/leva_U12/polls → 200 (spec)", "200|201", "403", "FAIL",
        "Spec=200, codice=403: admin NON è membro di leva_<X> (chat famiglie per design)");
    } else {
      rec("A3", "Admin POST /chat/leva_U12/polls", "200|201|403", String(r.status), "FAIL", (r.text || "").slice(0, 150));
    }
  }

  // Bonus: TOKEN_DIRIGENTE (che è membro di leva_<sua>) → 200/201 — dimostra che il fix funziona
  // per i caller membri
  if (TOKEN_DIRIGENTE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`, {
      token: TOKEN_DIRIGENTE, body: { question: "Quando alleniamo?", options: ["mar 18", "gio 18"] },
    });
    expectStatus("A3", "Dirigente POST /chat/leva_U12/polls → 201 (bonus, caller membro)",
      [200, 201], r, `id=${r.json?.id}`);
    POLL_ID = r.json?.id || null;
  }

  // ── VOTE ──
  // POLL_ID creato dal dirigente. Per votare servono optionId — recupero gli options dal poll
  let pollOptionId = null;
  if (POLL_ID && TOKEN_DIRIGENTE) {
    // Re-fetch poll per ottenere optionId
    const pollList = await call("GET", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/polls`,
      { token: TOKEN_DIRIGENTE });
    const myPoll = pollList.json?.find?.(p => p.id === POLL_ID) || pollList.json?.[0];
    pollOptionId = myPoll?.options?.[0]?.id;
  }

  if (POLL_ID && pollOptionId && TOKEN_GENITORE) {
    const r = await call("POST", `/api/v2/chat/polls/${POLL_ID}/vote`, {
      token: TOKEN_GENITORE, body: { optionId: pollOptionId },
    });
    expectStatus("A3", "Genitore POST /chat/polls/:id/vote → 200 (membro)", [200], r);
  } else {
    rec("A3", "Genitore POST /chat/polls/:id/vote", "200", "skip", "SKIP",
      `poll non disponibile (POLL_ID=${POLL_ID})`);
  }

  if (POLL_ID && pollOptionId && TOKEN_GIOCATORE) {
    const r = await call("POST", `/api/v2/chat/polls/${POLL_ID}/vote`, {
      token: TOKEN_GIOCATORE, body: { optionId: pollOptionId },
    });
    expectStatus("A3", "Giocatore POST /chat/polls/:id/vote → 403 (non membro U12)", [403], r);
  } else {
    rec("A3", "Giocatore POST /chat/polls/:id/vote", "403", "skip", "SKIP",
      `poll non disponibile (POLL_ID=${POLL_ID})`);
  }

  // ── READ ──
  // Spec scriveva "GET /chat/:id/read" ma il vero endpoint è POST. Testo POST.
  if (TOKEN_GENITORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/read`,
      { token: TOKEN_GENITORE });
    expectStatus("A3", "Genitore POST /chat/leva_U12/read → 200", [200], r,
      "spec scriveva GET, ma endpoint reale è POST");
  }
  if (TOKEN_GIOCATORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/read`,
      { token: TOKEN_GIOCATORE });
    expectStatus("A3", "Giocatore POST /chat/leva_U12/read → 403", [403], r);
  }

  // ── ARCHIVE ──
  if (TOKEN_GENITORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/archive`,
      { token: TOKEN_GENITORE });
    expectStatus("A3", "Genitore POST /chat/leva_U12/archive → 200", [200], r);
  }
  if (TOKEN_GIOCATORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/archive`,
      { token: TOKEN_GIOCATORE });
    expectStatus("A3", "Giocatore POST /chat/leva_U12/archive → 403", [403], r);
  }
  // Unarchive (bonus)
  if (TOKEN_GENITORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/unarchive`,
      { token: TOKEN_GENITORE });
    expectStatus("A3", "Genitore POST /chat/leva_U12/unarchive → 200 (bonus)", [200], r);
  }
  if (TOKEN_GIOCATORE) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U12)}/unarchive`,
      { token: TOKEN_GIOCATORE });
    expectStatus("A3", "Giocatore POST /chat/leva_U12/unarchive → 403 (bonus)", [403], r);
  }

  // ── U16 (squadra) — giocatore e mister inclusi ──
  if (TOKEN_GIOCATORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U16)}/polls`,
      { token: TOKEN_GIOCATORE });
    expectStatus("A3", "Giocatore GET /chat/squadra_U16/polls → 200", [200], r,
      "U16 squadra include giocatori via match nome+cognome");
  }
  if (TOKEN_MISTER) {
    const r = await call("POST", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U16)}/read`,
      { token: TOKEN_MISTER });
    expectStatus("A3", "Mister POST /chat/squadra_U16/read → 200", [200], r);
  }
  // Bonus negative: genitore NON deve poter leggere squadra_U16
  if (TOKEN_GENITORE) {
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent(CHAT_ID_U16)}/polls`,
      { token: TOKEN_GENITORE });
    expectStatus("A3", "Genitore GET /chat/squadra_U16/polls → 403 (bonus negative)", [403], r,
      "squadra_<X> esclude genitori");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// TEST N1 — Resolver presenze multi-leva
// ──────────────────────────────────────────────────────────────────────────────
async function test_N1() {
  console.log("\n=== N1: resolver presenze multi-leva ===");

  if (!EVENT_M2M_ID || !PLAYER_U12_ID) {
    rec("N1", "POST /presenze/bulk (eventi multi-leva)",
      "200", "skip", "SKIP", "evento o player non creati");
    return;
  }

  // Caso primario: dirigente di U12 (leva matching) → atteso 200
  if (TOKEN_DIRIGENTE) {
    const r = await call("POST", "/api/v2/presenze/bulk", {
      token: TOKEN_DIRIGENTE, body: {
        eventId: EVENT_M2M_ID,
        presenze: [{ playerId: PLAYER_U12_ID, stato: "presente" }],
      },
    });
    expectStatus("N1", "Dirigente POST /presenze/bulk (event_leve M2M) → 200", [200], r,
      "resolver legge prima event_leve");
  }

  // Caso mister U16 sull'evento U12: requireLeva blocca (leva non sua) → 403, NON 400
  if (TOKEN_MISTER) {
    const r = await call("POST", "/api/v2/presenze/bulk", {
      token: TOKEN_MISTER, body: {
        eventId: EVENT_M2M_ID,
        presenze: [{ playerId: PLAYER_U12_ID, stato: "presente" }],
      },
    });
    // Atteso 403 (leva_forbidden) NON più 400 (leva_required)
    if (r.status === 403) {
      rec("N1", "Mister POST /presenze/bulk (altra leva) → 403 leva_forbidden",
        "403", "403", "PASS", "resolver risolve la leva, requireLeva blocca correttamente");
    } else if (r.status === 400 && r.json?.error === "leva_required") {
      rec("N1", "Mister POST /presenze/bulk (altra leva)", "403", "400 leva_required", "FAIL",
        "BUG N1 NON RISOLTO: il resolver ancora ritorna null su eventi multi-leva");
    } else {
      rec("N1", "Mister POST /presenze/bulk (altra leva)", "403", String(r.status), "FAIL",
        (r.text || "").slice(0, 150));
    }
  }

  // Admin (wildcard, requireLeva skip) → 200 — dovrebbe sempre funzionare
  if (TOKEN_ADMIN) {
    const r = await call("POST", "/api/v2/presenze/bulk", {
      token: TOKEN_ADMIN, body: {
        eventId: EVENT_M2M_ID,
        presenze: [{ playerId: PLAYER_U12_ID, stato: "presente" }],
      },
    });
    expectStatus("N1", "Admin POST /presenze/bulk (event_leve M2M) → 200", [200], r);
  }

  // Bonus: dirigente di U12 fa POST presenza con resolver che ora legge bene la leva
  // → conferma che il fix non rompe il path moderno
  if (TOKEN_DIRIGENTE) {
    const r = await call("POST", "/api/v2/presenze", {
      token: TOKEN_DIRIGENTE, body: {
        eventId: EVENT_M2M_ID,
        playerId: PLAYER_U12_ID,
        stato: "presente", nota: "QA N1",
      },
    });
    // POST /presenze (single) usa _levaFromPlayerInBody (NON _levaFromEventInBody) → non
    // direttamente toccato dal fix N1, ma verifica end-to-end. Atteso 200.
    expectStatus("N1", "Dirigente POST /presenze (single, player.leva) → 200 (sanity check)",
      [200], r);
  }

  // Caso fallback events.leva legacy: non riproducibile via API (POST /events scrive
  // solo event_leve). Segnalo nel report.
  rec("N1", "Fallback events.leva legacy → 200 (eventi pre-migrazione)",
    "200", "skip", "SKIP",
    "Non riproducibile via API: POST /events non scrive events.leva. Verifica solo via UPDATE manuale o leggendo events legacy in DB.");
}

// ──────────────────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\n=== CLEANUP ===");
  async function del(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    rec("CLEANUP", label, "200|204|404", String(r.status),
      r.ok || r.status === 404 ? "PASS" : "SKIP");
  }
  if (EVENT_M2M_ID)   await del(`event M2M ${EVENT_M2M_ID}`,    `/api/v2/events/${EVENT_M2M_ID}`);
  if (GIOCATORE_ID)   await del(`user giocatore ${GIOCATORE_ID}`,`/api/v2/users/${GIOCATORE_ID}`);
  if (GENITORE_ID)    await del(`user genitore ${GENITORE_ID}`, `/api/v2/users/${GENITORE_ID}`);
  if (DIRIGENTE_ID)   await del(`user dirigente ${DIRIGENTE_ID}`,`/api/v2/users/${DIRIGENTE_ID}`);
  if (MISTER_ID)      await del(`user mister ${MISTER_ID}`,     `/api/v2/users/${MISTER_ID}`);
  if (PLAYER_U12_ID)  await del(`player U12 ${PLAYER_U12_ID}`,  `/api/v2/players/${PLAYER_U12_ID}`);
  if (PLAYER_U16_ID)  await del(`player U16 ${PLAYER_U16_ID}`,  `/api/v2/players/${PLAYER_U16_ID}`);
  if (LEVA_U12_ID)    await del(`leva U12 ${LEVA_U12_ID}`,      `/api/v2/leve/${LEVA_U12_ID}`);
  if (LEVA_U16_ID)    await del(`leva U16 ${LEVA_U16_ID}`,      `/api/v2/leve/${LEVA_U16_ID}`);
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA A3+N1 ${RUN_ID}` } });
    rec("CLEANUP", `SUSPEND società ${SOC_ID}`, "200", String(r.status),
      r.ok ? "PASS" : "SKIP");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MyVivaio — Verifica FIX A3+N1 — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();

  const ok = await setup();
  if (!ok) {
    console.log("\n⛔ STOP: setup fallito");
  } else {
    await setup_users();
    await setup_events();
    try { await test_A3(); } catch (e) { rec("A3","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await test_N1(); } catch (e) { rec("N1","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await cleanup(); } catch (e) { rec("CLEANUP","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(64));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(64));

  fs.writeFileSync("test-fix-a3-n1-results.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL, runId: RUN_ID, socId: SOC_ID,
    counts, elapsedSec: parseFloat(elapsed), results,
  }, null, 2));
  console.log("→ Risultati JSON: test-fix-a3-n1-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error("FATAL:", e); process.exit(2); });
