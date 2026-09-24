# Epigraphy Audit — corpus numbers cross-check (TASKLIST M3, started 2026-09-25)

Method: grep census of every G-code z-score across `labData.ts`, components, projects, history. No raw corpora in repo, so this audits **consistency**, not correctness.

## Corpus table (labData.ts, canonical)

| Code | Script | z | condH | nullH | IC | Verdict |
|---|---|---|---|---|---|---|
| G-MER | Meroitic | **-11336** | 1.84 | 3.42 | 0.0512 | STRUCTURE_SIGNAL |
| G-LINA | Linear A | -73 | — | — | — | SEQUENCE_STRUCTURE |
| G-RONG | Rongorongo | -42.9 | — | — | — | SEQUENCE_STRUCTURE |
| G-KHIT | Khitan Small | -28.6 | — | — | — | STRUCTURE_SIGNAL |
| G-INDUS | Indus | -22.9 | — | — | — | STRUCTURE_SIGNAL |
| G-ELAM | Elamite | -18.4 | — | — | — | SEQUENCE_STRUCTURE |
| G-PHAI | Phaistos | -14 | — | — | — | SEQUENCE_STRUCTURE |
| G-BYBL | Byblos | -12.4 | — | — | — | SEQUENCE_STRUCTURE |
| G-ZAPO | Zapotec | -15.2 | — | — | — | SEQUENCE_STRUCTURE |
| G-ISTH | Isthmian | -8.1 | — | — | — | UNDERDETERMINED |

## Flags 🚩

1. **G-MER −11336 is 155× the next value.** Extraordinary claims need methods notes. G01 project cites H(Y|X)=0.12 bits/char on Remu&Qere royal names vs 100× Fisher-Yates — but labData lists corpus condH=1.84. Subset-vs-corpus is plausible but **undocumented**. Refrain sub-claim (Royal KA, z=−9,467) and negative control (z=−1.41) are asserted without artifacts. **Do not cite −11336 externally until a raw-corpus rerun lands in-repo.**
2. **Demo-label collision:** `AtlasOverview` spike-demo chip reads "Meroitic Entropy (z = −12.4)" — but −12.4 is **Byblos's** corpus value. The chip is a hardcoded demo magnitude (`triggerSpike`), not a corpus claim, yet it misattributes. Fix: relabel chip or bind it to the corpus table.
3. **Chart scale consistency (good):** `EpigraphySection` log-domain [1, 20000] accommodates 11336 — consistent with labData being the intended source of truth.
4. **No raw data:** no inscription files, no slot-aligner script in repo — `MarkovSlotAlignerSection` is UI-only. A blind held-out test (M3 remainder) is currently impossible; first step is committing tokenizer + corpus JSON.

## Next (M3 remainder)

- Commit raw tokenized corpora + aligner script; rerun G-MER end-to-end; publish H(Pk), I, D_KL with held-out slots.
- Fix demo chip label; add methods note to G01.
