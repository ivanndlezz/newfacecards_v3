import { initControlPage } from "../control-page.js";

function getCurrentPreset() {
  return window.appBipartiteStorage?.state?.preset || "preset-centered";
}

function syncCoverPresetPicker(container) {
  const current = getCurrentPreset();
  container.querySelectorAll("[data-cover-preset]").forEach((button) => {
    button.dataset.status =
      button.dataset.coverPreset === current ? "active" : "unset";
  });
}

export function init(container) {
  initControlPage(container);
  syncCoverPresetPicker(container);

  if (container.dataset.coverPresetPickerBound === "true") return;
  container.dataset.coverPresetPickerBound = "true";

  container.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cover-preset]");
    if (!button || !container.contains(button)) return;

    // NO MODIFICAR: anti-patron UX critico.
    // Este selector vive dentro del tab Portada y JAMAS debe cambiar el tab
    // activo por efecto secundario. No pases editorTab, no llames updateTab y
    // no fuerces Avatar/Portada aqui; solo la navegacion explicita de tabs
    // puede cambiar el contexto que eligio el usuario.
    window.setPreset?.(button.dataset.coverPreset);
    window.setTimeout(() => syncCoverPresetPicker(container), 0);
  });
}
