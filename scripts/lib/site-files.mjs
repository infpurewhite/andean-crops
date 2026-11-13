/**
 * Files the explorer needs at runtime, and the safety check used when copying
 * them into another site (scripts/copy-site.mjs).
 *
 * @module site-files
 */

import { readdir } from "node:fs/promises";
import { resolve, sep } from "node:path";

/** Runtime files, relative to the repository root. Tests check completeness. */
export const RUNTIME_FILES = Object.freeze([
  "index.html",
  "assets/css/styles.css",
  "assets/js/app.js",
  "assets/js/catalogue.js",
  "assets/js/citations.js",
  "assets/js/dom.js",
  "assets/js/main.js",
  "assets/js/nutrition.js",
  "data/andean-crops.json",
  "data/derived/andean-crops-long.csv",
]);

/** Marker file written into a copy; its presence allows the copy to be refreshed. */
export const SOURCE_MARKER = "SOURCE.txt";

/**
 * Refuse targets inside the source repository, and non-empty directories
 * that are not a previous copy, so a site's own files are never overwritten.
 *
 * @param {string} target Target directory.
 * @param {string} root Source repository root.
 * @returns {Promise<void>}
 * @throws {Error} If the target is unsafe.
 */
export async function assertSafeTarget(target, root) {
  const resolvedTarget = resolve(target);
  const resolvedRoot = resolve(root);
  if (resolvedTarget === resolvedRoot || resolvedTarget.startsWith(resolvedRoot + sep)) {
    throw new Error("The target must be outside this repository.");
  }
  let entries;
  try {
    entries = await readdir(resolvedTarget);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  if (entries.length > 0 && !entries.includes(SOURCE_MARKER)) {
    throw new Error(
      `${resolvedTarget} is not empty and is not a previous copy (no ${SOURCE_MARKER}); ` +
        "choose a new or empty directory.",
    );
  }
}
