const getFrame = () =>
  document.getElementById("frame__1") as HTMLIFrameElement | null;
document.addEventListener("astro:page-load", () => {
  console.log("page loaded");
  const frame = getFrame();
  if (frame) {
    frame.src =
      window.__uv$config.prefix +
      window.__uv$config.encodeUrl(
        sessionStorage.getItem("goUrl") ||
          localStorage.getItem("engine") ||
          "https://www.google.com",
      );
  } else {
    console.error("No iFrame found");
  }

  const back = document.getElementById("back");
  const forward = document.getElementById("forward");
  const reloadbtn = document.getElementById("reload");
  const fullscreen = document.getElementById("fullscreen");
  const bookmark = document.getElementById("bookmark");

  if (back) {
    back.addEventListener("click", () => getFrame()?.contentWindow?.history.back());
  }

  if (forward) {
    forward.addEventListener("click", () =>
      getFrame()?.contentWindow?.history.forward(),
    );
  }

  if (reloadbtn) {
    reloadbtn.addEventListener("click", () =>
      getFrame()?.contentWindow?.location.reload(),
    );
  }

  function TitleBar() {
    const Titlebar = document.getElementById("inp") as HTMLInputElement;
    const frame = getFrame();
    if (Titlebar && frame) {
      frame.addEventListener("load", () => {
        const CurrentURL = frame.contentWindow?.__uv$location?.href || "";
        Titlebar.value = CurrentURL;
      });
    }
  }

  TitleBar();
  setTimeout(() => TitleBar(), 40000);

  if (fullscreen) {
    fullscreen.addEventListener("click", () => {
      if (frame) {
        frame.requestFullscreen().catch((err) => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      }
    });
  }

  // Bookmark
  function addBookmark() {
    const CurrentURL = frame?.contentWindow?.location.href;

    const Path = CurrentURL?.split("/").slice(3).join("/").split("/").pop() || "";

    const Title = prompt("Enter a Title for this bookmark:", "New Bookmark");

    if (Title) {
      const decodedUrl = window.__uv$config.decodeUrl(Path);
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      bookmarks.push({ Title, url: decodedUrl });
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      console.log("Bookmark added:", { Title, url: decodedUrl });
    }
  }
  if (bookmark) {
    bookmark.addEventListener("click", addBookmark);
  }
});
