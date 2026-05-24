import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import path from "path";
import fs from "fs";

const router = Router();

function checkAuth(req: any, res: any): boolean {
  const secret   = req.headers["x-sa-secret"];
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
      url_pubblico: string;
    }> = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    let updated  = 0;
    let notFound = 0;
    for (const entry of manifest) {
      const [result] = await pool.execute(
        "UPDATE sessioni_libreria SET grafica_url = ? WHERE id = ?",
        [entry.url_pubblico, entry.sessione_id]
      ) as [any, any];
      if ((result.affectedRows ?? 0) > 0) updated++; else notFound++;
    }
    logger.info({ updated, notFound, total: manifest.length }, "admin: populate-grafica-url done");
    return res.json({ ok: true, total: manifest.length, updated, notFound });
  } catch (e: any) {
    logger.error({ err: e }, "admin: populate-grafica-url failed");
    return res.status(500).json({ error: e?.message ?? "server_error" });
  }
});

export default router;
