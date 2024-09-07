document.addEventListener("astro:page-load", () => {
  document.title = localStorage.getItem("title") ?? "Home";
  const icon = localStorage.getItem("icon") ?? "/assets/media/favicons/default.png";
  document.getElementById("icon")?.setAttribute("href", icon);
});
