import { Router } from "express";
import { pool } from "@workspace/db";
import { logger } from "../../lib/logger";
import { requireAuth, requireRole, hashPassword } from "../../lib/auth";

const router = Router();

const PIANO_NORM_U: Record<string, string> = { gratuito: "mister", base: "mister_pro", premium: "societa" };
const COLLAB_LIMITS: Record<string, number> = { mister: 0, mister_pro: 6, societa: Infinity, demo: Infinity };
const COLLAB_ROLES = new Set(["allenatore", "dirigente"]);

async function getCollabLimit(societyId: number): Promise<number> {
  const [rows] = await pool.execute("SELECT piano FROM societies WHERE id = ?", [societyId]) as [any[], any];
  const raw = rows[0]?.piano || "demo";
  const norm = PIANO_NORM_U[raw] || raw;
  return COLLAB_LIMITS[norm] ?? 0;
}

// GET /api/v2/users
router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      `SELECT id, nome, cognome, email, ruolo, leva, stato, temp_password, figli, created_at
       FROM users WHERE society_id = ? ORDER BY cognome, nome`,
      [societyId]
    )) as [any[], any];

    return res.json(rows.map(u => ({
      ...u,
      figli: u.figli ? JSON.parse(u.figli) : [],
      tempPassword: u.temp_password === 1,
    })));
  } catch (e: any) {
    logger.error({ err: e }, "GET users error");
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/users
router.post("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, cognome, email, password, ruolo, leva, figli } = req.body as Record<string, any>;

  if (!nome || !cognome || !email || !password || !ruolo) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const hash = hashPassword(password);

  try {
    if (COLLAB_ROLES.has(ruolo)) {
      const maxCollab = await getCollabLimit(societyId);
      if (isFinite(maxCollab)) {
        const [cnt] = await pool.execute(
          `SELECT COUNT(*) as n FROM users WHERE society_id = ? AND ruolo IN ('allenatore','dirigente') AND stato != 'sospeso'`,
          [societyId]
        ) as [any[], any];
        if (cnt[0].n >= maxCollab) {
          return res.status(403).json({ error: "plan_limit_reached", limitType: "collaboratori", current: cnt[0].n, max: maxCollab });
        }
      }
    }

    const [existing] = (await pool.execute(
      "SELECT id FROM users WHERE LOWER(email) = ? AND society_id = ?",
      [normalizedEmail, societyId]
    )) as [any[], any];
    if (existing.length) return res.status(409).json({ error: "email_exists" });

    const [result] = (await pool.execute(
      `INSERT INTO users (society_id, nome, cognome, email, password_hash, ruolo, leva, figli, temp_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [societyId, nome.trim(), cognome.trim(), normalizedEmail, hash, ruolo,
       leva ?? null, figli ? JSON.stringify(figli) : null]
    )) as [any, any];

    return res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    logger.error({ err: e }, "POST user error");
    return res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/v2/users/:id
router.put("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { nome, cognome, email, password, ruolo, leva, stato, figli } = req.body as Record<string, any>;

  try {
    // Se il ruolo sta cambiando verso un ruolo collaboratore, verifica il limite
    if (ruolo && COLLAB_ROLES.has(ruolo)) {
      const [curRows] = await pool.execute(
        "SELECT ruolo FROM users WHERE id = ? AND society_id = ?",
        [req.params.id, societyId]
      ) as [any[], any];
      const currentRuolo = curRows[0]?.ruolo;
      if (currentRuolo && !COLLAB_ROLES.has(currentRuolo)) {
        const maxCollab = await getCollabLimit(societyId);
        if (isFinite(maxCollab)) {
          const [cnt] = await pool.execute(
            `SELECT COUNT(*) as n FROM users WHERE society_id = ? AND ruolo IN ('allenatore','dirigente') AND stato != 'sospeso' AND id != ?`,
            [societyId, req.params.id]
          ) as [any[], any];
          if (cnt[0].n >= maxCollab) {
            return res.status(403).json({ error: "plan_limit_reached", limitType: "collaboratori", current: cnt[0].n, max: maxCollab });
          }
        }
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (nome)    { updates.push("nome = ?");    params.push(nome.trim()); }
    if (cognome) { updates.push("cognome = ?"); params.push(cognome.trim()); }
    if (email)   { updates.push("email = ?");   params.push(email.trim().toLowerCase()); }
    if (ruolo)   { updates.push("ruolo = ?");   params.push(ruolo); }
    if (leva !== undefined) { updates.push("leva = ?"); params.push(leva ?? null); }
    if (stato)   { updates.push("stato = ?");   params.push(stato); }
    if (figli !== undefined) { updates.push("figli = ?"); params.push(figli ? JSON.stringify(figli) : null); }
    if (password) {
      updates.push("password_hash = ?");
      updates.push("temp_password = TRUE");
      params.push(hashPassword(password));
    }

    if (!updates.length) return res.status(400).json({ error: "nothing_to_update" });

    params.push(req.params.id, societyId);
    const [result] = (await pool.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ? AND society_id = ?`,
      params
    )) as [any, any];

    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "PUT user error");
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/v2/users/:id
router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId, userId } = req.jwtUser!;
  if (String(userId) === req.params.id) return res.status(400).json({ error: "cannot_delete_self" });

  try {
    const [result] = (await pool.execute(
      "DELETE FROM users WHERE id = ? AND society_id = ?",
      [req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    logger.error({ err: e }, "DELETE user error");
    return res.status(500).json({ error: "server_error" });
  }
});

// GET /api/v2/users/pending — utenti in attesa di approvazione
router.get("/users/pending", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  try {
    const [rows] = (await pool.execute(
      "SELECT id, nome, cognome, email, created_at FROM users WHERE society_id = ? AND stato = 'pendente' ORDER BY created_at DESC",
      [societyId]
    )) as [any[], any];
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/v2/users/:id/approve
router.post("/users/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  const { societyId } = req.jwtUser!;
  const { ruolo, leva, figli } = req.body as Record<string, any>;

  try {
    const [result] = (await pool.execute(
      `UPDATE users SET stato = 'attivo', ruolo = COALESCE(?, ruolo),
        leva = COALESCE(?, leva), figli = COALESCE(?, figli)
       WHERE id = ? AND society_id = ? AND stato = 'pendente'`,
      [ruolo ?? null, leva ?? null, figli ? JSON.stringify(figli) : null, req.params.id, societyId]
    )) as [any, any];
    if (!result.affectedRows) return res.status(404).json({ error: "not_found" });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
