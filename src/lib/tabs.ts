export interface Tab {
  id: number;
  title: string;
  url: string;
  active: boolean;
  reloadKey: number;
}

export interface UVConfig {
  prefix: string;
  encodeUrl: (url: string) => string;
  decodeUrl: (url: string) => string;
}

declare global {
  interface Window {
    __uv$config: UVConfig;
  }
}

export const baseTabs: Tab[] = [{ id: 1, title: "Tab 1", url: "about:blank", active: true, reloadKey: 0 }];

export const formatUrl = (value: string) => {
  if (!value.trim()) return "about:blank";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

export const classNames = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

export const iconButtonClass = "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-text";
export const tabButtonClass = "group relative flex h-8 w-[180px] cursor-pointer items-center gap-2 rounded-t-lg px-3 transition-all";
export const closeButtonClass = "inline-flex h-5 w-5 items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent";
export const addressInputClass = "h-auto flex-1 border-0 bg-transparent p-0 text-sm text-text focus:outline-none";
export const actionBarClass = "flex items-center gap-2 rounded-lg border border-border bg-background-secondary/50 px-3 py-1.5 transition-all focus-within:bg-background focus-within:ring-2 focus-within:ring-accent/20";

export const getDefaultUrl = () => {
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

  const config = window.__uv$config;
  return config ? config.prefix + config.encodeUrl(url) : url;
};

export const decodeProxyUrl = (proxyUrl: string): string => {
  if (!proxyUrl || proxyUrl === "about:blank") return proxyUrl;
  if (typeof window === "undefined") return proxyUrl;

  const config = window.__uv$config;

  if (config) {
    try {
      const path = proxyUrl.split("/").pop() || "";
      return config.decodeUrl(path);
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
    const config = window.__uv$config;
    if (config && proxyUrl.includes(config.prefix)) {
      const encoded = proxyUrl.substring(proxyUrl.indexOf(config.prefix) + config.prefix.length);
      return config.decodeUrl(encoded);
    }
    return proxyUrl;
  } catch {
    return "";
  }
};

export const goBack = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  iframeRefs[tabId]?.contentWindow?.history.back();
};

export const goForward = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  iframeRefs[tabId]?.contentWindow?.history.forward();
};

export const reloadTab = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  iframeRefs[tabId]?.contentWindow?.location.reload();
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
