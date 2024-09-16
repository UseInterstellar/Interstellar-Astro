document.addEventListener("astro:page-load", () => {
  // Cloak
  document.title = localStorage.getItem("title") ?? "Home";
  const icon = localStorage.getItem("icon") ?? "/assets/media/favicons/default.png";
  document.getElementById("icon")?.setAttribute("href", icon);

  // Nav
  const menu = localStorage.getItem("menu") || "Default";
  const defaultnav = document.getElementById("default-nav");
  const standard = document.getElementById("standard-nav");
  const button = document.getElementById("hamburger");
  const nav = document.getElementById("nav");

  if (menu === "Default") {
    if (defaultnav) defaultnav.classList.remove("hidden");
    if (standard) standard.classList.add("hidden");

    if (button) {
      button.addEventListener("click", () => {
        if (nav) {
          nav.classList.toggle("hidden");
        }
      });
    }
  } else if (menu === "Standard") {
    if (standard) standard.classList.remove("hidden");
    if (defaultnav) defaultnav.classList.add("hidden");
  }

  const isMenuOpen = localStorage.getItem("hamburger-open") === "true";
  nav?.classList.toggle("hidden", !isMenuOpen);

  defaultnav?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = nav?.classList.toggle("hidden");
    localStorage.setItem("hamburger-open", !isOpen ? "true" : "false");
  });

  for (const link of nav?.querySelectorAll("a") ?? []) {
    link.addEventListener("click", () => {
      localStorage.removeItem("hamburger-open");
      nav?.classList.add("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (
      nav !== null &&
      !nav.classList.contains("hidden") &&
      !nav.contains(target) &&
      !defaultnav?.contains(target)
    ) {
      nav?.classList.add("hidden");
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
