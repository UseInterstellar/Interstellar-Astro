import { isValidHttpUrl } from "./url-utils";

export interface Tab {
  id: number;
  title: string;
  url: string;
  active: boolean;
  reloadKey: number;
}

export const getProxyEngine = (): "scramjet" => "scramjet";

export const baseTabs: Tab[] = [{ id: 1, title: "Tab 1", url: "about:blank", active: true, reloadKey: 0 }];

export const formatUrl = (value: string): string => {
  if (!value.trim()) return "about:blank";

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  if (!isValidHttpUrl(withProtocol)) {
    return "about:blank";
  }

  return withProtocol;
};

export const classNames = (...classes: Array<string | false | undefined>): string => classes.filter(Boolean).join(" ");

export const iconButtonClass = "inline-flex h-8 w-8 items-center justify-center rounded text-text-secondary transition-all hover:text-accent hover:bg-white/5";
export const tabButtonClass = "group relative flex h-8 max-w-[180px] cursor-pointer items-center gap-2 rounded px-3 transition-all";
export const closeButtonClass = "inline-flex h-4 w-4 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100 hover:text-accent";
export const addressInputClass = "h-auto flex-1 border-0 bg-transparent p-0 text-sm text-text placeholder:text-text-placeholder focus:outline-none";
export const actionBarClass = "flex items-center gap-2 rounded border border-border bg-background px-3 py-1.5 transition-all focus-within:border-accent/30";

export const getDefaultUrl = (): string => {
  if (typeof window === "undefined") {
    return "https://duckduckgo.com";
  }

  try {
    return localStorage.getItem("engine") || "https://duckduckgo.com";
  } catch (error) {
    console.warn("Storage access failed:", error);
    return "https://duckduckgo.com";
  }
};

export const encodeProxyUrl = (url: string): string => {
  if (!url || url === "about:blank") return "about:blank";
  if (typeof window === "undefined") return url;

  const config = window.__scramjet$config;
  if (config?.codec) {
    return config.prefix + config.codec.encode(url);
  }

  return "about:blank";
};

export const decodeProxyUrl = (proxyUrl: string): string => {
  if (!proxyUrl || proxyUrl === "about:blank") return proxyUrl;
  if (typeof window === "undefined") return proxyUrl;

  const sjConfig = window.__scramjet$config;
  if (sjConfig && proxyUrl.includes(sjConfig.prefix)) {
    try {
      const encoded = proxyUrl.substring(proxyUrl.indexOf(sjConfig.prefix) + sjConfig.prefix.length);
      return sjConfig.codec.decode(encoded);
    } catch {
      return proxyUrl;
    }
  }

  return proxyUrl;
};

export const getActualUrl = (iframe: HTMLIFrameElement | null): string => {
  if (!iframe?.contentWindow) return "";

  try {
    const proxyUrl = iframe.contentWindow.location.href;

    const sjConfig = window.__scramjet$config;
    if (sjConfig && proxyUrl.includes(sjConfig.prefix)) {
      const encoded = proxyUrl.substring(proxyUrl.indexOf(sjConfig.prefix) + sjConfig.prefix.length);
      return sjConfig.codec.decode(encoded);
    }

    return proxyUrl;
  } catch {
    return "";
  }
};

export const toggleFullscreen = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  iframeRefs[tabId]?.requestFullscreen().catch((err) => console.error("Fullscreen failed:", err));
};

export const addBookmark = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number, tabTitle: string, tabUrl: string) => {
  if (typeof window === "undefined") return;

  const actualUrl = getActualUrl(iframeRefs[tabId]) || tabUrl;
  const title = prompt("Enter a Title for this bookmark:", tabTitle || "New Bookmark");

  if (!title) return;

  try {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    bookmarks.push({ Title: title, url: actualUrl });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    alert("Bookmark added successfully!");
  } catch (err) {
    console.error("Failed to add bookmark:", err);
    alert("Failed to add bookmark. Storage may be blocked.");
  }
};
