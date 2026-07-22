import test from "node:test";
import assert from "node:assert/strict";
import { buildSampleMoadianInvoice, computeMoadianLine } from "../moadian/index.ts";
import { validateMoadianInvoiceDetailed } from "./moadianPlus.ts";
import { createPresetZodSchema, validateFormValues } from "./formBuilder.ts";
import { fixRtlSnippet } from "./rtlFix.ts";
import { extractPdfText } from "./docIndex.ts";
import { MockIpgDriver } from "../ipg/index.ts";
import { TOOL_NAMES } from "../server.ts";

test("moadian sample is valid", () => {
  const sample = buildSampleMoadianInvoice();
  const v = validateMoadianInvoiceDetailed(sample.payload);
  assert.equal(v.valid, true);
  assert.ok(v.totals.grand > 0);
});

test("moadian line math", () => {
  const line = computeMoadianLine({ sstid: "1", sstt: "x", am: 2, fee: 1000, dis: 100, vra: 10 });
  assert.equal(line.prdis, 2000);
  assert.equal(line.adis, 1900);
  assert.equal(line.vam, 190);
  assert.equal(line.tsstam, 2090);
});

test("form schema validates values", () => {
  const ok = validateFormValues("signup", {
    firstName: "علی",
    lastName: "رضایی",
    mobile: "09123456789",
    email: "a@b.co",
    password: "secret123",
  });
  assert.equal(ok.ok, true);
  const schema = createPresetZodSchema("kyc");
  assert.ok(schema.safeParse({}).success === false);
});

test("rtl fix tailwind", () => {
  const r = fixRtlSnippet('<div class="ml-4 mr-2">x</div>');
  assert.equal(r.changed, true);
  assert.ok(r.code.includes("ms-4"));
  assert.ok(r.code.includes("me-2"));
});

test("pdf extract empty buffer", () => {
  const t = extractPdfText(Buffer.from("%PDF-1.4 BT (hello) Tj ET"));
  assert.ok(t.includes("hello"));
});

test("ipg mock amount mismatch", async () => {
  const d = new MockIpgDriver();
  const pay = await d.pay({ amount: 1000, callbackUrl: "https://x.test/cb" });
  assert.equal(pay.ok, true);
  const bad = await d.verify({ authority: pay.authority!, amount: 999 });
  assert.equal(bad.ok, false);
  assert.equal(bad.error, "amount_mismatch");
});

test("tool count complete pack", () => {
  assert.equal(TOOL_NAMES.length, 64);
  assert.ok(TOOL_NAMES.includes("rtl_fix_snippet"));
});
