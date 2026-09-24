// Entropy adjudication route, extracted from server.ts (TASKLIST B3).
// Mount: app.use("/api/adjudicate", createAdjudicateRouter()).
import express from "express";
import crypto from "crypto";
import { shannonEntropy, indexOfCoincidence } from "../../lib/stats";

export function createAdjudicateRouter() {
  const router = express.Router();

  // API Route: Live Entropy & Z-Score Adjudicator (Server-side mathematical simulation)
  router.post("/", (req, res) => {
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

  return router;
}
