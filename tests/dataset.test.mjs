import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateDataset, validateIntegrity, validateSchema } from "../scripts/lib/dataset-validation.mjs";
import { tidyRows, toCsv } from "../scripts/lib/tidy-export.mjs";
import { loadDataset, loadSchema } from "./helpers.mjs";

const schema = loadSchema();
const crop = (dataset, id) => dataset.crops.find((c) => c.id === id);
const errorsOf = (dataset) => validateDataset(dataset, schema).errors;

describe("shipped dataset", () => {
  it("passes schema, integrity and quality checks without errors", () => {
    assert.deepEqual(errorsOf(loadDataset()), []);
  });

  it("reports every core proximate component for every crop", () => {
    for (const record of loadDataset().crops) {
      for (const id of ["energy", "protein", "fat", "carbohydrate_total", "fibre"]) {
        assert.ok(record.composition.values[id], `${record.id} lacks ${id}`);
      }
    }
  });

  it("keeps the derived CSV in sync with the JSON (run `npm run export`)", () => {
    const csv = readFileSync(new URL("../data/derived/andean-crops-long.csv", import.meta.url), "utf8");
    assert.equal(csv, toCsv(tidyRows(loadDataset())));
  });
});

describe("validator catches defects", () => {
  it("rejects values that break the schema", () => {
    const dataset = loadDataset();
    crop(dataset, "oca").composition.values.iron.value = -1;
    assert.ok(validateSchema(dataset, schema).some((error) => error.includes("/values/iron/value")));
  });

  it("rejects unknown component identifiers and source references", () => {
    const dataset = loadDataset();
    crop(dataset, "oca").composition.values.vitamin_c = { value: 1, verification: "unverified" };
    crop(dataset, "maca").notes[0].refs = ["missing-source"];
    const { errors } = validateIntegrity(dataset);
    assert.ok(errors.some((error) => error.includes('"vitamin_c": unknown component')));
    assert.ok(errors.some((error) => error.includes('unknown source "missing-source"')));
  });

  it("rejects duplicate identifiers", () => {
    const dataset = loadDataset();
    dataset.crops.push(structuredClone(crop(dataset, "oca")));
    assert.ok(errorsOf(dataset).some((error) => error.includes('duplicate crop id "oca"')));
  });

  it("rejects corroborated values without an identified source", () => {
    const dataset = loadDataset();
    crop(dataset, "oca").composition.values.iron.verification = "corroborated";
    assert.ok(errorsOf(dataset).some((error) => error.includes('"corroborated" requires an identified source')));
  });

  it("rejects proxy matches that are not flagged", () => {
    const dataset = loadDataset();
    crop(dataset, "kiwicha").flags = [];
    assert.ok(errorsOf(dataset).some((error) => error.includes("proxy-match")));
  });

  it("rejects notes marked as checked without a citation", () => {
    const dataset = loadDataset();
    crop(dataset, "oca").notes[0].checked = true;
    assert.ok(errorsOf(dataset).some((error) => error.includes("marked as checked but cites no source")));
  });

  it("rejects records that fail a quality check", () => {
    const dataset = loadDataset();
    crop(dataset, "quinoa").composition.values.fibre.value = 70;
    assert.ok(errorsOf(dataset).some((error) => error.includes('"fibre-within-carbohydrate" failed')));
  });

  it("rejects implausible magnitudes", () => {
    const dataset = loadDataset();
    crop(dataset, "quinoa").composition.values.energy.value = 1200;
    assert.ok(errorsOf(dataset).some((error) => error.includes("exceeds the plausible maximum")));
  });
});
