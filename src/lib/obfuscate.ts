import crypto from "node:crypto";

export const ROUTES = ["tabs", "apps", "games", "settings", "scramjet"] as const;

export const ASSET_FOLDERS = ["scramjet"] as const;

export const ASSET_FILES = ["scramjet.all", "scramjet.sync", "scramjet.wasm", "scramjet.bundle"] as const;

export const CLASSES = ["browser-container", "tab-button", "address-bar", "iframe-container", "settings-card", "settings-grid", "proxy-frame", "search-box"] as const;

export const IDS = ["search", "main-content", "proxy-iframe", "browser-frame", "nav-menu", "menu-toggle", "menu-icon", "close-icon", "nav-links", "nav-style", "ab-toggle", "AB", "ab-switch", "ab-knob"] as const;

export const DATA_ATTRS = ["data-page", "data-route", "data-asset", "data-asset-remove"] as const;

export interface ObfuscationMaps {
  routes: Record<string, string>;
  reverseRoutes: Record<string, string>;
  code: Record<string, string>;
  assets: Record<string, string>;
  reverseAssets: Record<string, string>;
  version: string;
}

function genRandom(length: number, used: Set<string>): string {
  let result: string;
  do {
    result = crypto
      .randomBytes(Math.ceil(length * 0.75))
      .toString("base64url")
      .slice(0, length);
    if (!/^[a-zA-Z]/.test(result)) {
      result = `x${result.slice(1)}`;
    }
  } while (used.has(result));
  used.add(result);
  return result;
}

export function generateMaps(): ObfuscationMaps {
  const used = new Set<string>();

  const routes: Record<string, string> = {};
  for (const route of ROUTES) {
    routes[route] = genRandom(5, used);
  }

  const reverseRoutes: Record<string, string> = {};
  for (const [original, obfuscated] of Object.entries(routes)) {
    reverseRoutes[obfuscated] = original;
  }

  const code: Record<string, string> = {};
  for (const cls of CLASSES) {
    code[cls] = genRandom(2, used);
  }
  for (const id of IDS) {
    code[id] = genRandom(2, used);
  }
  for (const attr of DATA_ATTRS) {
    const obfuscatedName = genRandom(2, used);
    code[attr] = `data-${obfuscatedName}`;
  }

  const assets: Record<string, string> = {};
  for (const folder of ASSET_FOLDERS) {
    assets[folder] = genRandom(6, used);
  }
  for (const file of ASSET_FILES) {
    assets[file] = genRandom(6, used);
  }

  const reverseAssets: Record<string, string> = {};
  for (const [original, obfuscated] of Object.entries(assets)) {
    reverseAssets[obfuscated] = original;
  }

  const version = crypto.randomBytes(8).toString("hex");
  return { routes, reverseRoutes, code, assets, reverseAssets, version };
}

export function transformHtml(html: string, maps: ObfuscationMaps): string {
  let result = html;

  for (const [original, obfuscated] of Object.entries(maps.routes)) {
    result = result.replaceAll(`href="/${original}"`, `href="/${obfuscated}"`);
    result = result.replaceAll(`href='/${original}'`, `href='/${obfuscated}'`);
    result = result.replaceAll(`action="/${original}"`, `action="/${obfuscated}"`);
    result = result.replaceAll(`action='/${original}'`, `action='/${obfuscated}'`);
    result = result.replaceAll(`'/${original}'`, `'/${obfuscated}'`);
    result = result.replaceAll(`"/${original}"`, `"/${obfuscated}"`);
    result = result.replaceAll(`\`/${original}\``, `\`/${obfuscated}\``);
    result = result.replaceAll(`'/${original}/'`, `'/${obfuscated}/'`);
    result = result.replaceAll(`"/${original}/"`, `"/${obfuscated}/"`);
    result = result.replaceAll(`\`/${original}/\``, `\`/${obfuscated}/\``);
    result = result.replaceAll(`"/${original}/`, `"/${obfuscated}/`);
    result = result.replaceAll(`'/${original}/`, `'/${obfuscated}/`);
    result = result.replaceAll(`("/${original}")`, `("/${obfuscated}")`);
    result = result.replaceAll(`('/${original}')`, `('/${obfuscated}')`);
  }

  for (const [original, obfuscated] of Object.entries(maps.assets)) {
    result = result.replaceAll(`/assets/${original}/`, `/assets/${obfuscated}/`);
    result = result.replaceAll(`${original}.js`, `${obfuscated}.js`);
    result = result.replaceAll(`${original}.wasm`, `${obfuscated}.wasm`);
  }

  const dataEntries = Object.entries(maps.code)
    .filter(([original]) => original.startsWith("data-"))
    .sort((a, b) => b[0].length - a[0].length);
  for (const [original, obfuscated] of dataEntries) {
    result = result.replaceAll(original, obfuscated);
  }

  for (const [original, obfuscated] of Object.entries(maps.code)) {
    if (original.startsWith("data-")) continue;
    const classRegex = new RegExp(`(class=["'][^"']*?)\\b${escapeRegex(original)}\\b([^"']*?["'])`, "g");
    result = result.replace(classRegex, `$1${obfuscated}$2`);

    const idRegex = new RegExp(`(id=["'])${escapeRegex(original)}(["'])`, "g");
    result = result.replace(idRegex, `$1${obfuscated}$2`);

    result = result.replaceAll(`#${original}`, `#${obfuscated}`);

    result = result.replaceAll(`querySelector('.${original}')`, `querySelector('.${obfuscated}')`);
    result = result.replaceAll(`querySelector(".${original}")`, `querySelector(".${obfuscated}")`);
    result = result.replaceAll(`querySelectorAll('.${original}')`, `querySelectorAll('.${obfuscated}')`);
    result = result.replaceAll(`querySelectorAll(".${original}")`, `querySelectorAll(".${obfuscated}")`);
    result = result.replaceAll(`getElementById('${original}')`, `getElementById('${obfuscated}')`);
    result = result.replaceAll(`getElementById("${original}")`, `getElementById("${obfuscated}")`);
  }

  return result;
}

export function transformCss(css: string, maps: ObfuscationMaps): string {
  let result = css;

  for (const [original, obfuscated] of Object.entries(maps.code)) {
    if (!original.startsWith("data-")) {
      result = result.replaceAll(`.${original}`, `.${obfuscated}`);
      result = result.replaceAll(`#${original}`, `#${obfuscated}`);
    }
  }

  return result;
}

export function transformJs(js: string, maps: ObfuscationMaps): string {
  let result = js;

  for (const [original, obfuscated] of Object.entries(maps.routes)) {
    result = result.replaceAll(`'/${original}'`, `'/${obfuscated}'`);
    result = result.replaceAll(`"/${original}"`, `"/${obfuscated}"`);
    result = result.replaceAll(`\`/${original}\``, `\`/${obfuscated}\``);
    result = result.replaceAll(`'/${original}/'`, `'/${obfuscated}/'`);
    result = result.replaceAll(`"/${original}/"`, `"/${obfuscated}/"`);
    result = result.replaceAll(`\`/${original}/\``, `\`/${obfuscated}/\``);
    result = result.replaceAll(`"/${original}/`, `"/${obfuscated}/`);
    result = result.replaceAll(`'/${original}/`, `'/${obfuscated}/`);
  }

  for (const [original, obfuscated] of Object.entries(maps.code)) {
    if (!original.startsWith("data-")) {
      result = result.replaceAll(`'.${original}'`, `'.${obfuscated}'`);
      result = result.replaceAll(`".${original}"`, `".${obfuscated}"`);
      result = result.replaceAll(`'#${original}'`, `'#${obfuscated}'`);
      result = result.replaceAll(`"#${original}"`, `"#${obfuscated}"`);
      const idRegex = new RegExp(`getElementById\\((['\`])${escapeRegex(original)}\\1\\)`, "g");
      result = result.replace(idRegex, `getElementById("${obfuscated}")`);
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getClientScript(maps: ObfuscationMaps): string {
  const data = { r: maps.routes, a: maps.assets, c: maps.code, v: maps.version };
  const json = JSON.stringify(data);

  const key = 0x5a;
  const bytes = Buffer.from(json);
  const xored = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    xored[i] = bytes[i] ^ key;
  }
  const encoded = xored.toString("base64");

  return `<script>(function(){var d="${encoded}",k=${key},s=atob(d),o="";for(var i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^k);var c=JSON.parse(o);window._0=c.r;window._1=c.a;window._2=c.c;window._3=c.v})();</script>`;
}
