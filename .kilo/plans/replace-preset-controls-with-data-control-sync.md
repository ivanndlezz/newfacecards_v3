# Plan: Reemplazar controles de Preset/Posición por HTML custom con data-control-sync

## Objetivo
Reemplazar los controles generados dinámicamente de **Preset de layout** y **Posición** en el bottom sheet por HTML estático custom con atributos `data-control-sync`, manteniendo la lógica existente de `setPreset()` y `setPos()`.

## Archivo afectado
- `admin/user/ivangonzalez/index.html`

---

## Cambios a realizar

### 1. Reemplazar `#editorScroll` con HTML custom (línea 1904)

**Actual:**
```html
<div class="sheet-content-slots editor-scroll" id="editorScroll"></div>
```

**Nuevo:**
```html
<div class="sheet-content-slots editor-scroll" id="editorScroll">

  <!-- TU CUSTOM - ESTO NO SE TOCA NUNCA POR JS -->
  <div class="control-row" id="customPresetRow">
    <span class="control-label">Preset de layout</span>
    <div class="glider-container" id="presetGlider"
         data-control-sync="preset.layout"
         data-target="mainCard"
         data-state-path="controls.preset.layout"
         data-value-attr="val"
         data-event="click"
         data-active-status="active"
         data-inactive-status="unset"
         data-values='{"preset-classic":"preset-classic","preset-centered":"preset-centered","preset-horizontal":"preset-horizontal","free":"free"}'>
      <div class="glider-option active" data-val="preset-classic">Clásico</div>
      <div class="glider-option" data-val="preset-centered">Centrado</div>
      <div class="glider-option" data-val="preset-horizontal">Horizontal</div>
      <div class="glider-option" data-val="free">Libre</div>
    </div>
  </div>

  <div class="control-row" id="customPosRow">
    <span class="control-label">Posición</span>
    <div class="glider-container" id="posGlider"
         data-control-sync="preset.position"
         data-target="profileContent"
         data-state-path="controls.preset.position"
         data-value-attr="val"
         data-event="click"
         data-active-status="active"
         data-inactive-status="unset"
         data-values='{"left":"left","right":"right","top":"top"}'
         style="opacity: 0.5; pointer-events: none;">
      <div class="glider-option active" data-val="left">Izq</div>
      <div class="glider-option" data-val="right">Der</div>
      <div class="glider-option" data-val="top">Arriba</div>
    </div>
  </div>

</div>
```

---

### 2. Comentar/borrar generación dinámica de gliders

**Ubicación:** Dentro de `ConditionalPanelManager.init()` (~líneas 2453-2489)

**Borrar EXACTAMENTE:**

```javascript
          // --- Sección: Preset de layout ---
          scroll.appendChild(
            this._buildGlider(
              "presetGlider",
              "Preset de layout",
              [
                { label: "Clásico", val: "preset-classic", handler: setPreset },
                {
                  label: "Centrado",
                  val: "preset-centered",
                  handler: setPreset,
                },
                {
                  label: "Horizontal",
                  val: "preset-horizontal",
                  handler: setPreset,
                },
                { label: "Libre", val: "free", handler: setPreset },
              ],
              "preset-classic",
            ),
          );

          // --- Sección: Posición libre ---
          const posRow = this._buildGlider(
            "posGlider",
            "Posición",
            [
              { label: "Izq", val: "left", handler: setPos },
              { label: "Der", val: "right", handler: setPos },
              { label: "Arriba", val: "top", handler: setPos },
            ],
            "left",
          );
          posRow.querySelector("#posGlider").style.opacity = "0.5";
          posRow.querySelector("#posGlider").style.pointerEvents = "none";
          scroll.appendChild(posRow);
```

---

### 3. Agregar suscripción al store para disparar lógica custom

**Ubicación:** Al final del `DOMContentLoaded`, después de `maybeInitCredCheck()`

**Agregar:**
```javascript
        // ===== WIRE: conectar data-control-sync con lógica existente =====
        function wireCustomControls() {
          if (!window.syncEngine) {
            setTimeout(wireCustomControls, 100);
            return;
          }

          window.syncEngine.store.subscribe("controls.preset.layout", (val) => {
            if (val && typeof setPreset === "function") {
              setPreset(val);
            }
          });

          window.syncEngine.store.subscribe("controls.preset.position", (val) => {
            if (val && typeof setPos === "function") {
              setPos(val);
            }
          });
        }

        wireCustomControls();
```

---

## Validación

- El HTML custom estático en `#editorScroll` no es tocado por `ConditionalPanelManager.init()`
- `bootSync.js` detecta `[data-control-sync]` automáticamente y bindea eventos
- Al hacer click en un glider-option:
  1. `data-control-sync` actualiza el store (`controls.preset.layout` / `controls.preset.position`)
  2. `markActive()` agrega/quita la clase `active` visualmente
  3. El store notifica al subscriber → ejecuta `setPreset()` / `setPos()`
- Al reabrir el sheet, el estado persiste en el store y los controles mantienen su clase `active`

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| `setPreset/Pos` vuelven a modificar clases del glider | Verificar que esas funciones no toquen `.glider-option` (solo deben modificar `#mainCard` / `#profileContent`) |
| `bootSync.js` no está listo cuando se abre el sheet | `wireCustomControls()` hace retry con `setTimeout` hasta que `window.syncEngine` exista |
| Estado inicial del store no refleja el HTML | El store arranca vacío; `bootSync` aplica el valor inicial desde `controls.*` al cargar |
