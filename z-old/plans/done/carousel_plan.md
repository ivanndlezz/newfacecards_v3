# Carousel Enhancement Plan

## Goal
Create a focused carousel that **only displays the themes the user owns**, removes infinite looping, starts at the leftmost card and ends at the rightmost card. When the user reaches the right edge, two extra cards must always be present:
1. **"Buscar más themes"** – opens the Theme Store where the user can browse and purchase additional themes.
2. **"Empezar en blanco"** – starts a new blank theme (default/placeholder).

The carousel should be **non‑circular** (no wrap‑around) and must work with the existing `card-carousel-latest.css` styles.

---

## Open Questions
- Should the "Buscar más themes" navigation open a new page (`/theme-store.html`) or open an overlay within the current page?
- Is the blank theme a special theme ID (`blank`) that should be added to `ThemeService` as a free placeholder?
- Do we need to persist the *last viewed* carousel position in `localStorage`?

---

## Proposed Changes
### 1. Data Model (`theme-service.js`)
- Extend `ThemeService.getAllThemes()` to **filter only owned themes** (`isOwned(id)`).
- Add two virtual theme objects:
  ```js
  const VIRTUAL_THEMES = [
    {
      id: "search-store",
      label: "Buscar más themes",
      virtual: true,
      action: "openStore",
    },
    {
      id: "blank",
      label: "Empezar en blanco",
      virtual: true,
      action: "startBlank",
    },
  ];
  ```
- The carousel will render `ownedThemes.concat(VIRTUAL_THEMES)`.

### 2. Carousel Manager (`carousel-manager.js`)
- **Remove circular index arithmetic**. Use a simple integer `currentIndex` bounded by `0 <= currentIndex < cards.length`.
- Add navigation helpers:
  - `next()` – increments if not at last index.
  - `prev()` – decrements if not at first index.
- Update `updateClasses()` to apply these classes:
  - `profile-card--active` – current card.
  - `profile-card--prev` – left neighbor (if exists).
  - `profile-card--next` – right neighbor (if exists).
  - No wrap‑around, hidden otherwise.
- When rendering, detect `card.virtual` and attach appropriate click handlers:
  - `openStore` → `window.location.href = '/theme-store.html';`
  - `startBlank` → `ThemeService.setCurrentTheme('blank'); CarouselManager.close();`

### 3. UI Markup (HTML template)
- No changes needed in the main page; the carousel manager will generate DOM elements programmatically.
- Ensure CSS classes used (`profile-card--prev`, `--next`, `--active`, `--hidden`) exist – they already do from previous implementation.

### 4. CSS Adjustments (`card-carousel-latest.css`)
- Verify that hidden cards are not clickable. Add:
  ```css
  .profile-card--hidden { pointer-events: none; opacity: 0.5; }
  ```
- Optionally style the virtual cards differently (e.g., dashed border) by adding a selector:
  ```css
  .profile-card.virtual { border: 2px dashed var(--accent-color); }
  ```

### 5. Integration Steps
1. **Create/modify `theme-service.js`** to include virtual themes and filter owned list.
2. **Update `carousel-manager.js`** with new navigation logic and virtual‑card handling.
3. **Add CSS tweaks** to `card-carousel-latest.css` (pointer‑events, virtual styling).
4. **Test flow**:
   - Open the appearance overlay → carousel shows only owned theme cards plus the two virtual cards at the far right.
   - Clicking left/right arrows (or swiping) moves the index; when at the last owned theme, the next click selects "Buscar más themes" then "Empezar en blanco".
   - Verify that clicking "Buscar más themes" redirects to the Theme Store.
   - Verify that clicking "Empezar en blanco" sets the theme to `blank` and closes the carousel.
5. **Persist state** (optional) – store `currentIndex` in `localStorage` under `CAROUSEL_POS_KEY` so the carousel re‑opens at the same spot.

---

## Verification Plan
- **Automated**: Run a headless browser script that loads `index.html`, triggers the appearance mode, and checks that the DOM contains exactly `ownedThemes.length + 2` cards.
- **Manual**: Open the page in a browser, press the "Perfil" button, navigate using arrows, ensure no infinite loop, and test both virtual cards.

---

## Next Steps
- Await user confirmation on the open questions (store navigation method, blank theme handling, persisting position).
- Once approved, create the new module files and update the CSS.
