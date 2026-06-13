// CssVarStrategy.js – applies a value via a CSS custom property (variable)
import { ApplyStrategy } from './ApplyStrategy.js';

export class CssVarStrategy extends ApplyStrategy {
  apply(target, value, def) {
    const unit = def.unit || '';
    target.style.setProperty(def.cssVar, `${value}${unit}`);
  }
}
