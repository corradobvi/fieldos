#!/usr/bin/env node
// Test ruoli mancanti (mister/genitore/giocatore) — piano SOCIETÀ MyVivaio (PROD)
// Crea società di test, crea utenti per ogni ruolo, esegue suite, cleanup, salva JSON.
// REUSE-ONLY: legge endpoint esistenti, non modifica dati di società reali (2, 5, 53).
//
// NOTE su "ruolo mister":
//   Nel codice non esiste un enum 'mister' distinto. Esistono 'allenatore' (mister di leva)
//   e 'mister_admin' (mister con permessi admin estesi). Per il test "mister" useremo
//   `allenatore` come default funzionale, documentando la scelta nel report.

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
  const line = `[${status}] ${icon} ${area} — ${name}`;
  const tail = `expected=${expected} got=${got}${detail ? ` ▸ ${detail}` : ""}`;
  console.log(`${line}  ${tail}`);
}

async function call(method, path, { token, saSecret, body, headers = {} } = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (token)    opts.headers.Authorization = `Bearer ${token}`;
  if (saSecret) opts.headers["X-SA-Secret"] = saSecret;
  const t0 = Date.now();
  let res, txt = "", json = null;
  try {
    res = await fetch(url, opts);
    txt = await res.text();
    try { json = JSON.parse(txt); } catch {}
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, err: e?.message || String(e) };
  }
  return { ok: res.ok, status: res.status, ms: Date.now() - t0, json, text: txt };
}

// helper: aspettativa numerica/insieme di status code
function expect(label, area, name, expectedStatuses, r, detail = "") {
  const ok = expectedStatuses.includes(r.status);
  const expectedStr = expectedStatuses.join("|");
  rec(area, name, expectedStr, String(r.status), ok ? "PASS" : "FAIL",
      detail || (r.text ? r.text.slice(0, 120) : ""));
  return ok;
}

// ──────────────────────────────────────────────────────────────────────────────
// Stato globale
let SOC_ID = null;
let LEVA_ID = null, LEVA_NAME = null;
let SECOND_LEVA_ID = null, SECOND_LEVA_NAME = null;
let PLAYER_OVER13 = null, PLAYER_UNDER13 = null, PLAYER_OTHER = null;
let TOKEN_ADMIN = null;
let MISTER_USER_ID = null, GENITORE_USER_ID = null, GIOCATORE_USER_ID = null;
let TOKEN_MISTER = null, TOKEN_GENITORE = null, TOKEN_GIOCATORE = null;
let MISTER_ROLE_USED = "allenatore"; // default funzionale, documenteremo

const ADMIN_EMAIL = `qa-ruoli-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

// ──────────────────────────────────────────────────────────────────────────────
async function phase0_setup() {
  console.log("\n=== FASE 0: SETUP società + leva + players ===");

  // 1. Crea società
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test Ruoli QA ${RUN_ID}`, citta: "QA City", piano: "societa",
      adminNome: "QA", adminCogn: "Admin",
      adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  if (!r.ok || !r.json?.societyId) {
    rec("0.SETUP", "POST /api/v2/superadmin/societies",
      "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return false;
  }
  SOC_ID = Number(r.json.societyId);
  if (REAL_SOC_IDS.has(SOC_ID)) {
    rec("0.SETUP", "ID società di test", "non-real", String(SOC_ID), "FAIL", "collide con società reale");
    return false;
  }
  rec("0.SETUP", "Crea società piano società", "201", String(r.status), "PASS",
    `socId=${SOC_ID} codice=${r.json.codice}`);

  // 2. Login admin
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  if (!r.ok || !r.json?.token) {
    rec("0.SETUP", "Login admin", "200", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return false;
  }
  TOKEN_ADMIN = r.json.token;
  rec("0.SETUP", "Login admin", "200", "200", "PASS", `userId=${r.json.user?.id}`);

  // 3. Crea 2 leve (la seconda per i test cross-leva)
  r = await call("POST", "/api/v2/leve", {
    token: TOKEN_ADMIN, body: { nome: `U14 QA ${RUN_ID}`, ordine: 99 },
  });
  if (r.status !== 201) {
    rec("0.SETUP", "Crea leva primaria", "201", String(r.status), "FAIL");
    return false;
  }
  LEVA_ID = r.json.id; LEVA_NAME = r.json.nome;
  rec("0.SETUP", "Crea leva primaria", "201", "201", "PASS", `id=${LEVA_ID} nome="${LEVA_NAME}"`);

  r = await call("POST", "/api/v2/leve", {
    token: TOKEN_ADMIN, body: { nome: `U10 QA ${RUN_ID}`, ordine: 98 },
  });
  SECOND_LEVA_ID = r.json?.id; SECOND_LEVA_NAME = r.json?.nome;
  rec("0.SETUP", "Crea leva secondaria",
    "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${SECOND_LEVA_ID}`);

  // 4. Crea 3 player: 1 over13 (2010), 1 under13 (2018), 1 altro (over13) per cross-test
  const annoOver = 2010, annoUnder = 2018;
  let pr = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Marco", cognome: "Rossi", numero: 7, ruoloCampo: "ATT",
    annoNascita: annoOver, leva: LEVA_NAME,
  }});
  PLAYER_OVER13 = pr.json?.id;
  rec("0.SETUP", "Player over13 (Marco Rossi, 2010)", "201", String(pr.status),
    pr.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_OVER13}`);

  pr = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Luca", cognome: "Bianchi", numero: 9, ruoloCampo: "CEN",
    annoNascita: annoUnder, leva: SECOND_LEVA_NAME,
  }});
  PLAYER_UNDER13 = pr.json?.id;
  rec("0.SETUP", "Player under13 (Luca Bianchi, 2018, U10)", "201", String(pr.status),
    pr.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_UNDER13}`);

  pr = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Andrea", cognome: "Verdi", numero: 11, ruoloCampo: "DEF",
    annoNascita: annoOver, leva: LEVA_NAME,
  }});
  PLAYER_OTHER = pr.json?.id;
  rec("0.SETUP", "Player altro over13 (Andrea Verdi)", "201", String(pr.status),
    pr.status === 201 ? "PASS" : "FAIL", `id=${PLAYER_OTHER}`);

  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase1_create_users() {
  console.log("\n=== FASE 1: crea utenti per ogni ruolo ===");

  // 1) MISTER — proviamo prima ruolo 'mister' (forse esiste in enum DB), fallback su allenatore
  const misterEmail = `qa-mister-${RUN_ID}@myvivaio.app`;
  let r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome: "Mister", cognome: "QA", email: misterEmail,
    password: "TestQA2026!!", ruolo: "mister", leva: LEVA_NAME,
  }});
  if (r.status === 201 && r.json?.id) {
    MISTER_ROLE_USED = "mister";
    MISTER_USER_ID = r.json.id;
    rec("1.USERS", "Crea utente ruolo='mister'", "201", "201", "PASS", `id=${MISTER_USER_ID}`);
  } else {
    rec("1.USERS", "Crea utente ruolo='mister' (atteso fallimento se enum non lo include)",
      "201|400|500", String(r.status),
      (r.status >= 400) ? "PASS" : "FAIL",
      `body=${(r.text || "").slice(0, 100)} — fallback a 'allenatore'`);
    // Fallback: allenatore
    r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
      nome: "Mister", cognome: "QA", email: misterEmail,
      password: "TestQA2026!!", ruolo: "allenatore", leva: LEVA_NAME,
    }});
    MISTER_ROLE_USED = "allenatore";
    MISTER_USER_ID = r.json?.id;
    rec("1.USERS", "Crea utente fallback ruolo='allenatore' (proxy per mister)",
      "201", String(r.status), r.status === 201 ? "PASS" : "FAIL", `id=${MISTER_USER_ID}`);
  }
  if (MISTER_USER_ID) {
    // login
    r = await call("POST", "/api/v2/auth/login", {
      body: { email: misterEmail, password: "TestQA2026!!" },
    });
    if (r.ok && r.json?.token) {
      TOKEN_MISTER = r.json.token;
      rec("1.USERS", `Login mister (ruolo='${MISTER_ROLE_USED}')`, "200", "200", "PASS",
        `ruolo=${r.json.user?.ruolo} leva=${r.json.user?.leva}`);
    } else {
      rec("1.USERS", `Login mister`, "200", String(r.status), "FAIL", (r.text || "").slice(0, 150));
    }
  }

  // 2) GENITORE
  const genitoreEmail = `qa-genitore-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome: "Genitore", cognome: "QA", email: genitoreEmail,
    password: "TestQA2026!!", ruolo: "genitore", figli: ["Luca Bianchi"],
  }});
  if (r.status === 201 && r.json?.id) {
    GENITORE_USER_ID = r.json.id;
    rec("1.USERS", "Crea utente genitore", "201", "201", "PASS", `id=${GENITORE_USER_ID}`);
  } else {
    rec("1.USERS", "Crea utente genitore", "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
  }

  // Login genitore
  if (GENITORE_USER_ID) {
    r = await call("POST", "/api/v2/auth/login", {
      body: { email: genitoreEmail, password: "TestQA2026!!" },
    });
    if (r.ok && r.json?.token) {
      TOKEN_GENITORE = r.json.token;
      rec("1.USERS", "Login genitore", "200", "200", "PASS",
        `ruolo=${r.json.user?.ruolo}`);
    } else {
      rec("1.USERS", "Login genitore", "200", String(r.status), "FAIL", (r.text || "").slice(0, 150));
    }
  }

  // Link genitore → player_under13 via /players/:id/claim
  if (TOKEN_GENITORE && PLAYER_UNDER13) {
    r = await call("POST", `/api/v2/players/${PLAYER_UNDER13}/claim`, {
      token: TOKEN_GENITORE, body: {
        role: "papa", consent: true,
        lastNameFull: "Bianchi", birthDate: "2018-05-15",
      },
    });
    if (r.ok) {
      rec("1.USERS", "Link genitore → player under13 (claim)", "200", "200", "PASS",
        `guardianId=${r.json?.guardian?.id}`);
    } else {
      rec("1.USERS", "Link genitore → player under13 (claim)", "200",
        String(r.status), "FAIL", (r.text || "").slice(0, 200));
    }
  }

  // 3) GIOCATORE OVER 13 — stessa coppia nome+cognome del PLAYER_OVER13 (Marco Rossi)
  // così il resolver chat /squadra_ lo matcha implicitamente.
  const giocatoreEmail = `qa-giocatore-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome: "Marco", cognome: "Rossi", email: giocatoreEmail,
    password: "TestQA2026!!", ruolo: "giocatore", leva: LEVA_NAME,
  }});
  if (r.status === 201 && r.json?.id) {
    GIOCATORE_USER_ID = r.json.id;
    rec("1.USERS", "Crea utente giocatore over13", "201", "201", "PASS",
      `id=${GIOCATORE_USER_ID} nome=Marco Rossi (matcha player ${PLAYER_OVER13})`);
  } else {
    rec("1.USERS", "Crea utente giocatore over13", "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
  }

  // Login giocatore
  if (GIOCATORE_USER_ID) {
    r = await call("POST", "/api/v2/auth/login", {
      body: { email: giocatoreEmail, password: "TestQA2026!!" },
    });
    if (r.ok && r.json?.token) {
      TOKEN_GIOCATORE = r.json.token;
      rec("1.USERS", "Login giocatore", "200", "200", "PASS", `ruolo=${r.json.user?.ruolo}`);
    } else {
      rec("1.USERS", "Login giocatore", "200", String(r.status), "FAIL", (r.text || "").slice(0, 150));
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Test condivisi: ogni ruolo cerca le proprie risorse
async function area_MISTER() {
  console.log("\n=== AREA: MISTER ===");
  if (!TOKEN_MISTER) { rec("MISTER","setup","ok","no-token","SKIP","login mister non riuscito"); return; }

  let r = await call("GET", "/api/v2/society", { token: TOKEN_MISTER });
  expect("Atteso 200 (mister della società autenticato)", "MISTER",
    "GET /api/v2/society", [200], r);

  r = await call("GET", "/api/v2/leve", { token: TOKEN_MISTER });
  expect("Atteso 200 (vede leve della società)", "MISTER",
    "GET /api/v2/leve", [200], r,
    Array.isArray(r.json) ? `count=${r.json.length}` : "");

  r = await call("GET", `/api/v2/players?leva=${encodeURIComponent(LEVA_NAME)}`, { token: TOKEN_MISTER });
  expect("Atteso 200 (vede rosa)", "MISTER",
    "GET /api/v2/players?leva=<sua>", [200], r,
    Array.isArray(r.json) ? `count=${r.json.length}` : "");

  // Convocazioni: NO endpoint REST in api-server (vive nel blob FE)
  rec("MISTER", "GET /api/v2/convocazioni",
    "endpoint", "missing", "SKIP",
    "Endpoint REST convocazioni NON ESISTE in api-server. Le convocazioni sono nel blob USERS_DB/FE.");

  // Creazione evento (proxy per "POST convocazione")
  r = await call("POST", "/api/v2/events", { token: TOKEN_MISTER, body: {
    tipo: "allenamento", titolo: `Mister evt ${RUN_ID}`, leve: [LEVA_NAME],
    luogo: "Campo", dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
  }});
  const misterEventId = r.json?.id;
  expect("Atteso 201 (allenatore può creare eventi)", "MISTER",
    "POST /api/v2/events (proxy convocazione)", [201], r, `id=${misterEventId}`);

  // Presenze: GET
  if (misterEventId) {
    r = await call("GET", `/api/v2/presenze?eventId=${misterEventId}`, { token: TOKEN_MISTER });
    expect("Atteso 200", "MISTER", "GET /api/v2/presenze", [200], r);

    r = await call("POST", "/api/v2/presenze/bulk", {
      token: TOKEN_MISTER, body: { eventId: misterEventId, presenze:
        PLAYER_OVER13 ? [{ playerId: PLAYER_OVER13, stato: "presente" }] : [] },
    });
    expect("Atteso 200 (allenatore può segnare presenze sulla SUA leva)", "MISTER",
      "POST /api/v2/presenze/bulk (sua leva)", [200], r);

    // Cleanup evento
    await call("DELETE", `/api/v2/events/${misterEventId}`, { token: TOKEN_ADMIN });
  }

  // Stats leva
  r = await call("GET", `/api/v2/stats/leva?leva=${encodeURIComponent(LEVA_NAME)}`, { token: TOKEN_MISTER });
  expect("Atteso 200", "MISTER", "GET /api/v2/stats/leva (sua)", [200], r);

  // Quote: deve dare 403 (requireRole admin|dirigente)
  r = await call("GET", "/api/v2/quote", { token: TOKEN_MISTER });
  expect("Atteso 403 (allenatore non in admin/dirigente)", "MISTER",
    "GET /api/v2/quote → 403", [403], r);

  // Documenti società: endpoint inesistente in v2 (i documenti vivono nel blob)
  rec("MISTER", "GET /api/v2/documenti",
    "endpoint", "missing", "SKIP",
    "Endpoint REST documenti NON ESISTE in api-server (gestiti via uploadFile blob)");

  // Chat leva
  r = await call("GET", `/api/v2/chat/${encodeURIComponent("staff_" + LEVA_NAME)}/messages`,
    { token: TOKEN_MISTER });
  expect("Atteso 200 (membro staff leva)", "MISTER",
    "GET /api/v2/chat/staff_<sua>/messages", [200], r);

  // Cross-leva: presenze su evento di una leva non sua → atteso 403 via requireLeva
  if (SECOND_LEVA_NAME) {
    // Crea un evento sulla SECOND_LEVA da admin per testare cross-leva
    const evR = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
      tipo: "allenamento", titolo: `Other leva evt ${RUN_ID}`, leve: [SECOND_LEVA_NAME],
      luogo: "Campo", dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
    }});
    const otherEventId = evR.json?.id;
    if (otherEventId && PLAYER_UNDER13) {
      r = await call("POST", "/api/v2/presenze/bulk", {
        token: TOKEN_MISTER, body: { eventId: otherEventId,
          presenze: [{ playerId: PLAYER_UNDER13, stato: "presente" }] },
      });
      expect("Atteso 403 (mister leva A → evento leva B, requireLeva blocca)", "MISTER",
        "POST /api/v2/presenze/bulk (altra leva) → 403", [403], r);
      await call("DELETE", `/api/v2/events/${otherEventId}`, { token: TOKEN_ADMIN });
    }
  }

  // POST player (write-ADMIN_ROLES include allenatore) → atteso 201
  r = await call("POST", "/api/v2/players", { token: TOKEN_MISTER, body: {
    nome: "Pippo", cognome: "Test", annoNascita: 2010, leva: LEVA_NAME,
  }});
  expect("Atteso 201 (ADMIN_ROLES include allenatore)", "MISTER",
    "POST /api/v2/players", [201], r);
  if (r.json?.id) await call("DELETE", `/api/v2/players/${r.json.id}`, { token: TOKEN_ADMIN });

  // Sezione documenti — non esiste endpoint v2, segnalato già sopra
}

// ──────────────────────────────────────────────────────────────────────────────
async function area_GENITORE() {
  console.log("\n=== AREA: GENITORE ===");
  if (!TOKEN_GENITORE) { rec("GENITORE","setup","ok","no-token","SKIP","login genitore non riuscito"); return; }

  // GET society — BACKEND: nessun gating ruolo → 200. Consegna chiede 403.
  let r = await call("GET", "/api/v2/society", { token: TOKEN_GENITORE });
  if (r.status === 403) {
    rec("GENITORE", "GET /api/v2/society → 403", "403", "403", "PASS", "gating attivo");
  } else {
    rec("GENITORE", "GET /api/v2/society → 403", "403", String(r.status), "FAIL",
      "ANOMALIA SICUREZZA: backend non gattella per ruolo, genitore vede dati società");
  }

  // GET players (tutti) — il backend permette: chiunque autenticato vede tutti i player della società.
  // Consegna chiede 403 — testiamo e segnaliamo.
  r = await call("GET", "/api/v2/players", { token: TOKEN_GENITORE });
  if (r.status === 403) {
    rec("GENITORE", "GET /api/v2/players (tutti) → 403", "403", "403", "PASS");
  } else {
    rec("GENITORE", "GET /api/v2/players (tutti) → 403", "403", String(r.status), "FAIL",
      `ANOMALIA SICUREZZA: genitore può listare TUTTI i ${Array.isArray(r.json) ? r.json.length : "?"} giocatori della società`);
  }

  // GET dati figlio — atteso 200
  r = await call("GET", `/api/v2/players/${PLAYER_UNDER13}`, { token: TOKEN_GENITORE });
  expect("Atteso 200 (figlio)", "GENITORE",
    "GET /api/v2/players/:figlioId", [200], r,
    r.json?.nome ? `nome=${r.json.nome} ${r.json.cognome}` : "");

  // GET dati altro giocatore — atteso 403 secondo consegna; backend NON applica ownership
  r = await call("GET", `/api/v2/players/${PLAYER_OTHER}`, { token: TOKEN_GENITORE });
  if (r.status === 403) {
    rec("GENITORE", "GET /api/v2/players/:altroId → 403", "403", "403", "PASS");
  } else {
    rec("GENITORE", "GET /api/v2/players/:altroId → 403", "403", String(r.status), "FAIL",
      "ANOMALIA SICUREZZA: GET /players/:id non gattella per ownership — genitore vede QUALSIASI player");
  }

  // Convocazioni endpoint REST non esiste
  rec("GENITORE", "GET convocazioni figlio",
    "endpoint", "missing", "SKIP",
    "Endpoint REST convocazioni NON ESISTE; le convocazioni vivono nel blob USERS_DB.");

  // POST convocazione — non c'è endpoint convocazioni. Proxy: POST events
  r = await call("POST", "/api/v2/events", { token: TOKEN_GENITORE, body: {
    tipo: "allenamento", titolo: "test", leve: [SECOND_LEVA_NAME], dataInizio: "2026-12-15",
  }});
  expect("Atteso 403 (genitore non in WRITE_ROLES)", "GENITORE",
    "POST /api/v2/events (proxy convocazione) → 403", [403], r);

  // GET presenze — il backend non gattella per ruolo: 200 con dati o lista vuota
  // Per test usiamo un evento creato da admin
  const evR = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
    tipo: "allenamento", titolo: `Genitore test evt ${RUN_ID}`, leve: [SECOND_LEVA_NAME],
    dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
  }});
  const evId = evR.json?.id;
  if (evId) {
    r = await call("GET", `/api/v2/presenze?eventId=${evId}`, { token: TOKEN_GENITORE });
    expect("Atteso 200 (backend non gattella per ruolo)", "GENITORE",
      "GET /api/v2/presenze (evento figlio)", [200], r);
    await call("DELETE", `/api/v2/events/${evId}`, { token: TOKEN_ADMIN });
  }

  // Statistiche figlio
  r = await call("GET", `/api/v2/stats/player/${PLAYER_UNDER13}`, { token: TOKEN_GENITORE });
  expect("Atteso 200", "GENITORE",
    "GET /api/v2/stats/player/:figlioId", [200], r);

  // Statistiche altro giocatore — atteso 403 secondo consegna; backend NON gattella
  r = await call("GET", `/api/v2/stats/player/${PLAYER_OTHER}`, { token: TOKEN_GENITORE });
  if (r.status === 403) {
    rec("GENITORE", "GET stats altro player → 403", "403", "403", "PASS");
  } else {
    rec("GENITORE", "GET stats altro player → 403", "403", String(r.status), "FAIL",
      "ANOMALIA SICUREZZA: stats/player/:id non gattella per ownership");
  }

  // Quote: requireRole admin|dirigente → 403
  r = await call("GET", "/api/v2/quote", { token: TOKEN_GENITORE });
  expect("Atteso 403", "GENITORE", "GET /api/v2/quote → 403", [403], r);

  // POST pagamento (proxy: POST /api/v2/quote)
  r = await call("POST", "/api/v2/quote", { token: TOKEN_GENITORE, body: {
    playerId: PLAYER_UNDER13, importo: 100, stato: "in_attesa",
  }});
  expect("Atteso 403", "GENITORE", "POST /api/v2/quote (pagamento) → 403", [403], r);

  // Chat leva — leva_<U10> = dirigenti + genitori/nonni della leva
  r = await call("GET", `/api/v2/chat/${encodeURIComponent("leva_" + SECOND_LEVA_NAME)}/messages`,
    { token: TOKEN_GENITORE });
  expect("Atteso 200 (membro chat leva famiglie)", "GENITORE",
    "GET /api/v2/chat/leva_<sua>/messages", [200], r);

  // POST messaggio chat
  r = await call("POST", `/api/v2/chat/${encodeURIComponent("leva_" + SECOND_LEVA_NAME)}/messages`, {
    token: TOKEN_GENITORE, body: { testo: `Test genitore ${RUN_ID}` },
  });
  expect("Atteso 201", "GENITORE", "POST /api/v2/chat/leva_<sua>/messages", [200, 201], r);
}

// ──────────────────────────────────────────────────────────────────────────────
async function area_GIOCATORE() {
  console.log("\n=== AREA: GIOCATORE OVER 13 ===");
  if (!TOKEN_GIOCATORE) { rec("GIOCATORE","setup","ok","no-token","SKIP","login giocatore non riuscito"); return; }

  // GET society — consegna chiede 403; backend non gattella
  let r = await call("GET", "/api/v2/society", { token: TOKEN_GIOCATORE });
  if (r.status === 403) {
    rec("GIOCATORE", "GET /api/v2/society → 403", "403", "403", "PASS");
  } else {
    rec("GIOCATORE", "GET /api/v2/society → 403", "403", String(r.status), "FAIL",
      "ANOMALIA SICUREZZA: giocatore vede dati società");
  }

  // GET players — consegna chiede 403; backend non gattella
  r = await call("GET", "/api/v2/players", { token: TOKEN_GIOCATORE });
  if (r.status === 403) {
    rec("GIOCATORE", "GET /api/v2/players (tutti) → 403", "403", "403", "PASS");
  } else {
    rec("GIOCATORE", "GET /api/v2/players (tutti) → 403", "403", String(r.status), "FAIL",
      `ANOMALIA SICUREZZA: giocatore lista ${Array.isArray(r.json) ? r.json.length : "?"} giocatori`);
  }

  // GET dati propri (player con stesso nome+cognome) — atteso 200
  r = await call("GET", `/api/v2/players/${PLAYER_OVER13}`, { token: TOKEN_GIOCATORE });
  expect("Atteso 200", "GIOCATORE", "GET /api/v2/players/:idProprio", [200], r,
    r.json?.nome ? `nome=${r.json.nome} ${r.json.cognome}` : "");

  // GET dati altro giocatore — atteso 403 secondo consegna; backend non gattella
  r = await call("GET", `/api/v2/players/${PLAYER_OTHER}`, { token: TOKEN_GIOCATORE });
  if (r.status === 403) {
    rec("GIOCATORE", "GET /api/v2/players/:altroId → 403", "403", "403", "PASS");
  } else {
    rec("GIOCATORE", "GET /api/v2/players/:altroId → 403", "403", String(r.status), "FAIL",
      "ANOMALIA SICUREZZA: giocatore vede dati di QUALSIASI altro player");
  }

  // Convocazioni endpoint non esiste
  rec("GIOCATORE", "GET convocazioni proprie",
    "endpoint", "missing", "SKIP", "endpoint REST non esiste");

  // POST convocazione (proxy POST events) — atteso 403
  r = await call("POST", "/api/v2/events", { token: TOKEN_GIOCATORE, body: {
    tipo: "allenamento", titolo: "test", leve: [LEVA_NAME], dataInizio: "2026-12-15",
  }});
  expect("Atteso 403 (giocatore non in WRITE_ROLES)", "GIOCATORE",
    "POST /api/v2/events → 403", [403], r);

  // GET presenze proprie — 200 (backend non gattella)
  const evR = await call("POST", "/api/v2/events", { token: TOKEN_ADMIN, body: {
    tipo: "allenamento", titolo: `Giocatore test evt ${RUN_ID}`, leve: [LEVA_NAME],
    dataInizio: "2026-12-15", oraInizio: "18:00", ricorrente: false,
  }});
  const evId = evR.json?.id;
  if (evId) {
    r = await call("GET", `/api/v2/presenze?eventId=${evId}`, { token: TOKEN_GIOCATORE });
    expect("Atteso 200 (backend non gattella per ruolo)", "GIOCATORE",
      "GET /api/v2/presenze (evento sua leva)", [200], r);
    await call("DELETE", `/api/v2/events/${evId}`, { token: TOKEN_ADMIN });
  }

  // Statistiche proprie
  r = await call("GET", `/api/v2/stats/player/${PLAYER_OVER13}`, { token: TOKEN_GIOCATORE });
  expect("Atteso 200", "GIOCATORE", "GET /api/v2/stats/player/:proprio", [200], r);

  // Quote
  r = await call("GET", "/api/v2/quote", { token: TOKEN_GIOCATORE });
  expect("Atteso 403", "GIOCATORE", "GET /api/v2/quote → 403", [403], r);

  // POST pagamento
  r = await call("POST", "/api/v2/quote", { token: TOKEN_GIOCATORE, body: {
    playerId: PLAYER_OVER13, importo: 100, stato: "in_attesa",
  }});
  expect("Atteso 403", "GIOCATORE", "POST /api/v2/quote → 403", [403], r);

  // Chat squadra (U14+ giocatori)
  r = await call("GET", `/api/v2/chat/${encodeURIComponent("squadra_" + LEVA_NAME)}/messages`,
    { token: TOKEN_GIOCATORE });
  expect("Atteso 200", "GIOCATORE",
    "GET /api/v2/chat/squadra_<sua>/messages", [200], r);

  r = await call("POST", `/api/v2/chat/${encodeURIComponent("squadra_" + LEVA_NAME)}/messages`, {
    token: TOKEN_GIOCATORE, body: { testo: `Test giocatore ${RUN_ID}` },
  });
  expect("Atteso 201", "GIOCATORE", "POST /api/v2/chat/squadra_<sua>/messages", [200, 201], r);
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase3_cross_ruolo() {
  console.log("\n=== FASE 3: TEST CROSS-RUOLO ===");

  if (TOKEN_GENITORE && PLAYER_OVER13) {
    let r = await call("GET", `/api/v2/players/${PLAYER_OVER13}`, { token: TOKEN_GENITORE });
    if (r.status === 403) {
      rec("CROSS", "Genitore GET player over13 NON-figlio → 403", "403", "403", "PASS");
    } else {
      rec("CROSS", "Genitore GET player over13 NON-figlio → 403", "403", String(r.status), "FAIL",
        `ANOMALIA: genitore vede dati di player non collegato (status=${r.status})`);
    }
  }

  if (TOKEN_GIOCATORE && GENITORE_USER_ID) {
    // GET /api/v2/users (admin-only) per leggere dati genitore — atteso 403
    const r = await call("GET", "/api/v2/users", { token: TOKEN_GIOCATORE });
    expect("Atteso 403 (GET /users richiede admin)", "CROSS",
      "Giocatore GET /api/v2/users (per leggere genitori) → 403", [403], r);
  }

  if (TOKEN_MISTER) {
    const r = await call("POST", "/api/v2/quote", { token: TOKEN_MISTER, body: {
      playerId: PLAYER_OVER13, importo: 100, stato: "in_attesa",
    }});
    expect("Atteso 403 (allenatore/mister non in admin|dirigente)", "CROSS",
      "Mister POST /api/v2/quote → 403", [403], r);
  }

  if (TOKEN_GENITORE && SECOND_LEVA_NAME && LEVA_NAME) {
    // GENITORE_USER_ID è collegato a player_under13 (leva U10/SECOND).
    // Accesso a chat di un'ALTRA leva (LEVA_NAME = U14) tramite leva_<altra>
    // GET messages: backend NON gattella membership → 200. Consegna vuole 403.
    const r = await call("GET", `/api/v2/chat/${encodeURIComponent("leva_" + LEVA_NAME)}/messages`,
      { token: TOKEN_GENITORE });
    if (r.status === 403) {
      rec("CROSS", "Genitore GET chat di altra leva → 403", "403", "403", "PASS");
    } else {
      rec("CROSS", "Genitore GET chat di altra leva → 403", "403", String(r.status), "FAIL",
        "ANOMALIA: GET /chat/:chatId/messages non controlla membership → leggi qualsiasi chat");
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\n=== CLEANUP ===");
  async function tryDel(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    rec("CLEANUP", label, "200|204|404", String(r.status),
      r.ok || r.status === 404 ? "PASS" : "SKIP");
  }
  if (GIOCATORE_USER_ID) await tryDel(`DELETE user giocatore ${GIOCATORE_USER_ID}`, `/api/v2/users/${GIOCATORE_USER_ID}`);
  if (GENITORE_USER_ID)  await tryDel(`DELETE user genitore ${GENITORE_USER_ID}`,  `/api/v2/users/${GENITORE_USER_ID}`);
  if (MISTER_USER_ID)    await tryDel(`DELETE user mister ${MISTER_USER_ID}`,      `/api/v2/users/${MISTER_USER_ID}`);
  if (PLAYER_OVER13)   await tryDel(`DELETE player over13 ${PLAYER_OVER13}`, `/api/v2/players/${PLAYER_OVER13}`);
  if (PLAYER_UNDER13)  await tryDel(`DELETE player under13 ${PLAYER_UNDER13}`, `/api/v2/players/${PLAYER_UNDER13}`);
  if (PLAYER_OTHER)    await tryDel(`DELETE player other ${PLAYER_OTHER}`, `/api/v2/players/${PLAYER_OTHER}`);
  if (SECOND_LEVA_ID)  await tryDel(`DELETE second leva ${SECOND_LEVA_ID}`, `/api/v2/leve/${SECOND_LEVA_ID}`);
  if (LEVA_ID)         await tryDel(`DELETE leva ${LEVA_ID}`, `/api/v2/leve/${LEVA_ID}`);

  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA cleanup ruoli ${RUN_ID}` } });
    rec("CLEANUP", `SUSPEND società ${SOC_ID} (manca DELETE)`,
      "200", String(r.status), r.ok ? "PASS" : "SKIP", (r.text || "").slice(0, 120));
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MyVivaio — Test RUOLI piano Società — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();

  const okSetup = await phase0_setup();
  if (!okSetup) {
    console.log("\n⛔ STOP: setup fallito");
  } else {
    await phase1_create_users();
    try { await area_MISTER();    } catch (e) { rec("MISTER","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await area_GENITORE();  } catch (e) { rec("GENITORE","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await area_GIOCATORE(); } catch (e) { rec("GIOCATORE","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await phase3_cross_ruolo(); } catch (e) { rec("CROSS","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
    try { await cleanup(); } catch (e) { rec("CLEANUP","err","ok",e.message,"FAIL", e.stack?.slice(0,200)); }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(64));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(64));

  fs.writeFileSync("test-societa-ruoli-results.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    runId: RUN_ID,
    socId: SOC_ID,
    misterRoleUsed: MISTER_ROLE_USED,
    counts,
    elapsedSec: parseFloat(elapsed),
    results,
  }, null, 2));
  console.log("→ Risultati JSON: test-societa-ruoli-results.json");

  process.exit(counts.FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error("FATAL:", e); process.exit(2); });
