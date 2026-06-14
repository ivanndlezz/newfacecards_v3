import { BaseControl } from './BaseControl.js';
import { coerce } from '../utils/coerce.js';

export class NativeInputControl extends BaseControl {
  bind() {
    const isCheckbox = this.root.type === 'checkbox';
    const eventType = this.def.event || (isCheckbox || this.root.tagName === 'SELECT' ? 'change' : 'input');
    
    this.root.addEventListener(eventType, () => {
      let value;
      if (isCheckbox) {
        value = this.root.checked;
      } else {
        value = coerce(this.root.value);
      }
      this.writeState(value);
    });
  }

  apply(value) {
    if (this.target) {
      super.apply(value);
    }
    
    const isCheckbox = this.root.type === 'checkbox';
    if (isCheckbox) {
      if (this.root.checked !== !!value) {
        this.root.checked = !!value;
      }
    } else {
      if (String(this.root.value) !== String(value)) {
        this.root.value = value;
      }
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
