---
title: M-Engines
type: concept
tags:
  - m1
  - m2
  - m3
  - m4
  - combinations
sources:
  - labData.ts
  - ATLAS_STATUS_EXTRACT.md
  - ROADMAP_BEYOND_WHEAT.md
created: '2026-07-27T07:46:36.654Z'
updated: '2026-07-27T07:46:36.654Z'
---

# M-Engines — Tool × Data Combinations

Cross-modal pipelines. Only **M4** is substantially LANDED today.

| Engine | Title | Stream A | Stream B | Tooling | Status |
|--------|-------|----------|----------|---------|--------|
| M1 | Field vs Geometry | EMAG2 ΔT / GOCE Δg | formations.csv / geoglyph grids | Ripley K + MC Poisson nulls | DESIGNED |
| M2 | Flux vs Biophysics | GOES X-ray / NMDB neutrons | node elongation / expulsion cavities | regression + Beer-Lambert BOL | DESIGNED |
| M3 | Spectral vs Shape | Sentinel-2 CRSWIR/NDVI | circle_extract / line_detect | BFAST / fordead | DESIGNED |
| M4 | Info-theory vs Bitstreams | symbolseq / ASCII | CISI, CEIPP, Linear A refs | H(X), cond-H, D_KL, IC | **LANDED** |

## Priority order (no agent-stack required)
1. Wire M4 outputs → dashboard via entropy_atlas JSON
2. M1: formations × open magnetic/gravity grids
3. M3: one dated formation × Sentinel time-series
4. M2: only if BLT timestamps hold

Related: [[tools]], [[open-work]], [[tracks]].
