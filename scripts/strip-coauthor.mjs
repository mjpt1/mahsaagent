#!/usr/bin/env node
/** Strip Co-authored-by: Cursor lines from commit messages (stdin → stdout). */
let s = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (s += d));
process.stdin.on("end", () => {
  const out = s
    .split(/\r?\n/)
    .filter((l) => !/Co-authored-by:\s*Cursor/i.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n+$/, "\n");
  process.stdout.write(out);
});
