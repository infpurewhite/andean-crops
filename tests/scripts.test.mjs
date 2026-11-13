import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RUNTIME_FILES, SOURCE_MARKER, assertSafeTarget } from "../scripts/lib/site-files.mjs";
import { CSV_COLUMNS, csvField, tidyRows, toCsv } from "../scripts/lib/tidy-export.mjs";
import { compareWithCrossref, crossrefYear, normaliseTitle, titleSimilarity } from "../scripts/lib/crossref.mjs";
import { resolveRequestPath } from "../scripts/lib/static-path.mjs";
import { loadDataset } from "./helpers.mjs";

describe("tidy export", () => {
  const dataset = loadDataset();

  it("writes one row per reported crop × component value", () => {
    const expected = dataset.crops.reduce((n, crop) => n + Object.keys(crop.composition.values).length, 0);
    const rows = tidyRows(dataset);
    assert.equal(rows.length, expected);
    assert.deepEqual(Object.keys(rows[0]), [...CSV_COLUMNS]);
    assert.equal(rows[0].crop_id, dataset.crops[0].id);
    assert.equal(rows[0].component_id, dataset.components[0].id);
  });

  it("quotes fields that contain separators or quotes", () => {
    assert.equal(csvField("plain"), "plain");
    assert.equal(csvField("a, b"), '"a, b"');
    assert.equal(csvField('say "hi"'), '"say ""hi"""');
    assert.equal(csvField(4.57), "4.57");
  });

  it("produces a header line and a trailing newline", () => {
    const csv = toCsv([{ a: 1, b: "x,y" }], ["a", "b"]);
    assert.equal(csv, 'a,b\n1,"x,y"\n');
  });
});

describe("Crossref comparison", () => {
  const source = loadDataset().sources.find((s) => s.id === "lao-2017");
  const message = {
    title: ["Health Benefits of Purple Corn (<i>Zea mays</i> L.) Phenolic Compounds"],
    author: [{ family: "Lao", given: "Fei" }],
    volume: "16",
    issued: { "date-parts": [[2017, 1, 24]] },
  };

  it("normalises markup, case and diacritics in titles", () => {
    assert.equal(normaliseTitle("Kañiwa <i>grain</i>: A Review"), "kaniwa grain a review");
    assert.equal(titleSimilarity("a b c", "a b c"), 1);
    assert.equal(titleSimilarity("a b", "c d"), 0);
  });

  it("accepts matching metadata", () => {
    assert.deepEqual(compareWithCrossref(source, message), { ok: true, issues: [], notes: [] });
  });

  it("reports a one-year gap as a note and larger gaps as issues", () => {
    const shifted = { ...message, issued: { "date-parts": [[2016]] } };
    assert.equal(compareWithCrossref(source, shifted).ok, true);
    assert.equal(compareWithCrossref(source, shifted).notes.length, 1);
    const wrong = { ...message, issued: { "date-parts": [[2012]] } };
    assert.equal(compareWithCrossref(source, wrong).ok, false);
  });

  it("reports title, author and volume mismatches", () => {
    const result = compareWithCrossref(source, {
      ...message,
      title: ["An unrelated paper on wheat"],
      author: [{ family: "Smith" }],
      volume: "99",
    });
    assert.equal(result.ok, false);
    assert.equal(result.issues.length, 3);
  });

  it("prefers the print year", () => {
    assert.equal(crossrefYear({ "published-print": { "date-parts": [[2016]] }, issued: { "date-parts": [[2015]] } }), 2016);
    assert.equal(crossrefYear({}), null);
  });
});

describe("site copy", () => {
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));

  it("lists every runtime file, including all imported modules", () => {
    for (const file of RUNTIME_FILES) assert.ok(existsSync(join(repoRoot, file)), `${file} is missing`);

    const listed = new Set(RUNTIME_FILES);
    const html = readFileSync(join(repoRoot, "index.html"), "utf8");
    for (const [, path] of html.matchAll(/(?:src|href)="((?:assets|data)\/[^"]+)"/g)) {
      assert.ok(listed.has(path), `index.html references ${path}, which is not in RUNTIME_FILES`);
    }
    for (const file of RUNTIME_FILES.filter((f) => f.startsWith("assets/js/"))) {
      const source = readFileSync(join(repoRoot, file), "utf8");
      for (const [, module] of source.matchAll(/from "\.\/([\w-]+\.js)"/g)) {
        assert.ok(listed.has(`assets/js/${module}`), `${file} imports ${module}, which is not in RUNTIME_FILES`);
      }
    }
  });

  it("refuses unsafe targets and accepts new, empty or previous-copy directories", async () => {
    const scratch = mkdtempSync(join(tmpdir(), "andean-copy-"));
    try {
      await assertSafeTarget(join(scratch, "new"), repoRoot);
      mkdirSync(join(scratch, "empty"));
      await assertSafeTarget(join(scratch, "empty"), repoRoot);

      mkdirSync(join(scratch, "site"));
      writeFileSync(join(scratch, "site", "index.html"), "<p>personal site</p>");
      await assert.rejects(assertSafeTarget(join(scratch, "site"), repoRoot), /not a previous copy/);

      mkdirSync(join(scratch, "copy"));
      writeFileSync(join(scratch, "copy", "index.html"), "old copy");
      writeFileSync(join(scratch, "copy", SOURCE_MARKER), "marker");
      await assertSafeTarget(join(scratch, "copy"), repoRoot);

      await assert.rejects(assertSafeTarget(join(repoRoot, "build"), repoRoot), /outside this repository/);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});

describe("development server path resolution", () => {
  const root = resolve("/srv/site");

  it("maps paths inside the root and defaults to index.html", () => {
    assert.equal(resolveRequestPath(root, "/"), join(root, "index.html"));
    assert.equal(resolveRequestPath(root, "/data/andean-crops.json?x=1"), join(root, "data", "andean-crops.json"));
    assert.equal(resolveRequestPath(root, "/docs/"), join(root, "docs", "index.html"));
  });

  it("refuses traversal, hidden files and malformed escapes", () => {
    assert.equal(resolveRequestPath(root, "/../etc/passwd"), null);
    assert.equal(resolveRequestPath(root, "/%2e%2e/secret"), null);
    assert.equal(resolveRequestPath(root, "/data/..%2f..%2fsecret"), null);
    assert.equal(resolveRequestPath(root, "/.git/config"), null);
    assert.equal(resolveRequestPath(root, "/node_modules/x.js"), null);
    assert.equal(resolveRequestPath(root, "/%E0%A4%A"), null);
    assert.equal(resolveRequestPath(root, "/a%00b"), null);
  });
});
