document.addEventListener("astro:page-load", () => {
  const togglebuttons = document.querySelectorAll<HTMLElement>("[data-dropdown-toggle]");
  const cloakerDropdown = document.getElementById("cloaker");
  const engineDropdown = document.getElementById("engine");
  const menuDropdown = document.getElementById("menu");
  const themeDropdown = document.getElementById("theme");
  const engineForm = document.getElementById("custom-engine") as HTMLInputElement;

  const outsideClickHandler = (event: MouseEvent) => {
    togglebuttons.forEach((toggleElement) => {
      const dropdownId = toggleElement.getAttribute("data-dropdown-toggle") || "";
      const dropdown = document.getElementById(dropdownId);
      if (!dropdown) return;

      const inside = dropdown.contains(event.target as Node) || toggleElement.contains(event.target as Node);
      if (!inside) dropdown.classList.add("hidden");
    });
  };
  document.addEventListener("click", outsideClickHandler);

  togglebuttons.forEach((toggleElement) => {
    toggleElement.addEventListener("click", () => {
      const dropdownId = toggleElement.getAttribute("data-dropdown-toggle") || "";
      const dropdown = document.getElementById(dropdownId);
      if (dropdown) dropdown.classList.toggle("hidden");
    });
  });

  if (themeDropdown) {
    const links = themeDropdown.querySelectorAll<HTMLAnchorElement>("a");

    const themeMap: Record<string, string | null> = {
      Default: null,
      Ocean: "ocean",
      Forest: "forest",
      Sunset: "sunset",
      Purple: "purple",
      Midnight: "midnight",
      White: "light",
      Black: "black",
      Dusk: "dusk",
      Rosewood: "rosewood",
      Citrine: "citrine",
      Slate: "slate",
    };

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (!value || !(value in themeMap)) return;

        localStorage.setItem("theme", value);
        const dataTheme = themeMap[value];
        if (dataTheme) {
          document.documentElement.setAttribute("data-theme", dataTheme);
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      });
    });
  }

  const cloaker: Record<string, { name: string; icon: string }> = {
    Google: { name: "Google", icon: "/assets/media/favicons/google.png" },
    Savvas: {
      name: "Savvas Realize",
      icon: "/assets/media/favicons/savvas-realize.png",
    },
    SmartPass: { name: "SmartPass", icon: "/assets/media/favicons/smartpass.png" },
    WBO_SuperHome: {
      name: "Super Home Page",
      icon: "/assets/media/favicons/wbo.ico",
    },
    WBO_Student: {
      name: "WBO Student | Home Page",
      icon: "/assets/media/favicons/wbo.ico",
    },
    WBO_Timelines: {
      name: "Timelines - Home Page",
      icon: "/assets/media/favicons/wbo.ico",
    },
    Naviance: {
      name: "Naviance Student",
      icon: "/assets/media/favicons/naviance.png",
    },
    PBS: {
      name: "PBS LearningMedia | Teaching Resources For Students And Teachers",
      icon: "/assets/media/favicons/pbslearningmedia.ico",
    },
    PBS_StudentHome: {
      name: "Student Homepage | PBS LearningMedia",
      icon: "/assets/media/favicons/pbslearningmedia.ico",
    },
    Drive: {
      name: "My Drive - Google Drive",
      icon: "/assets/media/favicons/drive.png",
    },
    Classroom: { name: "Home", icon: "/assets/media/favicons/classroom.png" },
    Schoology: {
      name: "Home | Schoology",
      icon: "/assets/media/favicons/schoology.png",
    },
    Gmail: { name: "Gmail", icon: "/assets/media/favicons/gmail.png" },
    Clever: { name: "Clever | Portal", icon: "/assets/media/favicons/clever.png" },
    Khan: {
      name: "Dashboard | Khan Academy",
      icon: "/assets/media/favicons/khan.png",
    },
    Dictionary: {
      name: "Dictionary.com | Meanings & Definitions of English Words",
      icon: "/assets/media/favicons/dictionary.png",
    },
    Thesaurus: {
      name: "Synonyms and Antonyms of Words | Thesaurus.com",
      icon: "/assets/media/favicons/thesaurus.png",
    },
    IF_Campus: {
      name: "Infinite Campus",
      icon: "/assets/media/favicons/campus.png",
    },
    IXL: { name: "IXL | Dashboard", icon: "/assets/media/favicons/ixl.png" },
    Canvas: { name: "Dashboard", icon: "/assets/media/favicons/canvas.png" },
    LinkIt: { name: "Test Taker", icon: "/assets/media/favicons/linkit.ico" },
    Edpuzzle: { name: "Edpuzzle", icon: "/assets/media/favicons/edpuzzle.png" },
    iReady_Math: {
      name: "Math To Do, i-Ready",
      icon: "/assets/media/favicons/i-ready.ico",
    },
    iReady_Reading: {
      name: "Reading To Do, i-Ready",
      icon: "/assets/media/favicons/i-ready.ico",
    },
    ClassLink: { name: "Login", icon: "/assets/media/favicons/classlink-login.png" },
    GoogleMeet: {
      name: "Google Meet",
      icon: "/assets/media/favicons/google-meet.png",
    },
    GoogleDocs: {
      name: "Google Docs",
      icon: "/assets/media/favicons/google-docs.ico",
    },
    GoogleSlides: {
      name: "Google Slides",
      icon: "/assets/media/favicons/google-slides.ico",
    },
    Wikipedia: { name: "Wikipedia", icon: "/assets/media/favicons/wikipedia.png" },
    Britannica: {
      name: "Encyclopedia Britannica | Britannica",
      icon: "/assets/media/favicons/britannica.png",
    },
    Ducksters: { name: "Ducksters", icon: "/assets/media/favicons/ducksters.png" },
    Minga: {
      name: "Minga – Creating Amazing Schools",
      icon: "/assets/media/favicons/minga.png",
    },
    iReady_Games: {
      name: "Learning Games, i-Ready",
      icon: "/assets/media/favicons/i-ready.ico",
    },
    NoRedInk: {
      name: "Student Home | NoRedInk",
      icon: "/assets/media/favicons/noredink.png",
    },
    Desmos: {
      name: "Desmos | Graphing Calculator",
      icon: "/assets/media/favicons/desmos.png",
    },
    Newsela_Binder: {
      name: "Newsela | Binder",
      icon: "/assets/media/favicons/newsela.png",
    },
    Newsela_Assignments: {
      name: "Newsela | Assignments",
      icon: "/assets/media/favicons/newsela.png",
    },
    Newsela_Home: {
      name: "Newsela | Instructional Content Platform",
      icon: "/assets/media/favicons/newsela.png",
    },
    PowerSchool_SignIn: {
      name: "Student and Parent Sign In",
      icon: "/assets/media/favicons/powerschool.png",
    },
    PowerSchool_Grades: {
      name: "Grades and Attendance",
      icon: "/assets/media/favicons/powerschool.png",
    },
    PowerSchool_TeacherComments: {
      name: "Teacher Comments",
      icon: "/assets/media/favicons/powerschool.png",
    },
    PowerSchool_StandardsGrades: {
      name: "Standards Grades",
      icon: "/assets/media/favicons/powerschool.png",
    },
    PowerSchool_Attendance: {
      name: "Attendance",
      icon: "/assets/media/favicons/powerschool.png",
    },
    Nearpod: { name: "Nearpod", icon: "/assets/media/favicons/nearpod.png" },
    StudentVUE: {
      name: "StudentVUE",
      icon: "/assets/media/favicons/studentvue.ico",
    },
    Quizlet: {
      name: "Flashcards, learning tools and textbook solutions | Quizlet",
      icon: "/assets/media/favicons/quizlet.webp",
    },
    GoogleForms: {
      name: "Start your quiz",
      icon: "/assets/media/favicons/googleforms.png",
    },
    DeltaMath: { name: "DeltaMath", icon: "/assets/media/favicons/deltamath.png" },
    Kami: { name: "Kami", icon: "/assets/media/favicons/kami.png" },
    GoGuardian_Admin: {
      name: "Restricted",
      icon: "/assets/media/favicons/goguardian-lock.png",
    },
    GoGuardian_Teacher: {
      name: "Uh oh!",
      icon: "/assets/media/favicons/goguardian.png",
    },
    WorldHistory: {
      name: "World History Encyclopedia",
      icon: "/assets/media/favicons/worldhistoryencyclopedia.png",
    },
    BIM_AssignmentPlayer: {
      name: "Assignment Player",
      icon: "/assets/media/favicons/bim.ico",
    },
    BIM: { name: "Big Ideas Math", icon: "/assets/media/favicons/bim.ico" },
  };

  const maskPresetIcon = (iconUrl: string): string => {
    const isPreset = Object.values(cloaker).some(preset => preset.icon === iconUrl);
    if (!isPreset) return iconUrl;
    
    const match = iconUrl.match(/\.([^.]+)$/);
    const extension = match ? match[1] : "";
    
    return extension ? `***.${extension}` : "***";
  };

  if (cloakerDropdown) {
    const links = cloakerDropdown.querySelectorAll<HTMLAnchorElement>("a");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (!value || !(value in cloaker)) return;

        const { name, icon } = cloaker[value];
        localStorage.setItem("title", name);
        localStorage.setItem("icon", icon);
        window.location.reload();
      });
    });
  }

  const menu: Record<string, string> = {
    Hamburger: "Hamburger",
    Standard: "Standard",
  };

  if (menuDropdown) {
    const links = menuDropdown.querySelectorAll<HTMLAnchorElement>("a");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (!value || !(value in menu)) return;

        localStorage.setItem("menu", menu[value]);
        window.location.reload();
      });
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
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (!value || !(value in engine)) return;

        localStorage.setItem("engine", engine[value]);
        window.location.reload();
      });
    });
  }

  if (engineForm) {
    engineForm.value = localStorage.getItem("engine") || "";
    engineForm.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const customEngine = engineForm.value.trim();
      if (!customEngine) return;
      localStorage.setItem("engine", customEngine);
      window.location.reload();
    });
  }

  const customTitle = document.getElementById("custom-title") as HTMLInputElement;
  const customIcon = document.getElementById("custom-icon") as HTMLInputElement;

  if (customTitle) {
    customTitle.value = localStorage.getItem("title") || "";
    customTitle.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const title = customTitle.value.trim();
      if (!title) return;
      localStorage.setItem("title", title);
      window.location.reload();
    });
  }

  if (customIcon) {
    const storedIcon = localStorage.getItem("icon") || "";
    customIcon.value = maskPresetIcon(storedIcon);
    
    customIcon.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const icon = customIcon.value.trim();
      if (!icon || icon.startsWith("***")) return;
      localStorage.setItem("icon", icon);
      window.location.reload();
    });
  }
});

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
