// AI routes (OpenRouter), extracted from server.ts (TASKLIST B3).
// Mount: app.use("/api/ai", createAiRouter()).
import express from "express";

export function createAiRouter() {
  const router = express.Router();

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

  // API Route: Search Grounded Research (using OpenRouter minimax/minimax-m3:free)
  router.post("/search-grounded", async (req, res) => {
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
  router.post("/high-thinking", async (req, res) => {
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

  return router;
}
