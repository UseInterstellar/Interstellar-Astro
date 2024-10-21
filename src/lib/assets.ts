// Asset Searching
document.addEventListener("astro:page-load", () => {
  const search = document.getElementById("search");
  const container = document.getElementById("container");

  const all = container ? Array.from(container.children) : [];

  if (search) {
    search.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const query = target.value.toLowerCase();
      for (const card of all) {
        const span = card.querySelector("span");
        const name = span?.textContent ? span.textContent.toLowerCase() : "";
        (card as HTMLElement).style.display = name.includes(query) ? "" : "none";
      }
    });
  }
});
