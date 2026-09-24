// RNG adjudication math (TASKLIST B3/D4) — pure, tested, shared.
// Extracted from server.ts /api/rng/session/analyze. normalCdf from lib/stats.
import { normalCdf } from "../lib/stats";

export const RNG_TAU = 0.20;
export const RNG_HIST_BINS = 40; // Python parity (micro_pk_rng.py)

/** Directional Normal-Normal BF01 (H1+: mu > 0 vs H0), rounded like the API. */
export function directionalBF01(
  observedD: number,
  stdPermD: number,
  tau: number = RNG_TAU
): { bf01: number; bf10: number } {
  const zStat = observedD / stdPermD;
  const ratioVar = (tau * tau) / (stdPermD * stdPermD);
  const exponent =
    -0.5 * zStat * zStat * ((tau * tau) / (stdPermD * stdPermD + tau * tau));
  const bf01Twosided = Math.sqrt(1.0 + ratioVar) * Math.exp(exponent);
  const argPhi = (zStat * tau) / Math.sqrt(stdPermD * stdPermD + tau * tau);
  const phiVal = normalCdf(argPhi);
  const bf01Directional =
    phiVal > 1e-6 ? bf01Twosided / (2.0 * phiVal) : bf01Twosided * 1e6;
  const bf01 = Math.max(Number(bf01Directional.toFixed(3)), 0.001);
  const bf10 = bf01 > 0 ? Number((1.0 / bf01).toFixed(3)) : 999.0;
  return { bf01, bf10 };
}

/** Layer-3 verdict from Layer-1 gate + permutation p-value. */
export function adjudicateVerdict(args: {
  layer1Passed: boolean;
  pValue: number;
  observedD: number;
}): string {
  if (!args.layer1Passed) return "INSTRUMENT_SYSTEMATICS";
  if (args.pValue < 0.001 && args.observedD > 0) return "STRUCTURE_SIGNAL";
  if (args.pValue < 0.05 && args.observedD > 0) return "UNDERDETERMINED";
  return "CLAIM_FAILS_NULL";
}

export interface HistBin {
  bin: number;
  count: number;
}

/** Fixed-bin histogram over permutation nulls (+ observed) for Recharts. */
export function buildHistogram(
  values: number[],
  observed: number,
  nBins: number = RNG_HIST_BINS
): HistBin[] {
  const minD = Math.min(...values, observed);
  const maxD = Math.max(...values, observed);
  const step = (maxD - minD) / nBins || 0.1;
  const bins: HistBin[] = Array.from({ length: nBins }, (_, i) => ({
    bin: Number((minD + (i + 0.5) * step).toFixed(3)),
    count: 0,
  }));
  for (const v of values) {
    const idx = Math.min(Math.floor((v - minD) / step), nBins - 1);
    if (idx >= 0 && idx < nBins) bins[idx].count++;
  }
  return bins;
}
