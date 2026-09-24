# Declassified Triage — 375 files / 17.1 GB (TASKLIST M5, started 2026-09-25)

Source: `data/declassified_archive_index.json` (index of `UFOFiles-Release1..5.zip`, blobs not in repo).
Computed locally with Python `Counter` — no sampling, full census.

## Census

| Release | Files |
|---|---|
| Release1 | 158 |
| Release2 | 63 |
| Release3 | 72 |
| Release4 | 40 |
| Release5 | 42 |
| **Total** | **375 (17.1 GB uncompressed)** |

## By type

| Type | n | Note |
|---|---|---|
| PDF documents | 212 | Blue Book correspondence, DOD/NARA scans |
| MP4 video | 133 | mostly DOD range footage, multi-GB each |
| Images (JPG/PNG) | 30 | Apollo frames + FBI photos (`declassified_sample/`) |

## By ANOMALISTICS mapping (heuristic filename match)

| Mapping | n | Engine |
|---|---|---|
| General Archival (unmapped) | **213 (57%)** | — triage gap |
| PURSUE & aerodynamic triangulation (N2-ext) | 139 | range-fouler/DOD videos |
| Apollo 17 photogrammetry (#20) | 13 | `/api/declassified/images` subset |
| Nuclear forensics (G31/G33) | 6 | Sandia/Pantex/DOE |
| Cold War epigraphy (G32) | 4 | ghost-rocket/Blue Book |

## Largest single files

- `videos/DOD_111764796-1920x1080-9000k.mp4` — 3.2 GB (Release3)
- `videos/DOD_111764902-1920x1080-9000k.mp4` — 1.3 GB (Release3)
- `pdfs/DOW-UAP-D096_…Blue-Book_1955.pdf` — 608 MB (Release4)
- 2× ~0.5 GB DOD videos (Release2)

## Findings & next steps

1. **The 213 unmapped are the mystery backlog.** Filename heuristics miss them — needs content triage (PDF text extract + video keyframes), not better regexes.
2. **Video dominates bytes, PDF dominates count.** OCR the 212 PDFs first (cheap, high recall for Blue Book/NARA leads); keyframe the 133 MP4s second.
3. **Apollo subset (13) is already served** via `/api/declassified/images` — link remaining Apollo frames from the index into the photogrammetry engine (M5 remainder).
4. **Crowdsource labels**: expose `mapping` as editable triage queue in `DeclassifiedArchiveSection` (table already caps at 100 — paginate first, F5 remainder).
