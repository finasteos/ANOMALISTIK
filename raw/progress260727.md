# Progressrapport — Crop Circles Lab (2026-07-27)

> **Ställning:** Måt först. Gör inga påståenden om utomjordiska, avkodade budskap eller "utländska" ursprung utan BER/känd-svar-validering. **Structure ≠ Message.**

---

## Sammanfattning av status

Repot har två parallella spår:
- **Vete/Aker (A–B)** — klassisk akerbild-analys: geometri, fraktal, bitströmmar, BLT-lab, förensik — `TASKLIST.md`
- **Frontier anomalistik (N*/G*/R*)** — skrifttecken, radio, astro, geoglyfer, α-variation — `MISSION_BOARD.md`

Båda spåren är **gröna/landade** på `main` per 2026-07-27. Alla PR:er är mergade, tester gröna. Agenter är idla i väntan på nästa uppdrag från Captain.

**Senaste pushar (post progress260727):**
- **PR #40 (G2-REAL)** — Proto-Elamite CDLI live fetch: `FETCH_BLOCKED` (CDLI P008001 UNREACHABLE). Synth all_pass=True, Real all_pass=False.
- **PR #39 (G22)** — Nazca line_detect FPR-kalibrerad: `FPR_CALIBRATED` (power=100%, FPR_combined=1.67%). Endast syntetiska tiles. Ingen riktig Sentinel-2 data hämtad (NEVER_ATTEMPTED).

---

## A–B: Akerbild-kärnan (TASKLIST.md) — ALLA DONE ✅

| ID | Uppgift | Status | Leverans |
|----|---------|--------|----------|
| A1–A10 | CCAT-verktyg, forensik-carno, bildkorpus, preprocess, Crabwood/Chilbolton samplers, info-teori, BLT-arkiv, signal-prober | 🟢 **DONE** | `tools/ccat/`, `tools/forensics/`, `tools/signal/`, `outputs/` |
| B1 | Crabwood disk-crop + BER-sweep | 🟢 **DONE** | BER-golv ~0.45–0.49 (webb-upplösning) — C1 OWNER för TT-master |
| B2 | Chilbolton 73×23 grid + OCR | 🟢 **DONE** | `chilbolton_bbox.json`, structuredness_z≈24.5 |
| B3 | Preprocess: perspective + stubble-mask | 🟢 **DONE** | `tools/ccat/preprocess.py` CLI, Edmonton orto `edmonton_1999_ortho.png` |
| B4 | Cirkel-extraktion (Julia ~151 cirklar) | 🟢 **DONE** | `tools/ccat/circle_extract.py`, syntetisk 150/150, verklig ≈152 |
| B5 | BLT-lab texter → strukturerade tabeller | 🟢 **DONE** | `data/catalog/blt_lab_metrics.json` + `outputs/blt_lab_summary.md` |
| B6 | Känd-bluff vs kandidat klassificerare | 🟢 **DONE** | Feature-tabell CSV, explorativt (inga äkthetspåståenden) |
| B7 | Spatiell/temporal katalog CSV | 🟢 **DONE** | `formations.csv`, `coordinates.json`, `spatial_report.py` |
| B8 | Vision-LLM triage (lokalt LM Studio) | 🟢 **DONE** | ≥3 Qwen2.5-VL JSON under `outputs/vision/` |
| B9 | Grid-strukturanalys (GLYPH-fråga) | 🟢 **DONE** | `tools/ccat/grid_analyze.py` + 6/6 tester, Chilbolton z≈24.5 |
| B10 | ELA/manipulationsskärm (Pillow) | 🟢 **DONE** | `tools/ccat/ela_screen.py`, batch på Chualar+Julia+Crabwood+Chilbolton |
| B11 | Klassisk-chiffer NEGATIV KONTROLL | 🟢 **DONE** | `tools/ccat/cipher_negcontrol.py` — inget engelskt chiffer på Crabwood/Chilbolton |

**Blockerade/Ägare (C):**
- C1: High-res Crabwood master — **OWNER** (Temporary Temples köp)
- C2: Cherhill 1993 järnglas-mikrografer — **PARTIAL** (DOI/text ärkiverat, PDF/EDS OWNER)
- C3: True overhead Logan/Eltopia hi-res — **BLOCKED** (ej funnet publikt)
- C4: TT/Lucy/Getty bilder — **OWNER** (juridisk, ingen redistribution)

---

## N*/G*/R*: Frontier anomalistik (MISSION_BOARD.md) — ALLA MERGED ✅

### Radioprober (R1, G3, G19, G-BLC1)
| ID | Uppdrag | Status | Viktigaste resultat |
|----|---------|--------|---------------------|
| **R1** | Radio probe + fetchers (FFT/epoch-fold) | 🟢 **DONE** | Wow blockerad; Vela/FRB PARK |
| **R1++ / G-BLC1** | CHIME Cat 2 perioder (Ozma) | 🟢 **PR #3 MERGED** | Återvinner 16.35 d (20180916B) + 157 d (20121102A); scramble null; real path PARKED |
| **G3** | Wow! beam-fit (Gaussian/sinc) | 🟢 **LANDED** | r²=0.986 men **UNDERDETERMINED** (N=6, 3 d.f.) — kan inte skilja horn-beam från transient eller H-moln |
| **G19** | Long Delayed Echoes historisk serie | 🟢 **MERGED PR #25** | Lunan-påstående **CLAIM_FAILS_NULL** (p_shuffle=1.0); corpus UNDERDETERMINED |

### Skrifttecken / Symbol-sekvenser (G1, G4, G9–G12, G15, G16)
| ID | Skriftsystem | Status | Verdikt |
|----|--------------|--------|---------|
| **G1** | Linear A | 🟢 **MERGED** | z≈−14 + period-3 refräng → **SEQUENCE_STRUCTURE** |
| **G4** | Rongorongo 2D (Spaelti) | 🟢 **MERGED PR #?** | 5279 tecken, z=−42.9 cond-H vs shuffle. **240 parallella passager** (33 cross-tablet, z=+40.9). Toppformel `380 001 022f` ×7 över C+E. **SEQUENCE_STRUCTURE \| PARALLEL_EXCESS \| CROSS_TABLET_PARALLELS** |
| **G9** | Indus (ASR/M77) | 🟢 **MERGED PR #9** | 179 sekvenser, z=−22.9 cond-H; z=−27 graf-null. P122+P385 ×29. **STRUCTURE_SIGNAL** (endast Mohenjo-daro) |
| **G9++** | Indus West negcontrol (Kimi) | 🟢 **MERGED PR #35** | **FIXTURE_ONLY \| NEGCONTROL_PASS** (d_ta/d_ref≈73, d_te/d_ref≈74). Real West/Tamil/Telugu NEVER_ATTEMPTED |
| **G10** | Voynich morfologi (struktur) | 🟢 **MERGED PR #12** | **SEQUENCE_STRUCTURE \| CLAIM_FAILS_NULL**; glyph z≪0; 32/32 tester |
| **G10++** | Voynich botanik × CCAT (Freebuff) | 🟢 **MERGED PR #34** | **FIXTURE_ONLY \| SHAPE_STRUCTURE**; syntetiska KA + 4 nuller; IIIF/POWO NEVER_ATTEMPTED; 25/25 tester |
| **G11** | Cypro-Minoan allografi/media | 🟢 **MERGED PR #11** | **STRUCTURE_SIGNAL \| MEDIA_DRIVEN_ALLOGRAPHY**; z≈−28.95; tablet↔other J≈0.53 |
| **G12** | Linjär Elamitiska entropy bounds | 🟢 **MERGED PR #13** | **SEQUENCE_STRUCTURE \| CLAIM_UNDERDETERMINED \| ACCOUNTING_FORMAT_STRUCTURED \| SCRIPT_INVARIANT_COMMON**; monumentalt INVERSE_CONTROL_OK \| CLAIM_FAILS_NULL; language_family_claim_made=false; 31/31 tester |
| **G12++** | LE ↔ PE ↔ Uruk komparator | 🟢 **MERGED** | Alla 4 bokförings-invariant **PASS** på alla tre skriftsystem → **delat redovisningstablett-format, INTE skriftsläkt** |
| **G15** | Kretisk hieroglyfisk bipartit admin | 🟢 **MERGED PR #15** | **UNDERDETERMINED** z≈−2.7; synthetisk Evans-corpus (CHIC ej licensierad); forbidden-phrase guard |
| **G16** | Merotitiska (Otten 2025) | 🟢 **MERGED PR #14** | **STRUCTURE_SIGNAL**; z=−11336 corpus; royal KA z=−9467; neg PASS z=−1.41; 20/20 tester |

### Geoglyfer / LiDAR / Arkeoastro (G7, G13, G14, G17, G18, G-Amazon)
| ID | Uppdrag | Status | Verdikt |
|----|---------|--------|---------|
| **G7++** | Gorafe megaliter (soluppgång + dal-null) | 🟢 **MERGED PR #4** | **ORIENTATION_STRUCTURE \| CONTROL_SEPARATED \| SPATIAL_CLUSTER_UNDERDETERMINED \| PER_TOMB_UNDERDETERMINED**; per-grav z≈7 @15°; convex-hull NND z=−15.6 |
| **G13** | VASCO optiska transients klustring | 🟢 **MERGED PR #16** | **STRUCTURE_SIGNAL** men **plate-artifact null ej avvisad** (|z|<3 för close-pairs vs plate null) |
| **G14** | Chankillo Tretton Torn | 🟢 **MERGED PR #17** | **ORIENTATION_STRUCTURE \| LUNAR_UNDERDETERMINED \| CONTROL_NOT_SEPARATED**; solstice bracketerade (marginal 18.3°); syntetisk-ridge null 22% bracketerar också |
| **G17** | TESS SN 1987A SETI Ellipsoid | 🟢 **MERGED PR #27** | **PIPELINE_VALIDATED \| UNDERDETERMINED** (ingen MAST-fetch); KA Z²≈56.5; kohort 0/32 anomala; Ulfberht gate PASS |
| **G18** | EAMENA ley-line null (Sistan n=80) | 🟢 **MERGED PR #24** | **FPR_CALIBRATED**; struktur ≠ ley-budskap |
| **G-Amazon** | Amazon Mode A (Ulfberht) | 🟢 **MERGED PR #1** | **STRUCTURE_ONLY**; Zenodo 961 + jqjacobs cross-check; NN/Ripley vs CSR |
| **G-Amazon-NEG** | Hecklefish #6 LiDAR negativer (Kimi) | 🟢 **MERGED PR #23** | **FPR_CALIBRATED** (power 100%, FPR_combined 1.67%); real LiDAR **UNDERDETERMINED** |
| **G22** | Nazca line_detect FPR kalibrering | 🟢 **MERGED PR #39** | **FPR_CALIBRATED** (power=100%, FPR_combined=1.67%). **FIXTURE_ONLY** — inga riktiga Sentinel-2 tiles (NEVER_ATTEMPTED). Sentinel-2 (10 m GSD) UNDERDETERMINED för figurativa reliefs <50 m. |

### Astrofysik / Fundamental fysik (G20, G21, N3, N4++)
| ID | Uppdrag | Status | Verdikt |
|----|---------|--------|---------|
| **G20** | Boyajian-stjärnan TESS epoch-fold | 🟢 **MERGED PR #26** | **DIP_STRUCTURE** (KA 24.5 d, Z²≈60 vs null 95th≈13.3); 41 tester |
| **G21** | Finstrukturskonstant α riktningstvariation | 🟢 **MERGED PR #32** | **INSTRUMENT_SYSTEMATICS_NULL_NOT_REJECTED \| UNDERDETERMINED \| BEST_FIT_NEAR_KNOWN_DIPOLE \| STRONG_NULL_SEPARATION_2OF4**; VLT-driven (Keck z=−0.44, VLT z=+2.11, VLT bootstrap z=−0.27); 24/24 tester |
| **N3** | Dimensionslösa konstanter (Hermes) | 🟢 **LANDED** | Nulls ≈ chans; Null B degenererad; stress-sweep logik dokumenterad |
| **N4++** | Astro caveats harden (Opencode) | 🟢 **MERGED PR #10** | Validerad sol_lon_deg; kalenderetikett orelevant förr än −2000; axis Δaz (Stonehenge/Chichén citerade); Göbekli/Giza azimut-only; **ingen justeringsignal**; 20/20 tester |

### Bio / UAP (N1, N1++, N2)
| ID | Uppdrag | Status | Verdikt |
|----|---------|--------|---------|
| **N1** | DNA/RNA bio_probe (Minimax) | 🟢 **LANDED** | Biologi ≠ budskap |
| **N1++** | bio_probe hardens (Cursor) | 🟢 **MERGED PR #6** | Chrom-match + short-seq-status + introniska + NumPy shuffle; 33/33 tester |
| **N2** | UAP flyggkonsekvens (Opencode) | 🟢 **LANDED** | Officiella WebMs; metadata-fattigdom kvarstår |

### Arkiv / Betty Hill (G8)
| ID | Uppdrag | Status | Verdikt |
|----|---------|--------|---------|
| **G8** | Betty Hill × Gaia stjärnkarta | 🟢 **MERGED** | **UNDERDETERMINED** (Hill z≈−2.0 <3σ); Stora Björn/Orion KA separata; selection-bias caveat |

### Proto-Elamite CDLI Live Fetch (G2-REAL) — NYTT PR #40
| ID | Uppdrag | Status | Verdikt |
|----|---------|--------|---------|
| **G2-REAL** | Proto-Elamite CDLI live fetch | 🟢 **MERGED PR #40** | **FETCH_BLOCKED** — CDLI P008001 UNREACHABLE (0 tokens). Synth all_pass=True, Real all_pass=False. Invariant-match: header_numeral_void ✓, header_fraction_bounded ✗, numeral_block_predictable ✓, z_lock_vs_shuffle ✗. Endast 1 tablet begärd, 0 hämtade. |

---

## Atlaskartläggning (ATLAS) — 🟢 MERGED PR #37
- **Entropi-atlas + anomaly-schema** ifyllda från 25 `outputs/*/run.json`
- `data/catalog/{entropy_atlas,anomaly_schema}.json`
- `tools/scripts/atlas_query.py` (list/find/get)
- **Uppgraderar INGA verdikter** — bara katalogiserar

---

## Nyckel-filosofi & Regler (alla mergade PR:er följer detta)

1. **Structure ≠ Message** — entropi/struktur/periodicitet är nödvändiga men **aldrig tillräckliga** för avsiktspåståenden
2. **Negativ kontrollregel** — varje signal måste skiljas från: (a) shuffle/random, (b) känd bluff/mänsklig konst, (c) känd naturanalog
3. **Förbjudna fraser** — kodgranskning loggar varningar vid: "avkodad", "översätts till", "bekräftar utomjordiska", "99% avkodad", etc.
4. **NEVER_ATTEMPTED** — när data saknas (t.ex. IIIF/POWO, MAST, riktig LiDAR) står det explicit `NEVER_ATTEMPTED`, inte "misslyckades"
5. **Scope Lock** — en ticket = en branch = en PR; ingen köksmössa-diffs
6. **Merge gate** — författare ≠ ensam mergare; godkännare = Captain **eller** Cursor **eller** Ulfberht-if-not-author

---

## Nämnda agenter (roller)

| Agent | Roll | Status |
|-------|------|--------|
| **Ulfberht** | Reviewer/steward (Amazon Mode A) | 💤 idle |
| **Ozma** | Radio/BLC1/CHIME Cat 2 | 💤 idle |
| **Opencode** | Frontier G1, G4, G7, G8, G9, G13, G14, G16, G17, G20, G21, N2, N4 | 💤 idle |
| **Minimax M3** | Proto-Elamite, Linjär Elamitiska, Voynich, Radio scaffold | 💤 idle |
| **Cursor** | Merge gate på `main`; B1/B2/B10/B11/B8 lokalt; G9++, G10++, G15, G17, G18, G20, G21, N1++, G2-REAL, G22 | 🟢 **merge-gate aktiv** |
| **Freebuff** | G15, G18, G-Amazon-NEG, G10++ | 💤 idle |
| **Kimi** | Research leads, G9++, G-Amazon-NEG, G10++ | 💤 idle |
| **Captain (Pelle)** | Assignerare + Gemini/Kimi research; sudo `))))` | 🧠 aktiv |

---

## Nästa steg (Captains beställning väntas)

- **Inga blockerande uppgifter** — allt landat/mergat
- Alla agenter står i **idle** läge
- Nästa forskningsled publiceras via `docs/*.md` (Gemini/Kimi scouts) → Captain tilldelar nästa ticket
- Förslag från roadmap: **Nazca Lines** (snabbast vinst), **Phaistos-skivan** (bitstream redan klar), **FRB 121102 / Wow!** (radio_probe på publika serier)

---

## Viktiga filsökvägar

| Syfte | Sökväg |
|-------|--------|
| Mission board (frontier) | `MISSION_BOARD.md` |
| Akerbild-tasks (vete) | `TASKLIST.md` |
| Roadmap | `ROADMAP_BEYOND_WHEAT.md` |
| Dashboard (HTML) | `reports/mission_dashboard.html` |
| Outputs (alla run.json/NOTES.md) | `outputs/<domain>/` |
| Data katalog | `data/catalog/` |
| Verktyg (CCAT, forensik, signal) | `tools/ccat/`, `tools/forensics/`, `tools/signal/` |
| Prober (skript per ticket) | `tools/scripts/<ticket>*.py` |

---

## Sammanfattning i en mening

**Allt som planerats är klart, mergat och testat. Inga bluff-påståenden överlevde null-kontroller. Varje signal som "ser ut som struktur" visade sig antingen vara (a) förklarad av instrument/geometri, (b) underbestämd (för lite data), eller (c) struktur men ingen tolkning. Labbet står redo för nästa Captain-uppdrag.**

---

*Senast uppdaterad: 2026-07-27 — `progress260727.md` (inkl. PR #39 G22 Nazca + PR #40 G2-REAL Proto-Elamite CDLI)*