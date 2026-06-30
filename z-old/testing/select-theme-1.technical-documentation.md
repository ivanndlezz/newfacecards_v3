# Documentacion tecnica: `select-theme-1.html`

Fuente: [`select-theme-1.html`](./select-theme-1.html)

Estado del documento: referencia tecnica para analisis y migracion de conceptos al sistema nuevo de New Face Cards.

Ultima revision local: 2026-06-29.

---

## 0. Resumen ejecutivo

`select-theme-1.html` es un prototipo frontend autocontenido para seleccionar, previsualizar y comprar temas visuales de una tarjeta digital tipo link-in-bio.

El prototipo presenta una tarjeta de perfil como objeto principal de la interfaz. En modo vista, el usuario ve una sola tarjeta activa. En modo edicion, la experiencia se transforma en un carrusel 3D que permite comparar temas recientes, abrir un bottom sheet con mas temas, buscar temas y previsualizar temas propios o de marketplace. Cuando el tema activo pertenece al marketplace, el boton principal cambia de "Guardar Seleccion" a "Comprar" y abre un panel lateral de compra mock.

La pieza mas valiosa del prototipo no es solamente el CSS de los temas, sino el flujo:

- Preview directo sobre la tarjeta real.
- Separacion clara entre modo vista y modo edicion.
- Accion principal contextual.
- Exploracion de temas sin perder el contexto visual.
- Compra como continuacion natural de un tema seleccionado.

Este documento esta dividido en dos niveles:

- **Nivel 1: IEEE 830**, especificacion tecnica de requerimientos.
- **Nivel 2: What the user must feel**, definicion cualitativa de UI, GUI, workflow y experiencia.

---

# Nivel 1: IEEE 830

## 1. Introduccion

### 1.1 Proposito

Este documento describe los requerimientos funcionales, de interfaz, comportamiento, datos, estados y restricciones tecnicas del prototipo `select-theme-1.html`.

El proposito principal es preservar el conocimiento util del prototipo para poder retomarlo en el sistema nuevo de New Face Cards, especialmente en las areas de:

- Selector de temas.
- Preview WYSIWYG.
- Carrusel de estilos.
- Bottom sheet de exploracion.
- Accion contextual de guardar/comprar.
- Interaccion movil con gestos.
- Relacion entre temas propios y temas de marketplace.

### 1.2 Alcance

El alcance del sistema documentado es exclusivamente frontend.

Incluye:

- Renderizado de una tarjeta digital con datos mock.
- Aplicacion de temas por variables CSS.
- Carrusel de tarjetas.
- Modo vista.
- Modo edicion.
- Bottom sheet para explorar temas.
- Busqueda local de temas.
- Seleccion de temas propios.
- Previsualizacion de temas de marketplace.
- Panel de compra mock para temas no adquiridos.
- Persistencia local de temas recientes mediante `localStorage`.
- Interacciones por click, teclado, wheel, mouse drag y touch swipe.

No incluye:

- Backend.
- Login.
- GraphQL.
- WordPress.
- Guardado real de seleccion en servidor.
- Compra real.
- Validacion de pagos.
- Adquisicion real de temas.
- Sincronizacion multi-dispositivo.
- Analitica.
- Manejo avanzado de errores remotos.

### 1.3 Definiciones, acronimos y abreviaturas

- **NFC**: New Face Cards.
- **Tema**: conjunto de variables visuales que modifica la apariencia de la tarjeta digital.
- **Tema propio / owned theme**: tema incluido en `themesData`, disponible para guardar sin comprar.
- **Tema de marketplace / market theme**: tema incluido en `marketplaceThemesData`, requiere compra.
- **Preview WYSIWYG**: previsualizacion directa del resultado final sobre la tarjeta real.
- **Modo vista**: estado en el que solo se muestra la tarjeta seleccionada.
- **Modo edicion**: estado en el que se habilita el carrusel, dots y exploracion de temas.
- **Bottom sheet**: panel modal que entra desde la parte inferior para explorar temas.
- **Purchase sheet**: panel lateral mock que muestra un resumen de compra.
- **Sentinel card**: tarjeta especial "Mas temas" usada al inicio y final del carrusel para abrir el bottom sheet.
- **Recent themes**: lista local de hasta 3 temas propios usados recientemente.

### 1.4 Referencias

- Archivo principal: `z-old/testing/select-theme-1.html`.
- Hoja externa de compra: `shared/styles/purchase.css`.
- Font Awesome CDN: iconografia.
- Google Fonts importado desde CSS embebido: `Inter`, `Space Grotesk`, `JetBrains Mono`.

### 1.5 Vision general del documento

Este documento primero define el producto desde un punto de vista tecnico. Despues baja a requerimientos especificos verificables. Finalmente documenta la experiencia subjetiva que el usuario debe sentir durante el flujo.

---

## 2. Descripcion general

### 2.1 Perspectiva del producto

`select-theme-1.html` debe entenderse como un prototipo de interaccion y no como una implementacion final de produccion.

El prototipo vive en una sola pagina HTML con:

- CSS embebido.
- HTML semantico base.
- Datos mock en JavaScript.
- Logica de renderizado manual.
- Estado en memoria.
- Persistencia parcial en `localStorage`.

La pagina representa una experiencia de personalizacion para una tarjeta digital. Su centro visual es la tarjeta, no una lista de configuraciones. Esto es importante: el usuario no esta "llenando un formulario"; esta probando como se ve su identidad publica.

### 2.2 Funciones principales del producto

El sistema permite:

- Mostrar una tarjeta digital en modo vista.
- Entrar a modo edicion mediante un boton flotante.
- Navegar temas recientes en un carrusel 3D.
- Abrir un bottom sheet de temas desde la tarjeta "Mas temas".
- Buscar temas por nombre.
- Seleccionar temas propios.
- Previsualizar temas de marketplace.
- Distinguir visual y funcionalmente entre guardar un tema propio y comprar un tema pago.
- Abrir un panel lateral con resumen de compra para temas de marketplace.
- Cerrar paneles mediante overlay, boton de cierre o tecla Escape.

### 2.3 Clases de usuarios

#### Usuario final

Persona que esta creando o editando su tarjeta digital.

Caracteristicas esperadas:

- Quiere ver el resultado inmediatamente.
- No necesariamente entiende conceptos tecnicos como "tema", "preset", "variables" o "schema".
- Decide visualmente.
- Espera que el producto se sienta movil, tactil y moderno.
- Puede estar usando Safari iOS, navegador movil in-app, o desktop.

#### Diseñador / product owner

Persona que evalua el flujo y decide que patrones se retoman en el sistema nuevo.

Necesita:

- Distinguir flujo de edicion de flujo de compra.
- Evaluar densidad visual.
- Ver si el gesto y el carrusel aportan claridad o ruido.
- Identificar que componentes deben volverse reutilizables.

#### Desarrollador frontend

Persona que analiza la implementacion para migrarla o refactorizarla.

Necesita:

- Entender estados.
- Entender dependencias.
- Entender que partes son mock.
- Identificar requisitos de accesibilidad, responsividad y persistencia.
- Separar conceptos de UI de detalles accidentales del prototipo.

### 2.4 Entorno operativo

El prototipo esta diseñado para ejecutarse en navegadores modernos.

Debe funcionar en:

- Chrome desktop.
- Safari desktop.
- Safari iOS.
- Chrome Android.
- Navegadores in-app con barras inferiores/superiores dinamicas.

Consideraciones moviles ya presentes:

- `viewport-fit=cover`.
- `100dvh`.
- `env(safe-area-inset-bottom)`.
- `visualViewport` para ajustar el boton flotante ante UI del navegador.
- `touch-action: pan-y` en `body`.
- Gestos touch en el carrusel.

### 2.5 Restricciones de diseno e implementacion

Restricciones actuales:

- Todo vive en un solo archivo HTML.
- No hay bundler.
- No hay framework.
- No hay modulos.
- El estado es imperativo.
- Las tarjetas se reconstruyen con `innerHTML`.
- Los datos son arrays locales.
- El sistema de compra es mock.
- La persistencia se limita a `localStorage`.

Restricciones deseables para migracion:

- Separar datos de UI.
- Separar tema seleccionado de temas recientes.
- Separar temas propios de catalogo marketplace.
- Separar preview temporal de guardado definitivo.
- Evitar que la compra se confunda con guardado.
- Mantener WYSIWYG como principio central.

### 2.6 Suposiciones y dependencias

Suposiciones:

- Cada tema tiene un `id` unico.
- Cada tema tiene un `name`.
- Todo tema aplicable tiene un objeto `variables` con variables CSS necesarias para pintar la tarjeta.
- Los temas de marketplace tienen `price` y `preview`.
- Los temas propios pueden persistirse en la lista de recientes.
- La seleccion visual puede ocurrir antes del guardado real.

Dependencias:

- Font Awesome para iconos.
- Google Fonts para fuentes.
- `purchase.css` para el panel de compra.
- `localStorage` para recordar recientes.
- `visualViewport` opcional para compensar UI movil del navegador.

---

## 3. Requerimientos especificos

### 3.1 Requerimientos funcionales

#### FR-001: Mostrar tarjeta digital inicial

El sistema debe renderizar una tarjeta digital usando `BIO_PROFILE_DATA`.

Datos requeridos:

- Nombre.
- Rol.
- Avatar.
- Ubicacion.
- Lista de links con titulo, URL e icono.

Criterios de aceptacion:

- Al cargar la pagina se debe ver una tarjeta activa.
- La tarjeta debe usar el tema seleccionado inicial.
- La tarjeta debe mostrar nombre, rol, ubicacion, avatar y links.

#### FR-002: Inicializar tema seleccionado

El sistema debe inicializar `selectedThemeId` con el primer tema reciente valido.

Reglas:

- Leer `localStorage` desde la key `select-theme-1:recent-theme-ids`.
- Ignorar IDs invalidos.
- Ignorar duplicados.
- Rellenar faltantes con `DEFAULT_RECENT_THEME_IDS`.
- Limitar la lista a 3 temas.

Criterios de aceptacion:

- Si no hay `localStorage`, iniciar con `theme-glass`.
- Si hay valores corruptos, no romper la pagina.
- Si hay IDs desconocidos, descartarlos.

#### FR-003: Distinguir temas propios y temas de marketplace

El sistema debe mantener dos colecciones conceptualmente distintas:

- `themesData`: temas disponibles sin compra.
- `marketplaceThemesData`: temas disponibles para previsualizar y comprar.

Criterios de aceptacion:

- Los temas propios aparecen en "My themes".
- Los temas de marketplace aparecen en "Explore themes".
- El CTA cambia segun la propiedad del tema.

#### FR-004: Renderizar carrusel con tarjetas sentinel

El sistema debe renderizar el carrusel con esta estructura:

1. Tarjeta sentinel "Mas temas".
2. Hasta 3 temas visibles.
3. Tarjeta sentinel "Mas temas".

Criterios de aceptacion:

- La tarjeta "Mas temas" abre el bottom sheet.
- Las tarjetas de tema muestran preview completo.
- Los dots corresponden a todas las tarjetas, incluyendo sentinel cards.

#### FR-005: Modo vista

El sistema debe iniciar en modo vista.

Reglas:

- `body` debe tener `app--view-mode`.
- Solo la tarjeta activa debe ser visible.
- Los dots deben estar ocultos.
- El boton principal debe mostrar "Editar Diseño".

Criterios de aceptacion:

- Las tarjetas no activas no deben capturar eventos.
- El usuario debe ver una tarjeta final, no un editor.

#### FR-006: Modo edicion

El sistema debe permitir entrar a modo edicion desde el boton principal.

Reglas:

- Al entrar, remover `app--view-mode`.
- Agregar `app--edit-mode`.
- Mostrar tarjetas anterior/siguiente con profundidad 3D.
- Mostrar dots.
- Cambiar CTA segun la tarjeta activa.

Criterios de aceptacion:

- El usuario puede ver opciones laterales.
- El usuario puede navegar por tarjetas.
- El CTA deja de decir "Editar Diseño".

#### FR-007: Accion principal contextual

El boton principal debe cambiar segun estado y tarjeta activa.

Estados:

- Modo vista: icono de editar, texto "Editar Diseño".
- Modo edicion + tema propio: icono check, texto "Guardar Seleccion".
- Modo edicion + tema marketplace: icono bolsa, texto "Comprar".
- Modo edicion + sentinel "Mas temas": action bar oculta.

Criterios de aceptacion:

- El usuario no debe ver "Guardar Seleccion" para un tema pago no adquirido.
- El usuario no debe ver "Comprar" para un tema propio.
- El boton no debe competir con la tarjeta "Mas temas".

#### FR-008: Seleccionar tema propio

El sistema debe permitir seleccionar un tema propio.

Reglas:

- Actualizar `selectedThemeId`.
- Insertar el tema seleccionado al inicio de `recentThemeIds`.
- Eliminar duplicados.
- Limitar recientes a 3.
- Persistir en `localStorage`.
- Reconstruir carrusel.
- Actualizar bottom sheet.
- Actualizar CTA.

Criterios de aceptacion:

- La tarjeta activa debe reflejar el tema elegido.
- El tema elegido debe quedar marcado en el bottom sheet.
- El tema debe aparecer como reciente en futuras cargas.

#### FR-009: Previsualizar tema marketplace

El sistema debe permitir seleccionar un tema de marketplace para preview.

Reglas:

- Actualizar `selectedThemeId`.
- No insertar el tema en `recentThemeIds`.
- No persistirlo como adquirido.
- Reconstruir carrusel.
- Actualizar CTA a "Comprar".

Criterios de aceptacion:

- El usuario puede ver como se veria su tarjeta con el tema pago.
- El sistema no debe tratar el tema como propio.
- El siguiente click en CTA debe abrir compra.

#### FR-010: Abrir bottom sheet de temas

El sistema debe abrir el bottom sheet al seleccionar la tarjeta "Mas temas".

Reglas:

- Recentrar `currentIndex` a `1`.
- Actualizar clases del carrusel.
- Mostrar overlay.
- Mostrar `theme-sheet`.
- Animar entrada desde abajo.

Criterios de aceptacion:

- El fondo debe quedar contextualizado por overlay.
- El bottom sheet debe aparecer de forma suave.
- El usuario debe poder seguir entendiendo que esta explorando temas para la tarjeta.

#### FR-011: Cerrar bottom sheet de temas

El sistema debe cerrar el bottom sheet mediante:

- Boton de cierre.
- Click en overlay.
- Tecla Escape.

Reglas:

- Remover clases de apertura.
- Salir de modo busqueda.
- Restaurar search mockup.
- Limpiar input de busqueda.
- Re-renderizar opciones sin filtro.
- Ocultar nodos tras la transicion.

Criterios de aceptacion:

- El sheet no debe desaparecer de golpe.
- La siguiente apertura debe iniciar limpia.

#### FR-012: Buscar temas

El sistema debe permitir buscar temas por nombre.

Reglas:

- Click en "Theme search" activa input en header.
- Ocultar titulo `Appearance`.
- Focus automatico al input.
- Filtrar `themesData` y `marketplaceThemesData` por `name`.
- Busqueda case-insensitive.
- Si no hay resultados, mostrar empty state.

Criterios de aceptacion:

- La busqueda debe afectar tanto temas propios como marketplace.
- El empty state debe aparecer solo cuando ambas listas estan vacias.

#### FR-013: Abrir panel de compra

El sistema debe abrir el panel de compra cuando:

- El usuario esta en modo edicion.
- La tarjeta activa es un tema de marketplace.
- El usuario presiona el CTA "Comprar".

Reglas:

- Obtener tema activo desde `getCurrentMarketplaceTheme()`.
- Poblar nombre, precio, total, chip y preview.
- Mostrar overlay de compra.
- Mostrar purchase sheet.
- Animar entrada desde la derecha.

Criterios de aceptacion:

- El panel debe mostrar el tema correcto.
- El precio y total deben coincidir.
- El preview visual debe usar el color/gradiente del tema.

#### FR-014: Cerrar panel de compra

El sistema debe cerrar el panel de compra mediante:

- Boton de cierre.
- Click en overlay.
- Tecla Escape.

Criterios de aceptacion:

- La salida debe ser animada.
- El estado visual de la tarjeta debe permanecer.

#### FR-015: Navegacion por dots

El sistema debe permitir navegar con dots en modo edicion.

Reglas:

- Dots deben aparecer solo en modo edicion.
- Click en dot de tema cambia `currentIndex`.
- Click en dot de sentinel abre bottom sheet.

Criterios de aceptacion:

- El dot activo debe reflejar la tarjeta activa.
- Los dots no deben funcionar como controles visibles en modo vista.

#### FR-016: Navegacion por teclado

El sistema debe permitir navegar por teclado en modo edicion.

Reglas:

- `ArrowRight` navega a la siguiente tarjeta.
- `ArrowLeft` navega a la tarjeta anterior.
- No debe navegar si `isTransitioning` esta activo.
- No debe navegar en modo vista.

Criterios de aceptacion:

- El teclado no debe cambiar el tema cuando el usuario solo esta viendo la tarjeta.

#### FR-017: Navegacion por wheel / trackpad

El sistema debe permitir navegacion por wheel en modo edicion.

Reglas:

- Usar el delta dominante entre `deltaX` y `deltaY`.
- Prevenir scroll nativo si el delta absoluto supera 5.
- Acumular delta.
- Navegar cuando el acumulado supera `WHEEL_THRESHOLD`.
- Usar cooldown igual a `CAROUSEL_TRANSITION_MS`.

Valores actuales:

- `WHEEL_THRESHOLD = 44`.
- `CAROUSEL_TRANSITION_MS = 360`.

Criterios de aceptacion:

- Un gesto ligero debe sentirse responsivo.
- El carrusel no debe saltar multiples tarjetas por un solo gesto.

#### FR-018: Navegacion por swipe / mouse drag

El sistema debe permitir navegacion por swipe touch y drag mouse en modo edicion.

Reglas:

- Guardar `startX` al iniciar gesto.
- Calcular `diffX` al terminar.
- Navegar si `abs(diffX) > SWIPE_THRESHOLD_PX`.
- No navegar si `isTransitioning` esta activo.
- No navegar en modo vista.

Valores actuales:

- `SWIPE_THRESHOLD_PX = 34`.

Criterios de aceptacion:

- El swipe debe responder sin sentirse pesado.
- El usuario no debe activar cambios accidentales con micro movimientos.

### 3.2 Requerimientos de interfaz externa

#### 3.2.1 Interfaz de usuario

La UI debe contener:

- Contenedor principal `.app__main`.
- Carrusel `.carousel-viewport`.
- Track `.card-track`.
- Tarjetas `.card`.
- Dots `.carousel-dots`.
- Boton flotante `.action-bar`.
- Bottom sheet `.theme-sheet`.
- Overlay `.sheet-overlay`.
- Purchase overlay `.purchase-overlay`.
- Purchase sheet `.purchase-sheet`.

#### 3.2.2 Interfaz de hardware

No hay interfaz directa de hardware.

El sistema debe responder a:

- Pantalla touch.
- Mouse.
- Trackpad.
- Teclado.

#### 3.2.3 Interfaz de software

El prototipo usa:

- DOM APIs.
- CSS Custom Properties.
- `localStorage`.
- `requestAnimationFrame`.
- `visualViewport` cuando existe.

#### 3.2.4 Interfaz de comunicaciones

No hay comunicacion de red propia.

La pagina depende de recursos externos:

- CDN de Font Awesome.
- Google Fonts.
- Avatar remoto Dicebear.

En produccion, estas dependencias deberian evaluarse por:

- Performance.
- Privacidad.
- Disponibilidad offline/parcial.
- Control visual.

### 3.3 Requerimientos de datos

#### DATA-001: Perfil

El perfil debe modelarse como objeto con:

- `name`.
- `role`.
- `avatar`.
- `location`.
- `links[]`.

Cada link debe contener:

- `title`.
- `url`.
- `icon`.

#### DATA-002: Tema propio

Un tema propio debe contener:

- `id`.
- `name`.
- `variables`.

`variables` debe incluir las custom properties necesarias:

- `--card-bg`.
- `--card-border`.
- `--card-shadow`.
- `--card-backdrop-filter`.
- `--card-font-family`.
- `--card-text-main`.
- `--card-text-subtle`.
- `--card-title-weight`.
- `--card-title-transform`.
- `--card-title-letter-spacing`.
- `--card-link-bg`.
- `--card-link-bg-hover`.
- `--card-link-border`.
- `--card-link-color`.
- `--card-link-backdrop-filter`.

#### DATA-003: Tema marketplace

Un tema marketplace debe contener:

- `id`.
- `name`.
- `price`.
- `variables`.
- `preview`.

`preview` debe contener:

- `--option-bg`.
- `--option-color`.

#### DATA-004: Persistencia local de recientes

El sistema debe persistir solo IDs de temas propios en:

```text
select-theme-1:recent-theme-ids
```

La persistencia no representa:

- Tema activo definitivo.
- Compra.
- Propiedad real.
- Estado remoto.

### 3.4 Requerimientos de estados

#### STATE-001: Estado de modo

Variable:

```js
let isEditMode = false;
```

Clases DOM:

- `app--view-mode`.
- `app--edit-mode`.

Regla:

- Debe existir solo uno de estos modos visuales a la vez.

#### STATE-002: Estado de seleccion

Variable:

```js
let selectedThemeId = recentThemeIds[0];
```

Regla:

- Representa el tema que se esta previsualizando.
- No necesariamente representa un tema guardado remotamente.

#### STATE-003: Estado de carrusel

Variables:

- `currentIndex`.
- `cards`.
- `dots`.
- `isTransitioning`.

Reglas:

- `currentIndex` debe estar acotado al rango de tarjetas.
- `isTransitioning` bloquea navegacion repetida.
- `updateClasses()` es responsable de sincronizar clases visuales.

#### STATE-004: Estado de bottom sheet

Elementos:

- `sheetOverlay.hidden`.
- `themeSheet.hidden`.
- `.sheet-overlay--open`.
- `.theme-sheet--open`.
- `.theme-sheet--searching`.

Reglas:

- `hidden` se remueve antes de animar entrada.
- `hidden` se restaura despues de animar salida.

#### STATE-005: Estado de compra

Elementos:

- `purchaseOverlay.hidden`.
- `purchaseSheet.hidden`.
- `.open`.

Reglas:

- Solo debe abrirse con tema marketplace activo.
- La informacion del panel debe hidratarse antes de mostrar la animacion.

### 3.5 Requerimientos de comportamiento visual

#### UI-001: Tarjeta como foco principal

La tarjeta debe ocupar el centro perceptual de la pantalla.

Criterios:

- El fondo debe ser ambiental y no competir.
- El boton flotante no debe tapar contenido critico.
- En modo vista, no deben mostrarse controles innecesarios.

#### UI-002: Carrusel 3D en modo edicion

En modo edicion:

- La tarjeta activa debe estar centrada.
- La tarjeta anterior debe aparecer a la izquierda, reducida y oscurecida.
- La tarjeta siguiente debe aparecer a la derecha, reducida y oscurecida.
- Las tarjetas lejanas deben estar ocultas.

Valores actuales:

- Prev: `translateX(-70%) translateZ(-150px) scale(0.85)`.
- Next: `translateX(70%) translateZ(-150px) scale(0.85)`.
- Hidden: `translateZ(-300px) scale(0.6)`.

#### UI-003: Modo vista como resultado final

En modo vista:

- La tarjeta activa debe verse ligeramente mas grande.
- Las demas tarjetas deben estar ocultas.
- Los dots deben ocultarse.
- El CTA debe invitar a editar.

#### UI-004: Bottom sheet compacto

El bottom sheet de temas debe:

- Entrar desde abajo.
- Medir `min(45dvh, 720px)`.
- Tener `max-width: 31.25rem`.
- Mostrar handle superior.
- Usar secciones claras: "My themes" y "Explore themes".
- Permitir scroll vertical interno.

#### UI-005: Accion flotante compatible con iOS

El action bar debe:

- Estar fijo abajo.
- Respetar `safe-area-inset-bottom`.
- Ajustarse con `visualViewport`.
- Evitar quedar detras de barras del navegador.

### 3.6 Requerimientos de rendimiento

#### PERF-001: Transicion de carrusel

La transicion del carrusel debe sentirse inmediata pero legible.

Valores actuales:

- Duracion: `360ms`.
- Curva: `cubic-bezier(0.22, 1, 0.36, 1)`.

Criterios:

- No debe sentirse pesada.
- No debe tener rebote excesivo.
- El bloqueo de input debe coincidir con la duracion visual.

#### PERF-002: Re-render local

El sistema puede reconstruir tarjetas y opciones completas porque el volumen de datos es pequeno.

Limite recomendado:

- El enfoque actual es aceptable para decenas bajas de temas.
- Para catalogos grandes, debe migrarse a render parcial, virtualizacion o componentes.

#### PERF-003: Animacion

Las animaciones principales deben usar `transform` y `opacity`.

Criterios:

- Evitar animar propiedades que fuercen layout cuando sea posible.
- Mantener `will-change` solo en elementos que realmente animan.

### 3.7 Requerimientos de accesibilidad

#### ACC-001: Modalidad y roles

El bottom sheet y purchase sheet deben declararse como dialogos.

Estado actual:

- `role="dialog"`.
- `aria-modal="true"`.
- `aria-labelledby`.

Recomendacion para produccion:

- Agregar focus trap.
- Restaurar focus al cerrar.
- Cerrar con Escape.
- Evitar que lectores naveguen contenido detras del modal.

#### ACC-002: Botones con nombres accesibles

Los botones icon-only deben tener `aria-label`.

Estado actual:

- Boton de cierre de temas tiene `aria-label`.
- Boton de cierre de compra tiene `aria-label`.
- Dots generan `aria-label`.

Recomendacion:

- El action button ya tiene texto visible; es aceptable.
- Revisar idioma mixto ingles/espanol.

#### ACC-003: Teclado

El sistema debe permitir:

- Cerrar modales con Escape.
- Navegar carrusel con flechas en modo edicion.

Recomendacion:

- Definir orden de tabulacion dentro de sheets.
- Evitar que flechas cambien carrusel mientras el foco esta en input de busqueda.

### 3.8 Requerimientos de compatibilidad movil

#### MOB-001: Safe area

El prototipo debe respetar areas seguras en dispositivos con barras dinamicas o notch.

Estado actual:

- `viewport-fit=cover`.
- `env(safe-area-inset-bottom)`.
- `visualViewport`.

#### MOB-002: Gestos

El carrusel debe sentirse tactil en modo edicion.

Estado actual:

- Swipe horizontal con threshold.
- `touch-action: pan-y`.
- Wheel/trackpad soportado.

#### MOB-003: Prevencion de scroll horizontal accidental

El sistema debe evitar scroll horizontal de pagina.

Estado actual:

- `body { overflow: hidden; touch-action: pan-y; }`.

Recomendacion:

- Mantener contenedores internos con `overflow-x: hidden` salvo listas horizontales intencionales.

### 3.9 Requerimientos de seguridad y privacidad

El prototipo no maneja datos sensibles reales.

Riesgos a considerar en produccion:

- URLs de avatar remotas exponen carga a terceros.
- Iconos/fuentes CDN pueden filtrar metadata de carga.
- Compra debe pasar por backend seguro.
- Temas comprados no deben depender de estado local manipulable.
- `localStorage` no debe considerarse fuente de verdad para propiedad.

### 3.10 Limitaciones conocidas

- El boton checkout no ejecuta compra.
- Seleccionar un tema marketplace permite preview pero no adquisicion.
- El tema seleccionado no se guarda remotamente.
- No existe separacion entre preview temporal y seleccion confirmada.
- No hay loading states.
- No hay manejo de errores de recursos externos.
- No hay focus trap.
- No hay soporte `prefers-reduced-motion`.
- La busqueda solo filtra por nombre.
- El catalogo esta hardcodeado.
- La mezcla de idioma ingles/espanol debe normalizarse.

---

# Nivel 2: What the user must feel

## 4. Principio rector

El usuario debe sentir:

> "Estoy viendo mi tarjeta real y puedo probar estilos sin perder el control."

La experiencia no debe sentirse como un panel tecnico de configuracion. Debe sentirse como probarse ropa frente a un espejo: el usuario cambia de estilo, ve el resultado inmediatamente y entiende cuando algo es suyo o cuando requiere compra.

## 5. Sensacion esperada por estado

### 5.1 Al abrir la pagina

El usuario debe sentir calma.

Debe percibir:

- Una sola tarjeta como protagonista.
- Una interfaz limpia.
- Un boton claro para editar.
- Cero presion por decidir inmediatamente.

No debe sentir:

- Que esta en un dashboard.
- Que faltan controles.
- Que hay configuraciones ocultas peligrosas.
- Que necesita entender el sistema antes de usarlo.

### 5.2 Al tocar "Editar Diseño"

El usuario debe sentir que la tarjeta se abre a posibilidades.

La transicion a modo edicion debe comunicar:

- "Ahora puedes comparar".
- "Nada se rompio".
- "Sigues viendo tu tarjeta".
- "Puedes regresar al modo vista".

La aparicion de tarjetas laterales debe sentirse como expansion del contexto, no como cambio de pagina.

### 5.3 Al hacer swipe

El usuario debe sentir ligereza.

El gesto debe ser:

- Rapido.
- Preciso.
- Tactil.
- Sin peso excesivo.
- Sin rebote torpe.
- Sin saltos multiples accidentales.

El carrusel debe responder con una distancia de gesto relativamente corta, pero no tan corta que cualquier toque cambie de tarjeta.

Valor emocional:

- "Estoy hojeando estilos".
- "La interfaz me sigue".
- "Puedo explorar sin friccion".

### 5.4 Al ver un tema propio

El usuario debe sentir seguridad.

El boton "Guardar Seleccion" debe comunicar:

- Este tema esta disponible.
- Puedo aplicarlo.
- No hay costo.
- La accion es reversible dentro del flujo de edicion.

La UI no debe provocar duda sobre si se cobrara algo.

### 5.5 Al ver un tema de marketplace

El usuario debe sentir deseo sin confusion.

La tarjeta debe permitir imaginar el resultado final, pero el CTA debe dejar claro que:

- El tema todavia no es suyo.
- La siguiente accion es comprar.
- La previsualizacion no equivale a adquisicion.

La experiencia debe evitar dos extremos:

- Ocultar demasiado el tema pago hasta que pierda atractivo.
- Empujar una compra antes de que el usuario entienda lo que esta comprando.

### 5.6 Al tocar "Mas temas"

El usuario debe sentir descubrimiento.

La tarjeta "Mas temas" debe funcionar como puerta a exploracion.

Debe sentirse:

- Natural.
- Ligera.
- Conectada al carrusel.
- No como un menu administrativo.

El bottom sheet debe aparecer como continuacion del gesto, no como cambio de contexto.

### 5.7 Al abrir el bottom sheet

El usuario debe sentir que tiene mas opciones sin perder la tarjeta.

El bottom sheet debe:

- Entrar desde abajo.
- Cubrir solo lo necesario.
- Mantener una sensacion movil.
- Priorizar opciones visuales.
- Separar temas propios de temas por comprar.

No debe sentirse:

- Saturado.
- Demasiado alto.
- Como una pagina nueva.
- Como un formulario.

### 5.8 Al buscar

El usuario debe sentir foco.

Cuando activa busqueda:

- El header cambia a input.
- El titulo desaparece.
- El foco entra automaticamente.
- Las listas se filtran al escribir.

La busqueda debe sentirse como un refinamiento del catalogo, no como una pantalla aparte.

### 5.9 Al abrir compra

El usuario debe sentir claridad transaccional.

El purchase sheet debe comunicar:

- Que tema esta comprando.
- Cuanto cuesta.
- Que el checkout es la siguiente accion.

La compra debe sentirse como un paso posterior al deseo visual, no como una interrupcion agresiva.

### 5.10 Al cerrar sheets

El usuario debe sentir continuidad.

Cerrar un panel debe regresar al mismo contexto visual.

Debe evitarse:

- Reset brusco.
- Perdida de seleccion.
- Saltos visuales.
- Pantallas en blanco.

---

## 6. Scope UX: UI, GUI, Workflow y User Experience

### 6.1 UI: componentes que importan

#### Tarjeta digital

La tarjeta es el objeto emocional del producto.

Debe:

- Ser visualmente dominante.
- Reflejar cambios inmediatamente.
- Mantener datos reales o realisticos.
- Ser suficientemente grande para evaluar el estilo.

No debe:

- Reducirse a miniatura durante decisiones importantes.
- Quedar escondida detras de controles.
- Perder legibilidad por efectos de tema.

#### Boton flotante

El boton flotante es el contrato de accion.

Debe:

- Tener una sola accion principal.
- Cambiar con el contexto.
- Estar siempre al alcance.
- Respetar barras del navegador en iOS.
- No cubrir la tarjeta de forma molesta.

Estados esperados:

- Editar Diseño.
- Guardar Seleccion.
- Comprar.
- Oculto cuando la tarjeta activa es "Mas temas".

#### Carrusel

El carrusel debe ser comparativo, no decorativo.

Debe:

- Mostrar opciones cercanas.
- Mantener centro claro.
- Usar profundidad como pista visual.
- Permitir swipe, teclado, wheel y click.

No debe:

- Dar mareo.
- Sentirse lento.
- Mostrar demasiadas tarjetas.
- Hacer que el usuario pierda cual es la seleccion activa.

#### Dots

Los dots son orientacion secundaria.

Debe:

- Aparecer solo en edicion.
- Mostrar posicion actual.
- Permitir navegacion directa.

No deben:

- Competir con el CTA.
- Aparecer en modo vista.

#### Bottom sheet

El bottom sheet es el catalogo contextual.

Debe:

- Ser compacto.
- Tener secciones claras.
- Usar cards visuales.
- Permitir scroll vertical.
- Permitir scroll horizontal solo donde sea intencional, como "My themes".

No debe:

- Generar scroll lateral accidental.
- Parecer roto al moverse en X.
- Saturar con texto.

#### Purchase sheet

El panel de compra es una confirmacion comercial.

Debe:

- Mostrar preview del tema.
- Mostrar nombre.
- Mostrar precio.
- Mostrar total.
- Tener CTA claro.

No debe:

- Abrirse para temas propios.
- Ocultar que el usuario sigue en el flujo de estilos.

### 6.2 GUI: lenguaje visual esperado

#### Fondo

El fondo debe actuar como atmosfera.

Debe:

- Dar profundidad.
- No afectar legibilidad.
- No competir con la tarjeta.

#### Temas

Cada tema debe sentirse distinto.

Ejemplos actuales:

- Glassmorphism: moderno, translucido, premium.
- Cyberpunk: fuerte, amarillo, tecnico.
- Minimal Light: limpio, claro, sobrio.
- Terminal: hacker/dev, monocromo verde.
- Sunset Gradient: expresivo, calido.
- OLED Noir: oscuro premium.
- Brutalist: grafico, duro, editorial.
- Soft Pastel: suave, amable.
- Prism: brillante, energetico.
- Forest: natural, profundo.
- Ink Wash: sobrio, editorial.

#### Iconografia

Los iconos deben apoyar la accion, no decorar sin sentido.

Estados:

- Pen: editar.
- Check: guardar.
- Bag: comprar.
- Plus: mas temas.
- X: cerrar.
- Magnifier: buscar.
- Credit card: checkout.

#### Movimiento

El movimiento debe sentirse fisico pero no pesado.

Reglas cualitativas:

- Entrada de sheet: suave, rapida, desde direccion esperada.
- Cambio de tarjeta: inmediato y controlado.
- Boton: micro-feedback al presionar.
- Dots: transicion discreta.

### 6.3 Workflow: flujo ideal

#### Flujo A: Editar y guardar tema propio

1. Usuario ve tarjeta en modo vista.
2. Toca "Editar Diseño".
3. Entra a modo edicion.
4. Navega entre temas recientes.
5. Encuentra tema propio.
6. CTA muestra "Guardar Seleccion".
7. Toca CTA.
8. El sistema vuelve a modo vista o confirma guardado segun implementacion final.

Nota: en el prototipo actual, el click en "Guardar Seleccion" solo alterna modo edicion/vista; no guarda en backend.

#### Flujo B: Explorar mas temas

1. Usuario entra a modo edicion.
2. Navega hasta "Mas temas" o toca sentinel.
3. Se abre bottom sheet.
4. Usuario ve "My themes" y "Explore themes".
5. Selecciona un tema.
6. La tarjeta se actualiza inmediatamente.
7. El sheet permanece abierto para seguir comparando.
8. Usuario cierra sheet o continua explorando.

#### Flujo C: Buscar tema

1. Usuario abre bottom sheet.
2. Toca "Theme search".
3. El input sube al header.
4. Escribe query.
5. Listas se filtran.
6. Si encuentra tema, lo selecciona.
7. Si no hay resultados, ve empty state.

#### Flujo D: Comprar tema

1. Usuario previsualiza tema marketplace.
2. CTA muestra "Comprar".
3. Usuario toca CTA.
4. Se abre purchase sheet.
5. Usuario revisa tema y precio.
6. Usuario toca checkout.

Nota: en el prototipo actual, checkout no esta implementado.

### 6.4 User experience: reglas de sensacion

#### UX-001: La previsualizacion debe ser inmediata

Cuando el usuario selecciona un tema, la tarjeta debe cambiar al instante.

Razon:

- La decision es visual.
- El usuario no debe imaginar el resultado.

#### UX-002: El sistema debe distinguir preview de compromiso

Seleccionar un tema en el sheet debe poder ser preview.

Guardar o comprar debe ser una accion posterior y clara.

Razon:

- Reduce ansiedad.
- Permite exploracion.
- Evita compras o guardados accidentales.

#### UX-003: La accion principal debe ser una frase honesta

El CTA debe decir exactamente lo que ocurrira:

- "Editar Diseño" abre edicion.
- "Guardar Seleccion" confirma tema propio.
- "Comprar" inicia compra.

No debe usar textos ambiguos como:

- "Continuar".
- "Aplicar" para temas pagos.
- "Seleccionar" si implica compra.

#### UX-004: El usuario nunca debe perder orientacion

Siempre debe estar claro:

- Que tarjeta esta activa.
- Si esta en modo vista o edicion.
- Si el tema es suyo o pago.
- Que accion principal esta disponible.
- Como cerrar un panel.

#### UX-005: Los controles deben aparecer cuando hacen falta

En modo vista:

- Ocultar dots.
- Ocultar tarjetas laterales.
- Mostrar solo editar.

En modo edicion:

- Mostrar comparacion.
- Mostrar dots.
- Mostrar CTA contextual.

En exploracion:

- Mostrar catalogo.
- Mantener preview.

#### UX-006: El flujo debe sentirse movil primero

Aunque funcione en desktop, la experiencia debe sentirse pensada para touch:

- Boton inferior.
- Bottom sheet.
- Swipe.
- Safe area.
- Paneles deslizantes.

#### UX-007: Evitar sensacion de ruptura

No deben ocurrir:

- Shifts bruscos.
- Apariciones instantaneas sin transicion.
- Scroll horizontal accidental.
- Botones detras de UI del navegador.
- Estados visuales que contradigan la accion.

---

## 7. Criterios de aceptacion UX

### 7.1 Vista inicial

Aceptable si:

- La tarjeta se entiende como resultado final.
- El usuario identifica "Editar Diseño" en menos de 2 segundos.
- No hay scroll lateral.
- El boton no queda detras de barras del navegador.

No aceptable si:

- Hay controles visibles que parecen editor.
- La tarjeta se ve como preview secundaria.
- El CTA tapa contenido importante.

### 7.2 Modo edicion

Aceptable si:

- La aparicion de tarjetas laterales se entiende como carrusel.
- El swipe responde sin sentirse pesado.
- El usuario entiende que puede comparar.
- El estado activo es obvio.

No aceptable si:

- El carrusel tarda demasiado.
- Hay rebote exagerado.
- El gesto se siente tosco.
- Cambia mas de una tarjeta por accidente.

### 7.3 Bottom sheet

Aceptable si:

- Abre de forma suave.
- Secciones son claras.
- Search es facil de encontrar.
- Opciones se sienten visuales.
- No hay desplazamiento horizontal accidental del sheet completo.

No aceptable si:

- El sheet parece roto al moverse en X.
- La busqueda desplaza demasiado contenido.
- Las opciones se ven saturadas.

### 7.4 Seleccion de tema

Aceptable si:

- La tarjeta cambia inmediatamente.
- La opcion seleccionada se marca.
- El CTA se actualiza correctamente.
- El usuario entiende si debe guardar o comprar.

No aceptable si:

- El tema seleccionado no coincide entre card, sheet y CTA.
- Un tema pago parece gratuito.
- Un tema propio parece requerir compra.

### 7.5 Compra

Aceptable si:

- El panel muestra tema y precio correctos.
- La transicion se siente como paso posterior.
- Cerrar regresa al contexto previo.

No aceptable si:

- El panel aparece sin tema claro.
- El usuario no sabe que esta comprando.
- El cierre resetea la exploracion.

---

## 8. Recomendaciones para llevar al sistema nuevo

### 8.1 Convertir conceptos en modulos

Separar:

- `ThemeCatalog`.
- `ThemePreviewCard`.
- `ThemeCarousel`.
- `ThemeBottomSheet`.
- `ThemePurchaseSheet`.
- `ThemeActionButton`.
- `ThemeStateController`.

### 8.2 Separar estados clave

En produccion conviene distinguir:

- `savedThemeId`: tema guardado real.
- `previewThemeId`: tema que el usuario esta viendo.
- `activeCarouselIndex`: indice visual.
- `ownedThemeIds`: propiedad real del usuario.
- `recentThemeIds`: historial de uso.
- `isEditing`: modo del editor.
- `isThemeSheetOpen`.
- `isPurchaseSheetOpen`.

### 8.3 Mantener WYSIWYG como regla central

No llevar el selector a un formulario separado si rompe la decision visual.

El usuario debe ver el resultado en la tarjeta mientras decide.

### 8.4 Integracion con WordPress + GraphQL

Cuando se conecte al sistema nuevo:

- WordPress debe servir el tema guardado dentro del JSON del perfil.
- GraphQL debe entregar datos suficientes para pintar la tarjeta.
- El frontend debe distinguir tema guardado de tema en preview.
- Guardar seleccion debe persistir el ID del tema o el bloque de preferencias correspondiente.
- Temas marketplace deben venir con metadata de propiedad/precio.

### 8.5 Reglas de guardado

Recomendacion:

- Cambiar tema en el carrusel o sheet = preview local.
- Tocar "Guardar Seleccion" = persistencia real.
- Tocar "Comprar" = flujo comercial.
- Compra exitosa = tema pasa a owned y puede guardarse.

### 8.6 Reglas de motion

Mantener:

- Carrusel alrededor de 320-380ms.
- Bottom sheet alrededor de 300-360ms.
- Evitar curvas con rebote exagerado.
- Respetar `prefers-reduced-motion`.

### 8.7 Reglas de accesibilidad pendientes

Antes de produccion:

- Focus trap en sheets.
- Restaurar foco al cerrar.
- Bloquear lectura/tab al fondo.
- Soporte completo de teclado.
- Textos en un solo idioma.
- Estados `aria-selected` para opciones.
- `aria-live` discreto para cambios de seleccion si aplica.

---

## 9. Trazabilidad rapida

| Concepto | Implementacion actual |
| --- | --- |
| Modo vista | `body.app--view-mode` |
| Modo edicion | `body.app--edit-mode` |
| Tema seleccionado | `selectedThemeId` |
| Recientes | `recentThemeIds` + `localStorage` |
| Temas propios | `themesData` |
| Temas marketplace | `marketplaceThemesData` |
| Render de tarjetas | `renderCards()` |
| Posiciones del carrusel | `updateClasses()` |
| Navegacion | `goToIndex()` |
| Seleccion de tema | `selectTheme()` |
| Bottom sheet | `openThemeSheet()` / `closeThemeSheet()` |
| Busqueda | `activateThemeSearch()` / `renderThemeSheet()` |
| Compra mock | `openPurchaseSheet()` / `closePurchaseSheet()` |
| CTA contextual | `syncActionButtonState()` |
| Swipe | `touchStart()` / `touchEnd()` |
| Wheel | listener `wheel` + `triggerWheelCooldown()` |
| iOS/browser UI offset | `syncActionBarViewportOffset()` |

---

## 10. Conclusiones

`select-theme-1.html` es un buen referente de flujo porque mantiene la decision visual cerca del objeto final: la tarjeta.

Lo que conviene rescatar:

- El cambio claro entre vista y edicion.
- La accion principal contextual.
- La exploracion WYSIWYG.
- El bottom sheet como catalogo compacto.
- La distincion entre tema propio y tema pago.
- El gesto de swipe como navegacion natural.
- La proteccion del boton flotante ante barras moviles de navegador.

Lo que no debe copiarse literalmente:

- Todo en un solo HTML.
- Estado mezclado con DOM global.
- Compra mock sin backend.
- Falta de focus trap.
- Persistencia solo en `localStorage`.
- Idioma mixto.
- Catalogo hardcodeado.

La direccion recomendada para el sistema nuevo es conservar la experiencia: una tarjeta viva, editable, directa y tactil; pero reconstruir la arquitectura con datos reales, estado separado y contratos claros entre WordPress, GraphQL y frontend.
