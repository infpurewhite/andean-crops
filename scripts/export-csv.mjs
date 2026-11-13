#!/usr/bin/env node
/**
 * Write data/derived/andean-crops-long.csv from data/andean-crops.json.
 * The CSV is a derived artefact: edit the JSON, then re-run this script.
 *
 * Usage: npm run export
 */

import { mkdir, writeFile } from "node:fs/promises";
import { DATASET_URL, readJson } from "./lib/dataset-validation.mjs";
import { tidyRows, toCsv } from "./lib/tidy-export.mjs";

const OUTPUT_URL = new URL("../data/derived/andean-crops-long.csv", import.meta.url);

try {
  const dataset = await readJson(DATASET_URL);
  const rows = tidyRows(dataset);
  await mkdir(new URL(".", OUTPUT_URL), { recursive: true });
  await writeFile(OUTPUT_URL, toCsv(rows), "utf8");
  console.log(`Wrote ${rows.length} rows to ${OUTPUT_URL.pathname}`);
} catch (error) {
  console.error(`Export failed: ${error.message}`);
  process.exitCode = 1;
}
