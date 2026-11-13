import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatReference, inTextCitation, joinNames, sortReferences, yearLabels } from "../assets/js/citations.js";
import { loadDataset } from "./helpers.mjs";

const sources = new Map(loadDataset().sources.map((source) => [source.id, source]));

describe("joinNames", () => {
  it("joins with commas and a final 'and'", () => {
    assert.equal(joinNames([]), "");
    assert.equal(joinNames(["A"]), "A");
    assert.equal(joinNames(["A", "B"]), "A and B");
    assert.equal(joinNames(["A", "B", "C"]), "A, B and C");
  });
});

describe("inTextCitation", () => {
  it("follows Harvard author–date conventions", () => {
    assert.equal(inTextCitation(sources.get("gonzales-2012")), "Gonzales, 2012");
    assert.equal(inTextCitation(sources.get("wang-zhu-2019")), "Wang and Zhu, 2019");
    assert.equal(inTextCitation(sources.get("campos-2006")), "Campos et al., 2006");
    assert.equal(inTextCitation(sources.get("fao-2003-fnp77")), "FAO, 2003");
    assert.equal(inTextCitation(sources.get("legacy-v0")), "andean-crops repository, n.d.");
  });
});

describe("formatReference", () => {
  it("formats a journal article with issue, pages and DOI", () => {
    assert.equal(
      formatReference(sources.get("lao-2017")),
      "Lao, F., Sigurdson, G.T. and Giusti, M.M. (2017) ‘Health benefits of purple corn (Zea mays L.) " +
        "phenolic compounds’, Comprehensive Reviews in Food Science and Food Safety, 16(2), pp. 234–246. " +
        "doi:10.1111/1541-4337.12249",
    );
  });

  it("formats article numbers and missing issues", () => {
    assert.match(formatReference(sources.get("gonzales-2012")), /, 2012, article 193496\. doi:10\.1155\/2012\/193496$/);
    assert.match(formatReference(sources.get("repo-carrasco-2003")), /Food Reviews International, 19, pp\. 179–189\./);
  });

  it("formats books and reports with edition, imprint and URL", () => {
    assert.equal(
      formatReference(sources.get("greenfield-southgate-2003")),
      "Greenfield, H. and Southgate, D.A.T. (2003) Food composition data: production, management and use. " +
        "2nd edn. Rome: Food and Agriculture Organization of the United Nations. " +
        "Available at: https://www.fao.org/3/y4705e/y4705e.pdf",
    );
  });
});

describe("yearLabels", () => {
  it("adds a, b suffixes when author and year coincide", () => {
    const labels = yearLabels([
      sources.get("fao-infoods-2012-matching"),
      sources.get("fao-infoods-2012-checking"),
      sources.get("campos-2006"),
    ]);
    assert.equal(labels.get("fao-infoods-2012-checking"), "2012a");
    assert.equal(labels.get("fao-infoods-2012-matching"), "2012b");
    assert.equal(labels.get("campos-2006"), "2006");
    assert.equal(inTextCitation(sources.get("fao-infoods-2012-matching"), labels.get("fao-infoods-2012-matching")), "FAO/INFOODS, 2012b");
    assert.match(formatReference(sources.get("fao-infoods-2012-checking"), "2012a"), /^FAO\/INFOODS \(2012a\) /);
  });
});

describe("sortReferences", () => {
  it("orders by first author, then year", () => {
    const sorted = sortReferences([sources.get("wang-zhu-2019"), sources.get("campos-2006"), sources.get("fao-2003-fnp77")]);
    assert.deepEqual(
      sorted.map((source) => source.id),
      ["campos-2006", "fao-2003-fnp77", "wang-zhu-2019"],
    );
  });
});
