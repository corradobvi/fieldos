import { pool } from "@workspace/db";
import type { Request, Response, NextFunction } from "express";

// Admin and mister_admin always pass.
// Other roles: fetch permissions JSON from MySQL.
//   - NULL permissions → no restrictions → pass (backward compatible)
//   - perms[key] === true → pass
//   - Otherwise → 403
export function requirePermission(key: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.jwtUser) { res.status(401).json({ error: "unauthorized" }); return; }
    if (req.jwtUser.role === "admin" || req.jwtUser.role === "mister_admin") { next(); return; }
    try {
      const [rows] = (await pool.execute(
        "SELECT permissions FROM users WHERE id = ? LIMIT 1",
        [req.jwtUser.userId]
      )) as [any[], any];
      // No DB row → legacy user → pass
      if (!rows.length) { next(); return; }
      // NULL permissions → no restrictions configured → pass
      if (rows[0].permissions === null || rows[0].permissions === undefined) { next(); return; }
      let perms: Record<string, boolean> = {};
      try { perms = typeof rows[0].permissions === "string" ? JSON.parse(rows[0].permissions) : rows[0].permissions; } catch {}
      if (perms[key] === true) { next(); return; }
      res.status(403).json({ error: "permission_denied", permission: key });
    } catch (e: any) {
      res.status(500).json({ error: "server_error" });
    }
  };
}
