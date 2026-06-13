// BaseControl.js – abstract base class for all controls
import { coerce } from '../utils/coerce.js';
import { CssVarStrategy } from '../strategies/CssVarStrategy.js';
import { CssPropStrategy } from '../strategies/CssPropStrategy.js';
import { SideEffectStrategy } from '../strategies/SideEffectStrategy.js';
import { isNativeInput } from '../utils/dom.js';

export class BaseControl {
  /**
   * @param {Element} root - the root element that emits events (e.g., button container or input)
   * @param {Object} def - control definition JSON
   * @param {Object} store - StateStore instance
   * @param {Element} previewRoot - the preview container (used to locate target element)
   */
  constructor(root, def, store, previewRoot) {
    this.root = root;
    this.def = def;
    this.store = store;
    this.previewRoot = previewRoot;
    this.target = previewRoot.querySelector(def.target);
    // Prepare strategies based on definition
    this.strategies = [];
    if (def.cssVar) this.strategies.push(new CssVarStrategy());
    if (def.cssProp) this.strategies.push(new CssPropStrategy());
    if (def.onApply) this.strategies.push(new SideEffectStrategy());
  }

  // Sub‑classes must implement bind()
  bind() {
    throw new Error('BaseControl.bind must be overridden');
  }

  // Apply value using all configured strategies
  apply(value) {
    if (!this.target) throw new Error('Target element not found: ' + this.def.target);
    for (const strat of this.strategies) {
      strat.apply(this.target, value, this.def);
    }
  }

  // Helper to write to store and update UI
  writeState(value) {
    this.store.set(this.def.statePath, value);
    this.apply(value);
  }
}
