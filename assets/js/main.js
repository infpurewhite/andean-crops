/**
 * Entry point: load the dataset and start the explorer.
 *
 * @module main
 */

import { CropExplorer } from "./app.js";

const DATASET_URL = new URL("../../data/andean-crops.json", import.meta.url);

/**
 * Fetch and parse the dataset.
 *
 * @param {URL} url Dataset location.
 * @returns {Promise<object>}
 * @throws {Error} If the request fails or the response is not valid JSON.
 */
async function loadDataset(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Could not load ${url.pathname} (HTTP ${response.status}).`);
  }
  return response.json();
}

function showLoadError(error) {
  const status = document.getElementById("results-status");
  if (!status) return;
  status.classList.add("results-status--error");
  status.textContent =
    window.location.protocol === "file:"
      ? "The dataset cannot be loaded from a file:// address. Serve the folder over HTTP " +
        "(for example, run “npm start”) and open the local address instead."
      : `The dataset could not be loaded: ${error.message}`;
}

try {
  const dataset = await loadDataset(DATASET_URL);
  new CropExplorer(document, dataset).start();
} catch (error) {
  console.error("Failed to start the crop explorer:", error);
  showLoadError(error);
}
