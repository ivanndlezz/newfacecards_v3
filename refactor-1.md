Viewed card-carousel-latest.css:69-114
Edited card-carousel-latest.css
Edited card-carousel-latest.css

**File:** `implementation_plan.md` (artifact)

# Refactor Theme & Carousel Logic – Apply SOLID, SRP, SoC, DRY, and a Single Source of Truth

## Goal Description

The current `admin/user/ivangonzalez/index.html` script mixes many responsibilities:

- Data‑binding with `DataBinder`
- Theme storage (constants, `localStorage` keys, theme list, purchase simulation)
- Carousel UI rendering and interaction
- Island‑menu handling and mode switching

This monolithic file violates **SOLID** (especially SRP, OCP, DIP), **Separation of Concerns**, and **DRY** (the same constants and theme data are repeated).  
The aim is to **extract reusable, single‑purpose modules**, expose a clean API for theme handling, and keep the UI modules pure. After the refactor the page should:

- Open the “Apariencia” overlay on the _first_ click without errors.
- Persist and retrieve the selected theme and overrides reliably.
- Remain fully functional with the existing CSS/HTML assets.
- Avoid any further “Cannot redeclare block‑scoped variable” or “ReferenceError” issues.

## User Review Required

> **[!IMPORTANT]** Review the module breakdown and the proposed API. Confirm whether you prefer to keep everything in a single HTML file (no extra network requests) or allow separate `.js` modules (recommended). Let me know if you need any additional helper functions or a different naming convention.

## Open Questions

> **[!WARNING]**
>
> 1. Should the theme list (`BACKUP_THEMES`) be loaded from a JSON file (`/data/shop-themes.json`) **only** or kept hard‑coded?
> 2. Do you want the `ThemeService` to expose an event emitter for theme changes (so other components can react), or will manual calls suffice?
> 3. Is it acceptable to use native ES modules (`type="module"`) for the new files, or do you need a build step (e.g., Vite) for production?

## Proposed Changes

### 1. New Module Files

All new files will be created under `c:/Users/Ivan Gonzalez/Sitios/newfacecards_v3/admin/user/ivangonzalez/` (same folder as `index.html`) to keep relative imports simple.

| File                     | Purpose                                                                                                          | Exported Symbols                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `constants.js`           | Centralised constants for storage keys and default theme                                                         | `THEME_STORAGE_KEY`, `OVERRIDES_KEY`                                                                                                     |
| `theme-service.js`       | Handles theme list, persistence, and overrides                                                                   | `ThemeService` (object with `getCurrentTheme`, `setCurrentTheme`, `getOverrides`, `setOverrides`, `getAllThemes`, `isOwned`, `purchase`) |
| `carousel-manager.js`    | Renders carousel UI, navigation (wheel/drag/keyboard), and interacts with `ThemeService`                         | `CarouselManager` with `open()`, `close()`, `init()`                                                                                     |
| `island-menu-wrapper.js` | Sets up island‑menu listeners, delegates mode changes to `CarouselManager` and theme selection to `ThemeService` | `setupIsland()`                                                                                                                          |
| `binder-boot.js`         | Minimal boot script: creates `DataBinder`, loads the initial card template, and imports the modules above        | (no exports)                                                                                                                             |

### 2. Refactor `index.html`

Replace the large `<script type="module">` block with a tiny bootstrap that only:

```html
<script type="module" src="./binder-boot.js"></script>
```

All other logic moves to the new modules.

### 3. `constants.js`

```js
// constants.js
export const THEME_STORAGE_KEY = "APP_THEME_SELECTED";
export const OVERRIDES_KEY = "APP_THEME_OVERRIDES";
```

### 4. `theme-service.js`

```js
// theme-service.js
import { THEME_STORAGE_KEY, OVERRIDES_KEY } from "./constants.js";

const BACKUP_THEMES = [
  {
    id: "aurora",
    label: "Aurora",
    accent: "#a855f7",
    font: "Josefin Sans",
    isFree: true,
    price: 0,
  },
  {
    id: "zen",
    label: "Zen",
    accent: "#c0392b",
    font: "Noto Serif JP",
    price: 4.99,
    description: "Minimalista verde calma de paz visual.",
  },
  // …other themes (tropico, obsidiana, brutal, deco)…
];

const OWNED_THEMES_KEY = "NFC_OWNED_THEMES";

function _loadOwned() {
  try {
    const raw = localStorage.getItem(OWNED_THEMES_KEY);
    return raw ? JSON.parse(raw) : ["aurora"];
  } catch {
    return ["aurora"];
  }
}

function _saveOwned(arr) {
  localStorage.setItem(OWNED_THEMES_KEY, JSON.stringify(arr));
}

export const ThemeService = {
  // ---- Public API ----
  getCurrentTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || "aurora";
  },

  setCurrentTheme(id) {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  },

  getOverrides() {
    try {
      return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
    } catch {
      return {};
    }
  },

  setOverrides(overrides) {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  },

  getAllThemes() {
    // Merge backup with any remote shop data (later implementation)
    return BACKUP_THEMES;
  },

  isOwned(id) {
    const owned = _loadOwned();
    return owned.includes(id);
  },

  purchase(id) {
    const owned = _loadOwned();
    if (!owned.includes(id)) {
      owned.push(id);
      _saveOwned(owned);
    }
  },

  // ---- Helper for consumers (optional) ----
  getThemeById(id) {
    return this.getAllThemes().find((t) => t.id === id);
  },
};
```

### 5. `carousel-manager.js`

```js
// carousel-manager.js
import { ThemeService } from "./theme-service.js";

export const CarouselManager = (() => {
  let isActive = false;
  let carouselCurrentIndex = 0;
  let carouselCards = [];

  const stage = () => document.getElementById("stage");

  function _render() {
    const container = stage();
    if (!container) return;
    container.innerHTML = "";
    carouselCards = [];

    const currentTheme = ThemeService.getCurrentTheme();
    ThemeService.getAllThemes().forEach((theme) => {
      const isOwned = ThemeService.isOwned(theme.id);
      const isActiveTheme = theme.id === currentTheme;

      const card = document.createElement("div");
      card.className = "profile-card profile-card--glass";

      const aeCard = document.createElement("div");
      aeCard.className = "ae-card";
      aeCard.dataset.theme = theme.id;

      const preview = document.createElement("div");
      preview.className = "ae-preview-host";
      preview.style.cssText = "position:absolute;inset:0;";

      // Render high‑fidelity preview – reuse the existing function from index.html
      // (we will expose it via window for now)
      window.renderHighFidelityPreview(
        theme.id,
        preview,
        theme.accent,
        theme.font,
      );

      const label = document.createElement("div");
      label.className = "ae-card-label";
      label.innerText = theme.label;

      aeCard.appendChild(preview);
      aeCard.appendChild(label);
      card.appendChild(aeCard);

      // Action bar -------------------------------------------------
      const actionBar = document.createElement("div");
      actionBar.className = "profile-card__action-bar";

      if (isActiveTheme) {
        actionBar.innerHTML = `
          <div class="theme-active-badge"><i class="fa-solid fa-circle-check"></i> Tema Activo</div>
        `;
      } else if (isOwned) {
        const applyBtn = document.createElement("button");
        applyBtn.className = "apply-theme-btn";
        applyBtn.innerHTML = `<i class="fa-solid fa-palette"></i> Aplicar`;
        applyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          ThemeService.setCurrentTheme(theme.id);
          CarouselManager.close();
        });
        actionBar.appendChild(applyBtn);
      } else {
        const buyBtn = document.createElement("button");
        buyBtn.className = "buy-theme-btn";
        buyBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Comprar $${theme.price || "4.99"}`;
        buyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          ThemeService.purchase(theme.id);
          CarouselManager.open(); // rebuild UI
        });
        actionBar.appendChild(buyBtn);
      }

      card.appendChild(actionBar);
      // Click on card rotates if needed (prev/next arrows)
      card.addEventListener("click", () => {
        if (carouselTransitioning) return;
        if (card.classList.contains("profile-card--prev"))
          rotateCarousel(carouselCurrentIndex - 1);
        if (card.classList.contains("profile-card--next"))
          rotateCarousel(carouselCurrentIndex + 1);
      });

      container.appendChild(card);
      carouselCards.push(card);
    });

    const activeIdx = ThemeService.getAllThemes().findIndex(
      (t) => t.id === ThemeService.getCurrentTheme(),
    );
    carouselCurrentIndex = activeIdx >= 0 ? activeIdx : 0;
    updateClasses();
  }

  function updateClasses() {
    const len = carouselCards.length;
    carouselCards.forEach((c, i) => {
      c.className = c.className
        .replace(/\b(profile-card--(active|prev|next|hidden))\b/g, "")
        .trim();
      if (i === carouselCurrentIndex) c.classList.add("profile-card--active");
      else if (i === (carouselCurrentIndex - 1 + len) % len)
        c.classList.add("profile-card--prev");
      else if (i === (carouselCurrentIndex + 1) % len)
        c.classList.add("profile-card--next");
      else c.classList.add("profile-card--hidden");
    });
  }

  // -----------------------------------------------------------------
  function open() {
    if (isActive) return;
    isActive = true;
    const viewport = document.getElementById("carousel-viewport");
    if (viewport) {
      viewport.style.display = "flex";
      viewport.offsetHeight; // force reflow
      viewport.classList.add("card-carousel--visible");
    }
    _render();
  }

  function close() {
    if (!isActive) return;
    isActive = false;
    const viewport = document.getElementById("carousel-viewport");
    if (viewport) {
      viewport.classList.remove("card-carousel--visible");
      setTimeout(() => {
        if (!isActive) viewport.style.display = "none";
      }, 400);
    }
  }

  // -----------------------------------------------------------------
  // Public API
  return { open, close, init: () => {} };
})();
```

### 6. `island-menu-wrapper.js`

```js
// island-menu-wrapper.js
import { CarouselManager } from "./carousel-manager.js";

export function setupIsland(islandEl) {
  // The island component already dispatches "island-mode-change"
  islandEl.addEventListener("island-mode-change", (e) => {
    const mode = e.detail?.mode;
    if (mode === "apariencia") {
      // Ensure island is in edit mode before opening overlay
      if (islandEl.dataset.status !== "edit") {
        islandEl.setStatus?.("edit");
      }
      CarouselManager.open();
    } else {
      CarouselManager.close();
    }
  });

  // Keep carousel closed when island leaves edit status
  islandEl.addEventListener("island-status-change", (e) => {
    if (e.detail?.status !== "edit") CarouselManager.close();
  });
}
```

### 7. `binder-boot.js`

```js
// binder-boot.js
import { DataBinder } from "/shared/utilities/binder.js";
import { ThemeService } from "./theme-service.js";
import { setupIsland } from "./island-menu-wrapper.js";
import "./constants.js"; // just to ensure constants are loaded (optional)

// 1️⃣ DataBinder configuration
const binderConfig = {
  container: document.querySelector("#card"),
  endpoint:
    "https://app.newfacecards.com/wp-content/uploads/ultimatemember/1/data/card-data.json",
  allowLocalFallback: true,
  localPath: "/data/card-data.json",
  onSuccess: (data) => console.log("[App] Hidratación completada:", data),
  onError: (err) => console.error("[App] Hidratación error:", err),
};

const binder = new DataBinder(binderConfig);
window.__adminBinder = binder;

// 2️⃣ Load initial theme template
const initialTheme = ThemeService.getCurrentTheme();
binder
  .loadTemplateAndRun(`/templates/cards/${initialTheme}.html`)
  .then(() => {
    if (
      ThemeService.getOverrides() &&
      Object.keys(ThemeService.getOverrides()).length
    ) {
      // Apply live overrides (same function from original file)
      window.applyLiveOverrides(ThemeService.getOverrides());
    }
  })
  .catch(console.error);

// 3️⃣ Initialise Island and bind listeners
import { importIslandMenu } from "/shared/components/island-menu/island-menu.js";
const morphedIslandConfig = {
  /* same as previous config – omitted for brevity */
};

importIslandMenu(morphedIslandConfig)
  .then((island) => {
    setupIsland(island);
  })
  .catch((err) =>
    console.error("[admin binder] island bootstrap failed:", err),
  );
```

### 8. Update HTML (minimal)

```html
<!-- In admin/user/ivangonzalez/index.html, replace the large <script type="module"> -->
<script type="module" src="./binder-boot.js"></script>
```

All other script blocks (`window.__openAppearanceEditor`, etc.) become unnecessary because `CarouselManager` is now the single source for opening/closing the overlay.

### 9. Verify & Test

1. **Open page** → “Perfil” button should trigger `island-mode-change`, automatically set the island to `"edit"` (if needed) and call `CarouselManager.open()`.
2. **First click** on the button must open the overlay (no more double‑click issue).
3. **Select a theme** → `ThemeService.setCurrentTheme` updates `localStorage`; reload page → same theme appears.
4. **Purchase a theme** → `ThemeService.purchase` updates owned list; UI updates accordingly.
5. **Check console** for any errors (especially `ReferenceError`).
6. **Responsive test** – ensure carousel works on keyboard, wheel, and drag as before.

### 10. Cleanup

- Remove the old duplicated constants (`THEME_STORAGE_KEY`, `OVERRIDES_KEY`) from the original script (already done).
- Delete any unused functions (`handleAparienciaMode` can stay as thin wrapper if needed) or replace calls with `CarouselManager`.
- Verify that CSS (`card-carousel-latest.css`) still matches the class names used (`profile-card--active`, etc.).

---

**Next steps**

1. **User review** – please confirm the module layout and any preferences (JSON loading, event emitter, etc.).
2. Once approved, I will proceed to **create the new module files** and update `index.html` accordingly.

Let me know if you’d like any adjustments before I start the actual code changes
