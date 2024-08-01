const filePrefix = "/assets/bundled/v."
// cursed encoding method
const factory = (key) => {
  const getShuffledAlphabet = () => {
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    return shuffle(alphabet, key);
  };
  const shuffle = (alphabet, key) => {
    const shuffledAlphabet = [...alphabet];

    for (let i = 0; i < key.length; i++) {
      const charCode = key.charCodeAt(i) % alphabet.length;
      const shiftAmount = charCode < 0 ? charCode + alphabet.length : charCode;

      for (let j = 0; j < alphabet.length; j++) {
        const newIndex = (j + shiftAmount) % alphabet.length;
        const temp = shuffledAlphabet[j];
        shuffledAlphabet[j] = shuffledAlphabet[newIndex];
        shuffledAlphabet[newIndex] = temp;
      }
    }

    return shuffledAlphabet.join("");
  };

  const base64Encode = (text) => {
    const shuffledAlphabet = getShuffledAlphabet();
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return [...btoa(text)]
      .map((char) => {
        const index = alphabet.indexOf(char);
        return index !== -1 ? shuffledAlphabet[index] : char;
      })
      .join("");
  };

  const base64Decode = (encodedText) => {
    const shuffledAlphabet = getShuffledAlphabet();
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return atob(
      [...encodedText]
        .map((char) => {
          const index = shuffledAlphabet.indexOf(char);
          return index !== -1 ? alphabet[index] : char;
        })
        .join(""),
    );
  };

  return {
    enc: base64Encode,
    dec: (encodedText) => {
      if (encodedText.includes("?")) {
        encodedText = base64Encode(
          `${base64Decode(encodedText.split("?")[0])}?${encodedText.split("?")[1]}`,
        );
      }
      return base64Decode(encodedText);
    },
  };
};

const cipher = factory((location.origin + navigator.userAgent).toUpperCase());
/** @type {import("@titaniumnetwork-dev/ultraviolet").UVConfig}*/
const config = {
  prefix: '/jquery/', /* yes i am insane */
  encodeUrl: cipher.enc,
  decodeUrl: cipher.dec,
  handler: `${filePrefix}hndlr.js`,
  client: `${filePrefix}clnt.js`,
  bundle: `${filePrefix}bndl.js`,
  config: `${filePrefix}cnfg.js`,
  sw: `${filePrefix}sw.js`,
  inject: [
    {
      host: /discord.com*/g,
      injectTo: "head",
      html: `
      <script src="https://raw.githubusercontent.com/Vencord/builds/main/browser.js"></script>
      <link rel="stylesheet" href="https://raw.githubusercontent.com/Vencord/builds/main/browser.css">
      `
    }
  ]
};
self.__uv$config = config;
