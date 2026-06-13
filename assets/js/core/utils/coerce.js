// coerce.js – converts a string to a number when possible
export function coerce(val) {
  const n = Number(val);
  return isNaN(n) ? val : n;
}
