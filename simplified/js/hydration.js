// =============================================================================
//  MOTOR DECLARATIVO DE HIDRATACIÓN (SOLID)
// =============================================================================

const BindingStrategies = {
  text: (el, value) => {
    el.textContent = value;
  },
  innerhtml: (el, value) => {
    el.innerHTML = value;
  },
  src: (el, value) => {
    if (value) el.setAttribute("src", value);
  },
  href: (el, value) => {
    if (value) el.setAttribute("href", value);
  },
  alt: (el, value) => {
    if (value) el.setAttribute("alt", value);
  },
  title: (el, value) => {
    if (value) el.setAttribute("title", value);
  },
  value: (el, value) => {
    if (value) el.setAttribute("value", value);
  },
  class: (el, value) => {
    if (value) el.classList.add(value);
  },
  "css-var": (el, value, config) => {
    if (config.cssVar && value)
      el.style.setProperty(config.cssVar, value);
  },
  "bg-image": (el, value) => {
    if (value) el.style.backgroundImage = `url('${value}')`;
  },
};

const DataUtils = {
  getNestedValue(obj, path) {
    if (!path || !obj) return undefined;
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  },
  formatValue(value, format) {
    if (!format || value === null || value === undefined || value === "")
      return value;
    return format.replace("{value}", value);
  },
};

class HydrationEngine {
  constructor(strategies) {
    this.strategies = strategies;
  }

  hydrate(rootElement, data) {
    rootElement.querySelectorAll("[data-bind]").forEach((el) => {
      const config = this._extractConfig(el);
      let rawValue = DataUtils.getNestedValue(data, config.path);
      if (rawValue === null || rawValue === undefined) rawValue = "";
      const finalValue = DataUtils.formatValue(rawValue, config.format);
      const strategy = this.strategies[config.bindType];
      if (strategy) strategy(el, finalValue, config);
      this._cleanupSkeleton(el);
    });
  }

  _extractConfig(el) {
    return {
      path: el.getAttribute("data-bind"),
      bindType: (
        el.getAttribute("data-bind-type") || "text"
      ).toLowerCase(),
      cssVar: el.getAttribute("data-bind-var"),
      format: el.getAttribute("data-bind-format"),
    };
  }

  _cleanupSkeleton(el) {
    el.classList.remove("skeleton-target");
    if (!el.dataset.bindType || el.dataset.bindType !== "src") {
      el.style.width = "";
    }
  }
}

// =============================================================================
//  USER SERVICE
// =============================================================================
class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getUserData() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      console.log("[get_user.php raw]", data);
      console.log("[get_user.php data map]", data?.data || {});
      return this._normalizeData(data?.data || {});
    } catch (e) {
      console.error("Failed to load user data from endpoint, using mock data", e);
      return this._getMockData();
    }
  }

  _normalizeData(data) {
    const corpus = this._parseCorpus(data?.user?.description);
    if (!data.user) data.user = {};
    const avatarValue =
      typeof data.user.avatar === "string"
        ? data.user.avatar
        : data.user.avatar?.url;

    // Save the original server avatar URL in a JS global and CSS variable on :root
    window.serverAvatarUrl = avatarValue;
    if (avatarValue) {
      document.documentElement.style.setProperty(
        "--server-avatar-url",
        `url('${avatarValue}')`,
      );
    }

    data.user.avatar = {};
    data.user.firstName =
      corpus?.name ||
      data.user.name ||
      data.user.firstName ||
      data.user.first_name ||
      data.user.displayName ||
      data.user.display_name ||
      "";
    data.user.role =
      corpus?.lastname ||
      data.user.lastname ||
      data.user.lastName ||
      data.user.last_name ||
      data.user.role ||
      "";
    data.user.avatar.url =
      corpus?.avatar ||
      avatarValue ||
      "https://app.newfacecards.com/nfc/profile-pic/recBOO8H0GO0RZlUU.jpg?timestamp=1723160426&size=1000x1000";
    data.user.umCoverUrl =
      corpus?.cover ||
      data.user.umCoverUrl ||
      data.user.cover ||
      "https://my.newfacecards.com/wp-content/uploads/ultimatemember/1/cover_photo.jpg";
    return data;
  }

  _parseCorpus(description) {
    if (!description) return null;
    try {
      return typeof description === "string"
        ? JSON.parse(description)
        : description;
    } catch {
      return null;
    }
  }

  async _getMockData() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      user: {
        firstName: "Ivan",
        role: "Gonzalez",
        description: "Especialista en interfaces declarativas.",
        avatar: {
          url: "https://app.newfacecards.com/nfc/profile-pic/recBOO8H0GO0RZlUU.jpg?timestamp=1723160426&size=1000x1000",
        },
        umCoverUrl:
          "https://my.newfacecards.com/wp-content/uploads/ultimatemember/1/cover_photo.jpg",
      },
    };
  }
}

// Expose classes/objects globally
window.BindingStrategies = BindingStrategies;
window.DataUtils = DataUtils;
window.HydrationEngine = HydrationEngine;
window.UserService = UserService;
