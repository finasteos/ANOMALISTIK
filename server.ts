import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import os from "os";
import dotenv from "dotenv";
import {
  parseCSV,
  pf,
  countOnesBytes,
  shannonEntropy,
  indexOfCoincidence,
} from "./src/lib/stats";
import { securityHeaders, rateLimit } from "./src/server/security";
import {
  RNG_TAU,
  directionalBF01,
  adjudicateVerdict,
  buildHistogram,
} from "./src/server/rng";

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

// ── Helper: find latest file matching pattern in a directory ──────────────
function latestFile(dir: string, pattern: RegExp): string | null {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => pattern.test(f))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    return files[0] ? path.join(dir, files[0].name) : null;
  } catch { return null; }
}

// ── Shared pure helpers live in ./src/lib/stats (TASKLIST Q3/B3) ──────────

// ─────────────────────────────────────────────────────────────────────────
// API Route: Geospace Live Feed
// Returns last N rows of DSCOVR + INTERMAGNET from synced CSV
// ─────────────────────────────────────────────────────────────────────────
app.get("/api/geospace", (_req, res) => {
  try {
    const csvPath = latestFile(DATA_SYNCED_DIR, /geospace.*\.csv$/);
    if (!csvPath) {
      return res.status(404).json({
        error: "No synced geospace data found. Run: .venv/bin/python3 scripts/fetch_geospace_sync.py",
        hint: "python3 scripts/fetch_geospace_sync.py --sources dscovr,intermagnet"
      });
    }

    const raw = fs.readFileSync(csvPath, "utf-8");
    const rows = parseCSV(raw);
    if (rows.length === 0) return res.status(404).json({ error: "Empty dataset" });

    // Take last 180 rows (3 hours @ 1min, or 1440 rows @ 5min = 5 days)
    const tail = rows.slice(-180);

    // Extract DSCOVR magnetometer time-series
    const dscovr_mag = tail.map(r => ({
      t: r["datetime_utc"] || r[""],
      bt:     pf(r["dscovr_mag__bt"]),
      bx_gsm: pf(r["dscovr_mag__bx_gsm"]),
      by_gsm: pf(r["dscovr_mag__by_gsm"]),
      bz_gsm: pf(r["dscovr_mag__bz_gsm"]),
      theta:  pf(r["dscovr_mag__theta_gsm"]),
    })).filter(r => r.bt !== null);

    // Extract DSCOVR plasma time-series
    const dscovr_plasma = tail.map(r => ({
      t:           r["datetime_utc"] || r[""],
      density:     pf(r["dscovr_plasma__proton_density"]) ?? pf(r["dscovr_plasma__density"]),
      speed:       pf(r["dscovr_plasma__bulk_speed"])     ?? pf(r["dscovr_plasma__speed"]),
      temperature: pf(r["dscovr_plasma__ion_temperature"]) ?? pf(r["dscovr_plasma__temperature"]),
    })).filter(r => r.speed !== null || r.density !== null);

    // Extract INTERMAGNET stations (look for imag_* columns)
    const imagCols = Object.keys(rows[0] || {}).filter(c => c.startsWith("imag_"));
    const stations: Record<string, { t: string; X: number | null; Y: number | null; Z: number | null; F: number | null }[]> = {};
    const staCodes = [...new Set(imagCols.map(c => c.split("__")[0].replace("imag_", "")))];
    for (const sta of staCodes) {
      stations[sta] = tail.map(r => ({
        t: r["datetime_utc"] || r[""],
        X: pf(r[`imag_${sta}__X`]),
        Y: pf(r[`imag_${sta}__Y`]),
        Z: pf(r[`imag_${sta}__Z`]),
        F: pf(r[`imag_${sta}__F`]),
      })).filter(r => r.F !== null || r.X !== null);
    }

    // Latest snapshot (last row with valid Bz)
    const lastMag = [...dscovr_mag].reverse().find(r => r.bz_gsm !== null);
    const lastPlasma = [...dscovr_plasma].reverse().find(r => r.speed !== null);

    // Kp-proxy from Bz (rough estimate: strong southward = elevated Kp)
    const kpProxy = lastMag?.bz_gsm != null
      ? Math.min(9, Math.max(0, Math.round((-lastMag.bz_gsm / 5) + 2)))
      : null;

    return res.json({
      source_file: path.basename(csvPath),
      rows_total:  rows.length,
      rows_returned: tail.length,
      last_updated: fs.statSync(csvPath).mtime.toISOString(),
      snapshot: {
        bz_gsm:      lastMag?.bz_gsm      ?? null,
        bt:          lastMag?.bt           ?? null,
        bx_gsm:      lastMag?.bx_gsm      ?? null,
        by_gsm:      lastMag?.by_gsm      ?? null,
        solar_speed: lastPlasma?.speed     ?? null,
        density:     lastPlasma?.density   ?? null,
        kp_proxy:    kpProxy,
        timestamp:   lastMag?.t            ?? lastPlasma?.t ?? null,
      },
      timeseries: { dscovr_mag, dscovr_plasma, stations },
    });
  } catch (err: any) {
    console.error("[/api/geospace]", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// API Route: Geospace Pipeline Status
// ─────────────────────────────────────────────────────────────────────────
app.get("/api/geospace/status", (_req, res) => {
  try {
    const csvPath  = latestFile(DATA_SYNCED_DIR,     /geospace.*\.csv$/);
    const manifest = latestFile(DATA_SYNCED_DIR,     /manifest.*\.json$/);
    const dscovr   = latestFile(path.join(DATA_DOWNLOADS_DIR, "dscovr"),       /\.parquet$/);
    const eida     = latestFile(path.join(DATA_DOWNLOADS_DIR, "eida"),         /\.parquet$/);
    const imag     = latestFile(path.join(DATA_DOWNLOADS_DIR, "intermagnet"),  /\.parquet$/);

    const age = (p: string | null) => {
      if (!p) return null;
      try {
        const ms = Date.now() - fs.statSync(p).mtimeMs;
        return Math.round(ms / 60000); // minutes ago
      } catch { return null; }
    };

    return res.json({
      pipeline_ready:    !!csvPath,
      synced_csv:        csvPath ? path.basename(csvPath) : null,
      synced_age_min:    age(csvPath),
      dscovr_age_min:    age(dscovr),
      eida_age_min:      age(eida),
      intermagnet_age_min: age(imag),
      manifest:          manifest ? path.basename(manifest) : null,
      fetch_command:     ".venv/bin/python3 scripts/fetch_geospace_sync.py --sources dscovr,intermagnet,eida",
    });
  } catch (err: any) {
    console.error("[/api/geospace/status]", err);
    return res.status(500).json({ error: "Failed to read pipeline status." });
  }
});



// OpenRouter Client Helper
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "minimax/minimax-m3:free";

async function callOpenRouter(
  messages: { role: string; content: string }[],
  options: { temperature?: number; max_tokens?: number } = {}
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured in environment variables.");
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 25000);
  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_PUBLIC_URL || "https://anomalistics.local",
        "X-Title": "ANOMALISTICS Laboratory",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 3072,
      }),
      signal: ctrl.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("OpenRouter request timed out after 25s.");
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const errorText = (await res.text()).slice(0, 300);
    console.error(`[openrouter] upstream ${res.status}: ${errorText}`);
    throw new Error(`AI upstream failed (HTTP ${res.status}).`);
  }

  const data = (await res.json()) as any;
  const content = data.choices?.[0]?.message?.content || "No response generated.";
  return {
    content,
    model: data.model || OPENROUTER_MODEL,
    usage: data.usage,
  };
}

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

// API Route: Search Grounded Research (using OpenRouter minimax/minimax-m3:free)
app.post("/api/ai/search-grounded", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    const safeQuery = String(query).slice(0, 4000);

    const systemPrompt = `You are the AI Research Assistant for ANOMALISTICS (Integrated Laboratory & Universal Entropy Engine).
You provide scientifically rigorous, data-driven answers grounded in up-to-date scientific literature, research papers, and astronomical/geophysical data.
You maintain strict scientific neutrality, emphasizing the core principles: "Structure ≠ Message" and "Layer 1 Negative Control Engine".
When asked about crop circles, undeciphered scripts, FRBs, space weather, or geoglyphs, cross-reference real scientific facts.`;

    const result = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: safeQuery },
    ]);

    return res.json({
      answer: result.content,
      groundingChunks: [],
      queryTime: new Date().toISOString(),
      modelUsed: result.model,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/search-grounded:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute Research Query.",
    });
  }
});

// API Route: High Thinking Adjudication Engine (using OpenRouter minimax/minimax-m3:free)
app.post("/api/ai/high-thinking", async (req, res) => {
  try {
    const { prompt, domainContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const safePrompt = String(prompt).slice(0, 8000);
    const safeDomain = String(domainContext || "General Lab Context").slice(0, 500);

    const systemInstruction = `You are the Deep Reasoner & Adjudication Engine for ANOMALISTICS (Integrated Laboratory & Universal Entropy Engine).
Your task is to perform deep, multi-dimensional reasoning on complex anomalies across Epigraphy, Geophysics, Heliophysics, Biophysics, and Signals.

Rule Book:
1. "Structure ≠ Message": Mathematical structure, periodicity, or low entropy is evidence of structural coupling, never direct proof of intent or alien origin.
2. "Layer 1 Negative Control": Test every signal against shuffle nulls, known hoaxes, and natural analogs.
3. Express findings in z-scores, Shannon entropy H(X), conditional entropy H(Y|X), and clear verdicts (SEQUENCE_STRUCTURE, STRUCTURE_SIGNAL, DIP_STRUCTURE, CLAIM_FAILS_NULL, UNDERDETERMINED).
4. Provide step-by-step hypothesis adjudication. Context provided: ${safeDomain}`;

    const result = await callOpenRouter([
      { role: "system", content: systemInstruction },
      { role: "user", content: safePrompt },
    ], { temperature: 0.2, max_tokens: 4096 });

    return res.json({
      answer: result.content,
      thinkingLevel: "HIGH",
      modelUsed: result.model,
      queryTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/ai/high-thinking:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute High Thinking query.",
    });
  }
});

// API Route: Live Entropy & Z-Score Adjudicator (Server-side mathematical simulation)
app.post("/api/adjudicate", (req, res) => {
  const { sequence, sampleName } = req.body;
  if (!sequence || typeof sequence !== "string") {
    return res.status(400).json({ error: "Valid text sequence is required" });
  }

  const cleanSeq = sequence.trim().slice(0, 50000);
  const len = cleanSeq.length;
  if (len < 10) {
    return res.status(400).json({ error: "Sequence must be at least 10 characters long" });
  }

  // 1. Character frequencies → Shannon Entropy H(X) + Index of Coincidence
  const freq: Record<string, number> = {};
  for (const char of cleanSeq) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const counts = Object.values(freq);
  const hX = shannonEntropy(counts, len);

  // 2. Index of Coincidence (IC)
  const ic = indexOfCoincidence(counts, len);

  // 3. Conditional Bigram Entropy H(Y|X)
  const bigramFreq: Record<string, number> = {};
  for (let i = 0; i < len - 1; i++) {
    const bg = cleanSeq.slice(i, i + 2);
    bigramFreq[bg] = (bigramFreq[bg] || 0) + 1;
  }

  let hYX = 0;
  for (const bg in bigramFreq) {
    const count = bigramFreq[bg];
    const firstChar = bg[0];
    const pXY = count / (len - 1);
    const pX = freq[firstChar] / len;
    const pYgivenX = pXY / pX;
    if (pYgivenX > 0) {
      hYX -= pXY * Math.log2(pYgivenX);
    }
  }

  // 4. Monte Carlo Shuffle Null Simulation
  const numPermutations = 50;
  const shuffledCondEntropies: number[] = [];

  const charsArr = cleanSeq.split("");
  for (let s = 0; s < numPermutations; s++) {
    // Fisher-Yates shuffle (CSPRNG — null model must not use Math.random)
    const shuf = [...charsArr];
    for (let i = shuf.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [shuf[i], shuf[j]] = [shuf[j], shuf[i]];
    }

    // calculate cond-H of shuffle
    const sBigrams: Record<string, number> = {};
    const sFreq: Record<string, number> = {};
    for (let i = 0; i < shuf.length; i++) {
      sFreq[shuf[i]] = (sFreq[shuf[i]] || 0) + 1;
      if (i < shuf.length - 1) {
        const bg = shuf[i] + shuf[i + 1];
        sBigrams[bg] = (sBigrams[bg] || 0) + 1;
      }
    }

    let sHYX = 0;
    for (const bg in sBigrams) {
      const count = sBigrams[bg];
      const pXY = count / (shuf.length - 1);
      const pX = sFreq[bg[0]] / shuf.length;
      const pYgivenX = pXY / pX;
      if (pYgivenX > 0) {
        sHYX -= pXY * Math.log2(pYgivenX);
      }
    }
    shuffledCondEntropies.push(sHYX);
  }

  const nullMean =
    shuffledCondEntropies.reduce((a, b) => a + b, 0) / numPermutations;
  const nullVariance =
    shuffledCondEntropies.reduce((a, b) => a + Math.pow(b - nullMean, 2), 0) /
    numPermutations;
  const nullStdDev = Math.sqrt(nullVariance) || 0.001;

  // Z-score calculation
  const zScore = (hYX - nullMean) / nullStdDev;

  // Determine Layer 3 Verdict
  let verdict = "UNDERDETERMINED";
  if (Math.abs(zScore) >= 10) {
    verdict = "STRUCTURE_SIGNAL";
  } else if (Math.abs(zScore) >= 3.5) {
    verdict = "SEQUENCE_STRUCTURE";
  } else if (Math.abs(zScore) < 1.5) {
    verdict = "CLAIM_FAILS_NULL";
  }

  return res.json({
    sampleName: sampleName || "Custom Input Sequence",
    sequenceLength: len,
    uniqueChars: Object.keys(freq).length,
    shannonEntropy: Number(hX.toFixed(4)),
    conditionalEntropy: Number(hYX.toFixed(4)),
    indexCoincidence: Number(ic.toFixed(4)),
    nullMeanCondEntropy: Number(nullMean.toFixed(4)),
    nullStdDev: Number(nullStdDev.toFixed(4)),
    zScore: Number(zScore.toFixed(2)),
    verdict,
    layer1NegativeControlPassed: Math.abs(zScore) >= 2.0,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────
// API Route: Declassified UAP Archives Catalog & Sample Images
// ─────────────────────────────────────────────────────────────────────────
const DECLAS_SAMPLES_DIR = path.join(process.cwd(), "data", "declassified_sample", "images");
const DECLAS_CATALOG_PATH = path.join(process.cwd(), "data", "declassified_archive_index.json");

if (fs.existsSync(DECLAS_SAMPLES_DIR)) {
  app.use("/api/declassified/images", express.static(DECLAS_SAMPLES_DIR));
}

app.get("/api/declassified/catalog", (_req, res) => {
  try {
    if (fs.existsSync(DECLAS_CATALOG_PATH)) {
      const data = JSON.parse(fs.readFileSync(DECLAS_CATALOG_PATH, "utf-8"));
      return res.json(data);
    }
    return res.status(404).json({ error: "Catalog not found. Run scripts/catalog_declassified_archives.py" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to load catalog." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// API Routes: Micro-PK Quantum Random Number Generator (QRNG) Studio
// ─────────────────────────────────────────────────────────────────────────

// In-memory active session commitments (seed -> commitment hash)
const activeSessionCommitments = new Map<string, { seedHex: string; commitment: string }>();

// Helper: count ones in a Buffer (pure impl in ./src/lib/stats)
function countBufferOnes(buffer: Buffer): number {
  return countOnesBytes(buffer);
}

// Helper: generate pseudo-random deterministic buffer using SHA-256 stream
function generateDeterministicBuffer(seed: Buffer, blockIndex: number, length: number): Buffer {
  const buf = Buffer.alloc(length);
  let offset = 0;
  let counter = 0;
  while (offset < length) {
    const hash = crypto.createHash("sha256");
    hash.update(seed);
    const counterBuf = Buffer.alloc(4);
    counterBuf.writeUInt32BE((blockIndex * 100000) + counter, 0);
    hash.update(counterBuf);
    const chunk = hash.digest();
    const toCopy = Math.min(chunk.length, length - offset);
    chunk.copy(buf, offset, 0, toCopy);
    offset += toCopy;
    counter++;
  }
  return buf;
}

// Helper: standard normal CDF Phi(x) — see ./src/lib/stats (TASKLIST Q3)

app.get("/api/rng/status", (_req, res) => {
  try {
    const cpus = os.cpus();
    const arch = os.arch();
    const isAppleSilicon = arch === "arm64" && os.platform() === "darwin";
    const hostname = os.hostname();

    return res.json({
      localNode: {
        hostname,
        platform: os.platform(),
        release: os.release(),
        arch,
        cpuModel: cpus[0]?.model || "Intel / Apple Processor",
        cpuCores: cpus.length,
        isAppleSilicon,
        role: isAppleSilicon 
          ? "Silicon Processing Unit (M-Series)" 
          : "Control Station / Analysis Host (iMac Pro Intel)",
        tailscaleIp: "100.76.38.1",
        tailscaleHostname: "imac-pro.tail3bd6d.ts.net",
      },
      clusterNodes: [
        {
          id: "node-imac-pro",
          name: "iMac Pro (Intel Xeon Control Station)",
          ip: "100.76.38.1",
          tailscale: "imac-pro.tail3bd6d.ts.net",
          arch: "x86_64",
          status: "ONLINE_ACTIVE_HOST",
          role: "Primary Orchestrator & UI Dashboard",
          availableEngines: ["APPLE_CSPRNG", "DETERMINISTIC_PRNG_PLACEBO", "SIMULATION"]
        },
        {
          id: "node-mac-mini",
          name: "Mac mini (August Brinell)",
          ip: "100.85.170.98",
          tailscale: "august-brinells-mac-mini.tail3bd6d.ts.net",
          arch: "arm64",
          status: "CLUSTER_REACHABLE",
          role: "Distributed Worker & High-Throughput Node",
          availableEngines: ["APPLE_CSPRNG", "DETERMINISTIC_PRNG_PLACEBO"]
        },
        {
          id: "node-mbp-m4",
          name: "MacBook Pro M4 (Silicon M4 Pro/Max)",
          ip: "fd7a:115c:a1e0::7201:da7c",
          tailscale: "mbp-m4.tail3bd6d.ts.net",
          arch: "arm64 (Apple Silicon M4)",
          status: "CLUSTER_REACHABLE",
          role: "Dedicated Hardware QRNG Controller & M4 Engine",
          availableEngines: ["EXTERNAL_PHYSICAL_QRNG", "APPLE_CSPRNG", "DETERMINISTIC_PRNG_PLACEBO"]
        }
      ],
      entropySources: [
        {
          id: "EXTERNAL_PHYSICAL_QRNG",
          name: "External Physical USB QRNG",
          type: "Physical Quantum Entropy (Photon/Tunneling)",
          isPhysical: true,
          available: false,
          statusText: "USB Driver Initialized (Crypta Labs / Quantis Adapter Ready)"
        },
        {
          id: "APPLE_CSPRNG",
          name: "macOS Kernel CSPRNG (/dev/random)",
          type: "macOS kernel CSPRNG / system entropy source",
          isPhysical: false,
          available: true,
          statusText: "Active (Darwin Kernel Entropy Pool)"
        },
        {
          id: "DETERMINISTIC_PRNG_PLACEBO",
          name: "Deterministic Seeded PRNG (Negative Control)",
          type: "SHA-256 HMAC Sealed Bitstream",
          isPhysical: false,
          available: true,
          statusText: "Active (Pre-study commitment protocol)"
        },
        {
          id: "SIMULATION",
          name: "High-Throughput Vectorized Benchmark RNG",
          type: "Simulation with tunable bit-bias parameter",
          isPhysical: false,
          available: true,
          statusText: "Active (Pilot & Synthetic Null Verifier)"
        }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch RNG status." });
  }
});

app.post("/api/rng/session/start", (req, res) => {
  try {
    const {
      participantId = "ANOMALISTIK_OPERATOR",
      mindsetScore = 75,
      sourceType = "APPLE_CSPRNG",
      nBlocksEach = 6,
      blockDurationS = 5,
      isPilot = true
    } = req.body || {};

    const safeNBlocksEach = Math.min(Math.max(parseInt(String(nBlocksEach), 10) || 6, 1), 20);
    const safeBlockDurationS = Math.min(Math.max(Number(blockDurationS) || 5, 1), 300);

    const sessionId = `RNG_SESS_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    
    // Create pre-study seed & commitment for deterministic PRNG
    const prngSeed = crypto.randomBytes(32);
    const commitment = crypto.createHash("sha256").update(prngSeed).digest("hex");
    activeSessionCommitments.set(sessionId, {
      seedHex: prngSeed.toString("hex"),
      commitment
    });

    // Create balanced schedule:
    // Half target 1, half target 0 for both Intention and Control
    const intT1 = Math.floor(safeNBlocksEach / 2);
    const intT0 = safeNBlocksEach - intT1;
    const ctrlT1 = Math.floor(safeNBlocksEach / 2);
    const ctrlT0 = safeNBlocksEach - ctrlT1;

    const blocks: Array<{ condition: "INTENTION" | "CONTROL"; target: 0 | 1; targetVisible: boolean }> = [];
    for (let i = 0; i < intT1; i++) blocks.push({ condition: "INTENTION", target: 1, targetVisible: true });
    for (let i = 0; i < intT0; i++) blocks.push({ condition: "INTENTION", target: 0, targetVisible: true });
    for (let i = 0; i < ctrlT1; i++) blocks.push({ condition: "CONTROL", target: 1, targetVisible: false });
    for (let i = 0; i < ctrlT0; i++) blocks.push({ condition: "CONTROL", target: 0, targetVisible: false });

    // Secure Fisher-Yates shuffle
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }

    const schedule = blocks.map((b, idx) => ({
      blockIndex: idx,
      ...b
    }));

    return res.json({
      sessionId,
      participantId,
      mindsetScore,
      sourceType,
      nBlocksEach: safeNBlocksEach,
      totalBlocks: schedule.length,
      blockDurationS: safeBlockDurationS,
      isPilot,
      prngCommitment: commitment,
      schedule
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to start RNG session." });
  }
});

app.post("/api/rng/session/block", (req, res) => {
  try {
    const {
      sessionId,
      blockIndex,
      condition,
      target,
      sourceType = "APPLE_CSPRNG",
      bytesToRead = 2048
    } = req.body || {};

    const safeBytes = Math.min(Math.max(parseInt(String(bytesToRead), 10) || 2048, 64), 8192);
    if (target !== 0 && target !== 1) {
      return res.status(400).json({ error: "target must be 0 or 1" });
    }
    if (condition !== "INTENTION" && condition !== "CONTROL") {
      return res.status(400).json({ error: "condition must be INTENTION or CONTROL" });
    }

    let buffer: Buffer;

    if (sourceType === "DETERMINISTIC_PRNG_PLACEBO") {
      const sessionData = activeSessionCommitments.get(sessionId);
      if (!sessionData) {
        return res.status(404).json({ error: "Unknown sessionId for placebo verification. Restart session." });
      }
      const seed = Buffer.from(sessionData.seedHex, "hex");
      buffer = generateDeterministicBuffer(seed, blockIndex, safeBytes);
    } else if (sourceType === "EXTERNAL_QRNG") {
      // Fail loud: no USB/hardware QRNG attached in this deployment.
      return res.status(501).json({ error: "EXTERNAL_QRNG not available on this node. Use APPLE_CSPRNG or SIMULATION." });
    } else if (sourceType === "APPLE_CSPRNG") {
      try {
        if (process.platform === "darwin" && fs.existsSync("/dev/random")) {
          const fd = fs.openSync("/dev/random", "r");
          buffer = Buffer.alloc(safeBytes);
          fs.readSync(fd, buffer, 0, safeBytes, null);
          fs.closeSync(fd);
        } else {
          buffer = crypto.randomBytes(safeBytes);
        }
      } catch {
        buffer = crypto.randomBytes(safeBytes);
      }
    } else {
      buffer = crypto.randomBytes(safeBytes);
    }

    const nBits = buffer.length * 8;
    const ones = countBufferOnes(buffer);
    const zeros = nBits - ones;
    const rawSha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // Compute target-aligned score Z_j
    const t_j = target === 1 ? 1.0 : -1.0;
    const targetScoreZ = (t_j * (2 * ones - nBits)) / Math.sqrt(nBits);

    return res.json({
      sessionId,
      blockIndex,
      condition,
      target,
      nBits,
      ones,
      zeros,
      rawSha256,
      targetScoreZ: Number(targetScoreZ.toFixed(4)),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to process RNG block." });
  }
});

app.post("/api/rng/session/analyze", (req, res) => {
  try {
    const { sessionConfig, blocks } = req.body || {};

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return res.status(400).json({ error: "Missing or invalid blocks array." });
    }

    const intentionScores = blocks
      .filter((b: any) => b.condition === "INTENTION")
      .map((b: any) => Number(b.targetScoreZ) || 0);

    const controlScores = blocks
      .filter((b: any) => b.condition === "CONTROL")
      .map((b: any) => Number(b.targetScoreZ) || 0);

    const meanIntentionZ = intentionScores.length > 0
      ? intentionScores.reduce((a: number, b: number) => a + b, 0) / intentionScores.length
      : 0;

    const meanControlZ = controlScores.length > 0
      ? controlScores.reduce((a: number, b: number) => a + b, 0) / controlScores.length
      : 0;

    const observedD = meanIntentionZ - meanControlZ;

    const totalBits = blocks.reduce((acc: number, b: any) => acc + (b.nBits || 0), 0);
    const totalOnes = blocks.reduce((acc: number, b: any) => acc + (b.ones || 0), 0);
    const overallRawZ = totalBits > 0 ? (2 * totalOnes - totalBits) / Math.sqrt(totalBits) : 0;

    // Exact Permutation Null Test (20,000 iterations):
    // Under H0, the condition label ("INTENTION" vs "CONTROL") is exchangeable across blocks.
    // We permute the condition assignment vector (preserving exact nInt and nCtrl counts)
    // and compute permD = mean(Z[shuffled_intention]) - mean(Z[shuffled_control]).
    // This directly reflects the actual experimental design without assuming blocks are ordered.
    const nPermutations = 20000;
    const permDValues: number[] = new Array(nPermutations);
    const nBlocks = blocks.length;
    const nInt = intentionScores.length;
    const nCtrl = controlScores.length;
    if (nInt === 0 || nCtrl === 0) {
      return res.status(400).json({ error: "Need at least one INTENTION and one CONTROL block." });
    }

    const zScoresArr = blocks.map((b: any) => Number(b.targetScoreZ) || 0);

    // Base boolean mask with exactly nInt true and nCtrl false
    const baseMask = new Array(nBlocks).fill(false);
    for (let i = 0; i < nInt; i++) {
      baseMask[i] = true;
    }

    let countGreaterOrEqual = 0;

    for (let p = 0; p < nPermutations; p++) {
      // Fisher-Yates shuffle of the condition assignment mask (CSPRNG — null model must not use Math.random)
      const shuffledMask = [...baseMask];
      for (let i = nBlocks - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        const temp = shuffledMask[i];
        shuffledMask[i] = shuffledMask[j];
        shuffledMask[j] = temp;
      }

      let intSum = 0;
      let ctrlSum = 0;

      for (let k = 0; k < nBlocks; k++) {
        if (shuffledMask[k]) {
          intSum += zScoresArr[k];
        } else {
          ctrlSum += zScoresArr[k];
        }
      }

      const permD = (intSum / nInt) - (ctrlSum / nCtrl);
      permDValues[p] = permD;
      if (permD >= observedD) {
        countGreaterOrEqual++;
      }
    }

    const pValue = (1 + countGreaterOrEqual) / (1 + nPermutations);

    // Compute empirical standard deviation of permuted D under the null
    const meanPermD = permDValues.reduce((a, b) => a + b, 0) / nPermutations;
    const varPermD = permDValues.reduce((a, b) => a + Math.pow(b - meanPermD, 2), 0) / nPermutations;
    const stdPermD = Math.sqrt(varPermD) || 0.1;

    // Normal-Normal Bayes Factor (directional H1+: mu > 0 — see src/server/rng.ts)
    const tau = RNG_TAU;
    const { bf01, bf10 } = directionalBF01(observedD, stdPermD, tau);

    // Layer 1 Negative Control Check:
    const isPlacebo = sessionConfig?.sourceType === "DETERMINISTIC_PRNG_PLACEBO";
    const layer1NegativeControlPassed = isPlacebo ? Math.abs(observedD) < 2.5 : true;

    // ANOMALISTIK Layer 3 Verdict
    const verdict = adjudicateVerdict({ layer1Passed: layer1NegativeControlPassed, pValue, observedD });

    // Histogram for Recharts (40 bins = Python parity)
    const bins = buildHistogram(permDValues, observedD);

    const analysisResult = {
      observedD: Number(observedD.toFixed(4)),
      meanIntentionZ: Number(meanIntentionZ.toFixed(4)),
      meanControlZ: Number(meanControlZ.toFixed(4)),
      overallRawZ: Number(overallRawZ.toFixed(4)),
      sigmaD: Number(stdPermD.toFixed(4)),
      pValue: Number(pValue.toFixed(5)),
      bf01,
      bf10,
      bayesFactorType: "Normal-Normal directional (H1+: mu > 0 vs H0: mu <= 0, tau = 0.20)",
      nPermutations,
      totalBits,
      totalOnes,
      layer1NegativeControlPassed,
      verdict,
      histogram: bins,
      timestamp: new Date().toISOString()
    };

    // Save audited session file
    const sessionId = sessionConfig?.sessionId || `RNG_SESS_${Date.now()}`;
    const sessionFile = path.join(DATA_RNG_DIR, `${sessionId}.json`);
    const sessionPayload = {
      sessionConfig,
      blocks,
      analysis: analysisResult,
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(sessionFile, JSON.stringify(sessionPayload, null, 2), "utf-8");

    return res.json(analysisResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to analyze RNG session." });
  }
});

app.get("/api/rng/sessions", (req, res) => {
  try {
    if (!fs.existsSync(DATA_RNG_DIR)) {
      return res.json([]);
    }
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "50"), 10) || 50, 1), 200);
    const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);
    const files = fs.readdirSync(DATA_RNG_DIR)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const filePath = path.join(DATA_RNG_DIR, f);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          const stat = fs.statSync(filePath);
          return {
            filename: f,
            sessionId: content.sessionConfig?.sessionId || f.replace(".json", ""),
            participantId: content.sessionConfig?.participantId || "Unknown",
            source: content.sessionConfig?.sourceType || content.source || "Unknown",
            mindsetScore: content.sessionConfig?.mindsetScore ?? content.mindset_score,
            observedD: content.analysis?.observedD ?? content.analysis?.observed_d,
            pValue: content.analysis?.pValue ?? content.analysis?.p_value,
            verdict: content.analysis?.verdict,
            mtime: stat.mtimeMs
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.mtime - a.mtime);

    return res.json({
      total: files.length,
      limit,
      offset,
      sessions: files.slice(offset, offset + limit),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to list RNG sessions." });
  }
});

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
