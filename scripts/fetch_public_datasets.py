#!/usr/bin/env python3
"""
ANOMALISTIK Public Dataset Ingestion Script
Downloads open-source geophysical, heliophysical, and astronomical datasets
into local /data directory for offline correlation modeling.
"""

import os
import sys
import argparse
import urllib.request
import json
import time
import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "downloads")
os.makedirs(DATA_DIR, exist_ok=True)
PROVENANCE_PATH = os.path.join(DATA_DIR, ".provenance.json")


def record_provenance(filename: str, provenance: str):
    """TASKLIST D1: track live vs synthetic per file so mocks never masquerade."""
    try:
        prov = {}
        if os.path.exists(PROVENANCE_PATH):
            with open(PROVENANCE_PATH) as f:
                prov = json.load(f)
        prov[filename] = {"provenance": provenance, "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
        with open(PROVENANCE_PATH, "w") as f:
            json.dump(prov, f, indent=2)
    except Exception as e:
        print(f"    ⚠️ Could not record provenance: {e}")

DATASETS = [
    {
        "name": "NOAA EMAG2v3 Earth Magnetic Anomaly Grid (Sample)",
        "filename": "emag2v3_sample.csv",
        "url": "https://www.ngdc.noaa.gov/geomag/data/emag2/v3/emag2v3_sample.csv",
        "mock_content": "lat,lon,mag_anomaly_nT\n40.1,-109.8,124.5\n40.2,-109.7,-45.2\n40.3,-109.6,88.9\n"
    },
    {
        "name": "GOCE / ICGEM Global Gravity Grid (Sample)",
        "filename": "goce_gravity_sample.csv",
        "url": "https://icgem.gfz-potsdam.de/GOCE_sample.csv",
        "mock_content": "lat,lon,gravity_mgal\n40.1,-109.8,-210.4\n40.2,-109.7,-198.2\n40.3,-109.6,-205.1\n"
    },
    {
        "name": "NOAA DSCOVR Solar Wind 1-Min Plasma Archive (Sample)",
        "filename": "dscovr_solar_wind_sample.json",
        "url": "https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json",
        "mock_content": json.dumps([
            {"time_tag": "2026-08-16 20:00:00.000", "density": 8.4, "speed": 425.2, "temperature": 95000},
            {"time_tag": "2026-08-16 20:05:00.000", "density": 12.1, "speed": 480.6, "temperature": 110000}
        ], indent=2)
    },
    {
        "name": "CHIME FRB Catalog 2 Repeaters (Sample)",
        "filename": "chime_frb_cat2_sample.json",
        "url": "https://www.chime-frb.ca/catalog/frb_cat2_sample.json",
        "mock_content": json.dumps([
            {"frb_name": "FRB 20180916B", "ra": 28.5, "dec": 65.7, "dm": 348.8, "period_days": 16.35},
            {"frb_name": "FRB 20121102A", "ra": 82.9, "dec": 33.1, "dm": 557.1, "period_days": 157.0}
        ], indent=2)
    }
]

def download_datasets(strict: bool = False):
    print("==================================================")
    print("  ANOMALISTIK OPEN-SOURCE DATASET INGESTION TOOL  ")
    print("==================================================")
    print(f"Target Directory: {DATA_DIR}\n")

    failures = 0
    for ds in DATASETS:
        dest_path = os.path.join(DATA_DIR, ds["filename"])
        print(f"[+] Processing: {ds['name']}")
        try:
            # Attempt live HTTP request
            print(f"    Fetching from URL: {ds['url']} ...")
            req = urllib.request.Request(ds["url"], headers={'User-Agent': 'ANOMALISTICS/2.0'})
            with urllib.request.urlopen(req, timeout=10) as response, open(dest_path, 'wb') as out_file:
                out_file.write(response.read())
            record_provenance(ds["filename"], "live")
            print(f"    ✅ Downloaded successfully to {ds['filename']}\n")
        except Exception as e:
            if strict:
                print(f"    ❌ LIVE fetch failed and --strict forbids offline cache: {e}")
                failures += 1
                continue
            print(f"    ⚠️ Remote endpoint restricted/offline ({e}). Writing SYNTHETIC offline cache...")
            with open(dest_path, 'w') as f:
                f.write(ds["mock_content"])
            record_provenance(ds["filename"], "synthetic")
            print(f"    ✅ SYNTHETIC offline cache created: {ds['filename']} (see .provenance.json)\n")

    print("==================================================")
    if failures:
        print(f"  INGESTION FAILED for {failures} dataset(s) (--strict).")
        print("==================================================")
        sys.exit(1)
    print("  DATASET INGESTION COMPLETE. ALL FILES READY.   ")
    print("==================================================")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="ANOMALISTICS public dataset ingestion")
    ap.add_argument("--strict", action="store_true",
                    help="Fail instead of writing synthetic offline caches (TASKLIST D1)")
    download_datasets(strict=ap.parse_args().strict)
