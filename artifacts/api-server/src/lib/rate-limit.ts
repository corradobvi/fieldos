// Rate limiter in-memory (no external dep). Sufficiente per single-instance Railway.
// Per multi-instance (future scaling) sostituire con Redis o express-rate-limit
// con store esterno. Per ora siamo su 1 worker → in-memory OK.
//
// Algoritmo: sliding window approssimato. Per ogni key (IP|email) tiene un array di
// timestamp dei tentativi nel window; quando arrivano nuove richieste pulisce i
// timestamp scaduti e conta. Se count >= max → 429.
//
// LIMITI:
// - Lost on restart (OK: limite per finestra <= alcune ore)
// - No coordinazione multi-istanza (OK: single-instance Railway)
// - Memory bound: cleanup pigro su access; cap globale a 10k key per evitare leak

import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

interface Bucket { timestamps: number[]; }
const BUCKETS: Map<string, Bucket> = new Map();
const MAX_KEYS = 10_000;

function _cleanup(bucket: Bucket, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  bucket.timestamps = bucket.timestamps.filter(t => t > cutoff);
}

function _capBuckets(): void {
  if (BUCKETS.size <= MAX_KEYS) return;
  // Drop 10% delle key più vecchie (più semplice di LRU stretto)
  const toRemove = Math.floor(MAX_KEYS * 0.1);
  let removed = 0;
  for (const k of BUCKETS.keys()) {
    BUCKETS.delete(k);
    if (++removed >= toRemove) break;
  }
}

export interface RateLimitOptions {
  windowMs: number;       // finestra in ms
  max: number;            // tentativi max per finestra
  keyFn?: (req: Request) => string;  // default: IP
  message?: string;
}

/**
 * Crea un middleware Express che rate-limita per key (default: IP).
 * Risponde 429 con Retry-After header se il limite è superato.
 * Non blocca su errori di registrazione (fail-open per disponibilità).
 */
export function rateLimit(opts: RateLimitOptions) {
  const { windowMs, max, keyFn, message } = opts;
  const msg = message ?? "Too many requests";

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
      const k = (keyFn ? keyFn(req) : (req.ip || req.socket?.remoteAddress || "unknown"));
      let bucket = BUCKETS.get(k);
      if (!bucket) {
        bucket = { timestamps: [] };
        BUCKETS.set(k, bucket);
        _capBuckets();
      }
      _cleanup(bucket, windowMs);
      if (bucket.timestamps.length >= max) {
        const oldest = bucket.timestamps[0];
        const retryAfterMs = Math.max(0, windowMs - (Date.now() - oldest));
        const retryAfterSec = Math.ceil(retryAfterMs / 1000);
        res.setHeader("Retry-After", String(retryAfterSec));
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", String(Math.ceil((oldest + windowMs) / 1000)));
        logger.warn({ key: k, count: bucket.timestamps.length, max, windowMs }, "rate-limit hit");
        res.status(429).json({ error: "too_many_attempts", message: msg, retryAfter: retryAfterSec });
        return;
      }
      bucket.timestamps.push(Date.now());
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.timestamps.length)));
      next();
    } catch {
      // Fail-open: in caso di errore interno del limiter NON blocchiamo la richiesta.
      next();
    }
  };
}

// Helper: combina IP + email dal body per per-account rate limit più stretto su login.
export function ipPlusEmailKey(req: Request): string {
  const ip = req.ip || req.socket?.remoteAddress || "?";
  const email = String((req.body as any)?.email || "").toLowerCase().trim() || "_";
  return `${ip}|${email}`;
}
