# Mesa Numbers Audit — docs vs code (TASKLIST M2, started 2026-09-25)

Method: grep census of every Mesa figure across `history/`, `src/`, `src/data/`. Result: **consistent** (contrast with epigraphy audit).

## Figures (identical everywhere)

| Figure | Value | Docs | Code |
|---|---|---|---|
| GPR cigar/dome | ~50 m, 50/50 Fe-Al, 0% Ni | ✅×6+ | ✅ canvas label L144 |
| Horizontal boring kill | 32.5–33 ft (W-carbide destroyed) | ✅ | — (sim only) |
| Vertical blowout | 43–53 ft hydraulics | ✅ | — (sim only) |
| Deep void + water loss | 496–500 ft | ✅ | — (sim only) |
| Drone kill altitude | **3,271 ft** AGL | ✅×5+ | ✅ kill line L196, `altitudeFt` default 3271, `droneAltM >= 997` (= 3271.0 ft ✓) |
| LiDAR bubble / GPS jump | 2,000 ft radius, 50–100 ft jumps | ✅ | ✅ canvas |
| IR portal | 31 ft Ø, ΔT ≈ −22 °C | ✅ | ✅ `portalDiameterFt` 31.0, `thermalDepressionC` −22.5 |
| RF band | 1.610–1.625 GHz L-band | ✅×4 | ✅ synthesizer |
| Apollo blue | 450 nm triangle | ✅ | ✅ `lightWavelengthNm` 450 |

## Nits (non-blocking)

- ΔT −22 °C (docs) vs −22.5 °C (code default). Pick one.
- `droneAltM * 3.28` display factor vs 3.28084 — sub-foot rounding, fine.

## Real gap (not numbers — data)

All dome/drilling visuals are **slider-driven illustrations**: no raw GPR traces, no drone telemetry logs, no IR frames in repo. The numbers agree because they share one prose source, not because two independent measurements converge. Per ROADMAP-GAPS: SigMF/SEG-Y/LAS parsers + raw dumps are the actual M2 work. Until then these figures are **claims with consistent bookkeeping**, not corroborated measurements.
