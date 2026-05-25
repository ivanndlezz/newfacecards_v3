# Card Carousel

Reusable, framework-agnostic horizontal scroll + bullet (and premium 3D) theme selector for card appearance.

**v3 Premium mode** delivers the high-fidelity 3D experience (perspective transforms, IntersectionObserver depth, glassmorphism, isolated previews) while preserving the exact same public API and `card-theme-selected` contract.

## Usage

### HTML (progressive enhancement)
```html
<div data-component="card-carousel" data-card-selected="aurora">
  <!-- optional static cards; JS will enhance or render -->
  <div class="card-carousel__track">
    <div class="card" data-name="aurora"></div>
    ...
  </div>
</div>
<script type="module">
  import { initCardCarousel } from '/shared/components/card-carousel/card-carousel.js';
  // auto-enhances on DOMContentLoaded if data-component present
</script>
```

### Imperative (recommended for SPA/admin)
```js
import { initCardCarousel } from '/shared/components/card-carousel/card-carousel.js';

const carouselRoot = document.getElementById('my-carousel');
const carousel = initCardCarousel(carouselRoot, {
  themes: [ /* from registry or hardcoded */ ],
  selected: 'zen',
  onSelect: (detail) => { console.log(detail.themeId); }
});

// Later:
carousel.setSelectedTheme('brutal');
```

### Premium 3D Mode (Card Carousel 3)
```js
const premium = initCardCarousel(root, {
  advanced: true,                    // loads the rich renderer via dynamic import
  selected: 'aurora',
  onSelect: (d) => { /* same payload */ }
});
// Also supported declaratively: <div data-component="card-carousel" data-carousel-advanced>
```

Premium features:
- 3D perspective + distance-based rotateY/translate3d (adapted from the inspirational prototype)
- IntersectionObserver + live scroll-driven depth for buttery performance
- Runtime **isolated** mini-renders via `createIsolatedPreview` (shadow DOM + per-theme scoped signatures — zero leakage into main document or binder targets)
- Glassmorphism tokens + micro-interactions
- Inert "Personalizar / Añadir" visual stubs that dispatch `card-personalize-requested` for future extension points
- Full keyboard parity, touch snap, and **complete disable** of all 3D transforms under `prefers-reduced-motion`

## Events
- `card-theme-selected` (bubbles): `{ themeId, templateUrl, label }` — **identical contract** in both modes
- `card-personalize-requested` (bubbles, premium only): `{ themeId, action }` — extension hook

## Theming & Previews
- Standard: CSS gradients + motifs per `data-name`
- Premium: high-fidelity isolated previews (shadow + signature visuals drawn from the 6 canonical `templates/cards/*.html`)
- Long-term sync strategy: dedicated helper allows future upgrade to fetch real template + selector rewrite without touching the live binder DOM

## Accessibility & Reduced Motion
- Arrow / Home / End + click / tap support in both modes
- ARIA roles, aria-selected, roving tabindex on cards
- `prefers-reduced-motion: reduce` → premium mode **completely flattens** (no perspective, no rotateY, no scale jumps) per plan requirements
- Focus-visible rings preserved

## Integration Notes (Critical)
- **Must** live **outside** any binder `container` (see `binder.js:257` — unconditional `innerHTML =` destroys live children).
- Advanced renderer is **lazy-loaded** via dynamic `import()` only on first use of `advanced: true` (performance budget respected).
- Same lazy pattern used by admin "Apariencia" flow + `window.__setCardTheme`.
- Self-contained CSS injection (checks for existing link before append) — zero build step.
- Registry: `/data/themes.json` (or pass explicit `themes` array).

See also:
- `card-carousel-3.html` — spectacular standalone premium demo (now powered by immersive editor)
- `shared/components/appearance-editor/` — full-overlay WYSIWYG editor (replaces small 3D thumbnails for the desired emotional scale; core live font/accent)
- `admin/user/ivangonzalez/index.html` — real production integration (island + binder bridge)

The small thumbnail 3D renderer remains for non-immersive fallback cases. The immersive path is the north star matching card-carousel-2.html.

Part of the newfacecards v3 shared component system (alongside island-menu, binder).
