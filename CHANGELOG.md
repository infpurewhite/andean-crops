# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [semantic versioning](https://semver.org/).

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
