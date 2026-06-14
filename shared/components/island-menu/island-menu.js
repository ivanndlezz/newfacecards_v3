// island-menu.js — v6
// Patrón: data-action como única fuente de verdad para interacciones.
// data-status para estado en todos los niveles (island + items).
// Sin data-role en items interactivos — enhanceIsland escucha por delegación.
//
// ACCIONES SOPORTADAS:
//   island:mode     → toggle activo/inactivo en el item, dispara island-mode-change
//   island:navigate → navegación simple sin estado toggle, dispara island-navigate
//   island:open     → abre panel/drawer, dispara island-open
//   island:add      → acción de creación, dispara island-action { type:'add' }
//   island:custom   → acción libre, dispara island-action { type: value }
//
// ATRIBUTOS EN ITEMS:
//   data-action="island:mode"    qué hace
//   data-value="profile"         identidad del item
//   data-status="inactive"       estado actual (active | inactive | disabled | loading)
//
// RETROCOMPAT:
//   buildIslandHTML(), importIslandMenu(), initIsland() — firmas idénticas
//   Config object con keys legacy (satLeft, dotsIcon, data-role en HTML) — ignoradas silenciosamente
//   HTML con data-role existente en el DOM — sigue funcionando (delegación lo ignora)

const CSS_HREF = new URL('./island-menu.css', import.meta.url).href;
const TABLER_HREF =
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css";

// ─── Auto-inject assets (once) ────────────────────────────────────────────────
(function injectAssets() {
  if (!document.querySelector('link[href*="island-menu.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[href*="@tabler/icons-webfont"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = TABLER_HREF;
    document.head.appendChild(link);
  }
})();

// ─── DEFAULT CONFIG ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  items: [
    {
      action: "island:navigate",
      value: "menu",
      icon: "ti ti-menu-2",
      label: "Menu",
    },
    {
      action: "island:mode",
      value: "cardbar",
      icon: "ti ti-user-circle",
      label: "Profile",
    },
    {
      action: "island:mode",
      value: "apariencia",
      icon: "ti ti-palette",
      label: "Style",
    },
    {
      action: "island:add",
      value: "add-link",
      icon: "ti ti-plus",
      label: "Link",
      variant: "cta",
    },
  ],
};

// ─── ACTION HANDLERS ──────────────────────────────────────────────────────────
// Mapa de qué hace cada action cuando se dispara.
// Extensible: agrega nuevas acciones aquí sin tocar enhanceIsland.
const ACTION_HANDLERS = {
  // Toggle activo/inactivo — solo uno activo a la vez dentro del island
  "island:mode"(root, el, dispatch) {
    const value = el.dataset.value;
    const isActive = el.dataset.status === "active";
    const prevActive =
      _getActiveItem(root, "island:mode")?.dataset.value || null;

    // Desactivar todos los mode items + limpiar aria-pressed
    root.querySelectorAll('[data-action="island:mode"]').forEach((item) => {
      item.dataset.status = "inactive";
      item.setAttribute("aria-pressed", "false");
    });

    // Activar el clickeado si no estaba ya activo (toggle off si ya estaba)
    if (!isActive) {
      el.dataset.status = "active";
      el.setAttribute("aria-pressed", "true");
    }

    const newActive = isActive ? null : value;
    if (prevActive !== newActive) {
      dispatch("island-mode-change", {
        mode: newActive,
        previous: prevActive,
        el,
      });
    }
  },

  // Navegación simple — dispara evento, no cambia estado visual
  "island:navigate"(root, el, dispatch) {
    dispatch("island-navigate", {
      value: el.dataset.value,
      target: el.dataset.target,
      el,
    });
  },

  // Abrir panel/drawer
  "island:open"(root, el, dispatch) {
    const isOpen = el.dataset.status === "active";
    el.dataset.status = isOpen ? "inactive" : "active";
    dispatch("island-open", { value: el.dataset.value, open: !isOpen, el });
  },

  // Acción de creación / CTA
  "island:add"(root, el, dispatch) {
    dispatch("island-action", { type: "add", value: el.dataset.value, el });
  },

  // Acción custom libre — el caller escucha island-action y maneja
  "island:custom"(root, el, dispatch) {
    dispatch("island-action", { type: el.dataset.value, el });
  },
};

// ─── _buildFromConfig ─────────────────────────────────────────────────────────
// Genera HTML desde config. Acepta formato nuevo (items[]) y legacy (edit/modes/satRight).
function _buildFromConfig(cfg) {
  // Normalizar formato legacy al nuevo formato items[]
  const items = cfg.items || _normalizeLegacy(cfg);
  return items.map((item) => _itemHTML(item)).join("\n");
}

// Convierte config legacy {edit, modes, satRight} → items[]
function _normalizeLegacy(cfg) {
  const items = [];

  if (cfg.edit) {
    items.push({
      action: "island:navigate",
      value: "menu",
      icon: cfg.edit.icon || "ti ti-edit",
      label: cfg.edit.label || "Editar",
    });
  }

  (cfg.modes || []).forEach((m) => {
    items.push({
      action: "island:mode",
      value: m.value,
      icon: m.icon || "ti ti-circle",
      label: m.label,
    });
  });

  if (cfg.satRight !== false) {
    const sr = cfg.satRight || {};
    items.push({
      action: "island:add",
      value: "add-link",
      icon: sr.icon || sr.plusIcon || "ti ti-plus",
      label: sr.label || "Link",
      variant: "cta",
    });
  }

  return items.length ? items : DEFAULT_CONFIG.items;
}

// ─── _itemHTML ────────────────────────────────────────────────────────────────
// Único builder de items. El variant determina la apariencia visual.
// data-action + data-value + data-status son los únicos atributos de comportamiento.
function _itemHTML(item) {
  const status = item.status || "inactive";
  const variant = item.variant || "nav"; // nav | cta | divider
  const cls = `island-item island-item--${variant}`;

  if (variant === "divider") {
    return `<div class="island-divider" aria-hidden="true"></div>`;
  }

  const iconHtml = item.icon
    ? `<i class="${item.icon}" aria-hidden="true"></i>`
    : "";

  return `<div
  class="${cls}"
  data-action="${item.action}"
  data-value="${item.value}"
  data-status="${status}"
  aria-label="${item.label}"
  tabindex="0"
  role="button"
>${iconHtml}<span class="island-item__label">${item.label}</span></div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _getActiveItem(root, action) {
  return root.querySelector(`[data-action="${action}"][data-status="active"]`);
}

function _setItemStatus(root, action, status) {
  root.querySelectorAll(`[data-action="${action}"]`).forEach((el) => {
    el.dataset.status = status;
  });
}

// ─── resolveTemplate ──────────────────────────────────────────────────────────
function resolveTemplate(source) {
  if (source instanceof HTMLTemplateElement) {
    return { html: _cloneTemplateToString(source), isUrl: false };
  }
  if (source instanceof HTMLElement) {
    return { html: source.outerHTML, isUrl: false };
  }
  if (typeof source === "string") {
    const looksLikeSelector = source.startsWith("#") || source.startsWith(".");
    if (looksLikeSelector) {
      const el = document.querySelector(source);
      if (el instanceof HTMLTemplateElement)
        return { html: _cloneTemplateToString(el), isUrl: false };
      if (el) return { html: el.outerHTML, isUrl: false };
    }
    if (source.endsWith(".html") || source.includes("/components/")) {
      return { html: null, isUrl: true, url: source };
    }
    // HTML string literal completo → as-is
    return { html: source, isUrl: false };
  }
  if (source && typeof source === "object") {
    return { html: _buildFromConfig(source), isUrl: false };
  }
  return { html: _buildFromConfig(DEFAULT_CONFIG), isUrl: false };
}

function _cloneTemplateToString(templateEl) {
  const frag = templateEl.content.cloneNode(true);
  const div = document.createElement("div");
  div.appendChild(frag);
  return div.innerHTML;
}

// ─── enhanceIsland ─────────────────────────────────────────────────────────────
// Un solo listener por delegación. Lee data-action del elemento clickeado
// (o su ancestro más cercano con data-action dentro del root).
// No asume nada sobre la estructura del HTML.
function enhanceIsland(root) {
  if (root._islandEnhanced) return root;
  root._islandEnhanced = true;

  function dispatch(name, detail) {
    root.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true, detail }),
    );
  }

  // ── Delegación central ──────────────────────────────────────────────────────
  let _clickCooldown = 0;
  const DEBOUNCE_MS = 300;

  const onClick = (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || !root.contains(el)) return;
    if (el.dataset.status === "disabled") return;

    const now = Date.now();
    if (now - _clickCooldown < DEBOUNCE_MS) return;
    _clickCooldown = now;

    const action = el.dataset.action;
    const handler = ACTION_HANDLERS[action];

    if (handler) {
      handler(root, el, dispatch);
    } else {
      // Acción desconocida → dispara genérico para que el caller maneje
      dispatch("island-action", { type: action, value: el.dataset.value, el });
    }
  };

  root.addEventListener("click", onClick);

  // ── Teclado: Enter/Space activan, Escape resetea modes ─────────────────────
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const el = e.target.closest("[data-action]");
      if (el && root.contains(el)) {
        e.preventDefault();
        el.click();
      }
    }
  };

  root.addEventListener("keydown", onKey);

  const onKeyDown = (e) => {
    if (e.key === "Escape" && root.isConnected) {
      _setItemStatus(root, "island:mode", "inactive");
      dispatch("island-mode-change", { mode: null, previous: null });
    }
  };
  document.addEventListener("keydown", onKeyDown);

  // ── API pública ─────────────────────────────────────────────────────────────

  // Activar un mode por valor
  root.setActiveMode = root._setActiveMode = (value) => {
    root.querySelectorAll('[data-action="island:mode"]').forEach((item) => {
      item.dataset.status = "inactive";
      item.setAttribute("aria-pressed", "false");
    });
    if (value) {
      const el = root.querySelector(
        `[data-action="island:mode"][data-value="${value}"]`,
      );
      if (el) {
        el.dataset.status = "active";
        el.setAttribute("aria-pressed", "true");
      }
    }
    dispatch("island-mode-change", { mode: value || null, previous: null });
  };

  // Cambiar status del island completo
  root.setStatus = root._setStatus = (status) => {
    const prev = root.dataset.status;
    root.dataset.status = status || "idle";
    if (prev !== root.dataset.status) {
      dispatch("island-status-change", {
        status: root.dataset.status,
        previous: prev,
      });
    }
  };

  // Cambiar status de un item específico por value
  root.setItemStatus = (value, status) => {
    const el = root.querySelector(`[data-value="${value}"]`);
    if (el) el.dataset.status = status;
  };

  if (!root.dataset.status) root.dataset.status = "idle";

  root._destroyIsland = () => {
    document.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKey);
    delete root._islandEnhanced;
    delete root.setStatus;
    delete root.setActiveMode;
    delete root.setItemStatus;
    delete root._setStatus;
    delete root._setActiveMode;
  };

  return root;
}

// ─── IslandMenu Custom Element ─────────────────────────────────────────────────
export class IslandMenu extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.component) this.dataset.component = "island";
    if (!this.innerHTML.trim()) {
      const source = this.dataset.template || DEFAULT_CONFIG;
      const resolved = resolveTemplate(source);
      this.innerHTML = resolved.html || _buildFromConfig(DEFAULT_CONFIG);
    }
    if (!this.hasAttribute("role")) this.setAttribute("role", "toolbar");
    if (!this.hasAttribute("aria-label"))
      this.setAttribute("aria-label", "Barra de acciones");
    enhanceIsland(this);
  }

  disconnectedCallback() {
    if (this._destroyIsland) this._destroyIsland();
  }

  setStatus(s) {
    this._setStatus?.(s);
  }
  setActiveMode(m) {
    this._setActiveMode?.(m);
  }
  setItemStatus(v, s) {
    this._setItemStatus?.(v, s);
  }
}

if (!customElements.get("island-menu")) {
  customElements.define("island-menu", IslandMenu);
}

// ─── buildIslandHTML — API pública, retrocompat ───────────────────────────────
export function buildIslandHTML(templateOrConfig) {
  const resolved = resolveTemplate(templateOrConfig);
  return resolved.isUrl ? "" : resolved.html || "";
}

// ─── showIslandToast — privada ────────────────────────────────────────────────
function showIslandToast(msg, isError = false) {
  const existing = document.querySelector(".island-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "island-toast";
  t.style.cssText = `
    position:fixed; bottom:70px; left:50%; transform:translateX(-50%);
    background:${isError ? "#b91c1c" : "#1f2937"}; color:white;
    padding:6px 12px; border-radius:6px; font-size:12px;
    z-index:10000; box-shadow:0 2px 8px rgba(0,0,0,0.3); pointer-events:none;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.parentNode?.removeChild(t), 3200);
}

// ─── importIslandMenu — API pública, retrocompat ──────────────────────────────
export async function importIslandMenu(templateOrConfig, options = {}) {
  const target = options.target || document.body;
  const id = options.id || "island";

  let island =
    document.getElementById(id) ||
    target.querySelector(`island-menu#${id}`) ||
    target.querySelector(`[data-component="island"]#${id}`);

  if (!island) {
    island = document.createElement("island-menu");
    island.id = id;
    target.appendChild(island);
  }

  const resolved = resolveTemplate(templateOrConfig);
  let html = "";
  let hadFetchError = false;

  if (resolved.isUrl) {
    try {
      const res = await fetch(resolved.url);
      if (res.ok) {
        html = await res.text();
      } else {
        console.error(
          `[island-menu] Fetch falló: ${resolved.url} → ${res.statusText}`,
        );
        hadFetchError = true;
      }
    } catch (e) {
      console.error("[island-menu] Error fetch:", e);
      hadFetchError = true;
    }
  } else {
    html = resolved.html || "";
  }

  if (html) {
    island.innerHTML = html;
  } else if (!island.innerHTML.trim()) {
    island.innerHTML = _buildFromConfig(DEFAULT_CONFIG);
  }

  island.dataset.component = "island";
  if (!island.hasAttribute("role")) island.setAttribute("role", "toolbar");
  if (!island.hasAttribute("aria-label"))
    island.setAttribute("aria-label", "Barra de acciones");

  if (hadFetchError) {
    island.dataset.loadError = "true";
    showIslandToast(
      "Error al cargar plantilla del island (usando fallback)",
      true,
    );
  }

  if (island._islandEnhanced && island._destroyIsland) island._destroyIsland();
  enhanceIsland(island);
  return island;
}

// ─── initIsland — API pública, retrocompat ────────────────────────────────────
export function initIsland(rootElement) {
  if (!rootElement) return null;
  if (rootElement.tagName === "ISLAND-MENU") return rootElement;
  if (!rootElement.dataset.component) rootElement.dataset.component = "island";
  return enhanceIsland(rootElement);
}

// ─── Auto-enhance legacy [data-component="island"] ────────────────────────────
if (typeof document !== "undefined") {
  const auto = () => {
    document
      .querySelectorAll('[data-component="island"]:not(island-menu)')
      .forEach((el) => {
        if (!el._islandEnhanced) initIsland(el);
      });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", auto, { once: true });
  } else {
    auto();
  }
}
