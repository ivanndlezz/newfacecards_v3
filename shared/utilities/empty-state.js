/**
 * EmptyStateManager — v1
 * Location: /shared/utilities/empty-state.js
 *
 * Detecta loaders vacíos tras la hidratación y les inyecta
 * un placeholder/call-to-action visual. Se auto-retira si el
 * loader recibe contenido real (via MutationObserver).
 *
 * Uso típico (en onSuccess del DataBinder):
 *
 *   import { EmptyStateManager } from "/shared/utilities/empty-state.js";
 *
 *   const binder = new DataBinder({
 *     ...config,
 *     onSuccess: (data) => {
 *       EmptyStateManager.scan();
 *     }
 *   });
 *
 * Configuración por data-attribute en cada loader:
 *   data-empty-label="Agregar redes"       → texto del CTA (override)
 *   data-empty-hint="Instagram, TikTok…"   → subtexto descriptivo (override)
 *   data-empty-icon="share"                → clave de ícono (override)
 *
 * Los loaders con [data-empty-skip] son ignorados completamente.
 */

// ─── Íconos SVG inline (Tabler-style, 24×24, stroke) ────────────────────────
const ICONS = {
  share: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>`,

  user: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`,

  building: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>`,

  mail: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>`,

  plus: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,
};

// ─── Mapa de defaults por loader ID ─────────────────────────────────────────
const LOADER_DEFAULTS = {
  'social_top_buttons-loader': {
    label: 'Agregar redes',
    hint:  'Instagram, TikTok, LinkedIn…',
    icon:  'share',
  },
  'contact_section_buttons-loader': {
    label: 'Agregar datos de contacto',
    hint:  'Teléfono, email, WhatsApp…',
    icon:  'user',
  },
  'company_section_buttons-loader': {
    label: 'Agregar datos de empresa',
    hint:  'Logo, nombre, servicios…',
    icon:  'building',
  },
  'bottom_section_buttons-loader': {
    label: 'Agregar redes sociales',
    hint:  'Conecta tus perfiles sociales',
    icon:  'share',
  },
};

// ─── CSS inyectado una sola vez ──────────────────────────────────────────────
const STYLES = `
.nfc-empty-cta {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 18px 12px !important;
  border: 1.5px dashed rgba(128, 128, 128, 0.35) !important;
  border-radius: 14px !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: border-color 0.2s, background 0.2s !important;
  text-decoration: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
  color: inherit !important;
  margin-top: 4px !important;
}
.nfc-empty-cta:hover {
  border-color: rgba(128, 128, 128, 0.65) !important;
  background: rgba(128, 128, 128, 0.07) !important;
}
.nfc-empty-cta svg {
  width: 22px !important;
  height: 22px !important;
  opacity: 0.45 !important;
  flex-shrink: 0 !important;
}
.nfc-empty-cta__label {
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.12em !important;
  opacity: 0.55 !important;
}
.nfc-empty-cta__hint {
  font-size: 0.65rem !important;
  opacity: 0.3 !important;
  letter-spacing: 0.04em !important;
}
`;

// ─── EmptyStateManager ───────────────────────────────────────────────────────
export class EmptyStateManager {
  /** @type {Map<string, MutationObserver>} */
  static _observers = new Map();
  static _stylesInjected = false;

  /**
   * Inyecta los estilos globales una sola vez.
   * @private
   */
  static _injectStyles() {
    if (this._stylesInjected) return;
    const style = document.createElement('style');
    style.id = 'nfc-empty-state-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    this._stylesInjected = true;
  }

  /**
   * Construye el elemento placeholder a partir de la config del loader.
   * @param {HTMLElement} loader
   * @returns {HTMLElement}
   * @private
   */
  static _buildPlaceholder(loader) {
    const id      = loader.id;
    const defaults = LOADER_DEFAULTS[id] || {};

    const label = loader.dataset.emptyLabel || defaults.label || 'Agregar contenido';
    const hint  = loader.dataset.emptyHint  || defaults.hint  || '';
    const icon  = loader.dataset.emptyIcon  || defaults.icon  || 'plus';

    const el = document.createElement('a');
    el.href = '#';
    el.className = 'nfc-empty-cta';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', label);
    el.dataset.emptyFor = id;

    el.innerHTML = `
      ${ICONS[icon] || ICONS.plus}
      <span class="nfc-empty-cta__label">${label}</span>
      ${hint ? `<span class="nfc-empty-cta__hint">${hint}</span>` : ''}
    `;

    // Dispatch evento personalizado para que el host pueda interceptarlo y prevenir comportamiento href predeterminado
    el.addEventListener('click', (e) => {
      e.preventDefault();
      el.dispatchEvent(new CustomEvent('nfc:empty-cta-click', {
        bubbles: true,
        detail: { loaderId: id, label }
      }));
    });

    return el;
  }

  /**
   * Observa un loader con MutationObserver.
   * Si recibe contenido real → oculta el placeholder.
   * Si queda vacío de nuevo → lo muestra.
   * @param {HTMLElement} loader
   * @param {HTMLElement} placeholder
   * @private
   */
  static _watchLoader(loader, placeholder) {
    // Evitar observers duplicados
    if (this._observers.has(loader.id)) {
      this._observers.get(loader.id).disconnect();
    }

    const observer = new MutationObserver(() => {
      const hasContent = loader.children.length > 0 || loader.textContent.trim().length > 0;
      placeholder.style.display = hasContent ? 'none' : '';
    });

    observer.observe(loader, { childList: true, subtree: true, characterData: true });
    this._observers.set(loader.id, observer);
  }

  /**
   * Evalúa todos los loaders conocidos (o los pasados) dentro de un contenedor
   * e inyecta/actualiza placeholders según su estado vacío.
   *
   * @param {HTMLElement} [container=document.body]  Contenedor de búsqueda
   * @param {string[]}    [loaderIds]                IDs explícitos a evaluar (opcional)
   */
  static scan(container = document.body, loaderIds) {
    this._injectStyles();

    const ids = loaderIds || Object.keys(LOADER_DEFAULTS);

    ids.forEach(id => {
      const loader = container.querySelector(`#${id}`)
                  ?? document.getElementById(id);

      if (!loader) return;

      // Respetar flag de exclusión
      if (loader.hasAttribute('data-empty-skip')) return;

      // Evitar inyectar duplicados
      const existingPlaceholder = document.querySelector(`[data-empty-for="${id}"]`);
      if (existingPlaceholder) {
        // Solo actualizar visibilidad
        const hasContent = loader.children.length > 0 || loader.textContent.trim().length > 0;
        existingPlaceholder.style.display = hasContent ? 'none' : '';
        return;
      }

      const placeholder = this._buildPlaceholder(loader);

      // Insertar inmediatamente después del loader en el DOM
      loader.insertAdjacentElement('afterend', placeholder);

      // Estado inicial
      const hasContent = loader.children.length > 0 || loader.textContent.trim().length > 0;
      if (hasContent) placeholder.style.display = 'none';

      // Observar cambios futuros
      this._watchLoader(loader, placeholder);
    });
  }

  /**
   * Destruye todos los observers activos y elimina los placeholders del DOM.
   */
  static destroy() {
    this._observers.forEach(obs => obs.disconnect());
    this._observers.clear();

    document.querySelectorAll('[data-empty-for]').forEach(el => el.remove());

    console.log('[EmptyStateManager] Destruido.');
  }
}
