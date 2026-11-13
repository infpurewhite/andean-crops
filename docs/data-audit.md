# Audit of the version 0.1 dataset

**Date:** 13 November 2026
**Scope:** the eight crop records embedded in `main.js` up to commit `ba75df7`, and the claims made about them on the page.
**Method:** each value and statement was compared with the sources that could be reached by web search from the curation environment. FoodData Central, Crossref and the Peruvian national food tables could not be accessed directly from that environment. Findings marked *[unverified]* rest on the curator's knowledge and were not checked in this audit.

## Summary

| # | Finding | Severity | Resolution in 0.2.0 |
|---|---|---|---|
| 1 | Foods in different states were ranked per 100 g | High | State recorded; dry-matter and per-100 kcal bases; warning shown |
| 2 | The stated provenance was not supported | High | Per-value provenance and verification levels; claim removed |
| 3 | Total carbohydrate was labelled "available" | Medium | Relabelled; INFOODS tagname CHOCDF |
| 4 | The maca record appears to be a composite | High | Flagged `composite-suspected`; marked unverified |
| 5 | The kiwicha values describe amaranth of unspecified species | Medium | Recorded as a proxy match and flagged |
| 6 | Tarwi values describe a seed that is not eaten raw | Medium | Flagged `not-eaten-raw` |
| 7 | Some bioactive statements were incorrect or unsupported | High | Rewritten with citations or removed |
| 8 | Taxonomic and classification terms were misused | Low | Corrected |
| 9 | The software had no schema, tests or safe rendering | Medium | Rebuilt (see the changelog) |

## Findings

### 1. Foods in different states were ranked per 100 g

Version 0.1 sorted crops by protein, fibre and iron per 100 g and headlined "Peak iron / 100 g" (14.8 mg, from dried maca). The records mix dry seeds and kernels (quinoa: 13.3 g water/100 g), a dried hypocotyl and fresh tubers. For the tubers, water plus ash is 85–87 g/100 g by difference. Per-100 g rankings across these states mostly reflect water content, not composition.

**Resolution.** Each record states its `condition`. The explorer offers dry-matter and per-100 kcal bases and warns when a per-100 g view mixes states. The headline summary now reports dataset coverage instead of maxima. On a per-100 kcal basis the iron ranking changes: oca moves from seventh to third place.

### 2. The stated provenance was not supported

The footer stated that values were "Derived from FAO/INFOODS Regional Food Composition Tables for the Andes and agronomical literature". No source was cited for any value. The quinoa and kiwicha values match, to the stated precision, the USDA SR Legacy records "Quinoa, uncooked" (FDC 168874) and "Amaranth grain, uncooked" (FDC 170682), as reproduced by secondary copies of those records. No source matching the full set of values was found for the other six records. For example, values reported online for cañihua vary by variety and product form, and none matched version 0.1.

**Resolution.** Provenance is recorded per value, with three verification levels (see [methodology](methodology.md), Section 6). The unsupported claim was removed.

### 3. Total carbohydrate was labelled "available"

Version 0.1 labelled its carbohydrate figure "Available Carbohydrates". For quinoa and kiwicha the source defines it as carbohydrate by difference, which includes dietary fibre. For the six undocumented records, recalculated energy (Section 5.1 of the methodology) agrees better when the figure is read as total carbohydrate including fibre than when it is read as available carbohydrate:

| Crop | Reported energy (kcal) | Read as total: difference | Read as available: difference |
|---|---:|---:|---:|
| Cañihua | 343 | −2.0 % | +9.4 % |
| Tarwi | 411 | +1.2 % | +12.1 % |
| Maca | 325 | −2.3 % | +8.2 % |
| Purple corn | 356 | −0.3 % | +7.9 % |
| Mashua | 52 | −5.0 % | +8.8 % |
| Oca | 61 | −1.3 % | +7.9 % |

This is circumstantial evidence: the analytical method remains undocumented.

**Resolution.** The component is labelled "Carbohydrate, total (by difference)" (INFOODS `CHOCDF`). Energy checks treat available carbohydrate as total carbohydrate minus fibre.

### 4. The maca record appears to be a composite

The energy (325 kcal), carbohydrate (71.4 g), calcium (250 mg) and iron (14.8 mg) per 100 g coincide with values declared on at least one commercial maca-powder label, as listed by a recipe-nutrition database. Label declarations are rounded and regulated values, not analytical data, and other labels for maca powder give different figures. The protein (10.2 g) and fibre (8.5 g) values may derive from the analytical study of Dini et al. (1994) *[unverified: the full text was not accessible]*.

**Resolution.** Flagged `composite-suspected`; all values remain `unverified`.

### 5. The kiwicha values describe amaranth of unspecified species

The USDA record describes "amaranth grain" without naming a species, whereas kiwicha is *Amaranthus caudatus*.

**Resolution.** Recorded as a proxy match (FAO/INFOODS, 2012b) and flagged. Water and ash were not added because they could not be corroborated for this record, so dry-matter values are unavailable for kiwicha.

### 6. Tarwi values describe a seed that is not eaten raw

The values (44.3 g protein, 16.5 g fat per 100 g) describe dry seed. Raw tarwi contains quinolizidine alkaloids and is eaten only after debittering (Carvajal-Larenas et al., 2016).

**Resolution.** Flagged `not-eaten-raw`. The food description states that the debittering status is not documented.

### 7. Some bioactive statements were incorrect or unsupported

| Crop | Version 0.1 statement | Problem | Change |
|---|---|---|---|
| Tarwi | "monounsaturated oleic and linoleic fatty acid complexes" | Linoleic acid is polyunsaturated; "complexes" is undefined | Corrected; cited, marked not yet checked |
| Mashua | "strong broad-spectrum antimicrobial activity" | Efficacy claim without a source | Removed; replaced by a cited glucosinolate survey (Ortega et al., 2006) |
| Kiwicha | "bioavailable tocotrienols; complete peptide profile rich in sulfur amino acids" | "Bioavailable" and "complete peptide profile" unsupported | Removed; squalene retained with a citation (He et al., 2002) |
| Cañihua | "high resistance to saponin accumulation compared to C. quinoa" | Imprecise and uncited | Removed pending a source; flavonoid statement cited |
| Oca | "Oxalic acid (catabolized and reduced post-harvest via traditional solarization)" | Mechanism asserted without a source | Reworded; marked "citation needed" |
| Purple corn | "acylated anthocyanins (predominantly cyanidin-3-glucoside …)" | Cyanidin-3-glucoside is not acylated | Reworded after Pedreschi and Cisneros-Zevallos (2007) |
| Quinoa | "Balanced essential amino acids (notably lysine and methionine)" | Uncited; saponins (the main antinutrient) omitted | Replaced by cited flavonoid and saponin statements |
| Maca | "secondary benzylamine alkaloid derivatives" | Vague | Replaced by glucosinolates, macamides and macaenes (Wang and Zhu, 2019; not yet checked) |

### 8. Taxonomic and classification terms were misused

- "Cultivar" was used for crop species; a cultivar is a named variety within a species. The term is now "crop".
- "*Zea mays amylacea*" is an informal infraspecific name and does not identify purple corn. The record now uses *Zea mays* L. with a note.
- Author abbreviations were added to all binomials.
- "Grain" became "Cereal". "Tuber/Root" became "Root or tuber crop", because maca's storage organ is a hypocotyl, not a tuber.

### 9. The software had no schema, tests or safe rendering

Version 0.1 kept the data inside the UI code and built HTML by interpolating strings into `innerHTML` without escaping. A CSS class mismatch (`.badge` in the HTML, `.classification-badge` in the CSS) left the header label unstyled. There was no schema, validation, test, continuous integration or documentation. All of these are addressed in 0.2.0; see the [changelog](../CHANGELOG.md).

## Curation backlog

In priority order:

1. **Replace the six undocumented records** with values from a single documented regional source, recording table codes, water and ash. Candidate: *Tablas peruanas de composición de alimentos* (Reyes García, Gómez-Sánchez Prieto and Espinoza Barrientos, 2017, 10th edn; Lima: Instituto Nacional de Salud). An 11th edition (2023) is reported. Check coverage of all eight crops and use the latest edition.
2. **Verify quinoa and kiwicha** against the primary FoodData Central records (FDC 168874 and 170682), raise them to `verified`, and add kiwicha water and ash.
3. **Check unchecked statements** against full texts: Carvajal-Larenas et al. (2016) for tarwi, and Wang and Zhu (2019) for maca.
4. **Complete the oca oxalate citation.** Candidate: the *Plant Foods for Human Nutrition* article "Influence of sunlight exposure and traditional dehydration on chemical and nutritional properties of *Oxalis tuberosa* (oca) tubers" (authors and DOI to be confirmed; record: <https://open-science.unesco.org/records/5qafs-aef94>).
5. **Add the DOI** for Nowak, Du and Charrondière (2016) after checking it in Crossref.
6. **Run `npm run check:references`** with internet access and resolve any mismatch.
7. **Confirm taxonomic names** against World Flora Online or Plants of the World Online.
8. **Represent variability.** Where sources give ranges, means with standard deviations or sample sizes, extend the schema to store them and show them.
9. **Purple corn.** The carbohydrate (74.2 g) and fibre (7.3 g) values coincide with the USDA SR Legacy record for yellow corn grain, whereas the other values do not *[unverified]*. Check this when replacing the record.

## References

- Carvajal-Larenas, F.E., Linnemann, A.R., Nout, M.J.R., Koziol, M. and van Boekel, M.A.J.S. (2016) 'Lupinus mutabilis: composition, uses, toxicology, and debittering', *Critical Reviews in Food Science and Nutrition*, 56(9), pp. 1454–1487. doi:10.1080/10408398.2013.772089
- Dini, A., Migliuolo, G., Rastrelli, L., Saturnino, P. and Schettino, O. (1994) 'Chemical composition of Lepidium meyenii', *Food Chemistry*, 49(4), pp. 347–349. doi:10.1016/0308-8146(94)90003-5
- FAO/INFOODS (2012b) *FAO/INFOODS guidelines for food matching – Version 1.2*. Rome: FAO.
- He, H.-P., Cai, Y., Sun, M. and Corke, H. (2002) 'Extraction and purification of squalene from Amaranthus grain', *Journal of Agricultural and Food Chemistry*, 50(2), pp. 368–372. doi:10.1021/jf010918p
- Nowak, V., Du, J. and Charrondière, U.R. (2016) 'Assessment of the nutritional composition of quinoa (Chenopodium quinoa Willd.)', *Food Chemistry*, 193, pp. 47–54.
- Ortega, O.R., Kliebenstein, D.J., Arbizu, C., Ortega, R. and Quirós, C.F. (2006) 'Glucosinolate survey of cultivated and feral mashua (Tropaeolum tuberosum Ruíz & Pavón) in the Cuzco region of Peru', *Economic Botany*, 60(3), pp. 254–264. doi:10.1663/0013-0001(2006)60[254:GSOCAF]2.0.CO;2
- Pedreschi, R. and Cisneros-Zevallos, L. (2007) 'Phenolic profiles of Andean purple corn (Zea mays L.)', *Food Chemistry*, 100(3), pp. 956–963. doi:10.1016/j.foodchem.2005.11.004
- Reyes García, M., Gómez-Sánchez Prieto, I. and Espinoza Barrientos, C. (2017) *Tablas peruanas de composición de alimentos*. 10th edn. Lima: Ministerio de Salud, Instituto Nacional de Salud.
- Wang, S. and Zhu, F. (2019) 'Chemical composition and health effects of maca (Lepidium meyenii)', *Food Chemistry*, 288, pp. 422–443. doi:10.1016/j.foodchem.2019.02.071
