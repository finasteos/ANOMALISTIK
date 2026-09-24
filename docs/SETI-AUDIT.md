# SETI Ellipsoid Audit — G30 numbers (TASKLIST M1, started 2026-09-25)

Method: grep census of synchronicity claims across components. No MAST lightcurves in repo — audits **consistency**, not the astrophysics.

## The drift (fixed)

| Location | Was | Now |
|---|---|---|
| `AtlasOverview` G30 metrics | `< 0.02 ly`, vague "Supernova Wavefront" | `< 0.012 ly`, "MAST Sector 72" (Tracker log 2026-08-16 wins: TIC 261136679, dip SNR 14.2 dB) |
| `ProjectTrackerSection` task t4 | `< 0.02 ly` | `< 0.012 ly` (matches its own l2 log) |

## Threshold vocabulary (not a contradiction — documented here)

- **0.02 ly** = design target bracket (solver badge `SYNCHRONIZED (< 0.02 ly)`, code default `parallaxToleranceLy = 0.018`).
- **0.012 ly** = claimed achieved result on TIC 261136679.
- Reading rule: result (0.012) inside bracket (0.02) = pass. Keep both numbers, never conflate.

## Missing (M1 remainder — the actual science)

- No MAST/TESS lightcurve files in `data/` — the "14 lightcurves, z +6.8" claim has no rerunnable artifact. fetcher exists (`fetch_geospace_sync.py --tess-target`), UI solver exists, **data does not**.
- Next: ingest Sector 72 for TIC 261136679, recompute Δt=(d1+d2−dSN)/c in-repo, publish null-or-signal with the same Layer-1 discipline as M4. Boyajian (G20) / Turgai (G28) same treatment.
