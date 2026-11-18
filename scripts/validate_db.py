#!/usr/bin/env python3
"""Validate data/crops.json and data/sources.json integrity and nutritional sanity."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CROPS_PATH = ROOT / "data" / "crops.json"
SOURCES_PATH = ROOT / "data" / "sources.json"

VALID_CLASSIFICATIONS = {
    "Pseudocereal",
    "Tuber/Root",
    "Legume",
    "Grain",
    "Fruit",
    "Seed/Alga",
}
VALID_BASES = {"dry", "fresh_raw", "dried_processed"}
NUMERIC_FIELDS = [
    "moisturePct",
    "calories",
    "protein",
    "carbs",
    "fiber",
    "lipids",
    "iron",
    "calcium",
    "zinc",
    "vitaminC",
]


def main() -> int:
    errors: list[str] = []

    sources_doc = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
    crops_doc = json.loads(CROPS_PATH.read_text(encoding="utf-8"))

    source_map: dict[str, dict] = {}
    for src in sources_doc.get("sources", []):
        sid = src.get("id", "")
        if not sid:
            errors.append("Source missing 'id'")
            continue
        if sid in source_map:
            errors.append(f"Duplicate source id: {sid}")
        if not src.get("url", "").startswith(("http://", "https://")):
            errors.append(f"Source {sid} has invalid url: {src.get('url')}")
        source_map[sid] = src

    cultivars = crops_doc.get("cultivars", [])
    if not cultivars:
        errors.append("No cultivars found in crops.json")

    crop_ids: set[str] = set()
    for crop in cultivars:
        cid = crop.get("id", "<missing>")
        if cid in crop_ids:
            errors.append(f"Duplicate cultivar id: {cid}")
        crop_ids.add(cid)

        if crop.get("classification") not in VALID_CLASSIFICATIONS:
            errors.append(f"{cid}: invalid classification '{crop.get('classification')}'")

        if crop.get("basis") not in VALID_BASES:
            errors.append(f"{cid}: invalid basis '{crop.get('basis')}'")

        for field in NUMERIC_FIELDS:
            val = crop.get(field)
            if not isinstance(val, (int, float)) or val < 0:
                errors.append(f"{cid}: field '{field}' must be >= 0, got {val!r}")

        moisture = crop.get("moisturePct", 0)
        if not (0 <= moisture <= 99):
            errors.append(f"{cid}: moisturePct out of range: {moisture}")

        # Proximate mass balance sanity: moisture + protein + carbs + lipids <= 105g per 100g
        mass_sum = moisture + crop.get("protein", 0) + crop.get("carbs", 0) + crop.get("lipids", 0)
        if mass_sum > 105:
            errors.append(f"{cid}: proximate mass sum exceeds 105g ({mass_sum:.1f}g)")

        # Referential integrity for field-group sources
        src_obj = crop.get("sources", {})
        for group in ("composition", "bioactives"):
            refs = src_obj.get(group, [])
            if not refs:
                errors.append(f"{cid}: missing sources.{group}")
            for ref in refs:
                if ref not in source_map:
                    errors.append(f"{cid}: unknown source id '{ref}' in sources.{group}")

    if errors:
        print("VALIDATION FAILED:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print(
        f"Validation passed: {len(cultivars)} cultivars, "
        f"{len(source_map)} sources, 100% referential integrity."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
