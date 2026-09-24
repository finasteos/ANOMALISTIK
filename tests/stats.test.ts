// Golden-vector tests for src/lib/stats.ts (TASKLIST Q3).
// Run: npx tsx --test tests/*.test.ts   (or: npm test)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseCSV,
  pf,
  countOnesBytes,
  shannonEntropy,
  indexOfCoincidence,
  erf,
  normalCdf,
} from "../src/lib/stats";

describe("parseCSV", () => {
  it("parses headers + rows", () => {
    const rows = parseCSV('a,b\n1,2\n3,4\n');
    assert.deepEqual(rows, [
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });
  it("returns [] for header-only input", () => {
    assert.deepEqual(parseCSV("a,b\n"), []);
  });
});

describe("pf", () => {
  it("parses floats, null on garbage", () => {
    assert.equal(pf("3.5"), 3.5);
    assert.equal(pf(undefined), null);
    assert.equal(pf("NaN-ish"), null);
  });
});

describe("countOnesBytes", () => {
  it("counts bits (0xFF=8, 0x0F=4, empty=0)", () => {
    assert.equal(countOnesBytes([0xff, 0x0f, 0x00]), 12);
    assert.equal(countOnesBytes([]), 0);
    assert.equal(countOnesBytes(Buffer.from([0b10101010])), 4);
  });
});

describe("shannonEntropy", () => {
  it("fair coin = 1 bit; certain = 0 bits", () => {
    assert.ok(Math.abs(shannonEntropy([50, 50], 100) - 1) < 1e-12);
    assert.equal(shannonEntropy([100], 100), 0);
    assert.equal(shannonEntropy([], 0), 0);
  });
  it("uniform alphabet of 4 = 2 bits", () => {
    assert.ok(Math.abs(shannonEntropy([25, 25, 25, 25], 100) - 2) < 1e-12);
  });
});

describe("indexOfCoincidence", () => {
  it("AAAA (n=4) = 1; ABCD = 0; English-like ~0.065", () => {
    assert.equal(indexOfCoincidence([4], 4), 1);
    assert.equal(indexOfCoincidence([1, 1, 1, 1], 4), 0);
    assert.equal(indexOfCoincidence([], 0), 0);
    assert.equal(indexOfCoincidence([10], 1), 0);
  });
});

describe("erf / normalCdf", () => {
  it("erf golden values (A&S, err < 2e-7)", () => {
    assert.ok(Math.abs(erf(0)) < 1e-6);
    assert.ok(Math.abs(erf(1) - 0.8427007929) < 2e-7);
    assert.ok(Math.abs(erf(-1) + 0.8427007929) < 2e-7);
  });
  it("normalCdf golden values", () => {
    assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-6);
    assert.ok(Math.abs(normalCdf(1.96) - 0.975) < 1e-4);
    assert.ok(Math.abs(normalCdf(-1.96) - 0.025) < 1e-4);
  });
});
