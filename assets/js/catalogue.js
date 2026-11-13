/**
 * Searching, filtering, sorting and URL state for the crop catalogue.
 * Pure functions only; no DOM access.
 *
 * @module catalogue
 */

import { BASES, effectiveBasis, expressValue, verificationSummary } from "./nutrition.js";

/** Display labels for crop groups. */
export const CROP_GROUP_LABELS = Object.freeze({
  pseudocereal: "Pseudocereal",
  cereal: "Cereal",
  grain_legume: "Grain legume",
  root_tuber: "Root or tuber crop",
});

/** Display labels for the condition of the food as described. */
export const CONDITION_LABELS = Object.freeze({
  dry: "Dry",
  dried: "Dried",
  fresh: "Fresh",
});

/**
 * Sort options. Components are sorted in the stated direction on the active
 * basis; records without a value on that basis are placed last.
 */
export const SORT_OPTIONS = Object.freeze({
  name: Object.freeze({ label: "Name (A–Z)" }),
  "protein-desc": Object.freeze({ label: "Protein (high to low)", component: "protein", direction: "desc" }),
  "fibre-desc": Object.freeze({ label: "Dietary fibre (high to low)", component: "fibre", direction: "desc" }),
  "fat-desc": Object.freeze({ label: "Fat (high to low)", component: "fat", direction: "desc" }),
  "iron-desc": Object.freeze({ label: "Iron (high to low)", component: "iron", direction: "desc" }),
  "calcium-desc": Object.freeze({ label: "Calcium (high to low)", component: "calcium", direction: "desc" }),
  "energy-asc": Object.freeze({ label: "Energy (low to high)", component: "energy", direction: "asc" }),
});

/** Default UI state. */
export const DEFAULT_STATE = Object.freeze({
  query: "",
  group: "all",
  basis: BASES.AS_DESCRIBED,
  sort: "name",
  view: "cards",
  sourcedOnly: false,
});

const VIEWS = new Set(["cards", "table"]);
const MAX_QUERY_LENGTH = 100;

/**
 * Lower-case text and strip diacritics so that "canihua" matches "Cañihua".
 *
 * @param {string} text Input text.
 * @returns {string}
 */
export function normaliseText(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Binomial name of a crop, e.g. "Chenopodium quinoa".
 *
 * @param {object} crop Crop record.
 * @returns {string}
 */
export function scientificName(crop) {
  return `${crop.taxon.genus} ${crop.taxon.species}`;
}

/**
 * Concatenate the searchable fields of a crop record.
 *
 * @param {object} crop Crop record.
 * @returns {string} Normalised text.
 */
export function searchableText(crop) {
  return normaliseText(
    [
      crop.names.common,
      ...crop.names.alternative,
      scientificName(crop),
      crop.taxon.family,
      CROP_GROUP_LABELS[crop.crop_group] ?? crop.crop_group,
      crop.edible_part,
      ...crop.notes.map((note) => note.text),
    ].join(" "),
  );
}

/**
 * Whether every reported value of a crop has an identified source.
 *
 * @param {object} crop Crop record.
 * @returns {boolean}
 */
export function hasIdentifiedSource(crop) {
  return verificationSummary(crop).unverified === 0;
}

/**
 * Filter crops by free-text query, crop group and source status.
 * All query terms must match (logical AND).
 *
 * @param {object[]} crops Crop records.
 * @param {{query?: string, group?: string, sourcedOnly?: boolean}} criteria Filter criteria.
 * @returns {object[]} New array.
 */
export function filterCrops(crops, { query = "", group = "all", sourcedOnly = false } = {}) {
  const terms = normaliseText(query).split(/\s+/).filter(Boolean);
  return crops.filter((crop) => {
    if (group !== "all" && crop.crop_group !== group) return false;
    if (sourcedOnly && !hasIdentifiedSource(crop)) return false;
    if (terms.length === 0) return true;
    const haystack = searchableText(crop);
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Sort crops by name or by a component on the given basis (energy falls back
 * to the as-described basis when sorting per 100 kcal). Missing values sort
 * last; ties are broken by common name.
 *
 * @param {object[]} crops Crop records.
 * @param {string} sortKey Key of {@link SORT_OPTIONS}.
 * @param {string} basis One of BASES.
 * @returns {object[]} New array.
 * @throws {RangeError} If the sort key is unknown.
 */
export function sortCrops(crops, sortKey, basis) {
  const option = SORT_OPTIONS[sortKey];
  if (!option) throw new RangeError(`Unknown sort key: ${sortKey}`);
  const byName = (a, b) => a.names.common.localeCompare(b.names.common, "en-GB", { sensitivity: "base" });
  if (!option.component) return [...crops].sort(byName);

  const sign = option.direction === "asc" ? 1 : -1;
  const sortBasis = effectiveBasis(option.component, basis);
  const keyed = crops.map((crop) => ({ crop, value: expressValue(crop, option.component, sortBasis) }));
  keyed.sort((a, b) => {
    if (a.value === null && b.value === null) return byName(a.crop, b.crop);
    if (a.value === null) return 1;
    if (b.value === null) return -1;
    return sign * (a.value - b.value) || byName(a.crop, b.crop);
  });
  return keyed.map(({ crop }) => crop);
}

/**
 * Distinct food conditions among crops (used to warn about mixed states).
 *
 * @param {object[]} crops Crop records.
 * @returns {string[]} Sorted condition codes.
 */
export function distinctConditions(crops) {
  return [...new Set(crops.map((crop) => crop.food.condition))].sort();
}

/**
 * Parse UI state from URL search parameters, falling back to defaults for
 * missing or invalid entries.
 *
 * @param {URLSearchParams} params URL search parameters.
 * @param {string[]} groups Valid crop-group codes.
 * @returns {typeof DEFAULT_STATE}
 */
export function parseState(params, groups) {
  const pick = (key, valid) => {
    const value = params.get(key);
    return value !== null && valid(value) ? value : DEFAULT_STATE[key];
  };
  return {
    query: (params.get("q") ?? DEFAULT_STATE.query).slice(0, MAX_QUERY_LENGTH),
    group: pick("group", (v) => v === "all" || groups.includes(v)),
    basis: pick("basis", (v) => Object.values(BASES).includes(v)),
    sort: pick("sort", (v) => Object.hasOwn(SORT_OPTIONS, v)),
    view: pick("view", (v) => VIEWS.has(v)),
    sourcedOnly: params.get("sourced") === "1",
  };
}

/**
 * Serialise UI state to URL search parameters, omitting default values.
 *
 * @param {typeof DEFAULT_STATE} state UI state.
 * @returns {URLSearchParams}
 */
export function serialiseState(state) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  for (const key of ["group", "basis", "sort", "view"]) {
    if (state[key] !== DEFAULT_STATE[key]) params.set(key, state[key]);
  }
  if (state.sourcedOnly) params.set("sourced", "1");
  return params;
}
