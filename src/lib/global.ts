import { THEME_MAP } from "./constants";
import { isValidHttpUrl, sanitizeIconUrl } from "./url-utils";

const DEFAULT_FAVICON = "/assets/media/favicons/default.png";

export function openAboutBlankPopup(): Window | null {
  const popup = open("about:blank", "_blank");
  if (!popup || popup.closed) {
    alert("Please allow popups for this site. Doing so will allow us to open the site in an about:blank tab and prevent this site from showing up in your history. You can turn this off in the site settings.");
    return null;
  }

  const doc = popup.document;
  doc.title = localStorage.getItem("name") || "My Drive - Google Drive";

  const iframe = doc.createElement("iframe");
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    position: "fixed",
  });
  iframe.src = location.href;
  doc.body.appendChild(iframe);

  const link = Object.assign(doc.createElement("link"), {
    rel: "icon",
    href: localStorage.getItem("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
  });
  doc.head.appendChild(link);

  const script = doc.createElement("script");
  script.textContent = `window.onbeforeunload=function(e){const n="Leave Site?";return(e||window.event).returnValue=n,n};`;
  doc.head.appendChild(script);

  return popup;
}

function redirectToPanicLink(): void {
  const storedPLink = localStorage.getItem(encodeURI("pLink")) || "";
  const pLink = isValidHttpUrl(storedPLink) ? storedPLink : "https://drive.google.com";
  location.replace(pLink);
}

document.addEventListener("astro:page-load", () => {
  const proxyEngine = localStorage.getItem("proxyEngine");
  if (proxyEngine && proxyEngine !== "scramjet") {
    localStorage.setItem("proxyEngine", "scramjet");
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    const dataTheme = THEME_MAP[savedTheme];
    if (dataTheme) {
      document.documentElement.setAttribute("data-theme", dataTheme);
    }
  }

  document.title = localStorage.getItem("title") ?? "Home";
  const icon = sanitizeIconUrl(localStorage.getItem("icon") ?? DEFAULT_FAVICON, DEFAULT_FAVICON);
  const iconElm = document.getElementById("icon");
  if (iconElm) (iconElm as HTMLLinkElement).href = icon;

  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("nav");

  const isMenuOpen = localStorage.getItem("hamburger-open") === "true";
  menu?.classList.toggle("hidden", !isMenuOpen);

  hamburger?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu?.classList.toggle("hidden");
    localStorage.setItem("hamburger-open", !isOpen ? "true" : "false");
  });

  for (const link of Array.from(menu?.querySelectorAll("a") ?? [])) {
    link.addEventListener("click", () => {
      localStorage.removeItem("hamburger-open");
      menu?.classList.add("hidden");
    });
  }

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (menu && !menu.classList.contains("hidden") && !menu.contains(target) && !hamburger?.contains(target)) {
      menu.classList.add("hidden");
      localStorage.removeItem("hamburger-open");
    }
  });

  if (!localStorage.getItem("ab")) localStorage.setItem("ab", "false");

  if (localStorage.getItem("ab") === "true" && window === window.top && !navigator.userAgent.includes("Firefox")) {
    const lastUrl = sessionStorage.getItem("ab-last-url");
    const currentUrl = location.href;
    const armed = sessionStorage.getItem("ab-armed") === "true";

    if (!armed) {
      const popup = openAboutBlankPopup();
      if (popup) {
        sessionStorage.setItem("ab-armed", "true");
        sessionStorage.setItem("ab-last-url", currentUrl);
        redirectToPanicLink();
      }
      return;
    }

    if (!lastUrl || lastUrl === currentUrl) {
      sessionStorage.setItem("ab-last-url", currentUrl);
      return;
    }

    const popup = openAboutBlankPopup();
    if (popup) {
      sessionStorage.setItem("ab-armed", "false");
      sessionStorage.setItem("ab-last-url", currentUrl);
      redirectToPanicLink();
    }
  }

  const Key = localStorage.getItem("key") || "";
  const PanicKeys = Key.split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  const storedPanicLink = localStorage.getItem("link") || "";
  const PanicLink = isValidHttpUrl(storedPanicLink) ? storedPanicLink : "";

  if (PanicKeys.length > 0 && PanicLink) {
    let Typed: string[] = [];
    let Shift = false;
    const MAX_BUFFER = 20;

    const panicAbortController = new AbortController();
    const { signal } = panicAbortController;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        Shift = true;
        return;
      }
      const keyToRecord = Shift ? event.key.toUpperCase() : event.key.toLowerCase();
      Typed.push(keyToRecord);
      if (Typed.length > MAX_BUFFER) {
        Typed = Typed.slice(-PanicKeys.length);
      }
      if (Typed.length >= PanicKeys.length && PanicKeys.every((key, index) => key === Typed[Typed.length - PanicKeys.length + index])) {
        window.location.href = PanicLink;
        Typed = [];
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") Shift = false;
    };

    const handleVisibilityChange = () => {
      Typed = [];
      Shift = false;
    };

    window.addEventListener("keydown", handleKeyDown, { signal });
    window.addEventListener("keyup", handleKeyUp, { signal });
    window.addEventListener("blur", handleVisibilityChange, { signal });
    document.addEventListener("visibilitychange", handleVisibilityChange, { signal });

    document.addEventListener(
      "astro:before-preparation",
      () => {
        panicAbortController.abort();
      },
      { once: true },
    );
  }
});
