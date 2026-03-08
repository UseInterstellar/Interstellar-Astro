export const STORAGE_KEYS = {
  THEME: "theme",
  ICON: "icon",
  TITLE: "title",
  ENGINE: "engine",
  PANIC_KEY: "key",
  PANIC_LINK: "link",
  BOOKMARKS: "bookmarks",
  MENU: "menu",
  HAMBURGER_OPEN: "hamburger-open",
  ABOUT_BLANK: "ab",
  NAME: "name",
  P_LINK: "pLink",
} as const;

export const DEFAULTS = {
  FAVICON: "/assets/media/favicons/default.png",
  SEARCH_ENGINE: "https://duckduckgo.com/?q=",
  TITLE: "Home",
  P_LINK: "https://drive.google.com",
  CLOAKER_NAME: "My Drive - Google Drive",
} as const;

export const SESSION_KEYS = {
  GO_URL: "goUrl",
} as const;

export const COOKIE_KEYS = {
  ASSET_APP: "asset.app",
  ASSET_GAME: "asset.game",
  ASSET_GAMES: "asset.games",
} as const;

export const THEME_MAP: Record<string, string | null> = {
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
} as const;

export const SEARCH_ENGINES: Record<string, string> = {
  Google: "https://www.google.com/search?q=",
  Bing: "https://www.bing.com/search?q=",
  DuckDuckGo: "https://duckduckgo.com/?q=",
  Qwant: "https://www.qwant.com/?q=",
  Startpage: "https://www.startpage.com/search?q=",
  SearchEncrypt: "https://www.searchencrypt.com/search/?q=",
  Ecosia: "https://www.ecosia.org/search?q=",
} as const;

export const DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:"] as const;
