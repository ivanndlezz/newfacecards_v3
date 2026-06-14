class ButtonsList {
  constructor(jsonUrl = "./buttons.json") {
    this.jsonUrl = jsonUrl;
    this.buttons = {};
    this.init();
  }

  init() {
    Promise.all([this.waitForElement("#buttons", 3000)])
      .then(() => this.loadButtons())
      .catch(() => console.warn("Timeout esperando contenedores"));
  }

  async loadButtons() {
    try {
      this.buttons = window.inlineButtons || {};

      if (!Object.keys(this.buttons).length) {
        const res = await fetch(this.jsonUrl);
        const data = await res.json();
        this.buttons = data.buttons || data;
      }

      console.log("Botones cargados:", this.buttons);

      await this.waitForElement("#buttons", 3000);

      this.renderButtons();
      this.updateMoveButtons();
    } catch (e) {
      console.error("No se pudieron cargar los botones JSON:", e);
    }
  }

  waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error("timeout"));
      }, timeout);
    });
  }

  renderButtons() {
    const buttonsContainer = document.getElementById("buttons");

    if (!buttonsContainer) return;

    buttonsContainer.innerHTML = "";

    let buttonsList = Array.isArray(this.buttons)
      ? this.buttons
      : Object.values(this.buttons);

    // Ordenar por index si existe
    buttonsList = buttonsList.sort((a, b) => {
      const indexA = a.index !== undefined ? Number(a.index) : Infinity;
      const indexB = b.index !== undefined ? Number(b.index) : Infinity;
      return indexA - indexB;
    });

    buttonsList.forEach((btnData, arrayIndex) => {
      // Usar el index del JSON si existe, sino usar el índice del array
      const displayIndex =
        btnData.index !== undefined ? btnData.index : arrayIndex;

      const element =
        btnData.type === "chips"
          ? this.buildChipsAreaComponent(btnData, displayIndex)
          : this.buildAreaComponent(btnData, displayIndex);

      buttonsContainer.appendChild(element);
    });
  }

  buildChipsAreaComponent(data, index) {
    const { sectionTitle = "Chips", items = [] } = data;

    const areaDiv = document.createElement("div");
    areaDiv.className = `area chips-area btn-${index}`;
    areaDiv.dataset.index = index;

    areaDiv.innerHTML = `
      <div class="area-controls">
        <span class="section-title">${sectionTitle}</span>
        <div class="section-controls">
          <button class="control-btn edit-btn"><svg viewBox="0 0 24 24"><use href="#pen"></use></svg></button>
          <button class="control-btn move-up-btn"><svg viewBox="0 0 24 24"><use href="#arrow-up"></use></svg></button>
          <button class="control-btn move-down-btn"><svg viewBox="0 0 24 24"><use href="#arrow-up"></use></svg></button>
        </div>
      </div>
      <div class="section-content chips-container"></div>
    `;

    const chipsContainer = areaDiv.querySelector(".chips-container");

    items.forEach((item) => {
      const chip = this.buildChipComponent(item);
      chipsContainer.appendChild(chip);
    });

    const moveUpBtn = areaDiv.querySelector(".move-up-btn");
    const moveDownBtn = areaDiv.querySelector(".move-down-btn");

    moveUpBtn.addEventListener("click", () =>
      this.moveAreaWithAnimation(areaDiv, "up"),
    );
    moveDownBtn.addEventListener("click", () =>
      this.moveAreaWithAnimation(areaDiv, "down"),
    );

    return areaDiv;
  }

  buildChipComponent(data) {
    const { sectionTitle, sectionContent, sectionUrl } = data;
    const chip = document.createElement("div");
    chip.className = "chip-item";

    chip.innerHTML = `
      <a href="${
        sectionUrl.startsWith("http") ? sectionUrl : `https://${sectionUrl}`
      }" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="chip-link">
        <span class="chip-title">${sectionTitle}</span>
        <span class="chip-content">${sectionContent}</span>
      </a>
    `;

    return chip;
  }

  buildAreaComponent(data, index) {
    const { sectionTitle, sectionContent, sectionUrl } = data;

    const areaDiv = document.createElement("div");
    areaDiv.className = `area btn-${index}`;
    areaDiv.dataset.index = index;

    areaDiv.innerHTML = `
      <div class="area-controls">
        <span class="section-title">${sectionTitle}</span>
        <div class="section-controls">
          <button class="control-btn edit-btn"><svg viewBox="0 0 24 24"><use href="#pen"></use></svg></button>
          <button class="control-btn move-up-btn"><svg viewBox="0 0 24 24"><use href="#arrow-up"></use></svg></button>
          <button class="control-btn move-down-btn"><svg viewBox="0 0 24 24"><use href="#arrow-up"></use></svg></button>
        </div>
      </div>
      <div class="section-content">${sectionContent}</div>
    `;

    if (sectionUrl) {
      areaDiv.dataset.url = sectionUrl;
    }

    const moveUpBtn = areaDiv.querySelector(".move-up-btn");
    const moveDownBtn = areaDiv.querySelector(".move-down-btn");

    moveUpBtn.addEventListener("click", () =>
      this.moveAreaWithAnimation(areaDiv, "up"),
    );
    moveDownBtn.addEventListener("click", () =>
      this.moveAreaWithAnimation(areaDiv, "down"),
    );

    return areaDiv;
  }

  moveAreaWithAnimation(areaDiv, direction) {
    const container = document.getElementById("buttons");

    const areas = [...container.children];
    const positions = areas.map((a) => a.getBoundingClientRect().top);

    if (direction === "up") {
      const prev = areaDiv.previousElementSibling;
      if (prev) container.insertBefore(areaDiv, prev);
    } else if (direction === "down") {
      const next = areaDiv.nextElementSibling;
      if (next) container.insertBefore(next, areaDiv);
    }

    areas.forEach((a, i) => {
      const delta = positions[i] - a.getBoundingClientRect().top;
      if (delta) {
        a.style.transition = "none";
        a.style.transform = `translateY(${delta}px)`;

        requestAnimationFrame(() => {
          a.style.transition = "transform 0.3s ease";
          a.style.transform = "translateY(0)";
        });

        a.addEventListener(
          "transitionend",
          () => {
            a.style.transform = "";
            a.style.transition = "";
          },
          { once: true },
        );
      }
    });

    areaDiv.classList.add("area-move");
    setTimeout(() => areaDiv.classList.remove("area-move"), 300);

    this.updateMoveButtons();
  }

  updateMoveButtons() {
    const areas = [...document.querySelectorAll("#buttons .area")];
    areas.forEach((area, i) => {
      const upBtn = area.querySelector(".move-up-btn");
      const downBtn = area.querySelector(".move-down-btn");
      upBtn.disabled = i === 0;
      downBtn.disabled = i === areas.length - 1;
    });
  }
}

// Inicializar lista de botones
window.buttonsList = new ButtonsList("./buttons.json");
