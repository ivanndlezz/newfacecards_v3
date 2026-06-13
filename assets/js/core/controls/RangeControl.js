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
    if (this.target) {
      super.apply(value);
    }
    if (String(this.root.value) !== String(value)) {
      this.root.value = value;
    }
    
    // Sync display elements
    const display = this.previewRoot.querySelector 
      ? this.previewRoot.querySelector(`#${this.def.id}-val`) 
      : null;
    if (display) {
      display.textContent = `${value}${this.def.unit || ''}`;
    }
  }
}
