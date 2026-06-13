// StateStore.js – simple observable SSOT implementation
export class StateStore {
  constructor(initialState = {}) {
    this.state = JSON.parse(JSON.stringify(initialState)); // deep copy
    this.subscribers = {};
  }

  // Get value at dot‑path like "controls.avatar.size"
  get(path) {
    return path.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), this.state);
  }

  // Set value at dot‑path and notify subscribers
  set(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let target = this.state;
    for (const p of parts) {
      if (!target[p]) target[p] = {};
      target = target[p];
    }
    target[last] = value;
    this._notify(path, value);
  }

  // Subscribe to a specific path; returns an unsubscribe function
  subscribe(path, callback) {
    if (!this.subscribers[path]) this.subscribers[path] = new Set();
    this.subscribers[path].add(callback);
    // immediate call with current value
    callback(this.get(path));
    return () => {
      this.subscribers[path].delete(callback);
    };
  }

  _notify(path, value) {
    // Notify exact path subscribers
    if (this.subscribers[path]) {
      this.subscribers[path].forEach(cb => cb(value));
    }
    // Also notify wildcard listeners (e.g., '*') if needed – not used now
  }
}
