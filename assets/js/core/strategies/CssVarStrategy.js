// CssVarStrategy.js – applies a value via a CSS custom property (variable)
import { ApplyStrategy } from './ApplyStrategy.js';

export class CssVarStrategy extends ApplyStrategy {
  apply(target, value, def) {
    let finalValue = value;
    if (typeof value === 'boolean') {
      finalValue = value ? (def.trueValue ?? '') : (def.falseValue ?? 'none');
    }
    const finalUnit = (finalValue === 'none' || finalValue === '') ? '' : (def.unit || '');
    target.style.setProperty(def.cssVar, `${finalValue}${finalUnit}`);
  }
}
