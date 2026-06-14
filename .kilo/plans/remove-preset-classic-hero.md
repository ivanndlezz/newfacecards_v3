# Remove preset-classic and preset-hero from glider

File to change: `app/index.html`

## 1. Update initial card class
Line 1886
```diff
-class="profile-card preset-classic cover-style-full status-storage"
+class="profile-card preset-centered cover-style-full status-storage"
```

## 2. Remove preset definitions from PRESETS
Delete entire `classic:` block starting at line 2199 through line 2217.
Delete entire `hero:` block starting at line 2275 through line 2316.

## 3. Update default preset
Line 2318
```diff
-const PRESET_DEFAULT = "classic";
+const PRESET_DEFAULT = "centered";
```

## 4. Update styleConfig map
Lines 2346-2350
```diff
 const styleConfig = Object.freeze({
-  classic: PRESETS.classic,
-  hero: PRESETS.hero,
+  centered: PRESETS.centered,
   cover: PRESETS.cover,
 });
```

## 5. Update getStyleConfig fallback
Line 2465
```diff
-return styleConfig[styleName] || PRESETS.classic;
+return styleConfig[styleName] || PRESETS.centered;
```
