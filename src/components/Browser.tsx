import { ChevronLeft, ChevronRight, Home, Lock, Maximize2, Menu, MoreVertical, Plus, RotateCw, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { actionBarClass, addressInputClass, classNames, closeButtonClass, encodeProxyUrl, formatUrl, getActualUrl, getDefaultUrl, iconButtonClass, type Tab, tabButtonClass } from "@/lib/tabs";

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, title: "Tab 1", url: "about:blank", active: true, reloadKey: 0 }]);
  const [url, setUrl] = useState("about:blank");
  const [favicons, setFavicons] = useState<{ [key: number]: string }>({});
  const activeTab = useMemo(() => tabs.find((tab) => tab.active), [tabs]);
  const iframeRefs = useRef<{ [key: number]: HTMLIFrameElement | null }>({});

  useEffect(() => {
    let firstTabUrl = getDefaultUrl();
    try {
      const goUrl = sessionStorage.getItem("goUrl");
      if (goUrl && goUrl.trim()) {
        firstTabUrl = goUrl;
      }
    } catch (error) {
      console.warn("Session storage access failed:", error);
    }

    setTabs((prev) => prev.map((tab) => ({ ...tab, url: firstTabUrl })));
    setUrl(firstTabUrl);
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

    const updateUrlBar = () => {
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
          const faviconLink = 
            iframeDoc.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
            iframeDoc.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]') ||
            iframeDoc.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
          
          if (faviconLink?.href) {
            setFavicons((prev) => ({ ...prev, [activeTab.id]: faviconLink.href }));
          } else if (actualUrl) {
            try {
              const urlObj = new URL(actualUrl);
              const defaultFavicon = `${urlObj.origin}/favicon.ico`;
              setFavicons((prev) => ({ ...prev, [activeTab.id]: defaultFavicon }));
            } catch (e) {
            }
          }
        }
      } catch (e) {
      }
    };

    iframe.addEventListener("load", updateUrlBar);

    const interval = setInterval(updateUrlBar, 1000);

    return () => {
      iframe.removeEventListener("load", updateUrlBar);
      clearInterval(interval);
    };
  }, [activeTab, url]);

  const setActiveTab = (id: number) => {
    const target = tabs.find((tab) => tab.id === id);
    if (!target) return;
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        active: tab.id === id,
      })),
    );
    
    const iframe = iframeRefs.current[id];
    const actualUrl = getActualUrl(iframe);
    setUrl(actualUrl || target.url);
  };

  const addNewTab = () => {
    setTabs((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((tab) => tab.id)) + 1 : 1;
      const newTabs = prev.map((tab) => ({ ...tab, active: false }));
      return [...newTabs, { id: nextId, title: `Tab ${nextId}`, url: getDefaultUrl(), active: true, reloadKey: 0 }];
    });
    setUrl(getDefaultUrl());
  };

  const closeTab = (id: number) => {
    setTabs((prev) => {
      let nextUrl = url;
      const filtered = prev.filter((tab) => tab.id !== id);

      if (filtered.length === 0) {
        let firstTabUrl = getDefaultUrl();
        try {
          const goUrl = sessionStorage.getItem("goUrl");
          if (goUrl && goUrl.trim()) {
            firstTabUrl = goUrl;
          }
        } catch (error) {
          console.warn("Session storage access failed:", error);
        }
        return [{ id: Date.now(), title: "Tab 1", url: firstTabUrl, active: true, reloadKey: 0 }];
      } else if (!filtered.some((tab) => tab.active)) {
        filtered[0] = { ...filtered[0], active: true };
        nextUrl = filtered[0].url;
      } else {
        const currentActive = filtered.find((tab) => tab.active);
        if (currentActive) {
          nextUrl = currentActive.url;
        }
      }

      setUrl(nextUrl);
      return filtered;
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

  const goHome = () => {
    handleNavigate("https://duckduckgo.com");
  };

  const goBack = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    iframe?.contentWindow?.history.back();
  };

  const goForward = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    iframe?.contentWindow?.history.forward();
  };

  const reloadTab = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTab.id];
    iframe?.contentWindow?.location.reload();
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
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        bookmarks.push({ Title: title, url: actualUrl });
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        console.log("Bookmark added:", { Title: title, url: actualUrl });
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
          <div
            key={tab.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveTab(tab.id);
              }
            }}
            className={classNames(tabButtonClass, tab.active ? "bg-background-secondary text-text shadow-sm" : "bg-background text-text-secondary hover:bg-interactive")}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {favicons[tab.id] ? (
                <img src={favicons[tab.id]} alt="" className="h-4 w-4 shrink-0 rounded" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }} />
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
          </div>
        ))}
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-text-secondary transition-colors hover:bg-background-secondary/50 hover:text-text" onClick={addNewTab} aria-label="Add tab">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-background-secondary px-3 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <button type="button" className={iconButtonClass} onClick={goBack} aria-label="Back">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={goForward} aria-label="Forward">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={reloadTab} aria-label="Reload">
            <RotateCw className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={goHome} aria-label="Home">
            <Home className="h-4 w-4" />
          </button>
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
          <button type="button" className={iconButtonClass} onClick={toggleFullscreen} aria-label="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={addBookmark} aria-label="Bookmark">
            <Star className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} aria-label="Menu">
            <Menu className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} aria-label="More">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

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