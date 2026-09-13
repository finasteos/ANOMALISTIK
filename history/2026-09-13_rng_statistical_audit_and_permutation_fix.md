# Task Progress: Micro-PK RNG Statistical Audit & Permutation Correction

**Date**: 2026-09-13  
**Project**: ANOMALISTIK (`finasteos/ANOMALISTIK`)  
**Scope**: Statistical engine audit, exact condition permutation null distribution, and Normal-Normal Bayes Factor  

---

## Issues Identified & Resolved

### 1. Condition Permutation Bug
- **Issue**: The original permutation test code extracted `int_mean = np.mean(z_scores[:n_int])` and `ctrl_mean = np.mean(z_scores[n_int:])`. Because the session block schedule is randomized prior to the experiment, intention blocks were not grouped at the start of the array, leading to a distorted null distribution.
- **Resolution**: Implemented exact Fisher condition-label permutation across both `scripts/micro_pk_rng.py` and `server.ts`:
  ```python
  observed_d = np.mean(z_scores[conditions == "INTENTION"]) - np.mean(z_scores[conditions == "CONTROL"])
  
  base_mask = np.zeros(len(blocks), dtype=bool)
  base_mask[:n_int] = True
  
  for i in range(n_permutations):
      shuffled_mask = rng.permutation(base_mask)
      perm_d = np.mean(z_scores[shuffled_mask]) - np.mean(z_scores[~shuffled_mask])
      perm_d_values[i] = perm_d
  ```
  Verified on a 4-block test ($N_{\text{int}}=2, N_{\text{ctrl}}=2$): empirical $p = 0.1635$ exactly matches the analytical $\binom{4}{2}^{-1} = 1/6 \approx 0.1667$.

### 2. Normal-Normal Bayes Factor
- **Issue**: The previous BF calculation used an informal density ratio heuristically labeled "Savage-Dickey".
- **Resolution**: Replaced with an exact Normal-Normal directional Bayes factor ($BF_{01}$ and $BF_{10}$) with explicit prior scale ($\tau = 0.20$):
  $$BF_{01}^{\text{two-sided}} = \sqrt{1 + \frac{\tau^2}{\sigma_D^2}} \exp\left( -\frac{D^2}{2\sigma_D^2} \cdot \frac{\tau^2}{\sigma_D^2 + \tau^2} \right)$$
  With directional half-normal correction for $H_1^+: \mu > 0$:
  $$BF_{01}^+ = \frac{BF_{01}^{\text{two-sided}}}{2 \Phi\left( \frac{D}{\sigma_D} \frac{\tau}{\sqrt{\sigma_D^2 + \tau^2}} \right)}$$
  Labeling in the UI now explicitly indicates `Normal-Normal BF₀₁ (τ = 0.20)` alongside $BF_{10}$.

### 3. Apple CSPRNG Terminology
- **Issue**: Described as "seeded by Secure Enclave TRNG + system entropy".
- **Resolution**: Corrected to conservative and precise scientific terminology: `macOS kernel CSPRNG / system entropy source` across all UI tables, API models, and engine docstrings.

### 4. Deterministic PRNG Placebo Arm
- Re-confirmed that the pre-study SHA-256 seed commitment protocol guarantees mathematical bit-invariance before operator engagement, functioning as an airtight negative/placebo control.

---

## Verification
- `scripts/micro_pk_rng.py --test`: All automated self-tests passed.
- `tsc --noEmit`: 0 errors.
- `npm run build`: Vite & esbuild bundles compiled cleanly.
- End-to-end Node API test: Confirmed exact condition permutations, directional Bayes factor, and updated CSPRNG labels.
