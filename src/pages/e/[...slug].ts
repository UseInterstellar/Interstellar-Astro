import path from "node:path";
import type { APIRoute } from "astro";
import mime from "mime";

export const prerender = false;

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".js", ".mjs", ".css", ".json", ".wasm", ".mp3", ".ogg", ".wav", ".mp4", ".webm", ".ttf", ".woff", ".woff2", ".eot", ".unityweb", ".data", ".mem", ".symbols"]);

const MAX_RESPONSE_SIZE = 50 * 1024 * 1024;

const VALID_SLUG_PATTERN = /^[a-zA-Z0-9/_.-]+$/;

export const GET: APIRoute = async ({ params }) => {
  try {
    const baseUrls: Record<string, string> = {
      "1": "https://raw.githubusercontent.com/v-5x/x/fixy",
      "2": "https://raw.githubusercontent.com/ypxa/Assets/main",
      "3": "https://raw.githubusercontent.com/ypxa/w/master",
    };

    if (!params.slug) {
      return new Response(null, { status: 404 });
    }

    if (!VALID_SLUG_PATTERN.test(params.slug)) {
      return new Response("Invalid slug format", { status: 400 });
    }

    if (params.slug.includes("..")) {
      return new Response("Invalid path", { status: 400 });
    }

    const prefix = params.slug.charAt(0);
    if (!Object.hasOwn(baseUrls, prefix)) {
      return new Response("Invalid slug", { status: 400 });
    }

    const ext = path.extname(params.slug).toLowerCase();
    if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
      return new Response("File type not allowed", { status: 403 });
    }

    const url = baseUrls[prefix] + params.slug.slice(1);
    const asset = await fetch(url);

    if (!asset.ok) {
      return new Response("Error fetching data", { status: 500 });
    }

    const contentLength = asset.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      return new Response("Response too large", { status: 413 });
    }

    const upstreamContentType = asset.headers.get("content-type") || "";
    const isHtml = upstreamContentType.includes("text/html");
    if (isHtml) {
      return new Response("HTML content not allowed", { status: 403 });
    }

    const no = [".unityweb"];
    const contentType = no.includes(ext) ? "application/octet-stream" : mime.getType(ext);

    return new Response(asset.body, {
      headers: {
        "content-type": contentType || "application/octet-stream",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (e) {
    console.error("Asset proxy error:", e);
    return new Response("Error fetching data", { status: 500 });
  }
};
