import Cookies from "js-cookie";
import type { Asset } from "./asset";

export default function addAsset(name: string, link: string, type: string) {
  const currentAssets: Asset[] = JSON.parse(Cookies.get(`asset.${type}`) || "[]");
  currentAssets.push({
    name: name,
    link: link,
    image: "/icons/custom.webp",
    custom: true,
  });
  Cookies.set(`asset.${type}`, JSON.stringify(currentAssets), {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
}
