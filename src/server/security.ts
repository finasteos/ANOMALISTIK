// Security middleware (TASKLIST B3/B6) — zero-dep helmet-lite + rate limiter.
// Extracted from server.ts; pure Express middleware, no app singleton here.
import type { Request, Response, NextFunction } from "express";

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.VERCEL === "1") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

// In-memory sliding-window limiter. Resets on restart (serverless-safe default).
const rateBuckets = new Map<string, number[]>();

export function rateLimit(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || req.socket?.remoteAddress || "?"}:${req.path}`;
    const now = Date.now();
    const hits = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: "Rate limit exceeded. Slow down." });
    }
    hits.push(now);
    if (rateBuckets.size > 5000) rateBuckets.clear();
    rateBuckets.set(key, hits);
    next();
  };
}

/** Test hook: reset buckets (unit tests). */
export function __resetRateBuckets() {
  rateBuckets.clear();
}
