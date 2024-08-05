import path from "node:path";
import type { APIRoute } from "astro";
import mime from "mime";
export const prerender = false;
export const GET: APIRoute = async ({ params }) => {
  try {
    const baseUrls = {
      "1": "https://raw.githubusercontent.com/v-5x/x/fixy",
      "2": "https://raw.githubusercontent.com/ypxa/Assets/main",
      "3": "https://raw.githubusercontent.com/ypxa/w/master",
    };
    if (!params.slug) {
      return new Response(null, { status: 404 });
    }
    if (!Object.keys(baseUrls).includes(params.slug.charAt(0))) {
      return new Response("Invalid slug", { status: 400 });
    }
    const url =
      baseUrls[params.slug.charAt(0) as keyof typeof baseUrls] +
      params.slug.slice(1);
    const asset = await fetch(url);
    if (!asset.ok) {
      return new Response("Error fetching data", { status: 500 });
    }
    const ext = path.extname(url);
    const no = [".unityweb"];
    const contentType = no.includes(ext)
      ? "application/octet-stream"
      : mime.getType(ext);
    return new Response(asset.body, {
      headers: {
        "content-type": contentType || "application/octet-stream",
      },
    });
  } catch (e) {
    console.log(e);
    return new Response("Error fetching data", { status: 500 });
  }
};
