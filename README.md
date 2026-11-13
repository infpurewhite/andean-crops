# Andean Crops Nutrient Composition Explorer

A curated, machine-readable dataset and a static web explorer for the proximate composition, energy and selected minerals of eight Andean crops. Every value records the state of the food, its source and how far it has been verified. Plausibility checks run in the browser and in continuous integration.

The project follows food-composition conventions (FAO/INFOODS component identifiers and data-checking practice). It reports gaps openly: values whose source is undocumented are kept, labelled and excluded on request, never presented as established.

## What the explorer does

- **Compares on a valid basis.** Values can be shown per 100 g of the food as described, per 100 g dry matter (where water is reported) or per 100 kcal (nutrient density). The page warns when per-100 g comparisons mix dry seeds, a dried hypocotyl and fresh tubers.
- **Shows provenance for every value**: the source record, whether the source food matches the crop directly or is a proxy, and the verification level.
- **Runs quality checks per crop**: energy recalculated from macronutrients, the sum of proximates, and logical bounds.
- **Cites its evidence.** Statements on bioactive compounds and antinutrients carry Harvard citations linked to a reference list with DOIs. Statements not yet checked against the source are marked.
- **Supports search, filters, sorting, card and table views, and shareable URLs.** Search ignores diacritics, so "canihua" finds Cañihua.

## Data status (version 0.2.0)

| Crop | Taxon | Food as described | Source of composition values | Values with a source |
|---|---|---|---|---|
| Quinoa | *Chenopodium quinoa* Willd. | Seed, dry | USDA SR Legacy, FDC 168874 (direct match) | 9/9 |
| Kiwicha | *Amaranthus caudatus* L. | Seed, dry | USDA SR Legacy, FDC 170682 (proxy: species not specified) | 7/7 |
| Cañihua | *Chenopodium pallidicaule* Aellen | Seed, dry | Not documented | 0/7 |
| Tarwi | *Lupinus mutabilis* Sweet | Seed, dry (not eaten raw) | Not documented | 0/7 |
| Maca | *Lepidium meyenii* Walp. | Hypocotyl, dried | Not documented; suspected composite of label and other values | 0/7 |
| Purple corn | *Zea mays* L. | Kernel, dry | Not documented | 0/7 |
| Mashua | *Tropaeolum tuberosum* Ruiz & Pav. | Tuber, fresh | Not documented | 0/7 |
| Oca | *Oxalis tuberosa* Molina | Tuber, fresh | Not documented | 0/7 |

16 of 58 values are traced to a named source record. Those values were corroborated against secondary copies of the USDA records; the primary records were not accessed in this release. The [data audit](docs/data-audit.md) explains each finding and lists the curation backlog. Replacing the six undocumented records with values from one documented regional source is the highest priority.

## Quick start

Requirements: Node.js 22 or later.

```bash
npm ci
```

```bash
npm start
```

Then open <http://127.0.0.1:8000/>. Browsers block module scripts and `fetch()` on `file://` pages, so serve the folder over HTTP rather than opening `index.html` directly. Any static server works, for example `python3 -m http.server`.

## Quality assurance

| Command | What it does |
|---|---|
| `npm run validate` | Validates the dataset against its JSON Schema, then checks cross-references, provenance rules and plausibility. Prints a per-crop report. |
| `npm test` | Runs the unit and dataset tests with the Node test runner (`node:test`), including mutation tests that confirm the validator rejects defective data. |
| `npm run lint` | Lints with ESLint. |
| `npm run check` | Runs all three. |
| `npm run export` | Regenerates the long-format CSV from the JSON. A test fails if the CSV is out of date. |
| `npm run check:references` | Checks every DOI against Crossref (needs internet access; optional `CROSSREF_MAILTO`). |

GitHub Actions runs `lint`, `validate` and `test` on pushes to `main` and on pull requests, and checks that the CSV is current. A separate manual workflow runs the reference check.

## Repository layout

```text
index.html                     Page markup (static; content rendered from the dataset)
assets/css/styles.css          Styles (WCAG AA contrast, responsive, print)
assets/js/
  nutrition.js                 Pure domain logic: bases, energy, quality checks
  catalogue.js                 Pure search, filter, sort and URL state
  citations.js                 Harvard citation formatting
  dom.js                       Safe element construction (no innerHTML)
  app.js                       Browser controller and rendering
  main.js                      Entry point: loads the dataset
data/
  andean-crops.json            Canonical dataset (metadata, components, sources, crops)
  andean-crops.schema.json     JSON Schema (draft 2020-12)
  derived/andean-crops-long.csv  Generated long-format table (one row per crop × component)
docs/
  methodology.md               Data model, formulas, checks, verification, limitations
  data-audit.md                Audit of version 0.1 and curation backlog
scripts/                       Validation, export, reference check, local server
tests/                         node:test suites
```

## Data model in brief

Each crop record holds the taxon (with authority and APG family), crop group, edible part, a food description and its condition (`dry`, `dried` or `fresh`), and the composition. Each composition value has a number, an optional per-value source and a verification level (`verified`, `corroborated` or `unverified`). Components use FAO/INFOODS tagnames (for example `CHOCDF` for total carbohydrate by difference). Notes are typed (`bioactive`, `antinutrient`, `processing` or `context`), cite sources by identifier and state whether they were checked against those sources. See [docs/methodology.md](docs/methodology.md) for the full specification, and [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or correct data.

## Limitations

- Six of eight records still lack a documented source. Treat their values as provisional.
- Values are single figures per 100 g edible portion. They do not show variation between genotypes, growing environments or analytical methods, or changes from processing and cooking.
- Iron and calcium are totals; bioavailability (affected by phytate, oxalate and other factors) is not represented.
- Fibre methods differ between sources: undocumented values may be crude fibre, which is not comparable with total dietary fibre.
- The explorer is for research and teaching, not dietary or medical advice.

## Licensing

No licence has been chosen yet. Until one is added, default copyright applies and others may not reuse the code or curated data. Third-party data keep their own terms; check each source's terms before redistribution.

## Key references

- FAO (2003) *Food energy – methods of analysis and conversion factors*. FAO Food and Nutrition Paper 77. Rome: FAO. Available at: <https://www.fao.org/3/Y5022E/y5022e00.htm>
- Greenfield, H. and Southgate, D.A.T. (2003) *Food composition data: production, management and use*. 2nd edn. Rome: FAO. Available at: <https://www.fao.org/3/y4705e/y4705e.pdf>
- U.S. Department of Agriculture, Agricultural Research Service (2018) *USDA National Nutrient Database for Standard Reference, Legacy Release*. Available at: <https://fdc.nal.usda.gov/>

The complete reference list is generated on the page from `data/andean-crops.json`.
