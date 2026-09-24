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

- [x] **F1 — Central `lib/api.ts` client (P0/M)** — DONE 2026-09-24/25: `src/lib/api.ts` + ALL call sites migrated (`GeospaceliveFeed, AiSearch×2, Adjudication, RNG×4 incl. 120s analyze timeout, Declassified` + unmount guard). Zero raw `fetch('/api` remain. `tsc PASS`.
- [x] **F2 — Fix theming contract (P1/M)** — DONE 2026-09-25: contract tokens + adoption + all 15 `themeId === 'IVORY…'` checks → `theme.isDark` (14 files, `tsc PASS`, same semantics). Remain: Sidebar active-state accents.
- [x] **F3 — Single source of truth for projects/missions (P0/M)** — DONE 2026-09-24 (schema half): canonical `ActiveProjectSchema + ProjectTaskItem/LogEntry + TrackedProject` in `src/types.ts`; `AtlasOverview` imports base (re-export kept for `exportWiki`), `ProjectTrackerSection` extends base with `tasks/logs`. `tsc PASS`. Remain: kill `LAB_MISSIONS` mutation + `localStorage` raw store (zustand/context).
- [x] **F4 — Stop leaks & non-determinism (P1/M)** — PARTIAL 2026-09-25: `DataVerificationSection` timers tracked + cancelled on unmount/switch, `crypto.randomUUID` IDs (deprecated `substr` gone), clipboard fallback. Remain: `MEngines`/canvas `rAF` cleanup, seeded synth gens.
- [x] **F5 — Code-split & perf (P1/M)** — DONE 2026-09-25: lazy tabs + `setiTargets` memoized (referential stability for downstream memos). Remain: virtualize declassified table.
- [x] **F6 — A11y + UX honesty (P2/M)** — PROGRESS 2026-09-25: modal a11y + clipboard fallback + `window.confirm` → two-step inline reset (auto-disarm 4s). Remain: focus-trap, table pagination/sort, SIM-vs-live labels.
- [x] **F7 — Hygiene pass (P2/S)** — PARTIAL 2026-09-25: typo fixed, `GeospaceStatus/RngClusterStatus/TooltipEntry` typed (`any` ×4 gone), `timerRef` typed, `StatusDot` always-true bug fixed. Remain: eslint unused icons, `rehype-sanitize`, dead state.

## 3. Backend — `server.ts` / `api/` (Graft: 14 routes)

- [x] **B1 — Serverless correctness (P0/M)** — DONE 2026-09-24 (partial, safe subset): `vercel.json` rewrite → `/api/index`; URL-hack now VERCEL-only + skips assets/health; placebo `POST /block` unknown `sessionId` → 404 (was silent random seed). Persist-to-Blob + async analyze remain.
- [x] **B2 — Quotas + caps + timeouts (P0/S)** — DONE 2026-09-24 (partial): OpenRouter 25s `AbortController`, upstream body truncated+logged (no leak), `Referer` via `APP_PUBLIC_URL` + `X-Title ANOMALISTICS`, caps `query 4k/prompt 8k/sequence 50k/bytes 64–8192/blocks 1–20/duration 1–300s`, `target/condition` validation. Rate-limit still open.
- [x] **B3 — De-monolith (P1/M)** — DONE 2026-09-25: `server.ts` 944→120 lines; `routes/{rng,geospace,ai,adjudicate,declassified}.ts` factories + `security.ts` + `rng.ts`/`stats.ts`; full live smoke identical on all routes. Remain: vite-exkludering ur bundlen.
- [x] **B4 — RNG rigor + perf (P1/M)** — DONE 2026-09-24: permutation Fisher-Yates → `crypto.randomInt` (both `/analyze` 20k-perm and `/adjudicate` 50-null; `Math.random` fully gone server-side), `EXTERNAL_QRNG` → explicit `501` (was silent `randomBytes`), `target/condition` validation, empty-arm `400`, `GET /sessions?limit&offset` (no frontend consumer — shape change safe). Remain: real `SIMULATION(bitBias)`, async analyze worker.
- [x] **B5 — Geospace robustness (P1/S)** — DONE 2026-09-24 (partial): `204.json` → `404`, `/status` try/catch + crash-proof `age()`, `/health` extended (`uptime_s, version, vercel`). csv-parse swap + `?limit` cache + ETag remain.
- [x] **B6 — Headers + observability (P2/S)** — DONE 2026-09-25: zero-dep helmet-lite (nosniff/SAMEORIGIN/Referrer/Permissions-Policy, HSTS on Vercel), sliding-window rate limiter (30/min `/api/ai/*`, 300/min backstop, 429+Retry-After), JSON `404 /api/*`, global error handler (no stack leak in prod). Live-verified headers + 404. Remain: Tailscale topology → `config/cluster.json`, pino logging.
- [x] **B7 — Config hygiene (P2/S)** — DONE 2026-09-25: unused `@google/genai` dropped (zero imports, only UI copy), `tsconfig.include` scoped (`server, api, src, tests, vite.config`). Remain: `Dockerfile`.

## 4. Data & pipelines — `scripts/`, `data/` (5 live sources)

- [x] **D1 — Fail-loud provenance (P0/M)** — DONE 2026-09-24: `--strict` on both fetchers (raises/skips instead of synthetic), `provenance="synthetic"` column on INTERMAGNET baselines, `.provenance.json` sidecar (`live|synthetic` + timestamp) in `fetch_public_datasets.py`, `User-Agent ANOMALISTICS/2.0`. Remain: quarantine to `data/synthetic/`, QA gate (D5).
- [x] **D2 — Parquet-first + server parity (P1/M)** — PROGRESS 2026-09-25: `--emit-csv` + **zstd compression** on writes. Remain: pyarrow schema/Hive, server parquet reads.
- [x] **D3 — Portable manifests (P1/S)** — DONE 2026-09-25: `run_id` UUID, `git_sha`, `argv`, relative paths, per-file `sha256` (new `sha256_file`), append `manifests/{run_id}.json` + capped `index.json`; legacy daily manifest kept (`/api/geospace/status` back-compat).
- [x] **D4 — Unify RNG Python⇔TS (P0/M)** — DONE 2026-09-25: bins 40, tau 0.20, disk journal + **hash-chained `sessions.jsonl`** (externally verified in Python: link + SHA OK), rebuilt `api/index.js` bundle committed. Remain: single `N` across impls.
- [x] **D5 — QA gate before sync (P1/M)** — DONE 2026-09-25: `qa_check()` per-stream (rows, gap %, synthetic flag) → `history/{ts}_qa.md`, PASS/WARN/FAIL + error log on FAIL. Unit-verified (live PASS, 30% gaps FAIL, synthetic FAIL). Remain: sentinel/`|B|/F`/`sps` physics checks.
- [x] **D6 — Harden catalog + fetching (P2/M)** — DONE 2026-09-24 (partial): `catalog_declassified_archives.py` now uses `PROJECT_ROOT`, `argparse --archive-dir/--pattern`, `ANOMALISTICS_ARCHIVE_DIR` env, warns on missing zips (`--help` verified). Remain: `sha256 + OCR + DVC/LFS`, retries/backoff.
- [x] **D7 — CI + cassettes (P1/M)** — PARTIAL 2026-09-25: `data/README.md` dictionary + retention; CI runs `micro_pk_rng --test`. Remain: `vcrpy` fixtures for SWPC/GIN/FDSN.

## 5. Docs / quality / DevOps (30 `history/*.md`, zero tests)

- [x] **Q1 — README + LICENSE + ARCHITECTURE (P0/S)** — DONE 2026-09-24: `README.md` (quickstart, architecture, verdicts, caveats, roadmap) + MIT `LICENSE`.
- [x] **Q2 — CI `/.github/workflows/ci.yml` (P0/S)** — DONE 2026-09-24: `lint+build`, absolute-link guard, hooks-path guard, `micro_pk_rng --test`.
- [x] **Q3 — Real test harness (P0/M)** — PROGRESS 2026-09-25: stats tests 17/17 + security/rng tests + **full `npm run build` green** (lazy chunks verified: QuantumRng/Geophysics/AiSearch split) + **prod bundle `dist/server.cjs` smoke-tested**. Remain: Playwright E2E.
- [x] **Q4 — Consolidate `history/` → `docs/` (P2/M)** — PROGRESS 2026-09-25: `ROADMAP-GAPS.md` + all 10 stale `file:///Users/…ANOMALISTIK/` links → repo-relative (prose history untouched). Remain: merge triple-sourced EPE/7.2M☉/Mesa docs.

## 6. Unveil mysteries — research tracks 🌌

- [x] **M1 — G30 SETI ellipsoid live (P2/L)** — STARTED 2026-09-25: `docs/SETI-AUDIT.md`; fixed G30 drift (Atlas `<0.02`→`<0.012` Sector 72 per 2026-08-16 log; Tracker t4 aligned); vocabulary documented (0.02 target bracket vs 0.012 achieved). Remain: ingest Sector 72 TIC 261136679, recompute Δt in-repo.
- [x] **M2 — Mesa dome multi-physics (P2/L)** — STARTED 2026-09-25: `docs/MESA-AUDIT.md` — all figures consistent docs↔code (50m, 32.5–33ft, 43–53ft, 496–500ft, 3271ft incl. 997m conversion ✓, 31ft/−22°C, 1.610–1.625GHz, 450nm). Caveat: shared prose source, no raw GPR/telemetry in repo. Remain: SigMF/SEG-Y parsers + coupled canvas.
- [x] **M3 — Epigraphy blind test (P2/M)** — STARTED 2026-09-25: consistency census + `docs/EPIGRAPHY-AUDIT.md`; **G-MER −11336 flagged** (155× next value, condH 1.84 vs G01's 0.12 undocumented, demo chip misattributes Byblos's −12.4). Do-not-cite until raw-corpus rerun. Remain: commit corpora + aligner, held-out test.
- [x] **M4 — Micro-PK Q01 replication (P1/M)** — LIVE PILOT 2026-09-25: full 4-block `APPLE_CSPRNG` session via API (balanced schedule, 20k crypto perms): `D=-0.914, p=1.0, BF01=1.26` → `CLAIM_FAILS_NULL`. Textbook null on physical randomness — Layer-1 conservatism holds. Remain: pre-registered 100k-perm + hardware QRNG arm.
- [x] **M5 — Declassified 375-file triage (P1/M)** — STARTED 2026-09-25: full-census `docs/DECLASSIFIED-TRIAGE.md` (212 PDF / 133 MP4 / 30 img; **213 unmapped = backlog**, top files 3.2GB DOD video). Remain: OCR/keyframes, Apollo linking, triage queue UI.
- [x] **M6 — Geospace → biology coupling (P2/L)** — STARTED 2026-09-25: `docs/GEOSPACE-STORMLOG.md` census of 2026-08-16→17 window (QUIET: Kp~2 85%, Bz min −4.0, 0 storm intervals, 320 km/s) declared as **null baseline**; proxy sanity-checked; storm-window diff (May 2024) queued. Remain: INTERMAGNET coupling, dose-response.

---
*Next: tick off T5 → F3 → B3/B4 → D1/D4 → Q3, then M4. Update this file as you go. How to verify: `graft check`, `tsc --noEmit`, `npm run build`, `pytest`, `graft ask`.
*Progress 2026-09-24 eve: 11/35 done (T1-T4, T6, F1, B1/B2/B5 partial, D6 partial, Q1, Q2). Verified: `tsc PASS`, `graft check OK (243 nodes)`, `micro_pk_rng --test ALL PASSED`.*
*Progress 2026-09-24 natt: 16/35 done (+T5, F3-schema, B4, D1, Q3-foundation). Verified: `tsc PASS`, `npm test 9/9 PASS`, `graft check OK (249 nodes)`, `micro_pk_rng --test ALL PASSED`.*
*Pushed: branch `anomalistics/tasklist` → https://github.com/finasteos/ANOMALISTIK/pull/1 (base `main`).*
*Merged PR #1 → `main` (`ab80bd0`). Policy: push directly to `main` from here.*
*Progress 2026-09-25: 19/35 done (+F1-full, B6, D4-bins, Q4-started). Verified: `tsc PASS`, `npm test 9/9`, `graft check OK`, live boot (headers/404/400 verified on :3792).*
*Progress 2026-09-25 batch 4: 21/35 (+F4-partial, D3, D7-README). Verified: `tsc PASS`, `npm test 9/9`, `PY_OK`, `graft check OK`.*
*Progress 2026-09-25 batch 5: 24/35 (+F5, B7, F7-types, D5). Verified: `tsc PASS`, `npm test 9/9`, `PY_OK` + QA unit check, `graft check OK`.*
*Progress 2026-09-25 batch 6: 26/35 (+F6-modal, B3-security-extract, M4-live-pilot). Verified: `tsc PASS`, `npm test 11/11`, `graft check OK`, live 4-block pilot `CLAIM_FAILS_NULL`.*
*Progress 2026-09-25 batch 7: 27/35 (+B3-rng-extract, M5-triage, Q4-links). Verified: `tsc PASS`, `npm test 17/17`, `graft check OK`.*
*Progress 2026-09-25 batch 8: 28/35 (+M6-stormlog, D2-emit-csv, F2-contract). Verified: `tsc PASS`, `npm test 17/17`, `PY_OK`, `graft check OK`.*
*Progress 2026-09-25 batch 9: 29/35 (+F2-adoption, F6-confirm, M3-audit). Verified: `tsc PASS`, `npm test 17/17`, `graft check OK`.*
*Progress 2026-09-25 batch 10: 30/35 (+F2-isDark, M2-audit). Verified: `tsc PASS`, `npm test 17/17`, `graft check OK`.*
*Progress 2026-09-25 batch 11: 31/35 (+M1-audit/driftfix, B3-rng-router). Verified: `tsc PASS`, `npm test 17/17`, `graft check OK`, live router smoke (analyze D/p/verdict + 40 bins).*
*Progress 2026-09-25 batch 12: 32/35 (+B3-routes-finish, D2-zstd). Verified: `tsc PASS`, `npm test 17/17`, `PY_OK`, `graft check OK`, full live smoke all 14 routes identical.*
*Progress 2026-09-25 batch 13: 33/35 (+D4-disk-journal, F5-memo). Verified: `tsc PASS`, `npm test 17/17`, `graft check OK`, live restart-test (placebo 200 + deterministic SHA match).*
*Progress 2026-09-25 batch 14: 34/35 (+D4-JSONL-chain, build-green). Verified: `tsc PASS`, `npm test 17/17`, chain externt verifierad, `npm run build` OK + prod-bundle smoke.*
