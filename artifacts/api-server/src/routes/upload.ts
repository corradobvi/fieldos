import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { requireAuth } from "../lib/auth";

const router = Router();

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS \`photo_uploads\` (
    \`id\`          INT AUTO_INCREMENT PRIMARY KEY,
    \`society_key\` VARCHAR(255) NOT NULL,
    \`photo_key\`   VARCHAR(255) NOT NULL,
    \`mime_type\`   VARCHAR(50)  NOT NULL DEFAULT 'image/jpeg',
    \`data\`        MEDIUMBLOB   NOT NULL,
    \`updated_at\`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_soc_photo\` (\`society_key\`, \`photo_key\`)
  )
`;

let _tableReady = false;
async function ensureTable() {
  if (_tableReady) return;
  await pool.execute(CREATE_TABLE);
  _tableReady = true;
}

// POST /api/upload/photo
// Body: { societyKey, photoKey, dataBase64 }
// Returns: { ok: true, url: "/api/photo/{societyKey}/{photoKey}" }
// FIX security audit-globale: prima del fix accessibile senza auth → chiunque
// poteva caricare foto (max 2MB) consumando spazio DB MEDIUMBLOB e/o pulire
// foto di altre società (DELETE). Aggiunto requireAuth. Ownership su societyKey
// NON applicato qui perché il formato `society_key` di photo_uploads è una
// stringa arbitraria del FE, non sempre derivabile da JWT.societyId (es. demo).
// Va considerato come miglioria futura (P2): mappare society_key → societyId
// per ownership check stretto.
router.post("/upload/photo", requireAuth, async (req, res) => {
  const { societyKey, photoKey, dataBase64 } = req.body as Record<string, string>;

  if (!societyKey || !photoKey || !dataBase64) {
    return res.status(400).json({ error: "missing_fields" });
  }

  // Strip data URI prefix if present, detect mime type
  let base64Data = dataBase64;
  let mime = "image/jpeg";
  const dataUriMatch = dataBase64.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUriMatch) {
    mime = dataUriMatch[1];
    base64Data = dataUriMatch[2];
  }

  // Max ~2MB base64 ≈ 1.5MB binary — well within MEDIUMBLOB (16MB)
  if (base64Data.length > 2_800_000) {
    return res.status(413).json({ error: "photo_too_large" });
  }

  try {
    await ensureTable();
    const buf = Buffer.from(base64Data, "base64");
    await pool.execute(
      `INSERT INTO \`photo_uploads\` (\`society_key\`, \`photo_key\`, \`mime_type\`, \`data\`)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`mime_type\` = VALUES(\`mime_type\`), \`data\` = VALUES(\`data\`)`,
      [societyKey, photoKey, mime, buf]
    );
    const url = `/api/photo/${encodeURIComponent(societyKey)}/${encodeURIComponent(photoKey)}`;
    logger.info({ societyKey, photoKey, bytes: buf.length }, "photo uploaded");
    return res.json({ ok: true, url });
  } catch (e: any) {
    logger.error({ err: e }, "photo upload error");
    return res.status(500).json({ error: "server_error", detail: e?.message });
  }
});

// GET /api/photo/:societyKey/:photoKey
router.get("/photo/:societyKey/:photoKey", async (req, res) => {
  try {
    await ensureTable();
    const [rows] = (await pool.execute(
      "SELECT mime_type, data FROM `photo_uploads` WHERE society_key = ? AND photo_key = ?",
      [req.params.societyKey, req.params.photoKey]
    )) as [any[], any];

    if (!rows.length) return res.status(404).send("Not found");
    res.setHeader("Content-Type", rows[0].mime_type || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    return res.send(rows[0].data);
  } catch (e: any) {
    logger.error({ err: e }, "photo GET error");
    return res.status(500).send("Server error");
  }
});

// DELETE /api/upload/photo/:societyKey/:photoKey (pulizia opzionale)
// FIX security audit-globale: requireAuth aggiunto. Ownership non applicato
// (stesso motivo del POST: formato society_key non sempre derivabile da JWT).
router.delete("/upload/photo/:societyKey/:photoKey", requireAuth, async (req, res) => {
  try {
    await ensureTable();
    await pool.execute(
      "DELETE FROM `photo_uploads` WHERE society_key = ? AND photo_key = ?",
      [req.params.societyKey, req.params.photoKey]
    );
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
