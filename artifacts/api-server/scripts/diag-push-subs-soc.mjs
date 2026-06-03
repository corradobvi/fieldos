// Diagnostica read-only push_subscriptions per una società.
// Uso:
//   node --env-file=.env artifacts/api-server/scripts/diag-push-subs-soc.mjs [societyId]
// Oppure (Railway): MYSQL_URL=... node artifacts/api-server/scripts/diag-push-subs-soc.mjs 53
// Non modifica nulla. Solo SELECT.

// mysql2 e' in pnpm store del monorepo. Risolvo via glob al primo path utile,
// cosi' funziona anche se la versione cambia. Per Railway: girare in directory
// con node_modules/mysql2 risolvibile (es. dentro artifacts/api-server dopo
// build) oppure usare `pnpm exec node ...`.
import { readdirSync, existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

let mysql;
try {
  mysql = (await import("mysql2/promise")).default || (await import("mysql2/promise"));
} catch {
  const here = pathResolve(fileURLToPath(import.meta.url), "../../../..");
  const pnpmDir = pathResolve(here, "node_modules/.pnpm");
  if (existsSync(pnpmDir)) {
    const entry = readdirSync(pnpmDir).find(d => d.startsWith("mysql2@"));
    if (entry) {
      const url = "file://" + pathResolve(pnpmDir, entry, "node_modules/mysql2/promise.js");
      mysql = (await import(url)).default || (await import(url));
    }
  }
  if (!mysql) { console.error("ERROR: mysql2 non risolvibile — installa o gira con `pnpm exec`"); process.exit(1); }
}

const SOC_ID = Number(process.argv[2] || 53);
const URL = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (!URL) { console.error("ERROR: MYSQL_URL o DATABASE_URL non impostata"); process.exit(1); }

const STATE_KEY = `fieldos_state_soc_${SOC_ID}`;
const conn = await mysql.createConnection(URL);

try {
  console.log("=".repeat(70));
  console.log(`DIAG push_subscriptions per societyId=${SOC_ID}`);
  console.log(`stateKey (society_key esatto): ${STATE_KEY}`);
  console.log("=".repeat(70));

  // 1) Tutti i record push_subscriptions per la società.
  //    Filtro su society_key = stateKey esatto AND su pattern LIKE '%53%' per
  //    intercettare eventuali key sporche (es. id duplicato in stringa).
  const [subsExact] = await conn.query(
    `SELECT id, user_id, society_key, SUBSTRING(subscription, 1, 80) AS endpoint_head, updated_at
       FROM push_subscriptions WHERE society_key = ? ORDER BY id`,
    [STATE_KEY]
  );
  console.log(`\n[1a] Subscription per society_key='${STATE_KEY}' (match esatto): ${subsExact.length}`);
  subsExact.forEach(r => {
    let endpoint = "";
    try { endpoint = (JSON.parse(r.endpoint_head + "}").endpoint || "").slice(0, 60); } catch {}
    if (!endpoint) {
      try { endpoint = (JSON.parse(r.endpoint_head.replace(/[^}]*$/, "}")).endpoint || "").slice(0, 60); } catch {}
    }
    console.log(`  id=${r.id}  user_id=${r.user_id}  society_key='${r.society_key}'  endpoint=${endpoint || "(parse fail)"}  updated=${r.updated_at?.toISOString?.() || r.updated_at}`);
  });

  // Anche pattern LIKE '%53%' per beccare eventuali stringhe sporche.
  const [subsLike] = await conn.query(
    `SELECT id, user_id, society_key, SUBSTRING(subscription, 1, 80) AS endpoint_head, updated_at
       FROM push_subscriptions WHERE society_key LIKE ? AND society_key != ? ORDER BY id`,
    [`%${SOC_ID}%`, STATE_KEY]
  );
  console.log(`\n[1b] Subscription con society_key LIKE '%${SOC_ID}%' MA != stateKey: ${subsLike.length}`);
  subsLike.forEach(r => {
    console.log(`  id=${r.id}  user_id=${r.user_id}  society_key='${r.society_key}'  updated=${r.updated_at?.toISOString?.() || r.updated_at}`);
  });

  // 2) Utenti attivi soc 53 con ruolo eligibile per chat staff/leva.
  const [users] = await conn.query(
    `SELECT id, nome, cognome, ruolo, leva, stato
       FROM users
      WHERE society_id = ?
        AND ruolo IN ('admin','mister_admin','allenatore','dirigente','preparatore_portieri','genitore','nonno','giocatore')
      ORDER BY ruolo, cognome, nome`,
    [SOC_ID]
  );
  console.log(`\n[2] Utenti soc ${SOC_ID} (tutti i ruoli rilevanti, anche sospesi): ${users.length}`);
  users.forEach(u => {
    console.log(`  id=${u.id}  ${u.cognome} ${u.nome}  ruolo=${u.ruolo}  leva=${JSON.stringify(u.leva)}  stato=${u.stato}`);
  });

  // 3) Confronto: chi ha subscription (per society_key esatto) vs chi no.
  //    Solo ruoli che ricevono push chat (admin/mister_admin/staff + genitori/giocatori).
  const subbedIds = new Set(subsExact.map(s => Number(s.user_id)));
  const eligibleForPush = users.filter(u => u.stato === "attivo");
  console.log(`\n[3] Match user_id ↔ subscription (society_key='${STATE_KEY}'):`);
  console.log("    --- HANNO subscription ---");
  const withSub = eligibleForPush.filter(u => subbedIds.has(Number(u.id)));
  withSub.forEach(u => console.log(`     ✅ id=${u.id}  ${u.cognome} ${u.nome}  (${u.ruolo})`));
  if (!withSub.length) console.log("     (nessuno)");
  console.log("    --- SENZA subscription ---");
  const withoutSub = eligibleForPush.filter(u => !subbedIds.has(Number(u.id)));
  withoutSub.forEach(u => console.log(`     ❌ id=${u.id}  ${u.cognome} ${u.nome}  (${u.ruolo})`));
  if (!withoutSub.length) console.log("     (nessuno)");

  // 4) Subscription orfane: user_id non presente tra gli utenti di questa società.
  const userIdsSet = new Set(users.map(u => Number(u.id)));
  const orphans = subsExact.filter(s => !userIdsSet.has(Number(s.user_id)));
  console.log(`\n[4a] Subscription orfane (user_id non tra gli utenti di soc ${SOC_ID}): ${orphans.length}`);
  orphans.forEach(s => console.log(`     ⚠️  id=${s.id}  user_id=${s.user_id}  (probabile blob id pre-fix 44cf82e)`));

  // 4b) Quante subscription hanno user_id=1 per soc 53 (caso storico blob id).
  const [withId1] = await conn.query(
    `SELECT id, user_id, society_key, updated_at
       FROM push_subscriptions WHERE user_id = 1 AND society_key = ?`,
    [STATE_KEY]
  );
  console.log(`\n[4b] Subscription con user_id=1 e society_key='${STATE_KEY}': ${withId1.length}`);
  withId1.forEach(r => console.log(`     id=${r.id}  updated=${r.updated_at?.toISOString?.() || r.updated_at}`));

  // Bonus: totale generale push_subscriptions e breakdown per society_key (top 10).
  const [tot] = await conn.query("SELECT COUNT(*) AS n FROM push_subscriptions");
  console.log(`\n[bonus] Totale push_subscriptions in tabella: ${tot[0].n}`);
  const [bySocKey] = await conn.query(
    `SELECT society_key, COUNT(*) AS n FROM push_subscriptions GROUP BY society_key ORDER BY n DESC LIMIT 10`
  );
  console.log("  Top 10 society_key:");
  bySocKey.forEach(r => console.log(`    ${r.n}x  '${r.society_key}'`));

  console.log("\n" + "=".repeat(70));
  console.log("DIAG COMPLETED — nessuna modifica al DB.");
  console.log("=".repeat(70));
} finally {
  await conn.end();
}
