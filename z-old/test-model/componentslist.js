console.log("carga componentslist.js");
// 📦 SISTEMA DE COMPONENTES
const ComponentLibrary = {
  // Componente Dashboard
  style: {
    name: "Style",
    render: () => `
      <div class="theme-panel" id="themePanel">
        <br>
        <h4>Colores</h4>

        <div class="theme-presets" id="themePresets">
          <!-- Los presets de temas se generan dinámicamente aquí desde JSON ColorThemeSystem-->
        </div>

        <div class="custom-controls">
          <div class="color-input-group">
            <label for="startColor">Color Inicial del Gradiente:</label>
            <input type="color" id="startColor" class="color-input" value="#e8a87c">
            <div class="contrast-info contrast-good" id="startContrast">Mejor con texto negro (9.0:1)</div>
          </div>

          <div class="color-input-group">
            <label for="endColor">Color Final del Gradiente:</label>
            <input type="color" id="endColor" class="color-input" value="#d68c5c">
            <div class="contrast-info contrast-good" id="endContrast">Contraste: 9.0:1</div>
          </div>

          <div class="color-input-group">
            <label for="accentColor">Color de Acento:</label>
            <input type="color" id="accentColor" class="color-input" value="#06896c">
          </div>
        </div>
      </div>
     
        `,
    cta: () => `
    <div class="bottom-bar more-content">
      <span>Scroll to see more content</span>
    </div>
        `,
  },

  // Componente Profile
  profile: {
    name: "Profile",
    render: () => `

<div class="profile-container" data-aspect="classic">
	<div class="profile-section">
		<div class="cover_block">
		</div>
		<!-- Profile image -->
		<div class="profile-image style-hero">
			<img decoding="async" src="https://img.icons8.com/blueprint/100/user-male-circle.png" alt="Profile">
		</div>
		<!-- Buttons -->
		<div class="profile-buttons-container">
			<div class="btn update-avatar">
				Update profile pic
			</div>
      <div class="btn update-cover">
				Update cover
			</div>
		</div>
	</div>
	<div class="profile-settings-section">
		<!-- Image style section -->
		<div class="image-style-section">
			<form class="image-style-form" id="image-style-form">
				<fieldset class="image-style-fieldset">
					<legend><span>image style</span></legend>
					<div class="image-style-grid">
						<!-- Classic -->
						<input type="radio" name="image_style" id="style-classic" value="classic" checked="">
						<label class="image-style-card" for="style-classic">
						<span class="preview preview--classic" aria-hidden="true"></span>
						<span class="image-style-title">Clásico</span>
						<span class="checkmark" aria-hidden="true"></span>
						</label>
						<!-- Hero (puedes "bloquear" con disabled si es Pro) -->
						<input type="radio" name="image_style" id="style-hero" value="hero">
						<label class="image-style-card" for="style-hero">
							<span class="preview preview--hero" aria-hidden="true"></span>
							<span class="image-style-title">Hero</span>
							<span class="badge badge--pro" aria-hidden="true">
								Pro
								<svg style="width: 12px; height: 12px; color: white" viewBox="0 0 24 24" fill="currentColor">
                  <use href="#pro-spark"></use>
								</svg>
							</span>
							<span class="checkmark" aria-hidden="true"></span>
						</label>
						<!-- With Cover (tercera opción) -->
						<input type="radio" name="image_style" id="style-cover" value="with-cover">
						<label class="image-style-card" for="style-cover">
							<span class="preview preview--cover" aria-hidden="true">
							<span class="cover-bg"></span>
							<span class="avatar"></span>
							</span>
							<span class="image-style-title">Con portada</span>
							<span class="badge badge--pro" aria-hidden="true">
								Pro
								<svg style="width: 12px; height: 12px; color: white" viewBox="0 0 24 24" fill="currentColor">
                  <use href="#pro-spark"></use>
								</svg>
							</span>
							<span class="checkmark" aria-hidden="true"></span>
						</label>
					</div>
				</fieldset>
			</form>
		</div>
		<!-- Hide Linktree logo -->
		<div class="logo-toggle-section">
			<div class="logo-text-container">
				<svg viewBox="0 0 24 24" fill="none">
					<use href="#logo" />
				</svg>
				<span class="logo-text">Ocultar logo de newface</span>
			</div>
			<!-- Toggle switch -->
			<div class="toggle-switch">
				<div class="toggle-slider"></div>
				<!-- Pro badge on toggle -->
				<div class="toggle-pro-badge">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
					</svg>
				</div>
			</div>
		</div>
	</div>
</div>
        `,
    cta: () => `
    <div class="bottom-bar more-content">
      <span>Scroll to see more content</span>
    </div>
        `,
  },

  // Componente Profile
  menu: {
    name: "Menu",
    render: () => `
    <div class="menu-container">
      <!-- Header -->
      <header>
        <div class="header-top">
          <div class="header-icons">
            <button class="icon-btn top icon-gear">
              <svg class="svg-black"><use href="#icon-settings"></use></svg>
            </button>
            <div class="logo">
              <div class="plan-badge">
                <span class="plan-pro">
                  <svg>
                    <use href="#pro-spark"></use>
                  </svg>
                  <span>PRO</span>
                </span>
                <span></span>
              </div>
            </div>
            <!-- Button -->
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="content">
        <!-- Profile -->
        <div class="profile-card">
          <div class="profile-avatar">
            <img src="https://app.newfacecards.com/nfc/profile-pic/recZA0nbPbwAgWMEs.jpg?timestamp=1760843146&amp;size=1000x1000">
          </div>
          <div class="profile-info">
            <h2>Ivan Gonzalez</h2>
            <p class="profile-username">@ivangonzalez</p>
          </div>
        </div>
        <!-- Cards -->
        <a href="/cards.html" my_cards="" class="app-card"> 
          <div cardicon_holder="">
            <div card_icon=""></div>
          </div> 
          <span sum_cards="">
            <span card_numsum="">3</span> 
            <span>Tarjetas Activas</span> 
          </span> 
        </a>

        <!-- Apps Ecosystem -->
        <h3 class="section-title-menu">Ecosistema NewFace</h3>
        <div class="apps-grid">
          <a id="contact-hub" href="#" class="app-card">
            <div class="app-icon"></div>
            <div class="app-info">
              <h3>Contact Hub</h3>
              <p>Tu perfil digital</p>
              <p></p>
            </div>
          </a>
          <a id="snap-tools" href="#" class="app-card">
            <div class="app-icon"></div>
            <div class="app-info">
              <h3>Snap Tools</h3>
              <p>Enlaces dinámicos</p>
            </div>
          </a>
          <a id="business-hub" href="#" class="app-card">
            <div class="app-icon"></div>
            <div class="app-info">
              <h3>Business Hub</h3>
              <p>Perfil empresarial</p>
            </div>
          </a>
          <a id="netless-tools" href="#" class="app-card">
            <div class="app-icon"></div>
            <div class="app-info">
              <h3>NetLess Tools</h3>
              <p>Funciona offline</p>
            </div>
          </a>
          <a id="nf-insigths" href="#" class="app-card">
            <div class="app-icon"></div>
            <div class="app-info">
              <h3>NF Insigths</h3>
              <p>Analítica avanzada</p>
            </div>
          </a>
          <a id="nf-connect" href="#" class="app-card">
            <div class="app-icon"></div>
            <div class="app-info">
              <h3>NF Connect</h3>
              <p>Conecta tus apps</p>
            </div>
          </a>
        </div>

        <!-- Upgrade Banner -->
        <div class="upgrade-banner">
          <span class="green-badge">
            <svg class="svg-small"><use href="#icon-leaf"></use></svg>
            Green+ Active
          </span>
          <h3>🌱 Has plantado 3 árboles</h3>
          <p>
            Cada tarjeta NewFace = 1 árbol. Comparte tu impacto con el mundo.
          </p>
          <button class="upgrade-btn">Ver mi impacto</button>
        </div>

        <!-- Settings -->
        <h3 class="section-title">Configuración</h3>
        <div class="settings-list">
          <a href="#" class="settings-item">
            <div class="settings-icon bg-blue">
              <svg><use href="#icon-user"></use></svg>
            </div>
            <div class="settings-info">
              <h4>Mi Perfil</h4>
              <p>Editar información personal</p>
            </div>
          </a>
          <a href="#" class="settings-item">
            <div class="settings-icon bg-purple">
              <svg><use href="#icon-shield"></use></svg>
            </div>
            <div class="settings-info">
              <h4>Privacidad y Seguridad</h4>
              <p>Control de datos y accesos</p>
            </div>
          </a>
          <a href="#" class="settings-item">
            <div class="settings-icon bg-green">
              <svg><use href="#icon-gift"></use></svg>
            </div>
            <div class="settings-info">
              <h4>Planes y Suscripciones</h4>
              <p>Gestionar tu plan actual</p>
            </div>
          </a>
          <a href="#" class="settings-item">
            <div class="settings-icon bg-orange">
              <svg><use href="#icon-help"></use></svg>
            </div>
            <div class="settings-info">
              <h4>Ayuda y Soporte</h4>
              <p>Centro de ayuda y contacto</p>
            </div>
          </a>
          <a href="#" class="settings-item">
            <div class="settings-icon bg-pink">
              <svg><use href="#icon-logout"></use></svg>
            </div>
            <div class="settings-info">
              <h4>Cerrar Sesión</h4>
              <p>Salir de tu cuenta</p>
            </div>
          </a>
        </div>

        <div style="height: 2rem"></div>

        <div class="accordion-item">
          <div class="accordion-header">
            <div class="accordion-left">
              <div class="accordion-icon">
                <svg><use href="#icon-settings"></use></svg>
              </div>
              <span class="accordion-title">Configuración y privacidad</span>
            </div>
            <svg class="arrow"><use href="#icon-chevron"></use></svg>
          </div>
          <div class="accordion-content">
            <ul>
              <li><a href="#">Configuración</a></li>
              <li><a href="#">Atajos de privacidad</a></li>
              <li><a href="#">Registro de actividad</a></li>
              <li><a href="#">Configuración del idioma</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
        `,
    cta: () => `
    <!-- -->
        `,
  },
};

/*
<div class="comment-input-container">
      <input type="text" class="comment-input" placeholder="Añade un comentario...">
      <button class="send-btn" aria-label="Enviar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
        </svg>
      </button>
    </div>
*/

// 🎯 SISTEMA DE CARGA DE COMPONENTES
class ComponentLoader {
  constructor(targetId) {
    this.loadzone = document.getElementById(targetId);
    this.currentComponent = null;
  }

  // Cargar componente por nombre
  async load(componentName) {
    const component = ComponentLibrary[componentName];

    if (!component) {
      console.error(`Componente "${componentName}" no encontrado`);
      return;
    }

    // Renderizar componente principal
    let html = component.render();
    this.loadzone.innerHTML = html;

    // Inicializa el sistema de temas si el componente cargado es 'style'
    if (componentName === "style") {
      // Inicializar el sistema de temas si aún no existe
      if (!window.themeSystem) {
        window.themeSystem = new ColorThemeSystem("./themes.json");
      }

      // Ahora que el HTML está cargado, le pedimos al sistema
      // que CARGUE (fetch) y LUEGO renderice los temas.
      // loadThemes() ya se encarga de todo (esperar, fetchear y generar).
      window.themeSystem
        .initializePanel()
        .then(() => {
          console.log("Temas cargados y presets generados tras cargar 'style'");
        })
        .catch((e) =>
          console.warn("No se pudo cargar el sistema de temas:", e)
        );
    }

    this.loadzone.classList.add("loaded");
    this.currentComponent = componentName;

    // Mostrar el nombre del componente en #component-name
    const nameZone = document.getElementById("component-name");
    if (nameZone) {
      nameZone.textContent = component.name || componentName;
    }

    // Renderizar cta en el elemento correspondiente
    const ctaZone = document.getElementById("load-cta");
    if (ctaZone) {
      if (typeof component.cta === "function") {
        ctaZone.innerHTML = component.cta();
        ctaZone.style.display = "";
      } else {
        ctaZone.innerHTML = "";
        ctaZone.style.display = "none";
      }
    }

    console.log(`✅ Componente "${componentName}" cargado exitosamente`);
    bottomSheet.open();
  }

  // Limpiar loadzone
  clear() {
    this.loadzone.innerHTML = "";
    this.loadzone.classList.remove("loaded");
    this.currentComponent = null;
  }

  // Obtener componente actual
  getCurrentComponent() {
    return this.currentComponent;
  }
}

// 🚀 INICIALIZACIÓN
const loader = new ComponentLoader("loadzone");

// Exponer el loader globalmente para uso externo
window.ComponentLoader = loader;
window.ComponentLibrary = ComponentLibrary;

console.log("🎉 Sistema de componentes inicializado");
console.log("📚 Componentes disponibles:", Object.keys(ComponentLibrary));

async function loadThemePresets() {
  if (!window.themeSystem) {
    console.warn("ColorThemeSystem no está inicializado");
    return false;
  }

  try {
    await window.themeSystem.waitForElement("#themePresets", 3000);
    window.themeSystem.generateThemePresets();
    console.log("Presets de tema generados");
    return true;
  } catch (e) {
    console.warn("No se encontró #themePresets:", e);
    return false;
  }
}

// Uso
(async () => {
  //const success = await loadThemePresets();
  const container = document.getElementById("themePresets");
  if (container && container.children.length > 0) {
    console.log("✅ Presets confirmados en el DOM");
  } else {
    console.warn("❌ Presets no se generaron en el DOM");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  // 1. Selecciona el botón 'Style' por su ID
  const styleButton = document.getElementById("style");

  if (styleButton) {
    // 2. Añade el event listener
    styleButton.addEventListener("click", () => {
      // 3. Llama al loader global que ya creaste.
      // Esta función ya incluye la espera y la
      // renderización de los presets.
      window.ComponentLoader.load("style");

      console.log("Solicitando carga del componente 'style'...");
    });
  }

  // por ejemplo, para 'profile')
  const profileButton = document.getElementById("profile"); // Asumiendo que tienes un botón con id="profile"
  if (profileButton) {
    profileButton.addEventListener("click", () => {
      window.ComponentLoader.load("profile");
    });
  }

  // por ejemplo, para 'profile')
  const menuButton = document.getElementById("Menu"); // Asumiendo que tienes un botón con id="profile"
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      window.ComponentLoader.load("menu");
    });
  }
  //
});
