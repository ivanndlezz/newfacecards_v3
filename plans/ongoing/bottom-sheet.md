Premium Dynamic Bottom Sheet - Documentación Técnica

Un componente de interfaz de usuario (UI) modular, táctil y de alto rendimiento diseñado para aplicaciones web móviles. Permite inyectar contenido dinámicamente sin necesidad de recargar el DOM completo.

✨ Características Principales

Física y Gestos: Soporte nativo para drag-to-close (arrastrar para cerrar) tanto en dispositivos táctiles como con ratón.

Inyección Modular: Arquitectura dividida en zonas (Left, Center, Right, Content, Footer) para reescribir solo lo necesario.

Rendimiento: Animaciones optimizadas usando transform y will-change.

Accesibilidad Básica: Manejo de aria-modal, role="dialog", y bloqueo de scroll en el body (overscroll containment).

Event Delegation: Cierre automático asignando el atributo data-action="close" a cualquier elemento inyectado.

🏗 Arquitectura del DOM

El componente requiere dos elementos principales en el HTML base: el Backdrop (fondo oscuro) y el Sheet (contenedor principal).

<!-- 1. Fondo opaco -->
<div class="sheet-backdrop" id="main-backdrop" data-state="closed"></div>

<!-- 2. Contenedor principal del Bottom Sheet -->
<div class="bottom-sheet" id="main-sheet" data-state="closed" aria-modal="true" role="dialog">
  
  <!-- Zona de arrastre (Pill) -->
  <div class="sheet-handler-area"><div class="sheet-drag-pill"></div></div>
  
  <!-- Header Dividido en 3 zonas -->
  <header class="sheet-header">
    <div class="sheet-header-left" id="sheet-header-left"></div>
    <div class="sheet-header-center" id="sheet-header-center"></div>
    <div class="sheet-header-right" id="sheet-header-right"></div>
  </header>
  
  <!-- Contenedor principal con scroll independiente -->
  <div class="sheet-content-slots" id="sheet-content"></div>
  
  <!-- Footer fijo (opcional) -->
  <div class="sheet-sticky-controls" id="sheet-footer" style="display: none;"></div>
</div>


🎨 Tematización (CSS Variables)

El componente utiliza variables CSS en el :root para facilitar su integración con cualquier sistema de diseño o modo oscuro (Dark Mode).

:root {
  /* Colores */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F7F7F9;
  --text-primary: #222222;
  --text-secondary: #717171;
  --border-color: #EBEBEB;
  --brand-color: #E61E4D; 
  
  /* Animación de la hoja */
  --sheet-transition-duration: 0.5s;
  --spring-easing: cubic-bezier(0.32, 0.72, 0, 1);
}


⚙️ Referencia de la API (JavaScript)

La clase BottomSheet expone métodos sencillos para el control programático del componente.

Inicialización

// Se instancian los IDs del Sheet y del Backdrop. 
// El método .hydrate() añade los event listeners (drag, click, delegation).
const dynamicSheet = new BottomSheet('main-sheet', 'main-backdrop').hydrate();


Propiedades de la Instancia

sheet: Referencia al nodo DOM del bottom sheet.

backdrop: Referencia al nodo DOM del fondo.

isOpen: Booleano que indica el estado actual.

zones: Objeto que contiene las referencias a los nodos donde se inyecta el HTML (headerLeft, headerCenter, headerRight, content, footer).

Métodos

open()

Despliega el Bottom Sheet, aplica los estados data-state="open" y bloquea el scroll del body.

close()

Oculta el Bottom Sheet. La transición la maneja el CSS mediante la variable --sheet-transform.

configure(configObject)

El método central del componente. Permite inyectar HTML en las distintas zonas del componente. Solo sobrescribe las propiedades declaradas.

Parámetro

Tipo

Descripción

headerLeft

String (HTML)

Contenido de la izquierda (ej. Botón de retroceso/cerrar).

headerCenter

String (HTML/Text)

Contenido central (ej. Título o Barra de búsqueda). El componente envuelve textos planos en un <h2> automáticamente.

headerRight

String (HTML)

Contenido de la derecha (ej. Botones de acción como Compartir/Guardar).

content

String (HTML)

El cuerpo principal del sheet. Soporta scroll vertical.

footer

String (HTML) | null

Área estática inferior. Si se pasa null, el footer se oculta (display: none).

🚀 Guía Rápida de Uso

1. Inyectar contenido básico

Este patrón es ideal para manejar el evento click de un botón y armar la vista dinámica al vuelo.

document.getElementById('mi-boton').addEventListener('click', () => {
  dynamicSheet.configure({
    headerLeft: `<button class="icon-btn" data-action="close">X</button>`,
    headerCenter: 'Título del Modal',
    headerRight: '',
    content: `<p>Este es el contenido principal dinámico.</p>`,
    footer: `<button class="btn-primary" data-action="close">Aceptar</button>`
  });
  
  dynamicSheet.open();
});


2. Cerrar desde elementos dinámicos (data-action="close")

No es necesario adjuntar eventos manualmente a los botones de cierre inyectados. Simplemente añade el atributo data-action="close" a cualquier botón (incluso en el footer o el contenido) y el Event Delegation interno de la clase cerrará el Bottom Sheet automáticamente al hacer clic en él.

<!-- Se cerrará al hacer clic sin JS adicional -->
<button data-action="close">Cancelar y cerrar</button>


3. Flujos Multi-paso

Para cambiar de vista sin cerrar el sheet, simplemente vuelve a llamar a configure() con el nuevo contenido. El componente restablecerá automáticamente el scroll (scrollTop = 0) para garantizar una transición limpia.

function irAlPaso2() {
  dynamicSheet.configure({
    headerCenter: 'Paso 2',
    content: '<p>Has avanzado al siguiente paso.</p>'
    // headerLeft, headerRight y footer mantendrán el estado anterior si se omiten.
  });
}
