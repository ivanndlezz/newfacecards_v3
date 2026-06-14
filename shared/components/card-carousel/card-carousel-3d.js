// card-carousel-3d.js - Premium 3D advanced renderer for Card Carousel 3
// Dynamically loaded only when initCardCarousel(..., { advanced: true })
// Ports/adapts 3D engine, IntersectionObserver, glassmorphism, depth effects from card-carousel-2.html
// Uses runtime isolated mini-renders via createIsolatedPreview (shadow DOM + scoped styles)
// Pure vanilla, self-injects card-carousel-3d.css
// Emits same 'card-theme-selected' contract; supports same public API surface
// Reduced-motion: fully disables perspective/rotateY (flattens to 2D)

const PREMIUM_CSS_HREF = new URL('./card-carousel-3d.css', import.meta.url).href;

(function injectPremiumCSS() {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[href*="${PREMIUM_CSS_HREF.split('/').pop()}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = PREMIUM_CSS_HREF;
  document.head.appendChild(link);
})();

function normalizeTheme(theme) {
  if (!theme) return null;
  if (typeof theme === 'string') return { id: theme, label: theme };
  return {
    id: theme.id || theme.name,
    label: theme.label || theme.id,
    templateUrl: theme.templateUrl || `/templates/cards/${theme.id}.html`,
    previewColor: theme.previewColor,
    ...theme
  };
}

// Dedicated isolated preview helper (Phase 2 target: full runtime from template with selector scoping)
// For v3: creates shadowRoot + minimal recognizable signature render per theme (no leakage to main DOM)
function createIsolatedPreview(themeId, hostEl, themeMeta = {}) {
  if (!hostEl) return;
  // Clear previous
  hostEl.innerHTML = '';
  const shadow = hostEl.attachShadow ? hostEl.attachShadow({ mode: 'open' }) : hostEl; // fallback for old browsers

  const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Minimal signature CSS + HTML per theme (drawn from real templates + base motifs; scoped to shadow)
  const signatures = {
    aurora: {
      bg: 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(168,85,247,0.6) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 30%, rgba(59,130,246,0.5) 0%, transparent 55%), radial-gradient(ellipse 60% 70% at 50% 80%, rgba(236,72,153,0.4) 0%, transparent 60%), #0f0c1e',
      motif: '✧',
      accent: '#c084fc',
      labelColor: '#e0d4ff'
    },
    zen: {
      bg: 'linear-gradient(135deg, #052e16 0%, #166534 100%)',
      motif: '◌',
      accent: '#4ade80',
      labelColor: '#d1fae5'
    },
    tropico: {
      bg: 'linear-gradient(135deg, #7c2d12 0%, #c2410f 50%, #f59e0b 100%)',
      motif: '☀︎',
      accent: '#fb923c',
      labelColor: '#ffedd5'
    },
    obsidiana: {
      bg: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
      motif: '◆',
      accent: '#64748b',
      labelColor: '#cbd5e1'
    },
    brutal: {
      bg: 'linear-gradient(135deg, #431407 0%, #854d0e 100%)',
      motif: '▮',
      accent: '#fbbf24',
      labelColor: '#fef3c7'
    },
    deco: {
      bg: 'linear-gradient(135deg, #451a03 0%, #854d0e 40%, #d97706 100%)',
      motif: '◆ ◆',
      accent: '#fcd34d',
      labelColor: '#fefce8'
    }
  };

  const sig = signatures[themeId] || signatures.aurora;
  const label = themeMeta.label || themeId;

  // Scoped style (no global pollution)
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; display: block; width: 100%; height: 100%; font-family: system-ui, sans-serif; }
    .preview { position: relative; width: 100%; height: 100%; background: ${sig.bg}; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .preview::after { content: '${sig.motif}'; position: absolute; font-size: 42px; color: ${sig.accent}; opacity: 0.75; text-shadow: 0 2px 12px rgba(0,0,0,0.4); }
    .preview .inner { position: relative; z-index: 1; text-align: center; padding: 8px; }
    .preview .avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1.5px solid ${sig.accent}; margin: 0 auto 6px; }
    .preview .name { font-size: 9px; font-weight: 700; color: ${sig.labelColor}; letter-spacing: -0.02em; line-height: 1; }
    .preview .tag { font-size: 6px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.55); margin-top: 2px; }
    ${isReduced ? '' : `
    .preview { transition: transform 0.2s ease; }
    .preview:hover { transform: scale(1.02); }
    `}
  `;
  shadow.appendChild(style);

  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.innerHTML = `
    <div class="inner">
      <div class="avatar"></div>
      <div class="name">${label}</div>
      <div class="tag">${themeId}</div>
    </div>
  `;
  shadow.appendChild(preview);

  // Future extension point: attach data for overrides
  hostEl.dataset.previewTheme = themeId;
}

// Main premium enhancer (called by the router in card-carousel.js when advanced)
function enhancePremiumCarousel(root, options = {}) {
  if (!root || root._premiumEnhanced) return root;
  root._premiumEnhanced = true;
  root.classList.add('card-carousel', 'card-carousel--premium');

  const cfg = {
    themes: options.themes || [],
    selected: options.selected || root.dataset.cardSelected || root.getAttribute('data-card-selected') || 'aurora',
    onSelect: options.onSelect || null,
    registryUrl: options.registryUrl || '/data/themes.json',
    lazyLoadRegistry: options.lazyLoadRegistry ?? true,
    ...options
  };

  let themes = (cfg.themes || []).map(normalizeTheme).filter(Boolean);
  let observer = null;
  let activeIndex = 0;

  const DOM = {
    root,
    track: null,
    indicator: null,
    dots: null
  };

  async function ensureThemes() {
    if (themes.length > 0) return themes;
    const discovered = Array.from(root.querySelectorAll('.card[data-name]')).map(el => ({
      id: el.dataset.name,
      label: el.dataset.label || el.dataset.name,
      templateUrl: el.dataset.templateUrl || `/templates/cards/${el.dataset.name}.html`
    }));
    if (discovered.length) {
      themes = discovered;
      return themes;
    }
    if (cfg.lazyLoadRegistry) {
      try {
        const res = await fetch(cfg.registryUrl);
        if (res.ok) {
          const json = await res.json();
          const list = json.themes || json;
          themes = list.map(normalizeTheme).filter(Boolean);
        }
      } catch (e) {
        console.warn('[card-carousel-3d] registry fetch failed', e);
        themes = ['aurora','zen','tropico','obsidiana','brutal','deco'].map(id => ({id, label: id[0].toUpperCase()+id.slice(1), templateUrl: `/templates/cards/${id}.html`}));
      }
    }
    return themes;
  }

  function setSelected(themeId, { silent = false } = {}) {
    const prev = root.dataset.cardSelected || root.getAttribute('data-card-selected');
    root.dataset.cardSelected = themeId;
    root.setAttribute('data-card-selected', themeId);

    // sync visual selection on cards
    const cards = Array.from(DOM.track ? DOM.track.querySelectorAll('.card') : []);
    cards.forEach((card, idx) => {
      const name = card.dataset.name;
      const isActive = name === themeId;
      card.dataset.selected = isActive ? 'true' : 'false';
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        activeIndex = idx;
        card.setAttribute('tabindex', '0');
      } else {
        card.setAttribute('tabindex', '-1');
      }
    });

    // sync dots
    if (DOM.dots) {
      Array.from(DOM.dots.children).forEach((d, i) => {
        const active = themes[i] && themes[i].id === themeId;
        d.classList.toggle('active', active);
      });
    }

    if (!silent && prev !== themeId) {
      const theme = themes.find(t => t.id === themeId) || { id: themeId };
      const detail = { themeId, templateUrl: theme.templateUrl, label: theme.label };
      root.dispatchEvent(new CustomEvent('card-theme-selected', { bubbles: true, detail }));
      if (typeof cfg.onSelect === 'function') cfg.onSelect(detail);
    }
  }

  // Build the premium 3D markup (larger cards, perspective wrapper, isolated previews)
  async function renderPremium() {
    await ensureThemes();

    // Ensure track
    let track = root.querySelector('.card-carousel__track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'card-carousel__track';
      root.appendChild(track);
    }
    DOM.track = track;
    track.innerHTML = '';

    // Perspective wrapper (critical for 3D)
    let perspectiveWrap = root.querySelector('.carousel-3d-container');
    if (!perspectiveWrap) {
      perspectiveWrap = document.createElement('div');
      perspectiveWrap.className = 'carousel-3d-container';
      root.insertBefore(perspectiveWrap, track);
    }
    if (track.parentNode !== perspectiveWrap) {
      perspectiveWrap.appendChild(track);
    }

    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    themes.forEach((theme, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.name = theme.id;
      card.dataset.label = theme.label;
      card.dataset.index = index;
      card.setAttribute('role', 'option');
      card.setAttribute('aria-label', theme.label);
      card.tabIndex = -1;

      // Preview host for isolation
      const host = document.createElement('div');
      host.className = 'preview-host';
      card.appendChild(host);

      // Create isolated preview (shadow + signature)
      createIsolatedPreview(theme.id, host, theme);

      // Theme label glass badge
      const labelEl = document.createElement('div');
      labelEl.className = 'theme-label glass';
      labelEl.textContent = theme.label;
      card.appendChild(labelEl);

      // Inert personalization stub (visual + future hook)
      const stub = document.createElement('div');
      stub.className = 'personalize-stub';
      stub.innerHTML = `
        <button type="button" data-action="personalize" aria-disabled="true" title="Personalización avanzada (próximamente)">Personalizar</button>
        <button type="button" data-action="add" aria-disabled="true" title="Añadir variante (próximamente)">Añadir</button>
      `;
      card.appendChild(stub);

      // Click selects
      card.addEventListener('click', () => {
        setSelected(theme.id);
        centerCard(index);
      });

      // Keyboard
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelected(theme.id);
        }
      });

      // Stub clicks for extension points (do not select; future can emit separate event)
      stub.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          // Extension point: dispatch for future personalization panel
          root.dispatchEvent(new CustomEvent('card-personalize-requested', {
            bubbles: true,
            detail: { themeId: theme.id, action }
          }));
          // Visual feedback only (inert)
          btn.style.opacity = '0.5';
          setTimeout(() => { if (btn) btn.style.opacity = '1'; }, 400);
        });
      });

      track.appendChild(card);
    });

    // Premium dots indicator (more visual than bullets for 3D feel)
    if (!DOM.dots) {
      DOM.dots = document.createElement('div');
      DOM.dots.className = 'premium-dots';
      root.appendChild(DOM.dots);
    }
    DOM.dots.innerHTML = '';
    themes.forEach((t, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.addEventListener('click', () => {
        centerCard(i);
        setSelected(themes[i].id);
      });
      DOM.dots.appendChild(dot);
    });

    // Initial selection
    const initial = root.dataset.cardSelected || cfg.selected;
    if (initial) {
      setSelected(initial, { silent: true });
      const idx = themes.findIndex(t => t.id === initial);
      if (idx >= 0) activeIndex = idx;
    }

    // Setup 3D effects + observer (skip heavy 3D when reduced motion)
    setup3DEffects(isReduced);
  }

  function centerCard(index) {
    if (!DOM.track || index < 0 || index >= themes.length) return;
    const cards = Array.from(DOM.track.children);
    const el = cards[index];
    if (!el) return;
    const left = el.offsetLeft - (DOM.track.offsetWidth / 2) + (el.offsetWidth / 2);
    DOM.track.scrollTo({ left, behavior: 'smooth' });
    update3DForIndex(index);
  }

  function setup3DEffects(isReduced) {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (isReduced) {
      // Flat mode: no observer transforms
      update3DForIndex(activeIndex);
      return;
    }

    const options = {
      root: DOM.track,
      threshold: 0.6,
      rootMargin: '0px -40px 0px -40px'
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.index || '0', 10);
          if (activeIndex !== idx) {
            activeIndex = idx;
            update3DForIndex(idx);
            syncDots(idx);
          }
        }
      });
    }, options);

    Array.from(DOM.track.children).forEach(el => observer.observe(el));

    // Initial + scroll live update (for during drag)
    update3DForIndex(activeIndex);

    let ticking = false;
    DOM.track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Find most centered card during scroll for live 3D
        const centerX = DOM.track.scrollLeft + DOM.track.offsetWidth / 2;
        let closest = 0;
        let minDist = Infinity;
        Array.from(DOM.track.children).forEach((c, i) => {
          const cCenter = c.offsetLeft + c.offsetWidth / 2;
          const d = Math.abs(cCenter - centerX);
          if (d < minDist) { minDist = d; closest = i; }
        });
        if (closest !== activeIndex) {
          activeIndex = closest;
          update3DForIndex(closest);
          syncDots(closest);
        }
        ticking = false;
      });
    }, { passive: true });
  }

  function syncDots(index) {
    if (!DOM.dots) return;
    Array.from(DOM.dots.children).forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function update3DForIndex(centerIdx) {
    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(DOM.track ? DOM.track.children : []);
    cards.forEach((card, idx) => {
      const distance = idx - centerIdx;
      card.dataset.distance = distance;

      if (isReduced) {
        card.style.transform = (distance === 0) ? 'scale(1.02)' : 'scale(0.96)';
        card.style.opacity = (Math.abs(distance) > 1) ? '0.6' : '1';
        return;
      }

      // Full 3D (adapted from prototype: no aggressive scale, clean rotateY + translate)
      let transform = 'scale(1) translate3d(0,0,0) rotateY(0deg)';
      let opacity = 1;
      let z = 10;

      if (distance === 0) {
        transform = 'scale(1) translate3d(0,0,0) rotateY(0deg)';
        opacity = 1; z = 10;
      } else if (distance === 1) {
        transform = 'scale(1) translate3d(18px,0,0) rotateY(-14deg)';
        opacity = 0.65; z = 5;
      } else if (distance === -1) {
        transform = 'scale(1) translate3d(-18px,0,0) rotateY(14deg)';
        opacity = 0.65; z = 5;
      } else if (distance > 1) {
        transform = `scale(1) translate3d(${32 + (distance-2)*12}px,0,0) rotateY(-22deg)`;
        opacity = 0.25; z = 1;
      } else {
        transform = `scale(1) translate3d(${-32 + (distance+2)*12}px,0,0) rotateY(22deg)`;
        opacity = 0.25; z = 1;
      }

      card.style.transform = transform;
      card.style.opacity = opacity;
      card.style.zIndex = z;
    });
  }

  // Public API (mirrors v2 for drop-in)
  root.setSelectedTheme = (id) => {
    const idx = themes.findIndex(t => t.id === id);
    if (idx >= 0) {
      centerCard(idx);
    }
    setSelected(id);
  };
  root.getSelectedTheme = () => root.dataset.cardSelected;
  root.refresh = async () => {
    themes = [];
    await renderPremium();
  };

  // Keyboard arrows on root (focusable)
  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (e) => {
    const current = root.dataset.cardSelected;
    const idx = themes.findIndex(t => t.id === current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const next = themes[(idx + 1) % themes.length];
      if (next) { setSelected(next.id); centerCard((idx + 1) % themes.length); }
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const prev = themes[(idx - 1 + themes.length) % themes.length];
      if (prev) { setSelected(prev.id); centerCard((idx - 1 + themes.length) % themes.length); }
      e.preventDefault();
    }
    if (e.key === 'Home') { setSelected(themes[0]?.id); centerCard(0); e.preventDefault(); }
    if (e.key === 'End') { const last = themes.length-1; setSelected(themes[last]?.id); centerCard(last); e.preventDefault(); }
  });

  // Initial render
  renderPremium().then(() => {
    // Ensure initial 3D state after paint
    requestAnimationFrame(() => {
      const initIdx = themes.findIndex(t => t.id === (root.dataset.cardSelected || cfg.selected));
      if (initIdx >= 0) update3DForIndex(initIdx);
    });
  });

  root._destroyPremium = () => {
    root._premiumEnhanced = false;
    if (observer) observer.disconnect();
  };

  return root;
}

// Exported entry (called via dynamic import from main carousel when advanced requested)
export function initPremiumCardCarousel(rootElement, options = {}) {
  if (!rootElement) return null;
  return enhancePremiumCarousel(rootElement, options);
}

// Also expose the helper for external / testing use
export { createIsolatedPreview };
