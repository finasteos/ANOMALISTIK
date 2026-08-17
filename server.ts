import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_SYNCED_DIR = path.join(process.cwd(), "data", "synced");
const DATA_DOWNLOADS_DIR = path.join(process.cwd(), "data", "downloads");

app.use(express.json({ limit: "10mb" }));

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

// ── Helper: parse CSV text into array of row objects ─────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] || "").trim().replace(/^"|"$/g, ""); });
    return row;
  });
}

// ── Helper: safely parse float ────────────────────────────────────────────
const pf = (v: string | undefined) => {
  const n = parseFloat(v || "");
  return isNaN(n) ? null : n;
};

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
    if (rows.length === 0) return res.status(204).json({ error: "Empty dataset" });

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
  const csvPath  = latestFile(DATA_SYNCED_DIR,     /geospace.*\.csv$/);
  const manifest = latestFile(DATA_SYNCED_DIR,     /manifest.*\.json$/);
  const dscovr   = latestFile(path.join(DATA_DOWNLOADS_DIR, "dscovr"),       /\.parquet$/);
  const eida     = latestFile(path.join(DATA_DOWNLOADS_DIR, "eida"),         /\.parquet$/);
  const imag     = latestFile(path.join(DATA_DOWNLOADS_DIR, "intermagnet"),  /\.parquet$/);

  const age = (p: string | null) => {
    if (!p) return null;
    const ms = Date.now() - fs.statSync(p).mtimeMs;
    return Math.round(ms / 60000); // minutes ago
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
});



// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Route: Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Route: Search Grounded Research (using gemini-3.5-flash with googleSearch)
app.post("/api/ai/search-grounded", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are the AI Research Assistant for ANOMALISTICS (Integrated Laboratory & Universal Entropy Engine).
You provide scientifically rigorous, data-driven answers grounded in up-to-date web literature, research papers, and astronomical/geophysical data.
You maintain strict scientific neutrality, emphasizing the core principles: "Structure ≠ Message" and "Layer 1 Negative Control Engine".
When asked about crop circles, undeciphered scripts, FRBs, space weather, or geoglyphs, cross-reference real scientific facts.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No response generated.";
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      answer: text,
      groundingChunks: groundingChunks.map((chunk: any) => ({
        web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined,
      })),
      queryTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/ai/search-grounded:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute Search Grounded query.",
    });
  }
});

// API Route: High Thinking Adjudication Engine (using gemini-3.1-pro-preview with ThinkingLevel.HIGH)
app.post("/api/ai/high-thinking", async (req, res) => {
  try {
    const { prompt, domainContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are the Deep Reasoner & Adjudication Engine for ANOMALISTICS (Integrated Laboratory & Universal Entropy Engine).
Your task is to perform deep, multi-dimensional reasoning on complex anomalies across Epigraphy, Geophysics, Heliophysics, Biophysics, and Signals.

Rule Book:
1. "Structure ≠ Message": Mathematical structure, periodicity, or low entropy is evidence of structural coupling, never direct proof of intent or alien origin.
2. "Layer 1 Negative Control": Test every signal against shuffle nulls, known hoaxes, and natural analogs.
3. Express findings in z-scores, Shannon entropy H(X), conditional entropy H(Y|X), and clear verdicts (SEQUENCE_STRUCTURE, STRUCTURE_SIGNAL, DIP_STRUCTURE, CLAIM_FAILS_NULL, UNDERDETERMINED).
4. Provide step-by-step hypothesis adjudication. Context provided: ${domainContext || 'General Lab Context'}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text || "No adjudication generated.";

    return res.json({
      answer: text,
      thinkingLevel: "HIGH",
      modelUsed: "gemini-3.1-pro-preview",
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

  const cleanSeq = sequence.trim();
  const len = cleanSeq.length;
  if (len < 10) {
    return res.status(400).json({ error: "Sequence must be at least 10 characters long" });
  }

  // 1. Calculate character frequencies & Shannon Entropy H(X)
  const freq: Record<string, number> = {};
  for (const char of cleanSeq) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let hX = 0;
  let sumICNumerator = 0;
  for (const char in freq) {
    const count = freq[char];
    const p = count / len;
    hX -= p * Math.log2(p);
    sumICNumerator += count * (count - 1);
  }

  // 2. Index of Coincidence (IC)
  const ic = len > 1 ? sumICNumerator / (len * (len - 1)) : 0;

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
    // Fisher-Yates shuffle
    const shuf = [...charsArr];
    for (let i = shuf.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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

startServer();
