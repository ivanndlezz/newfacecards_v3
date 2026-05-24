# island-menu

Modern, reusable floating action island (toolbar) for NewFaceCards profiles and admin pages.

- **Zero dependencies** (vanilla ES Module + Web Component)
- **Scoped** — no global `getElementById`, works with multiple instances or any depth
- **Plug & play** — `position:fixed` by default + auto-injects its CSS and Tabler Icons
- **Event-driven** — host pages listen to `CustomEvent`s instead of tight coupling
- **Dual usage** — declarative `<island-menu>` or legacy `div[data-component="island"]` (auto-enhanced)

## 30-second copy-paste for a new profile (`user/<slug>/index.html`)

```html
<!-- 1. Tabler (icons) - optional if you trust auto-injection -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css">

<!-- 2. The component script (root-relative path works from ANY folder depth) -->
<script type="module" src="/shared/components/island-menu/island-menu.js"></script>

<!-- 3. Markup (or use the custom element <island-menu>) -->
<div data-component="island" data-status="idle" role="toolbar" aria-label="Barra de acciones">
  <button data-role="sat-left" aria-label="Confirmar y volver"><i class="ti ti-check"></i></button>
  <div data-role="primary">
    <button data-role="btn-edit"><i class="ti ti-edit"></i><span>Editar</span></button>
    <div data-role="mode-group">
      <button data-role="mode-opt" data-value="apariencia" data-active="false"><i class="ti ti-palette"></i> Apariencia</button>
      <button data-role="mode-opt" data-value="cardbar" data-active="false"><i class="ti ti-layout-columns"></i> Navegacion</button>
    </div>
  </div>
  <button data-role="sat-right" aria-label="Más opciones">
    <i class="ti ti-plus" data-icon="plus"></i>
    <i class="ti ti-dots" data-icon="dots"></i>
  </button>
</div>
```

That's it. The island floats at bottom center on any page. Buttons work. No path tweaking.

## Usage

### Declarative (recommended)

```html
<island-menu data-status="idle">
  <!-- full inner markup with data-role children exactly as above -->
</island-menu>
<script type="module" src="/shared/.../island-menu.js"></script>
```

The custom element auto-enhances its light DOM children.

### Imperative / legacy divs

Any existing `<div data-component="island">` is **automatically enhanced** when the module loads (no code change required in admin binder etc.).

Or manually:

```js
import { initIsland } from '/shared/components/island-menu/island-menu.js';
initIsland(document.querySelector('[data-component="island"]'));
```

## Public API

### Methods (attached to the root element)

- `el.setStatus('idle' | 'edit')`
- `el.setActiveMode('apariencia' | 'cardbar' | null)`

### Events (bubbled CustomEvents)

- `island-action` → `{ type: 'add' | 'more-options', status }`
- `island-mode-change` → `{ mode: string | null, previous }`
- `island-status-change` → `{ status, previous }`

Listen anywhere:

```js
island.addEventListener('island-action', (e) => {
  if (e.detail.type === 'add') { /* open create flow */ }
});
```

## Dynamic templates & `importIslandMenu`

The loader supports two forms for the first argument:

- **Object config** (for default / classic island):
  ```js
  import { importIslandMenu } from '/shared/components/island-menu/island-menu.js';
  const island = await importIslandMenu({
    edit: { label: 'Editar', icon: 'ti ti-edit' },
    modes: [
      { value: 'apariencia', label: 'Apariencia', icon: 'ti ti-palette' },
      { value: 'cardbar', label: 'Navegación', icon: 'ti ti-layout-columns' }
    ]
  });
  ```

- **URL to .html fragment** (for context-specific variants, e.g. admin "more-options" morph):
  ```js
  // After satellite "more-options" in edit mode:
  importIslandMenu('/shared/components/island-menu/templates/app-edit.html');
  // or the shipped default:
  // importIslandMenu('/shared/components/island-menu/templates/default.html');
  ```

After any `importIslandMenu` call the target element's `innerHTML` is replaced, `data-component="island"` (and role/aria) are asserted, previous enhancement is torn down, and `enhanceIsland` is re-run. All `CustomEvent`s continue to fire and host listeners on the stable root element keep working (no re-attachment required).

See `admin/user/ivangonzalez/index.html` for a live two-phase example (initial object-config bootstrap + runtime URL morph).

## Decisions on the 6 open questions (2026-05-22)

1. **Auto-injection**: Yes (enabled by default). JS injects CSS + Tabler at module load time if missing. Manual `<link>` + `<script>` still works and is shown in examples as the explicit path. Duplicate guards prevent double loads.
2. **Demo positioning**: Uses `data-position="static"` + minimal inline styles in `island-spa.html`. The shared component CSS no longer pollutes `body` with flex centering.
3. **Tabler**: Both documented in README + auto-injected. Public profiles only need to ensure icons look good; the module covers the case when forgotten.
4. **Public integration**: Done immediately in `user/ivangonzalez/index.html` (and admin). "Editar" + satellite now have real (playful) host reactions via events.
5. **Tag name**: `<island-menu>` (clear, matches folder, future-proof). Legacy `data-component="island"` continues to work.
6. **Events vs callbacks**: Pure `CustomEvent` system (host pages use `addEventListener`). No options object on `initIsland` for simplicity and web-standards alignment.

## File layout

```
shared/components/island-menu/
├── island-menu.css
├── island-menu.js
├── templates/
│   ├── default.html   # classic buttons (file-based)
│   └── app-edit.html  # Perfil/Navegacion variant (used by admin morph)
├── island-spa.html
└── README.md
```

All assets use `/shared/...` root-relative URLs → works in `user/foo/`, `admin/bar/`, future nested sections without changes.

## Future / Post-MVP

- Slots for fully custom buttons
- `data-position="static|fixed"` toggle via attribute
- When bundler is introduced, publish as npm package

## Verification

After adding to a page:
- Island appears floating bottom-center
- Edit toggles satellite and mode group
- Modes toggle active state
- Escape exits edit mode
- Events are emitted and reachable from host script
- Works after copy to a brand new `user/newuser/` folder

The component is now the first truly reusable piece of `newfacecards_v3`.
