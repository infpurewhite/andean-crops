# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [semantic versioning](https://semver.org/).

## [0.3.0] – 2026-11-13

### Added

- 22 Andean crops (30 in total), including roots and tubers (potato, ulluco, yacón, arracacha, achira, chuño), grain legumes (lima bean, common bean, peanut), fruits (cape gooseberry, cherimoya, lúcuma, tree tomato, pepino dulce, sweet granadilla, banana passionfruit, naranjilla, pacay, Andean blackberry, Andean elderberry) and chilli peppers (ají amarillo, rocoto).
- Composition values for seven of the new crops, from USDA SR Legacy records corroborated through secondary copies. Values that could not be corroborated were left out rather than estimated.
- An explicit "composition pending" state for the 15 crops whose only candidate source (the Peruvian national food composition tables) could not be accessed. Schema and validation enforce that pending records carry no values.
- Product photographs for every crop that has one, from Wikimedia Commons. Each was checked visually against the species and stored as WebP, with author, licence and source shown on the card and in a photo-credits section.
- Infraspecific names (for example *Passiflora tripartita* var. *mollissima*), the crop groups "Fruit" and "Vegetable or condiment", and the edible parts "root", "rhizome" and "fruit".
- `npm run site:copy -- <directory>` copies the runtime files and photos into another static site, writes a `SOURCE.txt` marker with the source commit, and refuses any non-empty directory that is not a previous copy.

### Changed

- All 11 DOIs in the bibliography were checked against Crossref metadata (`record_check: crossref`), and the missing DOI for Nowak, Du and Charrondière (2016) was added.
- The header summary now reports how many crops have composition data.

## [0.2.0] – 2026-11-13

A scientific and technical overhaul. See [docs/data-audit.md](docs/data-audit.md) for the evidence behind each data change.

### Added

- Canonical dataset `data/andean-crops.json` with a component dictionary (FAO/INFOODS tagnames), a bibliography, per-value provenance and verification levels, food state and edible part, typed and cited notes, and record-level flags.
- JSON Schema (`data/andean-crops.schema.json`) and a validator for cross-references, provenance rules and plausibility (`npm run validate`).
- Expression bases: per 100 g as described, per 100 g dry matter, and per 100 kcal, with a warning when per-100 g views mix food states.
- Per-crop quality checks: energy recalculation, sum of proximates and logical bounds.
- Harvard in-text citations linked to a generated reference list with DOIs, including a/b disambiguation.
- Table view, filter by source status, diacritic-insensitive search, and URL state for shareable views.
- Long-format CSV export (`data/derived/andean-crops-long.csv`).
- Crossref reference checker (`npm run check:references`), a dependency-free local server (`npm start`), node:test suites, ESLint, GitHub Actions workflows, methodology and audit documents, and contribution guidelines.

### Changed

- Quinoa and kiwicha values traced to USDA SR Legacy (FDC 168874 and 170682) at source precision. Water and ash were added for quinoa.
- "Available carbohydrates" relabelled as "Carbohydrate, total (by difference)".
- Bioactive and antinutrient statements rewritten with citations; unsupported claims removed.
- Taxonomy: author abbreviations added; "*Zea mays amylacea*" replaced by *Zea mays* L.; "cultivar" replaced by "crop"; crop groups renamed.
- Header metrics now report dataset coverage instead of per-100 g maxima across food states.
- Interface rebuilt with safe DOM construction, a Content Security Policy, improved accessibility and responsive layout.

### Removed

- The unsupported claim that values derive from "FAO/INFOODS Regional Food Composition Tables for the Andes".
- Data embedded in `main.js`.

## [0.1.0] – 2026-09-22

- Initial static page with eight crop records.
