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

    window.setPreset?.(button.dataset.coverPreset, { editorTab: "cover" });
    window.setTimeout(() => syncCoverPresetPicker(container), 0);
  });
}
