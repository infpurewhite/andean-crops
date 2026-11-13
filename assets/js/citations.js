/**
 * Harvard (author–date) citation formatting for dataset sources.
 * Pure functions only; no DOM access.
 *
 * @module citations
 */

/**
 * Name used for an author in citations.
 *
 * @param {{family?: string, given?: string, literal?: string}} author Author record.
 * @returns {string}
 */
function citationName(author) {
  return author.literal ?? author.family;
}

/**
 * Join names as "A", "A and B", or "A, B and C".
 *
 * @param {string[]} names Names to join.
 * @returns {string}
 */
export function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * Author part of an in-text citation, e.g. "Wang and Zhu" or "Campos et al.".
 *
 * @param {object} source Source record.
 * @returns {string}
 */
function citationAuthors(source) {
  const names = source.authors.map(citationName);
  return names.length > 2 ? `${names[0]} et al.` : joinNames(names);
}

/**
 * Year labels that keep author–date citations unique: works sharing the same
 * author part and year get "a", "b", … in reference-list (title) order.
 *
 * @param {object[]} sources Source records that will be cited together.
 * @returns {Map<string, string>} Source id → year label, e.g. "2012a".
 */
export function yearLabels(sources) {
  const groups = new Map();
  for (const source of sortReferences(sources)) {
    const key = `${citationAuthors(source)}|${source.year}`;
    groups.set(key, [...(groups.get(key) ?? []), source]);
  }
  const labels = new Map();
  for (const group of groups.values()) {
    group.forEach((source, index) => {
      const year = String(source.year ?? "n.d.");
      const suffix = group.length > 1 ? String.fromCharCode(97 + index) : "";
      labels.set(source.id, `${year}${suffix}`);
    });
  }
  return labels;
}

/**
 * In-text citation without parentheses, e.g. "Wang and Zhu, 2019" or
 * "Campos et al., 2006".
 *
 * @param {object} source Source record.
 * @param {string} [yearLabel] Year, possibly disambiguated (see {@link yearLabels}).
 * @returns {string}
 */
export function inTextCitation(source, yearLabel = String(source.year ?? "n.d.")) {
  return `${citationAuthors(source)}, ${yearLabel}`;
}

/**
 * DOI as a resolvable HTTPS URL.
 *
 * @param {string} doi Bare DOI, e.g. "10.1002/jsfa.2529".
 * @returns {string}
 */
export function doiUrl(doi) {
  return `https://doi.org/${doi}`;
}

/**
 * @typedef {object} ReferenceSegment
 * @property {string} text Text of the segment.
 * @property {boolean} [italic] Whether the segment is set in italics.
 * @property {string} [href] Link target, if the segment is a link.
 */

/**
 * Full Harvard reference as ordered segments, so that a renderer can apply
 * italics and links without parsing strings.
 *
 * @param {object} source Source record.
 * @param {string} [yearLabel] Year, possibly disambiguated (see {@link yearLabels}).
 * @returns {ReferenceSegment[]}
 */
export function referenceSegments(source, yearLabel = String(source.year ?? "n.d.")) {
  const authors = joinNames(
    source.authors.map((a) => (a.literal ? a.literal : `${a.family}, ${a.given}`)),
  );
  const segments = [{ text: `${authors} (${yearLabel}) ` }];

  if (source.type === "article") {
    const issue = source.issue ? `(${source.issue})` : "";
    const pages = /^\d+$/.test(source.pages) ? `article ${source.pages}` : `pp. ${source.pages}`;
    segments.push(
      { text: `‘${source.title}’, ` },
      { text: source.container, italic: true },
      { text: `, ${source.volume}${issue}, ${pages}.` },
    );
  } else {
    segments.push({ text: source.title, italic: true }, { text: "." });
    if (source.container) segments.push({ text: ` ${source.container}.` });
    if (source.edition) segments.push({ text: ` ${source.edition}.` });
    const imprint = [source.place, source.publisher].filter(Boolean).join(": ");
    if (imprint) segments.push({ text: ` ${imprint}.` });
  }

  if (source.doi) {
    segments.push({ text: " " }, { text: `doi:${source.doi}`, href: doiUrl(source.doi) });
  } else if (source.url) {
    segments.push({ text: " Available at: " }, { text: source.url, href: source.url });
  }
  return segments;
}

/**
 * Full Harvard reference as plain text.
 *
 * @param {object} source Source record.
 * @param {string} [yearLabel] Year, possibly disambiguated (see {@link yearLabels}).
 * @returns {string}
 */
export function formatReference(source, yearLabel) {
  return referenceSegments(source, yearLabel)
    .map((segment) => segment.text)
    .join("");
}

/**
 * Sort sources alphabetically by first author, then year.
 *
 * @param {object[]} sources Source records.
 * @returns {object[]} New array.
 */
export function sortReferences(sources) {
  const key = (s) => citationName(s.authors[0]);
  return [...sources].sort(
    (a, b) =>
      key(a).localeCompare(key(b), "en-GB", { sensitivity: "base" }) ||
      (a.year ?? 0) - (b.year ?? 0) ||
      a.title.localeCompare(b.title, "en-GB"),
  );
}
