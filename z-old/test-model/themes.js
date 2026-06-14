class ColorThemeSystem {
  constructor(jsonUrl = "./themes.json") {
    this.jsonUrl = jsonUrl;

    this.themes = {};

    this.currentTheme = null;

    this.init();
  }

  init() {
    //this.waitForElement("#themePresets", 3000)

    // .then(() => this.loadThemes())

    // .catch(() => console.warn("Timeout esperando #themePresets"));

    console.log("ColorThemeSystem listo. Esperando carga de componente.");
  }

  async setupData() {
    try {
      // Usar inlineThemes si existen

      this.themes = window.inlineThemes || {};

      if (!Object.keys(this.themes).length) {
        const res = await fetch(this.jsonUrl);

        const data = await res.json();

        this.themes = data.themes || {};
      }

      console.log("Temas cargados:", this.themes);

      this.currentTheme = this.themes[activeTheme]
        ? activeTheme
        : Object.keys(this.themes)[0];

      // Esperar a que #themePresets esté en el DOM
      // await this.waitForElement("#themePresets", 3000);

      if (this.currentTheme) {
        // Pasamos 'false' para que no intente generar los presets HTML.
        this.applyTheme(this.currentTheme, false);
      }

      //this.setupEventListeners();
    } catch (e) {
      console.error("No se pudieron cargar los temas JSON:", e);
    }
  }

  async initializePanel() {
    try {
      const container = await this.waitForElement("#themePresets", 3000);

      this.generateThemePresets();

      if (this.currentTheme) this.applyTheme(this.currentTheme);

      this.setupEventListeners();

      this.updateContrastInfo();
    } catch (e) {
      console.warn(
        "No se pudo inicializar el panel: #themePresets no encontrado",
      );
    }
  }

  waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);

      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);

        if (found) {
          observer.disconnect();

          resolve(found);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,

        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();

        reject(new Error("timeout"));
      }, timeout);
    });
  }

  generateThemePresets() {
    const container = document.getElementById("themePresets");

    if (!container) return;

    container.innerHTML = "";

    // Crear y agregar el botón en posición 0

    const addButton = document.createElement("div");

    addButton.className = "theme-preset add-theme-btn";

    addButton.innerHTML = `

<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

<line x1="12" y1="5" x2="12" y2="19"></line>

<line x1="5" y1="12" x2="19" y2="12"></line>

</svg>

`;

    addButton.title = "Agregar tema personalizado";

    addButton.onclick = () => this.addCustomTheme();

    container.appendChild(addButton);

    // Agregar los temas existentes

    Object.entries(this.themes).forEach(([key, theme]) => {
      const preset = document.createElement("div");

      preset.className = `theme-preset ${
        key === this.currentTheme ? "active" : ""
      }`;

      preset.style.background = `linear-gradient(135deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`;

      preset.title = theme.name;

      preset.onclick = () => this.applyTheme(key);

      container.appendChild(preset);
    });
  }

  // Método para manejar el click del botón (ejemplo)

  addCustomTheme() {
    console.log("Agregar tema personalizado");

    // Aquí puedes agregar la lógica para crear un tema personalizado

    // Por ejemplo, guardar los colores actuales como un nuevo tema
  }

  setupEventListeners() {
    const startColor = document.getElementById("startColor");

    const endColor = document.getElementById("endColor");

    const accentColor = document.getElementById("accentColor");

    if (!startColor || !endColor || !accentColor) return;

    startColor.addEventListener("input", (e) => {
      this.applyCustomColors(e.target.value, endColor.value, accentColor.value);

      this.updateContrastInfo();
    });

    endColor.addEventListener("input", (e) => {
      this.applyCustomColors(
        startColor.value,

        e.target.value,

        accentColor.value,
      );

      this.updateContrastInfo();
    });

    accentColor.addEventListener("input", (e) => {
      this.applyCustomColors(startColor.value, endColor.value, e.target.value);

      this.updateContrastInfo();
    });
  }

  applyTheme(key, updatePresets = true) {
    const theme = this.themes[key];

    if (!theme) return;

    this.currentTheme = key;

    document.documentElement.style.setProperty("--bg-start", theme.bgStart);

    document.documentElement.style.setProperty("--bg-end", theme.bgEnd);

    document.documentElement.style.setProperty("--accent-color", theme.accent);

    document.documentElement.style.setProperty(
      "--text-primary",

      theme.textPrimary,
    );

    // Solo generar presets si updatePresets es true
    if (updatePresets) {
      this.generateThemePresets();
    }

    this.updateContrastInfo();
  }

  applyCustomColors(bgStart, bgEnd, accent) {
    document.documentElement.style.setProperty("--bg-start", bgStart);

    document.documentElement.style.setProperty("--bg-end", bgEnd);

    document.documentElement.style.setProperty("--accent-color", accent);
  }

  updateContrastInfo() {
    const info = document.getElementById("contrastInfo");

    if (!info) return;

    const bgStart = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-start")

      .trim();

    const bgEnd = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-end")

      .trim();

    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-primary")

      .trim();

    const contrast = this.calculateContrast(bgStart, textColor);

    const contrast2 = this.calculateContrast(bgEnd, textColor);

    info.innerText = `Contraste inicio: ${contrast.toFixed(
      2,
    )} / fin: ${contrast2.toFixed(2)}`;
  }

  calculateContrast(hex1, hex2) {
    const luminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);

      const r = (rgb >> 16) & 0xff;

      const g = (rgb >> 8) & 0xff;

      const b = rgb & 0xff;

      const srgb = [r, g, b].map((v) =>
        v <= 0.03928
          ? v / 255 / 12.92
          : Math.pow((v / 255 + 0.055) / 1.055, 2.4),
      );

      return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    };

    const L1 = luminance(hex1);

    const L2 = luminance(hex2);

    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }
}

// Instancia global

window.themeSystem = new ColorThemeSystem("./themes.json");

// Llama al nuevo método para cargar los datos y aplicar el CSS inicial
if (typeof activeTheme !== "undefined") {
  window.themeSystem.setupData();
}
