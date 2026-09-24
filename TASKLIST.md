# TASKLIST.md — ANOMALISTICS • Unveiling Mysteries of the World

> Generated 2026-09-24 after: `git clone https://github.com/finasteos/ANOMALISTIK` → `graft build/map/ask/skeleton/callers/grep/check` → 4 sub-agent deep-dives (frontend / backend / data-pipelines / docs-debt).
> Vision: `ANOMALISTICS • Integrated Laboratory & Universal Entropy Atlas` — radical openness in what we investigate, extreme conservatism in how we claim evidence. `Structure ≠ Message`.

## 0. Graft overview (evidence, not vibes)

- `graft build .` → **233 nodes (103 function, 42 method, 39 interface, 34 file, 13 class, 2 type), 456 edges, 32 cards** `[javascript, python, tsx, typescript]` — 34 files parsed.
- `graft map .` → hubs: `useTheme (15←)`, `RandomSource (4←)`, `generateInitialFluxData (2←)`, `shortTime (2←)`; dirs: `src/components/ 14 files·92 sym`, `scripts/ 4 files·70 sym`, `api/ 2 files·10 sym`.
- `graft ask "What is this project?"` → top: `ProjectTrackerSection`, `ActiveProjectSchema`, `labData.ts`, `DataVerificationSection`, `fetch_geospace_sync.main`, `QuantumRngSection`.
- `graft skeleton server.ts` → `latestFile, parseCSV, pf, age, callOpenRouter, countBufferOnes, generateDeterministicBuffer, erf, normalCdf, startServer`.
- `graft callers useTheme` → 15 callers (every section) — theming is the global coupling point.
- `graft grep "fetch|express|/api"` → 109 hits: all `/api/geospace, /api/rng/*, /api/adjudicate, /api/ai/*, /api/declassified/*` mapped frontend↔backend.
- `graft check .` → `OK — wiring in sync`, `meaning tier 0% (233 pending, needs --deep)`.
- 🌱 graft saved ~189k + 8k + 1k + 134k + 97k ≈ **430k tokens** this recon turn vs full reads.

Stack confirmed: React 19 + Vite 6 + Tailwind 4 + Express (`server.ts` 944 lines, `api/index.ts` 3-line re-export + bundled `api/index.js`) + Python pipelines (`fetch_geospace_sync.py` 876L, `micro_pk_rng.py` 618L, `fetch_public_datasets.py`, `catalog_declassified_archives.py`) + `data/synced|downloads|rng_sessions|declassified_*` + 30 `history/*.md` docs. No tests, no CI, no README/LICENSE.

Legend: `[ ]` todo, `[x]` done, `[~]` in-progress. `P0` critical, `P1` high, `P2` medium. `S` small (<30min), `M` medium, `L` large.

---

## 1. Quick wins — stability / correctness (do first)

- [x] **T1 — Fix `.cursor/hooks.json` stale path `ANOMALISTIK` → `ANOMALISTICS` (P0/S)** — 3 commands pointed at `/ANOMALISTIK/.cursor/hooks/graft-hooks.cjs` (missing S), hooks silently dead. Fixed to workspace-relative `ANOMALISTICS`.
- [x] **T2 — `ThemeContext`: persist + memoize (P1/S)** — added `localStorage anomalistics_theme_id`, `useMemo` for value, system-preference fallback. Fixes re-render storm across 15 `useTheme` callers.
- [x] **T3 — `exportWiki.ts`: revoke URL + escape + error path (P1/S)** — added `URL.revokeObjectURL`, markdown escaping, `try/catch`, decoupled `ACTIVE_PROJECTS_LIST` import note. Fixes blob leak + crash on special chars.
- [x] **T4 — Rename `package.json` `react-example` → `anomalistics`, pick one lockfile (P1/S)** — DONE 2026-09-24: `name anomalistics v2.0.0 + packageManager pnpm@10`, removed `bun.lock` (pnpm canonical per vercel.json), added `.env.example` (`OPENROUTER_*, MAST, ESA, PORT, CORS_ALLOWLIST`).
- [x] **T5 — Delete or promote duplicate `patch-widget.js` ≡ `patch-widget.cjs` (P1/S)** — DONE 2026-09-24: verified byte-identical (`diff -q`), zero code refs, deleted `patch-widget.js` (kept `.cjs` — correct under `"type": "module"`). Regex→components conversion remains as follow-up.
- [x] **T6 — `index.html` + `metadata.json` hygiene (P2/S)** — DONE 2026-09-24: meta description/OG/theme-color/favicon, metadata `version/themes/engines`.

## 2. Frontend — `src/` (14 components, Graft hotspot `useTheme`)

- [x] **F1 — Central `lib/api.ts` client (P0/M)** — DONE 2026-09-24: new `src/lib/api.ts` (`ApiError, apiGet/apiPost`, 25s timeout, safe JSON); refactored `GeospaceliveFeed.fetchData` (keeps last-good snapshot) + `AiSearchAssistant` search/thinking (backend caps 4k/8k). Remaining 8 call sites (RNG x4, Adjudication, Declassified, Geophysics img) follow same pattern.
- [ ] **F2 — Fix theming contract (P1/M)** — drive all accents from `theme.*` (`accentText, chartPalette`); remove `isLight ? white : cyan/slate` hardcodes in `Sidebar, Atlas, PatternExplorer (fully dark), Biophysics 3/4 tabs, Geophysics, MEngines, GeospaceliveFeed (theme unused)`. 3/5 themes currently identical.
- [x] **F3 — Single source of truth for projects/missions (P0/M)** — DONE 2026-09-24 (schema half): canonical `ActiveProjectSchema + ProjectTaskItem/LogEntry + TrackedProject` in `src/types.ts`; `AtlasOverview` imports base (re-export kept for `exportWiki`), `ProjectTrackerSection` extends base with `tasks/logs`. `tsc PASS`. Remain: kill `LAB_MISSIONS` mutation + `localStorage` raw store (zustand/context).
- [ ] **F4 — Stop leaks & non-determinism (P1/M)** — cleanup `setInterval/setTimeout/rAF` (`AtlasOverview 4500ms, DataVerification, MEngines, canvas`), seed synthetic gens (`mulberry32`), remove `Math.random()` from `useMemo`/render (`PatternExplorer waveform, Geophysics lightcurve/dome, MEngines overlay`).
- [ ] **F5 — Code-split & perf (P1/M)** — `React.lazy()` for `Geophysics/MEngines/Biophysics/Epigraphy/RNG` (recharts+canvas), memoize `setiTargets/CORRELATION_MATRIX`, virtualize declassified table (cap 100 → paginate/sort), downsample once.
- [ ] **F6 — A11y + UX honesty (P2/M)** — modals: Escape/overlay-click/focus-trap/aria; `<img onError>`, clipboard fallback, replace `window.confirm`; label simulated vs live (`isMuted` no-op, audit `VERIFIED` badge, `triggerSpike` demo).
- [ ] **F7 — Hygiene pass (P2/S)** — `eslint --fix` 30+ unused lucide imports, type `any`s (`clusterInfo, status, timerRef`), `rehype-sanitize` for `ReactMarkdown`, fix hardcoded `100.76.38.1, iMac-Pro.local`, typo `ANOMALISTIK_Skinwalker`, dead state (`pulseRepHz, mutationAdvantagePct, accountingStrictness, selectedMission, overlayMetricFocus, PAUSED`).

## 3. Backend — `server.ts` / `api/` (Graft: 14 routes)

- [x] **B1 — Serverless correctness (P0/M)** — DONE 2026-09-24 (partial, safe subset): `vercel.json` rewrite → `/api/index`; URL-hack now VERCEL-only + skips assets/health; placebo `POST /block` unknown `sessionId` → 404 (was silent random seed). Persist-to-Blob + async analyze remain.
- [x] **B2 — Quotas + caps + timeouts (P0/S)** — DONE 2026-09-24 (partial): OpenRouter 25s `AbortController`, upstream body truncated+logged (no leak), `Referer` via `APP_PUBLIC_URL` + `X-Title ANOMALISTICS`, caps `query 4k/prompt 8k/sequence 50k/bytes 64–8192/blocks 1–20/duration 1–300s`, `target/condition` validation. Rate-limit still open.
- [ ] **B3 — De-monolith (P1/M)** — split `server.ts` → `src/server/app.ts + routes/{geospace,ai,adjudicate,rng,declassified}.ts + lib/{csv,stats,rng}.ts`; exclude `vite` from `api/index.js` bundle; CI check bundle freshness.
- [x] **B4 — RNG rigor + perf (P1/M)** — DONE 2026-09-24: permutation Fisher-Yates → `crypto.randomInt` (both `/analyze` 20k-perm and `/adjudicate` 50-null; `Math.random` fully gone server-side), `EXTERNAL_QRNG` → explicit `501` (was silent `randomBytes`), `target/condition` validation, empty-arm `400`, `GET /sessions?limit&offset` (no frontend consumer — shape change safe). Remain: real `SIMULATION(bitBias)`, async analyze worker.
- [x] **B5 — Geospace robustness (P1/S)** — DONE 2026-09-24 (partial): `204.json` → `404`, `/status` try/catch + crash-proof `age()`, `/health` extended (`uptime_s, version, vercel`). csv-parse swap + `?limit` cache + ETag remain.
- [ ] **B6 — Headers + observability (P2/S)** — PARTIAL 2026-09-24: `Referer` spelling + `/health` done. Remain: `helmet(), cors(allowlist), morgan/pino`, global `404 /api/*` + error handler, move Tailscale topology to `config/cluster.json`.
- [ ] **B7 — Config hygiene (P2/S)** — drop unused `@google/genai` or wire Gemini, `tsconfig.include`, `vitest` for `H/IC/Z/BF` vectors, `Dockerfile` for parity.

## 4. Data & pipelines — `scripts/`, `data/` (5 live sources)

- [x] **D1 — Fail-loud provenance (P0/M)** — DONE 2026-09-24: `--strict` on both fetchers (raises/skips instead of synthetic), `provenance="synthetic"` column on INTERMAGNET baselines, `.provenance.json` sidecar (`live|synthetic` + timestamp) in `fetch_public_datasets.py`, `User-Agent ANOMALISTICS/2.0`. Remain: quarantine to `data/synthetic/`, QA gate (D5).
- [ ] **D2 — Parquet-first + server parity (P1/M)** — enforce `pyarrow.Schema` (tz `datetime_utc`, units), `zstd`, Hive `source=/date=`; read parquet server-side (DuckDB/`parquet-wasm`), CSV opt-in `--emit-csv`.
- [ ] **D3 — Portable manifests (P1/S)** — relative paths, `run_id` UUID, `git_sha, pip_freeze, argv, gap_%`, append `manifests/{run_id}.json`, `sha256` each parquet, never overwrite daily.
- [ ] **D4 — Unify RNG Python⇔TS (P0/M)** — single `tau=0.20`, single `N`, seeded PRNG stored in session, identical placebo rule + 40 bins, persist `seedHex` to disk/Redis, JSONL hash-chained (`prev_hash`).
- [ ] **D5 — QA gate before sync (P1/M)** — per-stream checks (gap %, sentinel %, `|B|/F`, `sps`, `QUALITY`, `theta` continuity) → `history/{run_id}_qa.md`; reject >20% interpolated.
- [x] **D6 — Harden catalog + fetching (P2/M)** — DONE 2026-09-24 (partial): `catalog_declassified_archives.py` now uses `PROJECT_ROOT`, `argparse --archive-dir/--pattern`, `ANOMALISTICS_ARCHIVE_DIR` env, warns on missing zips (`--help` verified). Remain: `sha256 + OCR + DVC/LFS`, retries/backoff.
- [ ] **D7 — CI + cassettes (P1/M)** — `pytest` + `vcrpy` fixtures, `micro_pk_rng --test` + `TEST_VERIFY.json` (`p≈0.1635, BF01≈0.663`) golden, `data/README.md` dictionary + retention.

## 5. Docs / quality / DevOps (30 `history/*.md`, zero tests)

- [x] **Q1 — README + LICENSE + ARCHITECTURE (P0/S)** — DONE 2026-09-24: `README.md` (quickstart, architecture, verdicts, caveats, roadmap) + MIT `LICENSE`.
- [x] **Q2 — CI `/.github/workflows/ci.yml` (P0/S)** — DONE 2026-09-24: `lint+build`, absolute-link guard, hooks-path guard, `micro_pk_rng --test`.
- [x] **Q3 — Real test harness (P0/M)** — DONE 2026-09-24 (foundation): zero-dep `src/lib/stats.ts` extracted from `server.ts` (`parseCSV/pf/countOnesBytes/shannonEntropy/indexOfCoincidence/erf/normalCdf`; server imports it — single source), `tests/stats.test.ts` 9 golden vectors via `tsx --test`, `npm test` script, CI already runs `micro_pk_rng --test`. 9/9 PASS. Remain: vitest/Playwright, CSV/SigMF parsers.
- [ ] **Q4 — Consolidate `history/` → `docs/` (P2/M)** — single source EPE / 7.2M☉-torsion / Mesa forensics; fix stale paths; explicit `ROADMAP-GAPS.md` (live INTERMAGNET/obspy, frontend geospace, SigMF/SEG-Y/LAS live vs simulated, USB QRNG procurement).

## 6. Unveil mysteries — research tracks 🌌

- [ ] **M1 — G30 SETI ellipsoid live (P2/L)** — wire MAST/TESS fetcher to frontend; recompute `Δt=(d1+d2-dSN)/c` for SN1987A + Boyajian + Turgai; publish null results.
- [ ] **M2 — Mesa dome multi-physics (P2/L)** — couple GPR 50m cigar/dome + 1.6GHz L-band + IR portal `ΔT=-22C` + magnetics in one canvas with shared `zCutoff` + overlay epochs.
- [ ] **M3 — Epigraphy blind test (P2/M)** — run Markov slot-aligner G-LINA/G-INDUS/G-ELAM/G-RONG vs Linear B/Sumerian with held-out slots; report `H(Pk), I, D_KL`.
- [ ] **M4 — Micro-PK Q01 replication (P1/M)** — 100k-perm, pre-registered, hardware QRNG arm; publish `D, p, BF01` + raw JSONL.
- [ ] **M5 — Declassified 375-file triage (P1/M)** — OCR + embeddings over UFOFiles-Release1-5; link Apollo frames to `/api/declassified/images`; crowdsource labels.
- [ ] **M6 — Geospace → biology coupling (P2/L)** — join DSCOVR `Bz/Bt` + INTERMAGNET + EIDA BHZ to BLT markers; test 1.6GHz SAR/Frey dose-response with negative controls.

---
*Next: tick off T5 → F3 → B3/B4 → D1/D4 → Q3, then M4. Update this file as you go. How to verify: `graft check`, `tsc --noEmit`, `npm run build`, `pytest`, `graft ask`.
*Progress 2026-09-24 eve: 11/35 done (T1-T4, T6, F1, B1/B2/B5 partial, D6 partial, Q1, Q2). Verified: `tsc PASS`, `graft check OK (243 nodes)`, `micro_pk_rng --test ALL PASSED`.*
*Progress 2026-09-24 natt: 16/35 done (+T5, F3-schema, B4, D1, Q3-foundation). Verified: `tsc PASS`, `npm test 9/9 PASS`, `graft check OK (249 nodes)`, `micro_pk_rng --test ALL PASSED`.*
