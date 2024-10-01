document.addEventListener("astro:page-load", () => {
  const togglebuttons = document.querySelectorAll("[data-dropdown-toggle]");
  const cloakerdropdown = document.getElementById("cloaker");
  const enginedropdown = document.getElementById("engine");
  const menudropdown = document.getElementById("menu");
  const themedropdown = document.getElementById("theme");
  const engineform = document.getElementById("custom-engine") as HTMLInputElement;
  // Tab Cloaks
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
  // Engines
  const engine: { [key: string]: string } = {
    Google: "https://www.google.com/search?q=",
    Bing: "https://www.bing.com/search?q=",
    DuckDuckGo: "https://duckduckgo.com/?q=",
    Qwant: "https://www.qwant.com/?q=",
    Startpage: "https://www.startpage.com/search?q=",
    SearchEncrypt: "https://www.searchencrypt.com/search/?q=",
    Ecosia: "https://www.ecosia.org/search?q=",
  };

  // Close dropdown when outside is clicked
  const outside = (event: MouseEvent) => {
    for (const toggleElement of togglebuttons) {
      const cloakerdropdown = document.getElementById(
        toggleElement.getAttribute("data-dropdown-toggle") || "",
      );

      if (cloakerdropdown) {
        const inside =
          cloakerdropdown.contains(event.target as Node) ||
          toggleElement.contains(event.target as Node);
        if (!inside) {
          cloakerdropdown.classList.add("hidden");
        }
      }
    }
  };

  for (const ToggleElement of togglebuttons) {
    ToggleElement.addEventListener("click", () => {
      const DropdownID = ToggleElement.getAttribute("data-dropdown-toggle");
      const dropdownmenu = document.getElementById(DropdownID || "");

      if (dropdownmenu) {
        dropdownmenu.classList.toggle("hidden");
      }
    });
  }
  const theme: { [key: string]: string } = {
    Default: "Default",
    Black: "Black",
    White: "White",
  };

  if (themedropdown) {
    const menulinks = themedropdown.querySelectorAll("a");
    for (const link of menulinks) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (value && theme[value]) {
          localStorage.setItem("theme", theme[value]);
          window.location.reload();
        }
      });
    }
  }

  // Cloaker Dropdown
  if (cloakerdropdown) {
    const links = cloakerdropdown.querySelectorAll("a");
    for (const link of links) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (value && cloaker[value]) {
          const { name, icon } = cloaker[value];
          localStorage.setItem("title", name);
          localStorage.setItem("icon", icon);
          window.location.reload();
        }
      });
    }
  }
  const menu: { [key: string]: string } = {
    Hamburger: "Hamburger",
    Standard: "Standard",
  };

  // Menu Dropdown
  if (menudropdown) {
    const menulinks = menudropdown.querySelectorAll("a");
    for (const link of menulinks) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (value && menu[value]) {
          localStorage.setItem("menu", menu[value]);
          window.location.reload();
        }
      });
    }
  }
  // Custom Cloaker
  const customtitle = document.getElementById("custom-title") as HTMLInputElement;
  const customicon = document.getElementById("custom-icon") as HTMLInputElement;
  if (customtitle) {
    customtitle.value = localStorage.getItem("title") || "";
    customtitle.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const title = customtitle.value.trim();
        if (title) {
          localStorage.setItem("title", title);
          window.location.reload();
        }
      }
    });
  }
  if (customicon) {
    customicon.value = localStorage.getItem("icon") || "";
    customicon.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const icon = customicon.value.trim();
        if (icon) {
          localStorage.setItem("icon", icon);
          window.location.reload();
        }
      }
    });
  }

  // Engine Dropdown
  if (enginedropdown) {
    const enginelinks = enginedropdown.querySelectorAll("a");
    for (const link of enginelinks) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const value = link.getAttribute("data-value");
        if (value && engine[value]) {
          localStorage.setItem("engine", engine[value]);
          window.location.reload();
        }
      });
    }
  }
  // Custom Engine
  if (engineform) {
    engineform.value = localStorage.getItem("engine") || "";
    engineform.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const customEngine = engineform.value.trim();
        if (customEngine) {
          localStorage.setItem("engine", customEngine);
          window.location.reload();
        }
      }
    });
  }

  document.addEventListener("click", outside);
});
// Panic Key
const panickey = document.getElementById("key") as HTMLInputElement;
const paniclink = document.getElementById("link") as HTMLInputElement;

if (panickey) {
  panickey.value = localStorage.getItem("key") || "";
  panickey.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const key = panickey.value.trim();
      if (key) {
        localStorage.setItem("key", key);
        window.location.reload();
      }
    }
  });
}

if (paniclink) {
  paniclink.value = localStorage.getItem("link") || "";
  paniclink.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const link = paniclink.value.trim();
      if (link) {
        localStorage.setItem("link", link);
        window.location.reload();
      }
    }
  });
}
