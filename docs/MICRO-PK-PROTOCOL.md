# Micro-PK Session Protocol — förregistrerad pilot (TASKLIST M4)

För grupper som vill testa på riktigt (med eller utan "speciellt tillstånd").
Regel noll: **alla sessioner loggas, även null-resultat.** Lådlåda (file-drawer) dödar all trovärdighet.

## 1. Roller

- **Operatör** (1–3 pers): de som fokuserar under INTENTION-block.
- **Vittne** (1 pers): sköter appen, ser till att protokollet följs, rör inget under blocken.
- **Analytiker** (kan vara jag): räknar D/p/BF01 först när sessionen är stängd.

## 2. Förregistrering (skriv INNAN ni börjar, t.ex. i ett kuvert eller en committad fil)

- Hypotes: t.ex. "INTENTION-medel > CONTROL-medel (D > 0)".
- `nBlocksEach` (rekommenderat: **6** → 12 block totalt).
- Källa: `APPLE_CSPRNG` (hårdvara saknas ännu — `EXTERNAL_QRNG` svarar 501).
- Blocklängd: standard (2048 bytes = 16 384 bitar/block).
- Framgångskriterium: `p < 0.05` **och** `D > 0` → UNDERDETERMINED eller bättre; placebo-kontroll (se 5) måste samtidigt vara tyst.

## 3. Tillståndet (ert "speciella tillstånd")

- Välj **en** induktion (meditation, andningsarbete, vad ni vill) och kör **samma varje gång** — även under CONTROL. Det som skiljer armarna är *intentionen*, inte tillståndet.
- Samma rum, samma tid på dygnet, samma operatörer över sessionerna ni jämför.
- Dokumentera: sömn, koffein, humör (1–5). Tråkigt men nödvändigt.

## 4. Flöde i appen (RNG-lab)

1. Starta session: `participantId` = gruppnamn, `mindsetScore` = ärlig skattning, `isPilot: true`.
2. Kör blocken i ordning. Vittnet klickar, operatörerna fokuserar (INTENTION) / vilar (CONTROL).
3. **Titta inte på delresultat mitt i.** Bestäm N i förväg — att sluta "när det ser bra ut" (optional stopping) blåser upp falsklarm.
4. Kör Analyze först när alla block är klara. Läs: `observedD`, `pValue`, `BF01/BF10`, `verdict`.

## 5. Kontroller (obligatoriska)

- **Placebo-arm**: kör minst en `DETERMINISTIC_PRNG_PLACEBO`-session. Krav: `|D| < 2.5`, annars `INSTRUMENT_SYSTEMATICS` — då är något trasigt, inte paranormalt.
- **Nykter baslinje**: en session helt utan tillståndsinduktion, samma operatörer.

## 6. Tolkning

| Utfall | Betyder |
|---|---|
| `CLAIM_FAILS_NULL` | Null — det väntade utan effekt. Bra kontrolldata. |
| `UNDERDETERMINED` (p<0.05, D>0) | Intressant, men **en** session bevisar inget. Replikera ×3+. |
| `STRUCTURE_SIGNAL` (p<0.001, D>0) | Starkt — replikera omedelbart, oberoende vittne, publicera rå-JSONL. |
| `INSTRUMENT_SYSTEMATICS` | Placebot larmar — felsök, publicera ändå (negativa resultat är data). |

## 7. Loggmall per session

```text
Datum:        Staffan + vänner
Operatörerer: ...
Tillstånd:    ... (metod + minuter)
SessionId:    RNG_SESS_...
D / p / BF01: ...
Verdict:      ...
Avvikelser:   ... (allt som avvek från planen — ärlighet > snygga siffror)
```
