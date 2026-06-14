# Explicación de cada campo en las definiciones de control

## Definición 1 — Ejemplo 3 (`rangeSize`)

```json
{
  "id": "avatar.size",
  "statePath": "controls.avatar.size",
  "root": "#avatarSizeRange",
  "target": "#avatarTarget",
  "cssVar": "--avatar-size",
  "unit": "px",
  "event": "input",
  "onApply": "#sizeLabel :: textContent :: {value}px"
}
```

| Campo       | Valor                                      | Rol                                                                                                                                                                                                                                   |
| ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | `"avatar.size"`                            | Identificador lógico del control. Sirve como clave única para este tipo de input.                                                                                                                                                     |
| `statePath` | `"controls.avatar.size"`                   | Ruta dentro del objeto SSOT donde se guarda el valor. El binder hace `state.controls.avatar.size = value`.                                                                                                                            |
| `root`      | `"#avatarSizeRange"`                       | Selector del **input** que dispara el cambio. Como es un `<input type="range">` nativo, el sistema detecta que es un native input y lee `.value` directamente.                                                                        |
| `target`    | `"#avatarTarget"`                          | Selector del **elemento visual** que recibe el cambio. En este caso, el `<div class="avatar">`.                                                                                                                                       |
| `cssVar`    | `"--avatar-size"`                          | Nombre de la variable CSS a actualizar en el target.                                                                                                                                                                                  |
| `unit`      | `"px"`                                     | Sufijo que se concatena al valor antes de asignarlo a la variable CSS. Resultado: `"100px"`.                                                                                                                                          |
| `event`     | `"input"`                                  | Evento que escucha el sistema. Va asociado al root. Como es native input, se escucha `input` (en tiempo real).                                                                                                                        |
| `onApply`   | `"#sizeLabel :: textContent :: {value}px"` | **Side-effect** opcional: after de escribir el estado y aplicar al target, también actualiza otro elemento. Sintaxis: `selector :: propiedad :: template`. Reemplaza `{value}` con el valor numérico y asigna `textContent` al label. |

---

## Definición 2 — Ejemplo 2 (`radiusShapes`)

```json
{
  "id": "avatar.radius",
  "statePath": "controls.avatar.radius",
  "root": "#avatarShapePicker",
  "target": "#avatarTarget",
  "cssVar": "--avatar-radius",
  "unit": "px",
  "valueAttr": "value",
  "activeStatus": "active",
  "inactiveStatus": "unset",
  "values": {
    "square": 0,
    "soft": 24,
    "circle": 59
  }
}
```

| Campo            | Valor                                          | Rol                                                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | `"avatar.radius"`                              | Identificador lógico del control.                                                                                                                                                                                                              |
| `statePath`      | `"controls.avatar.radius"`                     | Ruta en el SSOT donde se guarda el valor.                                                                                                                                                                                                      |
| `root`           | `"#avatarShapePicker"`                         | Selector del contenedor de botones custom. A diferencia del ejemplo anterior, acá el root **no** es un input nativo, sino un widget custom con `data-*` attributes.                                                                            |
| `target`         | `"#avatarTarget"`                              | Selector del avatar que recibe el border-radius.                                                                                                                                                                                               |
| `cssVar`         | `"--avatar-radius"`                            | Variable CSS en el target.                                                                                                                                                                                                                     |
| `unit`           | `"px"`                                         | Unidad: valores como `0px`, `24px`, `59px`.                                                                                                                                                                                                    |
| `valueAttr`      | `"value"`                                      | Nombre del `data-*` attribute a leer de cada botón clickeado (`data-value`). Internamente el binder convierte `data-value` a `dataset.value`.                                                                                                  |
| `activeStatus`   | `"active"`                                     | Valor que se asigna a `data-status` del item seleccionado (para estilizarlo activo).                                                                                                                                                           |
| `inactiveStatus` | `"unset"`                                      | Valor que se asigna a `data-status` de los no seleccionados.                                                                                                                                                                                   |
| `values`         | Mapa `{"square": 0, "soft": 24, "circle": 59}` | Tabla de lookup opcional que traduce el valor crudo del `data-value` (string) al valor numérico real que se guarda en el estado y se asigna al CSS. Sin `values`, el sistema haría `coerce(raw)`, pero con este mapa lo resuelve directamente. |

---

## Flujo completo

- **Custom widget** (`radiusShapes`): El usuario hace click en un `<button data-value="soft">` dentro de `#avatarShapePicker`. El binder lee `dataset.value`, busca `"soft"` en el mapa `values` y obtiene `24`. Escribe `state.controls.avatar.radius = 24`, setea `--avatar-radius: 24px` en `#avatarTarget`, y marca ese botón con `data-status="active"` y los otros con `data-status="unset"`.

- **Native input** (`rangeSize`): El usuario mueve el `<input type="range" id="avatarSizeRange">`. El binder lee `.value`, hace `coerce` para convertirlo a número, escribe `state.controls.avatar.size = 100`, setea `--avatar-size: 100px` en `#avatarTarget`, y ejecuta el side-effect `onApply`, actualizando el texto del label a `"100px"`.
