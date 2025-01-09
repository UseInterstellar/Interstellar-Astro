import Cookies from "js-cookie";

export type Asset = {
  name: string;
  image: string;
  link?: string;
  links?: { name: string; url: string }[];
  say?: string;
  custom?: boolean;
  partial?: boolean | string;
  error?: boolean | string;
  blank?: boolean | string;
};

export function addAsset(name: string, link: string, type: string) {
  const currentAssets: Asset[] = JSON.parse(Cookies.get(`asset.${type}`) || "[]");
  currentAssets.push({
    name: name,
    link: link,
    image: "/icons/Custom.webp",
    custom: true,
  });
  Cookies.set(`asset.${type}`, JSON.stringify(currentAssets), {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
}

if (typeof window !== "undefined") {
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
          return location.replace("/tabs");
        }
        if (asset.links) {
          const selection = prompt(
            `Select a link to go to: ${asset.links.map(({ name }, idx) => `\n${name}: ${idx + 1}`).join("")}`,
          );
          if (!selection) return;
          const link = asset.links[Number.parseInt(selection) - 1];
          if (!link) return alert("Invalid selection");
          sessionStorage.setItem("goUrl", link.url);
          return location.replace("/tabs");
        }
      });
    }

    const assetAdd = document.getElementById(
      "add-asset",
    ) as HTMLButtonElement | null;
    if (assetAdd) {
      assetAdd.addEventListener("click", async () => {
        const type = assetAdd.dataset.type;
        const name = prompt(`Enter the name of the ${type}`);
        if (!name) return alert("Invalid name");
        const link = prompt(`Enter the link of the ${type}`);
        if (!link) return alert("Invalid link");
        if (!type) return alert("Invalid type");
        addAsset(name, link, type);
        location.reload();
      });
    }

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
}
