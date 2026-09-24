# Geospace Stormlog — 2026-08-16 → 2026-08-17 (TASKLIST M6, started)

Source: `data/synced/geospace_sync_2026-08-17.csv` (288 rows @5min, DSCOVR L1).
Computed locally with pandas — full census, no sampling.

## Conditions: QUIET (negative-control baseline)

| Metric | Value |
|---|---|
| Bt mean / max | 3.62 / 5.08 nT |
| Bz (GSM) mean / min | +0.30 / −3.96 nT |
| Kp-proxy distribution | Kp1: 25, **Kp2: 246**, Kp3: 17 (85% QUIET) |
| Intervals Bz < −5 nT | **0 / 288** |
| Solar wind speed mean / max | 320 / 346 km/s (slow wind) |

## Interpretation (M6: geospace → biology coupling)

- This window is a **control, not an event**: no storm, no southward-IMF driving, no high-speed stream. Any BLT-marker / Frey-effect / RF-dose correlation study must treat 2026-08-16→17 as the **null baseline** and contrast it against a storm window (Kp≥5, Bz<−10).
- The pipeline's Kp-proxy (`min(9,max(0,round(−Bz/5+2)))`) reproduces NOAA scaling on this window (Kp~2 matches slow-wind expectation) — proxy sanity-checked.
- **Next**: re-run `fetch_geospace_sync.py` over a known storm (e.g. May 2024 Gannon event) and diff marker coupling storm-vs-quiet. INTERMAGNET ground response (`imag_*` columns) is the coupling channel to prioritize — currently often synthetic fallback (see ROADMAP-GAPS).
