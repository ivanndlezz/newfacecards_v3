/**
 * api-middleware-mock.js — v1
 * Location: /shared/utilities/api-middleware-mock.js
 *
 * Simulación del endpoint WP REST API: /wp-json/nfc/v1/update-field
 *
 * Características:
 *  - Simula latencia de red real (~100–200ms)
 *  - Soporte completo de AbortSignal: cancela en vuelo si la señal aborta
 *  - Escritura atómica simulada: guarda en _TMP y luego mueve a la clave real
 *  - Actualiza el hydrator visual (__adminBinder) si está disponible
 *  - Expone window.__useMockApi y window.__mockApiMiddleware para consumo transparente
 *
 * Producción:
 *  Cuando el endpoint real esté disponible, simplemente elimina este archivo
 *  y remueve window.__useMockApi = true. DataFlowBinder detectará automáticamente
 *  el modo producción y usará fetch() directo.
 *
 * Contrato de respuesta (espejado al WP REST handler):
 *  { ok: true, status: 200, data: { field, target, value } }
 *  { ok: false, status: 500, error: "mensaje" }
 */

// ─── Utilitario: resolver ruta dot-notation en un objeto ─────────────────────
function _setNestedValue(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (current[key] === null || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[parts[parts.length - 1]] = value;
}

// ─── Clave raíz en localStorage ───────────────────────────────────────────────
const STORAGE_KEY     = "NFC_CARD_DATA";
const STORAGE_KEY_TMP = "NFC_CARD_DATA_TMP";

// ─── Latencia de red simulada (ms) ────────────────────────────────────────────
const SIMULATED_LATENCY_MS = 150;

// ─── MockApiMiddleware ────────────────────────────────────────────────────────
export const MockApiMiddleware = {
  /**
   * Simula el endpoint POST /wp-json/nfc/v1/update-field
   *
   * @param {{ field: string, target: string, value: * }} payload
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ ok: boolean, status: number, data?: object, error?: string }>}
   */
  updateField(payload, signal) {
    return new Promise((resolve, reject) => {
      // Si la señal ya está abortada antes de empezar, rechazamos de inmediato
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      const timeoutId = setTimeout(() => {
        try {
          // ── 1. Leer estado actual ───────────────────────────────────────────
          const stored = localStorage.getItem(STORAGE_KEY);
          const cardData = stored ? JSON.parse(stored) : {};

          // ── 2. Aplicar mutación vía dot-notation ───────────────────────────
          _setNestedValue(cardData, payload.field, payload.value);

          // ── 3. Escritura Atómica Simulada ──────────────────────────────────
          //    Patrón espejo de: write(tmpPath) → rename(tmpPath, finalPath)
          //    Previene corrupción si el proceso se interrumpe a mitad de escritura.
          localStorage.setItem(STORAGE_KEY_TMP, JSON.stringify(cardData));
          localStorage.setItem(STORAGE_KEY, localStorage.getItem(STORAGE_KEY_TMP));
          localStorage.removeItem(STORAGE_KEY_TMP);

          // ── 4. Refrescar hydrator visual si está activo ────────────────────
          //    Permite que los elementos data-bind-* del card reflejen el cambio.
          if (window.__adminBinder?.hydrator) {
            window.__adminBinder.hydrator.hydrate(cardData);
          }

          console.log(
            `[MockAPI] ✓ Guardado: ${payload.field} = "${payload.value}"`,
            { target: payload.target }
          );

          resolve({
            ok: true,
            status: 200,
            data: {
              field: payload.field,
              target: payload.target,
              value: payload.value,
            },
          });
        } catch (err) {
          console.error("[MockAPI] Error en escritura:", err);
          resolve({
            ok: false,
            status: 500,
            error: err.message,
          });
        }
      }, SIMULATED_LATENCY_MS);

      // ── Cancelación por AbortSignal ─────────────────────────────────────────
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timeoutId);
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true }
        );
      }
    });
  },

  /**
   * Devuelve el estado completo almacenado en localStorage.
   * Útil para inspección/debug.
   * @returns {Object}
   */
  getStoredData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  },

  /**
   * Limpia el estado de localStorage. Útil para testing.
   */
  clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_TMP);
    console.log("[MockAPI] localStorage limpiado.");
  },
};

// ─── Activar modo mock globalmente ────────────────────────────────────────────
window.__useMockApi = true;
window.__mockApiMiddleware = MockApiMiddleware;

console.log(
  "[MockAPI] Modo simulación activado. Endpoint: /wp-json/nfc/v1/update-field → localStorage"
);
