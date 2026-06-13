# Plan de Implementación: Editor de Perfil Contextual (iOS-Style)

El objetivo de este plan es rediseñar la experiencia de edición del perfil. En lugar de abrir un panel grande con pestañas (tabs) al activar el modo edición ("Perfil" / `cardbar`), pondremos la tarjeta en un **modo de edición interactivo visual (estilo iOS)**. 
- Cada sección editable de la tarjeta se resaltará visualmente (con bordes punteados sutiles, micro-animaciones hover y pequeños badges de edición/lápiz).
- Al hacer clic en cualquiera de estas zonas, se abrirá un **mini bottom sheet contextual** enfocado únicamente en los campos de esa sección (ocultando el selector de pestañas e inicializando el título dinámicamente).

---

## User Review Required

> [!IMPORTANT]
> **Expansión Multitema:** Para que esta experiencia funcione independientemente del tema elegido por el usuario (Aurora, Zen, Obsidiana, Brutal, Deco, Trópico, Blank), inyectaremos de forma no invasiva los atributos `data-editable-zone` y `data-editable-cohort` correspondientes en las plantillas de todos los temas.
>
> **Corrección de Overflow:** Dado que los contenedores del card aplican `overflow: hidden` o `overflow: clip` por diseño original, al activarse el modo edición propagaremos la clase `.edit-mode-active` hacia el `body` y `.main-content`, permitiendo anular temporalmente el recorte visual mediante estilos globales con alta especificidad (`!important`).
>
> **Consola de Diagnóstico:** Inyectaremos registros explicativos en la consola para facilitar el rastreo de eventos de cambio de modo y clics delegados.

---

## ✅ ESTADO ACTUAL & PLAN DE RESOLUCIÓN

A continuación se detallan los elementos implementados y la estrategia para resolver el reporte de que al dar clic en Perfil "nada sucede".

---

## Proposed Changes

### [Component: CSS Styles]

#### [MODIFY] [card-carousel-latest.css](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/shared/components/card-carousel/card-carousel-latest.css)
- ✅ Estilos base para `.edit-mode-active` y pseudoelemento lápiz (`::after`).
- [NEW] Desactivar el recorte visual (`overflow: visible !important`) en todos los contenedores de tarjeta (`.card--aurora`, `.card--zen`, `.card--obsidiana`, `.card--brutal`, `.card--tropico`, `.card--deco`, `.card--blank`) cuando la clase `.edit-mode-active` esté presente en la jerarquía superior.
- [NEW] Ajustar y suavizar los márgenes/paddings interactivos para que la silueta punteada sea uniforme sin importar la estructura (por ejemplo, avatar redondo vs cuadrado).

### [Component: JavaScript Logic]

#### [MODIFY] [index.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/admin/user/ivangonzalez/index.html)
- [MODIFY] En `activateCardEditMode()` y `deactivateCardEditMode()`, propagar la clase `.edit-mode-active` al `body` y a `.main-content` además de `#card`.
- [MODIFY] Inyectar logs detallados de trazabilidad en `setupIslandListeners()`, `handleIslandMode()`, `activateCardEditMode()` y `setupCardEditDelegation()` para validar en tiempo real el flujo de control y descartar bloqueos de inicialización.

### [Component: Card Templates]
Agregaremos los atributos `data-editable-zone` y `data-editable-cohort` correspondientes a las zonas clave:
- Cohort 1: Foto y Portada (Avatar y Cover)
- Cohort 2: Datos Personales (Nombre, Cargo, Organización y Bio)
- Cohort 3: Contacto (Sección / Contenedor)
- Cohort 4: Empresa (Sección / Contenedor)
- Cohort 5: Redes Sociales (Contenedor superior/inferior)

#### [MODIFY] [aurora.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/aurora.html) (Ya cuenta con soporte básico)
#### [NEW] [zen.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/zen.html)
#### [NEW] [obsidiana.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/obsidiana.html)
#### [NEW] [blank.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/blank.html)
#### [NEW] [brutal.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/brutal.html)
#### [NEW] [deco.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/deco.html)
#### [NEW] [tropico.html](file:///c:/Users/Ivan%20Gonzalez/Sitios/newfacecards_v3/templates/cards/tropico.html)

---

## Verification Plan

### Manual Verification
1. Acceder al dashboard de edición de la tarjeta.
2. Hacer clic en "Editar" en la barra Island y luego en "Perfil".
3. Validar a través de la consola del navegador que se disparan correctamente los mensajes:
   - `[Perfil Editor] activateCardEditMode called`
   - `[Perfil Editor] #card classes: ... edit-mode-active`
4. Observar que en cualquier tema activo (ej. Zen u Aurora) aparecen inmediatamente los indicadores visuales punteados con wiggling.
5. Hacer clic sobre el avatar; el sheet debe abrirse enfocado en "Editar Foto y Portada".
6. Cambiar de tema en tiempo real desde la sección "Apariencia" y comprobar que las zonas de edición siguen cargándose adecuadamente en el nuevo diseño.
