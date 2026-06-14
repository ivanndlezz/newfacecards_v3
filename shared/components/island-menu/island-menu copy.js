// island-menu.js - Modern ES Module + Custom Element (light DOM enhancement + auto-enhance legacy)
// Zero global IDs. All queries scoped to root. Dispatches CustomEvents. Auto-injects CSS + Tabler.
// Dual API: <island-menu> (declarative) or <div data-component="island"> + auto or initIsland(el)

const CSS_HREF = new URL('./island-menu.css', import.meta.url).href;
const TABLER_HREF = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css';

// Auto-inject (once) at module evaluation - best for icons before render + DX ("just drop the script")
(function injectAssets() {
  if (!document.querySelector('link[href*="island-menu.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[href*="@tabler/icons-webfont"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = TABLER_HREF;
    document.head.appendChild(link);
  }
})();

function enhanceIsland(root, opts = {}) {
  if (root._islandEnhanced) return root;
  root._islandEnhanced = true;

  const DOM = {
    island: root,
    btnEdit: root.querySelector('[data-role="btn-edit"]'),
    btnCheck: root.querySelector('[data-role="sat-left"]'),
    btnSatRight: root.querySelector('[data-role="sat-right"]'),
    modeOpts: root.querySelectorAll('[data-role="mode-opt"]'),
  };

  function dispatch(name, detail) {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: false, detail }));
  }

  function setStatus(status) {
    const prev = root.dataset.status;
    root.dataset.status = status || 'idle';
    if (prev !== root.dataset.status) {
      dispatch('island-status-change', { status: root.dataset.status, previous: prev });
    }
  }

  function setActiveMode(value) {
    const prevActive = Array.from(DOM.modeOpts).find((o) => o.dataset.active === 'true')?.dataset.value || null;
    DOM.modeOpts.forEach((opt) => {
      const isActive = opt.dataset.value === value;
      opt.dataset.active = isActive ? 'true' : 'false';
      opt.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    const newActive = value || null;
    if (prevActive !== newActive) {
      dispatch('island-mode-change', { mode: newActive, previous: prevActive });
    }
  }

  // 1. Edit -> edit mode
  DOM.btnEdit?.addEventListener('click', () => {
    setStatus('edit');
  });

  // 2. Check -> idle + clear mode
  DOM.btnCheck?.addEventListener('click', () => {
    setStatus('idle');
    setActiveMode(null);
  });

  // 3. Mode opts toggle (debounced + click counter for diagnostics)
  let _modeClickCooldown = 0;
  let _modeClickCount = 0;
  let _modeClickResetTimer = null;
  const MODE_DEBOUNCE_MS = 300;
  const MODE_COUNTER_WINDOW_MS = 15000;
  DOM.modeOpts.forEach((opt) => {
    opt.addEventListener('click', () => {
      const now = Date.now();
      const debounced = now - _modeClickCooldown < MODE_DEBOUNCE_MS;

      // Click counter: resets after 15s of inactivity
      _modeClickCount++;
      if (_modeClickResetTimer) clearTimeout(_modeClickResetTimer);
      _modeClickResetTimer = setTimeout(() => { _modeClickCount = 0; }, MODE_COUNTER_WINDOW_MS);

      console.log(`[island] click ${_modeClickCount} on "${opt.dataset.value}" | active=${opt.dataset.active} | debounced=${debounced}`);

      if (debounced) return;
      _modeClickCooldown = now;
      const alreadyActive = opt.dataset.active === 'true';
      setActiveMode(alreadyActive ? null : opt.dataset.value);
    });
  });

  // 4. Satellite -> action event (pages can listen)
  DOM.btnSatRight?.addEventListener('click', () => {
    const status = root.dataset.status;
    const type = status === 'idle' ? 'add' : 'more-options';
    dispatch('island-action', { type, status });
  });

  // 5. Escape (per-island, document level but guarded)
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && root.dataset.status === 'edit' && root.isConnected) {
      setStatus('idle');
      setActiveMode(null);
      DOM.btnEdit?.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown);

  // Public API (works on both <island-menu> and legacy div)
  root.setStatus = setStatus;
  root.setActiveMode = setActiveMode;
  root._setStatus = setStatus;
  root._setActiveMode = setActiveMode;

  // Bootstrap current state
  const initial = root.dataset.status || 'idle';
  if (root.dataset.status !== initial) root.dataset.status = initial;

  // Teardown
  root._destroyIsland = () => {
    document.removeEventListener('keydown', onKeyDown);
    delete root._islandEnhanced;
    delete root.setStatus;
    delete root.setActiveMode;
    delete root._setStatus;
    delete root._setActiveMode;
  };

  return root;
}

// Web Component (recommended for new usage)
export class IslandMenu extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.component) this.dataset.component = 'island';
    if (!this.innerHTML.trim()) {
      this.innerHTML = buildIslandHTML({
        edit: { label: 'Editar', icon: 'ti ti-edit' },
        modes: [
          { value: 'apariencia', label: 'Apariencia', icon: 'ti ti-palette' },
          { value: 'cardbar', label: 'Navegación', icon: 'ti ti-layout-columns' }
        ]
      });
    }
    enhanceIsland(this);
  }
  disconnectedCallback() {
    if (this._destroyIsland) this._destroyIsland();
  }
  setStatus(s) {
    if (this._setStatus) this._setStatus(s);
  }
  setActiveMode(m) {
    if (this._setActiveMode) this._setActiveMode(m);
  }
}

if (!customElements.get('island-menu')) {
  customElements.define('island-menu', IslandMenu);
}

// Helper to construct inner HTML based on template string, <template>, or config object
export function buildIslandHTML(templateOrConfig) {
  if (typeof templateOrConfig === 'string') {
    // Check if it's a CSS selector for a template element
    if (templateOrConfig.startsWith('#') || templateOrConfig.startsWith('.')) {
      const tempEl = document.querySelector(templateOrConfig);
      if (tempEl && tempEl.tagName === 'TEMPLATE') {
        return tempEl.innerHTML;
      }
    }
    
    // Auto-wrap if it's only a mode-group fragment
    if (templateOrConfig.includes('data-role="mode-group"') && !templateOrConfig.includes('data-role="primary"')) {
      return `
        <button data-role="sat-left" id="btn-check" data-action="island:check" aria-label="Confirmar y volver">
          <i class="ti ti-check" aria-hidden="true"></i>
        </button>
        <div data-role="primary">
          <button data-role="btn-edit" id="btn-edit" data-action="island:edit" aria-label="Activar modo edición">
            <i class="ti ti-edit" aria-hidden="true"></i>
            <span>Editar</span>
          </button>
          ${templateOrConfig}
        </div>
        <button data-role="sat-right" id="btn-satellite" data-action="island:satellite" aria-label="Más opciones">
          <i class="ti ti-plus" data-icon="plus" aria-hidden="true"></i>
          <i class="ti ti-dots" data-icon="dots" aria-hidden="true"></i>
        </button>
      `;
    }
    return templateOrConfig;
  }

  if (templateOrConfig && templateOrConfig instanceof HTMLElement) {
    if (templateOrConfig.tagName === 'TEMPLATE') {
      return templateOrConfig.innerHTML;
    }
    return templateOrConfig.outerHTML;
  }

  if (templateOrConfig && typeof templateOrConfig === 'object') {
    const editIcon = templateOrConfig.edit?.icon || 'ti ti-edit';
    const editLabel = templateOrConfig.edit?.label || 'Editar';
    const satLeftIcon = templateOrConfig.satLeft?.icon || 'ti ti-check';
    const satRightPlus = templateOrConfig.satRight?.plusIcon || 'ti ti-plus';
    const satRightDots = templateOrConfig.satRight?.dotsIcon || 'ti ti-dots';

    const modesHtml = (templateOrConfig.modes || []).map(m => `
      <button data-role="mode-opt" data-action="island:mode" data-active="false" data-value="${m.value}" aria-pressed="false" class="island-btn">
        <div class="island-btn__icon-wrapper">
          <i class="${m.icon || 'ti ti-circle'}" aria-hidden="true"></i>
        </div>
        <span class="island-btn__label">${m.label}</span>
      </button>
    `).join('');

    return `
      <button data-role="sat-left" id="btn-check" data-action="island:check" aria-label="Confirmar y volver" class="island-btn island-btn--check">
        <div class="island-btn__icon-wrapper">
          <i class="${satLeftIcon}" aria-hidden="true"></i>
        </div>
      </button>
      <div data-role="primary" class="island-primary">
        <button data-role="btn-edit" id="btn-edit" data-action="island:edit" aria-label="Activar modo edición" class="island-btn island-btn--edit">
          <div class="island-btn__icon-wrapper">
            <i class="${editIcon}" aria-hidden="true"></i>
          </div>
          <span class="island-btn__label">${editLabel}</span>
        </button>
        <div data-role="mode-group" id="mode-group" role="group" aria-label="Modo de vista" class="island-mode-group">
          ${modesHtml}
        </div>
      </div>
      <button data-role="sat-right" id="btn-satellite" data-action="island:satellite" aria-label="Más opciones" class="island-btn island-btn--satellite">
        <div class="island-btn__icon-wrapper">
          <i class="${satRightPlus}" data-icon="plus" aria-hidden="true"></i>
          <i class="${satRightDots}" data-icon="dots" aria-hidden="true"></i>
        </div>
        <span class="island-btn__label">Link</span>
      </button>
    `;
  }

  return '';
}

function showIslandToast(msg, isError = false) {
  // Lightweight, non-blocking visual feedback (premium UX for load errors)
  const existing = document.querySelector('.island-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'island-toast';
  t.style.cssText = `
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#b91c1c' : '#1f2937'};
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    if (t.parentNode) t.parentNode.removeChild(t);
  }, 3200);
}

// Imperative loader/renderer for dynamic template importing (supports fetch for external .html files)
export async function importIslandMenu(templateOrConfig, options = {}) {
  const target = options.target || document.body;
  const id = options.id || 'island';

  let island = document.getElementById(id) || target.querySelector(`island-menu#${id}`) || target.querySelector(`[data-component="island"]#${id}`);
  
  if (!island) {
    island = document.createElement('island-menu');
    island.id = id;
    target.appendChild(island);
  }

  let html = '';
  let hadFetchError = false;
  const isUrl = typeof templateOrConfig === 'string' && (templateOrConfig.endsWith('.html') || templateOrConfig.includes('/components/'));
  if (isUrl) {
    try {
      const res = await fetch(templateOrConfig);
      if (res.ok) {
        html = await res.text();
      } else {
        console.error(`Failed to fetch island template from ${templateOrConfig}: ${res.statusText}`);
        hadFetchError = true;
      }
    } catch (e) {
      console.error(`Error fetching island template from ${templateOrConfig}:`, e);
      hadFetchError = true;
    }
  } else {
    html = buildIslandHTML(templateOrConfig);
  }

  if (html) {
    island.innerHTML = html;
  } else if (!island.innerHTML.trim()) {
    // Fallback: ensure we never leave the island empty (initial load safety)
    html = buildIslandHTML({
      edit: { label: 'Editar', icon: 'ti ti-edit' },
      modes: [
        { value: 'apariencia', label: 'Apariencia', icon: 'ti ti-palette' },
        { value: 'cardbar', label: 'Navegación', icon: 'ti ti-layout-columns' }
      ]
    });
    island.innerHTML = html;
  }

  // Guarantee attributes after any innerHTML replacement (fixes chicken-egg + downstream selectors)
  island.dataset.component = 'island';
  if (!island.hasAttribute('role')) island.setAttribute('role', 'toolbar');
  if (!island.hasAttribute('aria-label')) island.setAttribute('aria-label', 'Barra de acciones');

  if (hadFetchError) {
    island.dataset.loadError = 'true';
    showIslandToast('Error al cargar plantilla del island (usando fallback)', true);
  }

  if (island._islandEnhanced && island._destroyIsland) {
    island._destroyIsland();
  }

  enhanceIsland(island);
  return island;
}

// Imperative init (for manual or legacy divs)
export function initIsland(rootElement) {
  if (!rootElement) return null;
  if (rootElement.tagName === 'ISLAND-MENU') return rootElement;
  if (!rootElement.dataset.component) rootElement.dataset.component = 'island';
  return enhanceIsland(rootElement);
}

// Auto-enhance any legacy [data-component="island"] divs when script runs (no HTML changes needed)
if (typeof document !== 'undefined') {
  const auto = () => {
    document.querySelectorAll('[data-component="island"]:not(island-menu)').forEach((el) => {
      if (!el._islandEnhanced) initIsland(el);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', auto, { once: true });
  } else {
    auto();
  }
}
