---
title: Data Inventory — DBs, APIs, OSINT
type: synthesis
tags: [data, databases, api-keys, osint, inventory]
updated: '2026-07-27'
sources:
  - labData.ts
  - MISSION_BOARD.md
  - progress260727.md
  - research_inject_2026-07-27.md
  - ATLAS_STATUS_EXTRACT.md
---

# Data Inventory

**One place** for external open databases, homegrown catalogs, API/account needs, and OSINT portals.

Status tags:
- **WIRED** — fetcher/probe already talks to it (or local dump ingested)
- **PARTIAL** — synth/fixture only, or live path blocked
- **TODO** — planned, not connected
- **OWN** — we build/maintain this ourselves
- **RESTRICTED** — license / purchase / no redistribution

Secrets live in `.env` only — never in this wiki. See [[api-keys]].

Related: [[tracks]] · [[m-engines]] · [[open-work]] · [[tools]]

---

## 1. External open databases & catalogs

### Epigraphy / scripts (G)

| Source | What | Access | Status | Notes |
|--------|------|--------|--------|-------|
| CDLI (cdli.earth + ATF mirrors) | Cuneiform / Proto-Elamite / Uruk | HTTP / REST | **PARTIAL** | Live FETCH_BLOCKED; Zenodo dump `10.5281/zenodo.4960710` fallback |
| CISI / Mayig Indus | Seal sequences (Mohenjo-daro) | Local / MIT digitisation | **WIRED** | G9 |
| CEIPP / Spaelti Rongorongo | Glyph tablets + parallels | Corpus files | **WIRED** | G4 |
| Meroitic royal corpus (Otten 2025) | Sign streams | Packaged corpus | **WIRED** | G16 |
| Voynich EVA (ZL3b-n / IT2a-n) | Glyph streams | https://www.voynich.nu/data/ | **WIRED** | HF mirror also |
| Dominik 2025 Voynich morphology | Claim-under-test | Zenodo `10.5281/zenodo.17409830` | **WIRED** | G10 null |
| Linear A / B dumps | Symbolseq + LB control | Open corpora | **WIRED** | G1 |
| Cypro-Minoan | Allography / media | Open | **WIRED** | G11 |
| CHIC Cretan Hieroglyphic | Machine-readable | Zenodo/GitHub | **PARTIAL** | G15 synth Evans-shaped; real dump TODO |
| Open Khipu Repository | Andean khipu SQLite | GitHub `khipulab/open-khipu-repository` | **TODO** | research_inject |
| Byblos / Khitan / Zapotec / Isthmian | Dashboard corpora | Various | **TODO** | In UI; not ticketed |

### Remote sensing / geo (A/B, G-geo, M1/M3)

| Source | What | Access | Status | Notes |
|--------|------|--------|--------|-------|
| Copernicus Sentinel-2 L2A | 10 m multispectral | CDSE (ESA) account | **TODO** | G22 NEVER; M3 ghost patterns |
| Copernicus GLO-30 DEM | 30 m elevation | OpenTopography / CDSE | **PARTIAL** | Chankillo / geo nulls |
| NASA GEDI | Spaceborne LiDAR waveforms | Earthdata login | **TODO** | G29 NEVER |
| Zenodo Amazon earthworks | Point catalogs | Zenodo (e.g. 961) | **WIRED** | G-Amazon Mode A |
| jqjacobs geoglyph CSV/KML | ~1370 coords | Public sheets | **WIRED** | Amazon enrich |
| EAMENA | Heritage sites GeoJSON | Subsets | **WIRED** | G18 ley-null (n=80 Sistan) |
| Gorafe megalith CSV | Tombs + orientations | CC BY 4.0 | **WIRED** | G7 |
| OpenTopography | LiDAR / DEM | Account | **TODO** | Dense Amazon tiles scarce |
| USGS / NASA UAVSAR | Radar coherence | Free | **TODO** | Nazca scout note |

### Space / radio / heliophysics (R, N)

| Source | What | Access | Status | Notes |
|--------|------|--------|--------|-------|
| CHIME FRB Catalog 2 | Repeaters / periods | Open catalog files | **PARTIAL** | Periods recovered; real voltage path PARKED |
| MAST / TESS FFI | Lightcurves | MAST API (no key for many) | **PARTIAL** | G17/G20 pipeline; full MAST fetch often NEVER |
| Gaia DR3 | Astrometry | ESA Archive / Vizier | **WIRED** | G8 Betty Hill null |
| VASCO candidates | Vanishing-star plates | Zenodo `10.5281/zenodo.14563521` | **WIRED** | G13 |
| GOES X-ray | Solar flares 1-min | NOAA SWPC | **TODO** | M2 stream A |
| NMDB NEST | Neutron monitors | NMDB API / account | **TODO** | M2 |
| INTERMAGNET | 1 Hz geomagnetic vectors | Registration | **TODO** | M1/R2 |
| EMAG2v3 | Crustal magnetic grid | NOAA NCEI download | **TODO** | M1 |
| GOCE / ICGEM | Gravity geoid | ICGEM | **TODO** | M1 |
| IRIS TA infrasound | <20 Hz | IRIS | **TODO** | G23 DESIGNED |
| EURDEP | Gamma monitors | EU open | **TODO** | R2 screen |
| JPL Horizons | Ephemerides | Public API | **WIRED** | Astro nulls / Chankillo |
| Breakthrough Listen / BLC1 | RFI known-answer | Scoped; no TB mirror | **PARTIAL** | G-BLC1 synth + honest block |
| King+2012 α / Keck–VLT | Quasar Δα/α | Published tables | **WIRED** | G21 |

### Bio / all-domain (N)

| Source | What | Access | Status | Notes |
|--------|------|--------|--------|-------|
| GenBank / RefSeq FASTA | DNA/RNA controls | NCBI (optional key) | **WIRED** | N1 bio_probe |
| PURSUE portal | UAP videos/files | Public release | **PARTIAL** | N2 metadata; UI claims stronger than lab |
| Galileo Project arrays | Multimodal sensors | Limited public | **TODO** | Track N highlight only |
| POWO / botanical IIIF | Plant refs for Voynich | Kew etc. | **TODO** | G10++ NEVER |

### Classical anomalistics imagery (A/B)

| Source | What | Access | Status | Notes |
|--------|------|--------|--------|-------|
| BLT Research Team | Lab reports / metrics | Wayback + tables | **PARTIAL** | Structured JSON landed; originals scattered |
| Temporary Temples | Aerial masters | **RESTRICTED** purchase | **OWN**/buy | C1 Crabwood hi-res OWNER |
| Lucy Pringle / Getty | Aerials | **RESTRICTED** | — | No redistribution |
| Crop circle formation catalogs | Lat/lon / dates | Mixed public lists | **OWN** merge | → `formations.csv` |

---

## 2. Homegrown databases (we build)

These are **OWN** — schemas we define, agents write into, dashboard later reads.

| DB / catalog | Purpose | Format (proposed) | Status | Feeds |
|--------------|---------|-------------------|--------|-------|
| **Entropy Atlas** | Cross-mission H / z / verdict | `entropy_atlas.json` + `anomalies.json` | **WIRED** | ATLAS ticket; `atlas_query.py` |
| **Formations catalog** | Crop/geoglyph events + coords + dates | `formations.csv` / JSON | **PARTIAL** | M1, spatial_report |
| **BLT metrics table** | Node elongation, cavities, XRD claims | `blt_lab_metrics.json` | **WIRED** | M2 later |
| **Mission status board** | Ticket ID → verdict → paths | `mission_status.json` + MISSION_BOARD | **WIRED** | Agents |
| **Anomaly schema** | Shared verdict vocabulary | `anomaly_schema.json` | **WIRED** | Dashboard types |
| **Symbolseq corpus store** | Normalized streams per script | per-domain under `data/scripts/` | **PARTIAL** | M4 |
| **Negative-control library** | Shuffle / hoax / natural fixtures | `data/*/nulls/` | **PARTIAL** | All probes |
| **OSINT source registry** | This inventory + provenance | wiki + YAML (this page) | **OWN** ← you are here |
| **M-Engine run log** | Cross-stream job results | JSONL / Postgres later | **TODO** | M1–M4 |
| **Adjudication ledger** | Human/agent verdict history | JSONL → DB | **TODO** | Simulator / MCP |
| **Media asset index** | Hashes, license, attribution | SQLite/JSON | **TODO** | NOTICE / ATTRIBUTION |
| **API credential vault map** | Which key → which fetcher (no secrets) | [[api-keys]] | **OWN** | Ops |

Later (when standards lock): Postgres/SQLite for atlas + vector store for research notes — not required to start listing.

---

## 3. API keys & accounts checklist

Full env names → [[api-keys]]. Summary:

| Need | Env / account | Used by | Priority |
|------|---------------|---------|----------|
| Google AI Studio | `GEMINI_API_KEY` | Dashboard search + adjudication | **HAVE** (example) |
| Copernicus Data Space | CDSE login + token | Sentinel-2, GLO-30 | **HIGH** (G22/M3) |
| NASA Earthdata | Earthdata Login | GEDI, some MAST/LAADS | **HIGH** (G29) |
| OpenTopography | API key | LiDAR/DEM | MED |
| NMDB | Registration | Neutrons M2 | MED |
| INTERMAGNET | Institute registration | 1 Hz mag | MED |
| NOAA / SWPC | Often keyless | GOES X-ray | LOW |
| IRIS | Account for bulk | Infrasound G23 | LOW |
| NCBI | Optional `NCBI_API_KEY` | GenBank rate limits | LOW |
| GitHub | `GITHUB_*` | Private lab mirrors / PRs | Ops |
| Hugging Face | Optional token | Voynich mirror / models | LOW |

Do **not** commit secrets. `.env` gitignored.

---

## 4. OSINT & research portals

| Portal | Use | Notes |
|--------|-----|-------|
| Zenodo | Open datasets + DOI for our packs | Publish control frameworks here |
| CDS / VizieR | Astro catalogs | Gaia, published tables |
| NASA ADS / arXiv | Literature grounding | Adjudication cites |
| Wayback Machine | Dead lab sites (BLT) | Already used |
| cdli.earth search | Tablet IDs | Unstable API — keep Zenodo backup |
| Copernicus Browser / CDSE | EO browse + download | Account |
| Earthdata Search | NASA granules | GEDI/TESS adjacency |
| EAMENA portal | Heritage GeoJSON | Subset first |
| PURSUE | USG release media | Metadata triage |
| voynich.nu | EVA dumps + README | Prefer over IIIF day-one |
| OpenStreetMap / Overpass | Site context (not “ley proof”) | Careful nulls |
| Google File Search / grounding | Live lit search | Via Gemini tools |
| GitMCP / this wiki | Agent-readable lab memory | https://gitmcp.io/finasteos/ANOMALISTIK |

OSINT rules (lab):
1. Prefer **open + citable** dumps over scrapes.
2. Record license + retrieval date in `raw/` or domain README.
3. Never upgrade a claim from UI/OSINT alone — need probe + null.

---

## 5. Priority wiring order

1. **CDSE + Sentinel-2** → unblock G22 / M3  
2. **Earthdata + GEDI** → G29 (honest NEVER until then)  
3. **EMAG2 + GOCE downloads** (often file, not API) → M1  
4. **NMDB + GOES** → M2 when BLT timestamps trusted  
5. **Homegrown:** expand Entropy Atlas + formations catalog as the dashboard’s source of truth  
6. **Credential map** keep [[api-keys]] in sync when accounts are created  

---

## 6. How to extend this list

When adding a source, one row with: name · what · access · status · ticket/path.  
If it needs a secret → add a line to [[api-keys]] (name only).  
If we own the schema → section 2.
