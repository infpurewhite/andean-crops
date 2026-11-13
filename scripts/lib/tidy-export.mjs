/**
 * Convert the dataset to a tidy (long) table: one row per crop × component.
 *
 * @module tidy-export
 */

export const CSV_COLUMNS = Object.freeze([
  "crop_id",
  "common_name",
  "scientific_name",
  "family",
  "crop_group",
  "edible_part",
  "food_description",
  "food_condition",
  "component_id",
  "component_label",
  "infoods_tagname",
  "value",
  "unit",
  "basis",
  "source_id",
  "source_record",
  "food_match",
  "verification",
]);

/**
 * Build tidy rows, ordered by crop (dataset order) then component (dictionary order).
 *
 * @param {object} dataset Parsed dataset.
 * @returns {Record<string, string|number>[]}
 */
export function tidyRows(dataset) {
  const rows = [];
  for (const crop of dataset.crops) {
    for (const component of dataset.components) {
      const entry = crop.composition.values[component.id];
      if (!entry) continue;
      rows.push({
        crop_id: crop.id,
        common_name: crop.names.common,
        scientific_name: `${crop.taxon.genus} ${crop.taxon.species} ${crop.taxon.authority}`,
        family: crop.taxon.family,
        crop_group: crop.crop_group,
        edible_part: crop.edible_part,
        food_description: crop.food.description,
        food_condition: crop.food.condition,
        component_id: component.id,
        component_label: component.label,
        infoods_tagname: component.infoods,
        value: entry.value,
        unit: component.unit,
        basis: "per 100 g edible portion, food as described",
        source_id: entry.source ?? crop.composition.source,
        source_record: crop.composition.source_record ?? "",
        food_match: crop.composition.match,
        verification: entry.verification,
      });
    }
  }
  return rows;
}

/**
 * Quote a CSV field when needed (RFC 4180).
 *
 * @param {string|number} field Field value.
 * @returns {string}
 */
export function csvField(field) {
  const text = String(field);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * Serialise rows to CSV with a header line and LF line endings.
 *
 * @param {Record<string, string|number>[]} rows Rows to write.
 * @param {readonly string[]} [columns] Column order.
 * @returns {string}
 */
export function toCsv(rows, columns = CSV_COLUMNS) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvField(row[column] ?? "")).join(","));
  return `${lines.join("\n")}\n`;
}
