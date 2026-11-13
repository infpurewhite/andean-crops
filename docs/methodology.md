# Methodology

This document specifies how the dataset is structured, how values are expressed and checked, and what the verification levels mean. It applies to dataset version 0.2.0.

## 1. Scope and unit of observation

The unit of observation is a **crop record**: one Andean crop species, represented by one food (a defined edible part in a defined state) and one set of composition values per 100 g edible portion. Version 0.2.0 covers eight crops in four crop groups and nine components.

A record describes the food in the state given by its source, which is not necessarily the state in which it is eaten. For example, tarwi is reported as dry seed, but it is eaten only after debittering and cooking.

## 2. Data model

The canonical file is `data/andean-crops.json`, validated by `data/andean-crops.schema.json` (JSON Schema draft 2020-12). It has four parts.

| Part | Content |
|---|---|
| `metadata` | Title, version, date, basis statement, definitions of the verification levels, and the methods shown on the page (with citations). |
| `components` | Component dictionary: identifier, label, unit, FAO/INFOODS tagname, group, display precision and a definition. |
| `sources` | Bibliography in a CSL-like structure (authors, year, title, container, volume, issue, pages, DOI or URL), plus `record_check`, which records how the bibliographic record itself was checked. |
| `crops` | Crop records (see below). |

Each crop record contains:

- `taxon`: genus, species, authority and family (APG IV family names), plus an optional note on name usage;
- `crop_group`: `pseudocereal`, `cereal`, `grain_legume` or `root_tuber`;
- `edible_part`: `seed`, `kernel`, `hypocotyl` or `tuber`;
- `food`: the source's food description and its `condition`. `dry` is a naturally low-moisture seed or grain; `dried` is dehydrated from fresh tissue; `fresh` is as harvested;
- `composition`: the record-level `source`, the identifier of the source record (`source_record`), the food `match` (`direct`, `proxy` or `unknown`) and the `values`. Each value has a number, an optional per-value `source` that overrides the record-level source, and a `verification` level;
- `notes`: typed statements (`bioactive`, `antinutrient`, `processing`, `context`), each with citation identifiers (`refs`) and a `checked` flag;
- `flags`: record-level warnings (`proxy-match`, `composite-suspected`, `not-eaten-raw`).

Cross-references (component, source and crop identifiers) and provenance rules are enforced by `scripts/lib/dataset-validation.mjs` (Section 6).

## 3. Components

| Identifier | Label | Unit (per 100 g EP) | INFOODS tagname | Notes |
|---|---|---|---|---|
| `energy` | Energy | kcal | ENERC | As reported by the source. |
| `water` | Water | g | WATER | |
| `protein` | Protein | g | PROCNT | Nitrogen-to-protein factor not recorded. |
| `fat` | Fat, total | g | FAT | INFOODS distinguishes fat tagnames by method; method not recorded. |
| `carbohydrate_total` | Carbohydrate, total (by difference) | g | CHOCDF | Includes dietary fibre; not available carbohydrate. |
| `fibre` | Dietary fibre | g | FIBTG | Total dietary fibre for USDA values; method unknown otherwise (may be crude fibre, FIBC). |
| `ash` | Ash | g | ASH | |
| `calcium` | Calcium | mg | CA | Total; bioavailability not represented. |
| `iron` | Iron | mg | FE | Total; bioavailability not represented. |

EP: edible portion.

## 4. Expression bases

Let *x* be a value per 100 g edible portion, *w* the water content (g/100 g) and *E* the reported energy (kcal/100 g).

- **As described**: *x*, the value for the food in the state described.
- **Dry matter (DM)**: *x*<sub>DM</sub> = *x* × 100 / (100 − *w*), defined for 0 ≤ *w* < 100. It is computed only when water is reported **in the same record**, because combining a water value from another sample would give an invalid ratio. Water itself is not expressed on a DM basis.
- **Per energy**: *x*<sub>E</sub> = *x* × 100 / *E* (per 100 kcal), defined for *E* > 0. This nutrient-density basis does not depend on water content, so dry and fresh foods can be compared directly. Energy itself cannot be expressed per 100 kcal, so it is displayed and sorted per 100 g as described.

When values are shown per 100 g as described and the displayed records differ in condition, the explorer warns that the comparison is not like-for-like. Sorting places records without a value on the active basis last.

## 5. Quality checks

All checks are implemented in `assets/js/nutrition.js` and run both in the browser (shown per crop) and in validation.

### 5.1 Energy recalculation

Energy is recalculated with general conversion factors (FAO, 2003):

*E*<sub>calc</sub> = 4 *P* + 9 *F* + 4 (*C* − *DF*) + 2 *DF*

where *P* is protein, *F* fat, *C* total carbohydrate by difference and *DF* dietary fibre (g/100 g). *C* − *DF* approximates available carbohydrate and is bounded below by zero. The relative difference δ = (*E*<sub>calc</sub> − *E*)/*E* is flagged for review (status `warn`) when |δ| > 0.10.

The 10 % tolerance is a screening heuristic chosen for this dataset, not a published limit. Moderate differences are expected because sources may use food-specific factors and because carbohydrate by difference also contains organic acids and other non-carbohydrate residues.

### 5.2 Sum of proximates

Where water and ash are reported, *w* + *P* + *F* + *C* + ash is expected to lie between 97 and 103 g/100 g (Greenfield and Southgate, 2003). Values outside this range fail validation. Because *C* is calculated by difference, the sum equals 100 g by construction within a single analysis. The check therefore mainly detects transcription errors and records assembled from different samples or sources.

### 5.3 Logical bounds

- Dietary fibre must not exceed total carbohydrate, which includes it.
- Protein + fat + total carbohydrate must not exceed 100 g/100 g.
- Values must be non-negative and below unit-specific maxima (100 g, 100 000 mg, 900 kcal per 100 g).
- Water must be below 100 g/100 g.

## 6. Provenance and verification

### 6.1 Verification levels (per value)

| Level | Meaning |
|---|---|
| `verified` | Checked against the primary source record by a curator. |
| `corroborated` | Matches the named source record as reproduced by at least one independent secondary copy; the primary record was not accessed. |
| `unverified` | Source not identified, or value not checked against any source. |

In version 0.2.0 no value is `verified`. The 16 `corroborated` values (quinoa, kiwicha) were compared on 13 November 2026 with secondary copies of USDA FoodData Central records found by web search. Direct access to FoodData Central, Crossref and the Peruvian national food tables was not available from the curation environment. For quinoa, water and ash were corroborated by converting a per-cup listing (170 g) to per-100 g values.

### 6.2 Rules enforced by validation

- `verified` or `corroborated` values must trace to an identified (non-internal) source.
- A `proxy` match must carry a `proxy-match` flag, and vice versa.
- `direct` and `proxy` matches require an identified source.
- Every cited identifier must exist in `sources`. Uncited sources produce a warning.
- A note marked `checked` must cite at least one source. Notes without citations produce a "citation needed" warning, and unchecked notes produce a warning.
- Failed quality checks are errors. Checks that need review are warnings.

### 6.3 Bibliographic records

`record_check` documents how each reference was confirmed: `indexed-record` (a bibliographic index or publisher listing, such as PubMed or AGRIS), `secondary-reference` (the reference list of another work), `not-checked` or `not-applicable`. `npm run check:references` compares DOIs with Crossref (title, year, first author, volume) whenever internet access is available.

## 7. Notes on bioactive compounds and antinutrients

Notes describe composition, not health effects. Each statement must cite at least one source. Where a source reports effects only from cell or animal studies, the note says so. Statements are marked `checked: true` only when they were compared with at least the abstract of the cited work during curation. Antinutrients and toxicants (saponins, quinolizidine alkaloids, oxalate, glucosinolates) are listed separately from bioactive compounds.

## 8. Taxonomy

Names are binomials with author abbreviations; families follow APG IV (for example, *Chenopodium* in Amaranthaceae). Infraspecific names are used only when the source supports them, which is why version 0.1's "*Zea mays amylacea*" was dropped. Name usage (for example, cultivated maca treated by some authors as *Lepidium peruvianum*) is recorded in `taxon.note`. Names have not yet been checked against World Flora Online or Plants of the World Online (see the curation backlog).

## 9. Threats to validity and limitations

- **Source validity.** Six of eight records have no documented source, and the maca record appears to combine commercial label declarations with values of unknown origin. These values are provisional and are labelled as such.
- **Construct validity.** Composition per 100 g of raw or dried food is not nutritional value as eaten. Processing (debittering, washing, sun exposure, cooking), edible-portion definitions and bioavailability (for example, iron with phytate, or calcium with oxalate) all intervene.
- **Variability.** Single values hide variation between genotypes, growing environments and seasons. No ranges, sample sizes or uncertainty estimates are available yet.
- **Method heterogeneity.** Fibre (total dietary versus crude), fat-extraction methods and nitrogen-to-protein factors may differ between sources and are mostly undocumented.
- **Food matching.** Kiwicha values come from amaranth grain of unspecified species (a proxy match).
- **Verification depth.** Corroboration used secondary copies, not primary records.
- **Check sensitivity.** The energy tolerance is heuristic. The proximate-sum check is weak for carbohydrate calculated by difference and cannot run without water and ash, which are missing for seven records.
- **Comparisons.** The per-energy basis measures nutrient density. It is not a ranking of dietary quality, and energy-dense foods score low by construction.

## References

- FAO (2003) *Food energy – methods of analysis and conversion factors*. FAO Food and Nutrition Paper 77. Rome: FAO. Available at: <https://www.fao.org/3/Y5022E/y5022e00.htm>
- FAO/INFOODS (2012a) *FAO/INFOODS guidelines for checking food composition data prior to the publication of a user table/database – Version 1.0*. Rome: FAO. Available at: <https://www.fao.org/infoods/infoods/standards-guidelines/en/>
- FAO/INFOODS (2012b) *FAO/INFOODS guidelines for food matching – Version 1.2*. Rome: FAO.
- Greenfield, H. and Southgate, D.A.T. (2003) *Food composition data: production, management and use*. 2nd edn. Rome: FAO. Available at: <https://www.fao.org/3/y4705e/y4705e.pdf>
