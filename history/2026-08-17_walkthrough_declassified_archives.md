# Walkthrough: Declassified UAP Archives & NASA Apollo Photogrammetry Integration
**Date:** August 17, 2026

We have integrated the **375 declassified US intelligence archives (15.92 GB uncompressed)** into `ANOMALISTIK` and directly connected the empirical NASA Apollo 12 & 17 mission lunar photography into the **Photogrammetry & Flare Elimination Engine**.

---

## 1. 🚀 Empirical NASA Apollo Mission Photography in Photogrammetry Engine
**Location**: `src/components/GeophysicsAstroSection.tsx` *(Tab: Apollo 17 Blue Lights (#20))*

- **Direct High-Res Image Ingestion**:
  - `nasa-uap-vm6-apollo-17-1972.jpg` (Apollo 17 Mission Lunar Orbital Frame)
  - `nasa-uap-vm1-apollo-12-1969.jpg` through `vm5` (Apollo 12 Mission Frames)
- **Live Optical Filter Shaders**:
  - `Raw 70mm Scan`: Unmodified NASA archival scan.
  - `450nm Monochromatic Blue Isolation`: Enhances monochromatic blue emission lines.
  - `Sobel Edge Gradient`: Inverse edge gradient contour extractor.
  - `3-Point Triangulation Geometry`: Dynamic HUD vector overlay with vertex markers.

---

## 2. 📂 Declassified UAP Archives Triage Bench (375 Files)
**Location**: `src/components/DeclassifiedArchiveSection.tsx` *(Sidebar: `Declassified UAP (375)`)*

- **Indexed 375 Declassified Files across 5 Releases**:
  - **Release 1**: NASA Apollo Lunar Orbital Frames & Project Blue Book historical PDFs.
  - **Release 2**: DoD sensor video telemetry (`.mp4`), CIA Intelligence USSR 1973 reports, and Sandia National Labs correspondence.
  - **Release 3**: FBI forensic incident renderings.
  - **Release 4**: US Navy Range Fouler pilot debriefs (2019–2020 Atlantic & Eastern US) and Los Alamos Conference on Aerial Phenomena (1949).
  - **Release 5**: 1947 Scandinavian Ghost Rocket intelligence reviews and Air Materiel Command (AMC) reports.
- **Search & Filtering**:
  - Instant search across filenames, agencies, and mapped ANOMALISTIK analytical engines.
  - Category filters: `🚀 NASA Apollo`, `⚓ US Navy / DoD`, `☢️ DOE / Sandia`, `📜 1947 Ghost Rockets & AMC`, `🖼️ Images`, `📄 Documents`, `🎥 Videos`.
  - Image preview modal for photographic files with 1-click routing to the photogrammetry engine.

---

## 3. 🌐 Backend Server API Extensions
**Location**: `server.ts`

- `GET /api/declassified/catalog`: Returns full 375-file JSON metadata index.
- `/api/declassified/images`: Serves static high-res mission photography frames.

---

## 4. 🧪 Build & Verification
- `npm run build` $\rightarrow$ **Clean build in 4.03s (0 errors)**.
