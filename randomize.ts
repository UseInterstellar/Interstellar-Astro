import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RenamedFiles: { [key: string]: string } = {};
const PageRoutes: { [key: string]: string } = {};

export function randomizeName(filePath: string): string {
  const extname = path.extname(filePath);
  return `${Math.random().toString(36).slice(2, 11)}${extname}`;
}

export function findFiles(dir: string, filePattern: RegExp): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const resolvedFile = path.resolve(dir, file);
    const stat = fs.statSync(resolvedFile);

    if (stat.isDirectory()) {
      results = results.concat(findFiles(resolvedFile, filePattern));
    } else if (filePattern.test(file)) {
      results.push(resolvedFile);
    }
  }

  return results;
}

export function RandomizeNames() {
  const filesToRename = [
    ...findFiles(path.join(process.cwd(), "src", "components"), /\.astro$/),
    ...findFiles(path.join(process.cwd(), "src", "layouts"), /\.astro$/),
    ...findFiles(path.join(process.cwd(), "src", "lib"), /\.ts$/),
    ...findFiles(path.join(process.cwd(), "src", "pages"), /\.astro$/),
    ...findFiles(path.join(process.cwd(), "src", "pages", "e"), /\.ts$/),
  ];

  for (const file of filesToRename) {
    if (path.basename(file) === "index.astro") {
      continue;
    }

    const newName = randomizeName(file);
    const oldPath = path.resolve(file);
    const newPath = path.resolve(path.dirname(file), newName);
    RenamedFiles[oldPath] = newPath;
    fs.renameSync(oldPath, newPath);

    if (file.startsWith(path.join(process.cwd(), "src", "pages"))) {
      const oldRoute = oldPath
        .replace(`${process.cwd()}/src/pages`, "")
        .replace(/\\/g, "/");
      const newRoute = newPath
        .replace(`${process.cwd()}/src/pages`, "")
        .replace(/\\/g, "/");
      PageRoutes[oldRoute] = newRoute;
    }
  }

  updateImports();
  updatePageRoutes();
}

export function updateImports() {
  const allFiles = [
    ...findFiles(path.join(process.cwd(), "src"), /\.astro$/),
    ...findFiles(path.join(process.cwd(), "src"), /\.ts$/),
  ];

  for (const file of allFiles) {
    let fileContent = fs.readFileSync(file, "utf-8");
    const rootPath = process.cwd();

    for (const [oldPath, newPath] of Object.entries(RenamedFiles)) {
      const oldImportPathAlias = oldPath
        .replace(`${rootPath}/src/components`, "@/components")
        .replace(`${rootPath}/src/layouts`, "@/layouts")
        .replace(`${rootPath}/src/lib`, "@/lib")
        .replace(/\\/g, "/");

      const newImportPathAlias = newPath
        .replace(`${rootPath}/src/components`, "@/components")
        .replace(`${rootPath}/src/layouts`, "@/layouts")
        .replace(`${rootPath}/src/lib`, "@/lib")
        .replace(/\\/g, "/");

      const oldImportPathAbs = oldPath.replace(rootPath, "").replace(/\\/g, "/");

      const newImportPathAbs = newPath.replace(rootPath, "").replace(/\\/g, "/");

      fileContent = fileContent.replace(
        new RegExp(`['"]${oldImportPathAlias}['"]`, "g"),
        `'${newImportPathAlias}'`,
      );
      fileContent = fileContent.replace(
        new RegExp(`['"]${oldImportPathAbs}['"]`, "g"),
        `'${newImportPathAbs}'`,
      );
    }

    fs.writeFileSync(file, fileContent, "utf-8");
  }
}

export function updatePageRoutes() {
  const allFiles = [
    ...findFiles(path.join(process.cwd(), "src"), /\.astro$/),
    ...findFiles(path.join(process.cwd(), "src"), /\.ts$/),
  ];

  for (const file of allFiles) {
    let fileContent = fs.readFileSync(file, "utf-8");

    for (const [oldRoute, newRoute] of Object.entries(PageRoutes)) {
      fileContent = fileContent.replace(
        new RegExp(`['"]${oldRoute.replace(".astro", "")}['"]`, "g"),
        `'${newRoute.replace(".astro", "")}'`,
      );
    }

    fs.writeFileSync(file, fileContent, "utf-8");
  }
}

export function renameEDirectory() {
  const eDirPath = path.join(process.cwd(), "src", "pages", "e");
  if (fs.existsSync(eDirPath)) {
    const newEDirName = `/${Math.random().toString(36).slice(2, 6)}`;
    const newEDirPath = path.join(process.cwd(), "src", "pages", newEDirName);
    fs.renameSync(eDirPath, newEDirPath);
  }
}

export async function Revert() {
  try {
    console.log("Reverting Changes.");
    execSync("git restore src/", { cwd: process.cwd(), stdio: "inherit" });
    execSync("git clean -fdx src/", { cwd: process.cwd(), stdio: "inherit" });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Revert completed.");
  } catch (error) {
    console.error(
      "Error during revert:",
      error instanceof Error ? error.message : error,
    );
  }
}

updateImports();
