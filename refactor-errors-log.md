# Bitácora de Errores y Soluciones de Refactorización

## 1. Error de Bucle de Toggle (Apariencia e Island Menu)

### Síntomas
Al hacer clic en el botón de **Apariencia** (`apariencia`) en el island menu, la interfaz del carrusel de temas se abría e inmediatamente se volvía a cerrar. Este comportamiento resultaba inconsistente con el botón hermano **Perfil** (`cardbar`), el cual sí funcionaba correctamente como un interruptor de encendido/apagado (toggle).

### Diagnóstico / Causa Raíz
Se identificó una llamada recursiva indirecta al cambiar de modo del island:
1. El usuario hace clic en el botón de modo `"apariencia"`.
2. El island despacha el evento `island-mode-change` con el nuevo modo (`"apariencia"`).
3. El listener en `index.html` ejecuta `handleIslandMode("apariencia")`.
4. Dentro de ese flujo, para asegurarse de cerrar el editor anterior de perfil, se invocaba `closeProfileEditor(true)`.
5. El parámetro `true` (`fullyExit`) obligaba a `closeProfileEditor` a reiniciar el island llamando a `island.setActiveMode(null)`.
6. Esto re-despachaba `island-mode-change` con `mode: null`, provocando que `handleIslandMode` interpretara que se debía apagar todo (Toggle OFF) y cerrara el carrusel de temas inmediatamente.

### Solución
Se modificaron las invocaciones de `closeProfileEditor` dentro del manejador `handleIslandMode` en `index.html` para pasar `false` como parámetro:
```javascript
if (typeof closeProfileEditor === "function") {
  closeProfileEditor(false); // Cierra la UI visual pero NO reinicia el estado del Island
}
```
Esto permite al usuario transicionar libremente de un sub-modo a otro sin que se cancele la acción activa en el island menu.
