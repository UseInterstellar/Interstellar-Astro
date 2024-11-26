import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FilesMap: { [original: string]: string } = {};
const RouteMap: { [original: string]: string } = {};
const FaviconMap: { [original: string]: string } = {};

export function RandomizeNames(filePath: string): string {
  const extension = path.extname(filePath);
  return `${Math.random().toString(36).slice(2, 11)}${extension}`;
}

export function FindFiles(directory: string, pattern: RegExp): string[] {
  let MatchedFiles: string[] = [];
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const FullPath = path.resolve(directory, file);
    const stats = fs.statSync(FullPath);

    if (stats.isDirectory()) {
      MatchedFiles = MatchedFiles.concat(FindFiles(FullPath, pattern));
    } else if (pattern.test(file)) {
      MatchedFiles.push(FullPath);
    }
  }

  return MatchedFiles;
}

export function RandomizeFavicons() {
  const FaviconDir = path.join(
    process.cwd(),
    "public",
    "assets",
    "media",
    "favicons",
  );

  if (!fs.existsSync(FaviconDir)) {
    return;
  }

  const Favicons = fs.readdirSync(FaviconDir);

  for (const file of Favicons) {
    const OriginalPath = path.join(FaviconDir, file);
    const RandomizedName = RandomizeNames(file);
    const NewPath = path.join(FaviconDir, RandomizedName);

    fs.renameSync(OriginalPath, NewPath);
    FaviconMap[file] = RandomizedName;
  }

  UpdateFaviconRoutes();
}

export function UpdateFaviconRoutes() {
  const FilesToUpdate = [
    ...FindFiles(path.join(process.cwd(), "src"), /\.astro$/),
    ...FindFiles(path.join(process.cwd(), "src"), /\.ts$/),
  ];

  for (const file of FilesToUpdate) {
    let content = fs.readFileSync(file, "utf-8");

    for (const [OldName, RandomizedName] of Object.entries(FaviconMap)) {
      const patterns = [
        `/assets/media/favicons/${OldName}`,
        `assets/media/favicons/${OldName}`,
        `'${OldName}'`,
        `"${OldName}"`,
      ];

      for (const pattern of patterns) {
        content = content.replace(
          new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          pattern.startsWith("/")
            ? `/assets/media/favicons/${RandomizedName}`
            : pattern.startsWith("assets")
              ? `assets/media/favicons/${RandomizedName}`
              : pattern.startsWith("'")
                ? `'${RandomizedName}'`
                : `"${RandomizedName}"`,
        );
      }
    }

    fs.writeFileSync(file, content, "utf-8");
  }
}

export function Main() {
  RandomizeFavicons();

  const FilesToProcess = [
    ...FindFiles(path.join(process.cwd(), "src", "components"), /\.astro$/),
    ...FindFiles(path.join(process.cwd(), "src", "layouts"), /\.astro$/),
    ...FindFiles(path.join(process.cwd(), "src", "lib"), /\.ts$/),
    ...FindFiles(path.join(process.cwd(), "src", "pages"), /\.astro$/),
    ...FindFiles(path.join(process.cwd(), "src", "pages", "e"), /\.ts$/),
  ];

  for (const file of FilesToProcess) {
    if (path.basename(file) === "index.astro") {
      continue;
    }

    const RandomizedName = RandomizeNames(file);
    const OriginalPath = path.resolve(file);
    const NewPath = path.resolve(path.dirname(file), RandomizedName);

    FilesMap[OriginalPath] = NewPath;

    if (file.startsWith(path.join(process.cwd(), "src", "pages"))) {
      const OriginalRoute = OriginalPath.replace(
        path.join(process.cwd(), "src", "pages"),
        "",
      )
        .replace(/\\/g, "/")
        .replace(/\.astro$/, "");

      const NewRoute = NewPath.replace(path.join(process.cwd(), "src", "pages"), "")
        .replace(/\\/g, "/")
        .replace(/\.astro$/, "");

      RouteMap[OriginalRoute] = NewRoute;

      if (OriginalRoute.startsWith("/")) {
        RouteMap[OriginalRoute.substring(1)] = NewRoute.startsWith("/")
          ? NewRoute.substring(1)
          : NewRoute;
      } else {
        RouteMap[OriginalRoute] = NewRoute;
      }
    }
  }

  UpdateImports();
  UpdateRoutes();

  for (const [OriginalPath, NewPath] of Object.entries(FilesMap)) {
    fs.renameSync(OriginalPath, NewPath);
  }

  console.log("Routes updated:", RouteMap);
}

export function UpdateRoutes() {
  const FilesToUpdate = [
    ...FindFiles(path.join(process.cwd(), "src"), /\.astro$/),
    ...FindFiles(path.join(process.cwd(), "src"), /\.ts$/),
  ];

  for (const file of FilesToUpdate) {
    let content = fs.readFileSync(file, "utf-8");

    for (const [OriginalRoute, NewRoute] of Object.entries(RouteMap)) {
      const routePattern = new RegExp(`(['"\`])${OriginalRoute}(['"\`])`, "g");

      content = content.replace(routePattern, `$1${NewRoute}$2`);
    }

    fs.writeFileSync(file, content, "utf-8");
  }
}

export function UpdateImports() {
  const FilesToUpdate = [
    ...FindFiles(path.join(process.cwd(), "src"), /\.astro$/),
    ...FindFiles(path.join(process.cwd(), "src"), /\.ts$/),
  ];

  const root = process.cwd();

  for (const file of FilesToUpdate) {
    let content = fs.readFileSync(file, "utf-8");

    for (const [OriginalPath, NewPath] of Object.entries(FilesMap)) {
      const OriginalName = path.basename(OriginalPath);
      const RandomizedName = path.basename(NewPath);

      const OriginalPatterns = [
        `@/components/${OriginalName}`,
        `@/layouts/${OriginalName}`,
        `@/lib/${OriginalName}`,
        OriginalPath.replace(root, "").replace(/\\/g, "/"),
        OriginalName,
      ];

      const NewPatterns = [
        `@/components/${RandomizedName}`,
        `@/layouts/${RandomizedName}`,
        `@/lib/${RandomizedName}`,
        NewPath.replace(root, "").replace(/\\/g, "/"),
        RandomizedName,
      ];

      OriginalPatterns.forEach((pattern, index) => {
        content = content.replace(
          new RegExp(
            `['"]${pattern.replace(/\\/g, "\\\\").replace(/\./g, "\\.")}['"]`,
            "g",
          ),
          `'${NewPatterns[index]}'`,
        );
      });
    }

    fs.writeFileSync(file, content, "utf-8");
  }
}

export async function Revert() {
  try {
    console.log("Reverting Changes.");
    execSync("git restore src/ public/", { cwd: process.cwd(), stdio: "inherit" });
    execSync("git clean -fdx src/ public/", {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Revert completed.");
  } catch (error) {
    console.error(
      "Error while reverting:",
      error instanceof Error ? error.message : error,
    );
  }
}
