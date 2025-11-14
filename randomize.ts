import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

interface FileMapping {
  original: string;
  randomized: string;
  type: "file" | "route" | "favicon";
}

interface ObfuscatorConfig {
  enabled: boolean;
}

class BuildObfuscator {
  private mappings = new Map<string, FileMapping>();
  private usedNames = new Set<string>();
  private root: string;
  private config: ObfuscatorConfig;

  constructor(config: ObfuscatorConfig = { enabled: true }) {
    this.root = process.cwd();
    this.config = config;
  }

  private generateName(extension: string, isRoute: boolean = false): string {
    let name: string;

    do {
      if (isRoute) {
        name = this.generateRealisticRouteName();
      } else {
        const strategy = Math.random();

        if (strategy < 0.25) {
          const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          name = chars[Math.floor(Math.random() * chars.length)];
        } else if (strategy < 0.5) {
          const length = Math.floor(Math.random() * 3) + 2;
          name = crypto.randomBytes(length).toString("base64url").slice(0, length);
        } else if (strategy < 0.75) {
          const length = Math.floor(Math.random() * 8) + 5;
          name = crypto.randomBytes(length).toString("base64url").slice(0, length);
        } else {
          const segments = [crypto.randomBytes(4).toString("hex"), crypto.randomBytes(2).toString("hex"), crypto.randomBytes(2).toString("hex"), crypto.randomBytes(2).toString("hex"), crypto.randomBytes(6).toString("hex")];
          name = segments.join("-");
        }
      }
    } while (this.usedNames.has(name));

    this.usedNames.add(name);

    return `${name}${extension}`;
  }

  private generateRealisticRouteName(): string {
    const routeStyles = [
      () =>
        this.pickRandom([
          "dashboard",
          "profile",
          "settings",
          "account",
          "preferences",
          "notifications",
          "messages",
          "inbox",
          "archive",
          "favorites",
          "history",
          "activity",
          "analytics",
          "reports",
          "downloads",
          "uploads",
          "gallery",
          "library",
          "collection",
          "playlist",
          "workspace",
          "projects",
          "tasks",
          "calendar",
          "schedule",
          "contacts",
          "teams",
          "members",
          "groups",
          "communities",
          "explore",
          "discover",
          "trending",
          "featured",
          "popular",
          "search",
          "results",
          "filter",
          "sort",
          "categories",
          "tags",
          "labels",
          "bookmarks",
          "saved",
          "drafts",
          "published",
          "pending",
          "reviews",
          "feedback",
          "support",
          "help",
          "docs",
          "guides",
          "tutorials",
          "faq",
        ]),

      () => {
        const part1 = this.pickRandom(["user", "admin", "my", "view", "edit", "new", "create"]);
        const part2 = this.pickRandom(["profile", "settings", "dashboard", "content", "posts", "items"]);
        return `${part1}-${part2}`;
      },

      () => {
        const prefix = this.pickRandom(["item", "post", "page", "doc", "file", "media"]);
        const id = Math.floor(Math.random() * 10000);
        return `${prefix}-${id}`;
      },

      () => {
        const length = Math.floor(Math.random() * 2) + 2;
        return crypto.randomBytes(length).toString("hex").slice(0, length);
      },

      () => this.pickRandom(["login", "logout", "signup", "register", "reset", "verify", "confirm", "activate", "deactivate", "delete", "create", "update", "edit", "remove", "add"]),
    ];

    const generator = this.pickRandom(routeStyles);
    return generator();
  }

  private pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private findFiles(directory: string, extensions: string[]): string[] {
    const results: string[] = [];

    if (!fs.existsSync(directory)) return results;

    const traverse = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.includes(path.extname(entry.name))) {
          results.push(fullPath);
        }
      }
    };

    traverse(directory);
    return results;
  }

  private processFavicons(): void {
    const faviconDir = path.join(this.root, "public", "assets", "media", "favicons");

    if (!fs.existsSync(faviconDir)) return;

    const favicons = fs.readdirSync(faviconDir);

    for (const file of favicons) {
      const originalPath = path.join(faviconDir, file);
      const randomizedName = this.generateName(path.extname(file));
      const newPath = path.join(faviconDir, randomizedName);

      this.mappings.set(originalPath, {
        original: originalPath,
        randomized: newPath,
        type: "favicon",
      });
    }
  }

  private processSourceFiles(): void {
    const directories = ["src/components", "src/layouts", "src/lib", "src/pages"];

    for (const dir of directories) {
      const dirPath = path.join(this.root, dir);
      if (!fs.existsSync(dirPath)) continue;

      const files = this.findFiles(dirPath, [".astro", ".ts"]);

      for (const file of files) {
        if (path.basename(file) === "index.astro") continue;

        const isRoute = file.includes("/pages/");
        const randomizedName = this.generateName(path.extname(file), isRoute);
        const newPath = path.join(path.dirname(file), randomizedName);

        const mapping: FileMapping = {
          original: file,
          randomized: newPath,
          type: isRoute ? "route" : "file",
        };

        this.mappings.set(file, mapping);
      }
    }
  }

  private updateFileContents(): void {
    const filesToUpdate = this.findFiles(path.join(this.root, "src"), [".astro", ".ts"]);

    for (const file of filesToUpdate) {
      let content = fs.readFileSync(file, "utf-8");
      let modified = false;

      for (const [originalPath, mapping] of this.mappings) {
        const originalName = path.basename(mapping.original);
        const newName = path.basename(mapping.randomized);

        if (mapping.type === "favicon") {
          const faviconName = path.basename(originalPath);
          const patterns = [
            { from: `/assets/media/favicons/${faviconName}`, to: `/assets/media/favicons/${newName}` },
            { from: `assets/media/favicons/${faviconName}`, to: `assets/media/favicons/${newName}` },
            { from: `'${faviconName}'`, to: `'${newName}'` },
            { from: `"${faviconName}"`, to: `"${newName}"` },
          ];

          for (const { from, to } of patterns) {
            if (content.includes(from)) {
              content = content.replace(new RegExp(this.escapeRegex(from), "g"), to);
              modified = true;
            }
          }
        } else {
          const relDir = path.dirname(mapping.original).replace(path.join(this.root, "src"), "");
          const componentType = relDir.includes("/components") ? "components" : relDir.includes("/layouts") ? "layouts" : relDir.includes("/lib") ? "lib" : null;

          if (componentType) {
            const aliasPattern = `@/${componentType}/${this.escapeRegex(originalName)}`;
            const regex = new RegExp(`(['"\`])${aliasPattern}(['"\`])`, "g");
            const newContent = content.replace(regex, `$1@/${componentType}/${newName}$2`);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }
          }

          if (mapping.type === "route") {
            const originalFileName = path.basename(mapping.original, path.extname(mapping.original));
            const newFileName = path.basename(mapping.randomized, path.extname(mapping.randomized));

            const routeReplacements = [
              { pattern: new RegExp(`(['"\`])/${this.escapeRegex(originalFileName)}(['"\`])`, "g"), replacement: `$1/${newFileName}$2` },
              { pattern: new RegExp(`(href\\s*=\\s*['"\`])/${this.escapeRegex(originalFileName)}(['"\`])`, "g"), replacement: `$1/${newFileName}$2` },
            ];

            for (const { pattern, replacement } of routeReplacements) {
              const newContent = content.replace(pattern, replacement);
              if (newContent !== content) {
                content = newContent;
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        fs.writeFileSync(file, content, "utf-8");
      }
    }
  }

  private renameFiles(): void {
    const sortedMappings = Array.from(this.mappings.values()).sort((a, b) => b.original.split(path.sep).length - a.original.split(path.sep).length);

    for (const mapping of sortedMappings) {
      if (fs.existsSync(mapping.original)) {
        fs.renameSync(mapping.original, mapping.randomized);
      }
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  public async obfuscate(): Promise<void> {
    if (!this.config.enabled) {
      console.log("Build obfuscation is disabled in config.");
      return;
    }

    console.log("Starting build obfuscation...");

    this.processFavicons();
    this.processSourceFiles();
    this.updateFileContents();
    this.renameFiles();

    const routeMappings: Record<string, string> = {};
    for (const [, mapping] of this.mappings) {
      if (mapping.type === "route") {
        const originalRoute = "/" + path.basename(mapping.original, path.extname(mapping.original));
        const newRoute = "/" + path.basename(mapping.randomized, path.extname(mapping.randomized));
        routeMappings[originalRoute] = newRoute;
      }
    }

    console.log("Routes updated:", routeMappings);
  }

  public async revert(): Promise<void> {
    try {
      console.log("Reverting changes...");
      execSync("git restore src/ public/", { cwd: this.root, stdio: "inherit" });
      execSync("git clean -fdx src/ public/", { cwd: this.root, stdio: "inherit" });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Revert completed.");
    } catch (error) {
      console.error("Error while reverting:", error instanceof Error ? error.message : error);
      throw error;
    }
  }
}

export async function Main(config?: ObfuscatorConfig): Promise<void> {
  const obfuscator = new BuildObfuscator(config);
  await obfuscator.obfuscate();
}

export async function Revert(): Promise<void> {
  const obfuscator = new BuildObfuscator();
  await obfuscator.revert();
}

export default BuildObfuscator;
