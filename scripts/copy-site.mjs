#!/usr/bin/env node
/**
 * Copy the explorer's runtime files into a directory of another static site,
 * for example a subfolder of a GitHub Pages site, and record the source commit.
 *
 * For safety, the target must be new, empty, or a previous copy (identified by
 * its SOURCE.txt marker), so a site's own files are never overwritten.
 *
 * Usage: npm run site:copy -- <target-directory>
 */

import { execFileSync } from "node:child_process";
import { copyFile, cp, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RUNTIME_DIRECTORIES, RUNTIME_FILES, SOURCE_MARKER, assertSafeTarget } from "./lib/site-files.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPOSITORY_URL = "https://github.com/infpurewhite/andean-crops";

function sourceCommit() {
  try {
    const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
    const commit = git("rev-parse", "--short", "HEAD");
    return git("status", "--porcelain") === "" ? commit : `${commit} (with uncommitted changes)`;
  } catch {
    return "unknown";
  }
}

async function main() {
  const argument = process.argv[2];
  if (!argument) {
    console.error("Usage: npm run site:copy -- <target-directory>");
    process.exitCode = 2;
    return;
  }
  const target = resolve(argument);
  await assertSafeTarget(target, ROOT);

  for (const file of RUNTIME_FILES) {
    const destination = join(target, file);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(join(ROOT, file), destination);
  }
  for (const directory of RUNTIME_DIRECTORIES) {
    if (existsSync(join(ROOT, directory))) {
      await cp(join(ROOT, directory), join(target, directory), { recursive: true });
    }
  }
  const commit = sourceCommit();
  await writeFile(
    join(target, SOURCE_MARKER),
    [
      "Andean Crops Nutrient Composition Explorer",
      `Copied from ${REPOSITORY_URL} at commit ${commit} on ${new Date().toISOString().slice(0, 10)}.`,
      "Do not edit these files here: change the source repository, then copy again with",
      "  npm run site:copy -- <this directory>",
      "",
    ].join("\n"),
    "utf8",
  );
  console.log(`Copied ${RUNTIME_FILES.length} files and ${RUNTIME_DIRECTORIES.join(", ")} to ${target} (source commit ${commit}).`);
}

main().catch((error) => {
  console.error(`Copy failed: ${error.message}`);
  process.exitCode = 1;
});
