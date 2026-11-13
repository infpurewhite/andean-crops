import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BASES } from "../assets/js/nutrition.js";
import {
  DEFAULT_STATE,
  distinctConditions,
  filterCrops,
  hasIdentifiedSource,
  normaliseText,
  parseState,
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
    assert.deepEqual(ids(filterCrops(crops, { group: "root_tuber" })), ["maca", "mashua", "oca"]);
    assert.deepEqual(ids(filterCrops(crops, { sourcedOnly: true })), ["quinoa", "kiwicha"]);
    assert.ok(crops.filter(hasIdentifiedSource).length === 2);
  });
});

describe("sortCrops", () => {
  it("sorts by name by default", () => {
    assert.equal(sortCrops(crops, "name", BASES.AS_DESCRIBED)[0].id, "canihua");
  });

  it("sorts components in the requested direction on the active basis", () => {
    assert.equal(sortCrops(crops, "protein-desc", BASES.AS_DESCRIBED)[0].id, "tarwi");
    assert.equal(sortCrops(crops, "energy-asc", BASES.AS_DESCRIBED)[0].id, "mashua");
  });

  it("changes ranking when values are expressed per 100 kcal", () => {
    const asDescribed = ids(sortCrops(crops, "iron-desc", BASES.AS_DESCRIBED));
    const perEnergy = ids(sortCrops(crops, "iron-desc", BASES.PER_ENERGY));
    assert.equal(asDescribed[0], "maca");
    assert.notDeepEqual(asDescribed, perEnergy);
    assert.ok(perEnergy.indexOf("oca") < asDescribed.indexOf("oca"));
  });

  it("places records without a value on the basis last", () => {
    const sorted = ids(sortCrops(crops, "protein-desc", BASES.DRY_MATTER));
    assert.equal(sorted[0], "quinoa", "only quinoa reports water");
    assert.deepEqual(sorted.slice(1), [...sorted.slice(1)].sort((a, b) => a.localeCompare(b)));
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
