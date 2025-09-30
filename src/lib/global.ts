import DOMPurify from "dompurify";

document.addEventListener("astro:page-load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    const themeMap: Record<string, string> = {
      Default: "default",
      Ocean: "ocean",
      Forest: "forest",
      Sunset: "sunset",
      Purple: "purple",
      Midnight: "midnight",
      White: "light",
      Black: "black",
    };

    const dataTheme = themeMap[savedTheme];
    if (dataTheme && dataTheme !== "default") {
      document.documentElement.setAttribute("data-theme", dataTheme);
    }
  }

  document.title = localStorage.getItem("title") ?? "Home";
  const icon = DOMPurify.sanitize(localStorage.getItem("icon") ?? "/assets/media/favicons/default.png");
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

  if (!localStorage.getItem("ab")) localStorage.setItem("ab", "true");

  if (localStorage.getItem("ab") === "true" && window !== window.top && !navigator.userAgent.includes("Firefox")) {
    const popup = open("about:blank", "_blank");
    if (!popup || popup.closed) {
      alert("Please allow popups for this site. Doing so will allow us to open the site in an about:blank tab and prevent this site from showing up in your history. You can turn this off in the site settings.");
    } else {
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
      const link = Object.assign(doc.createElement("link"), {
        rel: "icon",
        href: localStorage.getItem("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
      });
      doc.head.appendChild(link);
      doc.body.appendChild(iframe);
      const pLink = localStorage.getItem(encodeURI("pLink")) || "https://drive.google.com";
      location.replace(pLink);

      const script = doc.createElement("script");
      script.textContent = `window.onbeforeunload=function(e){const n="Leave Site?";return(e||window.event).returnValue=n,n};`;
      doc.head.appendChild(script);
    }
  }

  const Key = localStorage.getItem("key") || "";
  const PanicKeys = Key.split(",").map((key) => key.trim());
  let PanicLink = localStorage.getItem("link") || "";
  try {
    const sanitizedLink = DOMPurify.sanitize(PanicLink);
    const url = new URL(sanitizedLink);
    PanicLink = url.toString();
  } catch (e) {
    PanicLink = "";
  }

  let Typed: string[] = [];
  let Shift = false;

  window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Shift") {
      Shift = true;
      return;
    }
    const keyToRecord = Shift ? event.key.toUpperCase() : event.key.toLowerCase();
    Typed.push(keyToRecord);
    if (Typed.length > PanicKeys.length) Typed.shift();
    if (Typed.length === PanicKeys.length && PanicKeys.every((key, index) => key === Typed[index])) {
      window.location.href = PanicLink;
      Typed = [];
    }
  });

  window.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key === "Shift") Shift = false;
  });
});
