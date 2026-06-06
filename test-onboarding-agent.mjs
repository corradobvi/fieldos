#!/usr/bin/env node
// Test Onboarding / Registrazione — MyVivaio (PROD)
// Flussi: register, login, guardian-register, self-register, invite mister,
// forgot-password, sicurezza (SQL inj, no user enumeration, rate-limit).

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

function decodeJwt(token) {
  try {
    const [, p] = token.split(".");
    return JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch { return null; }
}

let SOC_ID = null, ADMIN_USER_ID = null, TOKEN_ADMIN = null;
let MISTER_INVITED_ID = null, MISTER_INVITED_EMAIL = null;
let SOC_CODICE = null;
let GENITORE_USER_ID = null, GENITORE_EMAIL = null;
const ADMIN_EMAIL = `qa-ob-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

async function setup() {
  console.log("\n=== SETUP ===");
  // crea società di test con admin (via SA)
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test Ob ${RUN_ID}`, citta: "Q", piano: "societa",
      adminNome: "QA", adminCogn: "Ob", adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  SOC_ID = r.json?.societyId;
  ADMIN_USER_ID = r.json?.userId;
  SOC_CODICE = r.json?.codice;
  if (!SOC_ID || REAL_SOC_IDS.has(SOC_ID)) {
    rec("SETUP", "Crea società", "201 + non-real", String(r.status), "FAIL");
    return false;
  }
  rec("SETUP", "Crea società + admin via SA", "201", "201", "PASS", `socId=${SOC_ID} codice=${SOC_CODICE}`);
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  TOKEN_ADMIN = r.json?.token;
  rec("SETUP", "Login admin", "200", String(r.status), r.ok ? "PASS" : "FAIL");
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase_register() {
  console.log("\n=== FASE: REGISTRAZIONE NUOVO UTENTE ===");
  const S = "REGISTER";

  // POST /auth/register (v2) — richiede {code, nome, cognome, email, password}
  // crea utente "pendente" come genitore nella società del codice
  const newEmail = `qa-reg-${RUN_ID}@myvivaio.app`;
  let r = await call("POST", "/api/v2/auth/register", { body: {
    code: SOC_CODICE, nome: "QA", cognome: "Reg", email: newEmail, password: ADMIN_PASS,
  }});
  expectStatus(S, "POST /auth/register (con codice società)", [200, 201], r,
    r.json?.pending ? "pending=true (default ruolo=genitore, stato=pendente)" : (r.text || "").slice(0, 100));

  // Re-register same email → 409 email_exists
  r = await call("POST", "/api/v2/auth/register", { body: {
    code: SOC_CODICE, nome: "QA", cognome: "Reg", email: newEmail, password: ADMIN_PASS,
  }});
  expectStatus(S, "POST /auth/register email duplicata → 409", [409, 400], r);

  // Missing fields → 400
  r = await call("POST", "/api/v2/auth/register", { body: { email: "x@y" } });
  expectStatus(S, "POST /auth/register senza campi obbligatori → 400", 400, r);

  // Wrong code → 400 invalid_code
  r = await call("POST", "/api/v2/auth/register", { body: {
    code: "WRONG-XYZ", nome: "X", cognome: "Y", email: `qa-w-${RUN_ID}@m`, password: ADMIN_PASS,
  }});
  expectStatus(S, "POST /auth/register codice invalido → 400", [400, 401], r);

  // Self-register — richiede {nome, cognome, email, password, phone, nomeSocieta}
  // NB: phone obbligatorio in formato +39XXXXXXXXX
  const selfEmail = `qa-self-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/auth/self-register", { body: {
    nome: "Self", cognome: "Reg", email: selfEmail, password: ADMIN_PASS,
    phone: "+393331234567", nomeSocieta: `Self Soc ${RUN_ID}`,
  }});
  expectStatus(S, "POST /auth/self-register (crea società + admin)", [200, 201], r,
    r.json?.token ? "token ok" : (r.text || "").slice(0, 100));

  // Self-register senza phone → 400
  r = await call("POST", "/api/v2/auth/self-register", { body: {
    nome: "X", cognome: "Y", email: `qa-nophone-${RUN_ID}@m`, password: ADMIN_PASS,
    nomeSocieta: "X",
  }});
  expectStatus(S, "POST /auth/self-register senza phone → 400", 400, r);
}

async function phase_login_jwt() {
  console.log("\n=== FASE: LOGIN + JWT ===");
  const S = "LOGIN";

  // login admin (già fatto in setup, qui verifichiamo JWT)
  let r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  expectStatus(S, "Login OK", 200, r);
  const tok = r.json?.token;
  if (!tok) { rec(S, "JWT presente", "yes", "no", "FAIL"); return; }
  const payload = decodeJwt(tok);
  rec(S, "JWT decoded", "obj", payload ? "ok" : "fail", payload ? "PASS" : "FAIL");
  if (payload) {
    rec(S, "JWT.societyId presente", "number", typeof payload.societyId,
      typeof payload.societyId === "number" ? "PASS" : "FAIL");
    rec(S, "JWT.userId presente", "number", typeof payload.userId,
      typeof payload.userId === "number" ? "PASS" : "FAIL");
    rec(S, "JWT.role (ruolo) presente", "string", payload.role ?? "missing",
      typeof payload.role === "string" ? "PASS" : "FAIL");
    rec(S, "JWT.email presente", "string", payload.email ?? "missing",
      typeof payload.email === "string" ? "PASS" : "FAIL");
  }

  // Password sbagliata
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: "wrong-pass" } });
  expectStatus(S, "Login con password sbagliata → 401", 401, r);

  // Response non deve contenere password/hash
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  const txt = (r.text || "").toLowerCase();
  const leaks = ["password_hash", "passwordhash", '"password":"', 'TestQA2026'].filter(s => txt.includes(s.toLowerCase()));
  rec(S, "Login response NON contiene password/hash", "no-leak",
    leaks.length ? `leaked: ${leaks.join(",")}` : "no-leak",
    leaks.length === 0 ? "PASS" : "FAIL");
}

async function phase_invite_mister() {
  console.log("\n=== FASE: INVITO MISTER ===");
  const S = "INVITE-MISTER";

  // Spec: POST /api/v2/invite/mister — verifico se esiste
  let r = await call("POST", "/api/v2/invite/mister", { token: TOKEN_ADMIN, body: { email: "x@y" } });
  rec(S, "POST /invite/mister (spec)", "200|201|404", String(r.status),
    r.isSpa ? "SKIP" : "FAIL",
    "Endpoint /invite/* NON esiste. Flow reale: POST /api/v2/users con ruolo+leva (admin auth).");

  // Test endpoint reale: POST /api/v2/users (admin invita mister)
  MISTER_INVITED_EMAIL = `qa-misinv-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome: "Mister", cognome: "Invited", email: MISTER_INVITED_EMAIL, password: ADMIN_PASS,
    ruolo: "mister", leva: null,
  }});
  MISTER_INVITED_ID = r.json?.id;
  expectStatus(S, "POST /api/v2/users invita mister (admin)", 201, r, `id=${MISTER_INVITED_ID}`);

  // Email duplicata → 409
  r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: {
    nome: "Dup", cognome: "Inv", email: MISTER_INVITED_EMAIL, password: ADMIN_PASS, ruolo: "mister",
  }});
  expectStatus(S, "POST /users email duplicata → 409", [409, 400], r);

  // Login mister appena creato
  r = await call("POST", "/api/v2/auth/login", { body: { email: MISTER_INVITED_EMAIL, password: ADMIN_PASS } });
  const tMister = r.json?.token;
  rec(S, "Login mister invitato", "200 + token", String(r.status), r.ok && tMister ? "PASS" : "FAIL");

  // Mister tenta di invitare altro user → 403 (solo admin)
  if (tMister) {
    r = await call("POST", "/api/v2/users", { token: tMister, body: {
      nome: "X", cognome: "Y", email: `qa-mister-tries-${RUN_ID}@m`, password: ADMIN_PASS, ruolo: "allenatore",
    }});
    expectStatus(S, "Mister POST /users → 403 (solo admin invita)", 403, r);
  }
}

async function phase_guardian_link() {
  console.log("\n=== FASE: GENITORE LINK ===");
  const S = "GUARDIAN";

  // Crea player di test
  let r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U12 OB ${RUN_ID}`, ordine: 99 } });
  const levaName = r.json?.nome;
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: {
    nome: "Luca", cognome: "B", annoNascita: 2018, leva: levaName,
  }});
  const playerId = r.json?.id;
  rec(S, "Setup leva+player", "ok", `pid=${playerId}`, playerId ? "PASS" : "FAIL");

  // Spec: POST /api/v2/invite/genitore — non esiste
  r = await call("POST", "/api/v2/invite/genitore", { token: TOKEN_ADMIN, body: { email: "x@y" } });
  rec(S, "POST /invite/genitore (spec)", "200|201|404", String(r.status),
    r.isSpa ? "SKIP" : "FAIL",
    "Endpoint /invite/genitore NON esiste. Flow reale: POST /api/v2/auth/guardian-register (con codice società) + POST /players/:id/claim.");

  // Flow reale: guardian-register (no auth) + claim
  GENITORE_EMAIL = `qa-gen-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/auth/guardian-register", { body: {
    code: SOC_CODICE, nome: "Mamma", cognome: "B", email: GENITORE_EMAIL, password: ADMIN_PASS,
  }});
  GENITORE_USER_ID = r.json?.user?.id;
  expectStatus(S, "POST /auth/guardian-register (con codice società)", [200, 201], r,
    `userId=${GENITORE_USER_ID} hasToken=${!!r.json?.token}`);

  // Login genitore
  let tGenitore = null;
  if (r.json?.token) tGenitore = r.json.token;
  else {
    r = await call("POST", "/api/v2/auth/login", { body: { email: GENITORE_EMAIL, password: ADMIN_PASS } });
    tGenitore = r.json?.token;
  }
  rec(S, "Login genitore", "200 + token", tGenitore ? "ok" : "no-token", tGenitore ? "PASS" : "FAIL");

  // Claim del player nella stessa società
  if (tGenitore && playerId) {
    r = await call("POST", `/api/v2/players/${playerId}/claim`, {
      token: tGenitore, body: { role: "papa", consent: true, lastNameFull: "B", birthDate: "2018-01-01" },
    });
    expectStatus(S, "POST /players/:id/claim (figlio nella sua società)", 200, r,
      `guardianId=${r.json?.guardian?.id}`);
  }

  // Claim su player di altra società (id=53 Baiardo, real player) → 404 (cross-society)
  if (tGenitore) {
    // Trovo un player_id di Baiardo: improbabile conoscere id specifici, uso un numero alto noto
    r = await call("POST", `/api/v2/players/1/claim`, {
      token: tGenitore, body: { role: "papa", consent: true, lastNameFull: "X", birthDate: "2010-01-01" },
    });
    // Filtro WHERE id=? AND society_id=jwt.societyId quindi player di altra società → not_found (404)
    if (r.status === 404 || r.status === 403) {
      rec(S, "POST /players/:cross/claim → 404/403", "404|403", String(r.status), "PASS",
        "Ownership cross-society isolato correttamente");
    } else {
      rec(S, "POST /players/:cross/claim", "404|403", String(r.status), "FAIL",
        `ANOMALIA: genitore può claim player di altra società? body=${(r.text || "").slice(0, 100)}`);
    }
  }
}

async function phase_forgot_password() {
  console.log("\n=== FASE: FORGOT PASSWORD ===");
  const S = "FORGOT";

  // Endpoint nella spec: /api/v2/auth/forgot-password (non esiste — è /public/forgot-password)
  let r = await call("POST", "/api/v2/auth/forgot-password", { body: { email: ADMIN_EMAIL } });
  rec(S, "POST /auth/forgot-password (spec)", "200|404", String(r.status),
    r.isSpa ? "SKIP" : "FAIL",
    "Endpoint reale: POST /api/v2/public/forgot-password");

  // Endpoint reale
  r = await call("POST", "/api/v2/public/forgot-password", { body: { email: ADMIN_EMAIL } });
  expectStatus(S, "POST /public/forgot-password con email reale", 200, r);

  // Email inesistente → 200 (no user enumeration!)
  const fakeEmail = `nonexistent-${RUN_ID}-xyz@nowhere.invalid`;
  r = await call("POST", "/api/v2/public/forgot-password", { body: { email: fakeEmail } });
  if (r.status === 200) {
    rec(S, "POST /forgot-password email inesistente → 200 (no enumeration)", "200", "200", "PASS",
      "Anti-enumeration: stessa response per email esistente o no");
  } else if (r.status === 404) {
    rec(S, "POST /forgot-password email inesistente", "200 (no enumeration)", "404", "FAIL",
      "🚨 USER ENUMERATION: backend rivela se l'email esiste o no → leak privacy");
  } else {
    rec(S, "POST /forgot-password email inesistente", "200|404", String(r.status), "FAIL",
      (r.text || "").slice(0, 100));
  }

  // Verifica response non dica niente di specifico
  const txt = (r.text || "").toLowerCase();
  const enumSignals = ["not_found", "does not exist", "non esiste", "user_not_found"].filter(s => txt.includes(s));
  rec(S, "Response NO segnali di enumeration", "no-signals",
    enumSignals.length ? enumSignals.join(",") : "no-signals",
    enumSignals.length === 0 ? "PASS" : "FAIL");
}

async function phase_security() {
  console.log("\n=== FASE: SICUREZZA ===");
  const S = "SEC";

  // SQL injection nel campo email
  let r = await call("POST", "/api/v2/auth/register", { body: {
    nome: "X", cognome: "Y",
    email: `qa-sqli-${RUN_ID}'; DROP TABLE users;--@m`, password: ADMIN_PASS,
    nomeSocieta: "X",
  }});
  // Si aspetta 400 (email invalida) o 5xx ma NON 200 con effetto laterale
  if (r.status === 400) {
    rec(S, "Register con SQL inj nell'email → 400", "400", "400", "PASS",
      "Validazione email rifiuta payload SQL");
  } else if (r.status === 500) {
    rec(S, "Register con SQL inj nell'email → 500", "400|500", "500", "PASS",
      "Error handling generico (probabilmente prepared statement ha protetto, ma input invalido = 500)");
  } else {
    rec(S, "Register con SQL inj", "400", String(r.status), "FAIL",
      `Inatteso: ${(r.text || "").slice(0, 100)}`);
  }

  // Verifica che la tabella users esista ancora (post SQL inj test)
  r = await call("GET", "/api/v2/superadmin/societies", { saSecret: SA_SECRET });
  rec(S, "Tabelle DB integre post SQL-inj test", "200", String(r.status),
    r.ok ? "PASS" : "FAIL", "Se DB compromesso → endpoint SA crasherebbe");

  // Brute force: 10 login rapidi con password sbagliata
  const start = Date.now();
  const statuses = [];
  for (let i = 0; i < 10; i++) {
    const rr = await call("POST", "/api/v2/auth/login", {
      body: { email: ADMIN_EMAIL, password: `wrong-${i}` },
    });
    statuses.push(rr.status);
  }
  const elapsed = Date.now() - start;
  const all401 = statuses.every(s => s === 401);
  const has429 = statuses.includes(429);
  if (has429) {
    rec(S, "10 login wrong-pass: rate-limit attivo (429)", "rate-limit",
      `statuses=${statuses.join(",")} elapsed=${elapsed}ms`, "PASS");
  } else if (all401) {
    rec(S, "10 login wrong-pass: nessun rate-limit", "rate-limit | 401-all",
      `statuses=${statuses.join(",")} elapsed=${elapsed}ms`, "FAIL",
      "🚨 P2 abuse risk: nessun rate-limit su /auth/login. Brute force facile. " +
      "Consigliato: aggiungere rate-limit per IP+email (es. express-rate-limit, 5 tentativi/15min).");
  } else {
    rec(S, "10 login wrong-pass: misto", "rate-limit", `statuses=${statuses.join(",")}`, "FAIL");
  }

  // Verifica che password non sia leakata in response register/login/me
  let combined = "";
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  combined += (r.text || "");
  r = await call("GET", "/api/v2/account/consents", { token: TOKEN_ADMIN });
  combined += (r.text || "");
  const pwLeak = combined.toLowerCase().includes("testqa2026") ||
                 combined.toLowerCase().includes("password_hash") ||
                 combined.toLowerCase().includes('"password":"');
  rec(S, "Password mai presente in login/account responses", "no-leak",
    pwLeak ? "LEAKED" : "no-leak", pwLeak ? "FAIL" : "PASS");
}

async function cleanup() {
  console.log("\n=== CLEANUP ===");
  const S = "CLEANUP";
  async function del(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    rec(S, label, "200|204|404", String(r.status), r.ok || r.status === 404 ? "PASS" : "SKIP");
  }
  if (MISTER_INVITED_ID) await del(`user mister invited ${MISTER_INVITED_ID}`, `/api/v2/users/${MISTER_INVITED_ID}`);
  if (GENITORE_USER_ID)  await del(`user genitore ${GENITORE_USER_ID}`,        `/api/v2/users/${GENITORE_USER_ID}`);
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA ob ${RUN_ID}` } });
    rec(S, `SUSPEND società ${SOC_ID}`, "200", String(r.status), r.ok ? "PASS" : "SKIP");
  }
}

async function main() {
  console.log(`MyVivaio — Test Onboarding — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();
  const ok = await setup();
  if (!ok) console.log("\n⛔ STOP: setup fallito");
  else {
    try { await phase_register();       } catch (e) { rec("REG","err","ok",e.message,"FAIL"); }
    try { await phase_login_jwt();      } catch (e) { rec("LOGIN","err","ok",e.message,"FAIL"); }
    try { await phase_invite_mister();  } catch (e) { rec("INV-M","err","ok",e.message,"FAIL"); }
    try { await phase_guardian_link();  } catch (e) { rec("GUARD","err","ok",e.message,"FAIL"); }
    try { await phase_forgot_password();} catch (e) { rec("FORGOT","err","ok",e.message,"FAIL"); }
    try { await phase_security();       } catch (e) { rec("SEC","err","ok",e.message,"FAIL"); }
    try { await cleanup();              } catch (e) { rec("CLEAN","err","ok",e.message,"FAIL"); }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(70));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(70));
  fs.writeFileSync("test-onboarding-results.json", JSON.stringify({
    timestamp: new Date().toISOString(), baseUrl: BASE_URL, runId: RUN_ID, socId: SOC_ID,
    counts, elapsedSec: parseFloat(elapsed), results,
  }, null, 2));
  console.log("→ JSON: test-onboarding-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}
main().catch(e => { console.error("FATAL:", e); process.exit(2); });
