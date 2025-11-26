import { ChevronLeft, ChevronRight, Home, Lock, Maximize2, Menu, MoreVertical, Plus, RotateCw, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { actionBarClass, addressInputClass, classNames, closeButtonClass, encodeProxyUrl, formatUrl, getActualUrl, getDefaultUrl, type Tab, tabButtonClass } from "@/lib/tabs";

const IconButton = ({ onClick, icon: Icon, className = "", disabled = false, title = "" }: { onClick?: () => void; icon: React.ComponentType<{ className?: string }>; className?: string; disabled?: boolean; title?: string }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`group p-2 rounded-full text-text-secondary transition-all duration-200 
      hover:bg-interactive hover:text-text disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${className}`}
  >
    <Icon className="h-4 w-4 stroke-[2.5px] group-hover:stroke-text" />
  </button>
);

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, title: "Tab 1", url: "about:blank", active: true, reloadKey: 0 }]);
  const [url, setUrl] = useState("about:blank");
  const [favicons, setFavicons] = useState<{ [key: number]: string }>({});
  const [bookmarks, setBookmarks] = useState<Array<{ Title: string; url: string; favicon?: string }>>([]);
  const activeTab = useMemo(() => tabs.find((tab) => tab.active), [tabs]);
  const iframeRefs = useRef<{ [key: number]: HTMLIFrameElement | null }>({});

  useEffect(() => {
    let firstTabUrl = getDefaultUrl();
    try {
      const goUrl = sessionStorage.getItem("goUrl");
      if (goUrl?.trim()) {
        firstTabUrl = goUrl;
      }
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
    if (activeTab) {
      const iframe = iframeRefs.current[activeTab.id];
      const actualUrl = getActualUrl(iframe);
      setUrl(actualUrl || activeTab.url);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab) return;

    const iframe = iframeRefs.current[activeTab.id];
    if (!iframe) return;

    const updateState = () => {
      const actualUrl = getActualUrl(iframe);
      if (actualUrl && actualUrl !== url) {
        setUrl(actualUrl);
      }

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
              const defaultFavicon = `${urlObj.origin}/favicon.ico`;
              setFavicons((prev) => ({ ...prev, [activeTab.id]: defaultFavicon }));
            } catch (_e) {}
          }
        }
      } catch (_e) {}
    };

    iframe.addEventListener("load", updateState);
    const interval = setInterval(updateState, 1000);

    return () => {
      iframe.removeEventListener("load", updateState);
      clearInterval(interval);
    };
  }, [activeTab, url]);

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
          if (goUrl?.trim()) {
            firstTabUrl = goUrl;
          }
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

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              url: formattedUrl,
              reloadKey: tab.reloadKey + 1,
            }
          : tab,
      ),
    );
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

  const Action = (action: "back" | "forward" | "reload" | "home") => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];

    if (action === "home") {
      window.location.href = "/";
      return;
    }

    if (!iframe?.contentWindow) return;

    switch (action) {
      case "back":
        iframe.contentWindow.history.back();
        break;
      case "forward":
        iframe.contentWindow.history.forward();
        break;
      case "reload":
        iframe.contentWindow.location.reload();
        break;
    }
  };

  const toggleFullscreen = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    if (iframe) {
      iframe.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen mode:", err);
      });
    }
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
        console.log("Bookmark added:", newBookmark);
        alert("Bookmark added successfully!");
      } catch (e) {
        console.error("Failed to add bookmark:", e);
        alert("Failed to add bookmark. Storage may be blocked.");
      }
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center gap-1 bg-background px-3 pt-1.5 pb-0">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={classNames(tabButtonClass, tab.active ? "bg-background-secondary text-text shadow-sm" : "bg-background text-text-secondary hover:bg-interactive")}>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {favicons[tab.id] ? (
                <img
                  src={favicons[tab.id]}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={classNames("h-4 w-4 shrink-0 rounded bg-accent/30", favicons[tab.id] ? "hidden" : "")} />
              <span className="truncate text-sm">{tab.title}</span>
            </div>
            <button
              type="button"
              className={closeButtonClass}
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
              aria-label={`Close ${tab.title}`}
            >
              <X className="h-3 w-3" />
            </button>
          </button>
        ))}
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-text-secondary transition-colors hover:bg-background-secondary/50 hover:text-text" onClick={addNewTab} aria-label="Add tab">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 bg-background-secondary px-3 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <IconButton icon={Home} onClick={() => Action("home")} title="Home" />
          <IconButton icon={ChevronLeft} onClick={() => Action("back")} title="Back" />
          <IconButton icon={ChevronRight} onClick={() => Action("forward")} title="Forward" />
          <IconButton icon={RotateCw} onClick={() => Action("reload")} title="Reload" />
        </div>

        <div className="flex-1">
          <div className={actionBarClass}>
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              className={addressInputClass}
              value={url}
              placeholder="Search or enter address"
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleNavigate(event.currentTarget.value);
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton icon={Maximize2} onClick={toggleFullscreen} title="Fullscreen" />
          <IconButton icon={Star} onClick={addBookmark} title="Bookmark" />
          <IconButton icon={Menu} title="Menu" />
          <IconButton icon={MoreVertical} title="More" />
        </div>
      </div>

      {bookmarks.length > 0 && (
        <div className="flex items-center gap-0.5 bg-background-secondary px-3 py-1.5 overflow-x-auto border-b border-border/50">
          {bookmarks.map((bookmark) => (
            <button
              key={`${bookmark.url}-${bookmark.Title}`}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-interactive hover:scale-105 transition-all shrink-0"
              style={{ maxWidth: "195px" }}
              onClick={() => handleNavigate(bookmark.url)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (confirm(`Remove bookmark "${bookmark.Title}"?`)) {
                  removeBookmark(bookmark.url, bookmark.Title);
                }
              }}
            >
              {bookmark.favicon ? (
                <img
                  src={bookmark.favicon}
                  alt=""
                  className="h-[18px] w-[18px] shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <Star className={`h-[18px] w-[18px] fill-current shrink-0 ${bookmark.favicon ? "hidden" : ""}`} />
              <span className="overflow-hidden whitespace-nowrap block min-w-0" style={{ textOverflow: "ellipsis" }}>
                {bookmark.Title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 bg-background">
        {tabs.map((tab) => (
          <iframe
            key={`${tab.id}-${tab.reloadKey}`}
            ref={(el) => {
              iframeRefs.current[tab.id] = el;
            }}
            title={tab.title}
            src={encodeProxyUrl(tab.url)}
            className={classNames("absolute inset-0 h-full w-full border-0", tab.active ? "block" : "hidden")}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ))}
      </div>
    </div>
  );
}
