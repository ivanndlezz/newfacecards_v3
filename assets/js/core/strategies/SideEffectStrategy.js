// SideEffectStrategy.js – handles the optional "onApply" field (selector :: property :: template)
import { ApplyStrategy } from './ApplyStrategy.js';

export class SideEffectStrategy extends ApplyStrategy {
  apply(target, value, def) {
    if (!def.onApply) return;
    if (typeof def.onApply === 'function') {
      def.onApply(value, target);
      return;
    }
    // def.onApply format: "selector :: property :: template"
    const [selector, prop, template] = def.onApply.split(' :: ');
    const el = target.querySelector ? target.querySelector(selector) : null;
    const finalEl = el || (target.closest ? target.closest(selector) : null) || document.querySelector(selector);
    if (finalEl) {
      const result = template.replace('{value}', value);
      finalEl[prop] = result;
    }
  }
}
