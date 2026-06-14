# App

`/app` es la version limpia del editor de perfil. Conserva la estructura visual del `index` original, pero mueve el sistema editable a controles declarativos cargados desde `/app/controls`.

## Estructura

```text
app/
  index.html
  controls/
    avatar.html
    avatar/
      controls.css
      controls.js
    cover.html
    cover/
      controls.css
      controls.js
    hero.html
    hero/
      controls.css
      controls.js
    control-page.js
```

Cada control tiene:

- `/<control>.html`: markup que se inyecta en el bottom sheet.
- `/<control>/controls.css`: estilos propios del control.
- `/<control>/controls.js`: comportamiento propio del control.

## Corpus

La app mantiene un solo corpus de aspecto en `window.appBipartiteStorage.state`.

La key local es:

```js
nfc_app_corpus
```

El server guarda el corpus en `description`. Los datos de identidad (`name`, `lastname`, `avatar`, `cover`) vienen primero del server y solo se pisan si el corpus remoto los trae explicitamente.

## Controles Canonicos

Un control canonico usa `data-control-sync`. El `SyncEngine` registra un solo control por id, aplica estilos al preview y conecta el estado principal.

Ejemplo:

```html
<div
  data-control-sync="ctrl-size"
  data-target="#avatarContainer"
  data-css-var="--avatar-size"
  data-unit="px"
>
  ...
</div>
```

Importante: no dupliques el mismo `data-control-sync` dentro de una pantalla. Solo debe existir un control canonico por id.

## Multiples Inputs Para El Mismo Valor

Para tener varios inputs con distintos disenios que modifiquen el mismo valor, usa `data-control-view`.

Ejemplo:

```html
<div
  data-control-view="ctrl-size"
  data-value-attr="value"
  data-values='{"sm":80,"md":109,"lg":140}'
>
  <button data-value="sm">S</button>
  <button data-value="md">M</button>
  <button data-value="lg">L</button>
</div>

<input
  type="range"
  min="40"
  max="160"
  data-control-view="ctrl-size"
/>
```

Ambos modifican `controls.ctrl-size`, rehidratan sus estados visuales y actualizan el preview canonico.

## Valores De Display

Para mostrar el valor actual de cualquier control view:

```html
<span data-control-view-value="ctrl-size" data-unit="px"></span>
```

## Mini Preview Local

Un control view puede actualizar un preview interno sin afectar el contrato global:

```html
<div id="avatarTarget"></div>

<input
  data-control-view="ctrl-size"
  data-preview-target="#avatarTarget"
  data-preview-var="--avatar-size"
  data-unit="px"
/>
```

## Regla De Estado UI

Los estados visuales se expresan con `data-status`:

```html
<button data-status="active">M</button>
```

No uses clases tipo `.active` para nuevos controles.
