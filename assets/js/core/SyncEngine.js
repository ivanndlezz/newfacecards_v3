import { StateStore } from './StateStore.js';
import { ControlFactory } from './controls/ControlFactory.js';

export class SyncEngine {
  /**
   * @param {Object} storage - backing storage object (e.g., window.appBipartiteStorage)
   */
  constructor(storage) {
    this.storage = storage;
    this.store = new StateStore(storage?.state ?? {});
    this.controls = new Map(); // id -> Control instance
  }

  setStorage(storage) {
    this.storage = storage;
    // Sync current internal state with new storage state
    if (storage?.state) {
      this.store.state = storage.state;
    }
  }

  register(ctrl) {
    if (!ctrl?.def?.id) return;
    if (this.controls.has(ctrl.def.id)) return;
    if (ctrl.root.dataset.syncBound === 'true') return;
    
    ctrl.root.dataset.syncBound = 'true';
    this.controls.set(ctrl.def.id, ctrl);
    
    // Initial UI state setup
    const cur = this.store.get(ctrl.def.statePath);
    if (cur !== undefined) {
      ctrl.apply(cur);
    }
    
    // Setup listener to react to user inputs
    ctrl.bind();
  }

  registerFromDefinition(def) {
    // def might not have a root if defined programmatically, but usually it does
    const root = document.querySelector(def.root);
    if (!root) return;
    const ctrl = ControlFactory.createFromDef(root, def, this.store, document);
    if (ctrl) {
      this.register(ctrl);
    }
    return ctrl;
  }

  applyAll(state = this.store.state) {
    this.store.state = state;
    this.controls.forEach(ctrl => {
      const val = this.store.get(ctrl.def.statePath);
      if (val !== undefined) {
        ctrl.apply(val);
      }
    });
  }

  applyControl(id, value) {
    const ctrl = this.controls.get(id);
    if (!ctrl) return;
    ctrl.apply(value);
  }

  write(id, value) {
    const ctrl = this.controls.get(id);
    if (!ctrl) return;
    this.store.set(ctrl.def.statePath, value);
    if (this.storage?.saveLocal) {
      this.storage.saveLocal();
    }
    this.applyControl(id, value);
  }
}
