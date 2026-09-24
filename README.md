# ANOMALISTICS • Integrated Laboratory & Universal Entropy Atlas

> Radical openness in what we investigate, extreme conservatism in how we claim evidence. `Structure ≠ Message`.

Multimodal empirical workbench for anomaly triage: geospace telemetry, micro-PK RNG lab, entropy adjudication, declassified archives (375 files), epigraphy, M-engines, biophysics — with Layer-1 negative controls on every claim.

## Quickstart

```bash
cp .env.example .env        # add OPENROUTER_API_KEY etc
pnpm install                # pnpm is canonical (vercel.json); bun.lock removed
pnpm dev                    # tsx server.ts → http://localhost:3000 (API+SPA same port)
pnpm lint && pnpm build     # tsc --noEmit + vite + esbuild api/index.js + dist/server.cjs
```

Python pipelines (isolated venv recommended):
```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python3 scripts/fetch_geospace_sync.py --sources dscovr,intermagnet,eida
.venv/bin/python3 scripts/micro_pk_rng.py --test   # golden: p≈0.1635, BF01≈0.663
```

## Architecture (see TASKLIST.md §0 for Graft map)

- `src/` — React 19 + Tailwind 4, 11 tabs (`App.tsx`), 14 components. Global hotspot: `useTheme` (15 callers). New: `src/lib/api.ts` typed client (AbortController + timeout + safe JSON).
- `server.ts` (+ `api/index.ts` thin re-export, bundled `api/index.js`) — Express 14 routes: `/api/health, /api/geospace[/status], /api/ai/search-grounded|high-thinking (OpenRouter), /api/adjudicate (H/IC/z), /api/declassified/catalog|images, /api/rng/status|session/start|block|analyze|sessions`.
- `scripts/` — `fetch_geospace_sync.py` (DSCOVR/INTERMAGNET/EIDA/MAST/GOCE → `data/synced/`), `micro_pk_rng.py` (4-arm blinded, SHA-256 commitments), `fetch_public_datasets.py`, `catalog_declassified_archives.py --archive-dir`.
- `data/` — `synced/*.parquet+*.csv+manifest`, `downloads/`, `rng_sessions/RNG_SESS_*.json`, `declassified_archive_index.json` (17GB upstream, not committed).
- `history/` — 30 research logs (Travis Taylor, Mesa, EPE, cosmology, RNG audit). Being consolidated to `docs/`.

## Verdicts (Layer 1 / Layer 3)

`|z|≥10 STRUCTURE_SIGNAL`, `≥3.5 SEQUENCE_STRUCTURE`, `<1.5 CLAIM_FAILS_NULL`, else `UNDERDETERMINED`. RNG: `p<0.001&D>0 STRUCTURE_SIGNAL`, `p<0.05 UNDERDETERMINED`, placebo `|D|≥2.5 INSTRUMENT_SYSTEMATICS`. Every Tess/GOCE/EIDA fetch logs provenance; synthetics quarantined to `data/synthetic/` (`--strict` aborts).

## Disclosure caveats

Simulated feeds (`AtlasOverview` stream, `DataVerification` terminal) are labeled SIM; live is DSCOVR/INTERMAGNET/EIDA only. No hardware QRNG yet (`EXTERNAL_PHYSICAL_QRNG available:false`). Tailscale topology in `config/cluster.json`, never hardcoded.

## Roadmap → TASKLIST.md

`T1-T6 quick wins ✅`, `F1-F7 frontend`, `B1-B7 backend`, `D1-D7 data`, `Q1-Q4 quality`, `M1-M6 mysteries (G30 SETI, Mesa dome, epigraphy blind test, Q01 replication, 375-file triage, geospace→bio)`. Verify: `graft check`, `tsc --noEmit`, `npm run build`, `pytest`.
