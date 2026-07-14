(() => {
  const dropdowns = Array.from(document.querySelectorAll("details.nav-dropdown"));
  if (!dropdowns.length) return;

  const closeAll = (except) => {
    dropdowns.forEach((el) => {
      if (el !== except) el.open = false;
    });
  };

  dropdowns.forEach((el) => {
    el.addEventListener("toggle", () => {
      if (el.open) closeAll(el);
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("details.nav-dropdown")) return;
    closeAll();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
  });
})();
