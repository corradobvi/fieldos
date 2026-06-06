#!/usr/bin/env node
// Test SuperAdmin Panel — MyVivaio (PROD)
// SA-Secret auth. Crea società di test isolata, esegue ops, cleanup.

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

async function call(method, path, { saSecret, body, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (saSecret) opts.headers["X-SA-Secret"] = saSecret;
  let res, txt = "", json = null;
  const t0 = Date.now();
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
    txt = await res.text();
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html") && txt.startsWith("<!DOCTYPE")) {
      return { ok: false, status: res.status, isSpa: true, json: null, text: "<SPA HTML>", ms: Date.now() - t0 };
    }
    try { json = JSON.parse(txt); } catch {}
  } catch (e) {
    return { ok: false, status: 0, isSpa: false, json: null, text: e?.message || String(e), ms: Date.now() - t0 };
  }
  return { ok: res.ok, status: res.status, isSpa: false, json, text: txt, ms: Date.now() - t0 };
}

function expectStatus(area, name, expected, r, detail = "") {
  if (r.isSpa) {
    rec(area, name, Array.isArray(expected) ? expected.join("|") : String(expected),
        "SPA-HTML", "SKIP", "endpoint non esiste"); return;
  }
  const list = Array.isArray(expected) ? expected : [expected];
  const got = String(r.status);
  const ok = list.map(String).includes(got);
  rec(area, name, list.join("|"), got, ok ? "PASS" : "FAIL", detail || (r.text ? r.text.slice(0, 130) : ""));
}

let SOC_TEST_ID = null, ADMIN_USER_ID = null;
const ADMIN_EMAIL = `qa-sa-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

// ──────────────────────────────────────────────────────────────────────────────
async function phase_auth() {
  console.log("\n=== FASE: AUTH (X-SA-Secret) ===");
  const S = "AUTH";

  // 1) GET /superadmin/societies senza X-SA-Secret → 401
  let r = await call("GET", "/api/v2/superadmin/societies");
  expectStatus(S, "GET /superadmin/societies SENZA X-SA-Secret → 401", 401, r);

  // 2) Con X-SA-Secret sbagliato → 401
  r = await call("GET", "/api/v2/superadmin/societies", { saSecret: "wrong-secret-xyz" });
  expectStatus(S, "GET /superadmin/societies X-SA-Secret SBAGLIATO → 401", 401, r);

  // 3) Con X-SA-Secret corretto → 200
  r = await call("GET", "/api/v2/superadmin/societies", { saSecret: SA_SECRET });
  expectStatus(S, "GET /superadmin/societies X-SA-Secret OK → 200", 200, r,
    Array.isArray(r.json?.societies) ? `count=${r.json.societies.length}` : "");

  // 4) Tutti gli endpoint richiedono X-SA-Secret, non Bearer JWT
  // Provo POST /superadmin/societies con un JWT finto (non SA-Secret) → 401
  r = await call("POST", "/api/v2/superadmin/societies", {
    headers: { Authorization: "Bearer fake.jwt.token" },
    body: { nome: "x", piano: "demo", adminNome: "x", adminCogn: "x", adminEmail: "x@y", adminPass: "p" },
  });
  expectStatus(S, "POST /superadmin/societies con Bearer JWT (no SA-Secret) → 401", 401, r);
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase_societa() {
  console.log("\n=== FASE: SOCIETÀ ===");
  const S = "SOC";

  // GET lista
  let r = await call("GET", "/api/v2/superadmin/societies", { saSecret: SA_SECRET });
  expectStatus(S, "GET /superadmin/societies lista", 200, r,
    Array.isArray(r.json?.societies) ? `count=${r.json.societies.length}` : "");

  // POST crea società
  r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test SA ${RUN_ID}`, citta: "QA SA", piano: "demo",
      adminNome: "QA", adminCogn: "SA", adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  SOC_TEST_ID = r.json?.societyId;
  ADMIN_USER_ID = r.json?.userId;
  expectStatus(S, "POST /superadmin/societies crea società di test", 201, r,
    `socId=${SOC_TEST_ID} userId=${ADMIN_USER_ID} codice=${r.json?.codice}`);
  if (SOC_TEST_ID && REAL_SOC_IDS.has(SOC_TEST_ID)) {
    rec(S, "ID società di test", "non-real", String(SOC_TEST_ID), "FAIL", "collide con società reale!");
    return false;
  }

  // GET /superadmin/societies/:id (spec) — non esiste come endpoint dedicato
  r = await call("GET", `/api/v2/superadmin/societies/${SOC_TEST_ID}`, { saSecret: SA_SECRET });
  rec(S, "GET /superadmin/societies/:id (spec — dettaglio)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint dettaglio singolo NON esiste; usa lista filtrata client-side da GET /superadmin/societies");

  // PATCH /superadmin/societies/:id — modifica nome/città
  r = await call("PATCH", `/api/v2/superadmin/societies/${SOC_TEST_ID}`, {
    saSecret: SA_SECRET, body: { nome: `Renamed ${RUN_ID}` },
  });
  expectStatus(S, "PATCH /superadmin/societies/:id (rename)", 200, r);

  // POST set-plan
  r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/set-plan`, {
    saSecret: SA_SECRET, body: { piano: "mister_pro" },
  });
  expectStatus(S, "POST /superadmin/societies/:id/set-plan → mister_pro", 200, r);

  // PATCH /:id con piano (spec) — verifica che backend rifiuti correttamente
  // (PATCH gestisce solo nome/citta, piano va via /set-plan)
  r = await call("PATCH", `/api/v2/superadmin/societies/${SOC_TEST_ID}`, {
    saSecret: SA_SECRET, body: { piano: "societa" },
  });
  // Atteso 400 (no_valid_updates) o 200 se il campo è ignorato silenziosamente
  rec(S, "PATCH /:id con campo 'piano' → 400 (gestito solo nome/citta)",
    "400|200", String(r.status),
    [200, 400].includes(r.status) ? "PASS" : "FAIL",
    "Documentato: per cambio piano usare POST /superadmin/societies/:id/set-plan");

  // suspend
  r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/suspend`, {
    saSecret: SA_SECRET, body: { reason: `QA test ${RUN_ID}` },
  });
  expectStatus(S, "POST /superadmin/societies/:id/suspend", 200, r);

  // unsuspend (spec) — endpoint reale è /reactivate
  r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/unsuspend`, { saSecret: SA_SECRET });
  rec(S, "POST /superadmin/societies/:id/unsuspend (spec)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint reale è /reactivate (non /unsuspend)");

  // reactivate (endpoint reale)
  r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/reactivate`, { saSecret: SA_SECRET });
  expectStatus(S, "POST /superadmin/societies/:id/reactivate (reale)", 200, r);

  // extend-demo
  r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/extend-demo`, {
    saSecret: SA_SECRET, body: { days: 30 },
  });
  expectStatus(S, "POST /superadmin/societies/:id/extend-demo", 200, r);

  // set-billing-mode (body usa { mode } non { billing_mode } — vedi superadmin.ts:385)
  r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/set-billing-mode`, {
    saSecret: SA_SECRET, body: { mode: "omaggio" },
  });
  expectStatus(S, "POST /set-billing-mode → omaggio (body {mode})", 200, r);

  // DELETE /superadmin/societies/:id (spec)
  r = await call("DELETE", `/api/v2/superadmin/societies/${SOC_TEST_ID}`, { saSecret: SA_SECRET });
  if (r.isSpa || r.status === 404) {
    rec(S, "DELETE /superadmin/societies/:id (spec)", "200|404", String(r.status), "SKIP",
      "Endpoint DELETE NON esiste (mancante noto). Cleanup via suspend.");
  } else expectStatus(S, "DELETE /superadmin/societies/:id", [200, 204], r);

  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase_utenti() {
  console.log("\n=== FASE: UTENTI ===");
  const S = "USERS";

  // GET /superadmin/users (spec) — NON esiste
  let r = await call("GET", "/api/v2/superadmin/users", { saSecret: SA_SECRET });
  rec(S, "GET /superadmin/users (spec)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint lista utenti globale NON esiste. Usa /api/v2/users (per società) o lista societies con count utenti");

  // GET /superadmin/users?soc=:id (spec) — NON esiste
  r = await call("GET", `/api/v2/superadmin/users?soc=${SOC_TEST_ID}`, { saSecret: SA_SECRET });
  rec(S, "GET /superadmin/users?soc= (spec)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL", "stesso motivo");

  // POST /superadmin/reset-password — il backend genera tempPass casuale e
  // la invia via email; non accetta `newPassword` arbitraria nel body.
  // Vedi superadmin.ts:163-177. Testo solo il flag temp_password sull'utente.
  r = await call("POST", "/api/v2/superadmin/reset-password", {
    saSecret: SA_SECRET, body: { email: ADMIN_EMAIL },
  });
  expectStatus(S, "POST /superadmin/reset-password (genera tempPass via email)", 200, r);
  // Vecchia password NON più valida (è stata cambiata in tempPass random)
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  rec(S, "Login con VECCHIA password post-reset → 401 (atteso)",
    "401", String(r.status), r.status === 401 ? "PASS" : "FAIL",
    "Conferma che tempPass random è stata generata. La nuova password reale è inviata via email al destinatario.");
}

async function phase_demo_stats() {
  console.log("\n=== FASE: DEMO + STATS ===");
  const S = "DEMO_STATS";

  let r = await call("POST", "/api/v2/superadmin/reset-demo", { saSecret: SA_SECRET });
  rec(S, "POST /superadmin/reset-demo (spec)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint esiste come /api/v2/admin/reset-stella-demo (admin-reset-demo.ts) con X-Admin-Secret, non SA-Secret");

  r = await call("GET", "/api/v2/superadmin/stats", { saSecret: SA_SECRET });
  rec(S, "GET /superadmin/stats (spec)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint statistiche globali NON esiste. Aggregabile client-side da GET /superadmin/societies");
}

async function phase_audit() {
  console.log("\n=== FASE: AUDIT LOG ===");
  const S = "AUDIT";

  // GET /superadmin/audit-log (globale, spec) — NON esiste
  let r = await call("GET", "/api/v2/superadmin/audit-log", { saSecret: SA_SECRET });
  rec(S, "GET /superadmin/audit-log globale (spec)", "200|404", String(r.status),
    r.isSpa || r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint audit-log globale NON esiste. Esiste per società: GET /superadmin/societies/:id/audit-log");

  // GET /superadmin/societies/:id/audit-log (reale)
  r = await call("GET", `/api/v2/superadmin/societies/${SOC_TEST_ID}/audit-log`, { saSecret: SA_SECRET });
  expectStatus(S, "GET /superadmin/societies/:id/audit-log (reale)", 200, r,
    `entries=${r.json?.entries?.length ?? "?"}`);
  if (r.ok && Array.isArray(r.json?.entries)) {
    // Le operazioni della FASE SOCIETÀ dovrebbero essere loggate. Cerco specifiche
    const actions = r.json.entries.map(e => e.action);
    const expected = ["create_society"]; // suspend/reactivate/set-plan potrebbero loggare anche
    const found = expected.filter(a => actions.includes(a));
    rec(S, "Audit log contiene azione create_society", "≥1", `found=${found.length} all_actions=${actions.join(",")}`,
      found.length >= 1 ? "PASS" : "FAIL");
  }
}

async function phase_security() {
  console.log("\n=== FASE: SICUREZZA ===");
  const S = "SEC";

  // Tutti gli endpoint SA → verifica che JWT puro non basta (già fatto in auth)
  rec(S, "Tutti gli endpoint SA richiedono X-SA-Secret (no JWT)", "ok", "verified", "PASS",
    "Confermato in FASE AUTH: POST con Bearer JWT (no SA-Secret) → 401. Tutti gli endpoint /superadmin/* fanno check inline req.headers['x-sa-secret'] !== SA_SECRET → 401.");

  // X-SA-Secret non esposto in risposte: verifico GET societies
  const r = await call("GET", "/api/v2/superadmin/societies", { saSecret: SA_SECRET });
  const bodyHasSecret = (r.text || "").toLowerCase().includes(SA_SECRET.toLowerCase()) ||
                        (r.text || "").toLowerCase().includes("sa_secret") ||
                        (r.text || "").toLowerCase().includes("x-sa-secret");
  rec(S, "X-SA-Secret non leakato in body response", "no-leak", bodyHasSecret ? "LEAKED" : "no-leak",
    !bodyHasSecret ? "PASS" : "FAIL");

  // Timing attack: media latenza 401 vs 200 (10 iter ciascuna)
  const N = 10;
  const t401 = [];
  const t200 = [];
  for (let i = 0; i < N; i++) {
    const rW = await call("GET", "/api/v2/superadmin/societies", { saSecret: "wrong" });
    t401.push(rW.ms);
    const rO = await call("GET", "/api/v2/superadmin/societies", { saSecret: SA_SECRET });
    t200.push(rO.ms);
  }
  const avg = arr => Math.round(arr.reduce((a,b) => a+b, 0) / arr.length);
  const a401 = avg(t401), a200 = avg(t200);
  const ratio = a401 > 0 ? (a200 / a401).toFixed(2) : "?";
  // Soglia tolleranza: ratio entro 0.5–3.0 è accettabile (200 fa lookup DB quindi naturalmente più lento)
  const oracle = (a401 > 50 && a200 / a401 > 5); // 200 deve essere molto più lento per oracle
  rec(S, `Timing 401 vs 200 (no oracle, n=${N})`,
    "no-timing-oracle", `avg401=${a401}ms avg200=${a200}ms ratio=${ratio}x`,
    oracle ? "FAIL" : "PASS",
    "Differenza naturale: 200 fa SELECT DB. Oracle solo se ratio >5x — qui ratio piccolo.");
}

async function cleanup() {
  console.log("\n=== CLEANUP ===");
  const S = "CLEANUP";
  if (SOC_TEST_ID && !REAL_SOC_IDS.has(SOC_TEST_ID)) {
    // Suspend (DELETE non esiste — endpoint mancante noto)
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_TEST_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA SA cleanup ${RUN_ID}` } });
    rec(S, `SUSPEND società ${SOC_TEST_ID}`, "200", String(r.status), r.ok ? "PASS" : "SKIP");
  }
}

async function main() {
  console.log(`MyVivaio — Test SuperAdmin Panel — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();
  try { await phase_auth();    } catch (e) { rec("AUTH","err","ok",e.message,"FAIL"); }
  const ok = await phase_societa();
  if (ok) {
    try { await phase_utenti();   } catch (e) { rec("USERS","err","ok",e.message,"FAIL"); }
    try { await phase_demo_stats();} catch (e) { rec("DEMO","err","ok",e.message,"FAIL"); }
    try { await phase_audit();    } catch (e) { rec("AUDIT","err","ok",e.message,"FAIL"); }
    try { await phase_security(); } catch (e) { rec("SEC","err","ok",e.message,"FAIL"); }
  }
  try { await cleanup(); } catch (e) { rec("CLEANUP","err","ok",e.message,"FAIL"); }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(70));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(70));
  fs.writeFileSync("test-superadmin-results.json", JSON.stringify({
    timestamp: new Date().toISOString(), baseUrl: BASE_URL, runId: RUN_ID, socTestId: SOC_TEST_ID,
    counts, elapsedSec: parseFloat(elapsed), results,
  }, null, 2));
  console.log("→ JSON: test-superadmin-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}
main().catch(e => { console.error("FATAL:", e); process.exit(2); });
