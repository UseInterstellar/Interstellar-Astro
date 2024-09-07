// Cloak
document.addEventListener("astro:page-load", () => {
  document.title = localStorage.getItem("title") ?? "Home";
  const icon = localStorage.getItem("icon") ?? "/assets/media/favicons/default.png";
  document.getElementById("icon")?.setAttribute("href", icon);
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
