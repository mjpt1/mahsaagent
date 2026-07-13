import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src", "data");
const destDir = path.join(root, "dist", "data");

function copyRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else if (entry.name.endsWith(".json")) fs.copyFileSync(s, d);
  }
}

copyRecursive(srcDir, destDir);
const count = (dir) => {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) n += count(path.join(dir, e.name));
    else if (e.name.endsWith(".json")) n++;
  }
  return n;
};
console.log(`Copied ${count(destDir)} JSON file(s) → dist/data/`);
