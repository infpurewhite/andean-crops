#!/usr/bin/env node
/**
 * Validate data/andean-crops.json and print a data-quality report.
 * Exits with status 1 if any error is found.
 *
 * Usage: npm run validate [-- --quiet]
 */

import { DATASET_URL, SCHEMA_URL, readJson, validateDataset } from "./lib/dataset-validation.mjs";
import { qualityChecks, verificationSummary } from "../assets/js/nutrition.js";

const quiet = process.argv.includes("--quiet");

function report(dataset) {
  const rows = dataset.crops.map((crop) => {
    const summary = verificationSummary(crop);
    const checks = Object.fromEntries(qualityChecks(crop).map((check) => [check.id, check.status]));
    return {
      crop: crop.id,
      values: summary.total,
      identified: summary.verified + summary.corroborated,
      energy: checks.energy,
      "proximate-sum": checks["proximate-sum"],
    };
  });
  console.table(rows);
}

try {
  const [dataset, schema] = await Promise.all([readJson(DATASET_URL), readJson(SCHEMA_URL)]);
  const { errors, warnings } = validateDataset(dataset, schema);

  if (!quiet && errors.length === 0) report(dataset);
  if (!quiet) warnings.forEach((warning) => console.warn(`warning: ${warning}`));
  errors.forEach((error) => console.error(`error: ${error}`));

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exitCode = errors.length > 0 ? 1 : 0;
} catch (error) {
  console.error(`Validation could not run: ${error.message}`);
  process.exitCode = 2;
}
