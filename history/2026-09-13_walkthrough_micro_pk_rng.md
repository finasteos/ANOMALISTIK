# Walkthrough & Progress Update: Micro-PK Quantum RNG Engine & Studio

**Date**: 2026-09-13  
**Project**: ANOMALISTIK (`finasteos/ANOMALISTIK`)  
**Host**: iMac Pro (Control Station) with remote Apple Silicon M4 / Tailscale worker awareness  

---

## What Was Built

### 1. Python Acquisition & Permutation Engine (`scripts/micro_pk_rng.py`)
- **`RandomSource` Abstraction**:
  - `AppleCSPRNG`: Kernel-level cryptographic entropy on macOS via `/dev/random` and system entropy pool.
  - `DeterministicPRNG`: SHA-256 stream cipher with pre-study secret seed commitment ($H(\text{seed})$), mathematically fixing bits before intentional trials.
  - `ExternalQRNG`: Direct driver adapter ready for physical USB devices (e.g. Crypta Labs Cicada/Firefly, ID Quantique Quantis).
  - `SimulationQRNG`: Vectorized generator with tunable bit-bias ($\delta$) for synthetic benchmarks.
- **Mathematical Bias Cancellation**:
  - Exact 50/50 counterbalancing of Target 1 ($\uparrow$) and Target 0 ($\downarrow$) in both intention and control blocks, guaranteeing that stationary hardware bias cancels out ($E[Z]_{\text{bias}} = 0$).
- **Statistical Adjudication**:
  - Target score: $Z_j = t_j \frac{2H_j - n_j}{\sqrt{n_j}}$
  - Within-subject difference: $D_i = \overline{Z}_{\text{intention}, i} - \overline{Z}_{\text{control}, i}$
  - 100,000-round exact permutation null test without assuming ideal Bernoulli behavior.
  - Savage-Dickey Bayes Factor estimate ($BF_{01}$).
  - Layer 1 Negative Control check & Layer 3 ANOMALISTIK Verdict mapping (`STRUCTURE_SIGNAL`, `CLAIM_FAILS_NULL`, `INSTRUMENT_SYSTEMATICS`, `UNDERDETERMINED`).
- **Cryptographic Audit Trail**:
  - Append-only JSONL logs in `data/rng_sessions/` recording raw bit counts, ones/zeros, monotonic nanosecond timestamps, machine architecture, and SHA-256 hashes for every individual block.

---

### 2. Express Backend Endpoints (`server.ts`)
- `GET /api/rng/status`: Reports node architecture (Intel iMac Pro control station vs remote Apple Silicon M4 nodes), Tailscale cluster IP addresses, and entropy source readiness.
- `POST /api/rng/session/start`: Initializes counterbalanced schedules and seals pre-study PRNG seed commitments.
- `POST /api/rng/session/block`: Generates/reads entropy chunks, computes block Z-scores, and calculates SHA-256 checksums.
- `POST /api/rng/session/analyze`: Executes fast 20,000-iteration Monte Carlo permutation tests, verifies negative controls, and returns histogram bins for Recharts.
- `GET /api/rng/sessions`: Lists and indexes historical session records.

---

### 3. Interactive React Studio (`src/components/QuantumRngSection.tsx`)
- **Experiment Runner Tab**:
  - Pre-session participant setup and subjective expectation rating slider (0–100%: *"Hur självklart känns det just nu att du kan få målutfallet att inträffa?"*).
  - Calibrated block presentation following the exact relaxation/focus guidance from the specification.
  - Pulsating focus pacer ring (pure visual cue, strictly decoupled from live outcomes to prevent optional stopping and feedback learning).
- **Adjudication & Permutation Tab**:
  - Interactive Recharts bar chart showing the empirical permutation null distribution with the observed $D_i$ reference line.
  - Metric cards for $D_i$, empirical permutation p-value, $BF_{01}$, and total bit counts.
  - Layer 1 Negative Control status badge & ANOMALISTIK Layer 3 Verdict badge.
  - Detailed block-by-block table with raw SHA-256 hashes.
- **Hardware & Tailscale Cluster Tab**:
  - Node status cards for local host (`iMac Pro` Intel) and cluster workers (`mbp-m4` Apple Silicon M4, `august-brinells-mac-mini`).
  - 4-arm protocol matrix explaining the scientific function of each stream.
- **Power & Bit-Budget Calculator Tab**:
  - Interactive slider for standard bit-effect $\delta$.
  - Bit requirement curve ($N \approx 19.1125 / \delta^2$), throughput time estimates (1 Mbit/s vs 4 Mbit/s), and participant-level power estimates.
- **OSF Preregistration Tab**:
  - Complete, copyable Markdown template ready for pre-registration on OSF.io.

---

### 4. Navigation & Mission Registry
- Added `{ id: 'rng-lab', label: 'Quantum RNG (Micro-PK)', icon: Radio }` to `src/components/Sidebar.tsx`.
- Mounted `QuantumRngSection` in `src/App.tsx`.
- Registered **Mission Q01: Micro-PK Preregistered Quantum RNG Null Adjudication** in `src/data/labData.ts`.

---

## Verification & Test Results

### 1. Python Core Self-Tests
Executed:
```bash
.venv/bin/python scripts/micro_pk_rng.py --test
```
**Results**:
- ✓ Apple CSPRNG & SHA-256 integrity passed.
- ✓ Deterministic PRNG Seed Commitment & Reproducibility passed.
- ✓ Mathematical proof: Target balancing cancels stationary hardware bias ($E[Z]_{\text{bias}} = 0$).
- ✓ End-to-end pilot session and permutation null adjudication passed.

### 2. API Endpoints & Server Bundles
Executed:
- `npm run lint` (`tsc --noEmit`): **0 errors**.
- `npm run build`: Vite build + esbuild server (`api/index.js` and `dist/server.cjs`): **Success**.
- Node API integration test: Verified `/api/rng/status`, `/api/rng/session/start`, `/api/rng/session/block`, and `/api/rng/session/analyze`. Output confirmed host detection as `Control Station / Analysis Host (iMac Pro Intel)` and correctly computed permutation null distributions and verdicts.
