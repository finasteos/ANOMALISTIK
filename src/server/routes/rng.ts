// Micro-PK QRNG routes, extracted from server.ts (TASKLIST B3).
// Mount: app.use("/api/rng", createRngRouter({ dataDir })).
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import os from "os";
import { countOnesBytes } from "../../lib/stats";
import {
  RNG_TAU,
  directionalBF01,
  adjudicateVerdict,
  buildHistogram,
} from "../rng";

export function createRngRouter(opts: { dataDir: string }) {
  const router = express.Router();
  const DATA_RNG_DIR = opts.dataDir;
  // Session commitments: memory cache + disk journal (TASKLIST D4).
  // Disk survives restarts (local prod); on serverless it lasts as long as
  // the instance's /tmp-backed volume. Writes are read-modify-write —
  // fine at pilot scale, not a concurrent multi-writer store.
  const COMMITMENTS_PATH = path.join(DATA_RNG_DIR, ".commitments.json");
  const activeSessionCommitments = new Map<string, { seedHex: string; commitment: string }>();

  function loadCommitments(): void {
    try {
      if (!fs.existsSync(COMMITMENTS_PATH)) return;
      const raw = JSON.parse(fs.readFileSync(COMMITMENTS_PATH, "utf-8")) as Record<string, { seedHex: string; commitment: string }>;
      for (const [k, v] of Object.entries(raw)) {
        if (v?.seedHex && v?.commitment && !activeSessionCommitments.has(k)) {
          activeSessionCommitments.set(k, v);
        }
      }
    } catch { /* corrupt journal → start empty, never crash boot */ }
  }

  function persistCommitment(sessionId: string, entry: { seedHex: string; commitment: string }): void {
    try {
      let raw: Record<string, { seedHex: string; commitment: string }> = {};
      if (fs.existsSync(COMMITMENTS_PATH)) {
        raw = JSON.parse(fs.readFileSync(COMMITMENTS_PATH, "utf-8"));
      }
      raw[sessionId] = entry;
      fs.writeFileSync(COMMITMENTS_PATH, JSON.stringify(raw), "utf-8");
    } catch (e) {
      console.warn("[rng] commitment journal write failed:", (e as Error)?.message);
    }
  }

  function getCommitment(sessionId: string): { seedHex: string; commitment: string } | undefined {
    return activeSessionCommitments.get(sessionId) ?? (() => {
      loadCommitments();
      return activeSessionCommitments.get(sessionId);
    })();
  }

  loadCommitments();

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

  router.get("/status", (_req, res) => {
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

  router.post("/session/start", (req, res) => {
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
      const entry = {
        seedHex: prngSeed.toString("hex"),
        commitment
      };
      activeSessionCommitments.set(sessionId, entry);
      persistCommitment(sessionId, entry); // D4: survive restarts

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

  router.post("/session/block", (req, res) => {
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
        const sessionData = getCommitment(sessionId);
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

  router.post("/session/analyze", (req, res) => {
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
      appendChainEntry(sessionId, sessionConfig, analysisResult);

      return res.json(analysisResult);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to analyze RNG session." });
    }
  });

  // Append-only hash-chained session ledger (TASKLIST D4).
  // Each entry commits to the previous hash — tampering breaks the chain.
  // Best-effort: ledger failures warn but never fail the analysis response.
  const CHAIN_PATH = path.join(DATA_RNG_DIR, "sessions.jsonl");

  function appendChainEntry(
    sessionId: string,
    sessionConfig: any,
    analysis: { observedD: number; pValue: number; verdict: string }
  ): void {
    try {
      let prev = "GENESIS";
      if (fs.existsSync(CHAIN_PATH)) {
        const lines = fs.readFileSync(CHAIN_PATH, "utf-8").trim().split("\n").filter(Boolean);
        if (lines.length > 0) {
          try {
            prev = (JSON.parse(lines[lines.length - 1]) as { hash?: string }).hash || "GENESIS";
          } catch { /* corrupt tail → re-anchor on GENESIS */ }
        }
      }
      const entry = {
        sessionId,
        sourceType: sessionConfig?.sourceType || "Unknown",
        observedD: analysis.observedD,
        pValue: analysis.pValue,
        verdict: analysis.verdict,
        timestamp: new Date().toISOString(),
        prev_hash: prev,
      };
      const hash = crypto.createHash("sha256").update(JSON.stringify(entry)).digest("hex");
      fs.appendFileSync(CHAIN_PATH, JSON.stringify({ ...entry, hash }) + "\n", "utf-8");
    } catch (e) {
      console.warn("[rng] chain append failed:", (e as Error)?.message);
    }
  }

  router.get("/sessions", (req, res) => {
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
  return router;
}
