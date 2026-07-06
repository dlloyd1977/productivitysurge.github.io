(function () {
  const grid = document.querySelector(".feature-grid--expandable");
  if (!grid) return;

  const cards = grid.querySelectorAll(".feature-card");
  const dialog = document.getElementById("feature-lightbox");
  const backdrop = dialog?.querySelector(".feature-lightbox-backdrop");
  const closeBtn = dialog?.querySelector(".feature-lightbox-close");
  const image = dialog?.querySelector(".feature-lightbox-image");
  const title = dialog?.querySelector(".feature-lightbox-title");
  const body = dialog?.querySelector(".feature-lightbox-body");
  let lastFocused = null;

  if (!dialog || !backdrop || !closeBtn || !image || !title || !body) return;

  function openFromCard(card) {
    const cardImage = card.querySelector("img");
    const cardTitle = card.querySelector("h3");
    const cardBody = card.querySelector("p");
    if (!cardImage || !cardTitle || !cardBody) return;

    lastFocused = document.activeElement;
    image.src = cardImage.currentSrc || cardImage.src;
    image.alt = cardImage.alt;
    title.textContent = cardTitle.textContent;
    body.textContent = cardBody.textContent;

    dialog.hidden = false;
    dialog.classList.add("is-open");
    document.body.classList.add("feature-lightbox-open");
    closeBtn.focus();
  }

  function close() {
    dialog.classList.remove("is-open");
    dialog.hidden = true;
    document.body.classList.remove("feature-lightbox-open");
    image.removeAttribute("src");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  cards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    const heading = card.querySelector("h3");
    if (heading) {
      card.setAttribute("aria-label", `Expand feature: ${heading.textContent}`);
    }

    card.addEventListener("click", () => openFromCard(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFromCard(card);
      }
    });
  });

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.classList.contains("is-open")) {
      close();
    }
  });
})();
