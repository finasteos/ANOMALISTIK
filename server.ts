import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { securityHeaders, rateLimit } from "./src/server/security";
import { createRngRouter } from "./src/server/routes/rng";
import { createGeospaceRouter } from "./src/server/routes/geospace";
import { createAiRouter } from "./src/server/routes/ai";
import { createAdjudicateRouter } from "./src/server/routes/adjudicate";
import { createDeclassifiedRouter } from "./src/server/routes/declassified";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_SYNCED_DIR = path.join(process.cwd(), "data", "synced");
const DATA_DOWNLOADS_DIR = path.join(process.cwd(), "data", "downloads");
const DATA_RNG_DIR = path.join(process.cwd(), "data", "rng_sessions");

if (!fs.existsSync(DATA_RNG_DIR)) {
  fs.mkdirSync(DATA_RNG_DIR, { recursive: true });
}

app.use(express.json({ limit: "10mb" }));
app.disable("x-powered-by");

// ── Security (helmet-lite + rate limiter live in ./src/server/security — B3/B6)
app.use(securityHeaders);
app.use("/api/ai/", rateLimit(30, 60_000)); // 30/min per IP+route (OpenRouter quota)
app.use("/api/", rateLimit(300, 60_000)); // 300/min backstop for the rest

// Normalize request URL only on Vercel (serverless strips /api prefix).
// Skips static assets, Vite internals, health, and files with extensions.
app.use((req, _res, next) => {
  if (process.env.VERCEL === "1") {
    const url = req.url.split("?")[0];
    const isAsset = /\.[a-zA-Z0-9]+$/.test(url);
    if (
      !req.url.startsWith("/api") &&
      !req.url.startsWith("/@") &&
      !req.url.startsWith("/src") &&
      url !== "/health" &&
      !isAsset
    ) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
  }
  next();
});

// ── Route handlers live in ./src/server/routes/ (TASKLIST B3) ─────────────────
app.use("/api/geospace", createGeospaceRouter({ syncDir: DATA_SYNCED_DIR, downloadsDir: DATA_DOWNLOADS_DIR }));
app.use("/api/ai", createAiRouter());
app.use("/api/adjudicate", createAdjudicateRouter());
app.use(
  "/api/declassified",
  createDeclassifiedRouter({
    samplesDir: path.join(process.cwd(), "data", "declassified_sample", "images"),
    catalogPath: path.join(process.cwd(), "data", "declassified_archive_index.json"),
  })
);

// API Route: Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime_s: Math.round(process.uptime()),
    version: process.env.npm_package_version || "2.0.0",
    vercel: process.env.VERCEL === "1",
  });
});


// ─────────────────────────────────────────────────────────────────────────
// API Routes: Micro-PK Quantum Random Number Generator (QRNG) Studio
// Handlers live in ./src/server/routes/rng.ts (TASKLIST B3)
// ─────────────────────────────────────────────────────────────────────────
app.use("/api/rng", createRngRouter({ dataDir: DATA_RNG_DIR }));

// Unknown /api/* → JSON 404 (must precede SPA fallback — TASKLIST B6)
app.use("/api", (_req, res) => {
  return res.status(404).json({ error: "Unknown API route." });
});

// Global error handler: never leak stacks to clients in production
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[unhandled]", err);
  const msg = process.env.NODE_ENV === "production" ? "Internal error." : String(err?.message || err);
  return res.status(500).json({ error: msg });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ANOMALISTICS Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
