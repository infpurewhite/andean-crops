import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BASES,
  QC_LIMITS,
  calculateEnergyKcal,
  effectiveBasis,
  expressValue,
  formatNumber,
  getValue,
  isPending,
  perEnergy,
  proximateSum,
  qualityChecks,
  toDryMatter,
  unitLabel,
  verificationSummary,
} from "../assets/js/nutrition.js";
import { QUINOA, makeCrop } from "./helpers.mjs";

const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected}`);

const byId = (checks, id) => checks.find((check) => check.id === id);

describe("getValue", () => {
  it("returns reported numbers and null for missing components", () => {
    const crop = makeCrop({ protein: 14.12 });
    assert.equal(getValue(crop, "protein"), 14.12);
    assert.equal(getValue(crop, "iron"), null);
    assert.equal(getValue({}, "protein"), null);
  });
});

describe("toDryMatter", () => {
  it("rescales to 100 g dry matter", () => {
    close(toDryMatter(14.12, 13.28), (14.12 * 100) / 86.72);
    assert.equal(toDryMatter(5, 0), 5);
  });

  it("propagates missing inputs as null", () => {
    assert.equal(toDryMatter(null, 10), null);
    assert.equal(toDryMatter(5, null), null);
  });

  it("rejects impossible water contents", () => {
    assert.throws(() => toDryMatter(5, 100), RangeError);
    assert.throws(() => toDryMatter(5, -1), RangeError);
    assert.throws(() => toDryMatter(5, Number.NaN), RangeError);
  });
});

describe("perEnergy", () => {
  it("expresses a value per 100 kcal", () => {
    close(perEnergy(14.12, 368), 3.8369565217391304);
  });

  it("returns null for missing inputs and rejects non-positive energy", () => {
    assert.equal(perEnergy(null, 368), null);
    assert.equal(perEnergy(1, null), null);
    assert.throws(() => perEnergy(1, 0), RangeError);
  });
});

describe("expressValue and effectiveBasis", () => {
  const quinoa = makeCrop(QUINOA);

  it("supports the three bases", () => {
    assert.equal(expressValue(quinoa, "iron", BASES.AS_DESCRIBED), 4.57);
    close(expressValue(quinoa, "iron", BASES.DRY_MATTER), (4.57 * 100) / 86.72);
    close(expressValue(quinoa, "iron", BASES.PER_ENERGY), (4.57 * 100) / 368);
  });

  it("returns null where a conversion is undefined", () => {
    assert.equal(expressValue(quinoa, "water", BASES.DRY_MATTER), null);
    assert.equal(expressValue(quinoa, "energy", BASES.PER_ENERGY), null);
    assert.equal(expressValue(makeCrop({ iron: 2 }), "iron", BASES.DRY_MATTER), null);
  });

  it("rejects unknown bases", () => {
    assert.throws(() => expressValue(quinoa, "iron", "per-serving"), RangeError);
    assert.throws(() => unitLabel("g", "per-serving"), RangeError);
  });

  it("shows energy per 100 g when the basis is per 100 kcal", () => {
    assert.equal(effectiveBasis("energy", BASES.PER_ENERGY), BASES.AS_DESCRIBED);
    assert.equal(effectiveBasis("energy", BASES.DRY_MATTER), BASES.DRY_MATTER);
    assert.equal(effectiveBasis("iron", BASES.PER_ENERGY), BASES.PER_ENERGY);
  });

  it("labels units by basis", () => {
    assert.equal(unitLabel("g", BASES.AS_DESCRIBED), "g/100 g");
    assert.equal(unitLabel("mg", BASES.DRY_MATTER), "mg/100 g DM");
    assert.equal(unitLabel("g", BASES.PER_ENERGY), "g/100 kcal");
  });
});

describe("calculateEnergyKcal", () => {
  it("applies general factors to protein, fat, available carbohydrate and fibre", () => {
    // 4 × 14.12 + 9 × 6.07 + 4 × (64.16 − 7.0) + 2 × 7.0
    close(calculateEnergyKcal(makeCrop(QUINOA)), 353.75, 1e-9);
  });

  it("returns null when an input is missing", () => {
    const { fibre: _fibre, ...withoutFibre } = QUINOA;
    assert.equal(calculateEnergyKcal(makeCrop(withoutFibre)), null);
  });

  it("does not let available carbohydrate go negative", () => {
    const crop = makeCrop({ protein: 0, fat: 0, carbohydrate_total: 2, fibre: 5 });
    assert.equal(calculateEnergyKcal(crop), 10);
  });
});

describe("proximateSum", () => {
  it("sums water, protein, fat, total carbohydrate and ash", () => {
    close(proximateSum(makeCrop(QUINOA)), 100.01, 1e-9);
  });

  it("returns null when a proximate is missing", () => {
    const { ash: _ash, ...withoutAsh } = QUINOA;
    assert.equal(proximateSum(makeCrop(withoutAsh)), null);
  });
});

describe("qualityChecks", () => {
  it("passes the stored quinoa record", () => {
    const checks = qualityChecks(makeCrop(QUINOA));
    assert.deepEqual(
      checks.map((check) => check.status),
      ["pass", "pass", "pass", "pass"],
    );
    close(byId(checks, "energy").details.relativeDifference, (353.75 - 368) / 368, 1e-9);
  });

  it("warns when reported energy deviates beyond the tolerance", () => {
    const check = byId(qualityChecks(makeCrop({ ...QUINOA, energy: 500 })), "energy");
    assert.equal(check.status, "warn");
    assert.ok(Math.abs(check.details.relativeDifference) > QC_LIMITS.energyRelativeTolerance);
  });

  it("fails a proximate sum outside 97–103 g", () => {
    const check = byId(qualityChecks(makeCrop({ ...QUINOA, water: 20 })), "proximate-sum");
    assert.equal(check.status, "fail");
  });

  it("fails fibre above total carbohydrate and macronutrients above 100 g", () => {
    const checks = qualityChecks(makeCrop({ protein: 50, fat: 30, carbohydrate_total: 25, fibre: 30 }));
    assert.equal(byId(checks, "fibre-within-carbohydrate").status, "fail");
    assert.equal(byId(checks, "macronutrient-total").status, "fail");
  });

  it("marks checks without the inputs they need as not applicable", () => {
    const checks = qualityChecks(makeCrop({ iron: 1 }));
    assert.ok(checks.every((check) => check.status === "not-applicable"));
  });
});

describe("verificationSummary", () => {
  it("classifies records by the verification of their values", () => {
    assert.equal(verificationSummary(makeCrop(QUINOA)).level, "corroborated");
    assert.equal(verificationSummary(makeCrop(QUINOA, {}, "verified")).level, "verified");
    assert.equal(verificationSummary(makeCrop(QUINOA, {}, "unverified")).level, "unverified");

    const mixed = makeCrop({ protein: 1, iron: 1 });
    mixed.composition.values.iron.verification = "unverified";
    assert.deepEqual(verificationSummary(mixed), {
      total: 2,
      verified: 0,
      corroborated: 1,
      unverified: 1,
      level: "partial",
    });
  });

  it("treats a record without values as unverified unless it is marked pending", () => {
    assert.equal(verificationSummary(makeCrop({})).level, "unverified");
    const pending = makeCrop({}, { composition: { status: "pending", note: "No source yet.", values: {} } });
    assert.equal(isPending(pending), true);
    assert.equal(verificationSummary(pending).level, "pending");
    assert.equal(isPending(makeCrop(QUINOA)), false);
  });
});

describe("formatNumber", () => {
  it("formats with fixed decimals and an en dash for missing values", () => {
    assert.equal(formatNumber(1234.5, 1), "1,234.5");
    assert.equal(formatNumber(4.567, 1), "4.6");
    assert.equal(formatNumber(7, 1), "7.0");
    assert.equal(formatNumber(null, 1), "–");
    assert.equal(formatNumber(Number.NaN, 1), "–");
  });
});
