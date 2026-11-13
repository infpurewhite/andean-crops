/**
 * Browser controller for the crop explorer. It owns the UI state, binds the
 * controls and renders the dataset; calculations live in nutrition.js and
 * catalogue.js.
 *
 * @module app
 */

import { append, h } from "./dom.js";
import {
  BASES,
  effectiveBasis,
  expressValue,
  formatNumber,
  getValue,
  isPending,
  qualityChecks,
  unitLabel,
  verificationSummary,
} from "./nutrition.js";
import {
  CONDITION_LABELS,
  CROP_GROUP_LABELS,
  DEFAULT_STATE,
  SORT_OPTIONS,
  distinctConditions,
  filterCrops,
  parseState,
  scientificName,
  serialiseState,
  sortCrops,
} from "./catalogue.js";
import { inTextCitation, referenceSegments, sortReferences, yearLabels } from "./citations.js";

const BASIS_OPTIONS = Object.freeze([
  { value: BASES.AS_DESCRIBED, label: "Per 100 g as described" },
  { value: BASES.DRY_MATTER, label: "Per 100 g dry matter" },
  { value: BASES.PER_ENERGY, label: "Per 100 kcal" },
]);

const VIEW_OPTIONS = Object.freeze([
  { value: "cards", label: "Cards" },
  { value: "table", label: "Table" },
]);

const HEADLINE_COMPONENTS = Object.freeze(["energy", "protein", "fibre"]);
const DETAIL_COMPONENTS = Object.freeze(["carbohydrate_total", "fat", "water", "ash", "calcium", "iron"]);
const TABLE_COMPONENTS = Object.freeze([
  "energy",
  "water",
  "protein",
  "fat",
  "carbohydrate_total",
  "fibre",
  "ash",
  "calcium",
  "iron",
]);
const NOTE_KIND_ORDER = Object.freeze(["bioactive", "antinutrient", "processing", "context"]);

/** Compact column headings for the table view; full labels are used elsewhere. */
const TABLE_LABELS = Object.freeze({
  fat: "Fat",
  carbohydrate_total: "Carbohydrate, total",
  fibre: "Fibre",
});

const NOTE_KIND_LABELS = Object.freeze({
  bioactive: "Bioactive compounds",
  antinutrient: "Antinutrients and toxicants",
  processing: "Processing",
  context: "Context",
});

const STATUS_BADGES = Object.freeze({
  verified: { label: "Verified", tone: "positive" },
  corroborated: { label: "Source identified", tone: "positive" },
  partial: { label: "Partly sourced", tone: "caution" },
  unverified: { label: "Source not documented", tone: "caution" },
  pending: { label: "Composition pending", tone: "neutral" },
});

const MATCH_LABELS = Object.freeze({
  direct: "Direct: the source describes this crop",
  proxy: "Proxy: the source describes a related food",
  unknown: "Unknown",
});

const CHECK_LABELS = Object.freeze({
  energy: "Energy recalculation",
  "proximate-sum": "Proximate sum",
  "fibre-within-carbohydrate": "Fibre within total carbohydrate",
  "macronutrient-total": "Macronutrient total",
});

const CHECK_STATUS_LABELS = Object.freeze({
  pass: "Pass",
  warn: "Review",
  fail: "Fail",
  "not-applicable": "n/a",
});

const ELEMENT_IDS = Object.freeze({
  summary: "dataset-summary",
  form: "controls",
  search: "search-input",
  group: "group-select",
  basis: "basis-options",
  sort: "sort-select",
  view: "view-options",
  sourcedOnly: "sourced-only",
  reset: "reset-controls",
  basisNote: "basis-note",
  status: "results-status",
  results: "results",
  methods: "methods-content",
  references: "reference-list",
  credits: "photo-credits",
  version: "dataset-version",
});

/** Interactive explorer bound to the page markup in index.html. */
export class CropExplorer {
  /**
   * @param {Document} doc Document that contains the explorer markup.
   * @param {object} dataset Parsed dataset (data/andean-crops.json).
   * @param {{location?: Location, history?: History}} [env] Browser objects, injectable for testing.
   */
  constructor(doc, dataset, { location = window.location, history = window.history } = {}) {
    this.doc = doc;
    this.dataset = dataset;
    this.location = location;
    this.history = history;
    this.components = new Map(dataset.components.map((component) => [component.id, component]));
    this.sources = new Map(dataset.sources.map((source) => [source.id, source]));
    this.groups = Object.keys(CROP_GROUP_LABELS).filter((group) =>
      dataset.crops.some((crop) => crop.crop_group === group),
    );
    this.yearLabels = yearLabels(this.citedSources());
    this.state = { ...DEFAULT_STATE };
    this.el = this.queryElements();
  }

  /** Build controls and static sections, restore state from the URL and render. */
  start() {
    this.buildControls();
    this.renderSummary();
    this.renderMethods();
    this.renderReferences();
    this.renderCredits();
    this.state = parseState(new URLSearchParams(this.location.search), this.groups);
    this.syncControls();
    this.bindEvents();
    this.render();
  }

  queryElements() {
    const elements = {};
    for (const [key, id] of Object.entries(ELEMENT_IDS)) {
      const element = this.doc.getElementById(id);
      if (!element) throw new Error(`Required element #${id} is missing from the page.`);
      elements[key] = element;
    }
    return elements;
  }

  buildControls() {
    append(this.el.group, [
      h("option", { value: "all" }, "All crop groups"),
      this.groups.map((group) => h("option", { value: group }, CROP_GROUP_LABELS[group])),
    ]);
    append(
      this.el.sort,
      Object.entries(SORT_OPTIONS).map(([value, option]) => h("option", { value }, option.label)),
    );
    append(this.el.basis, BASIS_OPTIONS.map((option) => segmentedOption("basis", option)));
    append(this.el.view, VIEW_OPTIONS.map((option) => segmentedOption("view", option)));
  }

  syncControls() {
    const { search, group, sort, form, sourcedOnly } = this.el;
    search.value = this.state.query;
    group.value = this.state.group;
    sort.value = this.state.sort;
    sourcedOnly.checked = this.state.sourcedOnly;
    for (const name of ["basis", "view"]) {
      for (const input of form.querySelectorAll(`input[name="${name}"]`)) {
        input.checked = input.value === this.state[name];
      }
    }
  }

  bindEvents() {
    const { form, search, group, sort, sourcedOnly, reset } = this.el;
    form.addEventListener("submit", (event) => event.preventDefault());
    search.addEventListener("input", () => this.setState({ query: search.value }));
    group.addEventListener("change", () => this.setState({ group: group.value }));
    sort.addEventListener("change", () => this.setState({ sort: sort.value }));
    sourcedOnly.addEventListener("change", () => this.setState({ sourcedOnly: sourcedOnly.checked }));
    form.addEventListener("change", (event) => {
      const { name, value } = event.target;
      if (name === "basis" || name === "view") this.setState({ [name]: value });
    });
    reset.addEventListener("click", () => this.resetState());
  }

  resetState() {
    this.state = { ...DEFAULT_STATE };
    this.syncControls();
    this.updateUrl();
    this.render();
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.updateUrl();
    this.render();
  }

  updateUrl() {
    const query = serialiseState(this.state).toString();
    const url = `${this.location.pathname}${query ? `?${query}` : ""}${this.location.hash}`;
    this.history.replaceState(null, "", url);
  }

  render() {
    const crops = sortCrops(filterCrops(this.dataset.crops, this.state), this.state.sort, this.state.basis);
    this.renderStatus(crops.length);
    this.renderBasisNote(crops);
    let content;
    if (crops.length === 0) content = this.emptyState();
    else if (this.state.view === "table") content = this.table(crops);
    else content = h("div", { class: "card-grid" }, crops.map((crop) => this.card(crop)));
    this.el.results.replaceChildren(content);
  }

  renderStatus(count) {
    const total = this.dataset.crops.length;
    const query = this.state.query.trim();
    this.el.status.textContent =
      `Showing ${count} of ${total} crops` + (query ? ` matching “${query}”` : "") + ".";
  }

  renderBasisNote(crops) {
    const note = this.el.basisNote;
    let message = null;
    if (this.state.basis === BASES.AS_DESCRIBED && distinctConditions(crops).length > 1) {
      message =
        "These foods are in different states (dry seeds and kernels, dried hypocotyl, fresh tubers), " +
        "so values per 100 g are not like-for-like. Compare on a dry-matter or per-100 kcal basis.";
    } else if (this.state.basis === BASES.DRY_MATTER) {
      const withWater = crops.filter((crop) => getValue(crop, "water") !== null).length;
      message =
        `Dry-matter values need the water content, which is reported for ${withWater} of the ` +
        `${crops.length} crops shown. Other values are shown as “–”.`;
    } else if (this.state.basis === BASES.PER_ENERGY) {
      message =
        "Values per 100 kcal express nutrient density and do not depend on water content. " +
        "Energy is shown per 100 g as described.";
    }
    note.hidden = message === null;
    note.textContent = message ?? "";
  }

  emptyState() {
    return h(
      "div",
      { class: "empty-state" },
      h("h2", {}, "No crops match these filters"),
      h("p", {}, "Change the search text or crop group, or clear all filters."),
      h("button", { type: "button", class: "button", onclick: () => this.resetState() }, "Clear filters"),
    );
  }

  /**
   * Value of a component as displayed: on the active basis, except energy
   * per 100 kcal, which is shown per 100 g as described.
   */
  displayValue(crop, componentId) {
    const component = this.components.get(componentId);
    const basis = effectiveBasis(componentId, this.state.basis);
    const value = expressValue(crop, componentId, basis);
    const decimals = component.decimals + (basis === BASES.PER_ENERGY ? 1 : 0);
    return { component, basis, value, decimals, unit: unitLabel(component.unit, basis) };
  }

  missingReason(crop, componentId, basis) {
    if (isPending(crop)) return "Composition pending";
    if (getValue(crop, componentId) === null) return "Not reported";
    if (basis === BASES.DRY_MATTER && componentId === "water") return "Not applicable on a dry-matter basis";
    if (basis === BASES.DRY_MATTER) return "Water content not reported, so no dry-matter value";
    return "Not available";
  }

  valueNode(crop, componentId, { withUnit = true } = {}) {
    const { value, decimals, unit, basis } = this.displayValue(crop, componentId);
    if (value === null) {
      const reason = this.missingReason(crop, componentId, basis);
      return h(
        "span",
        { class: "value value--missing", title: reason },
        h("span", { "aria-hidden": "true" }, "–"),
        h("span", { class: "visually-hidden" }, reason),
      );
    }
    const entry = crop.composition.values[componentId];
    const unverified = entry.verification === "unverified";
    return h(
      "span",
      { class: `value${unverified ? " value--unverified" : ""}`, title: unverified ? "Unverified value" : null },
      h("data", { value: String(value) }, formatNumber(value, decimals)),
      withUnit ? [" ", h("span", { class: "unit" }, unit)] : null,
    );
  }

  card(crop) {
    const summary = verificationSummary(crop);
    const badge = STATUS_BADGES[summary.level];
    const headingId = `crop-${crop.id}-name`;
    return h(
      "article",
      { class: "crop-card", id: `crop-${crop.id}`, "aria-labelledby": headingId },
      this.figure(crop),
      h(
        "header",
        { class: "crop-card__header" },
        h(
          "div",
          { class: "crop-card__tags" },
          h("span", { class: `tag tag--${crop.crop_group}` }, CROP_GROUP_LABELS[crop.crop_group]),
          h("span", { class: `status status--${badge.tone}` }, badge.label),
        ),
        h("h2", { class: "crop-card__name", id: headingId }, crop.names.common),
        crop.names.alternative.length > 0
          ? h("p", { class: "crop-card__alt" }, crop.names.alternative.join(" · "))
          : null,
        h("p", { class: "crop-card__taxon" }, taxonNode(crop, true), h("span", { class: "family" }, crop.taxon.family)),
        h(
          "p",
          { class: "crop-card__food" },
          h("span", { class: `condition condition--${crop.food.condition}` }, CONDITION_LABELS[crop.food.condition]),
          " ",
          crop.food.description,
        ),
      ),
      crop.flags.length > 0
        ? h("ul", { class: "flags" }, crop.flags.map((flag) => h("li", { class: "flag" }, flag.text)))
        : null,
      isPending(crop) ? this.pendingPanel(crop) : this.valuesSection(crop),
      this.notesSection(crop),
      this.provenance(crop, summary),
    );
  }

  pendingPanel(crop) {
    return h(
      "div",
      { class: "pending" },
      h("p", { class: "pending__title" }, "Composition data pending"),
      h("p", {}, crop.composition.note),
    );
  }

  figure(crop) {
    const { image } = crop;
    if (!image) return null;
    const { credit } = image;
    const licence = credit.licence_url
      ? h("a", { href: credit.licence_url, rel: "license noopener" }, credit.licence)
      : credit.licence;
    return h(
      "figure",
      { class: "crop-card__media" },
      h("img", {
        src: image.file,
        alt: image.alt,
        width: image.width,
        height: image.height,
        loading: "lazy",
        decoding: "async",
      }),
      h(
        "figcaption",
        {},
        `Photo: ${credit.author} · `,
        licence,
        " · ",
        h("a", { href: credit.source_url, rel: "noopener" }, "Wikimedia Commons"),
      ),
    );
  }

  valuesSection(crop) {
    return [
      h(
        "dl",
        { class: "metrics" },
        HEADLINE_COMPONENTS.map((id) => {
          const { component, basis } = this.displayValue(crop, id);
          const label = basis === this.state.basis ? component.label : `${component.label} (per 100 g)`;
          return h("div", { class: "metric" }, h("dt", {}, label), h("dd", {}, this.valueNode(crop, id)));
        }),
      ),
      h(
        "dl",
        { class: "detail-list" },
        DETAIL_COMPONENTS.map((id) =>
          h("div", {}, h("dt", {}, this.components.get(id).label), h("dd", {}, this.valueNode(crop, id))),
        ),
      ),
    ];
  }

  notesSection(crop) {
    if (crop.notes.length === 0) return null;
    return h(
      "section",
      { class: "notes", "aria-label": `Notes on ${crop.names.common}` },
      NOTE_KIND_ORDER.map((kind) => {
        const notes = crop.notes.filter((note) => note.kind === kind);
        if (notes.length === 0) return null;
        return [
          h("h3", { class: "notes__heading" }, NOTE_KIND_LABELS[kind]),
          h("ul", { class: "notes__list" }, notes.map((note) => this.noteItem(note))),
        ];
      }),
    );
  }

  noteItem(note) {
    return h(
      "li",
      {},
      note.text,
      " ",
      this.citationGroup(note.refs),
      note.refs.length > 0 && !note.checked
        ? [
            " ",
            h(
              "span",
              { class: "note-flag", title: "This statement has not yet been checked against the cited source." },
              "not yet checked",
            ),
          ]
        : null,
    );
  }

  citationLink(sourceId) {
    const source = this.sources.get(sourceId);
    return h("a", { class: "citation", href: `#ref-${sourceId}` }, inTextCitation(source, this.yearLabels.get(sourceId)));
  }

  citationGroup(refs) {
    if (refs.length === 0) return h("span", { class: "citation-needed" }, "[citation needed]");
    const links = refs.flatMap((id, index) => (index === 0 ? [this.citationLink(id)] : ["; ", this.citationLink(id)]));
    return h("span", { class: "citation-group" }, "(", links, ")");
  }

  provenance(crop, summary) {
    if (isPending(crop)) {
      return h(
        "details",
        { class: "provenance" },
        h("summary", {}, "Provenance"),
        h(
          "dl",
          { class: "provenance__list" },
          h("div", {}, h("dt", {}, "Composition"), h("dd", {}, `Pending. ${crop.composition.note}`)),
          crop.taxon.note ? h("div", {}, h("dt", {}, "Taxonomy"), h("dd", {}, crop.taxon.note)) : null,
        ),
      );
    }
    const source = this.sources.get(crop.composition.source);
    const sourceNode =
      source.type === "internal"
        ? "Not documented (values inherited from version 0.1)"
        : [this.citationLink(source.id), crop.composition.source_record ? `, ${crop.composition.source_record}` : ""];
    const identified = summary.verified + summary.corroborated;
    const rows = [
      ["Source", sourceNode],
      ["Food match", MATCH_LABELS[crop.composition.match]],
      [
        "Verification",
        `${identified} of ${summary.total} values with an identified source; ` +
          `${summary.verified} checked against the primary record.`,
      ],
      crop.food.note ? ["Food note", crop.food.note] : null,
      crop.taxon.note ? ["Taxonomy", crop.taxon.note] : null,
    ].filter(Boolean);

    return h(
      "details",
      { class: "provenance" },
      h("summary", {}, "Provenance and quality checks"),
      h(
        "dl",
        { class: "provenance__list" },
        rows.map(([term, description]) => h("div", {}, h("dt", {}, term), h("dd", {}, description))),
      ),
      h("h3", { class: "provenance__heading" }, "Quality checks"),
      h(
        "ul",
        { class: "checks" },
        qualityChecks(crop).map((check) =>
          h(
            "li",
            { class: `check check--${check.status}` },
            h("span", { class: "check__status" }, CHECK_STATUS_LABELS[check.status]),
            h("span", { class: "check__label" }, CHECK_LABELS[check.id] ?? check.id),
            h("span", { class: "check__detail" }, describeCheck(check)),
          ),
        ),
      ),
    );
  }

  table(crops) {
    const basis = this.state.basis;
    const columns = TABLE_COMPONENTS.filter((id) => !(id === "water" && basis === BASES.DRY_MATTER));
    const sortOption = SORT_OPTIONS[this.state.sort];
    const basisLabel = BASIS_OPTIONS.find((option) => option.value === basis).label.toLowerCase();

    const headerCells = columns.map((id) => {
      const { component } = this.displayValue(crops[0], id);
      const unit = unitLabel(component.unit, effectiveBasis(id, basis));
      const sorted = sortOption.component === id;
      return h(
        "th",
        {
          scope: "col",
          class: "num",
          "aria-sort": sorted ? (sortOption.direction === "asc" ? "ascending" : "descending") : null,
        },
        TABLE_LABELS[id] ? h("abbr", { title: component.label }, TABLE_LABELS[id]) : component.label,
        h("span", { class: "unit" }, unit),
      );
    });

    const rows = crops.map((crop) => {
      const badge = STATUS_BADGES[verificationSummary(crop).level];
      return h(
        "tr",
        {},
        h(
          "th",
          { scope: "row" },
          crop.image
            ? h("img", {
                class: "table-thumb",
                src: crop.image.file,
                alt: "",
                width: 56,
                height: 42,
                loading: "lazy",
                decoding: "async",
              })
            : null,
          h("span", { class: "table-name" }, crop.names.common),
          h("span", { class: "table-taxon" }, taxonNode(crop, false)),
        ),
        h("td", {}, CONDITION_LABELS[crop.food.condition]),
        columns.map((id) => h("td", { class: "num" }, this.valueNode(crop, id, { withUnit: false }))),
        h("td", {}, h("span", { class: `status status--${badge.tone}` }, badge.label)),
      );
    });

    return h(
      "div",
      { class: "table-wrap", role: "region", "aria-label": "Composition table", tabindex: "0" },
      h(
        "table",
        { class: "data-table" },
        h("caption", {}, `Composition of ${crops.length} crops, ${basisLabel}.`),
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            h("th", { scope: "col", "aria-sort": sortOption.component ? null : "ascending" }, "Crop"),
            h("th", { scope: "col" }, "Food state"),
            headerCells,
            h("th", { scope: "col" }, "Source status"),
          ),
        ),
        h("tbody", {}, rows),
      ),
    );
  }

  renderSummary() {
    const { crops } = this.dataset;
    const values = crops.flatMap((crop) => Object.values(crop.composition.values));
    const identified = values.filter((entry) => entry.verification !== "unverified").length;
    const withData = crops.filter((crop) => !isPending(crop)).length;
    const items = [
      [String(crops.length), "Crops"],
      [String(withData), "With composition data"],
      [`${identified}/${values.length}`, "Values with a source"],
      [String(this.citedSources().length), "Cited references"],
    ];
    this.el.summary.replaceChildren(
      ...items.map(([value, label]) => h("div", { class: "summary__item" }, h("dt", {}, label), h("dd", {}, value))),
    );
    const { version, date } = this.dataset.metadata;
    this.el.version.textContent = `${version} (${date})`;
  }

  /** Sources cited by methods, notes or composition records, excluding internal markers. */
  citedSources() {
    const ids = new Set();
    for (const method of this.dataset.metadata.methods) method.refs.forEach((id) => ids.add(id));
    for (const crop of this.dataset.crops) {
      if (crop.composition.source) ids.add(crop.composition.source);
      for (const entry of Object.values(crop.composition.values)) if (entry.source) ids.add(entry.source);
      for (const note of crop.notes) note.refs.forEach((id) => ids.add(id));
    }
    return [...ids].map((id) => this.sources.get(id)).filter((source) => source && source.type !== "internal");
  }

  renderMethods() {
    const { metadata } = this.dataset;
    this.el.methods.replaceChildren(
      h("p", {}, metadata.basis),
      h(
        "ul",
        { class: "methods-list" },
        metadata.methods.map((method) =>
          h("li", {}, method.text, method.refs.length > 0 ? [" ", this.citationGroup(method.refs)] : null),
        ),
      ),
      h("h3", {}, "Verification levels"),
      h(
        "dl",
        { class: "definition-list" },
        Object.entries(metadata.verification_levels).map(([level, text]) =>
          h("div", {}, h("dt", {}, capitalise(level)), h("dd", {}, text)),
        ),
      ),
    );
  }

  renderCredits() {
    const withImages = this.dataset.crops.filter((crop) => crop.image);
    this.el.credits.replaceChildren(...withImages.map((crop) => creditItem(crop)));
  }

  renderReferences() {
    this.el.references.replaceChildren(
      ...sortReferences(this.citedSources()).map((source) =>
        h(
          "li",
          { id: `ref-${source.id}` },
          referenceSegments(source, this.yearLabels.get(source.id)).map((segment) => {
            if (segment.href) return h("a", { href: segment.href, rel: "noopener" }, segment.text);
            if (segment.italic) return h("i", {}, segment.text);
            return segment.text;
          }),
        ),
      ),
    );
  }
}

function creditItem(crop) {
  const { credit } = crop.image;
  const licence = credit.licence_url
    ? h("a", { href: credit.licence_url, rel: "license noopener" }, credit.licence)
    : credit.licence;
  return h(
    "li",
    {},
    `${crop.names.common}: `,
    h("a", { href: credit.source_url, rel: "noopener" }, credit.title.replace(/^File:/, "")),
    ` by ${credit.author}, `,
    licence,
    ", via Wikimedia Commons.",
  );
}

function segmentedOption(name, { value, label }) {
  const id = `${name}-${value}`;
  return h(
    "span",
    { class: "segmented__option" },
    h("input", { type: "radio", name, id, value }),
    h("label", { for: id }, label),
  );
}

function taxonNode(crop, withAuthority) {
  const { genus, species, infraspecific, authority } = crop.taxon;
  const parts = [h("i", {}, `${genus} ${species}`)];
  if (infraspecific) {
    const [rank, epithet] = infraspecific.split(" ");
    parts.push(` ${rank} `, h("i", {}, epithet));
  }
  if (withAuthority) parts.push(` ${authority}`);
  return h("span", { class: "taxon", title: scientificName(crop) }, parts);
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatSignedPercent(fraction) {
  const percent = fraction * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "±";
  return `${sign}${formatNumber(Math.abs(percent), 1)} %`;
}

/**
 * One-line description of a quality-check outcome.
 *
 * @param {import("./nutrition.js").QualityCheck} check Check outcome.
 * @returns {string}
 */
export function describeCheck(check) {
  if (check.status === "not-applicable") return check.message;
  const d = check.details;
  switch (check.id) {
    case "energy":
      return (
        `Reported ${formatNumber(d.reported, 0)} kcal; recalculated ${formatNumber(d.calculated, 0)} kcal ` +
        `(${formatSignedPercent(d.relativeDifference)}; tolerance ±${formatNumber(d.tolerance * 100, 0)} %).`
      );
    case "proximate-sum":
      return `Sum ${formatNumber(d.sum, 1)} g/100 g (expected ${d.min}–${d.max} g).`;
    case "fibre-within-carbohydrate":
      return `${formatNumber(d.fibre, 1)} g fibre; ${formatNumber(d.carbohydrate, 1)} g total carbohydrate.`;
    case "macronutrient-total":
      return `${formatNumber(d.total, 1)} g/100 g.`;
    default:
      return check.message;
  }
}
