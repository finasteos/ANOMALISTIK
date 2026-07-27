---
title: API Keys & Accounts Map
type: how-to
tags: [api-keys, secrets, ops]
updated: '2026-07-27'
sources:
  - .env.example
  - data-inventory.md
---

# API Keys & Accounts Map

**No secret values in this file.** Only: which credential, where to get it, which env var, which consumer.

Master inventory of *data* sources: [[data-inventory]].

Local secrets file (gitignored): `.env` next to the dashboard / lab venv.

---

## Required now (dashboard)

| Credential | Env var | Get it | Consumer |
|------------|---------|--------|----------|
| Google AI Studio key | `GEMINI_API_KEY` | https://aistudio.google.com/apikey | `server.ts` grounded search + high-thinking |

Optional:

| Credential | Env var | Notes |
|------------|---------|-------|
| Public app URL | `APP_URL` | Deploy / callbacks (AI Studio injects) |

---

## Earth observation & space (next)

| Credential | Env var (proposed) | Get it | Unblocks |
|------------|-------------------|--------|----------|
| Copernicus Data Space | `CDSE_USER` / `CDSE_PASSWORD` or `CDSE_TOKEN` | https://dataspace.copernicus.eu | Sentinel-2, GLO-30 |
| NASA Earthdata | `EARTHDATA_USER` / `EARTHDATA_PASSWORD` or `.netrc` | https://urs.earthdata.nasa.gov | GEDI, some NASA archives |
| OpenTopography | `OPENTOPOGRAPHY_API_KEY` | https://opentopography.org | DEM/LiDAR downloads |
| MAST token (if needed) | `MAST_TOKEN` | https://auth.mast.stsci.edu | Bulk TESS/FFI (many public paths work without) |

---

## Geophysics / heliophysics

| Credential | Env var (proposed) | Get it | Unblocks |
|------------|-------------------|--------|----------|
| NMDB | `NMDB_USER` / `NMDB_PASSWORD` | https://www.nmdb.eu | M2 neutron flux |
| INTERMAGNET | institute registration (file/API per observatory) | https://intermagnet.org | M1/R2 vectors |
| IRIS | credentials for bulk | https://ds.iris.edu | G23 infrasound |
| NOAA SWPC / GOES | often none | https://www.swpc.noaa.gov | M2 X-ray |

EMAG2v3 / GOCE / ICGEM are mostly **file downloads** after accepting terms — track account email in password manager, not necessarily an API key.

---

## Biology / literature / mirrors

| Credential | Env var (proposed) | Get it | Unblocks |
|------------|-------------------|--------|----------|
| NCBI | `NCBI_API_KEY` | https://www.ncbi.nlm.nih.gov/account/ | Higher GenBank rate limits |
| Hugging Face | `HF_TOKEN` | https://huggingface.co/settings/tokens | Dataset mirrors (Voynich etc.) |
| Zenodo | usually none for download; token for *upload* | https://zenodo.org | Publishing our packs |

---

## DevOps / agents

| Credential | Env var | Notes |
|------------|---------|------|
| GitHub PAT | prefer OS keychain / `gh auth` — **not** plaintext in mcp.json | Lab PRs, private mirrors |
| Docker Hub (if used) | — | Avoid unless needed |

---

## Hygiene

1. One `.env` per machine; never commit.  
2. When a new fetcher lands, add a row here **before** hard-coding a key name in code.  
3. Rotate any key that ever appeared in chat logs or shared screenshots.  
4. Prefer `gh auth` / system keychain over embedding PATs in MCP configs.
