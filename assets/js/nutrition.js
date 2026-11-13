/**
 * Pure domain logic for nutrient composition records.
 *
 * Nothing in this module touches the DOM, so it runs unchanged in the
 * browser and under Node's test runner. Values are per 100 g edible portion
 * of the food in the state described by the record, unless stated otherwise.
 *
 * @module nutrition
 */

/** Bases on which a composition value can be expressed. */
export const BASES = Object.freeze({
  AS_DESCRIBED: "as-described",
  DRY_MATTER: "dry-matter",
  PER_ENERGY: "per-100-kcal",
});

/**
 * General energy conversion factors in kcal/g (FAO, 2003, Food and Nutrition
 * Paper 77). Available carbohydrate is approximated as total carbohydrate by
 * difference minus dietary fibre.
 */
export const ENERGY_FACTORS = Object.freeze({
  protein: 4,
  fat: 9,
  availableCarbohydrate: 4,
  fibre: 2,
});

/** Screening limits used by {@link qualityChecks}. */
export const QC_LIMITS = Object.freeze({
  /** Expected range for the sum of proximates, g/100 g (Greenfield and Southgate, 2003). */
  proximateSum: Object.freeze({ min: 97, max: 103 }),
  /** Relative tolerance between reported and recalculated energy (dataset heuristic). */
  energyRelativeTolerance: 0.1,
});

/** Components that make up the proximate sum. */
export const PROXIMATE_COMPONENTS = Object.freeze([
  "water",
  "protein",
  "fat",
  "carbohydrate_total",
  "ash",
]);

/**
 * Return the numeric value of a component, or null if it is not reported.
 *
 * @param {object} crop Crop record.
 * @param {string} componentId Component identifier, e.g. "protein".
 * @returns {number|null}
 */
export function getValue(crop, componentId) {
  const entry = crop?.composition?.values?.[componentId];
  const value = entry?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Convert a value per 100 g of food to a value per 100 g of dry matter.
 *
 * @param {number|null} value Value per 100 g edible portion.
 * @param {number|null} water Water content, g/100 g edible portion.
 * @returns {number|null} Null if either input is missing.
 * @throws {RangeError} If water is outside [0, 100).
 */
export function toDryMatter(value, water) {
  if (value === null || water === null) return null;
  if (!(water >= 0 && water < 100)) {
    throw new RangeError(`Water must lie in [0, 100) g/100 g; received ${water}.`);
  }
  return (value * 100) / (100 - water);
}

/**
 * Express a value per 100 kcal of food energy (nutrient density).
 *
 * @param {number|null} value Value per 100 g edible portion.
 * @param {number|null} energyKcal Energy, kcal/100 g edible portion.
 * @returns {number|null} Null if either input is missing.
 * @throws {RangeError} If energy is not positive.
 */
export function perEnergy(value, energyKcal) {
  if (value === null || energyKcal === null) return null;
  if (!(energyKcal > 0)) {
    throw new RangeError(`Energy must be positive; received ${energyKcal}.`);
  }
  return (value * 100) / energyKcal;
}

/**
 * Express a component of a crop record on the requested basis.
 *
 * Returns null where the conversion is undefined: water on a dry-matter
 * basis, energy on a per-energy basis, or a missing input.
 *
 * @param {object} crop Crop record.
 * @param {string} componentId Component identifier.
 * @param {string} basis One of {@link BASES}.
 * @returns {number|null}
 * @throws {RangeError} If the basis is unknown.
 */
export function expressValue(crop, componentId, basis) {
  const value = getValue(crop, componentId);
  switch (basis) {
    case BASES.AS_DESCRIBED:
      return value;
    case BASES.DRY_MATTER:
      return componentId === "water" ? null : toDryMatter(value, getValue(crop, "water"));
    case BASES.PER_ENERGY:
      return componentId === "energy" ? null : perEnergy(value, getValue(crop, "energy"));
    default:
      throw new RangeError(`Unknown basis: ${basis}`);
  }
}

/**
 * Basis on which a component is displayed and sorted. Energy cannot be
 * expressed per 100 kcal, so it falls back to the as-described basis there.
 *
 * @param {string} componentId Component identifier.
 * @param {string} basis Requested basis, one of {@link BASES}.
 * @returns {string} Basis to use.
 */
export function effectiveBasis(componentId, basis) {
  return componentId === "energy" && basis === BASES.PER_ENERGY ? BASES.AS_DESCRIBED : basis;
}

/**
 * Unit label for a component unit expressed on a basis.
 *
 * @param {string} unit Base unit ("g", "mg" or "kcal").
 * @param {string} basis One of {@link BASES}.
 * @returns {string} For example "g/100 g DM".
 */
export function unitLabel(unit, basis) {
  switch (basis) {
    case BASES.AS_DESCRIBED:
      return `${unit}/100 g`;
    case BASES.DRY_MATTER:
      return `${unit}/100 g DM`;
    case BASES.PER_ENERGY:
      return `${unit}/100 kcal`;
    default:
      throw new RangeError(`Unknown basis: ${basis}`);
  }
}

/**
 * Recalculate metabolisable energy from the macronutrients.
 *
 * @param {object} crop Crop record.
 * @param {typeof ENERGY_FACTORS} [factors] Conversion factors, kcal/g.
 * @returns {number|null} kcal/100 g, or null if any input is missing.
 */
export function calculateEnergyKcal(crop, factors = ENERGY_FACTORS) {
  const protein = getValue(crop, "protein");
  const fat = getValue(crop, "fat");
  const carbohydrate = getValue(crop, "carbohydrate_total");
  const fibre = getValue(crop, "fibre");
  if ([protein, fat, carbohydrate, fibre].includes(null)) return null;
  const available = Math.max(carbohydrate - fibre, 0);
  return (
    protein * factors.protein +
    fat * factors.fat +
    available * factors.availableCarbohydrate +
    fibre * factors.fibre
  );
}

/**
 * Sum of water, protein, fat, total carbohydrate and ash.
 *
 * @param {object} crop Crop record.
 * @returns {number|null} g/100 g, or null if any component is missing.
 */
export function proximateSum(crop) {
  const values = PROXIMATE_COMPONENTS.map((id) => getValue(crop, id));
  return values.includes(null) ? null : values.reduce((sum, v) => sum + v, 0);
}

/**
 * @typedef {object} QualityCheck
 * @property {string} id Check identifier.
 * @property {"pass"|"warn"|"fail"|"not-applicable"} status Outcome.
 * @property {string} message Human-readable explanation.
 * @property {Record<string, number>} [details] Numbers behind the outcome.
 */

/**
 * Run plausibility checks on a crop record.
 *
 * "fail" marks a logical inconsistency that must be fixed; "warn" marks a
 * value that deserves review but may be legitimate.
 *
 * @param {object} crop Crop record.
 * @param {typeof QC_LIMITS} [limits] Screening limits.
 * @returns {QualityCheck[]}
 */
export function qualityChecks(crop, limits = QC_LIMITS) {
  return [
    checkEnergy(crop, limits.energyRelativeTolerance),
    checkProximateSum(crop, limits.proximateSum),
    checkFibreWithinCarbohydrate(crop),
    checkMacronutrientTotal(crop),
  ];
}

function checkEnergy(crop, tolerance) {
  const reported = getValue(crop, "energy");
  const calculated = calculateEnergyKcal(crop);
  if (reported === null || calculated === null || reported === 0) {
    return {
      id: "energy",
      status: "not-applicable",
      message: "Energy check needs reported energy, protein, fat, total carbohydrate and fibre.",
    };
  }
  const relativeDifference = (calculated - reported) / reported;
  const withinTolerance = Math.abs(relativeDifference) <= tolerance;
  return {
    id: "energy",
    status: withinTolerance ? "pass" : "warn",
    message: withinTolerance
      ? "Reported energy agrees with energy recalculated from the macronutrients."
      : "Reported energy differs from energy recalculated from the macronutrients by more than the tolerance.",
    details: { reported, calculated, relativeDifference, tolerance },
  };
}

function checkProximateSum(crop, range) {
  const sum = proximateSum(crop);
  if (sum === null) {
    return {
      id: "proximate-sum",
      status: "not-applicable",
      message: "Proximate sum needs water, protein, fat, total carbohydrate and ash.",
    };
  }
  const inRange = sum >= range.min && sum <= range.max;
  return {
    id: "proximate-sum",
    status: inRange ? "pass" : "fail",
    message: inRange
      ? "Sum of proximates lies within the expected range."
      : "Sum of proximates lies outside the expected range.",
    details: { sum, min: range.min, max: range.max },
  };
}

function checkFibreWithinCarbohydrate(crop) {
  const fibre = getValue(crop, "fibre");
  const carbohydrate = getValue(crop, "carbohydrate_total");
  if (fibre === null || carbohydrate === null) {
    return {
      id: "fibre-within-carbohydrate",
      status: "not-applicable",
      message: "Needs dietary fibre and total carbohydrate.",
    };
  }
  const ok = fibre <= carbohydrate;
  return {
    id: "fibre-within-carbohydrate",
    status: ok ? "pass" : "fail",
    message: ok
      ? "Dietary fibre does not exceed total carbohydrate, which includes it."
      : "Dietary fibre exceeds total carbohydrate, which should include it.",
    details: { fibre, carbohydrate },
  };
}

function checkMacronutrientTotal(crop) {
  const parts = ["protein", "fat", "carbohydrate_total"].map((id) => getValue(crop, id));
  if (parts.includes(null)) {
    return {
      id: "macronutrient-total",
      status: "not-applicable",
      message: "Needs protein, fat and total carbohydrate.",
    };
  }
  const total = parts.reduce((sum, v) => sum + v, 0);
  const ok = total <= 100;
  return {
    id: "macronutrient-total",
    status: ok ? "pass" : "fail",
    message: ok
      ? "Protein, fat and carbohydrate together do not exceed 100 g/100 g."
      : "Protein, fat and carbohydrate together exceed 100 g/100 g.",
    details: { total },
  };
}

/**
 * Whether a record's composition is still pending (no values entered yet).
 *
 * @param {object} crop Crop record.
 * @returns {boolean}
 */
export function isPending(crop) {
  return crop?.composition?.status === "pending";
}

/**
 * Count values by verification level and summarise the record.
 *
 * @param {object} crop Crop record.
 * @returns {{total: number, verified: number, corroborated: number, unverified: number,
 *   level: "verified"|"corroborated"|"partial"|"unverified"|"pending"}}
 */
export function verificationSummary(crop) {
  const entries = Object.values(crop?.composition?.values ?? {});
  const counts = { verified: 0, corroborated: 0, unverified: 0 };
  for (const entry of entries) {
    if (entry.verification in counts) counts[entry.verification] += 1;
  }
  const total = entries.length;
  let level = "partial";
  if (total === 0) level = isPending(crop) ? "pending" : "unverified";
  else if (counts.unverified === total) level = "unverified";
  else if (counts.verified === total) level = "verified";
  else if (counts.unverified === 0) level = "corroborated";
  return { total, ...counts, level };
}

/**
 * Format a number for display with fixed decimals (British English locale).
 *
 * @param {number|null} value Number to format.
 * @param {number} decimals Number of decimal places.
 * @returns {string} "–" (en dash) for null.
 */
export function formatNumber(value, decimals) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "–";
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
