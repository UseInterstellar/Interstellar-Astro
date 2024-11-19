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

const RenamedFiles: { [key: string]: string } = {};

function RandomizeNames() {
  const pagesDir = path.join(process.cwd(), "src", "pages");
  const files = fs.readdirSync(pagesDir);

  for (const file of files) {
    if (file !== "index.astro" && file.endsWith(".astro")) {
      const randomName = `${Math.random().toString(36).slice(2, 11)}.astro`;
      const oldPath = path.join(pagesDir, file);
      const newPath = path.join(pagesDir, randomName);
      RenamedFiles[`/${file.replace(".astro", "")}`] =
        `/${randomName.replace(".astro", "")}`;
      fs.renameSync(oldPath, newPath);
    }
  }

  const AstroFiles = FindAstroFiles(process.cwd());
  for (const astroFile of AstroFiles) {
    let fileContent = fs.readFileSync(astroFile, "utf-8");

    for (const [oldName, newName] of Object.entries(RenamedFiles)) {
      const regex = new RegExp(`"${oldName}"`, "g");
      fileContent = fileContent.replace(regex, `"${newName}"`);
    }

    fs.writeFileSync(astroFile, fileContent, "utf-8");
  }
}

function FindAstroFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const resolvedFile = path.resolve(dir, file);
    const stat = fs.statSync(resolvedFile);

    if (stat?.isDirectory()) {
      results = results.concat(FindAstroFiles(resolvedFile));
    } else if (file.endsWith(".astro")) {
      results.push(resolvedFile);
    }
  }
  return results;
}

function Revert() {
  const pagesDir = path.join(process.cwd(), "src", "pages");

  for (const [oldPath, newPath] of Object.entries(RenamedFiles)) {
    fs.renameSync(
      path.join(pagesDir, `${newPath.replace("/", "")}.astro`),
      path.join(pagesDir, `${oldPath.replace("/", "")}.astro`),
    );
  }

  const AstroFiles = FindAstroFiles(process.cwd());
  for (const astroFile of AstroFiles) {
    let fileContent = fs.readFileSync(astroFile, "utf-8");

    for (const [oldName, newName] of Object.entries(RenamedFiles)) {
      const regex = new RegExp(`"${newName}"`, "g");
      fileContent = fileContent.replace(regex, `"${oldName}"`);
    }

    fs.writeFileSync(astroFile, fileContent, "utf-8");
  }
}

async function Start() {
  const FirstRun = process.env.FIRST === "true";

  if (!fs.existsSync("dist")) {
    RandomizeNames();
    console.log("Interstellar's not built yet! Building now...");
    await build({}).catch((err) => {
      console.error(err);
      process.exit(1);
    });
    Revert();

    if (FirstRun) {
      console.log("Restarting Server...");
      execSync("pnpm disable && pnpm start", { stdio: "inherit" });
      process.exit(0);
    }
  }

  const port = INConfig.port || 8080;

  const app = Fastify({
    serverFactory: (handler) =>
      createServer(handler).on("upgrade", (req, socket: Socket, head) =>
        req.url?.startsWith("/f")
          ? wisp.routeRequest(req, socket, head)
          : socket.destroy(),
      ),
  });

  await app.register(import("@fastify/compress"), {
    encodings: ["br", "gzip", "deflate"],
  });

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
  app.listen({ port }, (err, addr) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("Listening on %s", addr);
  });
}

process.env.FIRST = process.env.FIRST || "true";
await Start();
