# ROADMAP-GAPS.md — known live-vs-simulated gaps (TASKLIST Q4)

Single source for what is **live**, **simulated**, and **missing**. Rule: simulated feeds must be labeled SIM in UI; live claims need provenance (see D1 `--strict`, `.provenance.json`).

## Live today ✅

| Stream | Path | Proof |
|---|---|---|
| DSCOVR mag+plasma (7d) | `data/synced/geospace_sync_*.csv` via `/api/geospace` | 288 rows, smoke-tested 2026-09-24 |
| EIDA BHZ waveforms | `data/downloads/eida/*.parquet` | 1.7M BFO + 1.1M ANMO samples (history log) |
| Micro-PK pilot sessions | `data/rng_sessions/*.json` via `/api/rng/*` | `TEST_VERIFY.json` p=0.16349, smoke-tested |
| Declassified catalog | `data/declassified_archive_index.json` (375 files) | `/api/declassified/catalog` live |
| Entropy adjudication | `POST /api/adjudicate` (H/IC/z + crypto nulls) | smoke-tested uniform-A → CLAIM_FAILS_NULL |

## Simulated (labeled SIM) ⚠️

- `AtlasOverview` realtime alert stream (`setInterval 4500ms, 30% spike`) — demo, not sensors.
- `DataVerificationSection` 5-node terminal feed — spec/wishlist theater.
- `MEnginesSection` flux (`Math.sin + Math.random`), Geophysics lightcurves/dome (`Math.random` per render) — illustrative.
- INTERMAGNET fallback `_synthetic_baseline` and `fetch_public_datasets` `mock_content` — now tagged `provenance=synthetic`, `--strict` aborts.

## Missing / next (links to TASKLIST)

- **Live INTERMAGNET definitive** (auto `variation→quasi→definitive` done; fresh-data 400 fallback remains) → D5 QA gate.
- **Frontend geospace wiring for MAST/TESS + GOCE** (fetcher exists, no UI) → M1.
- **Skinwalker SigMF / SEG-Y / LAS live parsers** (only wishlist matrix) → M5/M6.
- **Hardware QRNG procurement** (`EXTERNAL_QRNG available:false`, API now 501s) → M4.
- **Blob/KV persistence** for RNG commitments (in-memory `Map` lost on Vercel cold-start) → B1 remainder.
- **Vitest + Playwright** beyond `tests/stats.test.ts` foundation → Q3 remainder.
- **history/ → docs/ consolidation** (EPE, 7.2M☉ torsion, Mesa forensics still triple-sourced) → Q4 remainder.
