// Tests for src/server/rng.ts (TASKLIST B3/D4).
// Golden vectors cross-checked against live /api/rng/session/analyze output.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  directionalBF01,
  adjudicateVerdict,
  buildHistogram,
  RNG_TAU,
  RNG_HIST_BINS,
} from "../src/server/rng";

describe("directionalBF01", () => {
  it("live smoke vector D=-1.1562 σ=1.1562 → bf01=1.157 bf10=0.864", () => {
    const { bf01, bf10 } = directionalBF01(-1.1562, 1.1562);
    assert.equal(bf01, 1.157);
    assert.equal(bf10, 0.864);
  });
  it("strong positive signal favors H1 (bf01 < 1)", () => {
    const { bf01 } = directionalBF01(0.8, 0.1);
    assert.ok(bf01 < 1, `expected bf01<1, got ${bf01}`);
  });
  it("uses tau=0.20 by default", () => {
    assert.equal(RNG_TAU, 0.2);
    assert.equal(RNG_HIST_BINS, 40);
  });
});

describe("adjudicateVerdict", () => {
  it("verdict matrix", () => {
    assert.equal(
      adjudicateVerdict({ layer1Passed: false, pValue: 0.0001, observedD: 1 }),
      "INSTRUMENT_SYSTEMATICS"
    );
    assert.equal(
      adjudicateVerdict({ layer1Passed: true, pValue: 0.0005, observedD: 0.5 }),
      "STRUCTURE_SIGNAL"
    );
    assert.equal(
      adjudicateVerdict({ layer1Passed: true, pValue: 0.03, observedD: 0.2 }),
      "UNDERDETERMINED"
    );
    assert.equal(
      adjudicateVerdict({ layer1Passed: true, pValue: 0.5, observedD: -0.1 }),
      "CLAIM_FAILS_NULL"
    );
    // negative D never signals, even with tiny p
    assert.equal(
      adjudicateVerdict({ layer1Passed: true, pValue: 0.0001, observedD: -0.5 }),
      "CLAIM_FAILS_NULL"
    );
  });
});

describe("buildHistogram", () => {
  it("counts sum to input size, 40 bins default", () => {
    const bins = buildHistogram([0, 1, 2, 3], 1.5);
    assert.equal(bins.length, 40);
    assert.equal(bins.reduce((a, b) => a + b.count, 0), 4);
  });
  it("degenerate range still bins everything", () => {
    const bins = buildHistogram([1, 1, 1], 1, 4);
    assert.equal(bins.length, 4);
    assert.equal(bins.reduce((a, b) => a + b.count, 0), 3);
  });
});
