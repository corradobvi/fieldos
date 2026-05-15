/**
 * Script una-tantum: pulisce utenti con society_id non valido.
 *
 * Esegui UNA volta dopo aver deployato la migration che rende
 * users.society_id nullable:
 *
 *   npx ts-node -r tsconfig-paths/register src/scripts/cleanup-legacy-society-ids.ts
 *
 * Oppure, se il server è già in esecuzione su Railway, usa il task runner
 * integrato nel Dockerfile (o esegui direttamente via railway run).
 */

import { pool } from "@workspace/db";

async function run() {
  console.log("Cleanup legacy society_id — START");

  // Conta prima quanti record saranno toccati (dry-run)
  const [preview] = (await pool.execute(`
    SELECT COUNT(*) AS n FROM users
    WHERE society_id IN (0, 99, 99999)
       OR (society_id IS NOT NULL AND society_id NOT IN (SELECT id FROM societies))
  `)) as [any[], any];
  console.log(`Record da pulire: ${preview[0].n}`);

  if (preview[0].n === 0) {
    console.log("Niente da fare — DB già pulito.");
    await pool.end();
    process.exit(0);
  }

  // Applica la pulizia
  const [result] = (await pool.execute(`
    UPDATE users SET society_id = NULL
    WHERE society_id IN (0, 99, 99999)
       OR (society_id IS NOT NULL AND society_id NOT IN (SELECT id FROM societies))
  `)) as [any, any];

  console.log(`Cleanup completato: ${result.affectedRows} utenti aggiornati (society_id → NULL)`);
  await pool.end();
  process.exit(0);
}

run().catch(e => {
  console.error("Cleanup FAILED:", e);
  process.exit(1);
});
