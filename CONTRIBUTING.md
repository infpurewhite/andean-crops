# Contributing

Contributions of data corrections, new sources and code are welcome. The project's value depends on traceable data, so data changes follow stricter rules than code changes.

## Data rules

1. **One documented source per value.** Record the source in `sources` (with a DOI where one exists) and the specific record in `composition.source_record` (for example, a table code or FDC ID). Values taken from memory, from secondary websites without a primary record, or from product labels are not accepted as sourced values.
2. **Describe the food as the source describes it.** Set `food.description`, `food.condition` (`dry`, `dried` or `fresh`) and `edible_part`. Do not convert values between states before entry; the explorer converts them.
3. **Keep values from one sample or table entry together.** Do not combine water from one source with protein from another. Use a per-value `source` only when the source states that its values belong to the same food.
4. **Set the verification level honestly.** Use `verified` only after checking the primary record yourself, `corroborated` for agreement with a secondary copy, and `unverified` otherwise.
5. **Use proxies explicitly.** If the source food differs from the crop (for example, the species is not specified), set `match` to `proxy` and add a `proxy-match` flag.
6. **Cite every note.** Notes on bioactive compounds and antinutrients must cite at least one source. Set `checked` to `true` only after comparing the statement with the source (at least its abstract). Describe composition, not health effects; where evidence comes from cell or animal studies, say so.
7. **Write in British English.** Use SI units per 100 g edible portion.

## Workflow

```bash
npm ci
```

Edit `data/andean-crops.json`, then:

```bash
npm run validate
```

```bash
npm run export
```

```bash
npm run check
```

Commit the JSON and the regenerated CSV together. Describe each source and verification step in the pull request, and add an entry to `CHANGELOG.md`.

Dataset versions follow semantic versioning: **major** for schema changes that break consumers, **minor** for new crops, components or sources, and **patch** for corrections.

## Code conventions

- ES modules without a build step. Calculations live in pure modules (`nutrition.js`, `catalogue.js`, `citations.js`); only `app.js` and `dom.js` touch the DOM.
- Build DOM nodes with `h()` from `dom.js`; never assign dataset content to `innerHTML`.
- Add or update `node:test` tests for every behaviour change, and keep `npm run check` passing.
- Keep the page usable by keyboard and screen reader, with text contrast of at least 4.5:1.
