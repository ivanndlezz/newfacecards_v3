/*
 * UTILITY FUNCTIONS
 */

function moduleChange(id, status, delay = 0) {
  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      element.setAttribute("class", status);
    }
  }, delay);
}

function optCover() {
  moduleChange("set_module", "", 500);
}

/*
 * BOTTOM SHEET COMPONENT
 */

class BottomSheet {
  constructor(element) {
    this.sheet = element;
    this.backdrop = document.getElementById("backdrop");
    this.header = document.getElementById("header");
    this.content = document.getElementById("content");

    this.states = {
      CLOSED: "closed",
      NORMAL: "normal",
      FULL: "full",
    };

    this.currentState = this.states.CLOSED;
    this.startY = 0;
    this.isDragging = false;
    this.dragStartState = null;
    this.SWIPE_THRESHOLD = 50;

    this.init();
  }

  init() {
    // Touch events
    this.header.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: true },
    );
    this.header.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.header.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });

    // Mouse events
    this.header.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseEnd.bind(this));

    // Backdrop and keyboard
    this.backdrop.addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.currentState !== this.states.CLOSED) {
        this.close();
      }
    });
  }

  // Touch handlers
  handleTouchStart(e) {
    this.startDrag(e.touches[0].clientY);
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - this.startY;

    if (Math.abs(deltaY) > 5) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;
    const currentY = e.changedTouches[0].clientY;
    this.endDrag(currentY);
  }

  // Mouse handlers
  handleMouseDown(e) {
    this.startDrag(e.clientY);
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
  }

  handleMouseEnd(e) {
    if (!this.isDragging) return;
    this.endDrag(e.clientY);
  }

  // Drag logic
  startDrag(clientY) {
    this.isDragging = true;
    this.startY = clientY;
    this.dragStartState = this.currentState;
  }

  endDrag(endY) {
    this.isDragging = false;
    const deltaY = endY - this.startY;

    if (this.dragStartState === this.states.NORMAL) {
      if (deltaY < -this.SWIPE_THRESHOLD) {
        this.setState(this.states.FULL);
      } else if (deltaY > this.SWIPE_THRESHOLD) {
        this.close();
      }
    } else if (this.dragStartState === this.states.FULL) {
      if (deltaY > this.SWIPE_THRESHOLD) {
        this.setState(this.states.NORMAL);
      }
    }

    this.dragStartState = null;
  }

  // State management
  open() {
    //Hide
    hideHeaderActions("hide");

    this.backdrop.classList.add("active");
    this.sheet.classList.remove("normal", "full");
    this.sheet.classList.add("opening");
    this.currentState = this.states.NORMAL;

    setTimeout(() => {
      this.sheet.classList.remove("opening");
      this.sheet.classList.add("normal");
    }, 500);

    document.body.style.overflow = "hidden";
  }

  close() {
    //Show
    hideHeaderActions("show");

    this.backdrop.classList.remove("active");
    this.sheet.classList.remove("normal", "full", "opening");
    this.currentState = this.states.CLOSED;
    document.body.style.overflow = "";
  }

  setState(state) {
    this.sheet.classList.remove("normal", "full");
    if (state !== this.states.CLOSED) {
      this.sheet.classList.add(state);
    }
    this.currentState = state;
  }
}

/*
 * INITIALIZATION
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Bottom Sheet
  const bottomSheet = new BottomSheet(document.getElementById("bottomsheet"));
  window.bottomSheet = bottomSheet;

  // Close button
  const closeBtn = document.getElementById("closeBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => bottomSheet.close());
  }

  // Button actions (if buttonActions exists)
  if (typeof buttonActions !== "undefined") {
    Object.entries(buttonActions).forEach(([id, action]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", action);
      }
    });
  }

  // Delegated click events
  document.addEventListener("click", (event) => {
    for (const selector in clickActions) {
      if (event.target.closest(selector)) {
        clickActions[selector](event);
        break;
      }
    }
  });
  const editGrid = document.querySelector(".toggle-switch-grid");
  const floatingModule = document.querySelector(".floating-module");
  const headerControls = document.querySelector(".header");

  editGrid.addEventListener("click", () => {
    //console.log("clicked");
    floatingModule.classList.toggle("hide");
    headerControls.classList.toggle("show-grid");
  });
});

/*
 * IMAGE STYLE SELECTION
 */

document.addEventListener("DOMContentLoaded", function () {
  const loadzone = document.getElementById("loadzone");
  if (loadzone) {
    loadzone.addEventListener("click", function (e) {
      const card = e.target.closest(".image-style-card");
      if (card) {
        // Aquí tu lógica al hacer click en una tarjeta de estilo
        //console.log("Click en image-style-card:", card.getAttribute("for"));
        setStyle(card.getAttribute("for"));
        // Ejemplo: seleccionar el radio correspondiente
        const inputId = card.getAttribute("for");
        const radio = document.getElementById(inputId);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
  }
});

/*
 * STYLE ACTIONS
 */

const styleActions = {
  "style-classic": function () {
    //console.log("Aplicando estilo Clásico");
    // Lógica específica para "Clásico"
    profileStyle("classic");
  },
  "style-hero": function () {
    //console.log("Aplicando estilo Hero");
    // Lógica específica para "Hero"
    profileStyle("hero");
  },
  "style-cover": function () {
    //console.log("Aplicando estilo Con portada");
    // Lógica específica para "Con portada"
    profileStyle("cover");
  },
};

/*
 * SET STYLE FUNCTION
 */

function setStyle(styleId) {
  const aspect = document.querySelector("[data-aspect]");
  const action = styleActions[styleId];
  if (typeof action === "function") {
    action();
    aspect.setAttribute("data-aspect", styleId.replace("style-", ""));
  } else {
    console.warn(`No hay acción definida para el estilo: ${styleId}`);
  }
}

const clickActions = {
  ".toggle-switch": (event) => handleToggleSwitch(event),
};

//document.addEventListener("click", (event) se ecuentra en DOM ContentLoaded l #191

function handleToggleSwitch(event) {
  const toggleSwitch = event.target.closest(".toggle-switch");
  if (toggleSwitch) {
    toggleSwitch.classList.toggle("active");
    //console.log("Logo toggle:", toggleSwitch.classList.contains("active"));
  }
}

//document.addEventListener("DOMContentLoaded", function () {});

function profileStyle(style) {
  const profile_section = document.querySelector(".profile-section");
  if (style === "hero") {
    profile_section.setAttribute("data-style", "hero");
  } else if (style === "classic") {
    profile_section.setAttribute("data-style", "classic");
  } else if (style === "cover") {
    profile_section.setAttribute("data-style", "cover");
  } else {
    profile_section.setAttribute("data-style", "classic");
  }
}

function hideHeaderActions(action) {
  const header = document.querySelector(".header");

  if (!header) return; // seguridad por si no existe el header

  if (action === "show") {
    header.classList.remove("hide"); // muestra el header
  } else if (action === "hide") {
    header.classList.add("hide"); // oculta el header
  }
}

function floatingModule(status) {
  const floatingModule = document.querySelector(".floating-module");

  if (!floatingModule) return; // seguridad por si no existe el header

  if (action === "show") {
    floatingModule.classList.remove("hide"); // muestra el header
  } else if (action === "hide") {
    floatingModule.classList.add("hide"); // oculta el header
  }
}

/* USER DATA*/
/**/

// Función auxiliar para obtener valores anidados de forma segura (e.g., "avatar.url")
function getNestedValue(obj, path) {
  if (Array.isArray(path)) {
    return path.map((p) => getNestedValue(obj, p));
  }

  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

// Extrae la URL del avatar probando varias rutas comunes en la respuesta
function getAvatarUrl(userData) {
  if (!userData) return null;
  const candidates = [
    "avatar.url",
    "avatar_url",
    "profilePic",
    "profile_pic",
    "avatar",
  ];
  for (const path of candidates) {
    const val = getNestedValue(userData, path);
    if (val) return val;
  }
  return null;
}

/*
const dataMapping = {
  ".username": ["firstName", "lastName"],
  ".tagline": "lastName",
  ".description": "description",
  ".avatar-img": { jsonKey: "avatar.url", attribute: "src" },

  // Caso de uso con función (formatter) 
  ".full-profile": {
    jsonKey: ["firstName", "lastName", "description"], // Array de campos para la función
    formatter: createProfileBadge,
    attribute: "innerHTML",
  },
  // Caso de uso con función para atributo (href) 
  ".user-link": {
    jsonKey: "url", // Un solo campo para la función
    formatter: formatLink,
    attribute: "href",
  },
};*/

// Construir Profil Pic
function profilePicLoader(url) {
  return `
       <img 
       src="${url}" 
       alt="Profile" class="profile-image">
    `;
}

const dataMapping = {
  // css-query | Json Map
  ".username": ["firstName"],
  ".tagline": ["lastName"],
  ".description": "description",
  ".profile-image": {
    jsonKey: "avatar.url",
    formatter: profilePicLoader,
  },
};

async function loadAndDisplayUserData(mapping) {
  const localProxyUrl = "https://my.newfacecards.com/nfc/front/get_user.php";

  try {
    const response = await fetch(localProxyUrl);
    const data = await response.json();
    const userData = data?.data?.user;

    if (!userData) {
      console.error("Estructura de datos JSON inesperada.");
      return;
    }

    for (const cssSelector in mapping) {
      const mappingValue = mapping[cssSelector];
      const targetElement = document.querySelector(cssSelector);

      if (!targetElement) {
        console.warn(`⚠️ Elemento no encontrado: ${cssSelector}`);
        continue;
      }

      let jsonSource;
      let targetAttribute = "innerHTML";
      let formatter = null;
      let valueToDisplay;

      // 1. Determinar fuente, atributo y función de formato
      if (typeof mappingValue === "object" && !Array.isArray(mappingValue)) {
        jsonSource = mappingValue.jsonKey;
        targetAttribute = mappingValue.attribute || "innerHTML";
        formatter = mappingValue.formatter || null; // Capturar la función
      } else {
        jsonSource = mappingValue;
      }

      // 2. Extraer el/los valor/es del JSON
      const extractedValues = getNestedValue(userData, jsonSource);

      // 3. Aplicar la lógica de formato
      if (formatter) {
        // Si hay un formatter, lo llamamos. Si el JSON source era un array,
        // spread (...) los valores como argumentos de la función.
        if (Array.isArray(extractedValues)) {
          valueToDisplay = formatter(...extractedValues); // ⭐️ Pasar como argumentos ⭐️
        } else {
          valueToDisplay = formatter(extractedValues);
        }
      } else if (Array.isArray(extractedValues)) {
        // Lógica original para concatenar valores (si no hay formatter)
        valueToDisplay = extractedValues
          .filter((v) => v !== undefined && v !== null)
          .join(" ");
      } else {
        // Lógica original para un solo string
        valueToDisplay = extractedValues;
      }

      // Sanitizar valor
      valueToDisplay =
        valueToDisplay === null || valueToDisplay === undefined
          ? ""
          : valueToDisplay;

      // 4. Insertar el valor/HTML final
      if (targetAttribute === "innerHTML") {
        targetElement.innerHTML = valueToDisplay; // ⭐️ Inserta el HTML generado ⭐️
      } else {
        targetElement.setAttribute(targetAttribute, valueToDisplay);
      }

      console.log(
        `✅ Actualizado: ${cssSelector} (Attr: ${targetAttribute}) con Formatter: ${!!formatter}`,
      );
    }

    // Después de actualizar los campos, extraer la URL del avatar (si existe)
    const avatarUrl = getAvatarUrl(userData);
    if (avatarUrl) {
      setCSSvars({ profilePic: avatarUrl });
    }
  } catch (error) {
    console.error("❌ Error al cargar o procesar los datos:", error);
  }
}

loadAndDisplayUserData(dataMapping); // Llamar esta función en tu script

/**/

document.addEventListener("DOMContentLoaded", function () {
  //top-cta

  const topcta = document.querySelector(".top-cta-container");
  const app = document.getElementById("app");
  topcta.addEventListener("click", () => {
    //console.log("topcta");
    app.classList.add("publish");
  });

  const cancel = document.querySelector(".cancel.top-cta");
  cancel.addEventListener("click", () => {
    //console.log("topcta");
    app.classList.remove("publish");
  });
});

function goSwitchSheet(state) {
  const el = document.getElementById("bottomsheet");
  if (!el) return;

  // Explicitly set to "full"
  if (state === "full") {
    el.classList.remove("normal");
    el.classList.add("full");
    return;
  }

  // Toggle between normal and full if no state is specified
  el.classList.replace(
    el.classList.contains("normal") ? "normal" : "full",
    el.classList.contains("normal") ? "full" : "normal",
  );
}

function setCSSvars(data) {
  //console.log(data.profilePic);
  const styleTag = document.getElementById("root-vars");
  if (!styleTag) return;
  if (!data) return;

  const url =
    data.profilePic ||
    "https://img.icons8.com/blueprint/100/user-male-circle.png";
  // Asegurarse de escapar correctamente y envolver entre comillas
  styleTag.innerHTML = `
  :root{
  --profile-pic: url('${url}');
  }
  `;
}
