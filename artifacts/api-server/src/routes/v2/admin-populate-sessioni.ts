import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import path from "path";
import fs from "fs";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret   = req.headers["x-admin-secret"];
  const saSecret = process.env.ADMIN_RESET_SECRET;
  if (!saSecret || secret !== saSecret) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

// POST /api/v2/_admin/migrate-grafica-url
// Idempotent: adds grafica_url column to sessioni_libreria if not present
router.post("/_admin/migrate-grafica-url", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const [cols] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='sessioni_libreria' AND COLUMN_NAME='grafica_url' AND TABLE_SCHEMA=DATABASE()"
    ) as [any[], any];
    if (cols.length > 0) {
      return res.json({ ok: true, action: "already_exists" });
    }
    await pool.execute("ALTER TABLE sessioni_libreria ADD COLUMN grafica_url VARCHAR(500) NULL");
    logger.info("admin: grafica_url column added");
    return res.json({ ok: true, action: "created" });
  } catch (e: any) {
    logger.error({ err: e }, "admin: migrate-grafica-url failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

// POST /api/v2/_admin/populate-grafica-url
// Reads _manifest.json and bulk-updates sessioni_libreria.grafica_url
router.post("/_admin/populate-grafica-url", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const manifestPath = path.join(
      process.cwd(),
      "artifacts", "fieldos", "dist", "public", "sessioni-ufficiali", "_manifest.json"
    );
    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: "manifest_not_found", path: manifestPath });
    }
    const manifest: Array<{
      sessione_id: string;
      titolo: string;
      eta: string;
      url_pubblico: string;
    }> = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    let updated  = 0;
    let notFound = 0;
    const missing: Array<{ titolo: string; eta: string }> = [];
    for (const entry of manifest) {
      const [result] = await pool.execute(
        "UPDATE sessioni_libreria SET grafica_url = ? WHERE titolo = ? AND eta_leva = ? AND ufficiale_myvivaio = TRUE",
        [entry.url_pubblico, entry.titolo, entry.eta]
      ) as [any, any];
      if ((result.affectedRows ?? 0) > 0) updated++;
      else { notFound++; if (missing.length < 10) missing.push({ titolo: entry.titolo, eta: entry.eta }); }
    }
    logger.info({ updated, notFound, total: manifest.length }, "admin: populate-grafica-url done");
    return res.json({ ok: true, total: manifest.length, updated, notFound, missing_sample: missing });
  } catch (e: any) {
    logger.error({ err: e }, "admin: populate-grafica-url failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

// GET /api/v2/_admin/whoami — TEMP diagnostic, NO AUTH
router.get("/_admin/whoami", (req, res) => {
  const envSecret = process.env.ADMIN_RESET_SECRET;
  const headerSecret = req.headers["x-admin-secret"] as string | undefined;
  res.json({
    has_env: !!envSecret,
    env_length: envSecret?.length ?? 0,
    env_first8: envSecret?.substring(0, 8) ?? null,
    env_last8: envSecret ? envSecret.substring(envSecret.length - 8) : null,
    has_header: !!headerSecret,
    header_length: headerSecret?.length ?? 0,
    header_first8: headerSecret?.substring(0, 8) ?? null,
    header_last8: headerSecret ? headerSecret.substring(headerSecret.length - 8) : null,
    match: envSecret === headerSecret,
  });
});

export default router;
