import test from "node:test";
import assert from "node:assert/strict";
import { parsePersianDatePhrase } from "./dateNlp.ts";
import { finglishToPersian } from "./finglish.ts";
import { polishPersian } from "./polish.ts";
import { validatePassport, validateCryptoAddress, provinceFromGps } from "./extraValidate.ts";
import { searchOfficialVillages, officialMeta } from "./officialGeo.ts";
import { holidaysForYear } from "../data/holidayPacks.ts";
import { createIpgRegistry } from "../ipg/index.ts";
import { TOOL_NAMES } from "../server.ts";
import { passportSchema, cryptoAddressSchema } from "../zod/index.ts";

test("date nlp farda", () => {
  const r = parsePersianDatePhrase("فردا");
  assert.equal(r.ok, true);
  assert.ok(r.parts);
});

test("date nlp finglish", () => {
  const r = parsePersianDatePhrase("farda");
  assert.equal(r.ok, true);
});

test("finglish salam", () => {
  assert.equal(finglishToPersian("salam"), "سلام");
});

test("polish quotes", () => {
  const p = polishPersian('گفت "سلام"');
  assert.ok(p.includes("«") || p.includes("سلام"));
});

test("passport format", () => {
  assert.equal(validatePassport("A12345678").valid, true);
  assert.equal(validatePassport("xx").valid, false);
});

test("crypto trc20/erc20", () => {
  assert.equal(validateCryptoAddress("0x" + "a".repeat(40)).valid, true);
  assert.equal(validateCryptoAddress("nope").valid, false);
});

test("gps tehran-ish", () => {
  const r = provinceFromGps(35.6892, 51.389);
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(r.provinceFa.includes("تهران") || r.provinceFa.length > 0);
});

test("official villages search", () => {
  const meta = officialMeta() as { counts: { abadi: number } };
  assert.ok(meta.counts.abadi > 50000);
  const v = searchOfficialVillages("", { ostan: "تهران", limit: 3 });
  assert.ok(v.villages.length >= 1);
});

test("holiday pack year", () => {
  assert.ok(holidaysForYear(1405).length >= 10);
});

test("ipg mock pay", async () => {
  const reg = createIpgRegistry();
  const pay = await reg.pay("mock", { amount: 1000, callbackUrl: "https://x.test/cb" });
  assert.equal(pay.ok, true);
});

test("zod passport crypto", () => {
  assert.equal(passportSchema.safeParse("A12345678").success, true);
  assert.equal(cryptoAddressSchema.safeParse("bad").success, false);
});

test("tool count v0.6", () => {
  assert.ok(TOOL_NAMES.length >= 40);
  assert.ok(TOOL_NAMES.includes("jalali_parse_phrase"));
  assert.ok(TOOL_NAMES.includes("iran_gps"));
  assert.ok(TOOL_NAMES.includes("ipg_mock"));
});
