import { Router } from "express";
import { db, societyState } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// GET /state/:key — retrieve state blob
router.get("/state/:key", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(societyState)
      .where(eq(societyState.key, req.params.key));
    if (!rows.length) {
      return res.status(404).json({ error: "not found" });
    }
    const row = rows[0];
    return res.json({
      key: row.key,
      stateJson: row.stateJson,
      updatedAt: row.updatedAt,
    });
  } catch (e: any) {
    logger.error({ err: e }, "state GET failed");
    const detail = e?.sqlMessage ?? e?.code ?? e?.errno ?? "db_error";
    return res.status(500).json({ error: String(detail) });
  }
});

// PUT /state/:key — upsert state blob
router.put("/state/:key", async (req, res) => {
  const { stateJson } = req.body as { stateJson?: unknown };
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }
  try {
    // Non passiamo updatedAt esplicitamente — MySQL lo gestisce via DEFAULT/ON UPDATE
    await db
      .insert(societyState)
      .values({ key: req.params.key, stateJson })
      .onDuplicateKeyUpdate({ set: { stateJson } });
    return res.json({ key: req.params.key, updatedAt: new Date().toISOString() });
  } catch (e: any) {
    logger.error({ err: e }, "state PUT failed");
    const detail = e?.sqlMessage ?? e?.code ?? e?.errno ?? "db_error";
    return res.status(500).json({ error: String(detail) });
  }
});

export default router;
