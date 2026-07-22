import fs from "node:fs";
import path from "node:path";
import { normalizePersian } from "./text.js";
import { finglishToPersian } from "./finglish.js";
import { persianToFinglish } from "./finglish.js";

const CODE_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".css",
  ".scss",
  ".html",
  ".md",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "tmp-iran-cities",
]);

function norm(s: string) {
  return normalizePersian(s, { digits: "en" }).toLowerCase();
}

function expandQuery(q: string) {
  const base = q.trim();
  return [...new Set([base, norm(base), finglishToPersian(base), persianToFinglish(base)])].filter(
    (x) => x.length >= 2
  );
}

function walk(root: string, maxFiles: number) {
  const files: string[] = [];
  const stack = [root];
  while (stack.length && files.length < maxFiles) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (files.length >= maxFiles) break;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!SKIP_DIRS.has(ent.name)) stack.push(full);
      } else if (CODE_EXT.has(path.extname(ent.name).toLowerCase())) {
        files.push(full);
      }
    }
  }
  return files;
}

export function searchCodebase(
  root: string,
  query: string,
  opts: { limit?: number; maxFiles?: number; contextLines?: number } = {}
) {
  const abs = path.resolve(root);
  if (!fs.existsSync(abs)) throw new Error(`Path not found: ${abs}`);
  const limit = opts.limit ?? 25;
  const maxFiles = opts.maxFiles ?? 800;
  const ctx = opts.contextLines ?? 0;
  const variants = expandQuery(query);
  const hits: Array<{
    path: string;
    line: number;
    text: string;
    matched: string;
    score: number;
  }> = [];

  for (const file of walk(abs, maxFiles)) {
    let lines: string[];
    try {
      lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    } catch {
      continue;
    }
    const rel = path.relative(abs, file).replace(/\\/g, "/");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nline = norm(line);
      for (const v of variants) {
        const nv = norm(v);
        if (nline.includes(nv)) {
          const snippet =
            ctx > 0
              ? lines
                  .slice(Math.max(0, i - ctx), i + ctx + 1)
                  .join("\n")
                  .slice(0, 800)
              : line.slice(0, 400);
          hits.push({
            path: rel,
            line: i + 1,
            text: snippet,
            matched: v,
            score: nv.length + (rel.includes(v) ? 2 : 0),
          });
          break;
        }
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return {
    root: abs,
    query,
    variants,
    count: Math.min(hits.length, limit),
    results: hits.slice(0, limit),
    scannedNote: `Best-effort scan (max ${maxFiles} files). For huge repos, narrow root or use ripgrep.`,
  };
}
