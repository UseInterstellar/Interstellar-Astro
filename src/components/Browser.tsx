import { ChevronLeft, ChevronRight, Home, Lock, Menu, MoreVertical, Plus, RotateCw, Star, X, Maximize2 } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  type Tab,
  baseTabs,
  formatUrl,
  classNames,
  iconButtonClass,
  tabButtonClass,
  closeButtonClass,
  addressInputClass,
  actionBarClass,
  goBack,
  goForward,
  reloadTab,
  toggleFullscreen,
  addBookmark,
} from "@/lib/browser";

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>(baseTabs);
  const [url, setUrl] = useState(baseTabs[0].url);
  const activeTab = useMemo(() => tabs.find((tab) => tab.active), [tabs]);
  const iframeRefs = useRef<{ [key: number]: HTMLIFrameElement | null }>({});

  useEffect(() => {
    if (activeTab) {
      setUrl(activeTab.url);
    }
  }, [activeTab]);

  const setActiveTab = (id: number) => {
    const target = tabs.find((tab) => tab.id === id);
    if (!target) return;
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        active: tab.id === id,
      })),
    );
    setUrl(target.url);
  };

  const addNewTab = () => {
    setTabs((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((tab) => tab.id)) + 1 : 1;
      const newTabs = prev.map((tab) => ({ ...tab, active: false }));
      return [...newTabs, { id: nextId, title: "New Tab", url: "about:blank", active: true, reloadKey: 0 }];
    });
    setUrl("about:blank");
  };

  const closeTab = (id: number) => {
    setTabs((prev) => {
      let nextUrl = url;
      const filtered = prev.filter((tab) => tab.id !== id);

      if (filtered.length === 0) {
        return [{ id: Date.now(), title: "New Tab", url: "about:blank", active: true, reloadKey: 0 }];
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
    const nextUrl = formatUrl(value);
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              url: nextUrl,
              title: new URL(nextUrl).hostname || "New Tab",
            }
          : tab,
      ),
    );
    setUrl(nextUrl);
  };

  const goHome = () => {
    handleNavigate("https://duckduckgo.com");
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
            className={classNames(
              tabButtonClass,
              tab.active
                ? "bg-background-secondary text-text shadow-sm"
                : "bg-background text-text-secondary hover:bg-interactive"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded bg-accent/30" />
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
          <button type="button" className={iconButtonClass} onClick={() => activeTab && goBack(iframeRefs.current, activeTab.id)} aria-label="Back">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={() => activeTab && goForward(iframeRefs.current, activeTab.id)} aria-label="Forward">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={() => activeTab && reloadTab(iframeRefs.current, activeTab.id)} aria-label="Reload">
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
          <button type="button" className={iconButtonClass} onClick={() => activeTab && toggleFullscreen(iframeRefs.current, activeTab.id)} aria-label="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} onClick={() => activeTab && addBookmark(iframeRefs.current, activeTab.id, activeTab.title, activeTab.url)} aria-label="Bookmark">
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
            src={tab.url}
            className={classNames("absolute inset-0 h-full w-full border-0", tab.active ? "block" : "hidden")}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ))}
      </div>
    </div>
  );
}