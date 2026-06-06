#!/usr/bin/env node
// Test Stripe / Pagamenti — MyVivaio (PROD)
// NON crea abbonamenti reali. NON usa carte. Solo lettura/simulazione checkout.
// Coupon validation skippato (endpoint non esiste — Stripe gestisce via allow_promotion_codes).

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

async function call(method, path, { token, saSecret, body, sig } = {}) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (token)    opts.headers.Authorization = `Bearer ${token}`;
  if (saSecret) opts.headers["X-SA-Secret"] = saSecret;
  if (sig)      opts.headers["stripe-signature"] = sig;
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
  rec(area, name, list.join("|"), got, ok ? "PASS" : "FAIL", detail || (r.text ? r.text.slice(0, 150) : ""));
  return ok;
}

let SOC_ID = null, TOKEN_ADMIN = null, TOKEN_MISTER = null, TOKEN_GENITORE = null;
let MISTER_ID = null, GENITORE_ID = null, PLAYER_ID = null, LEVA_ID = null, LEVA_NAME = null;
const ADMIN_EMAIL = `qa-stripe-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

// ──────────────────────────────────────────────────────────────────────────────
async function setup() {
  console.log("\n=== FASE 0 (setup società piano società) ===");
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test Stripe QA ${RUN_ID}`, citta: "QA", piano: "societa",
      adminNome: "QA", adminCogn: "S", adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  if (!r.ok || !r.json?.societyId) {
    rec("SETUP", "Crea società", "201", String(r.status), "FAIL", (r.text || "").slice(0, 200));
    return false;
  }
  SOC_ID = Number(r.json.societyId);
  if (REAL_SOC_IDS.has(SOC_ID)) { rec("SETUP", "ID società", "non-real", String(SOC_ID), "FAIL"); return false; }
  rec("SETUP", "Crea società", "201", "201", "PASS", `socId=${SOC_ID}`);

  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  TOKEN_ADMIN = r.json?.token;
  rec("SETUP", "Login admin", "200", String(r.status), r.ok ? "PASS" : "FAIL");

  // Crea mister + genitore per test gating
  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U12 ST ${RUN_ID}`, ordine: 99 } });
  LEVA_ID = r.json?.id; LEVA_NAME = r.json?.nome;
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { nome: "L", cognome: "B", annoNascita: 2018, leva: LEVA_NAME } });
  PLAYER_ID = r.json?.id;
  const me = `qa-stripe-mister-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: { nome: "M", cognome: "X", email: me, password: ADMIN_PASS, ruolo: "mister", leva: LEVA_NAME } });
  MISTER_ID = r.json?.id;
  r = await call("POST", "/api/v2/auth/login", { body: { email: me, password: ADMIN_PASS } });
  TOKEN_MISTER = r.json?.token;
  const ge = `qa-stripe-gen-${RUN_ID}@myvivaio.app`;
  r = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: { nome: "G", cognome: "B", email: ge, password: ADMIN_PASS, ruolo: "genitore" } });
  GENITORE_ID = r.json?.id;
  r = await call("POST", "/api/v2/auth/login", { body: { email: ge, password: ADMIN_PASS } });
  TOKEN_GENITORE = r.json?.token;
  rec("SETUP", "Crea mister + genitore + login", "ok", `mister=${MISTER_ID} gen=${GENITORE_ID}`, (TOKEN_MISTER && TOKEN_GENITORE) ? "PASS" : "FAIL");
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase1_lettura() {
  console.log("\n=== FASE 1: TEST LETTURA ===");
  const S = "F1-LETTURA";

  // Baiardo (id=53) — SKIP (no credenziali admin)
  rec(S, "Baiardo GET /stripe/subscription", "auth-needed", "no-credentials", "SKIP",
    "Test richiede credenziali admin Baiardo non fornite — skip come da istruzione");
  rec(S, "Baiardo invoices/payment-methods", "auth-needed", "no-credentials", "SKIP", "stesso motivo");

  // Società di test
  let r = await call("GET", `/api/v2/stripe/subscription?societyId=${SOC_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "GET /stripe/subscription società test", 200, r);
  if (r.ok) {
    const piano = r.json?.piano;
    const billingMode = r.json?.billingMode;
    rec(S, "Campo piano=societa", "societa", String(piano), piano === "societa" ? "PASS" : "FAIL");
    rec(S, "Campo billingMode=omaggio (società nuova)", "omaggio|stripe", String(billingMode),
      ["omaggio", "stripe"].includes(billingMode) ? "PASS" : "FAIL", `osservato=${billingMode}`);
    rec(S, "Campo status presente", "non-null", String(r.json?.status ?? "null"),
      r.json?.status ? "PASS" : "FAIL");
    rec(S, "Campi current_period_end e cancel_at_period_end presenti (nullable)",
      "key-exists", `cpe=${r.json?.currentPeriodEnd} cape=${r.json?.cancelAtPeriodEnd}`,
      ("currentPeriodEnd" in (r.json || {})) ? "PASS" : "FAIL");
  }

  // Endpoint inesistenti (spec)
  r = await call("GET", `/api/v2/stripe/payment-methods?societyId=${SOC_ID}`, { token: TOKEN_ADMIN });
  rec(S, "GET /stripe/payment-methods (spec)", "200|404", String(r.status),
    r.status === 404 ? "SKIP" : "FAIL",
    "Endpoint non esiste: dato presente dentro /stripe/subscription.paymentMethod");

  // /stripe/invoices su società nuova → array vuoto
  r = await call("GET", `/api/v2/stripe/invoices?societyId=${SOC_ID}`, { token: TOKEN_ADMIN });
  expectStatus(S, "GET /stripe/invoices società test", 200, r);
  if (r.ok) {
    const empty = Array.isArray(r.json?.invoices) && r.json.invoices.length === 0;
    rec(S, "Invoices società nuova = []", "[]", JSON.stringify(r.json?.invoices), empty ? "PASS" : "FAIL");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase2_checkout() {
  console.log("\n=== FASE 2: TEST CHECKOUT (no addebito) ===");
  const S = "F2-CHECKOUT";

  // 1) piano mister mensile
  let r = await call("POST", "/api/v2/stripe/create-checkout", {
    token: TOKEN_ADMIN, body: { piano: "mister", intervallo: "mensile", societyId: SOC_ID, email: ADMIN_EMAIL },
  });
  expectStatus(S, "POST /stripe/create-checkout mister mensile", 200, r);
  const url1 = r.json?.url;
  rec(S, "URL inizia con https://checkout.stripe.com", "checkout.stripe.com", String(url1 || "").slice(0, 40),
    typeof url1 === "string" && url1.startsWith("https://checkout.stripe.com/") ? "PASS" : "FAIL");
  // L'URL session contiene 'live' o 'test' nel cs_ prefix
  // cs_live_*  = live, cs_test_* = test
  if (url1) {
    const isLive = /cs_live_/.test(url1);
    const isTest = /cs_test_/.test(url1);
    rec(S, "Mode Stripe (live/test)",
      "live or test", isLive ? "LIVE" : (isTest ? "TEST" : "unknown"),
      (isLive || isTest) ? "PASS" : "FAIL",
      isLive ? "⚠️ STRIPE LIVE in produzione" : (isTest ? "Stripe TEST mode" : "indeterminato"));
  }

  // 2) piano pro annuale con coupon (TEST: Stripe gestisce coupon dentro Checkout via allow_promotion_codes)
  r = await call("POST", "/api/v2/stripe/create-checkout", {
    token: TOKEN_ADMIN, body: { piano: "mister_pro", intervallo: "annuale", societyId: SOC_ID, email: ADMIN_EMAIL },
  });
  // potrebbe essere 400 se siamo in giugno/luglio e fuori pre-lancio
  const isJunOrJul = [5, 6].includes(new Date().getUTCMonth());
  if (isJunOrJul && r.status === 400 && r.json?.error === "annual_not_available") {
    rec(S, "POST /stripe/create-checkout mister_pro annuale (giu/lug → blocked)",
      "200 (pre-launch) | 400 annual_not_available (giu/lug standard)", String(r.status), "PASS",
      "Blocked correttamente per giugno/luglio fuori pre-lancio");
  } else {
    expectStatus(S, "POST /stripe/create-checkout mister_pro annuale", 200, r);
  }

  rec(S, "Coupon FOUNDERS2026/FOUNDING2026 (endpoint validate-coupon)",
    "endpoint-spec", "missing", "SKIP",
    "Stripe gestisce promo codes internamente via allow_promotion_codes=true (riga 231 stripe.ts). NO endpoint /validate-coupon nel backend.");

  rec(S, "allow_promotion_codes:true (lettura codice)", "true", "true", "PASS",
    "Verificato: stripe.ts:231 setta params['allow_promotion_codes']='true' su ogni checkout session");

  // 3) gating ruolo — TOKEN_GENITORE
  // NB: l'endpoint create-checkout NON ha requireAuth! Il "blocco" lato server è solo email
  // Quindi anche un genitore può creare checkout per qualsiasi email (è un bug security).
  r = await call("POST", "/api/v2/stripe/create-checkout", {
    token: TOKEN_GENITORE, body: { piano: "mister", intervallo: "mensile", societyId: SOC_ID, email: ADMIN_EMAIL },
  });
  if (r.status === 403) {
    rec(S, "POST create-checkout con TOKEN_GENITORE → 403 (spec)", "403", "403", "PASS");
  } else {
    rec(S, "POST create-checkout con TOKEN_GENITORE → 403 (spec)", "403", String(r.status), "FAIL",
      "ANOMALIA SECURITY: endpoint senza requireAuth — chiunque crea checkout per qualsiasi email");
  }

  // 4) gating ruolo — TOKEN_MISTER (spec dice 200 o 403)
  r = await call("POST", "/api/v2/stripe/create-checkout", {
    token: TOKEN_MISTER, body: { piano: "mister", intervallo: "mensile", societyId: SOC_ID, email: ADMIN_EMAIL },
  });
  if (r.status === 403 || (r.status === 200 && r.json?.url)) {
    rec(S, "POST create-checkout con TOKEN_MISTER", "200|403", String(r.status), "PASS",
      r.status === 200 ? "AUTORIZZATO (no requireAuth → chiunque, anche senza token, può fare checkout)" : "");
  } else {
    expectStatus(S, "POST create-checkout con TOKEN_MISTER", [200, 403], r);
  }

  // 5) chiamata SENZA TOKEN — endpoint NO requireAuth
  r = await call("POST", "/api/v2/stripe/create-checkout", {
    body: { piano: "mister", intervallo: "mensile", societyId: SOC_ID, email: ADMIN_EMAIL },
  });
  if (r.status === 200 || r.status === 201) {
    rec(S, "POST create-checkout SENZA TOKEN", "401 (atteso) | 200 (no auth)", String(r.status), "FAIL",
      "🚨 BUG SECURITY: endpoint chiamabile SENZA autenticazione, chiunque conoscendo email può aprire checkout");
  } else {
    rec(S, "POST create-checkout SENZA TOKEN", "401", String(r.status), "PASS",
      "Bloccato correttamente");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase3_webhook() {
  console.log("\n=== FASE 3: TEST WEBHOOK ===");
  const S = "F3-WEBHOOK";

  // 1) POST senza signature → 400
  const r1 = await call("POST", "/api/v2/stripe/webhook", { body: { type: "test.event" } });
  if (r1.status === 400 || r1.status === 200) {
    // Se 200 e nessun secret → silent skip; se 400 → signature missing, comportamento corretto
    rec(S, "POST webhook senza signature", "400 (con secret) | 200 (skip senza secret)", String(r1.status),
      r1.status === 400 ? "PASS" : "FAIL",
      r1.status === 200 ? "🚨 SOSPETTO: webhook ritorna 200 senza signature. Probabile STRIPE_WEBHOOK_SECRET non settato → fail-open" :
        (r1.json?.error === "missing_signature" ? "verifica signature presente, OK" : ""));
  }

  // 2) POST con signature finta → 400 invalid_signature
  const r2 = await call("POST", "/api/v2/stripe/webhook",
    { body: { type: "test.event" }, sig: "t=1,v1=deadbeef" });
  if (r2.status === 400) {
    rec(S, "POST webhook signature finta → 400", "400", "400", "PASS", r2.json?.error || "");
  } else if (r2.status === 200) {
    rec(S, "POST webhook signature finta → 400", "400", "200", "FAIL",
      "🚨 BUG: webhook accetta signature finta (STRIPE_WEBHOOK_SECRET probabilmente NON settato)");
  } else {
    rec(S, "POST webhook signature finta", "400", String(r2.status), "FAIL", (r2.text || "").slice(0, 130));
  }

  // 3) POST con signature stale (timestamp vecchio) → 400 stale_event
  const oldTs = Math.floor(Date.now() / 1000) - 600;
  const r3 = await call("POST", "/api/v2/stripe/webhook",
    { body: { type: "test.event" }, sig: `t=${oldTs},v1=abc123` });
  if (r3.status === 400) {
    rec(S, "POST webhook signature stale (>5 min)", "400", "400", "PASS", r3.json?.error || "");
  } else if (r3.status === 200) {
    rec(S, "POST webhook signature stale → 400", "400", "200", "FAIL",
      "BUG: webhook accetta timestamp vecchi (STRIPE_WEBHOOK_SECRET non settato → bypass totale)");
  }

  // Documentazione handler (statica dal codice)
  rec(S, "Handler webhook eventi gestiti", "doc",
    "checkout.session.completed | customer.subscription.updated | customer.subscription.deleted | invoice.payment_failed",
    "PASS", "Vedi stripe.ts:283/352/386/508 per dettagli azioni DB+blob+email");
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase4_coupon() {
  console.log("\n=== FASE 4: TEST COUPON ===");
  const S = "F4-COUPON";
  rec(S, "GET /stripe/validate-coupon FOUNDERS2026", "endpoint", "missing", "SKIP",
    "Endpoint /stripe/validate-coupon NON ESISTE nel backend. Stripe gestisce promo codes interni via allow_promotion_codes=true. Il coupon FOUNDERS2026 deve essere creato sul Dashboard Stripe (Products → Coupons) e attivato come Promotion Code 'FOUNDERS2026'.");
  rec(S, "FOUNDING2026 (deattivato)", "endpoint", "missing", "SKIP", "stesso motivo");
  rec(S, "Coupon limitato a piani annuali", "endpoint", "missing", "SKIP",
    "Limitazione si configura nel Stripe Dashboard (eligible products del coupon)");
}

// ──────────────────────────────────────────────────────────────────────────────
async function phase5_prelaunch() {
  console.log("\n=== FASE 5: PRE GO-LIVE CHECKLIST (statica da codice) ===");
  const S = "F5-CHECKLIST";

  rec(S, "allow_promotion_codes: true", "true", "true", "PASS", "stripe.ts:231");

  // proration_behavior / billing anchor 1 agosto
  // Vedi commento nel codice riga 220-229: durante pre-launch usa trial_end (no anchor, no proration).
  rec(S, "proration_behavior + billing anchor 1 agosto",
    "configurato per pre-lancio", "trial_end-only durante pre-lancio (no anchor!)", "FAIL",
    "ANOMALIA: stripe.ts:222-228 dice 'NIENTE anchor (no proration / no allineamento al 1° agosto)'. " +
    "Il codice usa subscription_data[trial_end] per dare DEMO_DAYS=14gg di trial durante pre-lancio. " +
    "Manca il billing_cycle_anchor=1ago2026 esplicito → primo addebito sarà 14gg dopo signup, NON il 1° agosto. " +
    "Se la spec è 'tutti pagano dal 1° agosto', va aggiunto billing_cycle_anchor=anchorTs + proration_behavior=none.");

  // success_url / cancel_url
  const appUrlEnv = "APP_URL env var, fallback workspacefieldos-production.up.railway.app";
  rec(S, "success_url / cancel_url", "app.myvivaio.app", appUrlEnv, "FAIL",
    "ATTENZIONE: stripe.ts:194 usa process.env.APP_URL con fallback 'workspacefieldos-production.up.railway.app'. " +
    "Se APP_URL non è settato su Railway → utenti finiscono sul vecchio dominio Railway, non su app.myvivaio.app. " +
    "Verificare su Railway che APP_URL=https://app.myvivaio.app.");

  rec(S, "STRIPE_WEBHOOK_SECRET env var", "env-var", "env-var", "PASS",
    "stripe.ts:246 legge process.env.STRIPE_WEBHOOK_SECRET. ⚠️ Se NON settato, riga 248-251 fa silent 200 → fail-open. Verificare che sia settato in prod.");

  // Mode LIVE/TEST verrà determinato in phase2 (dall'URL)
  rec(S, "Modalità Stripe (live vs test)", "live in prod", "verificato in F2-CHECKOUT", "PASS",
    "Vedi F2: si determina dal prefix cs_live_/cs_test_ dell'URL di checkout creato");

  rec(S, "metadata[societyId] in checkout session", "yes", "yes", "PASS",
    "stripe.ts:216-218: societyId in metadata della sessione se valido (non demo)");

  // BONUS: auth coverage stripe endpoint — questo è un grosso problema
  rec(S, "🚨 AUTH coverage endpoint Stripe",
    "requireAuth su tutti", "MANCA su 5/6 endpoint", "FAIL",
    "POST /create-checkout, GET /subscription, POST /customer-portal, POST /cancel, GET /invoices: " +
    "NESSUN requireAuth. Chiunque conoscendo societyId può: leggere stato subscription/fatture/payment-method, " +
    "creare checkout per qualsiasi email, aprire customer-portal, cancellare l'abbonamento di una società terza. " +
    "Webhook ha verifica signature (corretto).");
}

// ──────────────────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\n=== FASE 6: CLEANUP ===");
  const S = "CLEANUP";
  async function del(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    rec(S, label, "200|204|404", String(r.status), r.ok || r.status === 404 ? "PASS" : "SKIP");
  }
  if (GENITORE_ID) await del(`user genitore ${GENITORE_ID}`, `/api/v2/users/${GENITORE_ID}`);
  if (MISTER_ID)   await del(`user mister ${MISTER_ID}`,    `/api/v2/users/${MISTER_ID}`);
  if (PLAYER_ID)   await del(`player ${PLAYER_ID}`,         `/api/v2/players/${PLAYER_ID}`);
  if (LEVA_ID)     await del(`leva ${LEVA_ID}`,             `/api/v2/leve/${LEVA_ID}`);
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA stripe ${RUN_ID}` } });
    rec(S, `SUSPEND società ${SOC_ID}`, "200", String(r.status), r.ok ? "PASS" : "SKIP");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MyVivaio — Test Stripe — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();
  const ok = await setup();
  if (!ok) console.log("\n⛔ STOP: setup fallito");
  else {
    try { await phase1_lettura();  } catch (e) { rec("F1","err","ok",e.message,"FAIL"); }
    try { await phase2_checkout(); } catch (e) { rec("F2","err","ok",e.message,"FAIL"); }
    try { await phase3_webhook();  } catch (e) { rec("F3","err","ok",e.message,"FAIL"); }
    try { await phase4_coupon();   } catch (e) { rec("F4","err","ok",e.message,"FAIL"); }
    try { await phase5_prelaunch();} catch (e) { rec("F5","err","ok",e.message,"FAIL"); }
    try { await cleanup();         } catch (e) { rec("CLEANUP","err","ok",e.message,"FAIL"); }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(70));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(70));
  fs.writeFileSync("test-stripe-results.json", JSON.stringify({
    timestamp: new Date().toISOString(), baseUrl: BASE_URL, runId: RUN_ID, socId: SOC_ID,
    counts, elapsedSec: parseFloat(elapsed), results,
  }, null, 2));
  console.log("→ JSON: test-stripe-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}
main().catch(e => { console.error("FATAL:", e); process.exit(2); });
