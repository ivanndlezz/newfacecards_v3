/**
 * DataFlowBinder — v1
 * Location: /shared/utilities/data-flow-binder.js
 *
 * Motor de binding unidireccional: Input → API → DOM
 *
 * Patrón de atributos (desacoplados):
 *   data-bind-field="profile.name"      → clave del JSON (qué guardar)
 *   data-bind-target=".blank__name"     → selector CSS del elemento visual a actualizar
 *   data-bind-event="change"            → evento de escucha (por defecto: "input")
 *
 * Características:
 *   - Debounce configurable (default 300ms) para no saturar la API
 *   - AbortController por campo: cancela peticiones en vuelo al escribir de nuevo
 *   - Actualiza DOM inmediatamente en modo optimista, luego confirma con la API
 *   - Hooks de ciclo de vida: onSyncStart, onSyncSuccess, onSyncError
 *   - Compatible con MockApiMiddleware y fetch() real (WP REST API)
 *
 * Uso básico:
 *   import { DataFlowBinder } from "/shared/utilities/data-flow-binder.js";
 *
 *   const binder = new DataFlowBinder({
 *     container: document.querySelector('[data-scope="profile"]'),
 *     endpoint: "/wp-json/nfc/v1/update-field",
 *   });
 *   binder.bind();
 *
 * Modo Mock (desarrollo):
 *   Importa api-middleware-mock.js antes de DataFlowBinder para activar automáticamente.
 *   window.__useMockApi = true se setea en ese módulo.
 */

export class DataFlowBinder {
  /**
   * @param {Object} config
   * @param {HTMLElement} [config.container=document.body]   Contexto de búsqueda de inputs
   * @param {string}      [config.endpoint]                  Endpoint REST real
   * @param {number}      [config.debounceMs=300]            Debounce en milisegundos
   * @param {Function}    [config.onSyncStart]               (input, field, target) => void
   * @param {Function}    [config.onSyncSuccess]             (input, field, target, value) => void
   * @param {Function}    [config.onSyncError]               (input, field, err) => void
   */
  constructor(config = {}) {
    this.container   = config.container   || document.body;
    this.endpoint    = config.endpoint    || "/wp-json/nfc/v1/update-field";
    this.debounceMs  = config.debounceMs  ?? 300;

    this.onSyncStart   = config.onSyncStart   || null;
    this.onSyncSuccess = config.onSyncSuccess || null;
    this.onSyncError   = config.onSyncError   || null;

    // Control de concurrencia: un slot por campo (inputKey)
    /** @type {Map<string, AbortController>} */
    this._abortControllers = new Map();
    /** @type {Map<string, ReturnType<typeof setTimeout>>} */
    this._debounceTimers   = new Map();

    // Registro de listeners para cleanup posterior
    this._boundListeners = [];
  }

  // ─── API pública ─────────────────────────────────────────────────────────────

  /**
   * Busca todos los [data-bind-field] dentro del contenedor y los hace reactivos.
   * Llama a este método después de que el DOM del sheet esté montado.
   */
  bind() {
    const inputs = this.container.querySelectorAll("[data-bind-field]");

    if (!inputs.length) {
      console.warn("[DataFlowBinder] No se encontraron inputs con [data-bind-field].");
      return;
    }

    inputs.forEach((input) => {
      const fieldPath      = input.getAttribute("data-bind-field");
      const targetSelector = input.getAttribute("data-bind-target") || null;
      const eventType      = input.dataset.bindEvent || "input";

      // Clave única por input para el slot de AbortController/Debounce
      const inputKey = input.id || input.name || fieldPath;

      const handler = (e) => {
        const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        this._handleChange(inputKey, fieldPath, targetSelector, val);
      };

      input.addEventListener(eventType, handler);

      // Guardar referencia para cleanup
      this._boundListeners.push({ input, eventType, handler });
    });

    console.log(
      `[DataFlowBinder] Enlazados ${inputs.length} campo(s) en`,
      this.container
    );
  }

  /**
   * Elimina todos los event listeners registrados.
   * Llama a este método cuando el sheet se destruye.
   */
  destroy() {
    this._boundListeners.forEach(({ input, eventType, handler }) => {
      input.removeEventListener(eventType, handler);
    });
    this._boundListeners = [];

    // Cancelar cualquier petición pendiente
    this._abortControllers.forEach((controller) => controller.abort());
    this._abortControllers.clear();

    // Cancelar timers pendientes
    this._debounceTimers.forEach((timerId) => clearTimeout(timerId));
    this._debounceTimers.clear();

    console.log("[DataFlowBinder] Destruido y listeners removidos.");
  }

  /**
   * Actualiza manualmente un elemento DOM dado un selector y valor.
   * Entiende el tipo de elemento (img, a, background, text).
   *
   * @param {string} selector    CSS selector del elemento objetivo
   * @param {*}      value       Valor a aplicar
   */
  updateDom(selector, value) {
    if (!selector) return;
    const targets = document.querySelectorAll(selector);

    if (!targets.length) {
      console.warn(`[DataFlowBinder] Selector de target no encontrado: "${selector}"`);
      return;
    }

    targets.forEach((target) => {
      if (target.tagName === "IMG") {
        target.src = value;
      } else if (target.tagName === "A") {
        target.href = value;
      } else if (
        target.dataset.bindSrc === "background" ||
        target.classList.contains("cover__image") ||
        target.id === "background_cover"
      ) {
        target.style.backgroundImage = value ? `url("${value}")` : "";
      } else if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        target.value = value;
      } else {
        target.textContent = value;
      }
    });
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  /**
   * Debounce + AbortController + envío a API + actualización DOM
   * @private
   */
  _handleChange(inputKey, fieldPath, targetSelector, value) {
    // 1. Cancelar debounce previo
    if (this._debounceTimers.has(inputKey)) {
      clearTimeout(this._debounceTimers.get(inputKey));
    }

    // 2. Cancelar petición en vuelo para este campo
    if (this._abortControllers.has(inputKey)) {
      this._abortControllers.get(inputKey).abort();
    }

    // 3. Crear nuevo AbortController para esta ronda
    const controller = new AbortController();
    this._abortControllers.set(inputKey, controller);

    // 4. Iniciar debounce
    const timerId = setTimeout(async () => {
      const input = this.container.querySelector(
        `[data-bind-field="${fieldPath}"]`
      );

      if (this.onSyncStart) {
        this.onSyncStart(input, fieldPath, targetSelector);
      }

      try {
        const response = await this._sendToApi(
          this.endpoint,
          { field: fieldPath, target: targetSelector, value },
          controller.signal
        );

        if (response.ok && response.data) {
          const finalValue    = response.data.value;
          const finalTarget   = response.data.target || targetSelector;

          // Actualizar DOM con el valor confirmado por la API
          if (finalTarget) {
            this.updateDom(finalTarget, finalValue);
          }

          if (this.onSyncSuccess) {
            this.onSyncSuccess(input, fieldPath, finalTarget, finalValue);
          }
        } else {
          throw new Error(response.error || `API respondió ok=false (status ${response.status})`);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // Petición cancelada normalmente por una escritura más reciente — silenciar
          console.log(`[DataFlowBinder] Petición cancelada: ${fieldPath}`);
        } else {
          console.error(`[DataFlowBinder] Error sincronizando "${fieldPath}":`, err);
          if (this.onSyncError) {
            this.onSyncError(input, fieldPath, err);
          }
        }
      } finally {
        // Limpiar el slot si esta petición sigue siendo la activa
        if (this._abortControllers.get(inputKey) === controller) {
          this._abortControllers.delete(inputKey);
        }
      }
    }, this.debounceMs);

    this._debounceTimers.set(inputKey, timerId);
  }

  /**
   * Enruta la petición al mock (dev) o al endpoint real (prod).
   * @private
   */
  async _sendToApi(endpoint, payload, signal) {
    // Modo simulación: delegar al mock
    if (window.__useMockApi && window.__mockApiMiddleware) {
      return await window.__mockApiMiddleware.updateField(payload, signal);
    }

    // Modo producción: WP REST API con autenticación por cookie/nonce de WP
    const res = await fetch(endpoint, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        // WP REST API requiere nonce para peticiones autenticadas
        ...(window.wpApiSettings?.nonce
          ? { "X-WP-Nonce": window.wpApiSettings.nonce }
          : {}),
      },
      body:   JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  }
}
