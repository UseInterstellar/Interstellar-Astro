const searchUrl =
  localStorage.getItem("engine") || "https://www.google.com/search?q=";
const input = document.getElementById("search") as HTMLInputElement | null;

function isUrl(val = ""): boolean {
  return /^http(s?):\/\//.test(val) || (val.includes(".") && !val.includes(" "));
}

document.addEventListener("astro:page-load", () => {
  if (input) {
    input.focus();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        let url = input?.value || "";
        if (!isUrl(url)) {
          url = searchUrl + url;
        } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
          url = `https://${url}`;
        }
        sessionStorage.setItem("goUrl", url);
        location.replace("/tabs");
      }
    });
  }
});
