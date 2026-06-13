// bottom-sheet.js — v2 (Unified Premium Component)
/*
 * ==========================================================================
 * REGLAS DE ARQUITECTURA UI
 *
 * Patrones:
 * - JS cambia estado con atributos data-*.
 * - CSS define la representacion visual de cada estado.
 * - El display base de bottom-sheet es flex y debe venir de CSS.
 * - Usar variables CSS solo para valores dinamicos de runtime.
 *
 * Antipatrones:
 * - No escribir estilos inline hardcoded para comportamiento.
 * - No usar el.style.display = "block" para mostrar componentes.
 *   En bottom-sheet rompe display:flex y bloquea scroll/layout interno.
 * - No manejar hidden/active/open con style="" si existe data-state/data-status.
 * - No mezclar estado en clases utilitarias cuando data-* lo expresa mejor.
 *
 * Ejemplo:
 * Correcto: footer.dataset.status = "active"
 * Incorrecto: footer.style.display = "block"
 * ==========================================================================
 */
// Componente dinámico de Bottom Sheet con soporte para gestos y arquitectura modular.
// Klef Agency & New Face Cards v3

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
 * Cierra el sheet activo actual (dinámico).
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
 * Construye y abre un bottom sheet (para compatibilidad).
 */
export function constructSheet(presetOrConfig, data) {
  let config;

  if (typeof presetOrConfig === "string") {
    const presetFn = _presets.get(presetOrConfig);
    if (!presetFn) {
      console.error(`[bottom-sheet] Preset "${presetOrConfig}" no registrado.`);
      return null;
    }
    config = presetFn(data || {});
  } else if (typeof presetOrConfig === "object" && presetOrConfig !== null) {
    config = presetOrConfig;
  } else {
    console.error("[bottom-sheet] constructSheet requiere un preset (string) o un config (object).");
    return null;
  }

  if (_activeOverlay) {
    closeSheet();
  }

  const overlay = document.createElement("div");
  overlay.className = "bottom-sheet-overlay";
  overlay.setAttribute("data-state", "closed");

  const scope = config.scope || "default";

  const headerHTML = _renderHeader(config);
  const contentHTML = _resolveContent(config.content);
  const footerHTML = _renderFooter(config);

  overlay.innerHTML = `
    <div class="bottom-sheet-container" data-scope="${scope}">
      <div class="sheet-handler-area"><div class="sheet-drag-pill"></div></div>
      ${headerHTML}
      <div class="bsheet-content">${contentHTML}</div>
      ${footerHTML}
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSheet();
  });

  const closeBtn = overlay.querySelector("[data-bsheet-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeSheet());
  }

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

  _onEscHandler = (e) => {
    if (e.key === "Escape") closeSheet();
  };
  document.addEventListener("keydown", _onEscHandler);

  document.body.appendChild(overlay);
  _activeOverlay = overlay;

  // Hydrate drag gestures on dynamic container
  const container = overlay.querySelector(".bottom-sheet-container");
  if (container) {
    const handler = overlay.querySelector(".sheet-handler-area");
    let startY = 0, currentY = 0;
    
    const onStart = (e) => {
      container.setAttribute("data-state", "dragging");
      startY = e.type.includes("mouse") ? e.pageY : e.touches[0].clientY;
    };
    
    const onMove = (e) => {
      if (container.getAttribute("data-state") !== "dragging") return;
      const y = e.type.includes("mouse") ? e.pageY : e.touches[0].clientY;
      const deltaY = y - startY;
      if (deltaY > 0) {
        if (!e.type.includes("mouse")) e.preventDefault();
        currentY = deltaY;
        container.style.transform = `translateY(${currentY}px)`;
      }
    };
    
    const onEnd = () => {
      if (container.getAttribute("data-state") !== "dragging") return;
      container.setAttribute("data-state", "open");
      if (currentY > 120) {
        closeSheet();
      } else {
        container.style.transform = "translateY(0px)";
      }
      currentY = 0;
    };

    if (handler) {
      handler.addEventListener("touchstart", onStart, { passive: true });
      handler.addEventListener("touchmove", onMove, { passive: false });
      handler.addEventListener("touchend", onEnd);
      handler.addEventListener("mousedown", onStart);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onEnd);
    }
  }

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

// ─── CLASS-BASED COMPONENT ───────────────────────────────────────────────────
/**
 * Clase BottomSheet para hidratar contenedores estáticos del DOM.
 */
export class BottomSheet {
  constructor(sheetId, backdropId) {
    this.sheet = document.getElementById(sheetId);
    this.backdrop = document.getElementById(backdropId);
    
    if (!this.sheet || !this.backdrop) {
      console.warn(`[bottom-sheet] Elementos no encontrados: sheetId="${sheetId}", backdropId="${backdropId}"`);
      return;
    }

    this.zones = {
      headerLeft: this.sheet.querySelector('.sheet-header-left') || this.sheet.querySelector('#sheet-header-left'),
      headerCenter: this.sheet.querySelector('.sheet-header-center') || this.sheet.querySelector('#sheet-header-center'),
      headerRight: this.sheet.querySelector('.sheet-header-right') || this.sheet.querySelector('#sheet-header-right'),
      content: this.sheet.querySelector('.sheet-content-slots') || this.sheet.querySelector('#sheet-content'),
      footer: this.sheet.querySelector('.sheet-sticky-controls') || this.sheet.querySelector('#sheet-footer')
    };

    this.handlerArea = this.sheet.querySelector('.sheet-handler-area');
    this.isOpen = false;
    this.startY = 0;
    this.currentY = 0;
    
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.handleDelegatedClicks = this.handleDelegatedClicks.bind(this);
  }

  hydrate() {
    if (!this.sheet) return this;

    this.backdrop.addEventListener('click', this.close);
    this.sheet.addEventListener('click', this.handleDelegatedClicks);

    if (this.handlerArea) {
      this.handlerArea.addEventListener('touchstart', this.onDragStart, { passive: true });
      this.handlerArea.addEventListener('touchmove', this.onDragMove, { passive: false });
      this.handlerArea.addEventListener('touchend', this.onDragEnd);
      
      this.handlerArea.addEventListener('mousedown', this.onDragStart);
      window.addEventListener('mousemove', this.onDragMove);
      window.addEventListener('mouseup', this.onDragEnd);
    }

    return this; 
  }

  handleDelegatedClicks(e) {
    const closeBtn = e.target.closest('[data-action="close"]');
    if (closeBtn) this.close();
  }

  configure(config) {
    if (!this.sheet) return;

    if (this.zones.content) {
      this.zones.content.scrollTop = 0;
    }

    if (config.headerLeft !== undefined && this.zones.headerLeft) {
      this.zones.headerLeft.innerHTML = config.headerLeft;
    }
    if (config.headerCenter !== undefined && this.zones.headerCenter) {
      this.zones.headerCenter.innerHTML = `<h2 style="font-size: 18px; margin:0; font-weight: 600;">${config.headerCenter}</h2>`;
    }
    if (config.headerRight !== undefined && this.zones.headerRight) {
      this.zones.headerRight.innerHTML = config.headerRight;
    }
    if (config.content !== undefined && this.zones.content) {
      this.zones.content.innerHTML = config.content;
    }
    
    if (this.zones.footer) {
      if (config.footer) {
        this.zones.footer.innerHTML = config.footer;
        this.zones.footer.dataset.status = 'active';
      } else if (config.footer === null) {
        this.zones.footer.dataset.status = 'hidden';
      }
    }
    
    if (window.lucide) window.lucide.createIcons();
  }

  open() {
    if (!this.sheet) return;
    this.isOpen = true;
    this.sheet.style.setProperty('--sheet-transform', '0%');
    this.sheet.setAttribute('data-state', 'open');
    this.backdrop.setAttribute('data-state', 'open');
    document.body.style.overflow = 'hidden';
    _setStatusStorage("showing");
  }

  close() {
    if (!this.sheet) return;
    this.isOpen = false;
    this.sheet.style.setProperty('--sheet-transform', '100%');
    this.sheet.setAttribute('data-state', 'closed');
    this.backdrop.setAttribute('data-state', 'closed');
    document.body.style.overflow = ''; 
    _setStatusStorage("hidden");
    setTimeout(() => { 
      if (this.sheet) this.sheet.style.transform = ''; 
    }, 500); 
  }

  onDragStart(e) {
    if (!this.isOpen || !this.sheet) return;
    this.sheet.setAttribute('data-state', 'dragging');
    this.startY = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
  }

  onDragMove(e) {
    if (!this.sheet || this.sheet.getAttribute('data-state') !== 'dragging') return;
    const y = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
    const deltaY = y - this.startY;
    if (deltaY > 0) {
      if (!e.type.includes('mouse')) e.preventDefault(); 
      this.currentY = deltaY;
      this.sheet.style.transform = `translateY(${this.currentY}px)`;
    }
  }

  onDragEnd() {
    if (!this.sheet || this.sheet.getAttribute('data-state') !== 'dragging') return;
    this.sheet.setAttribute('data-state', 'open'); 
    if (this.currentY > 120) {
      this.close();
    } else {
      this.sheet.style.transform = `translateY(0px)`;
    }
    this.currentY = 0;
  }
}
