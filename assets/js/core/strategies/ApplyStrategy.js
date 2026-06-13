// ApplyStrategy.js – interface for applying a value to a target element
// Concrete strategies must implement an `apply(target, value, def)` method.
export class ApplyStrategy {
  /**
   * Apply the given value to the target element according to the definition.
   * @param {Element} target - DOM element to modify
   * @param {*} value - value to apply (already resolved/coerced)
   * @param {Object} def - control definition (may contain cssVar, cssProp, unit, etc.)
   */
  apply(target, value, def) {
    throw new Error('ApplyStrategy.apply must be overridden');
  }
}
