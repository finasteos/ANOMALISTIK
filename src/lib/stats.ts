// Pure math/parse helpers (TASKLIST Q3/B3) — zero dependencies, shared by
// server.ts and node --test. No Node.js or DOM APIs in here.

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || "").trim().replace(/^"|"$/g, "");
    });
    return row;
  });
}

export const pf = (v: string | undefined): number | null => {
  const n = parseFloat(v || "");
  return isNaN(n) ? null : n;
};

export function countOnesBytes(bytes: ArrayLike<number>): number {
  let ones = 0;
  for (let i = 0; i < bytes.length; i++) {
    let byte = bytes[i];
    while (byte > 0) {
      ones += byte & 1;
      byte >>= 1;
    }
  }
  return ones;
}

/** Shannon entropy H(X) in bits from symbol counts. */
export function shannonEntropy(counts: number[], n: number): number {
  if (n <= 0) return 0;
  let h = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}

/** Index of Coincidence: sum c(c-1) / n(n-1). */
export function indexOfCoincidence(counts: number[], n: number): number {
  if (n <= 1) return 0;
  let num = 0;
  for (const c of counts) num += c * (c - 1);
  return num / (n * (n - 1));
}

/** Abramowitz & Stegun erf approximation (max err ~1.5e-7). */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const a = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1.0 / (1.0 + p * a);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-a * a);
  return sign * y;
}

/** Standard normal CDF Phi(x). */
export function normalCdf(x: number): number {
  return 0.5 * (1.0 + erf(x / Math.SQRT2));
}
