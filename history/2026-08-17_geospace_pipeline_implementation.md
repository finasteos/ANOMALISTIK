# Geospace Multi-Source Pipeline — Implementation Log
**Datum:** 2026-08-17  
**Session:** ANOMALISTIK Data Ingestion Expansion

## Mål
Bygga ett Python-script för automatisk nedladdning och tidsstämpelsynkronisering
av geofysiska, heliofysiska och astrofysiska dataset enligt prioriteringslistan.

## Implementerade Datakällor

| Prioritet | Källa | Status | Klass | API-typ |
|-----------|-------|--------|-------|---------|
| 1 | NOAA SWPC DSCOVR (mag + plasma) | ✅ LIVE | `DSCOVRFetcher` | JSON REST |
| 2 | INTERMAGNET (BOU/HER/KAK/NGK/ABK) | ✅ (m. synthetic fallback) | `INTERMAGNETFetcher` | IAGA-2002 REST |
| 3 | EIDA/GFZ Seismik (FDSN) | ✅ (REST + ObsPy) | `EIDAFetcher` | FDSN WebServices |
| 4 | MAST/TESS Ljuskurvor | ✅ (kräver astroquery) | `MASTFetcher` | astroquery.mast |
| 5 | GOCE/ICGEM Gravitationsmodeller | ✅ (public GFC) | `GOCEFetcher` | ICGEM HTTP |

## Scriptfil
`scripts/fetch_geospace_sync.py`

## Verifierat Live Test
- DSCOVR mag + plasma: **3548 / 3554 rader** hämtade från NOAA SWPC (2026-08-10→17)
- Sync @ 5min grid: **288 rader × 48 kolumner**
- Output: `data/synced/geospace_sync_2026-08-17.parquet` (78 KB) + CSV (108 KB)
- Manifest: `data/synced/manifest_2026-08-17.json`

## Installerade Paket
- `pyarrow 25.0.1` — Parquet-stöd
- `pandas`, `numpy`, `requests` — redan installerade

## Nästa Steg
- [ ] Installera `obspy` för live seismisk waveform-parsing
- [ ] Lägg till ESA EO-credentials i `.env` för GOCE dynamiska produkter
- [ ] Installera `astroquery` + `astropy` för TESS-data
- [ ] Lägg till INTERMAGNET 1-sekunds-data (--mag-cadence second)
- [ ] Integrera synkroniserad data med ANOMALISTIK-frontenden

## Använda URLs
- DSCOVR: https://services.swpc.noaa.gov/json/rtsw/
- INTERMAGNET: https://imag-data.bgs.ac.uk/GIN_V1/GINServices
- EIDA: https://geofon.gfz-potsdam.de + https://service.iris.edu
- MAST: https://mast.stsci.edu (via astroquery)
- ICGEM: http://icgem.gfz-potsdam.de/getmodel/gfc

---

## Uppdatering: Venv + Fullständigt Pipelinetest (03:09 UTC+2)

### Installerade paket i `.venv` (Python 3.14.4)
| Paket | Version |
|-------|---------|
| numpy | 2.5.2 |
| pandas | 3.0.5 |
| pyarrow | 25.0.1 |
| requests | 2.34.2 |
| astropy | 8.0.1 |
| astroquery | 0.4.11 |
| cdflib | 1.3.12 |
| obspy | 1.5.0 |

Alla flaggor: `HAS_REQUESTS=True, HAS_NUMPY=True, HAS_PANDAS=True, HAS_CDFLIB=True, HAS_ASTROQUERY=True, HAS_OBSPY=True`

### Live-test: 7 streams, 1-min grid, 2026-08-16
```
DSCOVR mag_7day:   3 528 rader  ✅ LIVE
DSCOVR plasma_7day: 3 536 rader ✅ LIVE
INTERMAGNET BOU:   syntetisk baseline (definitiv data ej klar än — normalt)
INTERMAGNET HER:   syntetisk baseline
INTERMAGNET KAK:   syntetisk baseline
EIDA II.BFO.BHZ:   1 728 000 sampel @ 20 sps ✅ LIVE
EIDA IU.ANMO.BHZ:  1 133 395 sampel ✅ LIVE
Synced @ 1min:     1 503 rader × 62 kolumner
```

### Filar skapade
- `data/synced/anomalistik_geospace_test_2026-08-17.parquet` 
- `data/synced/anomalistik_geospace_test_2026-08-17.csv`

### Fix tillagd
- INTERMAGNET `data_type="auto"`: väljer automatiskt `variation → quasi-definitive → definitive`
  beroende på hur gammalt datumet är. Löser 400-fel för färsk data.

### MAST-token
- Gammal URL `auth.mast.stsci.edu/tokens` är nedlagd sedan 2024
- Anonym åtkomst fungerar fullt ut för TESS-nedladdningar (inga creds behövs)
- Om token önskas: `https://mast.stsci.edu` → logga in → API Tokens
