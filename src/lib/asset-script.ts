import { navigate } from "astro:transitions/client";
import type { Asset } from "@/lib/asset";
document.addEventListener("astro:page-load", () => {
  const buttons = document.querySelectorAll(
    "[data-asset]",
  ) as NodeListOf<HTMLButtonElement>;
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const asset: Asset = JSON.parse(button.dataset.asset as string);
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
  const assetAdd = document.getElementById("add-asset") as HTMLButtonElement | null;
  if (assetAdd) {
    assetAdd.addEventListener("click", async () => {
      const type = assetAdd.dataset.type;
      const name = prompt(`Enter the name of the ${type}`);
      if (!name) return alert("Invalid name");
      const link = prompt(`Enter the link of the ${type}`);
      if (!link) return alert("Invalid link");
      const response = await fetch("/api/add-asset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, link }),
      });
      const json = await response.json();
      if (json.error) return alert(json.error);
      if (json.success) return navigate(location.pathname);
    });
  }
});
