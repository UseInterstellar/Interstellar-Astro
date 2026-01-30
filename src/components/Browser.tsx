import { ChevronLeft, ChevronRight, Home, Lock, Maximize2, Plus, RotateCw, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { actionBarClass, addressInputClass, classNames, closeButtonClass, encodeProxyUrl, formatUrl, getActualUrl, getDefaultUrl, iconButtonClass, type Tab, tabButtonClass } from "@/lib/tabs";

type ScramjetWindow = Window & { __scramjet$config?: unknown };

const IconButton = ({ onClick, icon: Icon, className = "", disabled = false, title = "" }: { onClick?: () => void; icon: React.ComponentType<{ className?: string }>; className?: string; disabled?: boolean; title?: string }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={title} className={classNames(iconButtonClass, "disabled:opacity-30 disabled:cursor-not-allowed", className)}>
    <Icon className="h-4 w-4" />
  </button>
);

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, title: "Tab 1", url: "about:blank", active: true, reloadKey: 0 }]);
  const [url, setUrl] = useState("about:blank");
  const [favicons, setFavicons] = useState<Record<number, string>>({});
  const [bookmarks, setBookmarks] = useState<Array<{ Title: string; url: string; favicon?: string }>>([]);
  const [proxyReadyTick, setProxyReadyTick] = useState(0);
  const [proxyReady, setProxyReady] = useState(false);
  const activeTab = useMemo(() => tabs.find((tab) => tab.active), [tabs]);
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  const openInNewTab = (url: string) => {
    const newId = Date.now();
    setTabs((prev) => [...prev.map((t) => ({ ...t, active: false })), { id: newId, title: "New Tab", url, active: true, reloadKey: 0 }]);
  };

  useEffect(() => {
    let firstTabUrl = getDefaultUrl();
    try {
      const goUrl = sessionStorage.getItem("goUrl");
      if (goUrl?.trim()) firstTabUrl = goUrl;
    } catch (error) {
      console.warn("Session storage access failed:", error);
    }

    setTabs((prev) => prev.map((tab) => ({ ...tab, url: firstTabUrl })));
    setUrl(firstTabUrl);

    try {
      const savedBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      setBookmarks(savedBookmarks);
    } catch (error) {
      console.warn("Failed to load bookmarks:", error);
    }
  }, []);

  useEffect(() => {
    const onReady = () => setProxyReadyTick((prev) => prev + 1);
    window.addEventListener("scramjet-ready", onReady);
    if ((window as ScramjetWindow).__scramjet$config) {
      onReady();
    }
    return () => window.removeEventListener("scramjet-ready", onReady);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const checkReady = () => {
      const sjReady = Boolean((window as ScramjetWindow).__scramjet$config);
      const swReady = Boolean(navigator.serviceWorker?.controller);
      if (sjReady && swReady) setProxyReady(true);
      return sjReady && swReady;
    };

    if (checkReady()) return;

    const timer = window.setInterval(() => {
      if (cancelled) return;
      if (checkReady()) {
        window.clearInterval(timer);
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [proxyReadyTick]);

  useEffect(() => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    const actualUrl = getActualUrl(iframe);
    const nextUrl = actualUrl && actualUrl !== "about:blank" ? actualUrl : activeTab.url;
    setUrl(nextUrl);
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab) return;
    if (url === "about:blank" && activeTab.url !== "about:blank") {
      setUrl(activeTab.url);
    }
  }, [activeTab, url, proxyReadyTick]);

  useEffect(() => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    if (!iframe) return;

    let observer: MutationObserver | null = null;

    const updateState = () => {
      const actualUrl = getActualUrl(iframe);
      if (actualUrl && actualUrl !== "about:blank" && actualUrl !== url) setUrl(actualUrl);

      try {
        const iframeTitle = iframe.contentWindow?.document?.title;
        if (iframeTitle && iframeTitle !== activeTab.title) {
          setTabs((prev) => prev.map((tab) => (tab.id === activeTab.id ? { ...tab, title: iframeTitle } : tab)));
        }

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
          const faviconLink = iframeDoc.querySelector<HTMLLinkElement>('link[rel="icon"]') || iframeDoc.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]') || iframeDoc.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');

          if (faviconLink?.href) {
            setFavicons((prev) => ({ ...prev, [activeTab.id]: faviconLink.href }));
          } else if (actualUrl) {
            try {
              const urlObj = new URL(actualUrl);
              setFavicons((prev) => ({ ...prev, [activeTab.id]: `${urlObj.origin}/favicon.ico` }));
            } catch (_e) {}
          }
        }
      } catch (_e) {}
    };

    const setupObserver = () => {
      try {
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) return;

        observer?.disconnect();

        observer = new MutationObserver(() => {
          updateState();
        });

        if (iframeDoc.head) {
          observer.observe(iframeDoc.head, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["href"],
          });
        }

        const titleEl = iframeDoc.querySelector("title");
        if (titleEl) {
          observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
        }
      } catch (_e) {}
    };

    const handleLoad = () => {
      updateState();
      setupObserver();
    };

    iframe.addEventListener("load", handleLoad);
    updateState();
    setupObserver();

    return () => {
      iframe.removeEventListener("load", handleLoad);
      observer?.disconnect();
    };
  }, [activeTab, url]);

  useEffect(() => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    if (!iframe) return;

    const abortController = new AbortController();
    const { signal } = abortController;

    const setupIntercept = () => {
      try {
        const iframeWindow = iframe.contentWindow as Window & {
          __tabInterceptSetup?: boolean;
          __originalOpen?: typeof window.open;
        };
        if (!iframeWindow || iframeWindow.__tabInterceptSetup) return;

        iframeWindow.__tabInterceptSetup = true;

        const originalOpen = iframeWindow.open;
        iframeWindow.__originalOpen = originalOpen;

        iframeWindow.open = (url?: string | URL, target?: string, features?: string) => {
          if (!target || target === "_blank" || target === "_new") {
            try {
              const urlStr = url?.toString() || "";
              const fullUrl = urlStr ? new URL(urlStr, iframeWindow.location.href).href : "about:blank";
              openInNewTab(fullUrl);
              return null;
            } catch (err) {
              console.warn("Failed to intercept window.open:", err);
            }
          }
          return originalOpen.call(iframeWindow, url, target, features);
        };

        const handleClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest("a");

          if (anchor) {
            const linkTarget = anchor.getAttribute("target");
            const hasModifier = e.ctrlKey || e.metaKey;

            if (linkTarget === "_blank" || linkTarget === "_new" || hasModifier) {
              e.preventDefault();
              e.stopPropagation();

              const href = anchor.getAttribute("href");
              if (href) {
                try {
                  const fullUrl = new URL(href, iframeWindow.location.href).href;
                  openInNewTab(fullUrl);
                } catch (err) {
                  console.warn("Failed to intercept link click:", err);
                }
              }
            }
          }
        };

        const handleAuxClick = (e: MouseEvent) => {
          if (e.button !== 1) return;

          const target = e.target as HTMLElement;
          const anchor = target.closest("a");

          if (anchor) {
            e.preventDefault();
            e.stopPropagation();

            const href = anchor.getAttribute("href");
            if (href) {
              try {
                const fullUrl = new URL(href, iframeWindow.location.href).href;
                openInNewTab(fullUrl);
              } catch (err) {
                console.warn("Failed to intercept middle-click:", err);
              }
            }
          }
        };

        iframeWindow.addEventListener("click", handleClick, { capture: true, signal });
        iframeWindow.addEventListener("auxclick", handleAuxClick, { capture: true, signal });
      } catch (_err) {}
    };

    const handleLoad = () => {
      setupIntercept();
    };

    iframe.addEventListener("load", handleLoad, { signal });
    setupIntercept();

    return () => {
      abortController.abort();
      try {
        const iframeWindow = iframe.contentWindow as Window & {
          __tabInterceptSetup?: boolean;
          __originalOpen?: typeof window.open;
        };
        if (iframeWindow?.__originalOpen) {
          iframeWindow.open = iframeWindow.__originalOpen;
          iframeWindow.__tabInterceptSetup = false;
        }
      } catch (_e) {}
    };
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "t" || e.key === "n")) {
        e.preventDefault();
      }
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("auxclick", handleAuxClick);

    const originalWindowOpen = window.open;
    window.open = () => {
      return null;
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("auxclick", handleAuxClick);
      window.open = originalWindowOpen;
    };
  }, []);

  const setActiveTab = (id: number) => {
    setTabs((prev) => prev.map((tab) => ({ ...tab, active: tab.id === id })));
  };

  const addNewTab = () => {
    const newId = tabs.length ? Math.max(...tabs.map((tab) => tab.id)) + 1 : 1;
    const defaultUrl = getDefaultUrl();
    setTabs((prev) => [...prev.map((tab) => ({ ...tab, active: false })), { id: newId, title: `Tab ${newId}`, url: defaultUrl, active: true, reloadKey: 0 }]);
    setUrl(defaultUrl);
  };

  const closeTab = (id: number) => {
    setTabs((prev) => {
      const remaining = prev.filter((tab) => tab.id !== id);
      if (remaining.length === 0) {
        let firstTabUrl = getDefaultUrl();
        try {
          const goUrl = sessionStorage.getItem("goUrl");
          if (goUrl?.trim()) firstTabUrl = goUrl;
        } catch (error) {
          console.warn("Session storage access failed:", error);
        }
        return [{ id: Date.now(), title: "Tab 1", url: firstTabUrl, active: true, reloadKey: 0 }];
      }

      if (prev.find((tab) => tab.id === id)?.active) {
        remaining[remaining.length - 1].active = true;
        setUrl(remaining[remaining.length - 1].url);
      }

      return remaining;
    });
  };

  const handleNavigate = (value: string) => {
    if (!activeTab) return;
    const formattedUrl = formatUrl(value);
    setTabs((prev) => prev.map((tab) => (tab.id === activeTab.id ? { ...tab, url: formattedUrl, reloadKey: tab.reloadKey + 1 } : tab)));
    setUrl(formattedUrl);
  };

  const removeBookmark = (bookmarkUrl: string, bookmarkTitle: string) => {
    try {
      const updatedBookmarks = bookmarks.filter((b) => !(b.url === bookmarkUrl && b.Title === bookmarkTitle));
      setBookmarks(updatedBookmarks);
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    } catch (e) {
      console.error("Failed to remove bookmark:", e);
    }
  };

  const handleAction = (action: "back" | "forward" | "reload" | "home") => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];

    if (action === "home") {
      window.location.href = "/";
      return;
    }

    if (!iframe?.contentWindow) return;

    if (action === "back") iframe.contentWindow.history.back();
    else if (action === "forward") iframe.contentWindow.history.forward();
    else if (action === "reload") iframe.contentWindow.location.reload();
  };

  const toggleFullscreen = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    iframe?.requestFullscreen().catch((err) => console.error("Failed to enter fullscreen mode:", err));
  };

  const addBookmark = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    const actualUrl = getActualUrl(iframe) || activeTab.url;
    const title = prompt("Enter a Title for this bookmark:", activeTab.title || "New Bookmark");

    if (title && typeof localStorage !== "undefined") {
      try {
        let faviconUrl = favicons[activeTab.id] || "";
        if (!faviconUrl) {
          try {
            const urlObj = new URL(actualUrl);
            faviconUrl = `${urlObj.origin}/favicon.ico`;
          } catch (_e) {
            faviconUrl = "";
          }
        }

        const newBookmark = { Title: title, url: actualUrl, favicon: faviconUrl };
        const updatedBookmarks = [...bookmarks, newBookmark];
        setBookmarks(updatedBookmarks);
        localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
      } catch (e) {
        console.error("Failed to add bookmark:", e);
      }
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center gap-1 bg-background-secondary/50 px-2 py-1.5 border-b border-border/50">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={classNames(tabButtonClass, tab.active ? "bg-background text-text border border-border/50" : "text-text-secondary hover:text-text hover:bg-white/5")}>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {favicons[tab.id] ? (
                <img
                  src={favicons[tab.id]}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0 rounded-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={classNames("h-3.5 w-3.5 shrink-0 rounded-sm bg-accent/20", favicons[tab.id] ? "hidden" : "")} />
              <span className="truncate text-xs">{tab.title}</span>
            </div>
            <button
              type="button"
              className={closeButtonClass}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              aria-label={`Close ${tab.title}`}
            >
              <X className="h-3 w-3" />
            </button>
          </button>
        ))}
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:text-accent hover:bg-white/5 transition-all" onClick={addNewTab} aria-label="Add tab">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-background px-2 py-1.5 border-b border-border/30">
        <div className="flex items-center gap-0.5">
          <IconButton icon={Home} onClick={() => handleAction("home")} title="Home" />
          <IconButton icon={ChevronLeft} onClick={() => handleAction("back")} title="Back" />
          <IconButton icon={ChevronRight} onClick={() => handleAction("forward")} title="Forward" />
          <IconButton icon={RotateCw} onClick={() => handleAction("reload")} title="Reload" />
        </div>

        <div className="flex-1">
          <div className={actionBarClass}>
            <Lock className="h-3.5 w-3.5 text-text-placeholder" />
            <input className={addressInputClass} value={url} placeholder="Search or enter address" onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNavigate(e.currentTarget.value)} />
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <IconButton icon={Star} onClick={addBookmark} title="Bookmark" />
          <IconButton icon={Maximize2} onClick={toggleFullscreen} title="Fullscreen" />
        </div>
      </div>

      {bookmarks.length > 0 && (
        <div className="flex items-center gap-1 bg-background px-2 py-1 overflow-x-auto border-b border-border/30">
          {bookmarks.map((bookmark) => (
            <button
              key={`${bookmark.url}-${bookmark.Title}`}
              type="button"
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-secondary hover:text-text hover:bg-white/5 transition-all shrink-0"
              style={{ maxWidth: "160px" }}
              onClick={() => handleNavigate(bookmark.url)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (confirm(`Remove bookmark "${bookmark.Title}"?`)) removeBookmark(bookmark.url, bookmark.Title);
              }}
            >
              {bookmark.favicon ? (
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <Star className={classNames("h-3.5 w-3.5 shrink-0", bookmark.favicon ? "hidden" : "")} />
              <span className="truncate">{bookmark.Title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 bg-background">
        {!proxyReady && activeTab?.url !== "about:blank" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <div className="flex items-center gap-3 text-text-secondary">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-accent" style={{ animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }} />
              <span className="text-sm">Loading proxy…</span>
            </div>
          </div>
        )}
        {tabs.map((tab) => (
          <iframe
            key={`${tab.id}-${tab.reloadKey}`}
            ref={(el) => {
              iframeRefs.current[tab.id] = el;
            }}
            title={tab.title}
            src={proxyReady ? encodeProxyUrl(tab.url) : "about:blank"}
            className={classNames("absolute inset-0 h-full w-full border-0", tab.active ? "block" : "hidden")}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
          />
        ))}
      </div>
    </div>
  );
}
