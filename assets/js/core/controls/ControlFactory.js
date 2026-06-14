import { ButtonControl } from './ButtonControl.js';
import { RangeControl } from './RangeControl.js';
import { NativeInputControl } from './NativeInputControl.js';

export class ControlFactory {
  /**
   * Create a control instance from a DOM element that has data-control-sync
   */
  static create(rootEl, syncEngine) {
    const def = this._readDefFromElement(rootEl);
    if (!def) return null;
    return this.createFromDef(rootEl, def, syncEngine.store, document);
  }

  /**
   * Create a control instance from a DOM element and a definition object
   */
  static createFromDef(rootEl, def, store, previewRoot) {
    const tag = rootEl.tagName;
    const isNative = tag === 'SELECT' || tag === 'TEXTAREA' || (tag === 'INPUT' && rootEl.type !== 'button' && rootEl.type !== 'submit');
    if (isNative) {
      if (rootEl.type === 'range') {
        return new RangeControl(rootEl, def, store, previewRoot);
      }
      return new NativeInputControl(rootEl, def, store, previewRoot);
    }
    return new ButtonControl(rootEl, def, store, previewRoot);
  }

  static _readDefFromElement(el) {
    const id = el.dataset.controlSync;
    if (!id) return null;
    
    // Read and parse values mapping, default to empty object
    let values = {};
    if (el.dataset.values) {
      try {
        values = JSON.parse(el.dataset.values);
      } catch (e) {
        console.error('Failed to parse data-values JSON on element:', el, e);
      }
    }

    return {
      id,
      root: `[data-control-sync='${id}']`,
      target: el.dataset.target,
      cssVar: el.dataset.cssVar,
      cssProp: el.dataset.cssProp,
      unit: el.dataset.unit || '',
      event: el.dataset.event ?? (el.tagName === 'INPUT' ? 'input' : 'click'),
      valueAttr: el.dataset.valueAttr ?? 'value',
      activeStatus: el.dataset.activeStatus ?? 'active',
      inactiveStatus: el.dataset.inactiveStatus ?? 'unset',
      statePath: el.dataset.statePath || `controls.${id}`,
      trueValue: el.dataset.trueValue,
      falseValue: el.dataset.falseValue,
      values
    };
  }
}
