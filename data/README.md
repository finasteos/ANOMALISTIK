# data/ — dictionary & retention (TASKLIST D7)

## Layout

| Dir | Content | Committed? |
|---|---|---|
| `synced/` | `geospace_sync_YYYY-MM-DD.{parquet,csv}` (288×48 @5min / 1503×62 @1min), `manifest_YYYY-MM-DD.json` (legacy) + `manifests/{run_id}.json` + `manifests/index.json` (D3, portable) | samples yes; daily runs no (see retention) |
| `downloads/` | per-source raw: `dscovr/*.parquet`, `eida/*.parquet`, `intermagnet/` (often synthetic fallback), `emag2v3_sample.csv`, `goce_gravity_sample.csv`, `dscovr_solar_wind_sample.json`, `chime_frb_cat2_sample.json`, `.provenance.json` (`live\|synthetic` per file, D1) | samples + provenance yes; bulk raw no |
| `rng_sessions/` | `RNG_SESS_<ts>_<hex>.json` (blocks + analysis), `TEST_VERIFY.json` (audit golden p=0.16349) | goldens yes; ad-hoc runs no |
| `declassified_sample/images/` | Apollo/FBI frames served at `/api/declassified/images` | yes (small) |
| `declassified_archive_index.json` | 375-file catalog of 17GB upstream zips (not in repo) | yes (index only) |
| `logs/` | `fetch_YYYY-MM-DD.log` | no (`*.log` ignored) |
| `synthetic/` | quarantined synthetic baselines (D1 future) | no |

## Provenance

- `provenance=synthetic` column on INTERMAGNET baselines; `.provenance.json` sidecar for public datasets. `--strict` aborts instead of substituting.
- Manifests carry `run_id`, `git_sha`, `argv`, per-file `sha256`, relative paths.

## Retention

- Keep: latest `synced` pair + manifest, goldens (`TEST_VERIFY.json`), samples, index.
- Regenerate, don't commit: daily `geospace_sync_*`, bulk `downloads/*.parquet`, ad-hoc `RNG_SESS_*`, `logs/`.
- Never commit: 17GB `UFOFiles-Release*.zip`, `.env`, `data/synthetic/`.
