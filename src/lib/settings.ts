import { cloakerPresets } from "./cloaker-presets";
import { THEME_MAP } from "./constants";
import { openAboutBlankPopup } from "./global";
import { getObfId } from "./obf-helpers";
import { isValidHttpUrl, isValidIconUrl } from "./url-utils";

let settingsAbortController: AbortController | null = null;

const initSettings = () => {
  settingsAbortController?.abort();
  settingsAbortController = new AbortController();
  const { signal } = settingsAbortController;

  const togglebuttons = document.querySelectorAll<HTMLElement>("[data-dropdown-toggle]");
  const engineForm = document.getElementById("custom-engine") as HTMLInputElement;

  const positionDropdown = (toggleElement: HTMLElement, dropdown: HTMLElement) => {
    const rect = toggleElement.getBoundingClientRect();
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.top = `${rect.bottom + 6 + window.scrollY}px`;
    dropdown.style.width = `${rect.width}px`;
  };

  const portalDropdown = (toggleElement: HTMLElement, dropdown: HTMLElement, open: boolean) => {
    const parent = toggleElement.parentElement;
    if (!parent) return;
    if (open) {
      if (dropdown.dataset.portal !== "true") {
        dropdown.dataset.portal = "true";
        document.body.appendChild(dropdown);
      }
    } else if (dropdown.dataset.portal === "true") {
      dropdown.dataset.portal = "";
      parent.appendChild(dropdown);
    }
  };

  const cloakerDropdown = document.getElementById(getObfId("cloaker"));
  const engineDropdown = document.getElementById(getObfId("engine"));
  const menuDropdown = document.getElementById(getObfId("menu"));
  const navStyleDropdown = document.getElementById(getObfId("nav-style"));
  const themeDropdown = document.getElementById(getObfId("theme"));
  const abToggle = document.getElementById(getObfId("ab-toggle")) as HTMLInputElement | null;
  const abButton = document.getElementById(getObfId("AB")) as HTMLButtonElement | null;
  const abStatus = document.getElementById("ab-status");
  const abSwitch = document.getElementById(getObfId("ab-switch")) as HTMLSpanElement | null;
  const abKnob = document.getElementById(getObfId("ab-knob")) as HTMLSpanElement | null;
  const proxyEngineStatus = document.getElementById("proxy-engine-status");
  const proxySwStatus = document.getElementById("proxy-sw-status");
  const proxyTransportStatus = document.getElementById("proxy-transport-status");

  const setProxyStatus = (el: HTMLElement | null, ok: boolean, text: string) => {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("text-emerald-400", ok);
    el.classList.toggle("text-rose-400", !ok);
    el.classList.toggle("text-text-secondary", false);
  };

  const updateProxyStatus = async () => {
    const hasScramjet = Boolean((window as Window & { __scramjet$config?: unknown }).__scramjet$config);
    if (proxyEngineStatus) {
      proxyEngineStatus.textContent = hasScramjet ? "Scramjet" : "Not ready";
      proxyEngineStatus.classList.remove("text-emerald-400", "text-rose-400", "text-amber-300");
      proxyEngineStatus.classList.add("text-text");
    }

    const swReady = Boolean(navigator.serviceWorker?.controller);
    setProxyStatus(proxySwStatus, swReady, swReady ? "Active" : "Not active");

    let transportReady = false;
    try {
      const conn = (window as Window & { connection?: { getTransport?: () => Promise<string> } }).connection;
      if (conn?.getTransport) {
        const name = await conn.getTransport();
        transportReady = Boolean(name);
      }
    } catch (_e) {
      transportReady = false;
    }
    setProxyStatus(proxyTransportStatus, transportReady, transportReady ? "Connected" : "Not connected");
  };

  const getDropdownButton = (dropdown: HTMLElement) => {
    const sibling = dropdown.previousElementSibling;
    if (sibling instanceof HTMLButtonElement) return sibling;
    return dropdown.parentElement?.querySelector<HTMLButtonElement>("[data-dropdown-toggle]") ?? null;
  };

  const setDropdownLabel = (dropdown: HTMLElement, label: string) => {
    const button = getDropdownButton(dropdown);
    if (!button) return;
    const span = button.querySelector("span");
    if (span) span.textContent = label;
  };

  const outsideClickHandler = (event: MouseEvent) => {
    togglebuttons.forEach((toggleElement) => {
      const dropdownId = toggleElement.getAttribute("data-dropdown-toggle") || "";
      const dropdown = document.getElementById(getObfId(dropdownId));
      if (!dropdown) return;

      const inside = dropdown.contains(event.target as Node) || toggleElement.contains(event.target as Node);
      if (!inside) {
        dropdown.classList.add("hidden");
        const card = toggleElement.closest(".settings-card");
        card?.classList.remove("dropdown-open");
      }
    });
  };
  document.addEventListener("click", outsideClickHandler, { signal });

  togglebuttons.forEach((toggleElement) => {
    toggleElement.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        const dropdownId = toggleElement.getAttribute("data-dropdown-toggle") || "";
        const dropdown = document.getElementById(getObfId(dropdownId));
        if (!dropdown) return;
        const isOpen = !dropdown.classList.contains("hidden");
        document.querySelectorAll(".settings-card.dropdown-open").forEach((card) => card.classList.remove("dropdown-open"));
        dropdown.classList.toggle("hidden");
        const card = toggleElement.closest(".settings-card");
        if (!isOpen) card?.classList.add("dropdown-open");
        if (isOpen) card?.classList.remove("dropdown-open");
        toggleElement.setAttribute("aria-expanded", String(!isOpen));
        if (!isOpen) {
          portalDropdown(toggleElement, dropdown, true);
          positionDropdown(toggleElement, dropdown);
        } else {
          portalDropdown(toggleElement, dropdown, false);
        }
      },
      { signal },
    );
  });

  window.addEventListener(
    "resize",
    () => {
      const openDropdown = document.querySelector<HTMLElement>("[data-dropdown-toggle][aria-expanded='true']");
      if (!openDropdown) return;
      const dropdownId = openDropdown.getAttribute("data-dropdown-toggle") || "";
      const dropdown = document.getElementById(getObfId(dropdownId));
      if (dropdown && !dropdown.classList.contains("hidden")) {
        positionDropdown(openDropdown, dropdown);
      }
    },
    { signal },
  );

  window.addEventListener(
    "scroll",
    () => {
      const openDropdown = document.querySelector<HTMLElement>("[data-dropdown-toggle][aria-expanded='true']");
      if (!openDropdown) return;
      const dropdownId = openDropdown.getAttribute("data-dropdown-toggle") || "";
      const dropdown = document.getElementById(getObfId(dropdownId));
      if (dropdown && !dropdown.classList.contains("hidden")) {
        positionDropdown(openDropdown, dropdown);
      }
    },
    { signal, passive: true },
  );

  if (themeDropdown) {
    const links = themeDropdown.querySelectorAll<HTMLAnchorElement>("a");

    const themeLabelMap = new Map<string, string>();
    links.forEach((link) => {
      const value = link.getAttribute("data-value");
      if (!value) return;
      themeLabelMap.set(value, link.textContent?.trim() || value);
    });
    const storedTheme = localStorage.getItem("theme") || "Default";
    setDropdownLabel(themeDropdown, themeLabelMap.get(storedTheme) || "Select Theme");

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const value = link.getAttribute("data-value");
          if (!value || !(value in THEME_MAP)) return;

          localStorage.setItem("theme", value);
          const dataTheme = THEME_MAP[value];
          if (dataTheme) {
            document.documentElement.setAttribute("data-theme", dataTheme);
          } else {
            document.documentElement.removeAttribute("data-theme");
          }
          setDropdownLabel(themeDropdown, themeLabelMap.get(value) || "Select Theme");
        },
        { signal },
      );
    });
  }

  const maskPresetIcon = (iconUrl: string): string => {
    const isPreset = Object.values(cloakerPresets).some((preset) => preset.icon === iconUrl);
    if (!isPreset) return iconUrl;

    const match = iconUrl.match(/\.([^.]+)$/);
    const extension = match ? match[1] : "";

    return extension ? `***.${extension}` : "***";
  };

  if (cloakerDropdown) {
    const links = cloakerDropdown.querySelectorAll<HTMLAnchorElement>("a");
    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const value = link.getAttribute("data-value");
          if (!value || !(value in cloakerPresets)) return;

          const { name, icon } = cloakerPresets[value];
          localStorage.setItem("title", name);
          localStorage.setItem("icon", icon);
          window.location.reload();
        },
        { signal },
      );
    });
  }

  const menu: Record<string, string> = {
    Hamburger: "Hamburger",
    Standard: "Standard",
  };

  if (menuDropdown) {
    const links = menuDropdown.querySelectorAll<HTMLAnchorElement>("a");
    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const value = link.getAttribute("data-value");
          if (!value || !(value in menu)) return;

          localStorage.setItem("menu", menu[value]);
          window.location.reload();
        },
        { signal },
      );
    });
  }

  const engine: Record<string, string> = {
    Google: "https://www.google.com/search?q=",
    Bing: "https://www.bing.com/search?q=",
    DuckDuckGo: "https://duckduckgo.com/?q=",
    Qwant: "https://www.qwant.com/?q=",
    Startpage: "https://www.startpage.com/search?q=",
    SearchEncrypt: "https://www.searchencrypt.com/search/?q=",
    Ecosia: "https://www.ecosia.org/search?q=",
  };

  if (engineDropdown) {
    const links = engineDropdown.querySelectorAll<HTMLAnchorElement>("a");
    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const value = link.getAttribute("data-value");
          if (!value || !(value in engine)) return;

          localStorage.setItem("engine", engine[value]);
          window.location.reload();
        },
        { signal },
      );
    });
  }

  if (navStyleDropdown) {
    const links = navStyleDropdown.querySelectorAll<HTMLAnchorElement>("a");
    const navLabelMap = new Map<string, string>();
    links.forEach((link) => {
      const value = link.getAttribute("data-value");
      if (!value) return;
      navLabelMap.set(value, link.textContent?.trim() || value);
    });
    const storedNavStyle = localStorage.getItem("nav-style") || "inline";
    setDropdownLabel(navStyleDropdown, navLabelMap.get(storedNavStyle) || "Select Layout");

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const value = link.getAttribute("data-value");
          if (!value || !["menu", "inline"].includes(value)) return;
          localStorage.setItem("nav-style", value);
          window.location.reload();
        },
        { signal },
      );
    });
  }

  if (proxyEngineStatus || proxySwStatus || proxyTransportStatus) {
    updateProxyStatus();
    const interval = window.setInterval(updateProxyStatus, 500);
    window.setTimeout(() => window.clearInterval(interval), 5000);
    signal.addEventListener("abort", () => window.clearInterval(interval));
  }

  if (abToggle) {
    const setAbUi = (enabled: boolean) => {
      abToggle.checked = enabled;
      if (abStatus) {
        abStatus.textContent = enabled ? "Enabled" : "Disabled";
        abStatus.classList.toggle("text-text-secondary", !enabled);
        abStatus.classList.toggle("text-text", enabled);
      }
      if (abSwitch && abKnob) {
        abSwitch.style.background = enabled ? "var(--accent)" : "var(--interactive-secondary)";
        abSwitch.style.borderColor = enabled ? "var(--accent-secondary)" : "var(--border)";
        abKnob.style.transform = enabled ? "translateX(20px)" : "translateX(2px)";
        abKnob.style.background = "var(--text)";
        abKnob.style.boxShadow = "0 1px 2px rgba(0,0,0,0.35)";
      }
    };

    const storedAb = localStorage.getItem("ab");
    const initialEnabled = storedAb === "true";
    if (storedAb === null) localStorage.setItem("ab", "false");
    setAbUi(initialEnabled);
    abToggle.addEventListener(
      "change",
      () => {
        const enabled = abToggle.checked;
        localStorage.setItem("ab", enabled ? "true" : "false");
        sessionStorage.setItem("ab-armed", enabled ? "true" : "false");
        setAbUi(enabled);
        if (enabled) {
          sessionStorage.setItem("ab-last-url", window.location.href);
        } else {
          sessionStorage.removeItem("ab-last-url");
        }
      },
      { signal },
    );
  }

  if (abButton) {
    abButton.addEventListener(
      "click",
      () => {
        localStorage.setItem("ab", "true");
        sessionStorage.setItem("ab-armed", "true");
        sessionStorage.setItem("ab-last-url", window.location.href);
        if (abToggle) abToggle.checked = true;
        openAboutBlankPopup();
      },
      { signal },
    );
  }

  if (engineForm) {
    engineForm.value = localStorage.getItem("engine") || "";
    engineForm.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const customEngine = engineForm.value.trim();
        if (!customEngine) return;
        if (!isValidHttpUrl(customEngine)) {
          alert("Invalid URL. Please enter a valid HTTP or HTTPS URL.");
          return;
        }
        localStorage.setItem("engine", customEngine);
        window.location.reload();
      },
      { signal },
    );
  }

  const customTitle = document.getElementById("custom-title") as HTMLInputElement;
  const customIcon = document.getElementById("custom-icon") as HTMLInputElement;

  if (customTitle) {
    customTitle.value = localStorage.getItem("title") || "";
    customTitle.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const title = customTitle.value.trim();
        if (!title) return;
        localStorage.setItem("title", title);
        window.location.reload();
      },
      { signal },
    );
  }

  if (customIcon) {
    const storedIcon = localStorage.getItem("icon") || "";
    customIcon.value = maskPresetIcon(storedIcon);

    customIcon.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const icon = customIcon.value.trim();
        if (!icon || icon.startsWith("***")) return;
        if (!isValidIconUrl(icon)) {
          alert("Invalid icon URL. Please enter a valid HTTP/HTTPS URL or a path starting with /");
          return;
        }
        localStorage.setItem("icon", icon);
        window.location.reload();
      },
      { signal },
    );
  }
  const panicKey = document.getElementById("key") as HTMLInputElement;
  const panicLink = document.getElementById("link") as HTMLInputElement;

  if (panicKey) {
    panicKey.value = localStorage.getItem("key") || "";
    panicKey.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      let key = panicKey.value.trim();
      if (!key) return;

      if (key.length >= 2 && !key.includes(",")) {
        key = key.split("").join(",");
      }

      localStorage.setItem("key", key);
      window.location.reload();
    });
  }

  if (panicLink) {
    panicLink.value = localStorage.getItem("link") || "";
    panicLink.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const link = panicLink.value.trim();
      if (!link) return;
      localStorage.setItem("link", link);
      window.location.reload();
    });
  }
};

document.addEventListener("astro:page-load", initSettings);
document.addEventListener("DOMContentLoaded", initSettings);
if (document.readyState === "interactive" || document.readyState === "complete") {
  initSettings();
}

document.addEventListener("astro:before-preparation", () => {
  settingsAbortController?.abort();
});
