import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src", "data");
const destDir = path.join(root, "dist", "data");

fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".json"));
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}

console.log(`Copied ${files.length} JSON file(s) → dist/data/`);
