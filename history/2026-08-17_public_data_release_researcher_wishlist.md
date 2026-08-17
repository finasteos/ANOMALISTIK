# Open-Access Researcher Wishlist: Skinwalker Ranch Raw Telemetry Specifications
**Document ID:** `2026-08-17_public_data_release_researcher_wishlist.md`  
**Date:** August 17, 2026  
**Subject:** Open-Access Telemetry Specifications & Ideal Data Format Requirements for Independent Anomaly Adjudication  
**Framework:** ANOMALISTIK — Universal Entropy Atlas & Integrated Laboratory Suite  

---

## Executive Summary & Target Audience

To maximize the scientific utility of the public raw data release by Skinwalker Ranch's leadership, this specification outlines the exact file formats, sampling rates, metadata conventions, and calibration parameters required by the independent scientific community.

Providing raw, uncompressed, and timestamp-synchronized sensor streams allows global research nodes to execute **Layer 1 Fisher-Yates shuffle nulls**, **Bayesian hypothesis testing**, and **multimodal triangulation** with cryptographic verification.

---

## 1. The 7 Essential Telemetry Streams & Format Wishlist

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          ANOMALISTIK SCIENTIFIC DATA WISHLIST                               │
├─────────────────────────┬──────────────────────────┬────────────────────────────────────────┤
│ Sensor Domain           │ Target Format            │ Sampling Rate / Resolution             │
├─────────────────────────┼──────────────────────────┼────────────────────────────────────────┤
│ 1. RF Spectrum (SDR)    │ SigMF (.sigmf-data)      │ ≥ 40 MS/s Complex I/Q (1.6 & 2-5 MHz)  │
│ 2. Gamma / Radiation    │ ANSI N42.42 (.n42) / CSV │ Microsecond Event List-Mode (0–10 MeV) │
│ 3. 3D LiDAR & Drone RTK │ LAS/LAZ & RINEX (.rnx)   │ Raw GNSS Pseudo-Range + C/N0 SNR Logs  │
│ 4. Subsurface GPR       │ SEG-Y (.sgy) / GSSI .dzt │ Unfiltered Time-Domain Radargrams      │
│ 5. Thermal Radiometric  │ 14-bit SEQ / Raw TIFF    │ 640x512 @ 60 Hz Radiometric IR (31 ft) │
│ 6. Materials SEM / XRF  │ EMSA-MAS (.emsa) / SPC   │ Raw X-Ray Photon Channel Counts        │
│ 7. 3-Axis Magnetometry  │ 100 Hz CSV / INTERMAGNET │ High-Rate Vector Bx, By, Bz (nT)       │
└─────────────────────────┴──────────────────────────┴────────────────────────────────────────┘
```

### 1. Raw RF Spectrum (Software Defined Radio I/Q Dumps)
- **Standard:** **SigMF (Signal Metadata Format)** with JSON sidecar metadata.
- **Bands:** 
  - $1.610\text{--}1.625\text{ GHz}$ (L-Band anomaly corridor)
  - $2.0\text{--}5.0\text{ MHz}$ (Non-local EMP coupling frequencies)
- **Requirements:** 16-bit complex integer (I/Q), minimum $40\text{ MS/s}$ bandwidth, GNSS-disciplined PPS time-tags.

### 2. High-Energy Dosimetry & Gamma Spectrometry
- **Standard:** **ANSI N42.42 XML** or List-Mode binary files.
- **Data:** Individual photon arrival timestamps ($\Delta t \le 1\mu\text{s}$) and multichannel analyzer (MCA) channel indices ($0.01\text{ to }10\text{ MeV}$).
- **Purpose:** Eliminates cosmic ray muon coincidences and proves sterile radiation burst characteristics.

### 3. Atmospheric LiDAR & Drone Flight Telemetry
- **Standard:** Uncompressed **LAS / LAZ 1.4** point clouds + **RINEX (Receiver Independent Exchange Format)** for GNSS.
- **Data:** Raw L1/L2 satellite carrier-to-noise ratio ($C/N_0$), cycle slips, Doppler shifts, and internal flight controller IMU register dumps.
- **Purpose:** Disentangles digital kill commands from physical electromagnetic metric warping at $3,271\text{ ft}$ AGL.

### 4. Subsurface GPR & Seismic Reflection
- **Standard:** **SEG-Y (.sgy)** or uncompressed GSSI **.dzt** files.
- **Target:** 30–500 ft Mesa boring transects and the 50-meter subterranean cigar boundary.
- **Requirements:** Zero bandpass filtering or gain curve smoothing in the raw export; separate coordinate metadata file.

### 5. Radiometric Infrared & Multispectral Feeds
- **Standard:** 14-bit uncompressed radiometric **.seq** or multi-frame calibrated **TIFF**.
- **Target:** The 31-foot hovering portal coordinate and the Triangle ridge.
- **Data:** Per-pixel absolute temperature calibration tables ($^\circ\text{C}$ / Kelvin).

### 6. Metallurgy & Materials Analysis
- **Standard:** **EMSA/MAS Spectral Data File Format (.emsa)** and raw XRD two-theta diffraction arrays.
- **Samples:** Mesa core drill fragments ($50/50\text{ Fe-Al}$, $\text{Te}$, $\text{Eu}$) and historical "Art's Parts".
- **Purpose:** Allows independent Rietveld refinement, stoichiometric ratio calculation, and confirmation of $0.00\%\text{ Ni}$.

### 7. High-Rate Vector Geomagnetism
- **Standard:** INTERMAGNET-compliant 100 Hz ASCII/CDF.
- **Metrics:** $B_x, B_y, B_z$ in nanoTeslas ($\text{nT}$) with baseline drift calibration parameters.

---

## 2. Ingestion & Integration Plan
This wishlist is embedded directly into the live feed of the `DataVerificationSection` so anyone accessing the ANOMALISTIK platform or telemetry stream can review, export, and utilize these specifications.
