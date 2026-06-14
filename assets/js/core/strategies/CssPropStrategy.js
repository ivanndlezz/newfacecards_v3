// CssPropStrategy.js – applies a value via a direct CSS property (e.g., width, height)
import { ApplyStrategy } from './ApplyStrategy.js';

export class CssPropStrategy extends ApplyStrategy {
  apply(target, value, def) {
    let finalValue = value;
    if (typeof value === 'boolean') {
      finalValue = value ? (def.trueValue ?? '') : (def.falseValue ?? 'none');
    }
    const finalUnit = (finalValue === 'none' || finalValue === '') ? '' : (def.unit || '');
    target.style[def.cssProp] = `${finalValue}${finalUnit}`;
  }
}
