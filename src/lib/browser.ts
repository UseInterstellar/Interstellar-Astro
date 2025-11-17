export interface Tab {
  id: number;
  title: string;
  url: string;
  active: boolean;
  reloadKey: number;
}

export const baseTabs: Tab[] = [
  { id: 1, title: "New Tab", url: "about:blank", active: true, reloadKey: 0 },
];

export const formatUrl = (value: string) => {
  if (!value.trim()) return "about:blank";
  const hasProtocol = /^https?:\/\//i.test(value);
  return hasProtocol ? value : `https://${value}`;
};

export const classNames = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export const iconButtonClass = "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-text";
export const tabButtonClass = "group relative flex h-8 w-[180px] cursor-pointer items-center gap-2 rounded-t-lg px-3 transition-all";
export const closeButtonClass = "inline-flex h-5 w-5 items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent";
export const addressInputClass = "h-auto flex-1 border-0 bg-transparent p-0 text-sm text-text focus:outline-none";
export const actionBarClass = "flex items-center gap-2 rounded-lg border border-border bg-background-secondary/50 px-3 py-1.5 transition-all focus-within:bg-background focus-within:ring-2 focus-within:ring-accent/20";

export const goBack = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  const iframe = iframeRefs[tabId];
  if (iframe?.contentWindow) {
    iframe.contentWindow.history.back();
  }
};

export const goForward = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  const iframe = iframeRefs[tabId];
  if (iframe?.contentWindow) {
    iframe.contentWindow.history.forward();
  }
};

export const reloadTab = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  const iframe = iframeRefs[tabId];
  if (iframe?.contentWindow) {
    iframe.contentWindow.location.reload();
  }
};

export const toggleFullscreen = (iframeRefs: { [key: number]: HTMLIFrameElement | null }, tabId: number) => {
  const iframe = iframeRefs[tabId];
  if (iframe) {
    iframe.requestFullscreen().catch((err) => {
      console.error("Failed to enter fullscreen mode:", err);
    });
  }
};

export const addBookmark = (
  iframeRefs: { [key: number]: HTMLIFrameElement | null },
  tabId: number,
  tabTitle: string,
  tabUrl: string
) => {
  const iframe = iframeRefs[tabId];
  const currentUrl = iframe?.contentWindow?.location.href || tabUrl;
  
  const title = prompt("Enter a Title for this bookmark:", tabTitle || "New Bookmark");
  
  if (title) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    bookmarks.push({ Title: title, url: currentUrl });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    console.log("Bookmark added:", { Title: title, url: currentUrl });
  }
};