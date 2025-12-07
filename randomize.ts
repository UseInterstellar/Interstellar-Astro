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
  preserveExtensions?: string[];
  directories?: string[];
}

class BuildObfuscator {
  private mappings = new Map<string, FileMapping>();
  private usedNames = new Set<string>();
  private root: string;
  private config: ObfuscatorConfig;

  constructor(config: ObfuscatorConfig = { enabled: true }) {
    this.root = process.cwd();
    this.config = {
      preserveExtensions: [".json", ".css", ".scss"],
      directories: ["src/components", "src/layouts", "src/lib", "src/pages"],
      ...config,
    };
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
    const directories = this.config.directories || ["src/components", "src/layouts", "src/lib", "src/pages"];

    for (const dir of directories) {
      const dirPath = path.join(this.root, dir);
      if (!fs.existsSync(dirPath)) continue;

      const files = this.findFiles(dirPath, [".astro", ".ts", ".tsx", ".js", ".jsx"]);

      for (const file of files) {
        if (path.basename(file) === "index.astro" || this.config.preserveExtensions?.includes(path.extname(file))) {
          continue;
        }

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
    const filesToUpdate = this.findFiles(path.join(this.root, "src"), [".astro", ".ts", ".tsx", ".js", ".jsx"]);

    for (const file of filesToUpdate) {
      let content = fs.readFileSync(file, "utf-8");
      let modified = false;

      for (const [originalPath, mapping] of this.mappings) {
        const originalName = path.basename(mapping.original);
        const newName = path.basename(mapping.randomized);
        const originalNameNoExt = path.basename(mapping.original, path.extname(mapping.original));
        const newNameNoExt = path.basename(mapping.randomized, path.extname(mapping.randomized));

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
              content = content.replaceAll(from, to);
              modified = true;
            }
          }
        } else {
          const relDir = path.dirname(mapping.original).replace(path.join(this.root, "src"), "");
          const componentType = relDir.includes("/components") ? "components" : relDir.includes("/layouts") ? "layouts" : relDir.includes("/lib") ? "lib" : relDir.includes("/pages") ? "pages" : null;

          if (componentType) {
            const patterns = `@/${componentType}/${this.escapeRegex(originalName)}`;
            const regex = new RegExp(`(['"\`])${patterns}(['"\`])`, "g");
            const replacement = `$1@/${componentType}/${newName}$2`;
            let newContent = content.replace(regex, replacement);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }

            const noExtPattern = `@/${componentType}/${this.escapeRegex(originalNameNoExt)}`;
            const noExtRegex = new RegExp(`(['"\`])${noExtPattern}(['"\`])`, "g");
            const noExtReplacement = `$1@/${componentType}/${newName}$2`;
            newContent = content.replace(noExtRegex, noExtReplacement);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }

            const scriptSrcPattern = `src\\s*=\\s*(['"\`])@/${componentType}/${this.escapeRegex(originalName)}\\1`;
            const scriptSrcRegex = new RegExp(scriptSrcPattern, "g");
            const scriptSrcReplacement = `src=$1@/${componentType}/${newName}$1`;
            newContent = content.replace(scriptSrcRegex, scriptSrcReplacement);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }

            const scriptSrcNoExtPattern = `src\\s*=\\s*(['"\`])@/${componentType}/${this.escapeRegex(originalNameNoExt)}\\1`;
            const scriptSrcNoExtRegex = new RegExp(scriptSrcNoExtPattern, "g");
            const scriptSrcNoExtReplacement = `src=$1@/${componentType}/${newName}$1`;
            newContent = content.replace(scriptSrcNoExtRegex, scriptSrcNoExtReplacement);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }

            const absoluteSrcPattern = `(src\\s*=\\s*['"\`])/src/${componentType}/${this.escapeRegex(originalName)}(['"\`])`;
            const absoluteSrcRegex = new RegExp(absoluteSrcPattern, "g");
            const absoluteSrcReplacement = `$1/src/${componentType}/${newName}$2`;
            newContent = content.replace(absoluteSrcRegex, absoluteSrcReplacement);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }

            const absoluteSrcNoExtPattern = `(src\\s*=\\s*['"\`])/src/${componentType}/${this.escapeRegex(originalNameNoExt)}(['"\`])`;
            const absoluteSrcNoExtRegex = new RegExp(absoluteSrcNoExtPattern, "g");
            const absoluteSrcNoExtReplacement = `$1/src/${componentType}/${newName}$2`;
            newContent = content.replace(absoluteSrcNoExtRegex, absoluteSrcNoExtReplacement);
            if (newContent !== content) {
              content = newContent;
              modified = true;
            }
          }

          const currentFileDir = path.dirname(file);
          let relativePath = path.relative(currentFileDir, mapping.original);
          relativePath = relativePath.replace(/\\/g, "/");

          if (!relativePath.startsWith(".")) {
            relativePath = `./${relativePath}`;
          }

          const regex = new RegExp(`(['"\`])${this.escapeRegex(relativePath)}(['"\`])`, "g");
          let newRelativePath = path.relative(currentFileDir, mapping.randomized);
          newRelativePath = newRelativePath.replace(/\\/g, "/");
          if (!newRelativePath.startsWith(".")) {
            newRelativePath = `./${newRelativePath}`;
          }
          
          let newContent = content.replace(regex, `$1${newRelativePath}$2`);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }

          const relativePathNoExt = relativePath.replace(path.extname(relativePath), "");
          const noExtRegex = new RegExp(`(['"\`])${this.escapeRegex(relativePathNoExt)}(['"\`])`, "g");
          const newRelativePathWithExt = newRelativePath; 
          
          newContent = content.replace(noExtRegex, `$1${newRelativePathWithExt}$2`);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }

          const scriptRelativePattern = `src\\s*=\\s*(['"\`])${this.escapeRegex(relativePath)}\\1`;
          const scriptRelativeRegex = new RegExp(scriptRelativePattern, "g");
          newContent = content.replace(scriptRelativeRegex, `src=$1${newRelativePath}$1`);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }

          const scriptRelativeNoExtPattern = `src\\s*=\\s*(['"\`])${this.escapeRegex(relativePathNoExt)}\\1`;
          const scriptRelativeNoExtRegex = new RegExp(scriptRelativeNoExtPattern, "g");
          newContent = content.replace(scriptRelativeNoExtRegex, `src=$1${newRelativePath}$1`);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }

          if (mapping.type === "route") {
            const routeReplacements = [
              { pattern: new RegExp(`(['"\`])/${this.escapeRegex(originalNameNoExt)}(['"\`])`, "g"), replacement: `$1/${newNameNoExt}$2` },
              { pattern: new RegExp(`(href\\s*=\\s*['"\`])/${this.escapeRegex(originalNameNoExt)}(['"\`])`, "g"), replacement: `$1/${newNameNoExt}$2` },
              { pattern: new RegExp(`===\\s*['"\`]/${this.escapeRegex(originalNameNoExt)}['"\`]`, "g"), replacement: `=== '/${newNameNoExt}'` },
              { pattern: new RegExp(`['"\`]/${this.escapeRegex(originalNameNoExt)}['"\`]\\s*===`, "g"), replacement: `'/${newNameNoExt}' ===` },
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
        console.log(`Renamed: ${path.relative(this.root, mapping.original)} → ${path.basename(mapping.randomized)}`);
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

    console.log(`Found ${this.mappings.size} files to obfuscate`);

    this.updateFileContents();
    this.renameFiles();

    const routeMappings: Record<string, string> = {};
    for (const [, mapping] of this.mappings) {
      if (mapping.type === "route") {
        const originalRoute = `/${path.basename(mapping.original, path.extname(mapping.original))}`;
        const newRoute = `/${path.basename(mapping.randomized, path.extname(mapping.randomized))}`;
        routeMappings[originalRoute] = newRoute;
      }
    }

    if (Object.keys(routeMappings).length > 0) {
      console.log("Routes updated:");
      for (const [old, newRoute] of Object.entries(routeMappings)) {
        console.log(`   ${old} → ${newRoute}`);
      }
    }

    console.log("Obfuscation completed!");
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
