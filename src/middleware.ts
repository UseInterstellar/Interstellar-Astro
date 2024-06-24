import fs from "node:fs";
import type { APIContext, MiddlewareNext } from "astro";
const LICENSE_SERVER_URL = "https://masqr.gointerstellar.app/validate?license=";
const whitelistedDomains = ["gointerstellar.app"];
const failFile = fs.readFileSync(`${process.cwd()}/failed.html`, "utf-8");
export const onRequest = async (context: APIContext, next: MiddlewareNext) => {
  if (
    whitelistedDomains.includes(context.url.host) ||
    context.url.pathname.startsWith("/_astro") ||
    context.url.pathname.startsWith("/_image")
  ) {
    return next();
  }
  if (context.request.headers.get("referer")?.includes("google.com")) {
    return Response.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", 307);
  }
  if (!process.env.MASQR) return next();

  if (context.cookies.get("authcheck")?.value === "true") {
    return next();
  }
  if (context.cookies.get("refreshcheck")?.value !== "true") {
    context.cookies.set("refreshcheck", "true", { maxAge: 10000 });
    return new Response(failFile, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader) {
    return new Response(failFile, {
      status: 401,
      headers: {
        "WWW-Authenticate": "Basic",
        "Content-Type": "text/html",
      },
    });
  }
  const [, pass] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const licenseCheck = (
    await (
      await fetch(`${LICENSE_SERVER_URL + pass}&host=${context.url.host}`)
    ).json()
  ).status;
  if (licenseCheck === "License valid") {
    context.cookies.set("authcheck", "true", {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    return new Response(
      "<script>window.location.href=window.location.href</script>",
    );
  }
};
