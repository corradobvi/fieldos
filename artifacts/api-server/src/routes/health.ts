import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, v: "2026-05-10-v3" });
});

// Diagnostica temporanea: mostra host DB (senza password) e testa connessione
router.get("/healthz/db", async (_req, res) => {
  const raw = process.env["DATABASE_URL"] ?? "";
  let host = "(not set)";
  if (raw) {
    try {
      const u = new URL(raw);
      host = `${u.hostname}:${u.port || 3306}/${u.pathname.slice(1)}`;
    } catch {
      host = "(invalid URL)";
    }
  }
  try {
    await pool.execute("SELECT 1");
    res.json({ db: "ok", host });
  } catch (e: any) {
    res.status(500).json({ db: "error", host, code: e?.code, message: e?.message?.slice(0, 120) });
  }
});

export default router;
