/**
 * Compare dataset bibliography entries with Crossref metadata.
 *
 * @module crossref
 */

/**
 * Normalise a title for comparison: strip markup and diacritics, lower-case,
 * and collapse punctuation to single spaces.
 *
 * @param {string} title Title text.
 * @returns {string}
 */
export function normaliseTitle(title) {
  return String(title ?? "")
    .replace(/<[^>]+>/g, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

/**
 * Jaccard similarity of the word sets of two titles.
 *
 * @param {string} a First title.
 * @param {string} b Second title.
 * @returns {number} Value in [0, 1].
 */
export function titleSimilarity(a, b) {
  const setA = new Set(normaliseTitle(a).split(" ").filter(Boolean));
  const setB = new Set(normaliseTitle(b).split(" ").filter(Boolean));
  if (setA.size === 0 && setB.size === 0) return 1;
  let shared = 0;
  for (const word of setA) if (setB.has(word)) shared += 1;
  return shared / (setA.size + setB.size - shared);
}

/**
 * Publication year from a Crossref work record (print, then issued, then online).
 *
 * @param {object} message Crossref "message" object.
 * @returns {number|null}
 */
export function crossrefYear(message) {
  for (const key of ["published-print", "issued", "published-online"]) {
    const year = message?.[key]?.["date-parts"]?.[0]?.[0];
    if (Number.isInteger(year)) return year;
  }
  return null;
}

/**
 * Compare a source record with Crossref metadata for its DOI.
 *
 * A one-year difference is reported as a note rather than an issue, because
 * online-first and print years often differ.
 *
 * @param {object} source Dataset source record.
 * @param {object} message Crossref "message" object for source.doi.
 * @param {{minTitleSimilarity?: number}} [options] Thresholds.
 * @returns {{ok: boolean, issues: string[], notes: string[]}}
 */
export function compareWithCrossref(source, message, { minTitleSimilarity = 0.8 } = {}) {
  const issues = [];
  const notes = [];

  const crossrefTitle = message?.title?.[0] ?? "";
  const similarity = titleSimilarity(source.title, crossrefTitle);
  if (similarity < minTitleSimilarity) {
    issues.push(`title differs (similarity ${similarity.toFixed(2)}): "${crossrefTitle}"`);
  }

  const year = crossrefYear(message);
  if (year !== null && source.year !== null) {
    const gap = Math.abs(year - source.year);
    if (gap > 1) issues.push(`year ${source.year} differs from Crossref ${year}`);
    else if (gap === 1) notes.push(`year ${source.year}; Crossref gives ${year}`);
  }

  const firstAuthor = source.authors[0];
  const crossrefFamily = message?.author?.[0]?.family;
  if (firstAuthor?.family && crossrefFamily && normaliseTitle(firstAuthor.family) !== normaliseTitle(crossrefFamily)) {
    issues.push(`first author "${firstAuthor.family}" differs from Crossref "${crossrefFamily}"`);
  }

  if (source.volume && message?.volume && String(message.volume) !== source.volume) {
    issues.push(`volume ${source.volume} differs from Crossref ${message.volume}`);
  }

  return { ok: issues.length === 0, issues, notes };
}
