import type { Asset } from "@/lib/asset";
import type { APIRoute } from "astro";

export const PUT: APIRoute = async ({ cookies, request }) => {
  const body = (await request.json()) as {
    type: string;
    name: string;
    link: string;
  };
  if (!body.type || !body.name || !body.link) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["app", "game"].includes(body.type)) {
    return Response.json({ error: "Invalid asset type" }, { status: 400 });
  }
  const currentAssets: Asset[] = cookies.get(`asset.${body.type}`)?.json() || [];
  currentAssets.push({
    name: body.name,
    link: body.link,
    image: "/media/icons/custom.webp",
    custom: true,
  });
  cookies.set(`asset.${body.type}`, JSON.stringify(currentAssets), {
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
  return Response.json({ success: true });
};
