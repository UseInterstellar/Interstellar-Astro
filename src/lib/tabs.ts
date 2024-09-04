document.addEventListener("DOMContentLoaded", () => {
  const frame = document.getElementById("frame__1") as HTMLIFrameElement;
  if (frame) {
    frame.src =
      window.__uv$config.prefix + window.__uv$config.encodeUrl(sessionStorage.getItem("goUrl") || localStorage.getItem("engine") || "https://www.google.com");
  }

  const back = document.querySelector(".ArrowLeft");
  const forward = document.querySelector(".ArrowRight");
  const reloadbtn = document.querySelector(".RotateCw");
  const fullscreen = document.querySelector(".Maximize2");
  const bookmark = document.querySelector(".Star");
  const home = document.querySelector(".Home");

  // Back Arrow
  function goBack() {
    window.history.back();
    console.log("goBack");
  }
  if (back) {
    back.addEventListener("click", goBack);
  }

  // Forward Arrow
  function goForward() {
    window.history.forward();
  }
  if (forward) {
    forward.addEventListener("click", goForward);
  }

  // Reload
  function Reload() {
    const frame = document.getElementById("frame__1") as HTMLIFrameElement;
    if (frame) {
      // biome-ignore lint/correctness/noSelfAssign:
      frame.src = frame.src
    }
  }
  if (reloadbtn) {
    reloadbtn.addEventListener("click", Reload);
  }

  // Fullscreen
  function Fullscreen() {
    const frame = document.getElementById("frame__1") as HTMLIFrameElement;
    if (frame) {
      frame.requestFullscreen().catch(err => {
        console.error("Failed to enter fullscreen mode:", err);
      });
    }
  }
  if (fullscreen) {
    fullscreen.addEventListener("click", Fullscreen);
  }

  // Bookmark
  function Bookmark() {
    console.log("Bookmark clicked");
  }
  if (bookmark) {
    bookmark.addEventListener("click", Bookmark);
  }

  // Home
  function Home() {
    window.location.href = "./";
  }
  if (home) {
    home.addEventListener("click", Home);
  }
});