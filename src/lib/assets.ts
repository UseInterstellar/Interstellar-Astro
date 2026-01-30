import type { AstroCookies } from "astro";
import Cookies from "js-cookie";
import { getObfId, getRoute } from "./obf-helpers";

export type Asset = {
  id?: string;
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

export function parseAssetCookie(cookies: AstroCookies, type: "games" | "app"): Asset[] {
  try {
    const parsed = cookies.get(`asset.${type}`)?.json() as Asset[] | undefined;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.name === "string" && typeof item.image === "string");
  } catch {
    return [];
  }
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function addAsset(name: string, link: string, type: string, image?: string) {
  let currentAssets: Asset[] = [];
  try {
    currentAssets = JSON.parse(Cookies.get(`asset.${type}`) || "[]");
  } catch {
    currentAssets = [];
  }
  currentAssets.push({
    id: generateId(),
    name: name,
    link: link,
    image: image || "/icons/Custom.webp",
    custom: true,
  });
  Cookies.set(`asset.${type}`, JSON.stringify(currentAssets), {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
}

export function removeAsset(type: string, payload: Partial<Asset>) {
  let currentAssets: Asset[] = [];
  try {
    currentAssets = JSON.parse(Cookies.get(`asset.${type}`) || "[]");
  } catch {
    currentAssets = [];
  }
  const nextAssets = currentAssets.filter((asset) => {
    if (payload.id && asset.id) return asset.id !== payload.id;
    return !(asset.name === payload.name && asset.link === payload.link && asset.image === payload.image);
  });
  Cookies.set(`asset.${type}`, JSON.stringify(nextAssets), {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
}

if (typeof window !== "undefined") {
  document.addEventListener("astro:page-load", () => {
    const assetAttr = getObfId("data-asset");
    const assetRemoveAttr = getObfId("data-asset-remove");
    const buttons = document.querySelectorAll(`[${assetAttr}]`) as NodeListOf<HTMLElement>;

    for (const button of buttons) {
      const handleActivate = () => {
        const assetData = button.getAttribute(assetAttr);
        if (!assetData) return;

        let asset: Asset;
        try {
          asset = JSON.parse(assetData);
        } catch {
          return;
        }
        if (asset.say) alert(asset.say);
        if (asset.link) {
          sessionStorage.setItem("goUrl", asset.link);
          return location.replace(getRoute("tabs"));
        }
        if (asset.links) {
          const selection = prompt(`Select a link to go to: ${asset.links.map(({ name }, idx) => `\n${name}: ${idx + 1}`).join("")}`);
          if (!selection) return;
          const link = asset.links[Number.parseInt(selection, 10) - 1];
          if (!link) return alert("Invalid selection");
          sessionStorage.setItem("goUrl", link.url);
          return location.replace(getRoute("tabs"));
        }
      };
      button.addEventListener("click", (event) => {
        if (event.defaultPrevented) return;
        const target = event.target as HTMLElement | null;
        if (target?.closest(`[${assetRemoveAttr}]`)) return;
        handleActivate();
      });
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleActivate();
        }
      });
    }

    const handleRemove = (target: HTMLElement | null) => {
      if (!target) return;
      const raw = target.getAttribute(assetRemoveAttr);
      if (!raw) return;
      let parsed: { type?: string } & Partial<Asset>;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }
      if (!parsed.type || (parsed.type !== "games" && parsed.type !== "app")) return;
      removeAsset(parsed.type, parsed);
      const card = target.closest(`[${assetAttr}]`) || target.closest("[data-asset-card]");
      if (card instanceof HTMLElement) card.remove();
    };

    const removeButtons = document.querySelectorAll(`[${assetRemoveAttr}]`) as NodeListOf<HTMLElement>;
    for (const button of removeButtons) {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
          handleRemove(button);
        },
        { capture: true },
      );
    }

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        const button = target.closest(`[${assetRemoveAttr}]`) as HTMLElement | null;
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        handleRemove(button);
      },
      { capture: true },
    );

    const assetAdd = document.getElementById(getObfId("add-asset")) as HTMLButtonElement | null;
    if (assetAdd) {
      assetAdd.addEventListener("click", async () => {
        const type = assetAdd.dataset.type;
        const name = prompt(`Enter the name of the ${type}`)?.trim() || "";
        if (!name) return alert("Invalid name");
        const link = prompt(`Enter the link of the ${type}`)?.trim() || "";
        if (!link) return alert("Invalid link");
        if (!type || (type !== "games" && type !== "app")) return alert("Invalid type");
        let image = prompt("Enter an image URL (optional)")?.trim() || "";
        if (image && !/^https?:\/\//i.test(image) && !image.startsWith("/")) {
          image = "";
        }
        try {
          const url = new URL(link);
          if (url.protocol !== "http:" && url.protocol !== "https:") return alert("Invalid link");
        } catch {
          return alert("Invalid link");
        }
        addAsset(name, link, type, image || undefined);
        location.reload();
      });
    }

    const search = document.getElementById(getObfId("search")) as HTMLInputElement | null;
    const container = document.getElementById(getObfId("container"));

    const all = container ? Array.from(container.children) : [];

    if (search) {
      let searchTimeout: ReturnType<typeof setTimeout>;

      const filterCards = (query: string) => {
        const lowerQuery = query.toLowerCase();
        for (const card of all) {
          const span = card.querySelector("span");
          const name = span?.textContent ? span.textContent.toLowerCase() : "";
          (card as HTMLElement).style.display = name.includes(lowerQuery) ? "" : "none";
        }
      };

      search.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const target = e.target as HTMLInputElement;
        searchTimeout = setTimeout(() => filterCards(target.value), 150);
      });
      search.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });
    }
  });
}
