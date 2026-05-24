/**
 * Binder Utility - Modern, SOLID, SRP-compliant Data Hydration Engine
 * Location: /shared/utilities/binder.js
 */

// 1. CONSTANTS (Avoid Magic Strings)
export const BIND_ATTRIBUTES = {
  TEXT: 'data-bind',
  SRC: 'data-bind-src',
  HREF: 'data-bind-href',
  ATTR: 'data-bind-attr',
  BG: 'data-bind-bg'
};

// 2. VALUE RESOLVER (SRP: Object path traversal concern)
export class ValueResolver {
  /**
   * Resolves nested dot-paths in JSON objects (e.g. "profile.name")
   * Supports smart casing fallback (snake_case <-> kebab-case)
   * @param {Object} obj - The target data object
   * @param {string} path - The dot-path string
   * @returns {*} Resolved value or undefined
   */
  static getNestedValue(obj, path) {
    if (!path || !obj) return undefined;
    
    const resolve = (currentObj, parts) => {
      let current = currentObj;
      for (const part of parts) {
        if (!current) return undefined;
        
        // 1. Exact match
        if (current[part] !== undefined) {
          current = current[part];
          continue;
        }
        
        // 2. Underscore to Dash fallback (e.g. cover_active -> cover-active)
        const dashPart = part.replace(/_/g, '-');
        if (current[dashPart] !== undefined) {
          current = current[dashPart];
          continue;
        }
        
        // 3. Dash to Underscore fallback (e.g. cover-active -> cover_active)
        const underscorePart = part.replace(/-/g, '_');
        if (current[underscorePart] !== undefined) {
          current = current[underscorePart];
          continue;
        }
        
        return undefined;
      }

      // Smart object-to-primitive fallback:
      // If the resolved value is an object containing a 'src' property (e.g. profile.photo / profile.cover)
      // we extract it automatically so the developer can bind to the object itself.
      if (current && typeof current === 'object' && current.src !== undefined) {
        return current.src;
      }
      
      return current;
    };

    const initialParts = path.split('.');
    const val = resolve(obj, initialParts);
    if (val !== undefined) return val;

    // Smart Fallback: if not found at root, check inside a common configuration block
    if (obj.config) {
      const configVal = resolve(obj.config, initialParts);
      if (configVal !== undefined) return configVal;
    }
    
    return undefined;
  }
}

// 3. DATA FETCHER (SRP: Network retrieval and fallback concern)
export class DataFetcher {
  constructor(options = {}) {
    this.endpoint = options.endpoint;
    this.allowLocalFallback = options.allowLocalFallback ?? true;
    this.localPath = options.localPath ?? '../data/card-data.json';
  }

  /**
   * Fetches data with dynamic error handling and optional local fallback
   * @returns {Promise<Object>} The resolved JSON data
   */
  async fetchData() {
    try {
      if (!this.endpoint) throw new Error("Endpoint URL is not defined.");
      
      const response = await fetch(this.endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (this.allowLocalFallback) {
        console.warn("[DataFetcher] Remote fetch failed, falling back to local source...", err);
        return await this.fetchLocal();
      }
      throw err;
    }
  }

  /**
   * Performs the local backup fetch
   * @returns {Promise<Object>} Local JSON data
   */
  async fetchLocal() {
    if (!this.localPath) throw new Error("Local fallback path is not defined.");
    
    const response = await fetch(this.localPath);
    if (!response.ok) throw new Error(`Local fallback HTTP error! status: ${response.status}`);
    return await response.json();
  }
}

// 4. DOM HYDRATOR (SRP: Element querying and DOM mutation concern)
export class DomHydrator {
  constructor(container = document.body) {
    this.container = container;
    this.handlers = new Map();

    // Register out-of-the-box base handlers
    this.registerHandler(BIND_ATTRIBUTES.TEXT, (el, val) => {
      el.textContent = val;
    });
    this.registerHandler(BIND_ATTRIBUTES.SRC, (el, val) => {
      el.src = val;
    });
    this.registerHandler(BIND_ATTRIBUTES.HREF, (el, val) => {
      el.href = val;
    });

    // Register background image handler
    this.registerHandler(BIND_ATTRIBUTES.BG, (el, val) => {
      el.style.backgroundImage = val ? `url("${val}")` : '';
    });

    // Register multi-attribute hydration handler
    this.registerHandler(BIND_ATTRIBUTES.ATTR, (el, val, pathListString, data) => {
      if (!pathListString) return;
      const paths = pathListString.split(',').map(p => p.trim());
      
      paths.forEach(path => {
        const resolved = ValueResolver.getNestedValue(data, path);
        if (resolved !== undefined && resolved !== null) {
          const parts = path.split('.');
          const lastPart = parts[parts.length - 1];
          el.setAttribute(`data-${lastPart}`, String(resolved));
        }
      });
    });
  }

  /**
   * Registers a callback mapping for an attribute pattern
   * @param {string} attributeName 
   * @param {Function} callback 
   */
  registerHandler(attributeName, callback) {
    this.handlers.set(attributeName, callback);
  }

  /**
   * Scans elements matching registered patterns and applies updates
   * @param {Object} data - The raw JSON data
   */
  hydrate(data) {
    if (!data) return;

    // DRY: Single loop processing all registered handlers
    for (const [attribute, handler] of this.handlers.entries()) {
      const selector = `[${attribute}]`;
      this.container.querySelectorAll(selector).forEach(el => {
        const path = el.getAttribute(attribute);
        const value = ValueResolver.getNestedValue(data, path);

        // Standard bindings require resolved values; attribute lists resolve multiple sub-paths
        if (attribute === BIND_ATTRIBUTES.ATTR || (value !== undefined && value !== null)) {
          handler(el, value, path, data);
        }
      });
    }
  }
}

// 5. DATA BINDER (SRP: Facade / Orchestrator concern)
export class DataBinder {
  constructor(config = {}) {
    this.config = {
      container: document.body,
      endpoint: '',
      allowLocalFallback: true,
      localPath: '../data/card-data.json',
      onSuccess: null,
      onError: null,
      ...config
    };

    this.fetcher = new DataFetcher({
      endpoint: this.config.endpoint,
      allowLocalFallback: this.config.allowLocalFallback,
      localPath: this.config.localPath
    });

    this.hydrator = new DomHydrator(this.config.container);
  }

  /**
   * Allows external code to dynamically extend bindings without editing the class (Open-Closed Principle)
   * @param {string} attributeName - E.g. 'data-bind-html'
   * @param {Function} handler - E.g. (el, val) => { el.innerHTML = val; }
   */
  registerCustomBinder(attributeName, handler) {
    this.hydrator.registerHandler(attributeName, handler);
    return this; // Enable chaining
  }

  /**
   * Orchestrates the fetching and hydration pipeline
   * @returns {Promise<Object>} The final bound data
   */
  async run() {
    try {
      const data = await this.fetcher.fetchData();
      this.hydrator.hydrate(data);
      
      if (this.config.onSuccess) {
        this.config.onSuccess(data);
      }
      return data;
    } catch (err) {
      console.error("[DataBinder] Pipeline execution failed:", err);
      if (this.config.onError) {
        this.config.onError(err);
      }
      throw err;
    }
  }

  /**
   * Downloads an HTML template from a URL, mounts it inside the container,
   * and automatically runs the hydration pipeline.
   * @param {string} templateUrl - Path to the HTML template file (e.g. "/templates/card-template.html")
   * @returns {Promise<Object>} Resolved and hydrated data
   */
  async loadTemplateAndRun(templateUrl) {
    try {
      const response = await fetch(templateUrl);
      if (!response.ok) throw new Error(`HTTP error loading template! status: ${response.status}`);
      const htmlContent = await response.text();
      
      // Inject the downloaded HTML into the mount container
      this.config.container.innerHTML = htmlContent;
      
      // Run the dynamic hydration pipeline
      return await this.run();
    } catch (err) {
      console.error("[DataBinder] loadTemplateAndRun failed:", err);
      if (this.config.onError) {
        this.config.onError(err);
      }
      throw err;
    }
  }
}
