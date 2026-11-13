#!/usr/bin/env node
/**
 * Minimal static file server for local development (no dependencies).
 * Browsers block module scripts and fetch() on file:// pages, so the site
 * must be served over HTTP.
 *
 * Usage: npm start            (http://127.0.0.1:8000)
 *        PORT=9000 npm start
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRequestPath } from "./lib/static-path.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT ?? "8000", 10);

const CONTENT_TYPES = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
});

const server = createServer(async (request, response) => {
  const filePath = resolveRequestPath(ROOT, request.url ?? "/");
  if (filePath === null || !["GET", "HEAD"].includes(request.method)) {
    response.writeHead(filePath === null ? 403 : 405).end();
    return;
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    const status = error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 500;
    if (status === 500) console.error(`Error serving ${request.url}:`, error);
    response.writeHead(status).end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT} at http://${HOST}:${PORT}/ (Ctrl+C to stop)`);
});
