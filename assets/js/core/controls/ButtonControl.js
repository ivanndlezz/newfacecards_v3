import { BaseControl } from './BaseControl.js';
import { coerce } from '../utils/coerce.js';
import { dataKey } from '../utils/dom.js';

export class ButtonControl extends BaseControl {
  bind() {
    const eventType = this.def.event || 'click';
    const attr = this.def.valueAttr || 'value';
    const key = dataKey(attr);

    this.root.addEventListener(eventType, (e) => {
      const item = e.target.closest(`[data-${attr}]`);
      if (!item || !this.root.contains(item)) return;
      const raw = item.dataset[key];
      const value = this.resolveValue(raw);
      this.writeState(value);
    });
  }

  resolveValue(raw) {
    if (this.def.values && Object.prototype.hasOwnProperty.call(this.def.values, raw)) {
      return this.def.values[raw];
    }
    return coerce(raw);
  }

  apply(value) {
    const hasValue = value !== undefined && value !== null && value !== '';
    if (this.target) {
      if (hasValue && this.def.cssVar) {
        super.apply(value);
      } else if (this.def.cssVar) {
        this.target.style.removeProperty(this.def.cssVar);
      }
    }
    
    // Sync active status on button elements
    const attr = this.def.valueAttr || 'value';
    const key = dataKey(attr);
    const active = this.def.activeStatus || 'active';
    const inactive = this.def.inactiveStatus || 'unset';

    this.root.querySelectorAll(`[data-${attr}]`).forEach((item) => {
      const raw = item.dataset[key];
      const itemValue = this.resolveValue(raw);
      const isSelected = hasValue && String(itemValue) === String(value);
      
      item.dataset.status = isSelected ? active : inactive;
      
      // Also sync standard "active" class
      if (isSelected) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Sync display elements
    const display = this.previewRoot.querySelector 
      ? this.previewRoot.querySelector(`#${this.def.id}-val`) 
      : null;
    if (display) {
      display.textContent = hasValue ? `${value}${this.def.unit || ''}` : '';
    }
  }
}
