import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface JwtPayload {
  userId: number;
  societyId: number;
  role: string;
  email: string;
  societyPiano?: string | null;
  exp: number;
}

// Path che NON richiedono la scelta del piano (Step 2 self-register flow)
const PLAN_BYPASS_SUFFIX = ["/societies/select-plan"];
function _pathBypassesPlanCheck(originalUrl: string): boolean {
  const path = (originalUrl || "").split("?")[0];
  return PLAN_BYPASS_SUFFIX.some((s) => path.endsWith(s));
}

export function signJWT(payload: Omit<JwtPayload, "exp">): string {
  const full: JwtPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body   = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig    = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    const sigBuf  = Buffer.from(sig, "base64url");
    const expBuf  = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as JwtPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(plain, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    if (!stored.includes(":")) {
      // Legacy plain-text passwords from the old blob system
      return plain === stored;
    }
    const [salt, hash] = stored.split(":");
    const attempt = pbkdf2Sync(plain, salt, 100_000, 64, "sha512").toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const attemptBuf = Buffer.from(attempt, "hex");
    return hashBuf.length === attemptBuf.length && timingSafeEqual(hashBuf, attemptBuf);
  } catch {
    return false;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    jwtUser?: JwtPayload;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "unauthorized" }); return; }
  const payload = verifyJWT(auth.slice(7));
  if (!payload) { res.status(401).json({ error: "invalid_token" }); return; }
  req.jwtUser = payload;
  // Plan-required gate: se l'utente non ha ancora scelto un piano (Step 2 del self-register flow)
  // qualunque route protetta tranne /societies/select-plan ritorna 403 plan_required.
  if (payload.societyPiano == null && !_pathBypassesPlanCheck(req.originalUrl)) {
    res.status(403).json({ error: "plan_required" });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.jwtUser) { res.status(401).json({ error: "unauthorized" }); return; }
    if (!roles.includes(req.jwtUser.role)) { res.status(403).json({ error: "forbidden" }); return; }
    next();
  };
}
