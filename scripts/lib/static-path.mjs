/**
 * Map a request path to a file inside the site root for the development
 * server, refusing paths that escape the root or touch hidden files.
 *
 * @module static-path
 */

import { join, normalize, resolve, sep } from "node:path";

/**
 * Resolve a URL path to an absolute file path inside root.
 *
 * @param {string} root Absolute site root.
 * @param {string} urlPath Request path, e.g. "/data/andean-crops.json?x=1".
 * @returns {string|null} Absolute path, or null if the path is not allowed.
 */
export function resolveRequestPath(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  const segments = decoded.split("/").filter(Boolean);
  if (segments.some((segment) => segment.startsWith(".") || segment === "node_modules")) return null;

  const base = resolve(root);
  const target = resolve(base, join(".", normalize(`/${segments.join("/")}`)));
  if (target !== base && !target.startsWith(base + sep)) return null;
  return decoded.endsWith("/") || segments.length === 0 ? join(target, "index.html") : target;
}
