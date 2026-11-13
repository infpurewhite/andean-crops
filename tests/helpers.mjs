/**
 * Test helpers: minimal records and a fresh copy of the shipped dataset.
 */

import { readFileSync } from "node:fs";

const DATASET_TEXT = readFileSync(new URL("../data/andean-crops.json", import.meta.url), "utf8");
const SCHEMA_TEXT = readFileSync(new URL("../data/andean-crops.schema.json", import.meta.url), "utf8");

/** Fresh, mutable copy of the dataset. */
export function loadDataset() {
  return JSON.parse(DATASET_TEXT);
}

/** Fresh copy of the JSON Schema. */
export function loadSchema() {
  return JSON.parse(SCHEMA_TEXT);
}

/**
 * Build a minimal crop record.
 *
 * @param {Record<string, number>} values Component values per 100 g.
 * @param {object} [overrides] Top-level fields to override.
 * @param {string} [verification] Verification level for every value.
 */
export function makeCrop(values, overrides = {}, verification = "corroborated") {
  return {
    id: "test-crop",
    names: { common: "Test crop", alternative: [] },
    taxon: { genus: "Testus", species: "cropus", authority: "L.", family: "Testaceae" },
    crop_group: "pseudocereal",
    edible_part: "seed",
    food: { description: "Seed, dry", condition: "dry" },
    composition: {
      source: "usda-sr-legacy-2018",
      match: "direct",
      values: Object.fromEntries(Object.entries(values).map(([id, value]) => [id, { value, verification }])),
    },
    notes: [],
    flags: [],
    ...overrides,
  };
}

/** Quinoa values from USDA SR Legacy (FDC 168874), as stored in the dataset. */
export const QUINOA = Object.freeze({
  energy: 368,
  water: 13.28,
  protein: 14.12,
  fat: 6.07,
  carbohydrate_total: 64.16,
  fibre: 7.0,
  ash: 2.38,
  calcium: 47,
  iron: 4.57,
});
