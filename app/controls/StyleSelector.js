export class StyleSelector {
  static styleId = "style-selector-component-styles";
  static stylesheetHref = "controls/style-selector/controls.css";

  constructor(targetSelector, options = {}) {
    this.target =
      typeof targetSelector === "string"
        ? document.querySelector(targetSelector)
        : targetSelector;

    if (!this.target) {
      throw new Error(`StyleSelector target not found: ${targetSelector}`);
    }

    this.onStateChange =
      typeof options.onStateChange === "function"
        ? options.onStateChange
        : () => {};

    this.state = {
      aspect: options.aspect || "classic",
      tab: options.tab || "avatar",
      avatarSize: options.avatarSize || "md",
      avatarRadius: String(options.avatarRadius ?? "8"),
      avatarBorder: this.normalizeAvatarBorderScale(options.avatarBorder),
      coverPreset: options.coverPreset || "preset-cover",
      coverStyle: options.coverStyle || "full",
      fineControl: null,
    };

    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleInput = this.handleInput.bind(this);
  }

  render(container = this.target) {
    this.target = container;
    StyleSelector.injectStyles();
    this.normalizeStateForAspect();
    this.target.innerHTML = this.template();
    this.target.removeEventListener("click", this.boundHandleClick);
    this.target.removeEventListener("input", this.boundHandleInput);
    this.target.addEventListener("click", this.boundHandleClick);
    this.target.addEventListener("input", this.boundHandleInput);
    this.syncDom();
    return this;
  }

  updateAspect(newAspect, options = {}) {
    if (!this.aspectConfig()[newAspect]) return;
    this.state.aspect = newAspect;
    this.state.tab = options.tab || this.defaultTabForAspect(newAspect);
    this.state.fineControl = null;
    this.normalizeStateForAspect();
    this.render();
    if (options.emit !== false) {
      this.emit("aspect", { aspect: newAspect });
    }
  }

  updateTab(newTab, options = {}) {
    if (!this.tabsForAspect(this.state.aspect).some((tab) => tab.id === newTab)) {
      return;
    }
    this.state.tab = newTab;
    this.state.fineControl = null;
    this.render();
    if (options.emit !== false) {
      this.emit("tab", { tab: newTab });
    }
  }

  updateState(nextState = {}) {
    this.state = {
      ...this.state,
      aspect: nextState.aspect || this.state.aspect,
      tab: nextState.tab || this.state.tab,
      avatarSize: nextState.avatarSize || this.state.avatarSize,
      avatarRadius: String(nextState.avatarRadius ?? this.state.avatarRadius),
      avatarBorder: this.normalizeAvatarBorderScale(
        nextState.avatarBorder ?? this.state.avatarBorder,
      ),
      coverPreset: nextState.coverPreset || this.state.coverPreset,
      coverStyle: nextState.coverStyle || this.state.coverStyle,
    };
    this.render();
  }

  showEditor() {
    this.target
      .querySelector("[data-ss-view='dropdown']")
      ?.removeAttribute("hidden");
    this.target
      .querySelector("[data-ss-view='cards']")
      ?.setAttribute("hidden", "");
    this.target
      .querySelector(".style-selector")
      ?.removeAttribute("data-browsing");
  }

  getState() {
    return typeof structuredClone === "function"
      ? structuredClone(this.state)
      : JSON.parse(JSON.stringify(this.state));
  }

  destroy() {
    this.target.removeEventListener("click", this.boundHandleClick);
    this.target.removeEventListener("input", this.boundHandleInput);
    this.target.innerHTML = "";
  }

  handleClick(event) {
    const action = event.target.closest("[data-ss-action]");
    if (!action || !this.target.contains(action)) return;

    const actionName = action.dataset.ssAction;

    if (actionName === "show-aspect-cards") {
      this.target
        .querySelector("[data-ss-view='dropdown']")
        ?.setAttribute("hidden", "");
      this.target
        .querySelector("[data-ss-view='cards']")
        ?.removeAttribute("hidden");
      // Hide controllers while browsing aspects — they regain relevance
      // only after the user picks a new style from the fieldset.
      this.target
        .querySelector(".style-selector")
        ?.setAttribute("data-browsing", "true");
      return;
    }

    if (actionName === "select-aspect") {
      this.updateAspect(action.dataset.aspect);
      return;
    }

    if (actionName === "select-tab") {
      this.updateTab(action.dataset.tab);
      return;
    }

    if (actionName === "set-control") {
      this.setControl(action.dataset.control, action.dataset.value);
      return;
    }

    if (actionName === "set-cover-preset") {
      this.setControl("coverPreset", action.dataset.value);
      return;
    }

    if (actionName === "toggle-fine") {
      const key = action.dataset.control;
      this.state.fineControl = this.state.fineControl === key ? null : key;
      this.render();
    }
  }

  handleInput(event) {
    const input = event.target.closest("[data-ss-range]");
    if (!input || !this.target.contains(input)) return;
    this.setControl(input.dataset.ssRange, input.value);
  }

  setControl(key, value) {
    if (!key) return;
    this.state[key] =
      key === "avatarBorder"
        ? this.normalizeAvatarBorderScale(value)
        : String(value);
    this.syncDom();
    this.emit("control", { control: key, value: this.state[key] });
  }

  emit(type, detail = {}) {
    this.onStateChange(this.getState(), { type, ...detail });
  }

  normalizeStateForAspect() {
    const tabs = this.tabsForAspect(this.state.aspect);
    if (!tabs.some((tab) => tab.id === this.state.tab)) {
      this.state.tab = this.defaultTabForAspect(this.state.aspect);
    }
  }

  syncDom() {
    this.target.querySelectorAll("[data-ss-control]").forEach((el) => {
      const key = el.dataset.ssControl;
      const isActive = String(el.dataset.value) === String(this.state[key]);
      el.dataset.status = isActive ? "active" : "unset";
      el.classList.toggle("active", isActive);
    });

    this.target.querySelectorAll("[data-ss-radio]").forEach((input) => {
      input.checked =
        String(input.value) === String(this.state[input.dataset.ssRadio]);
    });

    this.target.querySelectorAll("[data-ss-value]").forEach((el) => {
      const key = el.dataset.ssValue;
      el.textContent = this.displayValue(key);
    });

    this.target.querySelectorAll("[data-ss-range]").forEach((input) => {
      const key = input.dataset.ssRange;
      const value =
        key === "avatarSize"
          ? this.avatarSizeMap()[this.state.avatarSize]
          : this.state[key];
      input.value = String(value);
    });
  }

  displayValue(key) {
    const value = this.state[key];
    if (key === "avatarSize") {
      return `${this.avatarSizeMap()[value] || value}px`;
    }
    if (key === "avatarRadius") return `${value}px`;
    if (key === "avatarBorder") return this.formatAvatarBorderScale(value);
    return value;
  }

  aspectConfig() {
    return {
      classic: {
        label: "Clásico",
        previewClass: "mini-preview--classic",
        previewHtml: "",
      },
      "with-cover": {
        label: "Portada",
        previewClass: "mini-preview--with-cover",
        previewHtml:
          '<span class="cover-bg-mini"></span><span class="avatar-mini"></span>',
      },
      hero: {
        label: "Hero",
        previewClass: "mini-preview--hero",
        previewHtml: "",
      },
    };
  }

  tabsForAspect(aspect) {
    if (aspect === "with-cover") {
      return [
        { id: "avatar", label: "Avatar", icon: this.iconUser() },
        { id: "cover", label: "Portada", icon: this.iconPhoto() },
      ];
    }
    if (aspect === "hero") {
      return [{ id: "hero", label: "Hero", icon: this.iconSparkles() }];
    }
    return [{ id: "avatar", label: "Avatar", icon: this.iconUser() }];
  }

  defaultTabForAspect(aspect) {
    return aspect === "hero" ? "hero" : "avatar";
  }

  avatarSizeMap() {
    return { sm: 80, md: 109, lg: 140 };
  }

  normalizeAvatarBorderScale(value) {
    const legacyScaleMap = { 0: 1, 2: 1.05, 4: 1.14 };
    const raw =
      value === undefined || value === null || value === ""
        ? 1
        : Number(value);
    const scale = legacyScaleMap[raw] || raw || 1;
    const clamped = Math.min(1.5, Math.max(1, scale));
    return this.formatNumber(clamped);
  }

  formatAvatarBorderScale(value) {
    return this.formatNumber(value);
  }

  formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "1";
    return Number(number.toFixed(2)).toString();
  }

  coverStyleMap() {
    return { full: "full", framed: "inset" };
  }

  template() {
    const cfg = this.aspectConfig()[this.state.aspect];
    const cardsHidden = "hidden";
    return `
      <section class="style-selector" data-aspect="${this.state.aspect}">
        <div class="top-controls">
          <div class="style-selector__dropdown" data-ss-view="dropdown">
            <button
              type="button"
              class="style-dropdown-btn"
              data-ss-action="show-aspect-cards"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span class="mini-preview ${cfg.previewClass}" aria-hidden="true">${cfg.previewHtml}</span>
              <span class="style-dropdown-label">${cfg.label}</span>
              <svg class="style-dropdown-chevron" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="style-selector__cards" data-ss-view="cards" ${cardsHidden}>
            <fieldset class="image-style-fieldset">
              <div class="image-style-grid">
                ${this.aspectCard("classic", "Clásico", "preview--classic")}
                ${this.aspectCard("hero", "Hero", "preview--hero")}
                ${this.aspectCard("with-cover", "Portada", "preview--cover")}
              </div>
            </fieldset>
          </div>

          <div class="editor-pill-tabs">
            ${this.tabsForAspect(this.state.aspect)
              .map((tab) => this.tabButton(tab))
              .join("")}
          </div>
        </div>

        <div class="inline-editor-controls">
          <h3 class="style-selector__title">${this.panelTitle()}</h3>
          ${this.panelTemplate()}
        </div>
      </section>
    `;
  }

  aspectCard(aspect, label, previewClass) {
    const active = this.state.aspect === aspect ? "active" : "unset";
    const coverPreview =
      aspect === "with-cover"
        ? '<span class="cover-bg"></span><span class="avatar"></span>'
        : "";
    return `
      <button
        type="button"
        class="image-style-card"
        data-ss-action="select-aspect"
        data-aspect="${aspect}"
        data-status="${active}"
      >
        <span class="preview ${previewClass}" aria-hidden="true">${coverPreview}</span>
        <span class="image-style-title">${label}</span>
        <span class="checkmark" aria-hidden="true"></span>
      </button>
    `;
  }

  tabButton(tab) {
    return `
      <button
        class="editor-pill-tab"
        type="button"
        data-ss-action="select-tab"
        data-tab="${tab.id}"
        data-status="${tab.id === this.state.tab ? "active" : "unset"}"
      >
        ${tab.icon}
        <span>${tab.label}</span>
      </button>
    `;
  }

  panelTitle() {
    if (this.state.tab === "cover") return "Personalizar Portada";
    if (this.state.tab === "hero") return "Personalizar Hero";
    return "Personalizar Avatar";
  }

  panelTemplate() {
    if (this.state.tab === "cover") return this.coverPanel();
    if (this.state.tab === "hero") return this.heroPanel();
    return this.avatarPanel();
  }

  avatarPanel() {
    return `
      <section class="ctrl-page ctrl-page--avatar" data-control-page="avatar">
        ${this.avatarSizeControl()}
        ${this.avatarRadiusControl()}
        ${this.avatarBorderControl()}
      </section>
    `;
  }

  avatarSizeControl() {
    return `
      <div class="ctrl-group">
        <div class="ctrl-group__header">
          <span class="ctrl-group__label">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 3l6.5 6.5M21 3l-6.5 6.5M3 21l6.5-6.5M21 21l-6.5-6.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
            </svg>
            Tamaño Avatar
          </span>
          <span class="ctrl-group__value" data-ss-value="avatarSize"></span>
        </div>

        <div class="option-chips">
          ${this.chipButton("avatarSize", "sm", this.sizeIcon("sm"), "pequeño")}
          ${this.chipButton("avatarSize", "md", this.sizeIcon("md"), "mediano")}
          ${this.chipButton("avatarSize", "lg", this.sizeIcon("lg"), "grande")}
          ${this.sliderButton("avatarSize", "Personalizar tamaño")}
        </div>
        ${this.fineRange("avatarSize", 40, 160, 1)}
      </div>
    `;
  }

  avatarRadiusControl() {
    return `
      <div class="ctrl-group">
        <div class="ctrl-group__header">
          <span class="ctrl-group__label">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20v-8a8 8 0 0 1 8-8h8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
            </svg>
            Redondear
          </span>
          <span class="ctrl-group__value" data-ss-value="avatarRadius"></span>
        </div>

        <div class="option-chips">
          ${this.radioChip("avatarRadius", "0", "rd-none", this.radiusIcon(0))}
          ${this.radioChip("avatarRadius", "10", "rd-md", this.radiusIcon(5))}
          ${this.radioChip("avatarRadius", "100", "rd-full", this.radiusIcon(9))}
          ${this.sliderButton("avatarRadius", "Personalizar redondez")}
        </div>
        ${this.fineRange("avatarRadius", 0, 100, 1)}
      </div>
    `;
  }

  avatarBorderControl() {
    return `
      <div class="ctrl-group">
        <div class="ctrl-group__header">
          <span class="ctrl-group__label">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
            </svg>
            Borde
          </span>
          <span class="ctrl-group__value ctrl-group__value--scale" data-ss-value="avatarBorder"></span>
        </div>

        <div class="option-chips">
          ${this.radioChip("avatarBorder", "1", "bd-none", this.borderNoneIcon())}
          ${this.radioChip("avatarBorder", "1.05", "bd-sm", this.borderIcon(1.6, "x1"))}
          ${this.radioChip("avatarBorder", "1.14", "bd-lg", this.borderIcon(3, "x2"))}
          ${this.sliderButton("avatarBorder", "Personalizar borde")}
        </div>
        ${this.fineRange("avatarBorder", 1, 1.5, 0.01)}
      </div>
    `;
  }

  coverPanel() {
    return `
      <section class="ctrl-page ctrl-page--cover" data-control-page="cover">
        <div class="ctrl-group">
          <div class="ctrl-group__header">
            <span class="ctrl-group__label">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="5" width="16" height="9" rx="2.5" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="17" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Posición de avatar
            </span>
          </div>
          <div class="option-chips option-chips--position">
            ${this.chipButton("coverPreset", "preset-centered", this.coverPresetIcon("center"), "Centrado")}
            ${this.chipButton("coverPreset", "preset-horizontal", this.coverPresetIcon("side"), "Lateral")}
            ${this.chipButton("coverPreset", "preset-cover", this.coverPresetIcon("top"), "Superior")}
          </div>
        </div>

        <div class="ctrl-group">
          <div class="ctrl-group__header">
            <span class="ctrl-group__label">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" stroke-width="2.1"/>
                <path d="M4 11h16" stroke="currentColor" stroke-width="1.8" opacity=".45"/>
              </svg>
              Aspecto de portada
            </span>
          </div>
          <div class="option-chips option-chips--cover">
            ${this.radioChip("coverStyle", "full", "cs-full", this.coverStyleIcon("full"), "Completa")}
            ${this.radioChip("coverStyle", "framed", "cs-framed", this.coverStyleIcon("framed"), "Encuadrada")}
          </div>
        </div>
      </section>
    `;
  }

  heroPanel() {
    return `
      <section class="ctrl-page ctrl-page--hero" data-control-page="hero">
        <div class="hero-empty">
          <div class="hero-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="12" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M4 10h16" stroke="currentColor" stroke-width="1.8" opacity=".45"/>
              <path d="M9 16l3-3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="hero-empty__title">Hero</p>
          <p class="hero-empty__text">Sin controles de edición por ahora.</p>
        </div>
      </section>
    `;
  }

  chipButton(key, value, icon, label = "") {
    return `
      <button
        class="option-chip"
        type="button"
        data-ss-action="set-control"
        data-control="${key}"
        data-ss-control="${key}"
        data-value="${value}"
        data-status="unset"
      >
        ${icon}
        ${label ? `<span class="option-chip__label">${label}</span>` : ""}
      </button>
    `;
  }

  radioChip(key, value, id, icon, label = "") {
    return `
      <input
        type="radio"
        name="${key}"
        id="${id}"
        value="${value}"
        class="chip-radio"
        data-ss-radio="${key}"
      >
      <label
        class="option-chip"
        for="${id}"
        data-ss-action="set-control"
        data-control="${key}"
        data-ss-control="${key}"
        data-value="${value}"
        data-status="unset"
      >
        ${icon}
        ${label ? `<span class="option-chip__label">${label}</span>` : ""}
      </label>
    `;
  }

  sliderButton(key, label) {
    return `
      <button
        type="button"
        class="option-chip__sliders-btn"
        data-ss-action="toggle-fine"
        data-control="${key}"
        aria-label="${label}"
        aria-expanded="${this.state.fineControl === key ? "true" : "false"}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings2-icon lucide-settings-2"><path d="M14 17H5"/><path d="M19 7h-9"/>
          <circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
        </svg>
      </button>
    `;
  }

  fineRange(key, min, max, step) {
    const hidden = this.state.fineControl === key ? "" : "hidden";
    const value =
      key === "avatarSize"
        ? this.avatarSizeMap()[this.state.avatarSize]
        : this.state[key];
    return `
      <div class="fine-control" ${hidden}>
        <input
          type="range"
          class="fine-control__range"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
          data-ss-range="${key}"
        >
      </div>
    `;
  }

  sizeIcon(size) {
    const circle = { sm: 2.7, md: 5.2, lg: 8.2 }[size];
    const path =
      size === "sm"
        ? "M11 5h-4v4M29 5h4v4M11 23h-4v-4M29 23h4v-4"
        : size === "md"
          ? "M10 4.5h-3.5v3.5M30 4.5h3.5v3.5M10 23.5h-3.5v-3.5M30 23.5h3.5v-3.5"
          : "M9 4h-3v3M31 4h3v3M9 24h-3v-3M31 24h3v-3";
    return `
      <svg class="option-chip__icon" viewBox="0 0 40 28" fill="none" aria-hidden="true">
        <path d="${path}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="20" cy="14" r="${circle}" stroke="currentColor" stroke-width="2.7"/>
      </svg>
    `;
  }

  radiusIcon(rx) {
    return `
      <svg class="option-chip__icon" width="32" height="28" viewBox="0 0 36 32" fill="none" aria-hidden="true">
        <rect x="8" y="7" width="20" height="18" rx="${rx}" stroke="currentColor" stroke-width="1.6"></rect>
      </svg>
    `;
  }

  borderNoneIcon() {
    return `
      <svg class="option-chip__icon" width="32" height="28" viewBox="0 0 36 32" fill="none" aria-hidden="true">
        <line x1="8" y1="24" x2="28" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></line>
        <circle cx="18" cy="16" r="9" stroke="currentColor" stroke-width="1.6" stroke-opacity="0.2"></circle>
      </svg>
    `;
  }

  borderIcon(width, text) {
    return `
      <svg class="option-chip__icon" width="32" height="28" viewBox="0 0 36 32" fill="none" aria-hidden="true">
        <circle cx="18" cy="16" r="9" stroke="currentColor" stroke-width="${width}"></circle>
        <text x="18" y="20" text-anchor="middle" font-size="7" fill="currentColor" font-family="sans-serif" font-weight="700">${text}</text>
      </svg>
    `;
  }

  coverStyleIcon(type) {
    if (type === "framed") {
      return `
        <svg class="option-chip__icon" width="40" height="28" viewBox="0 0 44 30" fill="none" aria-hidden="true">
          <rect x="7" y="3" width="30" height="18" rx="4" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1.4"></rect>
          <path d="M7 12 Q15 7 22 11 Q29 15 37 9" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.4" fill="none"></path>
          <circle cx="22" cy="24" r="5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.4"></circle>
        </svg>
      `;
    }
    return `
      <svg class="option-chip__icon" width="40" height="28" viewBox="0 0 44 30" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="38" height="24" rx="4" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1.4"></rect>
        <path d="M3 12 Q11 6 19 11 Q27 16 41 9" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.4" fill="none"></path>
        <circle cx="22" cy="18" r="5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.4"></circle>
      </svg>
    `;
  }

  coverPresetIcon(type) {
    const avatarX = type === "side" ? 14 : 23;
    const lines =
      type === "side"
        ? '<path d="M22 21h14M22 25h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".55"/>'
        : "";
    const height = type === "center" || type === "side" ? 13 : 18;
    return `
      <svg class="option-chip__icon" viewBox="0 0 46 30" fill="none" aria-hidden="true">
        <rect x="7" y="4" width="32" height="${height}" rx="4" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.7"/>
        <circle cx="${avatarX}" cy="21" r="4.5" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="1.7"/>
        ${lines}
      </svg>
    `;
  }

  iconUser() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>`;
  }

  iconPhoto() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z"/></svg>`;
  }

  iconSparkles() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 0 0 2.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"/></svg>`;
  }

  static injectStyles() {
    if (document.getElementById(StyleSelector.styleId)) return;
    const link = document.createElement("link");
    link.id = StyleSelector.styleId;
    link.rel = "stylesheet";
    link.href = StyleSelector.stylesheetHref;
    document.head.appendChild(link);
  }
}
