import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`      VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    is_demo     TINYINT(1) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// POST /api/login — cerca le credenziali in tutte le società attive nel DB
// Restituisce { societyId, stateKey, user, stateJson } oppure 401/403/400
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    await pool.execute(CREATE_TABLE_SQL);

    // 1. Legge l'elenco delle società dal SA state
    const [saRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ?",
      ["fieldos_sa_v1"]
    )) as [any[], any];

    let societies: any[] = [];
    if (saRows.length) {
      try {
        const saState = JSON.parse(saRows[0].state_json as string);
        societies = Array.isArray(saState.saSocieties) ? saState.saSocieties : [];
      } catch {}
    }

    // Helper: carica stateJson + cerca utente
    async function searchKey(stateKey: string, societyId: number) {
      const [stateRows] = (await pool.execute(
        "SELECT state_json FROM `society_state` WHERE `key` = ?",
        [stateKey]
      )) as [any[], any];
      if (!stateRows.length) return null;
      let state: any;
      try { state = JSON.parse(stateRows[0].state_json as string); } catch { return null; }
      const users: any[] = state.USERS_DB || [];
      const user = users.find(
        (u: any) =>
          typeof u.email === "string" &&
          u.email.toLowerCase() === normalizedEmail &&
          u.pass === password
      );
      if (!user) return null;
      return { state, stateKey, societyId, user, stateJson: stateRows[0].state_json as string };
    }

    // 2. Cerca nelle società elencate nel SA state
    const checkedKeys = new Set<string>();
    for (const soc of societies) {
      // Blocca accesso se società non attiva
      const stato = soc.stato ?? "attivo";
      const stateKey: string =
        soc.id === 0 ? "fieldos_state_v1" : `fieldos_state_soc_${soc.id}`;
      checkedKeys.add(stateKey);

      const found = await searchKey(stateKey, soc.id as number);
      if (!found) continue;

      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }

      if (stato === "sospeso") {
        return res.status(403).json({ error: "society_suspended", message: "La società è sospesa. Contatta il supporto." });
      }
      if (stato === "archiviato") {
        return res.status(403).json({ error: "society_archived", message: "La società è archiviata. Contatta il supporto." });
      }
      if (stato === "eliminato") {
        return res.status(403).json({ error: "society_deleted", message: "La società è stata eliminata." });
      }

      logger.info({ email: normalizedEmail, societyId: soc.id, stateKey }, "login ok (SA-guided)");
      return res.json({ societyId: soc.id as number, stateKey, user: found.user, stateJson: found.stateJson });
    }

    // 3. Fallback: scansiona chiavi orfane nel DB (non elencate nel SA state)
    // Utile per recuperare dati di società mancanti dal SA state
    const [allKeys] = (await pool.execute(
      "SELECT `key` FROM `society_state` WHERE (`key` LIKE 'fieldos_state_soc_%' OR `key` = 'fieldos_state_v1') AND `key` NOT LIKE 'fieldos_demo%'"
    )) as [any[], any];

    for (const row of allKeys) {
      const stateKey: string = row.key;
      if (checkedKeys.has(stateKey)) continue; // già cercata sopra
      const socIdMatch = stateKey.match(/fieldos_state_soc_(\d+)$/);
      const societyId = socIdMatch ? parseInt(socIdMatch[1]) : 0;
      const found = await searchKey(stateKey, societyId);
      if (!found) continue;
      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }
      logger.info({ email: normalizedEmail, societyId, stateKey }, "login ok (orphan-key fallback)");
      return res.json({ societyId, stateKey, user: found.user, stateJson: found.stateJson });
    }

    return res.status(401).json({ error: "invalid_credentials" });
  } catch (e: any) {
    logger.error({ err: e }, "login error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
