// ─────────────────────────────────────────────────────────────────────────────
// Scoping per leva server-side.
//
// getUserLeve(userId, societyId, role):
//   - admin / mister_admin                                   → null  (wildcard, tutte le leve)
//   - genitore / nonno                                       → Set derivato da user_players → players.leva
//   - allenatore / dirigente / preparatore_portieri          → users.leva:
//                                                              - "Tutte"/"tutte" → null (wildcard)
//                                                              - null/''         → Set vuoto (nega)
//                                                              - "X"             → Set(["X"])
//   - altri ruoli (giocatore, ...)                           → Set vuoto (nega)
//
// requireLeva(levaResolver):
//   401 se !jwtUser. allowed=getUserLeve. wildcard→next. resolve leva.
//   400 se leva null/''. 403 se non match (confronto tollerante: trim +
//   collapse spazi interni + case-insensitive su entrambi i lati).
// ─────────────────────────────────────────────────────────────────────────────
import { pool } from "@workspace/db";
import type { Request, Response, NextFunction } from "express";

export type LevaSet = Set<string> | null; // null = wildcard

function _norm(s: any): string {
  if (s == null) return "";
  return String(s).trim().replace(/\s+/g, " ").toLowerCase();
}

export async function getUserLeve(
  userId: number,
  societyId: number,
  role: string
): Promise<LevaSet> {
  if (role === "admin" || role === "mister_admin") return null; // wildcard

  if (role === "genitore" || role === "nonno") {
    const [rows] = (await pool.execute(
      `SELECT DISTINCT p.leva
         FROM user_players up
         JOIN players p ON p.id = up.player_id
        WHERE up.user_id = ? AND p.society_id = ? AND p.leva IS NOT NULL AND p.leva <> ''`,
      [userId, societyId]
    )) as [any[], any];
    return new Set((rows as any[]).map((r: any) => _norm(r.leva)));
  }

  if (
    role === "allenatore" || role === "mister" ||
    role === "dirigente" ||
    role === "preparatore_portieri"
  ) {
    const [rows] = (await pool.execute(
      "SELECT leva FROM users WHERE id = ? AND society_id = ? LIMIT 1",
      [userId, societyId]
    )) as [any[], any];
    if (!rows.length || rows[0].leva == null || rows[0].leva === "") return new Set();
    const leva = String(rows[0].leva);
    if (leva.trim().toLowerCase() === "tutte") return null; // wildcard
    return new Set([_norm(leva)]);
  }

  return new Set(); // ruoli sconosciuti / giocatore → nega
}

export function requireLeva(
  levaResolver: (req: Request) => Promise<string | null> | string | null
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.jwtUser) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      const { userId, societyId, role } = req.jwtUser;
      const allowed = await getUserLeve(userId, societyId, role);
      if (allowed === null) {
        next();
        return;
      }
      const leva = await Promise.resolve(levaResolver(req));
      if (!leva) {
        res.status(400).json({ error: "leva_required" });
        return;
      }
      const lvNorm = _norm(leva);
      if (!allowed.has(lvNorm)) {
        res.status(403).json({ error: "leva_forbidden", leva });
        return;
      }
      next();
    } catch (e: any) {
      res.status(500).json({ error: "server_error" });
    }
  };
}
