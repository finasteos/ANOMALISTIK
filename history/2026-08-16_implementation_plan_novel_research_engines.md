# Implementation Plan: 3 High-Yield Novel Discovery Engines
**Date:** August 16, 2026

Build out three breakthrough empirical engines in `ANOMALISTIK` that provide novel, testable, and scientifically unique capabilities across astrophysics, epigraphy, and materials physics.

## 1. Astrophysics: TESS SN 1987A SETI Ellipsoid Lightcurve Processor (Mission G30)
- **Target**: `src/components/GeophysicsAstroSection.tsx`
- **Features**:
  - Add tab `'SETI_ELLIPSOID_SN1987A'` to the section navigation.
  - Geometric time-of-flight solver for the expanding SN 1987A ellipsoid:
    $$\Delta t = \frac{d_1 + d_2 - d_{\text{SN}}}{c}$$
  - Interactive MAST candidate target explorer (TIC 261136679, TIC 410153553, etc.) with configurable parallax synchronicity tolerance ($\Delta t < 0.02\text{ ly}$).
  - Phase-folded lightcurve analyzer ($P = 2.45\text{ d}$, $P = 16.35\text{ d}$) with asymmetric transit dip quantification and astrometric stellar jitter negative control.
  - Real-time $Z$-score, geometric synchronicity index, and Bayesian hypothesis adjudication.

## 2. Epigraphy: Markov Embedding Semantic Slot-Aligner
- **Target**: `src/components/EpigraphySection.tsx`
- **Features**:
  - Interactive Semantic Slot Alignment & Positional Entropy Engine.
  - Markov n-gram transition tensors between undeciphered corpora (Linear A `G-LINA`, Indus `G-INDUS`, Proto-Elamite `G-ELAM`, Rongorongo `G-RONG`) and deciphered ancient accounting standards (Linear B, Sumerian administrative ledgers).
  - Structural accounting slot isolation:
    - Commodity/Tally Slots: Grain (`*120`), Oil (`*130`), Livestock, Metals.
    - Administrative Transaction Verbs: Issued, Received, Contributed.
    - Beneficiary / Toponym Slots.
  - Positional Entropy curves, Isomorphism Index $\mathcal{I} \in [0, 1]$, and Kullback-Leibler divergence $D_{\text{KL}}$ against random shuffle nulls.

## 3. Metamaterials: Bismuth-Zinc THz Hyperbolic Dispersion Solver
- **Target**: `src/components/MEnginesSection.tsx`
- **Features**:
  - Effective Medium Theory (EMT) complex permittivity tensor calculations across $0.1 - 10\text{ THz}$:
    $$\epsilon_\parallel(\omega) = f_{\text{Bi}} \epsilon_{\text{Bi}}(\omega) + (1-f_{\text{Bi}}) \epsilon_{\text{Zn}}(\omega)$$
    $$\epsilon_\perp(\omega) = \left( \frac{f_{\text{Bi}}}{\epsilon_{\text{Bi}}(\omega)} + \frac{1-f_{\text{Bi}}}{\epsilon_{\text{Zn}}(\omega)} \right)^{-1}$$
  - Plot curves of $\text{Re}(\epsilon_\parallel)$, $\text{Re}(\epsilon_\perp)$, $\text{Im}(\epsilon)$ across frequency, identifying the Type I / Type II Hyperbolic Regimes where $\text{Re}(\epsilon_\parallel) \cdot \text{Re}(\epsilon_\perp) < 0$.
  - Interactive controls for Bismuth thickness ($1 - 10\,\mu\text{m}$), Zinc thickness ($50 - 300\,\mu\text{m}$), temperature ($4 - 300\text{ K}$), incident angle $\theta$, and pump frequency.
  - Diamagnetic levitation force and evanescent wave amplification metrics.
