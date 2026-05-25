# appearance-editor

Immersive full-overlay WYSIWYG appearance editor for the 6 production NFC card themes.

- Direct port of emotional scale + interaction model from `card-carousel-2.html`
- Large tall previews (260×420) with rich hero slices (recognizable mesh, avatars, typography, decor)
- Live core personalization: font family + accent color mutate active carousel preview + optional live #card patch
- 3D perspective scroller (rotateY + translate3d, no focus scale), IntersectionObserver + raf, reduced-motion safe
- Glassmorphism, Tabler icons only, vanilla, self-contained CSS/JS injection
- "Elegido" represented by persistent live binder `#card`; editor = "Seleccionando" state
- Emits no new contracts; integrates via `__applyCardTheme(themeId, {font?, accentColor?})`

## Usage (admin)

```js
const { openAppearanceEditor } = await import('/shared/components/appearance-editor/appearance-editor.js');
openAppearanceEditor({
  currentTheme: 'zen',
  livePatchCard: true,
  onApply(themeId, overrides) { window.__applyCardTheme(themeId, overrides); }
});
```

## Preview Fragments Strategy

Curated hero slices (top ~65%) hand-maintained in `templates/cards/previews/`.
Renderer embeds faithful signatures for instant recognition + fast no-network load.
Long-term: runtime extraction path documented in plan.

## Maintenance Checklist (when templates evolve)

- [ ] Sync avatar treatment / proportions / key decorative lines
- [ ] Update gradient or color variables used in hero
- [ ] Verify font stack still renders legibly at preview scale
- [ ] Test live accent + font override on the 6 previews

## Status

Phase 5 complete (immersive editor + live core WYSIWYG + demo). Full a11y/perf pass in Phase 6.

Replaces previous small thumbnail 3D renderer for the premium "Apariencia" flow.
