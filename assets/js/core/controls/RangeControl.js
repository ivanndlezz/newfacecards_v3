import { BaseControl } from './BaseControl.js';
import { coerce } from '../utils/coerce.js';

export class RangeControl extends BaseControl {
  bind() {
    const eventType = this.def.event || 'input';
    this.root.addEventListener(eventType, () => {
      const value = coerce(this.root.value);
      this.writeState(value);
    });
  }

  apply(value) {
    const hasValue = value !== undefined && value !== null && value !== '';
    const fallbackValue = this.root.getAttribute('value') || '';
    const finalVal = hasValue ? value : fallbackValue;

    if (this.target) {
      if (hasValue && this.def.cssVar) {
        super.apply(value);
      } else if (this.def.cssVar) {
        this.target.style.removeProperty(this.def.cssVar);
      }
    }
    if (String(this.root.value) !== String(finalVal)) {
      this.root.value = finalVal;
    }
    
    // Sync display elements
    const display = this.previewRoot.querySelector 
      ? this.previewRoot.querySelector(`#${this.def.id}-val`) 
      : null;
    if (display) {
      display.textContent = hasValue ? `${value}${this.def.unit || ''}` : '';
    }
  }
}
