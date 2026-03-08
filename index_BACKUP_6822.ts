import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import path from "node:path";
import zlib from "node:zlib";

EventEmitter.defaultMaxListeners = 50;
import fastifyMiddie from "@fastify/middie";
import fastifyStatic from "@fastify/static";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { build } from "astro";
import Fastify from "fastify";
import INConfig from "./config";
import { generateMaps, getClientScript, type ObfuscationMaps, transformCss, transformHtml, transformJs, ROUTES, ASSET_FOLDERS } from "./src/lib/obfuscate";

let obfuscationMaps: ObfuscationMaps | null = null;

async function Start() {
  const FirstRun = process.env.FIRST === "true";

  if (!fs.existsSync("dist")) {
    console.log("Interstellar's not built yet! Building now...");

    await build({}).catch((err) => {
      console.error("Build failed:", err);
      process.exit(1);
    });

    if (FirstRun) {
      console.log("Restarting Server...");
      const disable = spawn("pnpm", ["disable"], { stdio: "inherit" });
      disable.on("close", (code) => {
        if (code === 0) {
          const start = spawn("pnpm", ["start"], { stdio: "inherit" });
          start.on("close", () => process.exit(0));
        } else {
          process.exit(code ?? 1);
        }
      });
      return;
    }
  }

  if (INConfig.server?.obfuscate !== false) {
    obfuscationMaps = generateMaps();
  }

  // determine host/port, with defaults
  const requestedHost = INConfig.server?.host || "0.0.0.0";
  const requestedPort = INConfig.server?.port || 8080;
  // helper to check if a port is free, returns first available port (up to +10)
  async function findFreePort(startPort: number, maxAttempts = 10): Promise<number> {
    const { createServer } = await import("node:net");
    for (let p = startPort; p < startPort + maxAttempts; p++) {
      const free = await new Promise<boolean>((resolve) => {
        const srv = createServer()
          .once("error", (err: any) => {
            if (err.code === "EADDRINUSE") resolve(false);
            else resolve(false);
          })
          .once("listening", () => {
            srv.close(() => resolve(true));
          })
          .listen(p, requestedHost);
      });
      if (free) return p;
    }
    return startPort;
  }

  const port = await findFreePort(requestedPort);
  if (port !== requestedPort) {
    console.warn(
      `Port ${requestedPort} was unavailable, using ${port} instead. ` +
        `You can set a different port in config or clear the conflicting service.`
    );
  }

  const app = Fastify({
    serverFactory: (handler) =>
      createServer(handler).on("upgrade", (req, socket: Socket, head) =>
        req.url?.startsWith("/f") ? wisp.routeRequest(req, socket, head) : socket.destroy()
      ),
  });

  if (INConfig.server?.compress !== false) {
    await app.register(import("@fastify/compress"), {
      encodings: ["br", "gzip", "deflate"],
    });
  }

  if (INConfig.auth?.challenge) {
    await app.register(import("@fastify/basic-auth"), {
      authenticate: true,
      validate(username, password, _req, _reply, done) {
        const users = INConfig.auth?.users || {};
        const storedPass = users[username];

        if (!storedPass) {
          const dummyPass = crypto.randomBytes(32).toString("hex");
          const inputBuf = Buffer.from(password);
          const dummyBuf = Buffer.alloc(inputBuf.length, dummyPass);
          crypto.timingSafeEqual(inputBuf, dummyBuf);
          return done(new Error("Invalid credentials"));
        }

        const inputBuf = Buffer.from(password);
        const storedBuf = Buffer.from(storedPass);

        if (inputBuf.length !== storedBuf.length) {
          const inputHash = crypto.createHash("sha256").update(password).digest();
          const storedHash = crypto.createHash("sha256").update(storedPass).digest();
          if (crypto.timingSafeEqual(inputHash, storedHash)) {
            return done();
          }
          return done(new Error("Invalid credentials"));
        }

        if (crypto.timingSafeEqual(inputBuf, storedBuf)) {
          return done();
        }
        return done(new Error("Invalid credentials"));
      },
    });
    await app.after();
    app.addHook("onRequest", app.basicAuth);
  }

  if (obfuscationMaps) {
    const reverseRoutes = obfuscationMaps.reverseRoutes;
    const reverseAssets = obfuscationMaps.reverseAssets;
    const literalRoutes = new Set<string>(ROUTES);
    const literalAssetFolders = new Set<string>(ASSET_FOLDERS);

    app.addHook("onRequest", (req, reply, done) => {
      if (req.headers) {
        req.headers["accept-encoding"] = "identity";
      }
      if ((req.raw as { headers?: Record<string, string> }).headers) {
        (req.raw as { headers?: Record<string, string> }).headers!["accept-encoding"] = "identity";
      }

      const [urlPath, query] = req.url.split("?");
      let pathParts = urlPath.split("/").filter(Boolean);
      let modified = false;

      if (pathParts.length > 0) {
        const firstPart = pathParts[0];

        if (literalRoutes.has(firstPart)) {
          reply.code(404).send("Not Found");
          return;
        }

        if (firstPart === "assets" && pathParts.length >= 2) {
          const assetFolder = pathParts[1];
          if (literalAssetFolders.has(assetFolder)) {
            reply.code(404).send("Not Found");
            return;
          }
        }

        const realRoute = reverseRoutes[firstPart];
        if (realRoute && realRoute !== "scramjet") {
          pathParts[0] = realRoute;
          modified = true;
        }

        if (pathParts[0] === "assets" && pathParts.length >= 2) {
          const assetFolder = pathParts[1];
          const realFolder = reverseAssets[assetFolder];
          if (realFolder && realFolder !== "scramjet") {
            pathParts[1] = realFolder;
            modified = true;
          }

          if (pathParts.length >= 3) {
            const fileName = pathParts[2];
            const lastDot = fileName.lastIndexOf(".");
            const baseName = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
            const ext = lastDot > 0 ? fileName.slice(lastDot) : "";
            const realBaseName = reverseAssets[baseName];
            if (realBaseName) {
              pathParts[2] = realBaseName + ext;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        const newUrl = `/${pathParts.join("/")}${query ? `?${query}` : ""}`;
        (req.raw as { url?: string }).url = newUrl;
        Object.defineProperty(req, "url", {
          value: newUrl,
          writable: true,
          configurable: true,
        });
      }

      done();
    });
  }

  if (obfuscationMaps) {
    const assets = obfuscationMaps.assets;
    const routes = obfuscationMaps.routes;
    const scramjetFolder = assets.scramjet;
    const scramjetRoute = routes.scramjet;
    const sjAll = assets["scramjet.all"];

    app.get("/sw.js", (_req, reply) => {
      const swCode = `importScripts("/assets/${scramjetFolder}/${sjAll}.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
const scramjetPrefix = "/${scramjetRoute}/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "skipWaiting") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      await scramjet.loadConfig();
      try {
        const url = new URL(event.request.url);
        if (!url.pathname.startsWith(scramjetPrefix)) {
          return fetch(event.request);
        }
      } catch (_e) {}
      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }
      return fetch(event.request);
    })()
  );
});
`;
      reply
        .header("Service-Worker-Allowed", "/")
        .type("application/javascript")
        .send(swCode);
    });

    app.get(`/assets/${scramjetFolder}/*`, (req, reply) => {
      const fileName = req.url.split("/").pop() || "";
      let realFileName = fileName;
      for (const [original, obfuscated] of Object.entries(assets)) {
        if (fileName.startsWith(obfuscated)) {
          const ext = fileName.slice(obfuscated.length);
          realFileName = original + ext;
          break;
        }
      }
      reply.header("Access-Control-Allow-Origin", "*");
      return reply.sendFile(`assets/scramjet/${realFileName}`, path.join(import.meta.dirname, "dist", "client"));
    });

    app.get(`/${scramjetRoute}/*`, (req, reply) => {
      const encodedPath = req.url.slice(`/${scramjetRoute}/`.length);
      let targetUrl = "";
      try {
        targetUrl = decodeURIComponent(encodedPath);
      } catch {
        targetUrl = encodedPath;
      }

      const tabsRoute = routes.tabs;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Loading proxy...</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #1a1a1a;
      color: #fff;
    }
  </style>
</head>
<body>
  <div id="status">Initializing...</div>
  <script type="module">
    const status = document.getElementById('status');
    const targetUrl = ${JSON.stringify(targetUrl)};

    async function init() {
      try {
        status.textContent = 'Setting up transport...';

        const { BareMuxConnection } = await import('/assets/bundled/bm-index.mjs');
        const connection = new BareMuxConnection("/assets/bundled/bm-worker.js");
        const wispUrl = (location.protocol === "http:" ? "ws:" : "wss:") + "//" + location.host + "/f/";
        await connection.setTransport("/assets/bundled/ex-index.mjs", [{ wisp: wispUrl }]);

        status.textContent = 'Transport ready, loading page...';

        if (targetUrl && targetUrl.startsWith('http')) {
          sessionStorage.setItem('goUrl', targetUrl);
        }

        await new Promise(r => setTimeout(r, 200));
        location.replace('/${tabsRoute}');

      } catch (e) {
        status.textContent = 'Error: ' + e.message;
        console.error('Init error:', e);
      }
    }

    init();
  </script>
</body>
</html>`;

      reply.type("text/html; charset=utf-8").send(html);
    });
  }

  app.addHook("onSend", (_request, reply, _payload, done) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "SAMEORIGIN");
    reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
    reply.header("Permissions-Policy", "geolocation=(self), microphone=(self), camera=(self)");
    reply.header("X-XSS-Protection", "1; mode=block");
    const ct = reply.getHeader("content-type");
    if (ct && String(ct).toLowerCase().includes("text/html")) {
      reply.header("Pragma", "no-cache");
    }
    done();
  });

  const { handler } = (await import("./dist/server/entry.mjs")) as {
    handler: (req: unknown, res: unknown, next?: () => void) => void;
  };
  await app
    .register(fastifyStatic, {
      root: path.join(import.meta.dirname, "dist", "client"),
    })
    .register(fastifyMiddie);
  app.use(handler);
  app.listen({ port, host: requestedHost }, (err, addr) => {
    if (err) {
      if ((err as any).code === "EADDRINUSE") {
        console.error(
          `Unable to bind to ${requestedHost}:${port}; address already in use. ` +
            `Try changing the port or stopping the conflicting process.`
        );
      } else {
        console.error("Server failed to start:", err);
      }
      process.exit(1);
    }
    console.log("Server listening on %s", addr);
  });
}

process.env.FIRST = process.env.FIRST || "true";
await Start();
