import fs from "node:fs";
import { createServer } from "node:http";
import type { Socket } from "node:net";
import path from "node:path";
import fastifyMiddie from "@fastify/middie";
import fastifyStatic from "@fastify/static";
// @ts-expect-error shut
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { build } from "astro";
import Fastify from "fastify";
import inConfig from "./config";
const port = Number.parseInt(process.env.PORT as string) || inConfig.port || 8080;
const app = Fastify({
  serverFactory: (handler) =>
    createServer(handler).on("upgrade", (req, socket: Socket, head) =>
      req.url?.startsWith("/f")
        ? wisp.routeRequest(req, socket, head)
        : socket.destroy(),
    ),
});
if (!fs.existsSync("dist")) {
  console.log("Interstellar's not built yet! Building now...");
  await build({}).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
await app.register(import("@fastify/compress"), {
  encodings: ["br", "gzip", "deflate"],
});
if (inConfig.auth?.challenge) {
  await app.register(import("@fastify/basic-auth"), {
    authenticate: true,
    validate(username, password, _req, _reply, done) {
      for (const [user, pass] of Object.entries(inConfig.auth?.users || {})) {
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
app.listen({ port }, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Listening on %s", addr);
});
