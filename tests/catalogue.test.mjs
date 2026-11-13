import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BASES, expressValue } from "../assets/js/nutrition.js";
import {
  DEFAULT_STATE,
  distinctConditions,
  filterCrops,
  hasIdentifiedSource,
  normaliseText,
  parseState,
  scientificName,
  serialiseState,
  sortCrops,
} from "../assets/js/catalogue.js";
import { loadDataset } from "./helpers.mjs";

const { crops } = loadDataset();
const ids = (list) => list.map((crop) => crop.id);
const GROUPS = ["pseudocereal", "cereal", "grain_legume", "root_tuber"];

describe("normaliseText", () => {
  it("lower-cases and strips diacritics", () => {
    assert.equal(normaliseText("  Cañihua MAÍZ  "), "canihua maiz");
    assert.equal(normaliseText(null), "");
  });
});

describe("filterCrops", () => {
  it("matches names without diacritics", () => {
    assert.deepEqual(ids(filterCrops(crops, { query: "canihua" })), ["canihua"]);
    assert.deepEqual(ids(filterCrops(crops, { query: "maiz morado" })), ["purple-corn"]);
  });

  it("searches scientific names, families and note text", () => {
    assert.deepEqual(ids(filterCrops(crops, { query: "lupinus" })), ["tarwi"]);
    assert.deepEqual(ids(filterCrops(crops, { query: "brassicaceae" })), ["maca"]);
    assert.deepEqual(ids(filterCrops(crops, { query: "glucosinolate" })).sort(), ["mashua", "maca"].sort());
  });

  it("requires every query term to match", () => {
    assert.deepEqual(ids(filterCrops(crops, { query: "quinoa saponins" })), ["quinoa"]);
    assert.deepEqual(filterCrops(crops, { query: "quinoa glucosinolate" }), []);
  });

  it("filters by crop group and by source status", () => {
    assert.deepEqual(ids(filterCrops(crops, { group: "vegetable" })), ["aji-amarillo", "rocoto"]);
    assert.ok(filterCrops(crops, { group: "fruit" }).every((crop) => crop.crop_group === "fruit"));
    const sourced = ids(filterCrops(crops, { sourcedOnly: true }));
    assert.deepEqual(sourced, ids(crops.filter(hasIdentifiedSource)));
    assert.ok(sourced.includes("quinoa") && sourced.includes("peanut"));
    assert.ok(!sourced.includes("oca"), "unverified records are excluded");
    assert.ok(!sourced.includes("ulluco"), "pending records are excluded");
  });

  it("searches infraspecific names and alternative names", () => {
    assert.deepEqual(ids(filterCrops(crops, { query: "mollissima" })), ["tumbo"]);
    assert.deepEqual(ids(filterCrops(crops, { query: "aguaymanto" })), ["cape-gooseberry"]);
  });
});

describe("sortCrops", () => {
  it("sorts by name by default", () => {
    assert.equal(sortCrops(crops, "name", BASES.AS_DESCRIBED)[0].id, "achira");
  });

  it("sorts components in the requested direction on the active basis", () => {
    assert.equal(sortCrops(crops, "protein-desc", BASES.AS_DESCRIBED)[0].id, "tarwi");
    assert.equal(sortCrops(crops, "energy-asc", BASES.AS_DESCRIBED)[0].id, "naranjilla");
  });

  it("changes ranking when values are expressed per 100 kcal", () => {
    const asDescribed = ids(sortCrops(crops, "iron-desc", BASES.AS_DESCRIBED));
    const perEnergy = ids(sortCrops(crops, "iron-desc", BASES.PER_ENERGY));
    assert.equal(asDescribed[0], "maca");
    assert.notDeepEqual(asDescribed, perEnergy);
    assert.ok(perEnergy.indexOf("oca") < asDescribed.indexOf("oca"));
  });

  it("places records without a value on the basis last, in name order", () => {
    const sorted = sortCrops(crops, "protein-desc", BASES.DRY_MATTER);
    const values = sorted.map((crop) => expressValue(crop, "protein", BASES.DRY_MATTER));
    const firstMissing = values.indexOf(null);
    assert.ok(firstMissing > 0, "some crops report water");
    assert.ok(values.slice(firstMissing).every((value) => value === null));
    const withValues = values.slice(0, firstMissing);
    assert.deepEqual(withValues, [...withValues].sort((a, b) => b - a));
    const missingNames = sorted.slice(firstMissing).map((crop) => crop.names.common);
    assert.deepEqual(missingNames, [...missingNames].sort((a, b) => a.localeCompare(b, "en-GB", { sensitivity: "base" })));
  });

  it("sorts energy per 100 g when the basis is per 100 kcal", () => {
    assert.deepEqual(
      ids(sortCrops(crops, "energy-asc", BASES.PER_ENERGY)),
      ids(sortCrops(crops, "energy-asc", BASES.AS_DESCRIBED)),
    );
  });

  it("does not mutate its input and rejects unknown keys", () => {
    const before = ids(crops);
    sortCrops(crops, "protein-desc", BASES.AS_DESCRIBED);
    assert.deepEqual(ids(crops), before);
    assert.throws(() => sortCrops(crops, "colour", BASES.AS_DESCRIBED), RangeError);
  });
});

describe("scientificName", () => {
  it("includes infraspecific ranks when present", () => {
    const byId = Object.fromEntries(crops.map((crop) => [crop.id, crop]));
    assert.equal(scientificName(byId.quinoa), "Chenopodium quinoa");
    assert.equal(scientificName(byId.tumbo), "Passiflora tripartita var. mollissima");
  });
});

describe("distinctConditions", () => {
  it("lists the food states present", () => {
    assert.deepEqual(distinctConditions(crops), ["dried", "dry", "fresh"]);
  });
});

describe("parseState and serialiseState", () => {
  it("falls back to defaults for invalid parameters", () => {
    const state = parseState(new URLSearchParams("group=fruit&basis=per-cup&sort=x&view=grid"), GROUPS);
    assert.deepEqual(state, { ...DEFAULT_STATE });
  });

  it("round-trips non-default state and omits defaults", () => {
    const state = {
      query: "oca",
      group: "root_tuber",
      basis: BASES.PER_ENERGY,
      sort: "iron-desc",
      view: "table",
      sourcedOnly: true,
    };
    const params = serialiseState(state);
    assert.deepEqual(parseState(params, GROUPS), state);
    assert.equal(serialiseState({ ...DEFAULT_STATE }).toString(), "");
  });

  it("truncates overlong queries", () => {
    const state = parseState(new URLSearchParams({ q: "x".repeat(500) }), GROUPS);
    assert.equal(state.query.length, 100);
  });
});
