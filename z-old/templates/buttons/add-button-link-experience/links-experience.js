import {
  constructSheet,
  closeSheet,
} from "/shared/components/bottom-sheet/bottom-sheet.js";

function hydrateTarget(data) {
  const target = document.getElementById("hydration-target");
  if (!target) return;
  target.innerHTML = `
          <div class="example-card">
            <h2>${data.text}</h2>
            <a href="${data.url}" class="example-link">Visit Link</a>
            <p class="example-experience">${data.experience}</p>
          </div>
        `;
}

function openExampleBottomSheet() {
  S.cat = "all";
  S.q = "";
  S.activePresetId = null;
  S.selectedVariantId = null;

  constructSheet({
    scope: "presets",
    title: `
    <div class="main-title">Agregar Link</div>
    <div class="main-subtitle">Busca o elige un preset listo</div>
    `,
    content: "#example-bottom-sheet-template",
    bottom_actions: {
      layout: "single",
      primary: {
        label: "Close",
        callback: () => closeSheet(),
      },
    },
  });

  renderPills();
  renderList();
}

/* */

document
  .getElementById("openBottomSheet")
  .addEventListener("click", openExampleBottomSheet);

/* */

// ═══════════════════════════════════════════
// SVG HELPER
// ═══════════════════════════════════════════
const ico = (name) =>
  `<svg class="svg-icon" viewBox="0 0 24 24"><use href="#icon-${name}"></use></svg>`;

// ═══════════════════════════════════════════
// PRESET DATABASE
// ═══════════════════════════════════════════
const PRESETS = [
  /* SOCIAL */
  {
    id: "ig-minimal",
    name: "Instagram Minimal",
    category: "social",
    tags: ["instagram", "foto", "social", "red social", "ig"],
    badgeBg: "#fdf2f8",
    badgeColor: "#E1306C",
    shortDesc: "Borde izquierdo rosa, icono a la izquierda",
    specs: {
      Posición: "Izquierda",
      Fondo: "Blanco",
      Bordes: "Izq 4px",
      Radio: "12px",
    },
    variants: ["ig-minimal", "ig-dark"],
    label: "Sígueme en Instagram",
    desc: "",
    url: "https://instagram.com/",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "instagram",
    color: "#E1306C",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#e4e4e7",
    borderT: 0,
    borderB: 0,
    borderL: 4,
    borderR: 0,
    borderColor: "#E1306C",
    borderRadius: 12,
  },
  {
    id: "ig-dark",
    name: "Instagram Dark",
    category: "social",
    tags: ["instagram", "foto", "social", "dark", "oscuro", "ig"],
    badgeBg: "#09090b",
    badgeColor: "#E1306C",
    shortDesc: "Fondo negro, subtítulo con handle",
    specs: {
      Posición: "Izquierda",
      Fondo: "Negro",
      Bordes: "Ninguno",
      Radio: "16px",
    },
    variants: ["ig-minimal", "ig-dark"],
    label: "Instagram",
    desc: "@miusuario",
    url: "https://instagram.com/",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "instagram",
    color: "#ffffff",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#ffffff",
    subFont: "'Inter', sans-serif",
    subColor: "#a1a1aa",
    bgType: "solid",
    bgColor: "#09090b",
    bgGrad1: "#09090b",
    bgGrad2: "#18181b",
    borderT: 0,
    borderB: 0,
    borderL: 0,
    borderR: 0,
    borderColor: "#27272a",
    borderRadius: 16,
  },
  {
    id: "twitter-x",
    name: "Twitter / X",
    category: "social",
    tags: ["twitter", "x", "social", "dark", "tweet"],
    badgeBg: "#000000",
    badgeColor: "#ffffff",
    shortDesc: "Fondo negro, estilo X oficial",
    specs: {
      Posición: "Izquierda",
      Fondo: "Negro",
      Bordes: "Ninguno",
      Radio: "14px",
    },
    variants: ["twitter-x"],
    label: "Twitter / X",
    desc: "",
    url: "https://twitter.com/",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "twitter",
    color: "#ffffff",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#ffffff",
    subFont: "'Inter', sans-serif",
    subColor: "#a1a1aa",
    bgType: "solid",
    bgColor: "#000000",
    bgGrad1: "#000000",
    bgGrad2: "#18181b",
    borderT: 0,
    borderB: 0,
    borderL: 0,
    borderR: 0,
    borderColor: "#27272a",
    borderRadius: 14,
  },
  {
    id: "linkedin-pro",
    name: "LinkedIn Pro",
    category: "social",
    tags: ["linkedin", "trabajo", "profesional", "social", "empleo"],
    badgeBg: "#0A66C2",
    badgeColor: "#ffffff",
    shortDesc: "Azul LinkedIn, con descripción",
    specs: {
      Posición: "Izquierda",
      Fondo: "Azul LinkedIn",
      Bordes: "Ninguno",
      Radio: "14px",
    },
    variants: ["linkedin-pro"],
    label: "LinkedIn",
    desc: "Conéctemos profesionalmente",
    url: "https://linkedin.com/in/",
    linkType: "url",
    variant: "left",
    shape: "squircle",
    icon: "linkedin",
    color: "#ffffff",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 6,
    titleFont: "'Inter', sans-serif",
    titleColor: "#ffffff",
    subFont: "'Inter', sans-serif",
    subColor: "#bfdbfe",
    bgType: "solid",
    bgColor: "#0A66C2",
    bgGrad1: "#0A66C2",
    bgGrad2: "#1d4ed8",
    borderT: 0,
    borderB: 0,
    borderL: 0,
    borderR: 0,
    borderColor: "#1d4ed8",
    borderRadius: 14,
  },
  {
    id: "youtube-red",
    name: "YouTube",
    category: "social",
    tags: ["youtube", "video", "canal", "social", "suscribir"],
    badgeBg: "#dc2626",
    badgeColor: "#ffffff",
    shortDesc: "Rojo YouTube, con CTA de suscripción",
    specs: {
      Posición: "Izquierda",
      Fondo: "Rojo YouTube",
      Bordes: "Ninguno",
      Radio: "14px",
    },
    variants: ["youtube-red"],
    label: "Mi Canal de YouTube",
    desc: "Suscríbete gratis",
    url: "https://youtube.com/",
    linkType: "url",
    variant: "left",
    shape: "squircle",
    icon: "youtube",
    color: "#ffffff",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#ffffff",
    subFont: "'Inter', sans-serif",
    subColor: "#fecaca",
    bgType: "solid",
    bgColor: "#dc2626",
    bgGrad1: "#dc2626",
    bgGrad2: "#b91c1c",
    borderT: 0,
    borderB: 0,
    borderL: 0,
    borderR: 0,
    borderColor: "#b91c1c",
    borderRadius: 14,
  },
  {
    id: "music-stacked",
    name: "Spotify / Música",
    category: "social",
    tags: ["música", "spotify", "social", "stacked", "cancion", "audio"],
    badgeBg: "#f0fdf4",
    badgeColor: "#1DB954",
    shortDesc: "Icono arriba, estilo stacked verde",
    specs: {
      Posición: "Arriba (stacked)",
      Fondo: "Verde suave",
      Bordes: "1px completo",
      Radio: "16px",
    },
    variants: ["music-stacked"],
    label: "Escucha mi música",
    desc: "Disponible en Spotify",
    url: "https://",
    linkType: "url",
    variant: "top",
    shape: "circled",
    icon: "music",
    color: "#1DB954",
    textAlign: "center",
    marginMedia: 10,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#f0fdf4",
    bgGrad1: "#f0fdf4",
    bgGrad2: "#dcfce7",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#bbf7d0",
    borderRadius: 16,
  },

  /* CONTACT */
  {
    id: "whatsapp-cta",
    name: "WhatsApp",
    category: "contact",
    tags: ["whatsapp", "mensaje", "contacto", "chat", "wa", "escribir"],
    badgeBg: "#25D366",
    badgeColor: "#ffffff",
    shortDesc: "Verde WhatsApp, pill redondeado",
    specs: {
      Posición: "Izquierda",
      Fondo: "Verde WhatsApp",
      Bordes: "Ninguno",
      Radio: "28px",
    },
    variants: ["whatsapp-cta"],
    label: "Escríbeme por WhatsApp",
    desc: "",
    url: "https://wa.me/",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "whatsapp",
    color: "#ffffff",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#ffffff",
    subFont: "'Inter', sans-serif",
    subColor: "#a1a1aa",
    bgType: "solid",
    bgColor: "#25D366",
    bgGrad1: "#25D366",
    bgGrad2: "#16a34a",
    borderT: 0,
    borderB: 0,
    borderL: 0,
    borderR: 0,
    borderColor: "#16a34a",
    borderRadius: 28,
  },
  {
    id: "email-clean",
    name: "Email",
    category: "contact",
    tags: ["email", "correo", "contacto", "mail", "mensaje", "escribir"],
    badgeBg: "#f4f4f5",
    badgeColor: "#09090b",
    shortDesc: "Tipografía serif, respuesta en 24h",
    specs: {
      Posición: "Izquierda",
      Fondo: "Blanco",
      Bordes: "1px completo",
      Radio: "12px",
    },
    variants: ["email-clean"],
    label: "Contáctame por email",
    desc: "Respondo en 24 horas",
    url: "",
    linkType: "mail",
    variant: "left",
    shape: "circled",
    icon: "mail",
    color: "#09090b",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Playfair Display', serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#f4f4f5",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#e4e4e7",
    borderRadius: 12,
  },
  {
    id: "phone-pill",
    name: "Teléfono",
    category: "contact",
    tags: ["telefono", "llamada", "call", "contacto", "pill"],
    badgeBg: "#f4f4f5",
    badgeColor: "#09090b",
    shortDesc: "Pill redondeado, borde negro",
    specs: {
      Posición: "Izquierda",
      Fondo: "Blanco",
      Bordes: "1px negro",
      Radio: "30px",
    },
    variants: ["phone-pill"],
    label: "Llámame",
    desc: "",
    url: "",
    linkType: "tel",
    variant: "left",
    shape: "circled",
    icon: "phone",
    color: "#09090b",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#e4e4e7",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#09090b",
    borderRadius: 30,
  },
  {
    id: "location-pin",
    name: "Ubicación / Maps",
    category: "contact",
    tags: ["mapa", "ubicacion", "maps", "google", "direccion", "donde"],
    badgeBg: "#fef2f2",
    badgeColor: "#dc2626",
    shortDesc: "Pin rojo, muestra ciudad/dirección",
    specs: {
      Posición: "Izquierda",
      Fondo: "Rosa suave",
      Bordes: "1px rojo suave",
      Radio: "14px",
    },
    variants: ["location-pin"],
    label: "Ver ubicación",
    desc: "Los Cabos, BCS, México",
    url: "https://maps.google.com",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "map-pin",
    color: "#dc2626",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#fef2f2",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
  },

  /* CTA */
  {
    id: "portfolio-hero",
    name: "Portfolio / Sitio Web",
    category: "cta",
    tags: ["portfolio", "web", "sitio", "proyectos", "trabajo", "cta"],
    badgeBg: "#f4f4f5",
    badgeColor: "#09090b",
    shortDesc: "Serif, gradiente gris, sin icono centrado",
    specs: {
      Posición: "Sin icono",
      Fondo: "Gradiente gris",
      Bordes: "1px suave",
      Radio: "20px",
    },
    variants: ["portfolio-hero", "website-cta"],
    label: "Ver mi Portfolio",
    desc: "Proyectos seleccionados 2024",
    url: "https://",
    linkType: "url",
    variant: "none",
    shape: "circled",
    icon: "globe",
    color: "#09090b",
    textAlign: "center",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Playfair Display', serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "gradient",
    bgColor: "#ffffff",
    bgGrad1: "#f4f4f5",
    bgGrad2: "#e4e4e7",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#e4e4e7",
    borderRadius: 20,
  },
  {
    id: "website-cta",
    name: "Visitar Sitio Web",
    category: "cta",
    tags: ["web", "sitio", "url", "visitar", "cta", "link"],
    badgeBg: "#eff6ff",
    badgeColor: "#2563eb",
    shortDesc: "Azul suave, icono globo izquierda",
    specs: {
      Posición: "Izquierda",
      Fondo: "Azul suave",
      Bordes: "1px azul",
      Radio: "14px",
    },
    variants: ["portfolio-hero", "website-cta"],
    label: "Visita mi sitio web",
    desc: "",
    url: "https://",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "globe",
    color: "#2563eb",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#1e3a8a",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#eff6ff",
    bgGrad1: "#eff6ff",
    bgGrad2: "#dbeafe",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#bfdbfe",
    borderRadius: 14,
  },
  {
    id: "calendar-cta",
    name: "Agendar Llamada",
    category: "cta",
    tags: [
      "agenda",
      "llamada",
      "calendario",
      "calendly",
      "reserva",
      "cita",
      "meeting",
    ],
    badgeBg: "#09090b",
    badgeColor: "#ffffff",
    shortDesc: "Fondo negro, mono font, duración visible",
    specs: {
      Posición: "Izquierda",
      Fondo: "Negro",
      Bordes: "Ninguno",
      Radio: "14px",
    },
    variants: ["calendar-cta"],
    label: "Agenda una llamada",
    desc: "30 min · Gratis",
    url: "https://calendly.com/",
    linkType: "url",
    variant: "left",
    shape: "squircle",
    icon: "calendar",
    color: "#ffffff",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 4,
    titleFont: "'JetBrains Mono', monospace",
    titleColor: "#ffffff",
    subFont: "'JetBrains Mono', monospace",
    subColor: "#a1a1aa",
    bgType: "solid",
    bgColor: "#09090b",
    bgGrad1: "#09090b",
    bgGrad2: "#18181b",
    borderT: 0,
    borderB: 0,
    borderL: 0,
    borderR: 0,
    borderColor: "#27272a",
    borderRadius: 14,
  },
  {
    id: "cv-download",
    name: "Descargar CV",
    category: "cta",
    tags: ["cv", "curriculum", "descargar", "pdf", "trabajo", "resume"],
    badgeBg: "#f4f4f5",
    badgeColor: "#09090b",
    shortDesc: "Flecha derecha, borde doble negro",
    specs: {
      Posición: "Derecha",
      Fondo: "Blanco",
      Bordes: "2px negro",
      Radio: "8px",
    },
    variants: ["cv-download"],
    label: "Descargar mi CV",
    desc: "PDF · Actualizado 2024",
    url: "https://",
    linkType: "url",
    variant: "right",
    shape: "circled",
    icon: "download",
    color: "#09090b",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#e4e4e7",
    borderT: 2,
    borderB: 2,
    borderL: 2,
    borderR: 2,
    borderColor: "#09090b",
    borderRadius: 8,
  },

  /* EDITORIAL */
  {
    id: "serif-elegant",
    name: "Editorial / Blog",
    category: "editorial",
    tags: [
      "editorial",
      "blog",
      "articulo",
      "leer",
      "substack",
      "newsletter",
      "serif",
    ],
    badgeBg: "#fffbeb",
    badgeColor: "#92400e",
    shortDesc: "Serif Playfair, fondo ámbar suave",
    specs: {
      Posición: "Izquierda",
      Fondo: "Ámbar suave",
      Bordes: "1px dorado",
      Radio: "12px",
    },
    variants: ["serif-elegant", "gradient-hero"],
    label: "Leer mi artículo",
    desc: "Publicado en Substack",
    url: "https://",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "star",
    color: "#92400e",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Playfair Display', serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#78716c",
    bgType: "solid",
    bgColor: "#fffbeb",
    bgGrad1: "#fffbeb",
    bgGrad2: "#fef3c7",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#fde68a",
    borderRadius: 12,
  },
  {
    id: "gradient-hero",
    name: "Gradient Hero",
    category: "editorial",
    tags: ["gradiente", "editorial", "hero", "impacto", "stacked", "destacado"],
    badgeBg: "#eef2ff",
    badgeColor: "#4f46e5",
    shortDesc: "Icono arriba, gradiente índigo, serif",
    specs: {
      Posición: "Arriba (stacked)",
      Fondo: "Gradiente índigo",
      Bordes: "1px morado",
      Radio: "20px",
    },
    variants: ["serif-elegant", "gradient-hero"],
    label: "Mi contenido destacado",
    desc: "Explora todo mi trabajo",
    url: "https://",
    linkType: "url",
    variant: "top",
    shape: "circled",
    icon: "zap",
    color: "#4f46e5",
    textAlign: "center",
    marginMedia: 10,
    paddingMedia: 0,
    titleFont: "'Playfair Display', serif",
    titleColor: "#1e1b4b",
    subFont: "'Inter', sans-serif",
    subColor: "#4338ca",
    bgType: "gradient",
    bgColor: "#eef2ff",
    bgGrad1: "#eef2ff",
    bgGrad2: "#c7d2fe",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#a5b4fc",
    borderRadius: 20,
  },
  {
    id: "mono-stark",
    name: "Mono / GitHub",
    category: "editorial",
    tags: ["mono", "github", "codigo", "tech", "developer", "stark"],
    badgeBg: "#f4f4f5",
    badgeColor: "#09090b",
    shortDesc: "Monospace, subrayado inferior, sin radio",
    specs: {
      Posición: "Izquierda",
      Fondo: "Zinc 100",
      Bordes: "2px inferior",
      Radio: "0px",
    },
    variants: ["mono-stark"],
    label: "Ver en GitHub",
    desc: "",
    url: "https://github.com/",
    linkType: "url",
    variant: "left",
    shape: "square",
    icon: "link-2",
    color: "#09090b",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'JetBrains Mono', monospace",
    titleColor: "#09090b",
    subFont: "'JetBrains Mono', monospace",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#f4f4f5",
    bgGrad1: "#f4f4f5",
    bgGrad2: "#e4e4e7",
    borderT: 0,
    borderB: 2,
    borderL: 0,
    borderR: 0,
    borderColor: "#09090b",
    borderRadius: 0,
  },

  /* MINIMAL */
  {
    id: "ghost-border",
    name: "Ghost Border",
    category: "minimal",
    tags: ["ghost", "minimal", "limpio", "borde", "neutro", "generico"],
    badgeBg: "#f4f4f5",
    badgeColor: "#71717a",
    shortDesc: "Borde gris 1px, totalmente neutro",
    specs: {
      Posición: "Izquierda",
      Fondo: "Blanco",
      Bordes: "1px gris",
      Radio: "14px",
    },
    variants: ["ghost-border", "text-only"],
    label: "Enlace limpio",
    desc: "",
    url: "https://",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "link",
    color: "#71717a",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#f4f4f5",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#e4e4e7",
    borderRadius: 14,
  },
  {
    id: "text-only",
    name: "Solo Texto",
    category: "minimal",
    tags: ["texto", "minimal", "sin icono", "centrado", "simple"],
    badgeBg: "#f4f4f5",
    badgeColor: "#09090b",
    shortDesc: "Sin icono, texto centrado, máximo limpio",
    specs: {
      Posición: "Sin icono",
      Fondo: "Blanco",
      Bordes: "1px gris",
      Radio: "14px",
    },
    variants: ["ghost-border", "text-only"],
    label: "Ver más información",
    desc: "",
    url: "https://",
    linkType: "url",
    variant: "none",
    shape: "circled",
    icon: "link",
    color: "#09090b",
    textAlign: "center",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgGrad1: "#ffffff",
    bgGrad2: "#f4f4f5",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#e4e4e7",
    borderRadius: 14,
  },
  {
    id: "heart-warm",
    name: "Apoyo / Donación",
    category: "minimal",
    tags: ["corazon", "apoyo", "donacion", "calido", "fans", "comunidad"],
    badgeBg: "#fff1f2",
    badgeColor: "#f43f5e",
    shortDesc: "Rosa suave, corazón, sensación cálida",
    specs: {
      Posición: "Izquierda",
      Fondo: "Rosa suave",
      Bordes: "1px rosa",
      Radio: "16px",
    },
    variants: ["heart-warm"],
    label: "Apóyame",
    desc: "Comparte o dona",
    url: "https://",
    linkType: "url",
    variant: "left",
    shape: "circled",
    icon: "heart",
    color: "#f43f5e",
    textAlign: "left",
    marginMedia: 14,
    paddingMedia: 0,
    titleFont: "'Inter', sans-serif",
    titleColor: "#09090b",
    subFont: "'Inter', sans-serif",
    subColor: "#71717a",
    bgType: "solid",
    bgColor: "#fff1f2",
    bgGrad1: "#fff1f2",
    bgGrad2: "#ffe4e6",
    borderT: 1,
    borderB: 1,
    borderL: 1,
    borderR: 1,
    borderColor: "#fecdd3",
    borderRadius: 16,
  },
];

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════
const CATS = [
  { id: "all", label: "Todos", color: "#09090b" },
  { id: "social", label: "Social", color: "#e1306c" },
  { id: "contact", label: "Contacto", color: "#25d366" },
  { id: "cta", label: "CTA", color: "#2563eb" },
  { id: "editorial", label: "Editorial", color: "#92400e" },
  { id: "minimal", label: "Minimal", color: "#71717a" },
];

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
const S = {
  cat: "all",
  q: "",
  activePresetId: null, // preset abierto en detail view
  selectedVariantId: null, // variante seleccionada dentro del detail
};

// ═══════════════════════════════════════════
// BIO-BTN COMPILER (igual que builder)
// ═══════════════════════════════════════════
function compileBioBtn(p, opts = {}) {
  const descClass = p.desc ? "bio-btn--has-desc" : "";
  const bg =
    p.bgType === "gradient"
      ? `linear-gradient(135deg, ${p.bgGrad1}, ${p.bgGrad2})`
      : p.bgColor;
  const alignItems =
    p.textAlign === "center"
      ? "center"
      : p.textAlign === "right"
        ? "flex-end"
        : "flex-start";
  const mediaBg =
    p.variant === "image"
      ? `linear-gradient(135deg,${p.color},#cbd5e1)`
      : "transparent";
  const extraStyle = opts.extraStyle || "";

  return `
          <div class="bio-btn ${descClass}"
               data-variant="${p.variant}" data-shape="${p.shape}"
               style="
                 --btn-bg:${bg};--btn-radius:${p.borderRadius}px;
                 --btn-text-color:${p.titleColor};--btn-color:${p.color};
                 --btn-border-top:${p.borderT}px;--btn-border-bottom:${p.borderB}px;
                 --btn-border-left:${p.borderL}px;--btn-border-right:${p.borderR}px;
                 --btn-border-color:${p.borderColor};
                 --btn-media-margin:${p.marginMedia}px;--btn-media-padding:${p.paddingMedia}px;
                 --btn-text-align:${p.textAlign};--btn-align-items:${alignItems};
                 ${extraStyle}
               ">
            <div class="bio-btn__media" style="background:${mediaBg}">${ico(p.icon)}</div>
            <div class="bio-btn__content">
              <span class="bio-btn__title" style="font-family:${p.titleFont};color:${p.titleColor}">${p.label}</span>
              ${p.desc ? `<span class="bio-btn__desc" style="font-family:${p.subFont};color:${p.subColor}">${p.desc}</span>` : ""}
            </div>
          </div>`;
}

// ═══════════════════════════════════════════
// FILTER
// ═══════════════════════════════════════════
function filtered() {
  const q = S.q.toLowerCase().trim();
  return PRESETS.filter((p) => {
    const mCat = S.cat === "all" || p.category === S.cat;
    const mQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q));
    return mCat && mQ;
  });
}

// ═══════════════════════════════════════════
// VIEW A — RENDER
// ═══════════════════════════════════════════
function renderPills() {
  document.getElementById("pillsInner").innerHTML = CATS.map(
    (c) => `
          <div class="pill ${S.cat === c.id ? "active" : ""}" onclick="setCat('${c.id}')">
            <span class="pill-dot" style="background:${c.color}"></span>${c.label}
          </div>`,
  ).join("");
}

function renderList() {
  const list = filtered();
  const ul = document.getElementById("presetList");
  const lbl = document.getElementById("sectionLabel");

  // Section label
  if (S.q) {
    lbl.textContent = `${list.length} resultado${list.length !== 1 ? "s" : ""} para "${S.q}"`;
  } else {
    lbl.textContent =
      S.cat === "all"
        ? "Presets sugeridos"
        : `Presets · ${CATS.find((c) => c.id === S.cat)?.label}`;
  }

  if (list.length === 0 && S.q) {
    ul.innerHTML = `
            <li>
              <div class="empty-state">
                <div class="empty-ico">${ico("search")}</div>
                <div class="empty-txt">Sin resultados</div>
                <div class="empty-hint">Intenta con otro término</div>
              </div>
            </li>`;
    return;
  }

  let defaultRowHtml = "";
  if (!S.q && S.cat === "all") {
    defaultRowHtml = `
          <li>
            <div class="preset-row" onclick="openDetail('default')">
              <div class="row-badge" style="background: #f4f4f5">
                <svg class="svg-icon" style="width:20px;height:20px;color:#09090b">
                  <use href="#icon-link"/>
                </svg>
              </div>
              <div class="row-text">
                <div class="row-name">Link por defecto</div>
                <div class="row-desc">Crear un enlace clásico personalizado desde cero</div>
              </div>
              <span class="row-arrow">${ico("chevron-right")}</span>
            </div>
          </li>`;
  }

  ul.innerHTML = defaultRowHtml + list
    .map(
      (p) => `
          <li>
            <div class="preset-row" onclick="openDetail('${p.id}')">
              <div class="row-badge" style="background:${p.badgeBg}">
                <svg class="svg-icon" style="width:20px;height:20px;color:${p.badgeColor}">
                  <use href="#icon-${p.icon}"/>
                </svg>
              </div>
              <div class="row-text">
                <div class="row-name">${p.name}</div>
                <div class="row-desc">${p.shortDesc}</div>
              </div>
              <span class="row-arrow">${ico("chevron-right")}</span>
            </div>
          </li>`,
    )
    .join("");
}

// ═══════════════════════════════════════════
// VIEW B — DETAIL RENDER
// ═══════════════════════════════════════════
function openDetail(id) {
  if (id === "default") {
    constructSheet({
      scope: "config-link",
      title: `
      <div class="main-title">Diseñar Link</div>
      <div class="main-subtitle">Personaliza tu enlace</div>
      `,
      content: "#config-link",
      bottom_actions: {
        layout: "single",
        primary: {
          label: "Confirmar y Guardar Link",
          callback: () => saveCustomLink(),
        },
      },
    });

    initLinkConfigSheet();
    return;
  }

  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return;

  S.activePresetId = id;
  S.selectedVariantId = id; // default: el mismo preset es la variante activa

  // Header
  document.getElementById("detailTitle").textContent = preset.name;
  document.getElementById("detailCat").textContent =
    CATS.find((c) => c.id === preset.category)?.label || preset.category;

  // Build detail content
  renderDetailContent(preset);

  // Switch views
  showView("viewDetail", "right");
}

function renderDetailContent(preset) {
  const variantIds = preset.variants || [preset.id];
  const variantPresets = variantIds
    .map((vid) => PRESETS.find((p) => p.id === vid))
    .filter(Boolean);

  // Hero preview (active variant)
  const activeVariant =
    PRESETS.find((p) => p.id === S.selectedVariantId) || preset;

  // Specs chips
  const specsHtml = Object.entries(activeVariant.specs)
    .map(
      ([k, v]) => `
          <div class="spec-chip">
            <span class="spec-label">${k}</span>
            <span class="spec-val">${v}</span>
          </div>`,
    )
    .join("");

  // Variants strip (solo si hay más de 1)
  let variantsHtml = "";
  if (variantPresets.length > 1) {
    variantsHtml = `
            <div class="variants-section">
              <div class="variants-title">Variantes del estilo</div>
              <div class="variants-row">
                ${variantPresets
                  .map(
                    (vp) => `
                  <div class="variant-option ${S.selectedVariantId === vp.id ? "sel" : ""}"
                       onclick="selectVariant('${vp.id}')">
                    ${compileBioBtn(vp)}
                  </div>`,
                  )
                  .join("")}
              </div>
            </div>`;
  }

  document.getElementById("detailScroll").innerHTML = `
          <div class="hero-preview">
            <div class="hero-preview-label">
              ${ico("sparkle")} Vista previa real
            </div>
            <div class="hero-preview-content" id="heroPreviewContent">
              ${compileBioBtn(activeVariant, { extraStyle: "pointer-events:none;" })}
            </div>
          </div>

          <div class="specs-section">
            <div class="specs-title">Configuración del preset</div>
            <div class="specs-grid">${specsHtml}</div>
          </div>

          ${variantsHtml}
        `;
}

function selectVariant(id) {
  S.selectedVariantId = id;
  const mainPreset = PRESETS.find((p) => p.id === S.activePresetId);
  if (mainPreset) renderDetailContent(mainPreset);
}

// ═══════════════════════════════════════════
// USE PRESET → localStorage → redirect
// ═══════════════════════════════════════════
const BUILDER_PRESET_KEY = "bio_builder_pending_preset";
const BUILDER_URL = "bio-site-link-builder.html";

function usePreset() {
  const id = S.selectedVariantId || S.activePresetId;
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return;

  // Locate the main list container where buttons are displayed
  const container = document.getElementById('mainListContainer');
  if (!container) return;

  // Remove empty-state if this is the first button being added
  const emptyState = container.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  // Ensure there is a <ul> element to hold list items
  let ul = container.querySelector('ul');
  if (!ul) {
    ul = document.createElement('ul');
    container.appendChild(ul);
  }

  // Create a new list item with the compiled bio button HTML
  const li = document.createElement('li');
  li.innerHTML = compileBioBtn(preset);
  ul.appendChild(li);

  // Switch container to normal mode (show list, not edit/empty)
  container.setAttribute('data-status', STATUS.NORMAL);
}

function showToast(cb) {
  const t = document.getElementById("toast");
  t.classList.add("show");
  setTimeout(() => {
    t.classList.remove("show");
    if (cb) setTimeout(cb, 300);
  }, 1300);
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function showView(id, dir = "right") {
  document
    .querySelectorAll(".view")
    .forEach((v) =>
      v.classList.remove("active", "view-enter-right", "view-enter-left"),
    );
  const el = document.getElementById(id);
  el.classList.add("active");
  el.classList.add(dir === "right" ? "view-enter-right" : "view-enter-left");
}

function goBack() {
  showView("viewSearch", "left");
}

// ═══════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════
function setCat(id) {
  S.cat = id;
  renderPills();
  renderList();
}

function handleSearch(val) {
  S.q = val;
  document
    .getElementById("searchClear")
    .classList.toggle("vis", val.length > 0);
  renderList();
}

function clearSearch() {
  S.q = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("searchClear").classList.remove("vis");
  renderList();
}

// Expose functions to window for template inline onclick handlers
window.openDetail = openDetail;
window.selectVariant = selectVariant;
window.usePreset = usePreset;
window.goBack = goBack;
window.setCat = setCat;
window.handleSearch = handleSearch;
window.clearSearch = clearSearch;

// ═══════════════════════════════════════════
// CUSTOM LINK CONFIG BUILDER
// ═══════════════════════════════════════════

const BS = {
  variant: "left",
  shape: "circled",
  icon: "instagram",
  color: "#18181b",
  textAlign: "left",
  marginMedia: 14,
  paddingMedia: 0,
  linkType: "url",
  titleFont: "'Inter', sans-serif",
  titleColor: "#09090b",
  subFont: "'Inter', sans-serif",
  subColor: "#71717a",
  bgType: "solid",
  bgColor: "#ffffff",
  bgGrad1: "#ffffff",
  bgGrad2: "#e4e4e7",
  borderT: 1,
  borderB: 1,
  borderL: 1,
  borderR: 1,
  borderColor: "#e4e4e7",
  borderRadius: 14,
};

const ICONS_LIST = [
  "instagram",
  "twitter",
  "linkedin",
  "youtube",
  "music",
  "mail",
  "phone",
  "globe",
  "star",
  "heart",
  "zap",
  "home",
  "link-2",
  "map-pin",
  "user",
  "link",
];

function initLinkConfigSheet() {
  BS.variant = "left";
  BS.shape = "circled";
  BS.icon = "instagram";
  BS.color = "#18181b";
  BS.textAlign = "left";
  BS.marginMedia = 14;
  BS.paddingMedia = 0;
  BS.linkType = "url";
  BS.titleFont = "'Inter', sans-serif";
  BS.titleColor = "#09090b";
  BS.subFont = "'Inter', sans-serif";
  BS.subColor = "#71717a";
  BS.bgType = "solid";
  BS.bgColor = "#ffffff";
  BS.bgGrad1 = "#ffffff";
  BS.bgGrad2 = "#e4e4e7";
  BS.borderT = 1;
  BS.borderB = 1;
  BS.borderL = 1;
  BS.borderR = 1;
  BS.borderColor = "#e4e4e7";
  BS.borderRadius = 14;

  const PRESET_COLORS = [
    "#18181b",
    "#71717a",
    "#2563eb",
    "#059669",
    "#d97706",
    "#e11d48",
    "#7c3aed",
    "#ffffff",
  ];

  const presetsContainer = document.getElementById("colorPresets");
  if (presetsContainer) {
    presetsContainer.innerHTML = PRESET_COLORS.map(
      (c) => `
        <div class="color-swatch ${c === BS.color ? "active" : ""}" style="background: ${c};" onclick="selectPresetColor('${c}')"></div>
      `,
    ).join("");
  }

  const grid = document.getElementById("iconGrid");
  if (grid) {
    grid.innerHTML = ICONS_LIST
      .map((iconName) => {
        const selClass = iconName === BS.icon ? "sel" : "";
        return `
          <div class="icon-opt ${selClass}" data-icon="${iconName}" onclick="selectIcon(this,'${iconName}')">
            ${ico(iconName)}
          </div>
        `;
      })
      .join("");
  }

  renderPreview();
}

function selectPresetColor(color) {
  BS.color = color;
  const picker = document.getElementById("pickElementColor");
  if (picker) picker.value = color;

  document.querySelectorAll(".color-swatch").forEach((sw) => {
    sw.classList.toggle(
      "active",
      sw.style.backgroundColor === color ||
        sw.style.backgroundColor === hexToRgb(color),
    );
  });

  renderPreview();
}

function setPrimaryCustomColor(color) {
  BS.color = color;
  document
    .querySelectorAll(".color-swatch")
    .forEach((sw) => sw.classList.remove("active"));
  renderPreview();
}

function selectIcon(el, iconName) {
  document
    .querySelectorAll(".icon-opt")
    .forEach((opt) => opt.classList.remove("sel"));
  el.classList.add("sel");
  BS.icon = iconName;
  renderPreview();
}

function updateRange(type, unit) {
  const value = document.getElementById("rng" + type).value;
  const valDisplay = document.getElementById("val" + type);
  if (valDisplay) valDisplay.textContent = value + unit;

  if (type === "Margin") BS.marginMedia = parseInt(value, 10);
  else if (type === "Padding") BS.paddingMedia = parseInt(value, 10);
  else if (type === "Radius") BS.borderRadius = parseInt(value, 10);

  renderPreview();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
    : null;
}

function setPosOption(val) {
  BS.variant = val;
  document
    .querySelectorAll("#posGlider .glider-option")
    .forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.val === val);
    });

  const shapeRow = document.getElementById("imageShapeRow");
  if (shapeRow) shapeRow.style.display = val === "image" ? "block" : "none";

  const iconGrid = document.getElementById("iconGridSection");
  if (iconGrid) iconGrid.style.display = val === "none" ? "none" : "block";

  renderPreview();
}

function setShapeOption(val) {
  BS.shape = val;
  document
    .querySelectorAll("#shapeGlider .glider-option")
    .forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.val === val);
    });
  renderPreview();
}

function setTextAlignOption(val) {
  BS.textAlign = val;
  document
    .querySelectorAll("#textAlignGlider .glider-option")
    .forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.val === val);
    });
  renderPreview();
}

function setLinkType(val) {
  BS.linkType = val;
  document
    .querySelectorAll("#linkTypeGlider .glider-option")
    .forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.val === val);
    });

  const urlInput = document.getElementById("inUrl");
  if (urlInput) {
    if (val === "url") {
      urlInput.placeholder = "https://ejemplo.com";
    } else if (val === "tel") {
      urlInput.placeholder = "+34 600 000 000";
    } else if (val === "mail") {
      urlInput.placeholder = "hola@ejemplo.com";
    } else if (val === "vcf") {
      urlInput.placeholder = "Enlace a archivo de contacto .vcf";
    }
  }

  renderPreview();
}

function setBgType(val) {
  BS.bgType = val;
  document
    .querySelectorAll("#bgTypeGlider .glider-option")
    .forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.val === val);
    });

  const solidRow = document.getElementById("solidBgRow");
  if (solidRow) solidRow.style.display = val === "solid" ? "flex" : "none";

  const gradRow = document.getElementById("gradientBgRow");
  if (gradRow) gradRow.style.display = val === "gradient" ? "flex" : "none";

  renderPreview();
}

function toggleAccordion(index) {
  const target = document.getElementById("acc-" + index);
  if (!target) return;
  const isOpen = target.classList.contains("open");

  for (let i = 0; i < 4; i++) {
    const acc = document.getElementById("acc-" + i);
    if (acc) acc.classList.remove("open");
  }

  if (!isOpen) {
    target.classList.add("open");
  }
}

function compileBioButton(options) {
  const label = options.label || "Mi Enlace Bio";
  const desc = options.desc || "";
  const descClass = desc ? "bio-btn--has-desc" : "";

  let bgStyle = "";
  if (options.bgType === "gradient") {
    bgStyle = `linear-gradient(135deg, ${options.bgGrad1}, ${options.bgGrad2})`;
  } else {
    bgStyle = options.bgColor;
  }

  let alignItems = "flex-start";
  if (options.textAlign === "center") alignItems = "center";
  if (options.textAlign === "right") alignItems = "flex-end";

  return `
    <div class="bio-btn ${descClass}" 
         data-variant="${options.variant}" 
         data-shape="${options.shape}"
         style="
           --btn-bg: ${bgStyle};
           --btn-radius: ${options.borderRadius}px;
           --btn-text-color: ${options.titleColor};
           --btn-color: ${options.color};
           
           --btn-border-top: ${options.borderT}px;
           --btn-border-bottom: ${options.borderB}px;
           --btn-border-left: ${options.borderL}px;
           --btn-border-right: ${options.borderR}px;
           --btn-border-color: ${options.borderColor};
           
           --btn-media-margin: ${options.marginMedia}px;
           --btn-media-padding: ${options.paddingMedia}px;

           --btn-text-align: ${options.textAlign};
           --btn-align-items: ${alignItems};
         "
    >
      <div class="bio-btn__media" style="background: ${options.variant === "image" ? `linear-gradient(135deg, ${options.color}, #cbd5e1)` : "transparent"}">
        ${ico(options.icon)}
      </div>
      
      <div class="bio-btn__content">
        <span class="bio-btn__title" style="font-family: ${options.titleFont}; color: ${options.titleColor};">${label}</span>
        ${desc ? `<span class="bio-btn__desc" style="font-family: ${options.subFont}; color: ${options.subColor};">${desc}</span>` : ""}
      </div>
    </div>
  `;
}

function getBuilderOptions() {
  const inLabel = document.getElementById("inLabel");
  const inDesc = document.getElementById("inDesc");
  const selTitleFont = document.getElementById("selTitleFont");
  const pickTitleColor = document.getElementById("pickTitleColor");
  const selSubFont = document.getElementById("selSubFont");
  const pickSubColor = document.getElementById("pickSubColor");
  const pickBgColor = document.getElementById("pickBgColor");
  const pickGrad1 = document.getElementById("pickGrad1");
  const pickGrad2 = document.getElementById("pickGrad2");
  const borderTop = document.getElementById("borderTop");
  const borderBottom = document.getElementById("borderBottom");
  const borderLeft = document.getElementById("borderLeft");
  const borderRight = document.getElementById("borderRight");
  const pickBorderColor = document.getElementById("pickBorderColor");

  return {
    variant: BS.variant,
    shape: BS.shape,
    icon: BS.icon,
    color: BS.color,
    marginMedia: BS.marginMedia,
    paddingMedia: BS.paddingMedia,

    label: inLabel ? inLabel.value : "Mi Enlace Bio",
    desc: inDesc ? inDesc.value : "",
    textAlign: BS.textAlign,

    titleFont: selTitleFont ? selTitleFont.value : "'Inter', sans-serif",
    titleColor: pickTitleColor ? pickTitleColor.value : "#09090b",
    subFont: selSubFont ? selSubFont.value : "'Inter', sans-serif",
    subColor: pickSubColor ? pickSubColor.value : "#71717a",

    bgType: BS.bgType,
    bgColor: pickBgColor ? pickBgColor.value : "#ffffff",
    bgGrad1: pickGrad1 ? pickGrad1.value : "#ffffff",
    bgGrad2: pickGrad2 ? pickGrad2.value : "#e4e4e7",

    borderT: borderTop ? (parseInt(borderTop.value, 10) || 0) : 1,
    borderB: borderBottom ? (parseInt(borderBottom.value, 10) || 0) : 1,
    borderL: borderLeft ? (parseInt(borderLeft.value, 10) || 0) : 1,
    borderR: borderRight ? (parseInt(borderRight.value, 10) || 0) : 1,
    borderColor: pickBorderColor ? pickBorderColor.value : "#e4e4e7",
    borderRadius: BS.borderRadius,
  };
}

function renderPreview() {
  const preview = document.getElementById("previewContent");
  if (preview) {
    preview.innerHTML = compileBioButton(getBuilderOptions());
  }
}

function saveCustomLink() {
  const options = getBuilderOptions();
  options.id = "custom";
  options.url = document.getElementById("inUrl") ? document.getElementById("inUrl").value : "";
  options.linkType = BS.linkType;
  
  localStorage.setItem(BUILDER_PRESET_KEY, JSON.stringify(options));
  
  hydrateTarget({
    text: options.label,
    url: options.url,
    experience: "Enlace Personalizado"
  });

  showToast(() => {
    window.location.href = BUILDER_URL;
  });
}

// Expose custom builder functions to window
window.selectPresetColor = selectPresetColor;
window.setPrimaryCustomColor = setPrimaryCustomColor;
window.selectIcon = selectIcon;
window.updateRange = updateRange;
window.setPosOption = setPosOption;
window.setShapeOption = setShapeOption;
window.setTextAlignOption = setTextAlignOption;
window.setLinkType = setLinkType;
window.setBgType = setBgType;
window.toggleAccordion = toggleAccordion;
window.renderPreview = renderPreview;
window.saveCustomLink = saveCustomLink;


