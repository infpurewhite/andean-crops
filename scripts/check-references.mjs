#!/usr/bin/env node
/**
 * Check every DOI in the dataset bibliography against Crossref and report
 * mismatches in title, year, first author or volume. Needs internet access.
 *
 * Usage: npm run check:references
 * Optional: set CROSSREF_MAILTO to join Crossref's "polite" pool.
 */

import { setTimeout as delay } from "node:timers/promises";
import { DATASET_URL, readJson } from "./lib/dataset-validation.mjs";
import { compareWithCrossref } from "./lib/crossref.mjs";

const API = "https://api.crossref.org/works/";
const REQUEST_TIMEOUT_MS = 20_000;
const PAUSE_MS = 300;

function userAgent() {
  const contact = process.env.CROSSREF_MAILTO ? `; mailto:${process.env.CROSSREF_MAILTO}` : "";
  return `andean-crops-reference-check/0.2 (+https://github.com/infpurewhite/andean-crops${contact})`;
}

async function fetchWork(doi) {
  const response = await fetch(`${API}${encodeURIComponent(doi)}`, {
    headers: { Accept: "application/json", "User-Agent": userAgent() },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()).message;
}

async function main() {
  const dataset = await readJson(DATASET_URL);
  const withDoi = dataset.sources.filter((source) => source.doi);
  let problems = 0;

  for (const source of withDoi) {
    try {
      const message = await fetchWork(source.doi);
      if (message === null) {
        problems += 1;
        console.error(`FAIL ${source.id}: DOI ${source.doi} not found in Crossref`);
      } else {
        const { ok, issues, notes } = compareWithCrossref(source, message);
        if (!ok) problems += 1;
        console.log(`${ok ? "ok  " : "FAIL"} ${source.id}`);
        for (const issue of issues) console.log(`     issue: ${issue}`);
        for (const note of notes) console.log(`     note: ${note}`);
      }
    } catch (error) {
      problems += 1;
      console.error(`ERR  ${source.id}: ${error.message}`);
    }
    await delay(PAUSE_MS);
  }

  const withoutDoi = dataset.sources.filter((source) => !source.doi && source.type === "article");
  for (const source of withoutDoi) console.warn(`warn ${source.id}: journal article without a DOI`);

  console.log(`\nChecked ${withDoi.length} DOI(s); ${problems} problem(s).`);
  process.exitCode = problems > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(`Reference check could not run: ${error.message}`);
  process.exitCode = 2;
});
