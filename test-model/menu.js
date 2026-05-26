document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("publishBtn");
  const text = btn.querySelector(".btn-text");
  const icon = btn.querySelector("i");

  btn.addEventListener("click", () => {
    btn.className = "top-cta loading";
    icon.className = "bi bi-arrow-repeat";
    text.textContent = "Publishing...";

    setTimeout(() => {
      const success = Math.random() > 0.5;
      btn.classList.remove("loading");

      if (success) {
        btn.classList.add("success");
        icon.className = "bi bi-check-circle";
        text.textContent = "Published";
        const app = document.getElementById("app");
        app.classList.remove("publish");
      } else {
        btn.classList.add("error");
        icon.className = "bi bi-x-circle";
        text.textContent = "Try again";
      }

      setTimeout(() => {
        btn.className = "top-cta";
        icon.className = "bi bi-box-arrow-up";
        text.textContent = "Publish";
      }, 2000);
    }, 2000);
  });
});
