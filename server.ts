import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

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
