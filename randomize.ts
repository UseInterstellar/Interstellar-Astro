import fs from "node:fs";
import path from "node:path";

export const RenamedFiles: { [key: string]: string } = {};

export function RandomizeNames() {
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

export function FindAstroFiles(dir: string): string[] {
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

export function Revert() {
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
