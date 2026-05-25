const CSS_HREF = '/shared/components/appearance-editor/appearance-editor.css';
function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[href*="${CSS_HREF.split('/').pop()}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  document.head.appendChild(link);
}
const THEMES = [
  { id: 'aurora', label: 'Aurora', accent: '#a855f7', font: 'Josefin Sans' },
  { id: 'zen', label: 'Zen', accent: '#c0392b', font: 'Noto Serif JP' },
  { id: 'tropico', label: 'Tropico', accent: '#f4d03f', font: 'Syne' },
  { id: 'obsidiana', label: 'Obsidiana', accent: '#0ea5e9', font: 'DM Sans' },
  { id: 'brutal', label: 'Brutal', accent: '#f59e0b', font: 'Bebas Neue' },
  { id: 'deco', label: 'Deco', accent: '#d4a843', font: 'Cinzel Decorative' }
];
const DEFAULT_FONTS = ['Josefin Sans', 'Playfair Display', 'Space Mono', 'Syne'];
const SWATCHES = ['#a855f7', '#c0392b', '#f4d03f', '#0ea5e9', '#f59e0b', '#d4a843', '#22c55e', '#ec4899', '#6366f1', '#14b8a6'];
function isReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function createElement(tag, cls, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html != null) el.innerHTML = html;
  return el;
}
function createHighFidelityPreview(themeId, host, overrides = {}) {
  if (!host) return;
  host.innerHTML = '';
  const t = THEMES.find(x => x.id === themeId) || THEMES[0];
  const accent = overrides.accentColor || t.accent;
  const font = overrides.font || t.font;
  let inner = '';
  if (themeId === 'aurora') {
    inner = `<div style="width:100%;height:100%;background:radial-gradient(ellipse 80% 60% at 20% 10%, rgba(168,85,247,.42) 0%,transparent 60%),radial-gradient(ellipse 70% 50% at 80% 30%, rgba(59,130,246,.38) 0%,transparent 55%),radial-gradient(ellipse 60% 70% at 50% 80%, rgba(236,72,153,.32) 0%,transparent 60%),#0f0c1e;position:relative;overflow:hidden"><div style="padding:28px 16px 10px;text-align:center"><div style="width:68px;height:68px;border-radius:50%;margin:0 auto 10px;border:2px solid ${accent};box-shadow:0 0 0 5px ${accent}22;background:#222"></div><div style="font-family:'Fraunces',Georgia,serif;font-size:21px;font-weight:700;color:#fff;letter-spacing:-.025em;line-height:.92">Jane <em style="font-style:italic;background:linear-gradient(135deg,#c084fc,#818cf8,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Doe</em></div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:#c084fc;margin-top:3px;opacity:.8">Product Designer</div></div><div style="position:absolute;bottom:18px;left:50%;transform:translateX(-50%);display:flex;gap:10px;opacity:.6"><span style="font-size:11px">in</span><span style="font-size:11px">✕</span><span style="font-size:11px">◎</span></div></div>`;
  } else if (themeId === 'zen') {
    inner = `<div style="width:100%;height:100%;background:#fefcf8;position:relative;border-left:3px solid ${accent}"><div style="height:118px;background:linear-gradient(#ddd,#f4f1e9);filter:saturate(.6)"></div><div style="position:absolute;top:78px;left:50%;transform:translateX(-50%);width:62px;height:62px;border:1px solid #1c181122;background:#e8e0d0"></div><div style="padding:62px 14px 8px;text-align:center;font-family:'Noto Serif JP',serif"><div style="font-size:15px;color:#1c1811;letter-spacing:.08em">山田 太郎</div><div style="font-size:8.5px;color:${accent};margin-top:1px;letter-spacing:.16em">ENGINEER</div></div><div style="position:absolute;bottom:12px;left:0;right:0;height:22px;background:rgba(254,252,248,.9);display:flex;align-items:center;justify-content:space-around;font-size:8px;color:#9a8e7e;border-top:1px solid #1c181122"><span>一</span><span>二</span><span>三</span></div></div>`;
  } else if (themeId === 'tropico') {
    inner = `<div style="width:100%;height:100%;background:#0f3326;position:relative;border-top:4px solid ${accent}"><div style="height:108px;background:linear-gradient(#3a2a1a,#0f3326);filter:saturate(1.25)"></div><div style="position:absolute;top:72px;left:50%;transform:translateX(-50%);width:62px;height:62px;border-radius:50%;border:3px solid ${accent};background:#222"></div><div style="padding:68px 12px 6px;text-align:center"><div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:${accent};letter-spacing:-.01em;text-transform:uppercase">LUNA RIOS</div><div style="font-size:8px;color:#f4d03f;margin-top:2px;letter-spacing:.14em">CREATIVE</div></div><div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:4px"><div style="font-size:7px;background:#f4d03f22;color:#f4d03f;padding:1px 5px;border-radius:3px">SUN</div></div></div>`;
  } else if (themeId === 'obsidiana') {
    inner = `<div style="width:100%;height:100%;background:rgba(255,255,255,.035);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.07);position:relative"><div style="height:102px;background:linear-gradient(rgba(9,11,16,0),#090b10);opacity:.6"></div><div style="position:absolute;top:66px;left:18px;width:54px;height:54px;border-radius:12px;border:2px solid ${accent};background:#222"></div><div style="padding:54px 14px 6px 72px"><div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:#fff;letter-spacing:-.015em">Alex Rivera</div><div style="font-size:8px;color:#64748b;margin-top:1px;letter-spacing:.1em">FOUNDER</div></div><div style="position:absolute;bottom:12px;left:14px;right:14px;display:flex;gap:4px"><div style="flex:1;height:14px;background:rgba(255,255,255,.06);border-radius:3px"></div><div style="flex:1;height:14px;background:rgba(255,255,255,.06);border-radius:3px"></div></div></div>`;
  } else if (themeId === 'brutal') {
    inner = `<div style="width:100%;height:100%;background:#f0ece2;position:relative"><div style="height:132px;background:#222;filter:grayscale(1) contrast(1.15)"></div><div style="position:absolute;top:102px;left:16px;width:46px;height:46px;background:#ddd;border:3px solid #f0ece2;filter:grayscale(1)"></div><div style="padding:106px 12px 6px 70px;font-family:'Bebas Neue',sans-serif"><div style="font-size:18px;color:#111;letter-spacing:.01em;line-height:1">BRUTAL</div><div style="font-size:7px;color:#666;margin-top:-1px;letter-spacing:.12em">STUDIO</div></div><div style="position:absolute;bottom:10px;left:12px;right:12px;height:18px;background:#111;display:flex;gap:3px;align-items:center;padding:0 6px"><div style="font-size:6px;color:#f0ece244;letter-spacing:.08em">01 02 03</div></div></div>`;
  } else {
    inner = `<div style="width:100%;height:100%;background:#120f08;position:relative;border:1px solid #d4a84333"><div style="height:106px;background:#222"></div><div style="position:absolute;top:68px;left:50%;transform:translateX(-50%);width:58px;height:58px;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);background:#222;outline:2px solid ${accent};outline-offset:2px"></div><div style="padding:62px 10px 4px;text-align:center;font-family:'Cinzel Decorative',serif"><div style="font-size:13px;color:#d4a843;letter-spacing:.06em">ATELIER</div><div style="font-size:8px;color:#d4a84388;margin-top:1px;letter-spacing:.18em">PARIS</div></div><div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:8px;color:#d4a84344">◆ ◇ ◆</div></div>`;
  }
  const wrap = createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;font-family:' + font + ',system-ui';
  wrap.innerHTML = inner;
  host.appendChild(wrap);
  host._previewTheme = themeId;
  host._lastOverrides = { ...overrides };
  applyAccentToPreview(host, accent);
}
function applyAccentToPreview(host, accent) {
  if (!host || !accent) return;
  host.querySelectorAll('[style*="border"]').forEach(el => { if (el.style.borderColor) el.style.borderColor = accent; });
  host.querySelectorAll('em,[style*="background:linear-gradient"]').forEach(el => { el.style.background = `linear-gradient(135deg, ${accent}, #fff)`; });
}
function updatePreview(host, overrides) {
  if (!host || !host._previewTheme) return;
  const t = THEMES.find(x => x.id === host._previewTheme) || THEMES[0];
  const accent = overrides.accentColor || t.accent;
  const font = overrides.font || t.font;
  createHighFidelityPreview(host._previewTheme, host, overrides);
  if (font) host.style.fontFamily = font + ', system-ui';
}
function update3DEffects(cards, activeIndex, reduced) {
  cards.forEach((card, i) => {
    const d = i - activeIndex;
    let tx = 'translate3d(0,0,0) rotateY(0deg)';
    let op = '1';
    let z = '10';
    if (d === 1) { tx = 'translate3d(18px,0,0) rotateY(-13deg)'; op = '0.55'; z = '5'; }
    else if (d === -1) { tx = 'translate3d(-18px,0,0) rotateY(13deg)'; op = '0.55'; z = '5'; }
    else if (d > 1) { tx = 'translate3d(44px,0,0) rotateY(-22deg)'; op = '0.18'; z = '1'; }
    else if (d < -1) { tx = 'translate3d(-44px,0,0) rotateY(22deg)'; op = '0.18'; z = '1'; }
    if (reduced) { tx = 'none'; op = (d === 0 ? '1' : '0.4'); }
    card.style.transform = tx;
    card.style.opacity = op;
    card.style.zIndex = z;
  });
}
function setupScroller(scroller, cardEls, onChange) {
  const reduced = isReducedMotion();
  let active = 0;
  let raf = null;
  function findActive() {
    let best = 0;
    let minDist = Infinity;
    const scW = scroller.offsetWidth;
    cardEls.forEach((c, i) => {
      const rect = c.getBoundingClientRect();
      const scRect = scroller.getBoundingClientRect();
      const dist = Math.abs((rect.left + rect.width / 2) - (scRect.left + scW / 2));
      if (dist < minDist) { minDist = dist; best = i; }
    });
    return best;
  }
  function onScroll() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const idx = findActive();
      if (idx !== active) {
        active = idx;
        update3DEffects(cardEls, active, reduced);
        onChange(active);
      }
    });
  }
  scroller.addEventListener('scroll', onScroll, { passive: true });
  const obs = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting) {
        const idx = cardEls.indexOf(e.target);
        if (idx >= 0 && idx !== active) {
          active = idx;
          update3DEffects(cardEls, active, reduced);
          onChange(active);
        }
      }
    });
  }, { root: scroller, threshold: 0.55, rootMargin: '0px -40px 0px -40px' });
  cardEls.forEach(c => obs.observe(c));
  requestAnimationFrame(() => update3DEffects(cardEls, active, reduced));
  return { getActive: () => active, setActive: (i) => { active = i; update3DEffects(cardEls, i, reduced); onChange(i); }, destroy: () => obs.disconnect() };
}
export async function openAppearanceEditor(opts = {}) {
  injectCSS();
  const reduced = isReducedMotion();
  const currentId = opts.currentTheme || localStorage.getItem('APP_THEME_SELECTED') || 'aurora';
  const onApply = opts.onApply || (() => {});
  const onClose = opts.onClose || (() => {});
  let overlay = createElement('div', 'appearance-editor-overlay');
  const sheet = createElement('div', 'appearance-editor-sheet' + (reduced ? ' reduced-motion' : ''));
  const header = createElement('div', 'appearance-editor-header');
  const btnCancel = createElement('button', '', 'Cancelar');
  const title = createElement('div', 'ae-title', 'APARIENCIA');
  const btnDone = createElement('button', '', 'Listo');
  header.append(btnCancel, title, btnDone);
  const carouselWrap = createElement('div', 'appearance-editor-carousel');
  const container = createElement('div', 'ae-carousel-container');
  const scroller = createElement('div', 'ae-scroller no-scrollbar');
  container.appendChild(scroller);
  carouselWrap.appendChild(container);
  const dots = createElement('div', 'ae-dots');
  const bottom = createElement('div', 'ae-bottom-bar');
  const btnPers = createElement('button', 'ae-btn-personalize', 'Personalizar');
  const btnAdd = createElement('button', 'ae-btn-add', '<i class="ti ti-plus"></i>');
  bottom.append(btnPers, btnAdd);
  const personalize = createElement('div', 'ae-personalize-sheet');
  const persHeader = createElement('div', 'ae-personalize-header');
  persHeader.innerHTML = `<span class="ae-label">Personalización</span>`;
  const persClose = createElement('div', 'ae-close-btn', '<i class="ti ti-x"></i>');
  persHeader.appendChild(persClose);
  const persBody = createElement('div');
  persBody.innerHTML = `
    <div class="ae-section"><div class="ae-section-title">FUENTE</div><div class="ae-font-grid" id="ae-fonts"></div></div>
    <div class="ae-section"><div class="ae-section-title">COLOR DE ACENTO</div><div class="ae-color-grid" id="ae-colors"></div></div>
    <div class="ae-custom-color-row"><input type="color" id="ae-custom" value="#a855f7"><input type="text" id="ae-custom-hex" value="#a855f7" placeholder="#hex"></div>
  `;
  personalize.append(persHeader, persBody);
  sheet.append(header, carouselWrap, dots, bottom, personalize);
  overlay.appendChild(sheet);
  document.body.appendChild(overlay);
  if (!reduced) document.body.classList.add('appearance-editor-dim');
  const cards = [];
  const previewHosts = [];
  let activeIndex = THEMES.findIndex(t => t.id === currentId);
  if (activeIndex < 0) activeIndex = 0;
  let currentOverrides = { font: null, accentColor: null };
  THEMES.forEach((t, idx) => {
    const card = createElement('div', 'ae-card');
    card.dataset.theme = t.id;
    const host = createElement('div', 'ae-preview-host');
    host.style.cssText = 'position:absolute;inset:0;';
    createHighFidelityPreview(t.id, host, currentOverrides);
    card.appendChild(host);
    const lbl = createElement('div', 'ae-card-label', t.label);
    card.appendChild(lbl);
    card.addEventListener('click', () => {
      centerCard(idx);
    });
    scroller.appendChild(card);
    cards.push(card);
    previewHosts.push(host);
    const dot = createElement('div', 'ae-dot' + (idx === activeIndex ? ' active' : ''));
    dot.addEventListener('click', () => centerCard(idx));
    dots.appendChild(dot);
  });
  let scrollerCtrl = setupScroller(scroller, cards, (idx) => {
    dots.querySelectorAll('.ae-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    activeIndex = idx;
  });
  function centerCard(idx) {
    if (idx < 0 || idx >= cards.length) return;
    activeIndex = idx;
    const card = cards[idx];
    const left = card.offsetLeft - (scroller.offsetWidth / 2) + (card.offsetWidth / 2);
    scroller.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
    dots.querySelectorAll('.ae-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    scrollerCtrl.setActive(idx);
  }
  setTimeout(() => centerCard(activeIndex), 60);
  let panelOpen = false;
  function openPersonalize() {
    personalize.classList.add('open');
    panelOpen = true;
    renderPersonalizeControls();
  }
  function closePersonalize() {
    personalize.classList.remove('open');
    panelOpen = false;
  }
  function renderPersonalizeControls() {
    const fontGrid = personalize.querySelector('#ae-fonts');
    const colorGrid = personalize.querySelector('#ae-colors');
    const custom = personalize.querySelector('#ae-custom');
    const customHex = personalize.querySelector('#ae-custom-hex');
    fontGrid.innerHTML = '';
    DEFAULT_FONTS.forEach(f => {
      const b = createElement('button', 'ae-font-btn' + (currentOverrides.font === f ? ' active' : ''), 'Aa');
      b.title = f;
      b.style.fontFamily = f;
      b.addEventListener('click', () => {
        currentOverrides.font = f;
        applyLiveOverrides();
        renderPersonalizeControls();
      });
      fontGrid.appendChild(b);
    });
    colorGrid.innerHTML = '';
    SWATCHES.forEach(c => {
      const s = createElement('div', 'ae-color-swatch' + (currentOverrides.accentColor === c ? ' active' : ''));
      s.style.background = c;
      s.addEventListener('click', () => {
        currentOverrides.accentColor = c;
        custom.value = c;
        customHex.value = c;
        applyLiveOverrides();
        renderPersonalizeControls();
      });
      colorGrid.appendChild(s);
    });
    custom.value = currentOverrides.accentColor || '#a855f7';
    customHex.value = currentOverrides.accentColor || '#a855f7';
    custom.oninput = () => {
      currentOverrides.accentColor = custom.value;
      customHex.value = custom.value;
      applyLiveOverrides();
    };
    customHex.oninput = () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(customHex.value)) {
        currentOverrides.accentColor = customHex.value;
        custom.value = customHex.value;
        applyLiveOverrides();
      }
    };
  }
  function applyLiveOverrides() {
    const host = previewHosts[activeIndex];
    if (host) updatePreview(host, currentOverrides);
    if (opts.livePatchCard && window.__adminBinder) {
      const liveCard = document.querySelector('#card');
      if (liveCard) {
        liveCard.style.setProperty('--live-accent', currentOverrides.accentColor || '');
        if (currentOverrides.font) liveCard.style.fontFamily = currentOverrides.font + ', system-ui';
      }
    }
  }
  function applySelection() {
    const themeId = THEMES[activeIndex].id;
    const ov = { ...currentOverrides };
    if (ov.font) localStorage.setItem('APP_THEME_FONT', ov.font);
    if (ov.accentColor) localStorage.setItem('APP_THEME_ACCENT', ov.accentColor);
    onApply(themeId, ov);
    closeEditor(true);
  }
  function closeEditor(saved) {
    if (scrollerCtrl) scrollerCtrl.destroy();
    overlay.remove();
    document.body.classList.remove('appearance-editor-dim');
    closePersonalize();
    onClose(saved);
  }
  btnCancel.addEventListener('click', () => closeEditor(false));
  btnDone.addEventListener('click', applySelection);
  btnPers.addEventListener('click', () => {
    if (panelOpen) closePersonalize(); else openPersonalize();
  });
  btnAdd.addEventListener('click', () => {
    const t = createElement('div', 'ae-toast', 'Añadir imagen: disponible en futura versión');
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 200); }, 1600);
  });
  persClose.addEventListener('click', closePersonalize);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEditor(false);
  });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', esc);
      closeEditor(false);
    }
    if ((e.key === 'Enter' || e.key === ' ') && !panelOpen) {
      e.preventDefault();
      applySelection();
    }
  }, { once: true });
  if (reduced) {
    scroller.style.scrollSnapType = 'none';
  }
  return {
    close: () => closeEditor(false),
    apply: () => applySelection(),
    updateActivePreview: (o) => { Object.assign(currentOverrides, o || {}); applyLiveOverrides(); }
  };
}
