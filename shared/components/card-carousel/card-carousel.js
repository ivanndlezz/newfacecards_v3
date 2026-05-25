// card-carousel.js - Reusable, zero-dep theme carousel component (v2 standard + v3 premium 3D opt-in)
// Follows patterns from island-menu: self-contained CSS injection, custom events, enhance/init API
// Dispatches: 'card-theme-selected' { themeId, templateUrl?, label? }
// Supports advanced: true (or data-carousel-advanced) -> dynamic import of 3D renderer (card-carousel-3d.js)
// Public: initCardCarousel(root, options), also auto-enhances [data-component="card-carousel"]

const CSS_HREF = '/shared/components/card-carousel/card-carousel.css';

(function injectCarouselCSS() {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[href*="${CSS_HREF.split('/').pop()}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  document.head.appendChild(link);
})();

function normalizeTheme(theme) {
  if (!theme) return null;
  if (typeof theme === 'string') return { id: theme, label: theme };
  return {
    id: theme.id || theme.name,
    label: theme.label || theme.id,
    templateUrl: theme.templateUrl || `/templates/cards/${theme.id}.html`,
    ...theme
  };
}

function createBullet(themeId, label, isActive) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bullet';
  btn.dataset.name = themeId;
  btn.setAttribute('aria-label', label || themeId);
  btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  if (isActive) btn.classList.add('active');
  return btn;
}

function enhanceCarousel(root, options = {}) {
  if (!root || root._carouselEnhanced) return root;
  root._carouselEnhanced = true;

  const cfg = {
    themes: options.themes || [],
    selected: options.selected || root.dataset.cardSelected || root.getAttribute('data-card-selected') || 'aurora',
    onSelect: options.onSelect || null,
    registryUrl: options.registryUrl || '/data/themes.json',
    lazyLoadRegistry: options.lazyLoadRegistry ?? true,
    ...options
  };

  let themes = (cfg.themes || []).map(normalizeTheme).filter(Boolean);

  const DOM = {
    root,
    track: root.querySelector('.card-carousel__track') || root.querySelector('#cards > div') || root,
    indicator: root.querySelector('.bullet-active-indicator')
  };

  // If no explicit track container, assume direct children .card are in root or first child div
  if (!root.querySelector('.card-carousel__track')) {
    // normalize markup for consistency if using legacy skeleton
    let track = root.querySelector('.card-carousel__track');
    if (!track) {
      const cardsContainer = root.querySelector('div:has(> .card)') || root.firstElementChild;
      if (cardsContainer) {
        cardsContainer.classList.add('card-carousel__track');
        track = cardsContainer;
      }
    }
    DOM.track = track || root;
  }

  async function ensureThemes() {
    if (themes.length > 0) return themes;
    // fallback: discover from existing .card[data-name] children
    const discovered = Array.from(root.querySelectorAll('.card[data-name]')).map(el => ({
      id: el.dataset.name,
      label: el.dataset.label || el.dataset.name,
      templateUrl: el.dataset.templateUrl || `/templates/cards/${el.dataset.name}.html`
    }));
    if (discovered.length) {
      themes = discovered;
      return themes;
    }
    // last resort: lazy fetch registry (used in admin integration)
    if (cfg.lazyLoadRegistry) {
      try {
        const res = await fetch(cfg.registryUrl);
        if (res.ok) {
          const json = await res.json();
          const list = json.themes || json;
          themes = list.map(normalizeTheme).filter(Boolean);
          // apply legacy alias resolution if needed later
        }
      } catch (e) {
        console.warn('[card-carousel] registry fetch failed, using fallback themes', e);
        themes = ['aurora','zen','tropico','obsidiana','brutal','deco'].map(id => ({id, label: id[0].toUpperCase()+id.slice(1), templateUrl: `/templates/cards/${id}.html`}));
      }
    }
    return themes;
  }

  function setSelected(themeId, { silent = false } = {}) {
    const prev = root.dataset.cardSelected || root.getAttribute('data-card-selected');
    root.dataset.cardSelected = themeId;
    root.setAttribute('data-card-selected', themeId);

    // update cards
    root.querySelectorAll('.card').forEach(card => {
      const name = card.dataset.name;
      const isActive = name === themeId;
      card.dataset.selected = isActive ? 'true' : 'false';
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        card.setAttribute('tabindex', '0');
      } else {
        card.setAttribute('tabindex', '-1');
      }
    });

    // update bullets
    if (DOM.indicator) {
      DOM.indicator.querySelectorAll('.bullet').forEach(b => {
        const active = b.dataset.name === themeId;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    if (!silent && prev !== themeId) {
      const theme = themes.find(t => t.id === themeId) || { id: themeId };
      const detail = { themeId, templateUrl: theme.templateUrl, label: theme.label };
      root.dispatchEvent(new CustomEvent('card-theme-selected', { bubbles: true, detail }));
      if (typeof cfg.onSelect === 'function') cfg.onSelect(detail);
    }
  }

  function renderBullets() {
    if (!DOM.indicator) {
      DOM.indicator = document.createElement('div');
      DOM.indicator.className = 'bullet-active-indicator';
      root.appendChild(DOM.indicator);
    }
    DOM.indicator.innerHTML = '';
    themes.forEach(theme => {
      const isActive = theme.id === (root.dataset.cardSelected || cfg.selected);
      const bullet = createBullet(theme.id, theme.label, isActive);
      bullet.addEventListener('click', () => {
        setSelected(theme.id);
      });
      DOM.indicator.appendChild(bullet);
    });
  }

  async function renderOrEnhanceCards() {
    await ensureThemes();

    let cards = Array.from(root.querySelectorAll('.card[data-name]'));
    if (cards.length === 0 && themes.length > 0) {
      // dynamically render track + cards if none present (admin use case)
      if (!DOM.track || DOM.track === root) {
        const track = document.createElement('div');
        track.className = 'card-carousel__track';
        root.prepend(track); // or insert before indicator
        DOM.track = track;
      }
      DOM.track.innerHTML = '';
      themes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.name = theme.id;
        card.dataset.label = theme.label;
        if (theme.previewColor) card.style.setProperty('--preview-color', theme.previewColor);
        card.setAttribute('role', 'option');
        card.setAttribute('aria-label', theme.label);
        DOM.track.appendChild(card);
      });
      cards = Array.from(DOM.track.children);
    }

    // attach listeners + initial state
    cards.forEach(card => {
      const name = card.dataset.name;
      card.setAttribute('role', 'option');
      card.setAttribute('tabindex', '-1');
      if (!card.hasAttribute('aria-label')) card.setAttribute('aria-label', card.dataset.label || name);

      card.addEventListener('click', () => {
        setSelected(name);
      });

      // keyboard support on individual cards
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelected(name);
        }
      });
    });

    // initial selection state
    const initial = root.dataset.cardSelected || cfg.selected;
    if (initial) setSelected(initial, { silent: true });
  }

  // Public controls
  root.setSelectedTheme = (id) => setSelected(id);
  root.getSelectedTheme = () => root.dataset.cardSelected;
  root.refresh = async () => {
    themes = [];
    await renderOrEnhanceCards();
    renderBullets();
  };

  // Initial bootstrap
  (async () => {
    await renderOrEnhanceCards();
    renderBullets();

    // Keyboard arrow nav on root (when focused)
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      const current = root.dataset.cardSelected;
      const idx = themes.findIndex(t => t.id === current);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const next = themes[(idx + 1) % themes.length];
        if (next) setSelected(next.id);
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prev = themes[(idx - 1 + themes.length) % themes.length];
        if (prev) setSelected(prev.id);
        e.preventDefault();
      }
      if (e.key === 'Home') {
        setSelected(themes[0]?.id);
        e.preventDefault();
      }
      if (e.key === 'End') {
        setSelected(themes[themes.length - 1]?.id);
        e.preventDefault();
      }
    });

    // Touch friendly: ensure scroll snap works (css already handles)
    // Optional: click on indicator area focuses track
  })();

  // Store destroy for potential re-init safety (like island)
  root._destroyCarousel = () => {
    root._carouselEnhanced = false;
    // listeners are lightweight; full teardown rare
  };

  return root;
}

// Imperative init (preferred for admin)
// Supports { advanced: true } for premium 3D renderer (lazy loaded)
export function initCardCarousel(rootElement, options = {}) {
  if (!rootElement) return null;
  const wantsAdvanced = options.advanced === true || rootElement.dataset.carouselAdvanced === 'true' || rootElement.hasAttribute('data-carousel-advanced');
  if (wantsAdvanced) {
    // Dynamic import keeps base bundle lightweight; graceful fallback to standard v2 on error
    return import('./card-carousel-3d.js')
      .then(({ initPremiumCardCarousel }) => {
        try {
          const premium = initPremiumCardCarousel(rootElement, options);
          return premium || enhanceCarousel(rootElement, options); // fallback inside if needed
        } catch (e) {
          console.warn('[card-carousel] premium renderer failed, falling back to standard', e);
          return enhanceCarousel(rootElement, options);
        }
      })
      .catch((err) => {
        console.warn('[card-carousel] failed to load advanced renderer, using standard mode', err);
        return enhanceCarousel(rootElement, options);
      });
  }
  return enhanceCarousel(rootElement, options);
}

// Auto-enhance any [data-component="card-carousel"] (progressive)
if (typeof document !== 'undefined') {
  const autoEnhance = () => {
    document.querySelectorAll('[data-component="card-carousel"]:not([data-carousel-enhanced])').forEach(el => {
      el.setAttribute('data-carousel-enhanced', 'true');
      const adv = el.dataset.carouselAdvanced === 'true' || el.hasAttribute('data-carousel-advanced');
      initCardCarousel(el, adv ? { advanced: true } : {});
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoEnhance, { once: true });
  } else {
    autoEnhance();
  }
}

// Optional: named export for future Web Component wrapper
export { enhanceCarousel as enhanceCardCarousel };
