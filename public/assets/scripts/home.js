// Random URL Function
// To-Do: Instead of randomly grabbing a URL to redirect to we should allow users to either choose a site or multiple sites to redirect to or use the site corresponding with their cloak (Ex. If they are using a kahoot cloak it would redirect to https://kahoot.it)
function getRandomURL() {
  const randomURLS = [
    "https://kahoot.it",
    "https://classroom.google.com",
    "https://drive.google.com",
    "https://google.com",
    "https://docs.google.com",
    "https://slides.google.com",
    "https://www.nasa.gov",
    "https://blooket.com",
    "https://clever.com",
    "https://edpuzzle.com",
    "https://khanacademy.org",
    "https://wikipedia.org",
    "https://dictionary.com",
  ];
  return randomURLS[randRange(0, randomURLS.length)];
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

if (!localStorage.getItem("ab")) localStorage.setItem("ab", "true");

if (
  localStorage.getItem("ab") === "true" &&
  window !== window.top &&
  !navigator.userAgent.includes("Firefox")
) {
  const popup = open("about:blank", "_blank");
  if (!popup || popup.closed) {
    alert(
      "Please allow popups for this site. Doing so will allow us to open the site in a about:blank tab and preventing this site from showing up in your history. You can turn this off in the site settings.",
    );
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
      href:
        localStorage.getItem("icon") ||
        "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
    });
    doc.head.appendChild(link);
    doc.body.appendChild(iframe);
    const pLink = localStorage.getItem(encodeURI("pLink")) || getRandomURL();
    location.replace(pLink);

    const script = doc.createElement("script");
    script.textContent = `
        window.onbeforeunload = function (event) {
          const confirmationMessage = 'Leave Site?';
          (event || window.event).returnValue = confirmationMessage;
          return confirmationMessage;
        };
      `;
    doc.head.appendChild(script);
  }
}
