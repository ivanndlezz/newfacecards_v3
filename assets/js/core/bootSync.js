// bootSync.js – entry point for the Sync system
import { SyncEngine } from './SyncEngine.js';
import { ControlFactory } from './controls/ControlFactory.js';

const storage = window.appBipartiteStorage || { state: window.appState || {} };
const syncEngine = new SyncEngine(storage);

// Register all controls already having the data-control-sync attribute in DOM
document.querySelectorAll('[data-control-sync]').forEach(rootEl => {
  const ctrl = ControlFactory.create(rootEl, syncEngine);
  if (ctrl) syncEngine.register(ctrl);
});

// Expose globally
window.syncEngine = syncEngine;

// Backward-compatible registry proxy
window.ControlSyncRegistry = {
  connectStorage(s) {
    syncEngine.setStorage(s);
  },
  define(def) {
    if (!def?.id) return;
    const normalized = {
      event: def.event || (def.root && document.querySelector(def.root)?.tagName === 'INPUT' ? 'input' : 'click'),
      valueAttr: "value",
      activeStatus: "active",
      inactiveStatus: "unset",
      statePath: `controls.${def.id}`,
      ...def,
    };
    return syncEngine.registerFromDefinition(normalized);
  },
  applyAll(state) {
    syncEngine.applyAll(state);
  },
  applyControl(id, value) {
    syncEngine.applyControl(id, value);
  }
};
