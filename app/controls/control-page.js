function coerce(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function dataKey(name) {
  return name.replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());
}

function setPath(obj, path, value) {
  const parts = path.split(".");
  const key = parts.pop();
  let target = obj;
  for (const part of parts) {
    if (!target[part] || typeof target[part] !== "object") target[part] = {};
    target = target[part];
  }
  target[key] = value;
}

function getPath(obj, path) {
  return path.split(".").reduce((target, key) => (target ? target[key] : undefined), obj);
}

function resolveButtonValue(root, option) {
  const attr = root.dataset.valueAttr || "value";
  const raw = option.dataset[dataKey(attr)];
  if (!root.dataset.values) return coerce(raw);
  try {
    const values = JSON.parse(root.dataset.values);
    return Object.prototype.hasOwnProperty.call(values, raw)
      ? values[raw]
      : coerce(raw);
  } catch {
    return coerce(raw);
  }
}

function getStatePath(id, view) {
  return view.dataset.statePath || `controls.${id}`;
}

function getControlValue(id, view) {
  const storageValue = getPath(window.appBipartiteStorage?.state || {}, getStatePath(id, view));
  if (storageValue !== undefined) return storageValue;
  return window.syncEngine?.store.get(getStatePath(id, view));
}

function applyPreviewControl(id, value) {
  if (window.syncEngine?.controls?.has(id)) {
    window.syncEngine.store.set(`controls.${id}`, value);
    window.syncEngine.applyControl(id, value);
  }
}

function writeCorpus(control, value) {
  const storage = window.appBipartiteStorage;
  if (!storage || storage.isApplyingState) return;

  const id = control.dataset.controlSync;
  const path = control.dataset.statePath || `controls.${id}`;

  if (path === "preset") {
    storage.updatePreset?.(value);
    return;
  }
  if (path === "position") {
    storage.updatePosition?.(value);
    return;
  }
  if (path === "coverStyle") {
    storage.updateCoverStyle?.(value);
    return;
  }

  setPath(storage.state, path, value);
  storage.saveLocal?.();
}

function writeControlValue(id, view, value) {
  const numericValue = coerce(value);
  applyPreviewControl(id, numericValue);

  const storage = window.appBipartiteStorage;
  if (storage && !storage.isApplyingState) {
    setPath(storage.state, getStatePath(id, view), numericValue);
    storage.saveLocal?.();
  }
}

function readViewValue(view, option) {
  if (option) return resolveButtonValue(view, option);
  if (view.type === "checkbox") return view.checked;
  return view.value;
}

function applyView(view, value) {
  const unit = view.dataset.unit || "";
  const hasValue = value !== undefined && value !== "" && value !== null;
  if (view.matches("input, select, textarea")) {
    if (view.type === "checkbox") {
      view.checked = !!value;
    } else {
      const fallbackValue = view.getAttribute("value") || "";
      const finalVal = hasValue ? value : fallbackValue;
      if (String(view.value) !== String(finalVal)) {
        view.value = finalVal;
      }
    }
    return;
  }

  const attr = view.dataset.valueAttr || "value";
  const active = view.dataset.activeStatus || "active";
  const inactive = view.dataset.inactiveStatus || "unset";
  view.querySelectorAll(`[data-${attr}]`).forEach((option) => {
    const optionValue = resolveButtonValue(view, option);
    const isSelected = hasValue && String(optionValue) === String(value);
    option.dataset.status = isSelected ? active : inactive;
  });

  const target = view.dataset.previewTarget
    ? document.querySelector(view.dataset.previewTarget)
    : view.querySelector("[data-control-preview]");
  if (target && view.dataset.previewVar) {
    if (hasValue) {
      target.style.setProperty(view.dataset.previewVar, `${value}${unit}`);
    } else {
      target.style.removeProperty(view.dataset.previewVar);
    }
  }
}

function syncControlViews(container, id, value) {
  const hasValue = value !== undefined && value !== "" && value !== null;
  container.querySelectorAll(`[data-control-view="${id}"]`).forEach((view) => {
    applyView(view, value);
  });
  document.querySelectorAll(`[data-control-view-value="${id}"]`).forEach((el) => {
    el.textContent = hasValue ? `${value}${el.dataset.unit || ""}` : "";
  });
}

export function bindControlViews(container) {
  container.querySelectorAll("[data-control-view]").forEach((view) => {
    const id = view.dataset.controlView;
    const value = getControlValue(id, view);
    if (value !== undefined) syncControlViews(container, id, value);
  });

  container.addEventListener("input", (event) => {
    const view = event.target.closest("[data-control-view]");
    if (!view || !container.contains(view)) return;
    if (event.target.matches(".chip-radio") && event.target !== view) return;
    const id = view.dataset.controlView;
    const value = readViewValue(view);
    writeControlValue(id, view, value);
    syncControlViews(container, id, coerce(value));
  });

  container.addEventListener("change", (event) => {
    const view = event.target.closest("[data-control-view]");
    if (!view || !container.contains(view)) return;
    if (event.target.matches(".chip-radio") && event.target !== view) return;
    const id = view.dataset.controlView;
    const value = readViewValue(view);
    writeControlValue(id, view, value);
    syncControlViews(container, id, coerce(value));
  });

  container.addEventListener("click", (event) => {
    const option = event.target.closest("[data-val], [data-value]");
    const view = option?.closest("[data-control-view]");
    if (!view || !container.contains(view)) return;
    const id = view.dataset.controlView;
    const value = readViewValue(view, option);
    writeControlValue(id, view, value);
    syncControlViews(container, id, coerce(value));
  });
}

export function initControlPage(container) {
  if (!container || container.dataset.appControlsBound === "true") return;
  container.dataset.appControlsBound = "true";
  bindControlViews(container);

  container.addEventListener("input", (event) => {
    const control = event.target.closest("[data-control-sync]");
    if (!control || !container.contains(control)) return;
    const value = control.type === "checkbox" ? control.checked : coerce(control.value);
    writeCorpus(control, value);
  });

  container.addEventListener("change", (event) => {
    const control = event.target.closest("[data-control-sync]");
    if (!control || !container.contains(control)) return;
    const value = control.type === "checkbox" ? control.checked : coerce(control.value);
    writeCorpus(control, value);
  });

  container.addEventListener("click", (event) => {
    const option = event.target.closest("[data-val], [data-value]");
    const control = option?.closest("[data-control-sync]");
    if (!control || !container.contains(control)) return;
    writeCorpus(control, resolveButtonValue(control, option));
  });
}
