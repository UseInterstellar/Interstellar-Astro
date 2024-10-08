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
    const titlebar = document.getElementById("inp") as HTMLInputElement;
    const frame = document.getElementById("frame__1") as HTMLIFrameElement;
    if (titlebar && frame) {
      frame.addEventListener("load", () => {
        const currentUrl = frame.contentWindow?.__uv$location?.href || "";
        titlebar.value = currentUrl;
      });
    }
  }

  TitleBar();
  setTimeout(() => TitleBar, 40000);

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
    console.log("Bookmark clicked");
  }
  if (bookmark) {
    bookmark.addEventListener("click", addBookmark);
  }
});
