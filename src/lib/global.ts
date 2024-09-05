document.addEventListener("astro:page-load", () => {
  const title = document.getElementById("title");
  if (title) {
    title.textContent = localStorage.getItem("title") ?? "Home";
  }
  const icon = localStorage.getItem("icon") ?? "/assets/media/favicons/default.png";
  document.getElementById("icon")?.setAttribute("href", icon);
});
