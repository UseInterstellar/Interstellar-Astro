document.addEventListener("astro:page-load", () => {
  // Cloak
  document.title = localStorage.getItem("title") ?? "Home";
  const icon = localStorage.getItem("icon") ?? "/assets/media/favicons/default.png";
  document.getElementById("icon")?.setAttribute("href", icon);

  // Nav
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("nav");

  const isMenuOpen = localStorage.getItem("hamburger-open") === "true";
  menu?.classList.toggle("hidden", !isMenuOpen);

  hamburger?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu?.classList.toggle("hidden");
    localStorage.setItem("hamburger-open", !isOpen ? "true" : "false");
  });

  for (const link of menu?.querySelectorAll("a") ?? []) {
    link.addEventListener("click", () => {
      localStorage.removeItem("hamburger-open");
      menu?.classList.add("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (
      menu !== null &&
      !menu.classList.contains("hidden") &&
      !menu.contains(target) &&
      !hamburger?.contains(target)
    ) {
      menu?.classList.add("hidden");
      localStorage.removeItem("hamburger-open");
    }
  });
});

// Panic
document.addEventListener("astro:page-load", () => {
  const Key = localStorage.getItem("key") || "";
  const PanicKeys = Key.split(",").map((key) => key.trim());
  const PanicLink = localStorage.getItem("link") || "";
  let Typed: string[] = [];
  let Shift = false;

  window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      Shift = true;
      return;
    }
    const keyToRecord = Shift ? event.key.toUpperCase() : event.key.toLowerCase();
    Typed.push(keyToRecord);
    if (Typed.length > PanicKeys.length) {
      Typed.shift();
    }
    if (
      Typed.length === PanicKeys.length &&
      PanicKeys.every((key, index) => key === Typed[index])
    ) {
      window.location.href = PanicLink;
      Typed = [];
    }
  });

  window.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      Shift = false;
    }
  });
});