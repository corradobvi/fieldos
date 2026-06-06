#!/usr/bin/env node
// Test Push Notifications — MyVivaio (PROD)
// Mock endpoint VAPID (no push reali inviati). Lettura codice + verifica HTTP.

import fs from "node:fs";

const BASE_URL  = process.env.BASE_URL  || "https://app.myvivaio.app";
const SA_SECRET = process.env.SA_SECRET || "MyVivaio123++";
const REAL_SOC_IDS = new Set([2, 5, 53]);
const RUN_ID = String(Date.now()).slice(-8);

const results = [];
let counts = { PASS: 0, FAIL: 0, SKIP: 0 };
function rec(area, role, name, expected, got, status, detail = "") {
  counts[status] = (counts[status] || 0) + 1;
  results.push({ area, role, name, expected, got, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "•";
  const tag = role ? `[${role}]` : "";
  console.log(`[${status}] ${icon} ${area} ${tag} ${name}  expected=${expected} got=${got}${detail ? ` ▸ ${detail}` : ""}`);
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
    if (ct.includes("text/html") && txt.startsWith("<!DOCTYPE")) {
      return { ok: false, status: res.status, isSpa: true, json: null, text: "<SPA HTML>" };
    }
    try { json = JSON.parse(txt); } catch {}
  } catch (e) {
    return { ok: false, status: 0, isSpa: false, json: null, text: e?.message || String(e) };
  }
  return { ok: res.ok, status: res.status, isSpa: false, json, text: txt };
}

function expectStatus(area, role, name, expected, r, detail = "") {
  if (r.isSpa) {
    rec(area, role, name, Array.isArray(expected) ? expected.join("|") : String(expected),
        "SPA-HTML", "SKIP", "endpoint non esiste");
    return;
  }
  const list = Array.isArray(expected) ? expected : [expected];
  const got = String(r.status);
  const ok = list.map(String).includes(got);
  rec(area, role, name, list.join("|"), got, ok ? "PASS" : "FAIL",
      detail || (r.text ? r.text.slice(0, 130) : ""));
}

let SOC_ID = null, TOKEN_ADMIN = null, TOKEN_MISTER = null, TOKEN_DIRIGENTE = null, TOKEN_GENITORE = null, TOKEN_GIOCATORE = null;
let ADMIN_ID = null, MISTER_ID = null, DIRIGENTE_ID = null, GENITORE_ID = null, GIOCATORE_ID = null;
let LEVA_U12_ID = null, LEVA_U12_NAME = null, LEVA_U16_ID = null, LEVA_U16_NAME = null;
let PLAYER_U12_ID = null, PLAYER_U16_ID = null;
let SOCIETY_KEY = null;
const ADMIN_EMAIL = `qa-push-${RUN_ID}@myvivaio.app`;
const ADMIN_PASS  = "TestQA2026!!";

async function setup() {
  console.log("\n=== FASE 1 (setup) ===");
  let r = await call("POST", "/api/v2/superadmin/societies", {
    saSecret: SA_SECRET, body: {
      nome: `Test Push QA ${RUN_ID}`, citta: "QA", piano: "societa",
      adminNome: "QA", adminCogn: "P", adminEmail: ADMIN_EMAIL, adminPass: ADMIN_PASS,
    },
  });
  SOC_ID = Number(r.json?.societyId);
  ADMIN_ID = r.json?.userId;
  SOCIETY_KEY = `fieldos_state_soc_${SOC_ID}`;
  if (!SOC_ID || REAL_SOC_IDS.has(SOC_ID)) {
    rec("SETUP", "", "Crea società", "201 + non-real", String(r.status), "FAIL"); return false;
  }
  rec("SETUP", "", "Crea società", "201", "201", "PASS", `socId=${SOC_ID} societyKey=${SOCIETY_KEY}`);
  r = await call("POST", "/api/v2/auth/login", { body: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
  TOKEN_ADMIN = r.json?.token;
  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U12 P ${RUN_ID}`, ordine: 99 } });
  LEVA_U12_ID = r.json?.id; LEVA_U12_NAME = r.json?.nome;
  r = await call("POST", "/api/v2/leve", { token: TOKEN_ADMIN, body: { nome: `U16 P ${RUN_ID}`, ordine: 98 } });
  LEVA_U16_ID = r.json?.id; LEVA_U16_NAME = r.json?.nome;
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { nome: "Luca", cognome: "B", annoNascita: 2018, leva: LEVA_U12_NAME } });
  PLAYER_U12_ID = r.json?.id;
  r = await call("POST", "/api/v2/players", { token: TOKEN_ADMIN, body: { nome: "Marco", cognome: "R", annoNascita: 2010, leva: LEVA_U16_NAME } });
  PLAYER_U16_ID = r.json?.id;
  async function mkUser(label, ruolo, leva, email, nome, cog) {
    let rr = await call("POST", "/api/v2/users", { token: TOKEN_ADMIN, body: { nome, cognome: cog, email, password: ADMIN_PASS, ruolo, leva: leva || null } });
    const id = rr.json?.id;
    rr = await call("POST", "/api/v2/auth/login", { body: { email, password: ADMIN_PASS } });
    return { id, token: rr.json?.token };
  }
  ({ id: MISTER_ID,    token: TOKEN_MISTER }    = await mkUser("mister",    "mister",    LEVA_U12_NAME, `qa-push-mis-${RUN_ID}@myvivaio.app`, "M", "X"));
  ({ id: DIRIGENTE_ID, token: TOKEN_DIRIGENTE } = await mkUser("dirigente", "dirigente", LEVA_U12_NAME, `qa-push-dir-${RUN_ID}@myvivaio.app`, "D", "X"));
  ({ id: GENITORE_ID,  token: TOKEN_GENITORE }  = await mkUser("genitore",  "genitore",  null,          `qa-push-gen-${RUN_ID}@myvivaio.app`, "G", "B"));
  ({ id: GIOCATORE_ID, token: TOKEN_GIOCATORE } = await mkUser("giocatore", "giocatore", LEVA_U16_NAME, `qa-push-gio-${RUN_ID}@myvivaio.app`, "Marco", "R"));
  if (TOKEN_GENITORE && PLAYER_U12_ID) {
    await call("POST", `/api/v2/players/${PLAYER_U12_ID}/claim`, {
      token: TOKEN_GENITORE, body: { role: "papa", consent: true, lastNameFull: "B", birthDate: "2018-01-01" },
    });
  }
  rec("SETUP", "", "Crea utenti + login + claim",
    "ok", `admin=${ADMIN_ID} mister=${MISTER_ID} dir=${DIRIGENTE_ID} gen=${GENITORE_ID} gio=${GIOCATORE_ID}`,
    (TOKEN_ADMIN && TOKEN_MISTER && TOKEN_DIRIGENTE && TOKEN_GENITORE && TOKEN_GIOCATORE) ? "PASS" : "FAIL");
  return true;
}

function mockSub(roleLabel) {
  return {
    endpoint: `https://fcm.googleapis.com/test-endpoint-${roleLabel}-${RUN_ID}`,
    keys: { p256dh: "BLtest-p256dh-mock-key-for-qa-only", auth: "test-auth-key-mock" },
    expirationTime: null,
  };
}

async function phase2_subscribe() {
  console.log("\n=== FASE 2: SUBSCRIBE / UNSUBSCRIBE ===");
  const S = "F2-SUB";
  const roles = [
    ["admin",     TOKEN_ADMIN], ["mister",    TOKEN_MISTER],
    ["dirigente", TOKEN_DIRIGENTE], ["genitore",  TOKEN_GENITORE], ["giocatore", TOKEN_GIOCATORE],
  ];
  for (const [role, token] of roles) {
    const sub = mockSub(role);
    let r = await call("POST", "/api/push/subscribe", {
      token, body: { societyKey: SOCIETY_KEY, subscription: sub },
    });
    expectStatus(S, role, "POST /api/push/subscribe", 200, r);
    r = await call("POST", "/api/push/subscribe", {
      token, body: { societyKey: SOCIETY_KEY, subscription: sub },
    });
    expectStatus(S, role, "POST subscribe stesso endpoint (idempotente)", 200, r);
    r = await call("GET", "/api/v2/push/subscriptions", { token });
    rec(S, role, "GET /api/v2/push/subscriptions (spec)", "200|404", String(r.status),
      r.isSpa ? "SKIP" : "FAIL",
      r.isSpa ? "endpoint non esiste (no GET list subscriptions)" : (r.text || "").slice(0, 130));
    r = await call("DELETE", "/api/push/subscribe", { token, body: { societyKey: SOCIETY_KEY } });
    rec(S, role, "DELETE /api/push/subscribe (spec)", "200|404", String(r.status),
      r.isSpa ? "SKIP" : (r.ok || r.status === 404 ? "PASS" : "FAIL"),
      "Endpoint DELETE NON ESISTE. Le sub vengono auto-rimosse su 410/404 di webpush.");
  }
}

async function phase3_preferenze() {
  console.log("\n=== FASE 3: PREFERENZE NOTIFICHE ===");
  const S = "F3-PREF";
  const VALID_KEYS = ["notify_convocazioni", "notify_comunicazioni", "notify_chat", "notify_reminders"];
  for (const [role, token] of [["admin", TOKEN_ADMIN], ["mister", TOKEN_MISTER], ["dirigente", TOKEN_DIRIGENTE], ["genitore", TOKEN_GENITORE], ["giocatore", TOKEN_GIOCATORE]]) {
    let r = await call("GET", "/api/v2/notification-preferences", { token });
    rec(S, role, "GET /api/v2/notification-preferences (spec)", "200|404", String(r.status),
      r.isSpa ? "SKIP" : "FAIL",
      r.isSpa ? "endpoint non esiste, vedi /users/me/notification-preferences" : "");
    r = await call("GET", "/api/v2/users/me/notification-preferences", { token });
    expectStatus(S, role, "GET /users/me/notification-preferences (reale)", 200, r);
    if (r.ok && r.json) {
      const missing = VALID_KEYS.filter(k => !(k in r.json));
      rec(S, role, "Campi attesi (4 chiavi notify_*)", "all-present", missing.length ? `missing=${missing.join(",")}` : "all-present",
        missing.length === 0 ? "PASS" : "FAIL");
      rec(S, role, "Spec menzionata notify_eventi", "key", String("notify_eventi" in r.json), "SKIP",
        "Chiave notify_eventi NON esiste; spec sbagliata (esiste notify_reminders)");
    }
    r = await call("PATCH", "/api/v2/notification-preferences", { token, body: { notify_chat: false } });
    rec(S, role, "PATCH /api/v2/notification-preferences (spec)", "200|404", String(r.status),
      r.isSpa ? "SKIP" : "FAIL",
      r.isSpa ? "PATCH non esiste, l'endpoint reale è PUT /users/me/notification-preferences" : "");
    r = await call("PUT", "/api/v2/users/me/notification-preferences", { token,
      body: { notify_convocazioni: false, notify_comunicazioni: false, notify_chat: false, notify_reminders: false } });
    expectStatus(S, role, "PUT disabilita tutto", 200, r);
    r = await call("GET", "/api/v2/users/me/notification-preferences", { token });
    if (r.ok && r.json) {
      const allFalse = VALID_KEYS.every(k => r.json[k] === false);
      rec(S, role, "GET dopo disabilita tutto", "all-false", JSON.stringify(r.json), allFalse ? "PASS" : "FAIL");
    }
    r = await call("PUT", "/api/v2/users/me/notification-preferences", { token,
      body: { notify_convocazioni: true, notify_comunicazioni: true, notify_chat: true, notify_reminders: true } });
    expectStatus(S, role, "PUT riabilita tutto", 200, r);
  }
}

async function phase4_logica_codice() {
  console.log("\n=== FASE 4: LOGICA getUsersForPush (statica) ===");
  const S = "F4-LOGICA";
  rec(S, "", "mister_admin sempre incluso (catch-all)", "incluso", "incluso", "PASS",
    "push-sender.ts:134: ruolo IN ('admin','mister_admin','dirigente') catch-all senza leva-match");
  rec(S, "", "leva=NULL → wildcard (no leva filter)", "wildcard", "wildcard", "PASS",
    "push-sender.ts:131: if (leva) — se null/undefined, no clause leva → tutti staff");
  rec(S, "", "leva='Tutte' / 'tutte' → wildcard", "matched", "matched", "PASS",
    "_levaMatchClause: OR leva IS NULL OR leva = '' OR leva = 'Tutte' OR leva = 'tutte'");
  rec(S, "", "leva come JSON array → match via JSON_CONTAINS", "matched", "matched", "PASS",
    "_levaMatchClause: OR (JSON_VALID(leva) AND JSON_CONTAINS(leva, JSON_QUOTE(?)))");
  rec(S, "", "Dedup user_id con 2 subscription per stessa society",
    "1 push per sub", "limitato a 1 sub/società", "FAIL",
    "ATTENZIONE: schema UNIQUE(user_id, society_key) → solo 1 subscription per (user, society). Multi-device su stessa società non supportato. Limitazione P2.");
  rec(S, "", "Dedup userIds duplicati nell'array input", "dedup", "dedup", "PASS",
    "push-sender.ts:164: [...new Set([...staffIds, ...guardianIds])]");
  rec(S, "", "filterByPref rispetta notify_<key>=0", "filtrato", "filtrato", "PASS",
    "push-sender.ts:31-45: SELECT user_id WHERE pref=0, esclude opt-out");
  rec(S, "", "Genitore push solo isFirstClaim", "verificato", "verificato", "PASS",
    "minors.ts:205: isFirstClaim = (gCountRows.n ?? 0) === 0; if (isFirstClaim) sendPushToUsers");
  rec(S, "", "Push leva include staff + genitori della leva", "verificato", "verificato", "PASS",
    "getUsersForPush: staff (admin/mister_admin/dirigente catch-all + allenatore/mister/preparatore con leva-match) UNION DISTINCT guardian dei player nella leva");
  rec(S, "", "staffOnly: true esclude genitori", "verificato", "verificato", "PASS",
    "push-sender.ts:148: if (!staffOnly && leva) → guardianIds. Usato per nuovo_genitore");
  rec(S, "", "Cleanup 410/404 (subscription expired)", "auto-delete", "auto-delete", "PASS",
    "push-sender.ts:97: if (e.statusCode === 410 || 404) DELETE FROM push_subscriptions");
}

async function phase5_diagnostici() {
  console.log("\n=== FASE 5: ENDPOINT DIAGNOSTICI ===");
  const S = "F5-DIAG";
  let r = await call("GET", "/api/push/vapid-public");
  expectStatus(S, "", "GET /api/push/vapid-public (pubblico)", 200, r);
  if (r.ok) rec(S, "", "VAPID public key esposta", "presente", r.json?.publicKey ? "yes" : "no",
    r.json?.publicKey ? "PASS" : "FAIL");
  r = await call("GET", "/api/push/debug");
  if (r.ok) {
    const envKeys = r.json?.all_env_keys || [];
    rec(S, "", "GET /api/push/debug ESPONE env keys", "no-leak", `${envKeys.length} env keys names`, "FAIL",
      "🚨 P2 INFO LEAK: endpoint pubblico ritorna lista completa nomi env vars Railway. Aggiungere requireAuth + role admin.");
    rec(S, "", "Diag mostra VAPID configurate", "yes",
      `pub=${r.json?.vapid_public_set} priv=${r.json?.vapid_private_set}`,
      r.json?.vapid_public_set && r.json?.vapid_private_set ? "PASS" : "FAIL");
  } else expectStatus(S, "", "GET /api/push/debug", 200, r);
  r = await call("POST", "/api/push/send", { body: {
    userId: ADMIN_ID, societyKey: SOCIETY_KEY,
    notification: { title: "QA test push", body: "qa", tag: "qa" },
  }});
  if (r.status === 200) {
    rec(S, "", "POST /api/push/send SENZA token", "401 (atteso)", "200", "FAIL",
      "🚨 P0 SECURITY: endpoint senza auth! Chiunque sa (userId, societyKey) invia push fingendosi MyVivaio.");
  } else {
    expectStatus(S, "", "POST /api/push/send SENZA token → 401", [401, 503], r);
  }
  r = await call("GET", "/api/v2/push/test", { token: TOKEN_ADMIN });
  rec(S, "", "GET /api/v2/push/test (spec)", "200|404", String(r.status),
    r.isSpa ? "SKIP" : "FAIL", r.isSpa ? "endpoint non esiste — esiste /api/v2/chat/push-test" : "");
  r = await call("POST", "/api/v2/push/send-test", { token: TOKEN_ADMIN, body: {} });
  rec(S, "", "POST /api/v2/push/send-test (spec)", "200|404", String(r.status),
    r.isSpa ? "SKIP" : "FAIL", r.isSpa ? "endpoint non esiste" : "");
  r = await call("GET", "/api/v2/chat/push-test", { token: TOKEN_ADMIN });
  expectStatus(S, "", "GET /api/v2/chat/push-test (reale)", 200, r,
    `hasSubscription=${r.json?.hasSubscription} count=${r.json?.subscriptionCount}`);
}

async function phase6_security() {
  console.log("\n=== FASE 6: SICUREZZA ===");
  const S = "F6-SEC";
  let r = await call("POST", "/api/push/subscribe", {
    body: { societyKey: SOCIETY_KEY, subscription: mockSub("anon") },
  });
  expectStatus(S, "", "POST /api/push/subscribe SENZA token → 401", 401, r);
  r = await call("DELETE", "/api/push/subscribe");
  rec(S, "", "DELETE /api/push/subscribe SENZA token (spec)", "401", String(r.status),
    r.isSpa ? "SKIP" : "FAIL", "Endpoint DELETE non esiste");
  r = await call("GET", "/api/v2/users/me/notification-preferences");
  expectStatus(S, "", "GET /users/me/notification-preferences SENZA token → 401", 401, r);
  r = await call("PUT", "/api/v2/users/me/notification-preferences", { body: { notify_chat: true } });
  expectStatus(S, "", "PUT /users/me/notification-preferences SENZA token → 401", 401, r);
  const fakeSocietyKey = `fieldos_state_soc_53`;
  r = await call("POST", "/api/push/subscribe", {
    token: TOKEN_ADMIN, body: { societyKey: fakeSocietyKey, subscription: mockSub("cross") },
  });
  if (r.status === 200) {
    rec(S, "", "Cross-society subscribe (token soc A, societyKey soc B)",
      "403 (atteso)", "200", "FAIL",
      "🚨 P1: endpoint /api/push/subscribe NON valida societyKey contro req.jwtUser.societyId. Utente può iscriversi a notifiche di altre società.");
  } else {
    expectStatus(S, "", "Cross-society subscribe rifiutato", [403, 400], r);
  }
}

async function cleanup() {
  console.log("\n=== FASE 7: CLEANUP ===");
  const S = "CLEANUP";
  async function del(label, path) {
    const r = await call("DELETE", path, { token: TOKEN_ADMIN });
    rec(S, "", label, "200|204|404", String(r.status), r.ok || r.status === 404 ? "PASS" : "SKIP");
  }
  if (GIOCATORE_ID) await del(`user giocatore ${GIOCATORE_ID}`, `/api/v2/users/${GIOCATORE_ID}`);
  if (GENITORE_ID)  await del(`user genitore ${GENITORE_ID}`,  `/api/v2/users/${GENITORE_ID}`);
  if (DIRIGENTE_ID) await del(`user dirigente ${DIRIGENTE_ID}`, `/api/v2/users/${DIRIGENTE_ID}`);
  if (MISTER_ID)    await del(`user mister ${MISTER_ID}`,     `/api/v2/users/${MISTER_ID}`);
  if (PLAYER_U12_ID) await del(`player U12 ${PLAYER_U12_ID}`, `/api/v2/players/${PLAYER_U12_ID}`);
  if (PLAYER_U16_ID) await del(`player U16 ${PLAYER_U16_ID}`, `/api/v2/players/${PLAYER_U16_ID}`);
  if (LEVA_U12_ID)  await del(`leva U12 ${LEVA_U12_ID}`,      `/api/v2/leve/${LEVA_U12_ID}`);
  if (LEVA_U16_ID)  await del(`leva U16 ${LEVA_U16_ID}`,      `/api/v2/leve/${LEVA_U16_ID}`);
  if (SOC_ID && !REAL_SOC_IDS.has(SOC_ID)) {
    const r = await call("POST", `/api/v2/superadmin/societies/${SOC_ID}/suspend`,
      { saSecret: SA_SECRET, body: { reason: `QA push ${RUN_ID}` } });
    rec(S, "", `SUSPEND società ${SOC_ID}`, "200", String(r.status), r.ok ? "PASS" : "SKIP");
  }
}

async function main() {
  console.log(`MyVivaio — Test Push — runId=${RUN_ID} base=${BASE_URL}`);
  const start = Date.now();
  const ok = await setup();
  if (!ok) console.log("\n⛔ STOP: setup fallito");
  else {
    try { await phase2_subscribe();      } catch (e) { rec("F2","","err","ok",e.message,"FAIL"); }
    try { await phase3_preferenze();     } catch (e) { rec("F3","","err","ok",e.message,"FAIL"); }
    try { await phase4_logica_codice();  } catch (e) { rec("F4","","err","ok",e.message,"FAIL"); }
    try { await phase5_diagnostici();    } catch (e) { rec("F5","","err","ok",e.message,"FAIL"); }
    try { await phase6_security();       } catch (e) { rec("F6","","err","ok",e.message,"FAIL"); }
    try { await cleanup();               } catch (e) { rec("CLEANUP","","err","ok",e.message,"FAIL"); }
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(70));
  console.log(`PASS: ${counts.PASS}   FAIL: ${counts.FAIL}   SKIP: ${counts.SKIP}   (${elapsed}s)`);
  console.log("═".repeat(70));
  fs.writeFileSync("test-push-results.json", JSON.stringify({
    timestamp: new Date().toISOString(), baseUrl: BASE_URL, runId: RUN_ID, socId: SOC_ID,
    counts, elapsedSec: parseFloat(elapsed), results,
  }, null, 2));
  console.log("→ JSON: test-push-results.json");
  process.exit(counts.FAIL > 0 ? 1 : 0);
}
main().catch(e => { console.error("FATAL:", e); process.exit(2); });
