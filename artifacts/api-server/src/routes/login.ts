import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { signJWT } from "../lib/auth";

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

    // Helper: query MySQL per stato/piano/billing_mode di una società
    async function _mysqlSocietyCheck(societyId: number): Promise<{
      ok: boolean; error?: string; message?: string;
      piano?: string | null; billingMode?: string | null;
    }> {
      if (societyId <= 0) return { ok: true };
      try {
        const [rows] = (await pool.execute(
          "SELECT stato, piano, billing_mode FROM societies WHERE id = ? LIMIT 1",
          [societyId]
        )) as [any[], any];
        if (!rows.length) return { ok: true }; // blob-only society, allow
        const ms = rows[0];
        const msStato: string = ms.stato || 'attiva';
        if (msStato === 'sospesa')  return { ok: false, error: "society_suspended",  message: "La società è sospesa. Contatta il supporto." };
        if (msStato === 'archiviata') return { ok: false, error: "society_archived", message: "La società è archiviata. Contatta il supporto." };
        if (msStato !== 'attiva')   return { ok: false, error: "society_suspended",  message: "La società non è attiva. Contatta il supporto." };
        return { ok: true, piano: ms.piano ?? null, billingMode: ms.billing_mode ?? null };
      } catch {
        return { ok: true }; // DB error: allow login, don't lock users out
      }
    }

    // 2. Cerca nelle società elencate nel SA state
    const checkedKeys = new Set<string>();
    for (const soc of societies) {
      const blobStato = soc.stato ?? "attivo";
      const stateKey: string =
        soc.id === 0 ? "fieldos_state_v1" : `fieldos_state_soc_${soc.id}`;
      checkedKeys.add(stateKey);

      const found = await searchKey(stateKey, soc.id as number);
      if (!found) continue;

      if (found.user.stato === "sospeso") {
        return res.status(403).json({ error: "suspended" });
      }

      // FIX 1: verifica stato direttamente da MySQL (source of truth)
      const msCheck = await _mysqlSocietyCheck(soc.id as number);
      if (!msCheck.ok) {
        return res.status(403).json({ error: msCheck.error, message: msCheck.message });
      }
      // Fallback to blob stato if no MySQL row
      if (msCheck.piano === undefined) {
        if (blobStato === "sospeso")   return res.status(403).json({ error: "society_suspended",  message: "La società è sospesa. Contatta il supporto." });
        if (blobStato === "archiviato") return res.status(403).json({ error: "society_archived",  message: "La società è archiviata. Contatta il supporto." });
        if (blobStato === "eliminato") return res.status(403).json({ error: "society_deleted",    message: "La società è stata eliminata." });
      }

      // Demo scaduta (da blob)
      const scadenzaDemo = soc.scadenzaDemo as number | undefined;
      const pianoSoc = msCheck.piano || (soc.piano as string | undefined) || "demo";
      if (pianoSoc === "demo" && scadenzaDemo && scadenzaDemo < Date.now()) {
        return res.status(403).json({ error: "demo_expired" });
      }

      logger.info({ email: normalizedEmail, societyId: soc.id, stateKey }, "login ok (SA-guided)");
      const _pc = await _mysqlPrivacyCheck(normalizedEmail, soc.id as number, found.user.role ?? 'admin');
      return res.json({
        societyId: soc.id as number, stateKey,
        user: { ...found.user, is_account_owner: _pc.isAccountOwner },
        stateJson: found.stateJson,
        societyPiano: msCheck.piano ?? null, societyBillingMode: msCheck.billingMode ?? null,
        privacyPending: _pc.privacyPending, v2Token: _pc.v2Token,
      });
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
      // FIX 1: verifica stato MySQL anche per chiavi orfane
      const msCheck2 = await _mysqlSocietyCheck(societyId);
      if (!msCheck2.ok) {
        return res.status(403).json({ error: msCheck2.error, message: msCheck2.message });
      }
      logger.info({ email: normalizedEmail, societyId, stateKey }, "login ok (orphan-key fallback)");
      const _pc2 = await _mysqlPrivacyCheck(normalizedEmail, societyId, found.user.role ?? 'admin');
      return res.json({
        societyId, stateKey,
        user: { ...found.user, is_account_owner: _pc2.isAccountOwner },
        stateJson: found.stateJson,
        societyPiano: msCheck2.piano ?? null, societyBillingMode: msCheck2.billingMode ?? null,
        privacyPending: _pc2.privacyPending, v2Token: _pc2.v2Token,
      });
    }

    return res.status(401).json({ error: "invalid_credentials" });
  } catch (e: any) {
    logger.error({ err: e }, "login error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// Checks MySQL for a matching user and returns privacyPending + v2Token if needed.
// Returns null if the user has no MySQL row (blob-only legacy user).
async function _mysqlPrivacyCheck(
  email: string,
  societyId: number,
  role: string
): Promise<{ privacyPending: boolean; v2Token: string | null; isAccountOwner: boolean }> {
  try {
    const [rows] = (await pool.execute(
      `SELECT id, privacy_accepted_at, is_account_owner FROM users
       WHERE LOWER(email) = ? AND society_id = ? AND stato = 'attivo'
       LIMIT 1`,
      [email.toLowerCase(), societyId]
    )) as [any[], any];
    if (!rows.length) return { privacyPending: false, v2Token: null, isAccountOwner: false };
    const mysqlUser = rows[0];
    const privacyPending = mysqlUser.privacy_accepted_at === null;
    const v2Token = signJWT({ userId: mysqlUser.id, societyId, role, email });
    const isAccountOwner = mysqlUser.is_account_owner === 1;
    return { privacyPending, v2Token, isAccountOwner };
  } catch {
    return { privacyPending: false, v2Token: null, isAccountOwner: false };
  }
}

export default router;
