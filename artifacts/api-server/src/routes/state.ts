import { Router } from "express";
import { db, societyState } from "@workspace/db";
import { eq } from "drizzle-orm";

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
  } catch (e) {
    return res.status(500).json({ error: "db error" });
  }
});

// PUT /state/:key — upsert state blob
router.put("/state/:key", async (req, res) => {
  const { stateJson } = req.body as { stateJson?: unknown };
  if (typeof stateJson !== "string") {
    return res.status(400).json({ error: "stateJson must be a string" });
  }
  try {
    const now = new Date();
    await db
      .insert(societyState)
      .values({ key: req.params.key, stateJson, updatedAt: now })
      .onDuplicateKeyUpdate({ set: { stateJson, updatedAt: now } });
    return res.json({ key: req.params.key, updatedAt: now.toISOString() });
  } catch (e) {
    return res.status(500).json({ error: "db error" });
  }
});

export default router;
