// bottom-sheet.js — v1
// Componente dinámico de Bottom Sheet.
//
// API PÚBLICA:
//   constructSheet(presetOrConfig, data?)  — construir y abrir un sheet
//   registerPreset(name, configFn)         — registrar un preset reutilizable
//   closeSheet()                           — cerrar el sheet activo
//
// CONFIGURACIÓN:
//   {
//     title:          string,
//     scope:          string,          // data-scope en el container
//     top_actions:    Action[],        // acciones en el header
//     content:        string|Node,     // HTML string, selector CSS, o nodo DOM
//     bottom_actions: BottomActions,   // footer con layouts
//   }
//
// Action = {
//   name:      string,
//   callback:  string | Function,   // "close" = cierra el sheet
//   icon_type: "font" | "svg",
//   icon:      string,              // clase CSS o href del <use>
// }
//
// BottomActions = {
//   layout:       "single" | "dual" | "dual-with-icon" | null,
//   primary:      { label, callback, icon? },
//   secondary:    { label, callback, icon? },
//   icon_action:  { callback, icon_type, icon, variant? },  // solo "dual-with-icon"
// }

const CSS_HREF = "/shared/components/bottom-sheet/bottom-sheet.css";

// ─── Auto-inject CSS (once) ───────────────────────────────────────────────────
(function injectAssets() {
  if (!document.querySelector(`link[href*="bottom-sheet.css"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }
})();

// ─── Preset Registry ──────────────────────────────────────────────────────────
const _presets = new Map();

/**
 * Registra un preset reutilizable.
 * @param {string} name     Nombre del preset (e.g. "profile-editor")
 * @param {Function} configFn  Función que recibe `data` y retorna un config object.
 */
export function registerPreset(name, configFn) {
  if (typeof configFn !== "function") {
    throw new Error(`[bottom-sheet] registerPreset: configFn debe ser una función.`);
  }
  _presets.set(name, configFn);
}

// ─── State ────────────────────────────────────────────────────────────────────
let _activeOverlay = null;
let _onEscHandler = null;

// ─── ICON RENDERER ────────────────────────────────────────────────────────────
function _renderIcon(iconType, icon) {
  if (!icon) return "";
  if (iconType === "svg") {
    return `<svg width="20" height="20"><use href="${icon}"></use></svg>`;
  }
  // Default: font icon (Tabler, FontAwesome, etc.)
  return `<i class="${icon}" aria-hidden="true"></i>`;
}

// ─── CALLBACK RESOLVER ───────────────────────────────────────────────────────
function _resolveCallback(cb) {
  if (typeof cb === "function") return cb;
  if (typeof cb === "string") {
    if (cb === "close") return () => closeSheet();
    if (typeof window[cb] === "function") return window[cb];
    console.warn(`[bottom-sheet] Callback "${cb}" no encontrado en window.`);
    return null;
  }
  return null;
}

// ─── CONTENT RESOLVER ────────────────────────────────────────────────────────
function _resolveContent(content) {
  if (!content) return "";

  // DOM Node
  if (content instanceof HTMLElement) {
    return content.outerHTML;
  }

  // String
  if (typeof content === "string") {
    // Selector CSS → buscar en DOM
    const looksLikeSelector = content.startsWith("#") || content.startsWith(".");
    if (looksLikeSelector) {
      const el = document.querySelector(content);
      if (el instanceof HTMLTemplateElement) {
        const frag = el.content.cloneNode(true);
        const div = document.createElement("div");
        div.appendChild(frag);
        return div.innerHTML;
      }
      if (el) return el.innerHTML;
      console.warn(`[bottom-sheet] Selector "${content}" no encontrado.`);
      return "";
    }
    // HTML string directo
    return content;
  }

  return "";
}

// ─── RENDER: HEADER ──────────────────────────────────────────────────────────
function _renderHeader(config) {
  const title = config.title || "";
  const actions = config.top_actions || [];

  let actionsHTML = "";
  actions.forEach((action, i) => {
    const iconHTML = _renderIcon(action.icon_type || "font", action.icon);
    actionsHTML += `<button class="bsheet-action-btn" data-bsheet-action="${i}" aria-label="${action.name || ""}" title="${action.name || ""}">${iconHTML}</button>\n`;
  });

  return `
    <header class="bsheet-header">
      <h3 class="bsheet-title">${title}</h3>
      ${actionsHTML ? `<div class="bsheet-top-actions">${actionsHTML}</div>` : ""}
      <button class="bsheet-close-btn" data-bsheet-close aria-label="Cerrar">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>
    </header>
  `;
}

// ─── RENDER: FOOTER ──────────────────────────────────────────────────────────
function _renderFooter(config) {
  const ba = config.bottom_actions;
  if (!ba || !ba.layout) return "";

  const layout = ba.layout;
  let inner = "";

  // Icon action (solo para "dual-with-icon")
  if (layout === "dual-with-icon" && ba.icon_action) {
    const ia = ba.icon_action;
    const variant = ia.variant ? ` bsheet-icon-action--${ia.variant}` : "";
    const iconHTML = _renderIcon(ia.icon_type || "font", ia.icon);
    inner += `<button class="bsheet-icon-action${variant}" data-bsheet-footer="icon_action" aria-label="Acción">${iconHTML}</button>\n`;
  }

  // Secondary button
  if (ba.secondary && (layout === "dual" || layout === "dual-with-icon")) {
    const s = ba.secondary;
    const sIcon = s.icon ? _renderIcon("font", s.icon) : "";
    inner += `<button class="bsheet-btn bsheet-btn--secondary" data-bsheet-footer="secondary">${sIcon}${s.label || ""}</button>\n`;
  }

  // Primary button
  if (ba.primary) {
    const p = ba.primary;
    const pIcon = p.icon ? _renderIcon("font", p.icon) : "";
    inner += `<button class="bsheet-btn bsheet-btn--primary" data-bsheet-footer="primary">${pIcon}${p.label || ""}</button>\n`;
  }

  return `<footer class="bsheet-footer" data-layout="${layout}">${inner}</footer>`;
}

// ─── STATUS STORAGE ──────────────────────────────────────────────────────────
function _setStatusStorage(state) {
  const el = document.getElementById("data-status-storage");
  if (el) {
    el.setAttribute("data-bottom-sheet", state);
  }
}

// ─── CLOSE SHEET ─────────────────────────────────────────────────────────────
/**
 * Cierra el sheet activo actual.
 */
export function closeSheet() {
  if (!_activeOverlay) return;

  const overlay = _activeOverlay;
  overlay.setAttribute("data-state", "closed");
  _setStatusStorage("hidden");

  // Esperar fin de transición para remover del DOM
  const onEnd = () => {
    overlay.removeEventListener("transitionend", onEnd);
    overlay.remove();
  };
  overlay.addEventListener("transitionend", onEnd);

  // Fallback: si transitionend no se dispara
  setTimeout(() => overlay.remove(), 500);

  // Limpiar escape handler
  if (_onEscHandler) {
    document.removeEventListener("keydown", _onEscHandler);
    _onEscHandler = null;
  }

  // Dispatch event
  document.dispatchEvent(
    new CustomEvent("bottom-sheet:close", {
      bubbles: true,
      detail: { scope: overlay.querySelector(".bottom-sheet-container")?.dataset.scope },
    }),
  );

  _activeOverlay = null;
}

// ─── CONSTRUCT SHEET ─────────────────────────────────────────────────────────
/**
 * Construye y abre un bottom sheet.
 *
 * @param {string|Object} presetOrConfig  - Nombre de preset registrado o config object completo.
 * @param {Object} [data]                 - Datos opcionales pasados al preset.
 * @returns {HTMLElement} El overlay creado.
 */
export function constructSheet(presetOrConfig, data) {
  // ── Resolver config ───────────────────────────────────────────────────────
  let config;

  if (typeof presetOrConfig === "string") {
    // Modo preset
    const presetFn = _presets.get(presetOrConfig);
    if (!presetFn) {
      console.error(`[bottom-sheet] Preset "${presetOrConfig}" no registrado.`);
      return null;
    }
    config = presetFn(data || {});
  } else if (typeof presetOrConfig === "object" && presetOrConfig !== null) {
    // Modo config directo
    config = presetOrConfig;
  } else {
    console.error("[bottom-sheet] constructSheet requiere un preset (string) o un config (object).");
    return null;
  }

  // ── Cerrar sheet previo si existe ─────────────────────────────────────────
  if (_activeOverlay) {
    closeSheet();
  }

  // ── Construir el DOM ──────────────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.className = "bottom-sheet-overlay";
  overlay.setAttribute("data-state", "closed");

  const scope = config.scope || "default";

  const headerHTML = _renderHeader(config);
  const contentHTML = _resolveContent(config.content);
  const footerHTML = _renderFooter(config);

  overlay.innerHTML = `
    <div class="bottom-sheet-container" data-scope="${scope}">
      ${headerHTML}
      <div class="bsheet-content">${contentHTML}</div>
      ${footerHTML}
    </div>
  `;

  // ── Bind: cerrar overlay al click en backdrop ─────────────────────────────
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSheet();
  });

  // ── Bind: cerrar con botón X ──────────────────────────────────────────────
  const closeBtn = overlay.querySelector("[data-bsheet-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeSheet());
  }

  // ── Bind: top actions ─────────────────────────────────────────────────────
  const topActions = config.top_actions || [];
  overlay.querySelectorAll("[data-bsheet-action]").forEach((btn) => {
    const idx = parseInt(btn.dataset.bsheetAction, 10);
    const action = topActions[idx];
    if (action && action.callback) {
      const fn = _resolveCallback(action.callback);
      if (fn) {
        btn.addEventListener("click", (e) => {
          fn(e, { scope, config, overlay });
          document.dispatchEvent(
            new CustomEvent("bottom-sheet:action", {
              bubbles: true,
              detail: { name: action.name, scope },
            }),
          );
        });
      }
    }
  });

  // ── Bind: footer actions ──────────────────────────────────────────────────
  const ba = config.bottom_actions || {};

  const primaryBtn = overlay.querySelector('[data-bsheet-footer="primary"]');
  if (primaryBtn && ba.primary?.callback) {
    const fn = _resolveCallback(ba.primary.callback);
    if (fn) primaryBtn.addEventListener("click", (e) => fn(e, { scope, config, overlay }));
  }

  const secondaryBtn = overlay.querySelector('[data-bsheet-footer="secondary"]');
  if (secondaryBtn && ba.secondary?.callback) {
    const fn = _resolveCallback(ba.secondary.callback);
    if (fn) secondaryBtn.addEventListener("click", (e) => fn(e, { scope, config, overlay }));
  }

  const iconBtn = overlay.querySelector('[data-bsheet-footer="icon_action"]');
  if (iconBtn && ba.icon_action?.callback) {
    const fn = _resolveCallback(ba.icon_action.callback);
    if (fn) iconBtn.addEventListener("click", (e) => fn(e, { scope, config, overlay }));
  }

  // ── Bind: Escape key ─────────────────────────────────────────────────────
  _onEscHandler = (e) => {
    if (e.key === "Escape") closeSheet();
  };
  document.addEventListener("keydown", _onEscHandler);

  // ── Mount ─────────────────────────────────────────────────────────────────
  document.body.appendChild(overlay);
  _activeOverlay = overlay;

  // Trigger open en el siguiente frame para que la animación arranque
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.setAttribute("data-state", "open");
      _setStatusStorage("showing");

      document.dispatchEvent(
        new CustomEvent("bottom-sheet:open", {
          bubbles: true,
          detail: { scope },
        }),
      );
    });
  });

  return overlay;
}
