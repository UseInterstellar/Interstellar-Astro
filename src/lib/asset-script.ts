import type { Asset } from "@/lib/asset";
document.addEventListener("astro:page-load", () => {
  const buttons = document.querySelectorAll(
    "[data-asset]",
  ) as NodeListOf<HTMLButtonElement>;
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const asset: Asset = JSON.parse(button.dataset.asset!);
      if (asset.say) alert(asset.say);
      if (asset.link) {
        sessionStorage.setItem("goUrl", asset.link);
        return location.replace("/tb");
      }
      if (asset.links) {
        const selection = prompt(
          `Select a link to go to: ${asset.links.map(({ name }, idx) => `\n${name}: ${idx + 1}`).join("")}`,
        );
        if (!selection) return;
        const link = asset.links[Number.parseInt(selection) - 1];
        if (!link) return alert("Invalid selection");
        sessionStorage.setItem("goUrl", link.url);
        return location.replace("/tb");
      }
    });
  }
});
