// =============================================================================
//  CONFIG  —  single source of truth for every magic value
// =============================================================================

const CONFIG = {
  app: {
    baseUrl: "https://app.newfacecards.com",
  },
  vcf: {
    version: "3.0",
    mimeType: "text/vcard",
  },
  url: {
    tabParam: "tab",
    tabMap: {
      empresa : "Empresa",
      redes   : "Redes",
    },
  },
  share: {
    text: "¡Mira este enlace!",
  },
  viewport: {
    content: "width=device-width, initial-scale=1.0, user-scalable=no",
  },
  selectors: {
    // layout
    allTabs       : ".temp",
    activeNavIcon : ".nav-icon",
    floatNav      : ".float-navigation",
    itemCheckbox  : ".item-click",
    viewport      : 'meta[name="viewport"]',
    favicon       : "link[rel*='icon']",
    // card head
    cardName      : "#card_head h2",
    cardCargo     : "#card_head .fr_cargo",
    cardDesc      : "#card_head .description",
    profilePic    : "#profile_pic",
    // contact
    nameTag       : ".name-tag h2",
    emailLink     : 'a[href^="mailto:"]',
    phoneLink     : 'a[href^="tel:"]',
    // video modal
    videoCloseBtn : '[for="modal_1"].close-button',
    videoContent  : ".modal-content[data-iframe-src]",
  },
};


// =============================================================================
//  STATE  —  the one place that holds what is happening right now
// =============================================================================

const state = {
  activeTab       : null,    // which tab panel is visible
  floatNavVisible : true,    // whether the floating nav is shown
};

function readState(key)        { return state[key]; }
function writeState(key, val)  { state[key] = val; }
function snapshotState()       { return { ...state }; }


// =============================================================================
//  LAYER 1 — DOM READING
//  Pure functions that extract raw data from the page.
//  Nothing here knows what the data is used for.
// =============================================================================

function findElement(selector, context = document) {
  return context.querySelector(selector);
}

function findAllElements(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

function findElementById(id) {
  return document.getElementById(id);
}

function readTextOf(selector) {
  return findElement(selector)?.textContent?.trim() ?? "";
}

function readAttributeOf(selector, attribute) {
  return findElement(selector)?.getAttribute(attribute) ?? "";
}

function readSrcOf(selector) {
  return findElement(selector)?.src ?? "";
}

function readCurrentUrl() {
  return window.location.href;
}

function readUrlSearchParams() {
  return new URLSearchParams(window.location.search);
}

function readPageTitle() {
  return document.title;
}

function readUrlPathSegments() {
  return new URL(readCurrentUrl()).pathname.split("/");
}


// =============================================================================
//  LAYER 2 — DOM WRITING
//  Pure functions that apply changes to the page.
//  Nothing here decides when or why to change something.
// =============================================================================

function showElement(el) {
  if (el) el.style.display = "block";
}

function hideElement(el) {
  if (el) el.style.display = "none";
}

function addClassTo(el, className) {
  el?.classList.add(className);
}

function removeClassFrom(el, className) {
  el?.classList.remove(className);
}

function toggleClassOnCondition(el, className, condition) {
  el?.classList.toggle(className, condition);
}

function setAttributeOn(el, attribute, value) {
  el?.setAttribute(attribute, value);
}

function replaceInnerHtmlOf(el, html) {
  if (el) el.innerHTML = html;
}

function setMetaTagContent(metaId, content) {
  const meta = findElementById(metaId);
  if (!meta) return;
  content ? meta.setAttribute("content", content) : meta.remove();
}

function setDocumentTitle(title) {
  document.title = title;
}

function scrollPageToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyViewportSettings(content) {
  const meta = findElement(CONFIG.selectors.viewport);
  if (meta) setAttributeOn(meta, "content", content);
}


// =============================================================================
//  LAYER 3 — DOM QUERYING  (business-aware reads)
//  Functions that know which selectors belong to which concept.
//  They use Layer 1 internally and return typed, named values.
// =============================================================================

function queryCardIdentity() {
  const name   = readTextOf(CONFIG.selectors.cardName);
  const cargo  = readTextOf(CONFIG.selectors.cardCargo);
  const desc   = readTextOf(CONFIG.selectors.cardDesc);
  const picSrc = readSrcOf(CONFIG.selectors.profilePic);
  return { name, cargo, desc, picSrc };
}

function queryContactDetails() {
  const name  = readTextOf(CONFIG.selectors.nameTag);
  const email = readAttributeOf(CONFIG.selectors.emailLink, "href").replace(/^mailto:/, "");
  const phone = readAttributeOf(CONFIG.selectors.phoneLink, "href").replace(/^tel:/, "");
  return { name, email, phone };
}

function queryUsernameFromUrl() {
  const segments = readUrlPathSegments();
  const raw      = segments[segments.indexOf("user") + 1] ?? "contact";
  return raw.split("?")[0];
}

function queryRequestedTabFromUrl() {
  const param    = readUrlSearchParams().get(CONFIG.url.tabParam);
  return CONFIG.url.tabMap[param] ?? null;
}

function queryAreAnyItemCheckboxesChecked() {
  return findAllElements(CONFIG.selectors.itemCheckbox).some((el) => el.checked);
}

function queryFloatNavElement() {
  return findElement(CONFIG.selectors.floatNav);
}

function queryVideoModalContent() {
  return findElement(CONFIG.selectors.videoContent);
}


// =============================================================================
//  LAYER 4 — ANALYTICS
//  Knows how to report events. Knows nothing about UI or business logic.
// =============================================================================

function isAnalyticsAvailable() {
  return !!findElementById("simple_analytics") && typeof saEvent === "function";
}

function dispatchAnalyticsEvent(category, label) {
  if (isAnalyticsAvailable()) saEvent(category, label);
}

function trackTabNavigation(tabName) {
  dispatchAnalyticsEvent("Tab: ", tabName);
}

function trackButtonClick(buttonName) {
  dispatchAnalyticsEvent("Buttons: ", buttonName);
}

function trackSocialLinkClick(kind, href) {
  dispatchAnalyticsEvent(kind, btoa(href));
}

function trackItemClick(kind, name, id) {
  dispatchAnalyticsEvent(kind, `${name}_${id}`);
}


// =============================================================================
//  LAYER 5 — BUILDERS
//  Pure functions that construct data structures or strings.
//  No side effects, no DOM access.
// =============================================================================

function buildVcfString({ name, phone, email }) {
  return [
    "BEGIN:VCARD",
    `VERSION:${CONFIG.vcf.version}`,
    `FN:${name}`,
    `TEL;TYPE=CELL:${phone}`,
    `EMAIL:${email}`,
    "END:VCARD",
  ].join("\n");
}

function buildProfileDescription({ name, cargo, desc }) {
  const cargoSuffix = cargo ? ` | ${cargo}` : "";
  return `${name}${cargoSuffix}. ${desc}`;
}

function buildProfileTitle({ name, cargo, desc }) {
  const cargoSuffix = cargo ? ` | ${cargo}` : "";
  return `${name}${cargoSuffix}. ${desc}.`;
}

function buildProfileImageAltText(name) {
  return name ? `Imagen de perfil de ${name}` : "";
}

function buildAbsoluteImageUrl(src) {
  if (!src || src.startsWith("http")) return src;
  return CONFIG.app.baseUrl + src;
}

function buildFaviconLink(src) {
  const link = findElement(CONFIG.selectors.favicon) ?? document.createElement("link");
  link.type  = "image/jpeg";
  link.rel   = "icon";
  link.href  = src;
  return link;
}

function buildDownloadAnchor({ href, filename }) {
  const anchor    = document.createElement("a");
  anchor.style    = "display:none";
  anchor.href     = href;
  anchor.download = filename;
  return anchor;
}

function buildVcfBlob(vcfString) {
  return new Blob([vcfString], { type: CONFIG.vcf.mimeType });
}

function buildYoutubeIframeHtml(src) {
  return `<iframe loading="lazy" id="youtube-video" width="100%" height="100%"
    src="${src}" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`;
}


// =============================================================================
//  LAYER 6 — PROCESSES
//  Named, step-by-step workflows. Each function reads like a procedure.
//  These are the functions you call when something happens.
// =============================================================================

// ── PROCESS: Switch to a tab ─────────────────────────────────────────────────

function hideAllTabPanels() {
  findAllElements(CONFIG.selectors.allTabs).forEach(hideElement);
}

function revealTabPanel(tabName) {
  const panel = findElementById(tabName);
  showElement(panel);
}

function markNavIconAsActive(tabName) {
  findAllElements(CONFIG.selectors.activeNavIcon).forEach((icon) => {
    toggleClassOnCondition(icon, "active_tab", icon.dataset.tab === tabName);
  });
}

function switchToTab(tabName) {
  hideAllTabPanels();
  revealTabPanel(tabName);
  markNavIconAsActive(tabName);
  writeState("activeTab", tabName);
  scrollPageToTop();
  trackTabNavigation(tabName);
}

function switchToTabRequestedInUrl() {
  const tabName = queryRequestedTabFromUrl();
  if (tabName) switchToTab(tabName);
}


// ── PROCESS: Float nav visibility ────────────────────────────────────────────

function hideFloatingNav() {
  const nav = queryFloatNavElement();
  addClassTo(nav, "hide--true");
  removeClassFrom(nav, "hide--false");
  writeState("floatNavVisible", false);
}

function showFloatingNav() {
  const nav = queryFloatNavElement();
  addClassTo(nav, "hide--false");
  removeClassFrom(nav, "hide--true");
  writeState("floatNavVisible", true);
}

function syncFloatingNavToCheckboxState() {
  const anyChecked = queryAreAnyItemCheckboxesChecked();
  anyChecked ? showFloatingNav() : hideFloatingNav();
}


// ── PROCESS: Download contact as VCF ─────────────────────────────────────────

function triggerFileDownload(anchor) {
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function downloadContactCard() {
  trackButtonClick("Request-Contact");

  const contactDetails = queryContactDetails();
  const vcfString      = buildVcfString(contactDetails);
  const blob           = buildVcfBlob(vcfString);
  const blobUrl        = URL.createObjectURL(blob);
  const username       = queryUsernameFromUrl();

  const anchor = buildDownloadAnchor({ href: blobUrl, filename: `${username}.vcf` });

  triggerFileDownload(anchor);
  URL.revokeObjectURL(blobUrl);
}


// ── PROCESS: Share page link ──────────────────────────────────────────────────

function canUseNativeShare() {
  return !!navigator.share;
}

async function shareCurrentPage() {
  if (!canUseNativeShare()) {
    alert("Lo siento, tu navegador no es compatible con la función de compartir.");
    return;
  }
  try {
    await navigator.share({
      title : readPageTitle(),
      text  : CONFIG.share.text,
      url   : readCurrentUrl(),
    });
  } catch (err) {
    console.error("Error al compartir:", err);
  }
}


// ── PROCESS: Sync social meta tags ───────────────────────────────────────────

function writeSocialMetaTags({ name, cargo, desc, picSrc }) {
  const description = buildProfileDescription({ name, cargo, desc });
  const altText     = buildProfileImageAltText(name);

  const metaUpdates = [
    ["ogTitle",             name],
    ["ogDescription",       description],
    ["ogImage",             picSrc],
    ["ogImageAlt",          altText],
    ["twitterTitle",        name],
    ["twitterDescription",  description],
    ["twitterImage",        picSrc],
    ["twitterImageAlt",     altText],
  ];

  metaUpdates.forEach(([id, value]) => setMetaTagContent(id, value));
}

function syncSocialMetaTagsFromCard() {
  const identity = queryCardIdentity();
  writeSocialMetaTags(identity);
}


// ── PROCESS: Sync document identity (title + favicon) ────────────────────────

function writeFaviconToHead(src) {
  const absoluteSrc = buildAbsoluteImageUrl(src);
  if (!absoluteSrc) return;
  const link = buildFaviconLink(absoluteSrc);
  document.head.appendChild(link);
}

function syncDocumentIdentityFromCard() {
  const identity = queryCardIdentity();
  const title    = buildProfileTitle(identity);

  setDocumentTitle(title);
  writeFaviconToHead(identity.picSrc);
}


// ── PROCESS: Reset video modal on close ──────────────────────────────────────

function resetVideoIframe() {
  const content = queryVideoModalContent();
  if (!content) return;

  const iframeSrc  = content.dataset.iframeSrc;
  const iframeHtml = buildYoutubeIframeHtml(iframeSrc);
  replaceInnerHtmlOf(content, iframeHtml);
}

function bindVideoModalCloseButton() {
  const closeButton = findElement(CONFIG.selectors.videoCloseBtn);
  if (!closeButton) return;
  closeButton.addEventListener("click", resetVideoIframe);
}


// =============================================================================
//  CLICK DELEGATIONS MAP
//  Describes WHAT to listen for and WHAT process to run.
//  The handler below is the only function that reads this map.
// =============================================================================

const CLICK_DELEGATIONS = {

  "tab-switch": {
    // User clicks a nav icon to switch panels
    query   : ".nav-icon[data-tab]",
    process : (el) => switchToTab(el.dataset.tab),
  },

  "item-expanded-close": {
    // User closes an expanded item — restore the floating nav
    query   : ".item-focus.close-tab",
    process : () => showFloatingNav(),
  },

  "item-expanded-open": {
    // User opens an expandable item — track it and sync the nav
    query   : ".item-focus[data-kind][data-name][data-recid]",
    process : (el) => {
      trackItemClick(el.dataset.kind, el.dataset.name, el.dataset.recid);
      syncFloatingNavToCheckboxState();
    },
  },

  "social-link-clicked": {
    // User taps a social network link
    query   : ".my_social_link[data-kind][data-recid]",
    process : (el) => trackSocialLinkClick(el.dataset.kind, el.href),
  },

  "contact-card-download": {
    // User taps the "save contact" button
    query   : "#obtener-contacto",
    process : () => downloadContactCard(),
  },

  "share-page": {
    // User taps the share button
    query   : "[data-action='share']",
    process : () => shareCurrentPage(),
  },

};


// =============================================================================
//  CLICK HANDLER  —  one listener, one loop, reads the delegation map
// =============================================================================

function handleAnyClick(event) {
  for (const [, delegation] of Object.entries(CLICK_DELEGATIONS)) {
    const matchedElement = event.target.closest(delegation.query);
    if (matchedElement) {
      delegation.process(matchedElement, event);
      // intentionally no break — one click may match multiple delegations
    }
  }
}


// =============================================================================
//  BOOT SEQUENCE
//  Two phases: DOM ready → window fully loaded.
//  Each step is a named process call — read it like a checklist.
// =============================================================================

async function onDomReady() {
  applyViewportSettings(CONFIG.viewport.content);
  document.addEventListener("click", handleAnyClick);
  bindVideoModalCloseButton();

  if (window.HydrationEngine && window.UserService) {
    try {
      const userService = new window.UserService("https://my.newfacecards.com/nfc/front/get_user.php");
      const hydrator = new window.HydrationEngine(window.BindingStrategies);
      const data = await userService.getUserData();
      hydrator.hydrate(document, data);
    } catch (err) {
      console.error("Hydration failed:", err);
    } finally {
      document.body.setAttribute("data-state", "loaded");
    }
  } else {
    document.body.setAttribute("data-state", "loaded");
  }

  syncSocialMetaTagsFromCard();
}

function onWindowLoaded() {
  syncDocumentIdentityFromCard();
  switchToTabRequestedInUrl();
}

document.addEventListener("DOMContentLoaded", onDomReady);
window.addEventListener("load", onWindowLoaded);


// =============================================================================
//  PUBLIC API  —  surface for external scripts or legacy inline handlers
// =============================================================================

window.AppAPI = {
  switchToTab      : (name) => switchToTab(name),
  shareCurrentPage : ()     => shareCurrentPage(),
  getState         : ()     => snapshotState(),
};