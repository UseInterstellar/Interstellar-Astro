import { execSync } from "node:child_process";
import fs from "node:fs";
import { createServer } from "node:http";
import type { Socket } from "node:net";
import path from "node:path";
import fastifyMiddie from "@fastify/middie";
import fastifyStatic from "@fastify/static";
// @ts-expect-error
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { build } from "astro";
import Fastify from "fastify";
import INConfig from "./config";
import { Main, Revert } from "./randomize";

async function Start() {
  const FirstRun = process.env.FIRST === "true";

  if (!fs.existsSync("dist")) {
    if (INConfig.server?.obfuscate !== false) {
      await Main({ enabled: true });
    }

    console.log("Interstellar's not built yet! Building now...");

    await build({}).catch((err) => {
      console.error("Build failed:", err);
      process.exit(1);
    });

    if (INConfig.server?.obfuscate !== false) {
      await Revert();
    }

    if (FirstRun) {
      console.log("Restarting Server...");
      execSync("pnpm disable && pnpm start", { stdio: "inherit" });
      process.exit(0);
    }
  }

  // determine host/port, with defaults
  const host = INConfig.server?.host || "0.0.0.0";
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
          .listen(p, host);
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
        for (const [user, pass] of Object.entries(INConfig.auth?.users || {})) {
          if (username === user && password === pass) {
            return done();
          }
        }
        return done(new Error("Invalid credentials"));
      },
    });
    await app.after();
    app.addHook("onRequest", app.basicAuth);
  }
  // @ts-ignore
  const { handler } = await import("./dist/server/entry.mjs");
  await app
    .register(fastifyStatic, {
      root: path.join(import.meta.dirname, "dist", "client"),
    })
    .register(fastifyMiddie);
  app.use(handler);
  // start the server with explicit host binding
  app.listen({ port, host }, (err, addr) => {
    if (err) {
      if ((err as any).code === "EADDRINUSE") {
        console.error(
          `Unable to bind to ${host}:${port}; address already in use. ` +
            `Try changing the port or stopping the conflicting process.`
        );
      } else {
        console.error("Server failed to start:", err);
      }
      process.exit(1);
    }
    console.log("✨ Server listening on %s", addr);
  });
}

process.env.FIRST = process.env.FIRST || "true";
await Start();
