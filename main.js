/**
 * Andean Agricultural Crop Dataset
 * Baseline: Normalized per 100g edible portion (dry/raw basis)
 */
const ANDEAN_CULTIVARS = Object.freeze([
  {
    id: "quinoa",
    commonName: { en: "Quinoa", es: "Quinua" },
    scientificName: "Chenopodium quinoa",
    family: "Amaranthaceae",
    classification: "Pseudocereal",
    badgeClass: "badge-pseudocereal",
    calories: 368,
    protein: 14.1,
    carbs: 64.2,
    fiber: 7.0,
    lipids: 6.1,
    iron: 4.6,
    calcium: 47,
    bioactives: {
      en: "Balanced essential amino acids (notably lysine and methionine); high flavonol density (quercetin and kaempferol glycosides).",
      es: "Aminoácidos esenciales equilibrados (en particular lisina y metionina); alta densidad de flavonoles (glucósidos de quercetina y kaempferol)."
    }
  },
  {
    id: "kiwicha",
    commonName: { en: "Kiwicha", es: "Kiwicha (Amaranto)" },
    scientificName: "Amaranthus caudatus",
    family: "Amaranthaceae",
    classification: "Pseudocereal",
    badgeClass: "badge-pseudocereal",
    calories: 371,
    protein: 13.6,
    carbs: 65.3,
    fiber: 6.7,
    lipids: 7.0,
    iron: 7.6,
    calcium: 159,
    bioactives: {
      en: "High squalene lipid fractions; bioavailable tocotrienols; complete peptide profile rich in sulfur amino acids.",
      es: "Fracciones lipídicas ricas en escualeno; tocotrienoles biodisponibles; perfil peptídico completo rico en aminoácidos azufrados."
    }
  },
  {
    id: "canihua",
    commonName: { en: "Cañihua", es: "Cañihua" },
    scientificName: "Chenopodium pallidicaule",
    family: "Amaranthaceae",
    classification: "Pseudocereal",
    badgeClass: "badge-pseudocereal",
    calories: 343,
    protein: 15.7,
    carbs: 63.8,
    fiber: 9.8,
    lipids: 4.2,
    iron: 13.0,
    calcium: 110,
    bioactives: {
      en: "Rutin, vanillic, and ferulic phenolic acids; high resistance to saponin accumulation compared to C. quinoa.",
      es: "Rutina y ácidos fenólicos vaníllico y ferúlico; alta resistencia a la acumulación de saponinas en comparación con C. quinoa."
    }
  },
  {
    id: "tarwi",
    commonName: { en: "Tarwi (Chocho)", es: "Tarwi (Chocho)" },
    scientificName: "Lupinus mutabilis",
    family: "Fabaceae",
    classification: "Legume",
    badgeClass: "badge-legume",
    calories: 411,
    protein: 44.3,
    carbs: 28.2,
    fiber: 11.2,
    lipids: 16.5,
    iron: 5.3,
    calcium: 93,
    bioactives: {
      en: "Quinolizidine alkaloids (sparteine, lupanine—mitigated via aqueous leaching); monounsaturated oleic and linoleic fatty acid complexes.",
      es: "Alcaloides quinolizidínicos (esparteína, lupanina; mitigados mediante lixiviación acuosa); complejos de ácidos grasos monoinsaturados oleico y linoleico."
    }
  },
  {
    id: "maca",
    commonName: { en: "Maca", es: "Maca" },
    scientificName: "Lepidium meyenii",
    family: "Brassicaceae",
    classification: "Tuber/Root",
    badgeClass: "badge-tuberroot",
    calories: 325,
    protein: 10.2,
    carbs: 71.4,
    fiber: 8.5,
    lipids: 0.9,
    iron: 14.8,
    calcium: 250,
    bioactives: {
      en: "Lipophilic macamides and macaenes; glucosinolates (glucotropaeolin); secondary benzylamine alkaloid derivatives.",
      es: "Macamidas y macaenos lipofílicos; glucosinolatos (glucotropeolina); derivados alcaloides secundarios de bencilamina."
    }
  },
  {
    id: "purple-corn",
    commonName: { en: "Purple Corn (Maíz Morado)", es: "Maíz Morado" },
    scientificName: "Zea mays amylacea",
    family: "Poaceae",
    classification: "Grain",
    badgeClass: "badge-grain",
    calories: 356,
    protein: 8.5,
    carbs: 74.2,
    fiber: 7.3,
    lipids: 4.3,
    iron: 2.1,
    calcium: 18,
    bioactives: {
      en: "Concentrated acylated anthocyanins (predominantly cyanidin-3-glucoside and pelargonidin derivatives); phenolic ferulate complexes.",
      es: "Antocianinas aciladas concentradas (predominantemente cianidina-3-glucósido y derivados de pelargonidina); complejos fenólicos de ferulato."
    }
  },
  {
    id: "mashua",
    commonName: { en: "Mashua", es: "Mashua" },
    scientificName: "Tropaeolum tuberosum",
    family: "Tropaeolaceae",
    classification: "Tuber/Root",
    badgeClass: "badge-tuberroot",
    calories: 52,
    protein: 1.5,
    carbs: 11.3,
    fiber: 1.8,
    lipids: 0.2,
    iron: 1.2,
    calcium: 12,
    bioactives: {
      en: "Aliphatic and aromatic isothiocyanates; high glucosinolate and alkylglucosinolate fractions exhibiting strong broad-spectrum antimicrobial activity.",
      es: "Isotiocianatos alifáticos y aromáticos; altas fracciones de glucosinolatos y alquilglucosinolatos con fuerte actividad antimicrobiana de amplio espectro."
    }
  },
  {
    id: "oca",
    commonName: { en: "Oca", es: "Oca" },
    scientificName: "Oxalis tuberosa",
    family: "Oxalidaceae",
    classification: "Tuber/Root",
    badgeClass: "badge-tuberroot",
    calories: 61,
    protein: 1.1,
    carbs: 13.3,
    fiber: 1.4,
    lipids: 0.6,
    iron: 1.6,
    calcium: 19,
    bioactives: {
      en: "Oxalic acid (catabolized and reduced post-harvest via traditional solarization); soluble organic acids and anthocyanic pelargonidin pigments.",
      es: "Ácido oxálico (catabolizado y reducido tras la cosecha mediante soleado tradicional); ácidos orgánicos solubles y pigmentos antociánicos de pelargonidina."
    }
  }
]);

/**
 * UI string catalogue (English / Spanish)
 */
const I18N = Object.freeze({
  en: {
    "meta.title": "Andean Agricultural & Nutritional Observatory",
    "meta.description": "Nutritional database and biochemical profiles of Andean agricultural cultivars normalized per 100g edible portion.",
    "lang.aria": "Language",
    "header.badge": "Agrobiological Observatory",
    "header.title": "Andean Cultivar Profiles",
    "header.subtitle": "Nutritional, biochemical, and phytochemical indicators standardized per 100g dry/edible portion.",
    "kpi.aria": "Aggregated Metrics",
    "kpi.total": "Cultivars Listed",
    "kpi.protein": "Peak Protein / 100g",
    "kpi.iron": "Peak Iron / 100g",
    "controls.aria": "Search and Filter Controls",
    "controls.searchLabel": "Search Cultivars",
    "controls.searchPlaceholder": "Filter by common name, taxon, or bioactive compound...",
    "controls.categoryLabel": "Classification",
    "controls.sortLabel": "Sort By Metric",
    "category.ALL": "All Classifications",
    "category.Pseudocereal": "Pseudocereal",
    "category.Tuber/Root": "Tuber / Root",
    "category.Legume": "Legume",
    "category.Grain": "Grain",
    "sort.name-asc": "Cultivar Name (A to Z)",
    "sort.protein-desc": "Protein (High to Low)",
    "sort.fiber-desc": "Dietary Fiber (High to Low)",
    "sort.iron-desc": "Iron Content (High to Low)",
    "sort.calories-asc": "Caloric Density (Low to High)",
    "grid.aria": "Cultivar Records",
    "status.count": "Showing {shown} of {total} Andean cultivars",
    "empty.title": "No Agronomic Records Matched",
    "empty.body": "No cultivars match the current search term and classification filters. Revise query parameters.",
    "card.family": "Family",
    "card.macroAria": "Macronutrient Profile per 100g",
    "card.rosterAria": "Constituent Breakdown per 100g",
    "card.energy": "Energy",
    "card.protein": "Protein",
    "card.fiber": "Fiber",
    "card.carbs": "Available Carbohydrates",
    "card.lipids": "Total Lipids",
    "card.iron": "Iron (Fe)",
    "card.calcium": "Calcium (Ca)",
    "card.bioactive": "Bioactive Profile",
    "footer.note": "Values standardized per 100g edible portion. Derived from FAO/INFOODS Regional Food Composition Tables for the Andes and agronomical literature."
  },
  es: {
    "meta.title": "Observatorio Agrícola y Nutricional Andino",
    "meta.description": "Base de datos nutricional y perfiles bioquímicos de cultivos agrícolas andinos normalizados por 100 g de porción comestible.",
    "lang.aria": "Idioma",
    "header.badge": "Observatorio Agrobiológico",
    "header.title": "Perfiles de Cultivos Andinos",
    "header.subtitle": "Indicadores nutricionales, bioquímicos y fitoquímicos estandarizados por 100 g de porción seca/comestible.",
    "kpi.aria": "Métricas agregadas",
    "kpi.total": "Cultivos registrados",
    "kpi.protein": "Proteína máxima / 100 g",
    "kpi.iron": "Hierro máximo / 100 g",
    "controls.aria": "Controles de búsqueda y filtrado",
    "controls.searchLabel": "Buscar cultivos",
    "controls.searchPlaceholder": "Filtrar por nombre común, taxón o compuesto bioactivo...",
    "controls.categoryLabel": "Clasificación",
    "controls.sortLabel": "Ordenar por métrica",
    "category.ALL": "Todas las clasificaciones",
    "category.Pseudocereal": "Pseudocereal",
    "category.Tuber/Root": "Tubérculo / Raíz",
    "category.Legume": "Leguminosa",
    "category.Grain": "Grano",
    "sort.name-asc": "Nombre del cultivo (A a Z)",
    "sort.protein-desc": "Proteína (de mayor a menor)",
    "sort.fiber-desc": "Fibra dietética (de mayor a menor)",
    "sort.iron-desc": "Contenido de hierro (de mayor a menor)",
    "sort.calories-asc": "Densidad calórica (de menor a mayor)",
    "grid.aria": "Registros de cultivos",
    "status.count": "Mostrando {shown} de {total} cultivos andinos",
    "empty.title": "No se encontraron registros agronómicos",
    "empty.body": "Ningún cultivo coincide con el término de búsqueda y los filtros de clasificación actuales. Revise los parámetros de consulta.",
    "card.family": "Familia",
    "card.macroAria": "Perfil de macronutrientes por 100 g",
    "card.rosterAria": "Composición por 100 g",
    "card.energy": "Energía",
    "card.protein": "Proteína",
    "card.fiber": "Fibra",
    "card.carbs": "Carbohidratos disponibles",
    "card.lipids": "Lípidos totales",
    "card.iron": "Hierro (Fe)",
    "card.calcium": "Calcio (Ca)",
    "card.bioactive": "Perfil bioactivo",
    "footer.note": "Valores estandarizados por 100 g de porción comestible. Derivados de las Tablas Regionales de Composición de Alimentos FAO/INFOODS para los Andes y de literatura agronómica."
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
  constructor(dataset) {
    this.rawDataset = dataset;
    this.state = {
      searchQuery: "",
      selectedCategory: "ALL",
      sortMetric: "name-asc",
      lang: resolveInitialLang()
    };

    // Cache DOM Nodes
    this.dom = {
      grid: document.getElementById("cultivar-grid"),
      resultsCount: document.getElementById("results-count"),
      searchInput: document.getElementById("search-input"),
      categorySelect: document.getElementById("category-select"),
      sortSelect: document.getElementById("sort-select"),
      kpiTotal: document.getElementById("kpi-total"),
      kpiProtein: document.getElementById("kpi-protein"),
      kpiIron: document.getElementById("kpi-iron"),
      langButtons: document.querySelectorAll(".lang-btn[data-lang]")
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.setLanguage(this.state.lang, { persist: false });
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
    this.dom.kpiTotal.textContent = this.rawDataset.length.toString();
    
    const peakProtein = Math.max(...this.rawDataset.map(c => c.protein));
    this.dom.kpiProtein.textContent = `${this.num(peakProtein)} g`;

    const peakIron = Math.max(...this.rawDataset.map(c => c.iron));
    this.dom.kpiIron.textContent = `${this.num(peakIron)} mg`;
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

    this.dom.sortSelect.addEventListener("change", (e) => {
      this.state.sortMetric = e.target.value;
      this.dispatchPipeline();
    });
  }

  /**
   * Deterministic Data Pipeline: Filter -> Sort -> Render
   */
  dispatchPipeline() {
    const filtered = this.applyFiltering(this.rawDataset);
    const sorted = this.applySorting(filtered);
    this.render(sorted);
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
        item.scientificName,
        item.family,
        this.localize(item.bioactives)
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
    this.dom.resultsCount.textContent = this.t("status.count", {
      shown: records.length,
      total: this.rawDataset.length
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

  generateCardMarkup(crop) {
    return `
      <article class="cultivar-card" id="cultivar-${crop.id}">
        <header class="card-header">
          <span class="badge-classification ${crop.badgeClass}">${this.t(`category.${crop.classification}`)}</span>
          <h2 class="cultivar-name">${this.localize(crop.commonName)}</h2>
          <span class="cultivar-taxon">${crop.scientificName}</span>
          <span class="cultivar-family">${this.t("card.family")}: ${crop.family}</span>
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
          <li>
            <span>${this.t("card.carbs")}:</span>
            <strong>${this.num(crop.carbs)} g</strong>
          </li>
          <li>
            <span>${this.t("card.lipids")}:</span>
            <strong>${this.num(crop.lipids)} g</strong>
          </li>
          <li>
            <span>${this.t("card.iron")}:</span>
            <strong>${this.num(crop.iron)} mg</strong>
          </li>
          <li>
            <span>${this.t("card.calcium")}:</span>
            <strong>${this.num(crop.calcium)} mg</strong>
          </li>
        </ul>

        <footer class="bioactive-section">
          <span class="bioactive-title">${this.t("card.bioactive")}</span>
          <p class="bioactive-desc">${this.localize(crop.bioactives)}</p>
        </footer>
      </article>
    `;
  }
}

// Lifecycle Initialization
document.addEventListener("DOMContentLoaded", () => {
  new AndeanObservatoryApp(ANDEAN_CULTIVARS);
});