# Implementation Plan: Declassified UAP Archives & NASA Apollo Photogrammetry Ingestion
**Date:** August 17, 2026

Integrate the newly unpacked 375 declassified intelligence files (15.9 GB) and real NASA Apollo mission frames into `ANOMALISTIK`:
1. **Server API**: Mount `/api/declassified/images` and `/api/declassified/catalog`.
2. **Apollo Photogrammetry**: Add frame switcher (`Apollo 17 VM-6 1972`, `Apollo 12 VM-1..5`) and real image analysis canvas in `GeophysicsAstroSection.tsx`.
3. **Declassified Archives Triage Bench**: Create `DeclassifiedArchiveSection.tsx` with search, agency filters, and 1-click preview.
4. **Navigation**: Add to `App.tsx` and `Sidebar.tsx`.
