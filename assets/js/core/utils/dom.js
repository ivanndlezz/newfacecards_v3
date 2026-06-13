// dom.js – helper utilities for the Sync system
export function dataKey(attr) {
  // Convert data‑attribute name (e.g., "value") to dataset property ("value")
  // Handles dash‑case to camelCase conversion (e.g., "my-key" → "myKey")
  return attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function isNativeInput(el) {
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
}
