import test from "node:test";
import assert from "node:assert/strict";
import { indexLocalDocs, searchLocalDocs } from "./docIndex.ts";
import { searchCodebase } from "./codeSearch.ts";
import { explainErrorText, explainStackTrace } from "./errorExplain.ts";
import { extractWithPattern, listRegexPatterns } from "./regexPack.ts";
import { normalizeDevFinglish } from "./finglishDev.ts";
import { generateMockUserProfile, generateTestDataBatch } from "./userProfile.ts";
import { lintRtlSnippet } from "./rtlLint.ts";
import { labelForField } from "./schemaLabels.ts";
import { TOOL_NAMES } from "../server.ts";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("regex pack lists patterns", () => {
  assert.ok(listRegexPatterns().length >= 6);
  const r = extractWithPattern("mobile", "call 09123456789 ok");
  assert.equal(r.count, 1);
});

test("error explain econnrefused", () => {
  const r = explainErrorText("Error: connect ECONNREFUSED 127.0.0.1:3847");
  assert.ok(r.count >= 1);
  assert.ok(r.matches[0]?.titleFa.includes("اتصال"));
});

test("stacktrace explain", () => {
  const r = explainStackTrace("TypeError: x is not a function\n    at main (app.js:10:5)");
  assert.ok(r.headline.includes("TypeError"));
});

test("finglish dev normalize", () => {
  const r = normalizeDevFinglish("commit push sheba", "fa");
  assert.ok(r.normalizedFa.includes("کامیت") || r.normalizedFa.length > 3);
});

test("mock user profile", () => {
  const r = generateMockUserProfile(42);
  assert.equal(r.profile.nationalId.length, 10);
  assert.match(r.profile.mobile, /^09\d{9}$/);
});

test("test data batch", () => {
  const r = generateTestDataBatch("mobiles", 3, 1);
  assert.equal(r.items.length, 3);
});

test("rtl lint tailwind", () => {
  const r = lintRtlSnippet('<div class="ml-4 mr-2">x</div>', "html");
  assert.ok(r.issueCount >= 1);
});

test("schema label nationalId", () => {
  assert.equal(labelForField("nationalId").label, "کد ملی");
});

test("local doc index and search", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mahsa-doc-"));
  fs.writeFileSync(path.join(tmp, "readme.md"), "# تست\nاین یک سند فارسی برای جستجو است.\n");
  const idx = indexLocalDocs(tmp);
  assert.equal(idx.fileCount, 1);
  const hits = searchLocalDocs("فارسی", { root: tmp });
  assert.ok("count" in hits && hits.count >= 1);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("codebase search in repo", () => {
  const r = searchCodebase(repoRoot, "jalali_today", { limit: 5, maxFiles: 200 });
  assert.ok(r.results.length >= 1);
});

test("tool count v0.7", () => {
  assert.equal(TOOL_NAMES.length, 64);
  assert.ok(TOOL_NAMES.includes("local_doc_index"));
  assert.ok(TOOL_NAMES.includes("codebase_search"));
});
