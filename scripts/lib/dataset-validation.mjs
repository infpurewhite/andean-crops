/**
 * Dataset validation: JSON Schema conformance, referential integrity,
 * provenance rules and plausibility checks.
 *
 * Errors must be fixed before release; warnings flag curation work.
 *
 * @module dataset-validation
 */

import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { qualityChecks } from "../../assets/js/nutrition.js";

export const DATASET_URL = new URL("../../data/andean-crops.json", import.meta.url);
export const SCHEMA_URL = new URL("../../data/andean-crops.schema.json", import.meta.url);

/** Upper plausibility bounds per 100 g edible portion, by unit. */
const UNIT_MAXIMA = Object.freeze({ g: 100, mg: 100_000, kcal: 900 });

/**
 * Read and parse a JSON file.
 *
 * @param {URL|string} location File location.
 * @returns {Promise<unknown>}
 */
export async function readJson(location) {
  return JSON.parse(await readFile(location, "utf8"));
}

/**
 * Validate a dataset against the JSON Schema.
 *
 * @param {object} dataset Parsed dataset.
 * @param {object} schema Parsed JSON Schema.
 * @returns {string[]} Error messages (empty if valid).
 */
export function validateSchema(dataset, schema) {
  // strictRequired is relaxed because conditional "required" lists refer to
  // properties declared in the enclosing schema, which Ajv's strict mode flags.
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (validate(dataset)) return [];
  return validate.errors.map((e) => `schema: ${e.instancePath || "/"} ${e.message}`);
}

function duplicates(ids) {
  const seen = new Set();
  const repeated = new Set();
  for (const id of ids) (seen.has(id) ? repeated : seen).add(id);
  return [...repeated];
}

/**
 * Check cross-references and provenance rules that JSON Schema cannot express.
 *
 * @param {object} dataset Parsed dataset (assumed schema-valid).
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateIntegrity(dataset) {
  const errors = [];
  const warnings = [];
  const components = new Map(dataset.components.map((c) => [c.id, c]));
  const sources = new Map(dataset.sources.map((s) => [s.id, s]));
  const cited = new Set();

  const collections = {
    component: dataset.components.map((c) => c.id),
    source: dataset.sources.map((s) => s.id),
    crop: dataset.crops.map((c) => c.id),
    method: dataset.metadata.methods.map((m) => m.id),
  };
  for (const [kind, ids] of Object.entries(collections)) {
    for (const id of duplicates(ids)) errors.push(`duplicate ${kind} id "${id}"`);
  }

  const cite = (id, where) => {
    if (!sources.has(id)) errors.push(`${where}: unknown source "${id}"`);
    else cited.add(id);
  };

  for (const method of dataset.metadata.methods) {
    method.refs.forEach((id) => cite(id, `method "${method.id}"`));
  }

  for (const crop of dataset.crops) {
    const where = `crop "${crop.id}"`;
    const { composition } = crop;
    cite(composition.source, `${where} composition`);
    const recordSource = sources.get(composition.source);

    if (composition.match !== "unknown" && recordSource?.type === "internal") {
      errors.push(`${where}: match "${composition.match}" requires an identified source`);
    }
    const hasProxyFlag = crop.flags.some((flag) => flag.code === "proxy-match");
    if ((composition.match === "proxy") !== hasProxyFlag) {
      errors.push(`${where}: a proxy match and a "proxy-match" flag must occur together`);
    }

    for (const [componentId, entry] of Object.entries(composition.values)) {
      const label = `${where} value "${componentId}"`;
      const component = components.get(componentId);
      if (!component) {
        errors.push(`${label}: unknown component`);
        continue;
      }
      const sourceId = entry.source ?? composition.source;
      if (entry.source) cite(entry.source, label);
      const source = sources.get(sourceId);
      const identified = source !== undefined && source.type !== "internal";
      if (entry.verification !== "unverified" && !identified) {
        errors.push(`${label}: "${entry.verification}" requires an identified source`);
      }
      if (entry.verification === "unverified" && identified) {
        warnings.push(`${label}: source identified but value not yet checked against it`);
      }
      if (entry.value > UNIT_MAXIMA[component.unit]) {
        errors.push(`${label}: ${entry.value} ${component.unit}/100 g exceeds the plausible maximum`);
      }
    }

    const water = composition.values.water?.value;
    if (water !== undefined && water >= 100) errors.push(`${where}: water must be below 100 g/100 g`);

    crop.notes.forEach((note, index) => {
      const noteLabel = `${where} note ${index + 1}`;
      note.refs.forEach((id) => cite(id, noteLabel));
      if (note.refs.length === 0 && note.checked) {
        errors.push(`${noteLabel}: marked as checked but cites no source`);
      }
      if (note.refs.length === 0) warnings.push(`${noteLabel}: citation needed`);
      else if (!note.checked) warnings.push(`${noteLabel}: statement not yet checked against the cited source`);
    });

    for (const check of qualityChecks(crop)) {
      if (check.status === "fail") errors.push(`${where}: quality check "${check.id}" failed: ${check.message}`);
      if (check.status === "warn") warnings.push(`${where}: quality check "${check.id}" needs review: ${check.message}`);
    }
  }

  for (const source of dataset.sources) {
    if (!cited.has(source.id)) warnings.push(`source "${source.id}" is not cited`);
  }

  return { errors, warnings };
}

/**
 * Run all validation stages.
 *
 * @param {object} dataset Parsed dataset.
 * @param {object} schema Parsed JSON Schema.
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateDataset(dataset, schema) {
  const schemaErrors = validateSchema(dataset, schema);
  if (schemaErrors.length > 0) return { errors: schemaErrors, warnings: [] };
  return validateIntegrity(dataset);
}
