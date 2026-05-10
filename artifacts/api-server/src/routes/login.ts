import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`society_state\` (
    \`key\`     VARCHAR(255) PRIMARY KEY,
    state_json  LONGTEXT NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// POST /api/login — cerca le credenziali in tutte le società attive nel DB
// Restituisce { societyId, stateKey, user } oppure 401/403/400
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Crea la tabella se non esiste ancora
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

    // 2. Cerca l'utente in ogni società attiva
    for (const soc of societies) {
      if (soc.stato !== "attivo") continue;
      const stateKey: string =
        soc.id === 0 ? "fieldos_state_v1" : `fieldos_state_soc_${soc.id}`;

      const [stateRows] = (await pool.execute(
        "SELECT state_json FROM `society_state` WHERE `key` = ?",
        [stateKey]
      )) as [any[], any];

      if (!stateRows.length) continue;

      let state: any;
      try {
        state = JSON.parse(stateRows[0].state_json as string);
      } catch {
        continue;
      }

      const users: any[] = state.USERS_DB || [];
      const user = users.find(
        (u: any) =>
          typeof u.email === "string" &&
          u.email.toLowerCase() === normalizedEmail &&
          u.pass === password
      );

      if (!user) continue;

      if (user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }

      // Restituisce l'utente completo (incluso pass — l'app ne ha bisogno internamente)
      return res.json({ societyId: soc.id as number, stateKey, user });
    }

    return res.status(401).json({ error: "invalid_credentials" });
  } catch (e: any) {
    logger.error({ err: e }, "login error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
