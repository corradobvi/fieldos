import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";

const router = Router();

const SA_SECRET = process.env.SA_SECRET ?? "super123";
const POLIS_BLOB_KEY = "fieldos_state_v1";
const POLIS_CODICE = "POLIS18";

const HASH_FORMAT = /^[0-9a-f]+:[0-9a-f]+$/;
const SALT_RE = /^[0-9a-f]{32}$/;
const PBKDF2_HASH_RE = /^[0-9a-f]{128}$/;

function _looksLikeValidHash(pass: string): boolean {
  if (typeof pass !== "string" || !HASH_FORMAT.test(pass)) return false;
  const parts = pass.split(":");
  if (parts.length !== 2) return false;
  return SALT_RE.test(parts[0]) && PBKDF2_HASH_RE.test(parts[1]);
}

function _passwordHandling(rawPass: any): "will_hash" | "keep_hash" | "default_changeme_temp" {
  if (rawPass == null || rawPass === "") return "default_changeme_temp";
  if (typeof rawPass !== "string") return "default_changeme_temp";
  return _looksLikeValidHash(rawPass) ? "keep_hash" : "will_hash";
}

// POST /api/v2/superadmin/migrate-polis-users
// Backfill utenti Polis dal blob `fieldos_state_v1.USERS_DB` alla tabella MySQL `users`.
// Default dryRun=true: SOLA LETTURA, restituisce un report di cosa farebbe la migrazione,
// senza eseguire NESSUNA INSERT/UPDATE e SENZA modifiche di schema.
// dryRun=false è riservato a uno step successivo: in questo build risponde 501.
router.post("/superadmin/migrate-polis-users", async (req, res) => {
  if (req.headers["x-sa-secret"] !== SA_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const dryRun = req.body?.dryRun !== false; // default true
  if (!dryRun) {
    return res.status(501).json({
      error: "write_mode_not_enabled",
      detail: "Questo endpoint accetta solo dryRun=true. La modalità di scrittura verrà attivata in uno step successivo.",
    });
  }

  try {
    // 1) Risolvi POLIS_MYSQL_ID dal codice POLIS18
    const [socRows] = (await pool.execute(
      "SELECT id, nome, stato, piano FROM societies WHERE codice = ? LIMIT 1",
      [POLIS_CODICE]
    )) as [any[], any];

    if (!socRows.length) {
      // Diagnostica sola lettura: nessuna scrittura. Aiuta a capire se Polis
      // è in MySQL sotto altro codice/nome o non c'è affatto.
      const [polisCandidates] = (await pool.execute(
        "SELECT id, codice, nome, stato, piano FROM societies WHERE LOWER(nome) LIKE '%polis%' OR UPPER(codice) LIKE '%POLIS%' ORDER BY id"
      )) as [any[], any];
      const [allSocieties] = (await pool.execute(
        "SELECT id, codice, nome, stato FROM societies ORDER BY id"
      )) as [any[], any];

      logger.info(
        { polisFound: false, candidates: polisCandidates.length, total: allSocieties.length },
        "superadmin/migrate-polis-users: polis not found by code, diagnostic dump"
      );

      return res.json({
        dryRun: true,
        polisFound: false,
        searchedCodice: POLIS_CODICE,
        polisCandidates,
        allSocieties,
      });
    }
    const polisMysqlId: number = socRows[0].id;
    const polisMeta = {
      id: polisMysqlId,
      nome: socRows[0].nome,
      stato: socRows[0].stato,
      piano: socRows[0].piano,
    };

    // 2) Carica blob fieldos_state_v1
    const [blobRows] = (await pool.execute(
      "SELECT state_json FROM `society_state` WHERE `key` = ? LIMIT 1",
      [POLIS_BLOB_KEY]
    )) as [any[], any];

    if (!blobRows.length) {
      return res.status(404).json({
        error: "polis_blob_not_found",
        detail: `Nessuna riga in society_state con key='${POLIS_BLOB_KEY}'.`,
      });
    }

    let state: any;
    try {
      state = JSON.parse(blobRows[0].state_json as string);
    } catch (parseErr: any) {
      return res.status(500).json({
        error: "polis_blob_invalid_json",
        detail: parseErr?.message,
      });
    }

    const usersDb: any[] = Array.isArray(state?.USERS_DB) ? state.USERS_DB : [];
    if (!usersDb.length) {
      return res.json({
        dryRun: true,
        polisFound: true,
        polis: polisMeta,
        totalUsers: 0,
        toInsert: 0,
        toUpdate: 0,
        withTempPassword: 0,
        skippedInvalid: 0,
        rows: [],
        note: "USERS_DB vuoto o assente nel blob.",
      });
    }

    // 3) Calcola azione prevista per ogni utente (NESSUNA scrittura)
    const rows: Array<{
      blobId: number | null;
      email: string;
      role: string;
      action: "INSERT" | "UPDATE" | "SKIP_INVALID";
      passwordHandling: "will_hash" | "keep_hash" | "default_changeme_temp" | "n_a";
      reason?: string;
    }> = [];

    let toInsert = 0;
    let toUpdate = 0;
    let withTempPassword = 0;
    let skippedInvalid = 0;

    for (const u of usersDb) {
      const rawEmail = typeof u?.email === "string" ? u.email.trim().toLowerCase() : "";
      const blobId: number | null = typeof u?.id === "number" ? u.id : null;
      const role = typeof u?.role === "string" ? u.role : "";

      if (!rawEmail || !u?.nome) {
        skippedInvalid++;
        rows.push({
          blobId,
          email: rawEmail || "(missing)",
          role,
          action: "SKIP_INVALID",
          passwordHandling: "n_a",
          reason: !rawEmail ? "missing_email" : "missing_nome",
        });
        continue;
      }

      const [existing] = (await pool.execute(
        "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ? LIMIT 1",
        [rawEmail, polisMysqlId]
      )) as [any[], any];

      const action: "INSERT" | "UPDATE" = existing.length ? "UPDATE" : "INSERT";
      const passwordHandling = _passwordHandling(u?.pass);

      if (action === "INSERT") toInsert++;
      else toUpdate++;
      if (passwordHandling === "default_changeme_temp") withTempPassword++;

      rows.push({
        blobId,
        email: rawEmail,
        role,
        action,
        passwordHandling,
      });
    }

    logger.info(
      { polisMysqlId, totalUsers: usersDb.length, toInsert, toUpdate, withTempPassword, skippedInvalid },
      "superadmin/migrate-polis-users: dry-run report"
    );

    return res.json({
      dryRun: true,
      polisFound: true,
      polis: polisMeta,
      totalUsers: usersDb.length,
      toInsert,
      toUpdate,
      withTempPassword,
      skippedInvalid,
      rows,
    });
  } catch (e: any) {
    logger.error({ err: e }, "superadmin/migrate-polis-users error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

export default router;
