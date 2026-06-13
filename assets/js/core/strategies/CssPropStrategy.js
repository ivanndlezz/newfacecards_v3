// CssPropStrategy.js – applies a value via a direct CSS property (e.g., width, height)
import { ApplyStrategy } from './ApplyStrategy.js';

export class CssPropStrategy extends ApplyStrategy {
  apply(target, value, def) {
    const unit = def.unit || '';
    target.style[def.cssProp] = `${value}${unit}`;
  }
}
