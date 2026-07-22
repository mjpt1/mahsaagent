import fs from "node:fs";
import path from "node:path";
import { normalizePersian } from "./text.js";
import { finglishToPersian, persianToFinglish } from "./finglish.js";

export type DocChunk = {
  path: string;
  line: number;
  text: string;
  norm: string;
};

type DocIndex = {
  root: string;
  indexedAt: string;
  fileCount: number;
  chunkCount: number;
  chunks: DocChunk[];
  pdfFiles: number;
};

const indexes = new Map<string, DocIndex>();

const DEFAULT_EXT = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".pdf",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".turbo",
  "tmp-iran-cities",
]);

function normText(s: string) {
  return normalizePersian(s, { digits: "en" }).toLowerCase();
}

function queryVariants(q: string) {
  const base = q.trim();
  const set = new Set<string>([base, normText(base)]);
  set.add(finglishToPersian(base));
  set.add(persianToFinglish(base));
  return [...set].filter(Boolean);
}

/** Best-effort PDF text: BT/ET operators + printable runs (no external PDF lib). */
export function extractPdfText(buf: Buffer): string {
  const raw = buf.toString("latin1");
  const parts: string[] = [];
  const bt = /BT([\s\S]*?)ET/g;
  let m: RegExpExecArray | null;
  while ((m = bt.exec(raw))) {
    const block = m[1] ?? "";
    const tj = /\((?:\\.|[^\\)])*\)\s*Tj/g;
    let t: RegExpExecArray | null;
    while ((t = tj.exec(block))) {
      const tok = t[0].replace(/\s*Tj$/, "");
      if (tok.startsWith("(") && tok.endsWith(")")) {
        parts.push(
          tok
            .slice(1, -1)
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\\\/g, "\\")
        );
      }
    }
  }
  if (!parts.length) {
    const runs = raw.match(/[\x20-\x7E\u0600-\u06FF]{4,}/g);
    if (runs) parts.push(...runs.slice(0, 800));
  }
  return parts.join("\n").slice(0, 200_000);
}

function walkFiles(root: string, exts: Set<string>, maxFiles: number): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length && out.length < maxFiles) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (out.length >= maxFiles) break;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!SKIP_DIRS.has(ent.name)) stack.push(full);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (exts.has(ext)) out.push(full);
      }
    }
  }
  return out;
}

function chunkFile(filePath: string, root: string): DocChunk[] {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  const ext = path.extname(filePath).toLowerCase();
  let raw: string;
  try {
    if (ext === ".pdf") {
      raw = extractPdfText(fs.readFileSync(filePath));
      if (!raw.trim()) {
        return [
          {
            path: rel,
            line: 1,
            text: "[PDF has little extractable text — may be scanned/image-only]",
            norm: "",
          },
        ];
      }
    } else {
      raw = fs.readFileSync(filePath, "utf8");
    }
  } catch {
    return [];
  }
  return raw.split(/\r?\n/).map((text, i) => ({
    path: rel,
    line: i + 1,
    text: text.slice(0, 500),
    norm: normText(text),
  }));
}

export function indexLocalDocs(
  root: string,
  opts: { extensions?: string[]; maxFiles?: number } = {}
) {
  const abs = path.resolve(root);
  if (!fs.existsSync(abs)) {
    throw new Error(`Path not found: ${abs}`);
  }
  const exts = opts.extensions?.length
    ? new Set(opts.extensions.map((e) => (e.startsWith(".") ? e : `.${e}`).toLowerCase()))
    : DEFAULT_EXT;
  const maxFiles = opts.maxFiles ?? 500;
  const files = walkFiles(abs, exts, maxFiles);
  const pdfFiles = files.filter((f) => path.extname(f).toLowerCase() === ".pdf").length;
  const chunks = files.flatMap((f) => chunkFile(f, abs));
  const index: DocIndex = {
    root: abs,
    indexedAt: new Date().toISOString(),
    fileCount: files.length,
    chunkCount: chunks.length,
    chunks,
    pdfFiles,
  };
  indexes.set(abs, index);
  return {
    root: abs,
    fileCount: index.fileCount,
    chunkCount: index.chunkCount,
    pdfFiles,
    indexedAt: index.indexedAt,
    note:
      pdfFiles > 0
        ? "PDF text extracted best-effort (text PDFs). Scanned PDFs need OCR outside Mahsaagent."
        : "Indexed md/txt/ts/json (+ pdf when present).",
  };
}

export function searchLocalDocs(
  query: string,
  opts: { root?: string; limit?: number } = {}
) {
  const limit = opts.limit ?? 20;
  const variants = queryVariants(query);
  const results: Array<DocChunk & { score: number; matched: string }> = [];

  const searchOne = (index: DocIndex) => {
    for (const ch of index.chunks) {
      for (const v of variants) {
        const nv = normText(v);
        if (!nv || nv.length < 2) continue;
        if (ch.norm.includes(nv)) {
          results.push({ ...ch, score: nv.length, matched: v });
          break;
        }
      }
    }
  };

  if (opts.root) {
    const idx = indexes.get(path.resolve(opts.root));
    if (!idx) {
      return { error: "not_indexed", hint: "Call local_doc_index first with this root path." };
    }
    searchOne(idx);
  } else {
    for (const idx of indexes.values()) searchOne(idx);
  }

  results.sort((a, b) => b.score - a.score);
  const sliced = results.slice(0, limit);
  return {
    query,
    variants,
    count: sliced.length,
    results: sliced.map(({ path: p, line, text, matched }) => ({ path: p, line, text, matched })),
  };
}

export function listDocIndexes() {
  return [...indexes.values()].map((i) => ({
    root: i.root,
    fileCount: i.fileCount,
    chunkCount: i.chunkCount,
    pdfFiles: i.pdfFiles,
    indexedAt: i.indexedAt,
  }));
}
