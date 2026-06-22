import { initControlPage } from "../control-page.js";

function coerce(value) {
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function syncFineRange(container, id) {
  const value = window.syncEngine?.store.get(`controls.${id}`);
  if (value === undefined || value === null || value === "") return;
  container
    .querySelectorAll(`.fine-control__range[data-control-view="${id}"]`)
    .forEach((range) => {
      range.value = value;
    });
}

export function init(container) {
  initControlPage(container);

  if (container.dataset.avatarFineControlsBound === "true") return;
  container.dataset.avatarFineControlsBound = "true";

  container.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-fine-toggle]");
    if (!toggle || !container.contains(toggle)) return;

    const id = toggle.dataset.fineToggle;
    const panel = container.querySelector(`[data-fine-panel="${id}"]`);
    if (!panel) return;

    const shouldOpen = panel.hidden;
    container.querySelectorAll("[data-fine-panel]").forEach((item) => {
      item.hidden = true;
    });
    container.querySelectorAll("[data-fine-toggle]").forEach((item) => {
      item.setAttribute("aria-expanded", "false");
      item.classList.remove("is-open");
    });

    panel.hidden = !shouldOpen;
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    toggle.classList.toggle("is-open", shouldOpen);
    if (shouldOpen) syncFineRange(container, id);
  });

  container.addEventListener("click", (event) => {
    const option = event.target.closest(".ctrl-page--avatar [data-value]");
    const control = option?.closest("[data-control-sync]");
    const id = control?.dataset.controlSync;
    if (!id || !container.contains(option)) return;

    window.setTimeout(() => syncFineRange(container, id), 0);
  });

  container.addEventListener("input", (event) => {
    const range = event.target.closest(".fine-control__range[data-control-view]");
    if (!range || !container.contains(range)) return;

    const id = range.dataset.controlView;
    const value = coerce(range.value);
    window.syncEngine?.store.set(`controls.${id}`, value);
    window.syncEngine?.applyControl(id, value);

    const storage = window.appBipartiteStorage;
    if (storage && !storage.isApplyingState) {
      storage.state.controls[id] = value;
      storage.saveLocal?.();
    }
  });
}
