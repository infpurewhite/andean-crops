/**
 * Andean Agricultural & Nutritional Observatory
 * Loads structured dataset (data/crops.json) and provenance registry (data/sources.json).
 */
/**
 * UI string catalogue (English / Spanish)
 */
const I18N = Object.freeze({
  en: {
    "meta.title": "Andean Agricultural & Nutritional Observatory",
    "meta.description": "Sourced nutritional database and biochemical profiles of Andean agricultural cultivars with dry-matter normalization and peer-reviewed provenance.",
    "lang.aria": "Language",
    "header.badge": "Agrobiological Observatory",
    "header.title": "Andean Cultivar Profiles",
    "header.subtitle": "Sourced nutritional, mineral, and phytochemical database with field-group provenance and dry-matter normalization.",
    "kpi.aria": "Aggregated Metrics",
    "kpi.total": "Cultivars Listed",
    "kpi.sources": "Verified Sources",
    "kpi.protein": "Peak Protein / 100g",
    "kpi.iron": "Peak Iron / 100g",
    "controls.aria": "Search, Filter, and Basis Controls",
    "controls.searchLabel": "Search Cultivars",
    "controls.searchPlaceholder": "Filter by name, Quechua/local name, taxon, or bioactive...",
    "controls.categoryLabel": "Classification",
    "controls.basisLabel": "Measurement Basis",
    "controls.sortLabel": "Sort By Metric",
    "category.ALL": "All Classifications",
    "category.Pseudocereal": "Pseudocereal",
    "category.Tuber/Root": "Tuber / Root",
    "category.Legume": "Legume",
    "category.Grain": "Grain",
    "category.Fruit": "Fruit",
    "category.Seed/Alga": "Seed / Alga",
    "basis.as-reported": "As-Reported (100g edible)",
    "basis.dry-matter": "Dry Weight (100g DM)",
    "basis.tag.as-reported": "100g As-Reported",
    "basis.tag.dry-matter": "100g Dry Matter",
    "sort.name-asc": "Cultivar Name (A to Z)",
    "sort.protein-desc": "Protein (High to Low)",
    "sort.fiber-desc": "Dietary Fiber (High to Low)",
    "sort.iron-desc": "Iron Content (High to Low)",
    "sort.zinc-desc": "Zinc Content (High to Low)",
    "sort.vitc-desc": "Vitamin C (High to Low)",
    "sort.calories-asc": "Caloric Density (Low to High)",
    "grid.aria": "Cultivar Records",
    "status.loading": "Loading Andean cultivar database...",
    "status.count": "Showing {shown} of {total} Andean cultivars ({basis})",
    "actions.sources": "Source Registry",
    "actions.exportCsv": "Export CSV",
    "actions.exportJson": "Export JSON",
    "empty.title": "No Agronomic Records Matched",
    "empty.body": "No cultivars match the current search term and classification filters. Revise query parameters.",
    "card.family": "Family",
    "card.macroAria": "Macronutrient Profile per 100g",
    "card.rosterAria": "Constituent Breakdown per 100g",
    "card.energy": "Energy",
    "card.protein": "Protein",
    "card.fiber": "Fiber",
    "card.moisture": "Moisture (as-reported)",
    "card.carbs": "Available Carbohydrates",
    "card.lipids": "Total Lipids",
    "card.iron": "Iron (Fe)",
    "card.calcium": "Calcium (Ca)",
    "card.zinc": "Zinc (Zn)",
    "card.vitaminC": "Vitamin C",
    "card.bioactive": "Bioactive Profile",
    "card.processing": "Antinutrients & Processing",
    "card.composition": "Composition:",
    "card.bioactives": "Bioactives:",
    "card.compositionSources": "Composition Sources",
    "card.bioactiveSources": "Bioactive Sources",
    "footer.note": "Proximate & mineral data sourced from CENAN/INS Peru (2017), USDA FoodData Central, and FAO/INFOODS. Bioactive & processing profiles backed by peer-reviewed DOIs."
  },
  es: {
    "meta.title": "Observatorio Agrícola y Nutricional Andino",
    "meta.description": "Base de datos nutricional con fuentes verificadas y perfiles bioquímicos de cultivos andinos con normalización en materia seca.",
    "lang.aria": "Idioma",
    "header.badge": "Observatorio Agrobiológico",
    "header.title": "Perfiles de Cultivos Andinos",
    "header.subtitle": "Base de datos nutricional, mineral y fitoquímica con trazabilidad de fuentes por grupo de campos y normalización en materia seca.",
    "kpi.aria": "Métricas agregadas",
    "kpi.total": "Cultivos registrados",
    "kpi.sources": "Fuentes verificadas",
    "kpi.protein": "Proteína máxima / 100 g",
    "kpi.iron": "Hierro máximo / 100 g",
    "controls.aria": "Controles de búsqueda, filtrado y base",
    "controls.searchLabel": "Buscar cultivos",
    "controls.searchPlaceholder": "Filtrar por nombre, nombre quechua/local, taxón o bioactivo...",
    "controls.categoryLabel": "Clasificación",
    "controls.basisLabel": "Base de medición",
    "controls.sortLabel": "Ordenar por métrica",
    "category.ALL": "Todas las clasificaciones",
    "category.Pseudocereal": "Pseudocereal",
    "category.Tuber/Root": "Tubérculo / Raíz",
    "category.Legume": "Leguminosa",
    "category.Grain": "Grano",
    "category.Fruit": "Fruto",
    "category.Seed/Alga": "Semilla / Alga",
    "basis.as-reported": "Tal como se reporta (100 g comestible)",
    "basis.dry-matter": "Materia seca (100 g MS)",
    "basis.tag.as-reported": "100 g tal como se reporta",
    "basis.tag.dry-matter": "100 g materia seca",
    "sort.name-asc": "Nombre del cultivo (A a Z)",
    "sort.protein-desc": "Proteína (de mayor a menor)",
    "sort.fiber-desc": "Fibra dietética (de mayor a menor)",
    "sort.iron-desc": "Contenido de hierro (de mayor a menor)",
    "sort.zinc-desc": "Contenido de zinc (de mayor a menor)",
    "sort.vitc-desc": "Vitamina C (de mayor a menor)",
    "sort.calories-asc": "Densidad calórica (de menor a mayor)",
    "grid.aria": "Registros de cultivos",
    "status.loading": "Cargando base de datos de cultivos andinos...",
    "status.count": "Mostrando {shown} de {total} cultivos andinos ({basis})",
    "actions.sources": "Registro de fuentes",
    "actions.exportCsv": "Exportar CSV",
    "actions.exportJson": "Exportar JSON",
    "empty.title": "No se encontraron registros agronómicos",
    "empty.body": "Ningún cultivo coincide con el término de búsqueda y los filtros de clasificación actuales. Revise los parámetros de consulta.",
    "card.family": "Familia",
    "card.macroAria": "Perfil de macronutrientes por 100 g",
    "card.rosterAria": "Composición por 100 g",
    "card.energy": "Energía",
    "card.protein": "Proteína",
    "card.fiber": "Fibra",
    "card.moisture": "Humedad (tal como se reporta)",
    "card.carbs": "Carbohidratos disponibles",
    "card.lipids": "Lípidos totales",
    "card.iron": "Hierro (Fe)",
    "card.calcium": "Calcio (Ca)",
    "card.zinc": "Zinc (Zn)",
    "card.vitaminC": "Vitamina C",
    "card.bioactive": "Perfil bioactivo",
    "card.processing": "Antinutrientes y procesamiento",
    "card.composition": "Composición:",
    "card.bioactives": "Bioactivos:",
    "card.compositionSources": "Fuentes de composición",
    "card.bioactiveSources": "Fuentes bioactivas",
    "footer.note": "Datos proximales y minerales de CENAN/INS Perú (2017), USDA FoodData Central y FAO/INFOODS. Perfiles bioactivos y de procesamiento respaldados por DOIs revisados por pares."
  }
});

const SUPPORTED_LANGS = Object.freeze(Object.keys(I18N));
const LANG_STORAGE_KEY = "andean-observatory-lang";

/**
 * Resolve the initial language: ?lang= query, then saved choice, then browser locale.
 */
function resolveInitialLang() {
  const fromQuery = new URLSearchParams(window.location.search).get("lang");
  if (SUPPORTED_LANGS.includes(fromQuery)) return fromQuery;

  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (err) {
    // Storage unavailable (private mode, blocked site data): fall through.
  }

  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browser) ? browser : "en";
}

/**
 * Controller & State Orchestrator
 */
class AndeanObservatoryApp {
  constructor() {
    this.rawDataset = [];
    this.sourcesMap = new Map();
    this.state = {
      searchQuery: "",
      selectedCategory: "ALL",
      basisMode: "as-reported",
      sortMetric: "name-asc",
      lang: resolveInitialLang()
    };

    this.dom = {
      grid: document.getElementById("cultivar-grid"),
      resultsCount: document.getElementById("results-count"),
      searchInput: document.getElementById("search-input"),
      categorySelect: document.getElementById("category-select"),
      basisSelect: document.getElementById("basis-select"),
      sortSelect: document.getElementById("sort-select"),
      kpiTotal: document.getElementById("kpi-total"),
      kpiSources: document.getElementById("kpi-sources"),
      kpiProtein: document.getElementById("kpi-protein"),
      kpiIron: document.getElementById("kpi-iron"),
      langButtons: document.querySelectorAll(".lang-btn[data-lang]"),
      openSourcesBtn: document.getElementById("open-sources-btn"),
      exportCsvBtn: document.getElementById("export-csv-btn"),
      exportJsonBtn: document.getElementById("export-json-btn"),
      modal: document.getElementById("source-modal"),
      modalKicker: document.getElementById("modal-kicker"),
      modalTitle: document.getElementById("modal-title"),
      modalBody: document.getElementById("modal-body"),
      modalCloseBtn: document.getElementById("modal-close-btn")
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    this.setLanguage(this.state.lang, { persist: false });
    try {
      const [cropsRes, sourcesRes] = await Promise.all([
        fetch("./data/crops.json"),
        fetch("./data/sources.json")
      ]);

      if (!cropsRes.ok || !sourcesRes.ok) {
        throw new Error("Failed to fetch dataset or sources JSON.");
      }

      const cropsData = await cropsRes.json();
      const sourcesData = await sourcesRes.json();

      this.rawDataset = cropsData.cultivars || [];
      (sourcesData.sources || []).forEach(src => {
        this.sourcesMap.set(src.id, src);
      });

      this.renderKPIs();
      this.dispatchPipeline();
    } catch (err) {
      this.dom.resultsCount.textContent = "Unable to load data files.";
      this.dom.grid.innerHTML = `
        <article class="empty-state">
          <h2>Dataset Load Error</h2>
          <p>Could not fetch <code>data/crops.json</code> and <code>data/sources.json</code>. Serve this directory over HTTP (e.g. <code>python3 -m http.server</code>) rather than opening via <code>file://</code>.</p>
        </article>
      `;
      console.error(err);
    }
  }

  /** Translate a UI key, interpolating {placeholders}. Falls back to English. */
  t(key, vars = {}) {
    const template = I18N[this.state.lang][key] ?? I18N.en[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
  }

  /** Pick the current-language value from a {en, es} field. */
  localize(field) {
    return typeof field === "string" ? field : (field[this.state.lang] ?? field.en);
  }

  /** Locale-aware number formatting (decimal comma in Spanish). */
  num(value) {
    return new Intl.NumberFormat(this.state.lang).format(value);
  }

  setLanguage(lang, { persist = true } = {}) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    this.state.lang = lang;
    document.documentElement.lang = lang;

    if (persist) {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch (err) {
        // Non-critical: the choice simply won't be remembered.
      }
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url);
    }

    this.dom.langButtons.forEach(btn => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    this.translateStaticDom();
    this.renderKPIs();
    this.dispatchPipeline();
  }

  /**
   * Returns a cultivar record with metrics either as-reported or normalized to 100g Dry Matter (DM).
   */
  getNormalizedRecord(crop) {
    if (this.state.basisMode !== "dry-matter") {
      return {
        ...crop,
        activeBasisLabel: `${crop.basisLabel} (${crop.moisturePct}% moisture)`
      };
    }

    const dryFraction = (100 - crop.moisturePct) / 100;
    const factor = dryFraction > 0 ? 1 / dryFraction : 1;
    const scale = (val, decimals = 1) => Number((val * factor).toFixed(decimals));

    return {
      ...crop,
      calories: Math.round(crop.calories * factor),
      protein: scale(crop.protein, 1),
      carbs: scale(crop.carbs, 1),
      fiber: scale(crop.fiber, 1),
      lipids: scale(crop.lipids, 1),
      iron: scale(crop.iron, 1),
      calcium: Math.round(crop.calcium * factor),
      zinc: scale(crop.zinc, 1),
      vitaminC: scale(crop.vitaminC, 1),
      activeBasisLabel: `Normalized 100g DM (from ${crop.moisturePct}% moisture)`
    };
  }

  getProcessedRecords() {
    const normalized = this.rawDataset.map(c => this.getNormalizedRecord(c));
    const filtered = this.applyFiltering(normalized);
    return this.applySorting(filtered);
  }

  translateStaticDom() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.setAttribute("placeholder", this.t(el.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
      el.setAttribute("aria-label", this.t(el.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-content]").forEach(el => {
      el.setAttribute("content", this.t(el.dataset.i18nContent));
    });
  }

  renderKPIs() {
    const records = this.rawDataset.map(c => this.getNormalizedRecord(c));
    this.dom.kpiTotal.textContent = records.length.toString();
    this.dom.kpiSources.textContent = this.sourcesMap.size.toString();

    if (records.length === 0) return;

    const peakProtein = Math.max(...records.map(c => c.protein));
    this.dom.kpiProtein.textContent = `${this.num(peakProtein)}g`;

    const peakIron = Math.max(...records.map(c => c.iron));
    this.dom.kpiIron.textContent = `${this.num(peakIron)}mg`;
  }

  bindEvents() {
    this.dom.langButtons.forEach(btn => {
      btn.addEventListener("click", () => this.setLanguage(btn.dataset.lang));
    });

    this.dom.searchInput.addEventListener("input", (e) => {
      this.state.searchQuery = e.target.value.trim().toLowerCase();
      this.dispatchPipeline();
    });

    this.dom.categorySelect.addEventListener("change", (e) => {
      this.state.selectedCategory = e.target.value;
      this.dispatchPipeline();
    });

    this.dom.basisSelect.addEventListener("change", (e) => {
      this.state.basisMode = e.target.value;
      this.renderKPIs();
      this.dispatchPipeline();
    });

    this.dom.sortSelect.addEventListener("change", (e) => {
      this.state.sortMetric = e.target.value;
      this.dispatchPipeline();
    });

    this.dom.openSourcesBtn.addEventListener("click", () => {
      this.openSourcesModal(
        "Complete Provenance Registry",
        `All ${this.sourcesMap.size} Verified Sources`,
        Array.from(this.sourcesMap.keys())
      );
    });

    this.dom.exportCsvBtn.addEventListener("click", () => this.exportCSV());
    this.dom.exportJsonBtn.addEventListener("click", () => this.exportJSON());

    this.dom.modalCloseBtn.addEventListener("click", () => this.dom.modal.close());
    this.dom.modal.addEventListener("click", (e) => {
      if (e.target === this.dom.modal) {
        this.dom.modal.close();
      }
    });

    this.dom.grid.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-source-id]");
      if (!chip) return;
      const sourceId = chip.getAttribute("data-source-id");
      const cropName = chip.getAttribute("data-crop-name") || "Cultivar";
      const groupLabel = chip.getAttribute("data-group-label") || "Provenance";
      this.openSourcesModal(
        `${cropName} — ${groupLabel}`,
        "Cited Reference",
        [sourceId]
      );
    });
  }

  dispatchPipeline() {
    const records = this.getProcessedRecords();
    this.render(records);
  }

  applyFiltering(dataset) {
    const { searchQuery, selectedCategory } = this.state;

    return dataset.filter(item => {
      const matchesCategory =
        selectedCategory === "ALL" || item.classification === selectedCategory;

      if (!matchesCategory) return false;
      if (!searchQuery) return true;

      const searchableText = [
        this.localize(item.commonName),
        ...(item.localNames || []),
        item.scientificName,
        item.family,
        item.originRegion,
        this.localize(item.bioactives),
        item.antinutrientsAndProcessing
      ].join(" ").toLowerCase();

      return searchableText.includes(searchQuery);
    });
  }

  applySorting(dataset) {
    const sorted = [...dataset];
    const metric = this.state.sortMetric;

    sorted.sort((a, b) => {
      switch (metric) {
        case "protein-desc":
          return b.protein - a.protein;
        case "fiber-desc":
          return b.fiber - a.fiber;
        case "iron-desc":
          return b.iron - a.iron;
        case "zinc-desc":
          return b.zinc - a.zinc;
        case "vitc-desc":
          return b.vitaminC - a.vitaminC;
        case "calories-asc":
          return a.calories - b.calories;
        case "name-asc":
        default:
          return this.localize(a.commonName).localeCompare(this.localize(b.commonName), this.state.lang, { sensitivity: "base" });
      }
    });

    return sorted;
  }

  render(records) {
    const basisTag = this.t(`basis.tag.${this.state.basisMode}`);
    this.dom.resultsCount.textContent = this.t("status.count", {
      shown: records.length,
      total: this.rawDataset.length,
      basis: basisTag
    });

    if (records.length === 0) {
      this.dom.grid.innerHTML = `
        <article class="empty-state">
          <h2>${this.t("empty.title")}</h2>
          <p>${this.t("empty.body")}</p>
        </article>
      `;
      return;
    }

    this.dom.grid.innerHTML = records.map(crop => this.generateCardMarkup(crop)).join("");
  }

  renderSourceChips(crop, groupKey, groupLabel) {
    const ids = (crop.sources && crop.sources[groupKey]) || [];
    return ids.map(id => {
      const src = this.sourcesMap.get(id);
      const label = src ? src.shortCitation : id;
      return `<button type="button" class="source-chip" data-source-id="${id}" data-crop-name="${crop.commonName}" data-group-label="${groupLabel}">${label}</button>`;
    }).join("");
  }

  generateCardMarkup(crop) {
    return `
      <article class="cultivar-card" id="cultivar-${crop.id}">
        <header class="card-header">
          <div class="card-badges">
            <span class="badge-classification ${crop.badgeClass}">${this.t(`category.${crop.classification}`)}</span>
            <span class="badge-basis">${crop.activeBasisLabel}</span>
          </div>
          <h2 class="cultivar-name">${this.localize(crop.commonName)}</h2>
          <span class="cultivar-taxon">${crop.scientificName}</span>
          <div class="cultivar-meta">
            <span class="cultivar-family">${this.t("card.family")}: ${crop.family}</span>
            <span>${crop.originRegion} (${crop.altitudeRangeMasl} m)</span>
          </div>
        </header>

        <section class="macro-matrix" aria-label="${this.t("card.macroAria")}">
          <div class="macro-cell">
            <span class="macro-cell-label">${this.t("card.energy")}</span>
            <span class="macro-cell-value">${this.num(crop.calories)} <small>kcal</small></span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-label">${this.t("card.protein")}</span>
            <span class="macro-cell-value">${this.num(crop.protein)} g</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-label">${this.t("card.fiber")}</span>
            <span class="macro-cell-value">${this.num(crop.fiber)} g</span>
          </div>
        </section>

        <ul class="nutrient-roster" aria-label="${this.t("card.rosterAria")}">
          <li><span>${this.t("card.moisture")}:</span><strong>${this.num(crop.moisturePct)}%</strong></li>
          <li><span>${this.t("card.carbs")}:</span><strong>${this.num(crop.carbs)}g</strong></li>
          <li><span>${this.t("card.lipids")}:</span><strong>${this.num(crop.lipids)}g</strong></li>
          <li><span>${this.t("card.iron")}:</span><strong>${this.num(crop.iron)}mg</strong></li>
          <li><span>${this.t("card.calcium")}:</span><strong>${this.num(crop.calcium)}mg</strong></li>
          <li><span>${this.t("card.zinc")}:</span><strong>${this.num(crop.zinc)}mg</strong></li>
          <li><span>${this.t("card.vitaminC")}:</span><strong>${this.num(crop.vitaminC)}mg</strong></li>
        </ul>

        <section class="bioactive-section">
          <span class="bioactive-title">${this.t("card.bioactive")}</span>
          <p class="bioactive-desc">${this.localize(crop.bioactives)}</p>
        </section>

        <section class="bioactive-section">
          <span class="bioactive-title processing-title">${this.t("card.processing")}</span>
          <p class="bioactive-desc">${crop.antinutrientsAndProcessing}</p>
        </section>

        <footer class="card-sources">
          <div class="source-chip-row">
            <span class="source-group-label">${this.t("card.composition")}</span>
            ${this.renderSourceChips(crop, "composition", this.t("card.compositionSources"))}
          </div>
          <div class="source-chip-row">
            <span class="source-group-label">${this.t("card.bioactives")}</span>
            ${this.renderSourceChips(crop, "bioactives", this.t("card.bioactiveSources"))}
          </div>
        </footer>
      </article>
    `;
  }

  openSourcesModal(kicker, title, sourceIds) {
    this.dom.modalKicker.textContent = kicker;
    this.dom.modalTitle.textContent = title;

    const cardsHtml = sourceIds.map(id => {
      const src = this.sourcesMap.get(id);
      if (!src) return "";
      const typeLabel = src.type === "food_composition_table"
        ? "Food Composition Table"
        : "Peer-Reviewed Study";
      return `
        <article class="citation-card">
          <span class="citation-type">${typeLabel}</span>
          <div class="citation-title">${src.shortCitation} — ${src.title}</div>
          <div class="citation-authors">${src.authorsOrOrg} (${src.year})</div>
          <div class="citation-meta">
            <span>${src.identifier} &middot; Accessed ${src.accessedAt}</span>
            <a href="${src.url}" target="_blank" rel="noopener noreferrer">Open Source &nearr;</a>
          </div>
        </article>
      `;
    }).join("");

    this.dom.modalBody.innerHTML = cardsHtml || "<p>No citations found.</p>";
    this.dom.modal.showModal();
  }

  exportJSON() {
    const records = this.getProcessedRecords();
    const payload = {
      exportedAt: new Date().toISOString(),
      basisMode: this.state.basisMode,
      count: records.length,
      cultivars: records,
      sources: Object.fromEntries(this.sourcesMap)
    };
    this.triggerDownload(
      JSON.stringify(payload, null, 2),
      `andean-crops-${this.state.basisMode}.json`,
      "application/json"
    );
  }

  exportCSV() {
    const records = this.getProcessedRecords();
    const headers = [
      "id", "commonName", "scientificName", "family", "classification",
      "basis", "moisturePct", "calories", "protein", "carbs", "fiber",
      "lipids", "iron", "calcium", "zinc", "vitaminC",
      "compositionSources", "bioactiveSources"
    ];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = records.map(r => [
      r.id, r.commonName, r.scientificName, r.family, r.classification,
      this.state.basisMode === "dry-matter" ? "dry_matter_100g" : r.basis,
      r.moisturePct, r.calories, r.protein, r.carbs, r.fiber,
      r.lipids, r.iron, r.calcium, r.zinc, r.vitaminC,
      (r.sources?.composition || []).join("; "),
      (r.sources?.bioactives || []).join("; ")
    ].map(escape).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    this.triggerDownload(
      csv,
      `andean-crops-${this.state.basisMode}.csv`,
      "text/csv;charset=utf-8"
    );
  }

  triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AndeanObservatoryApp();
});