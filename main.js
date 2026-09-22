/**
 * Andean Agricultural Crop Dataset
 * Baseline: Normalized per 100g edible portion (dry/raw basis)
 */
const ANDEAN_CULTIVARS = Object.freeze([
  {
    id: "quinoa",
    commonName: "Quinoa",
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
    bioactives: "Balanced essential amino acids (notably lysine and methionine); high flavonol density (quercetin and kaempferol glycosides)."
  },
  {
    id: "kiwicha",
    commonName: "Kiwicha",
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
    bioactives: "High squalene lipid fractions; bioavailable tocotrienols; complete peptide profile rich in sulfur amino acids."
  },
  {
    id: "canihua",
    commonName: "Cañihua",
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
    bioactives: "Rutin, vanillic, and ferulic phenolic acids; high resistance to saponin accumulation compared to C. quinoa."
  },
  {
    id: "tarwi",
    commonName: "Tarwi (Chocho)",
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
    bioactives: "Quinolizidine alkaloids (sparteine, lupanine—mitigated via aqueous leaching); monounsaturated oleic and linoleic fatty acid complexes."
  },
  {
    id: "maca",
    commonName: "Maca",
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
    bioactives: "Lipophilic macamides and macaenes; glucosinolates (glucotropaeolin); secondary benzylamine alkaloid derivatives."
  },
  {
    id: "purple-corn",
    commonName: "Purple Corn (Maíz Morado)",
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
    bioactives: "Concentrated acylated anthocyanins (predominantly cyanidin-3-glucoside and pelargonidin derivatives); phenolic ferulate complexes."
  },
  {
    id: "mashua",
    commonName: "Mashua",
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
    bioactives: "Aliphatic and aromatic isothiocyanates; high glucosinolate and alkylglucosinolate fractions exhibiting strong broad-spectrum antimicrobial activity."
  },
  {
    id: "oca",
    commonName: "Oca",
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
    bioactives: "Oxalic acid (catabolized and reduced post-harvest via traditional solarization); soluble organic acids and anthocyanic pelargonidin pigments."
  }
]);

/**
 * Controller & State Orchestrator
 */
class AndeanObservatoryApp {
  constructor(dataset) {
    this.rawDataset = dataset;
    this.state = {
      searchQuery: "",
      selectedCategory: "ALL",
      sortMetric: "name-asc"
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
      kpiIron: document.getElementById("kpi-iron")
    };

    this.init();
  }

  init() {
    this.renderKPIs();
    this.bindEvents();
    this.dispatchPipeline();
  }

  renderKPIs() {
    this.dom.kpiTotal.textContent = this.rawDataset.length.toString();
    
    const peakProtein = Math.max(...this.rawDataset.map(c => c.protein));
    this.dom.kpiProtein.textContent = `${peakProtein}g`;

    const peakIron = Math.max(...this.rawDataset.map(c => c.iron));
    this.dom.kpiIron.textContent = `${peakIron}mg`;
  }

  bindEvents() {
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
        item.commonName,
        item.scientificName,
        item.family,
        item.bioactives
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
          return a.commonName.localeCompare(b.commonName, undefined, { sensitivity: "base" });
      }
    });

    return sorted;
  }

  render(records) {
    this.dom.resultsCount.textContent = `Showing ${records.length} of ${this.rawDataset.length} Andean cultivars`;

    if (records.length === 0) {
      this.dom.grid.innerHTML = `
        <article class="empty-state">
          <h2>No Agronomic Records Matched</h2>
          <p>No cultivars match the current search term and classification filters. Revise query parameters.</p>
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
          <span class="badge-classification ${crop.badgeClass}">${crop.classification}</span>
          <h2 class="cultivar-name">${crop.commonName}</h2>
          <span class="cultivar-taxon">${crop.scientificName}</span>
          <span class="cultivar-family">Family: ${crop.family}</span>
        </header>

        <section class="macro-matrix" aria-label="Macronutrient Profile per 100g">
          <div class="macro-cell">
            <span class="macro-cell-label">Energy</span>
            <span class="macro-cell-value">${crop.calories} <small>kcal</small></span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-label">Protein</span>
            <span class="macro-cell-value">${crop.protein}g</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-label">Fiber</span>
            <span class="macro-cell-value">${crop.fiber}g</span>
          </div>
        </section>

        <ul class="nutrient-roster" aria-label="Constituent Breakdown per 100g">
          <li>
            <span>Available Carbohydrates:</span>
            <strong>${crop.carbs}g</strong>
          </li>
          <li>
            <span>Total Lipids:</span>
            <strong>${crop.lipids}g</strong>
          </li>
          <li>
            <span>Iron (Fe):</span>
            <strong>${crop.iron}mg</strong>
          </li>
          <li>
            <span>Calcium (Ca):</span>
            <strong>${crop.calcium}mg</strong>
          </li>
        </ul>

        <footer class="bioactive-section">
          <span class="bioactive-title">Bioactive Profile</span>
          <p class="bioactive-desc">${crop.bioactives}</p>
        </footer>
      </article>
    `;
  }
}

// Lifecycle Initialization
document.addEventListener("DOMContentLoaded", () => {
  new AndeanObservatoryApp(ANDEAN_CULTIVARS);
});