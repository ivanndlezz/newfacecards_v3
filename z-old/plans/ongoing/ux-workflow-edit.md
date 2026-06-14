
I implement this elements

@[profile-aspect.json](admin/user/ivangonzalez/profile-aspect.json)

```html
<span id="mobile_cover_input" class="mobile_input edit-element" data-scope="mobile_cover_input" data-taxonomy-key="profile-heading">
  <span class="icon_cover"> </span>
</span>

<span id="mobile_avatar_input" class="mobile_avatar_input edit-element" data-scope="mobile_avatar_input" data-taxonomy-key="profile-heading">
  <span class="icon_avatar"> </span>
</span>
```
Only visible whes is editing.

``` html
<div id="data-status-storage" data-status="online" data-sync-status="synced" data-card-status="editing">
</div>
```

I neet that whe click on element edit-element get data scope

and open this element:

<div class="morphing-controller" id="interactiveController" data-status="main-controller" onclick="handleControllerClick(event)" style="display: block;">
      <div class="pill-content"><span></span> Editar Perfil</div>

      <div class="panel-content">
        <div class="fc-header">
          <span>🖼️ Medios (Icono e Imagen)</span>
          <button class="fc-close-btn" onclick="toggleController(event)">
            ✕
          </button>
        </div>

        <div class="editor-scroll" id="editorScroll"><div class="control-row"><span class="control-label">Preset de layout</span><div class="glider-container" id="presetGlider"><div class="glider-option active" data-val="preset-classic">Clásico</div><div class="glider-option" data-val="preset-centered">Centrado</div><div class="glider-option" data-val="preset-horizontal">Horizontal</div><div class="glider-option" data-val="free">Libre</div></div></div><div class="control-row"><span class="control-label">Posición</span><div class="glider-container" id="posGlider" style="opacity: 0.5; pointer-events: none;"><div class="glider-option active" data-val="left">Izq</div><div class="glider-option" data-val="right">Der</div><div class="glider-option" data-val="top">Arriba</div></div></div><div class="divider"></div><div id="ctrlGroupAvatar"><span class="control-label">Avatar</span><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Tamaño Avatar</span>
          <span class="control-value" id="ctrl-size-val">100px</span>
        </div>
        <input type="range" class="range-input" id="ctrl-size-input" min="40" max="160" step="1" value="100"></div><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Padding Avatar</span>
          <span class="control-value" id="ctrl-padding-val">0px</span>
        </div>
        <input type="range" class="range-input" id="ctrl-padding-input" min="0" max="24" step="1" value="0"></div><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Mock Border (escala)</span>
          <span class="control-value" id="ctrl-mock-border-scale-val">1.05</span>
        </div>
        <input type="range" class="range-input" id="ctrl-mock-border-scale-input" min="1" max="1.2" step="0.01" value="1.05"></div></div><div class="divider"></div><div id="ctrlGroupCover"><span class="control-label">Portada</span><div class="control-row"><span class="control-label">Estilo de portada</span><div class="glider-container" id="coverGlider"><div class="glider-option" data-val="none">Sin portada</div><div class="glider-option active" data-val="full">Completa</div><div class="glider-option" data-val="inset">Encuadrada</div></div></div><div id="insetControlsContainer" style="display: none;"><div class="divider"></div><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Ancho Portada</span>
          <span class="control-value" id="ctrl-cover-width-val">90%</span>
        </div>
        <input type="range" class="range-input" id="ctrl-cover-width-input" min="50" max="100" step="1" value="90"></div><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Alto Portada</span>
          <span class="control-value" id="ctrl-cover-height-val">120px</span>
        </div>
        <input type="range" class="range-input" id="ctrl-cover-height-input" min="60" max="250" step="1" value="120"></div><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Redondeo Esquinas</span>
          <span class="control-value" id="ctrl-cover-radius-val">12px</span>
        </div>
        <input type="range" class="range-input" id="ctrl-cover-radius-input" min="0" max="40" step="1" value="12"></div><div class="control-row">
        <div class="control-label-wrap">
          <span class="control-label">Ajuste de imagen</span>
          <span class="control-value" id="ctrl-cover-fit-val">
            
          </span>
        </div>
        <select id="ctrl-cover-fit-input" class="custom-input"><option value="cover" selected="">Recortar (Cover)</option><option value="contain">Contener (Contain)</option><option value="fill">Rellenar (Fill)</option></select></div><div class="control-row">
        <div class="checkbox-wrap">
          <span class="control-label" style="margin:0">Sombra de Portada</span>
          <input type="checkbox" id="ctrl-cover-shadow-input" style="accent-color:#09090b;width:16px;height:16px;cursor:pointer">
        </div></div></div></div></div>
      </div>
    </div>

    as bottom sheet.

    change behavior. It is not more a pill that turns in encapsulated controls card (inputs).

    now is a bottom sheet commanded by click in .edit-element