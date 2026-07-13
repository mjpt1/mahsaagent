import test from "node:test";
import assert from "node:assert/strict";
import { accountToSheba, shebaToAccount } from "./shebaConvert.ts";
import { generateTestNationalId, generateTestSheba, validateLegalIdDetailed } from "./generators.ts";
import { convertMoney, bankRound, formatMoneyFa } from "./currency.ts";
import { polishPersian } from "./polish.ts";
import { addressCascade, listCounties } from "./address.ts";
import { searchVillages } from "./villages.ts";
import { MockSmsProvider, generateOtp, buildOtpMessage } from "./sms.ts";
import { buildMoadianInvoice, moadianSetupGuide } from "../moadian/index.ts";
import { nationalIdSchema } from "../zod/index.ts";
import { TOOL_NAMES } from "../server.ts";
import { validateNationalId } from "./text.ts";
import { eventsForYear } from "../data/events.ts";

test("sheba round-trip account", () => {
  const built = accountToSheba("054", "102680020817909002");
  assert.equal(built.ok, true);
  assert.ok(built.sheba?.startsWith("IR"));
  const back = shebaToAccount(built.sheba!);
  assert.equal(back.ok, true);
  assert.equal(back.bankCode, "054");
});

test("generate test national id validates", () => {
  const id = generateTestNationalId(42);
  assert.equal(validateNationalId(id).valid, true);
});

test("generate test sheba", () => {
  const s = generateTestSheba("012", 99);
  assert.ok(s.startsWith("IR"));
  assert.equal(shebaToAccount(s).ok, true);
});

test("legal id detailed length", () => {
  const r = validateLegalIdDetailed("123");
  assert.equal(r.valid, false);
  assert.equal(r.reason, "length_must_be_11");
});

test("money rial toman", () => {
  assert.equal(bankRound(10.6), 11);
  const c = convertMoney(10000, "toman", "rial");
  assert.equal(c.value, 100000);
  assert.ok(formatMoneyFa(1000, "toman").includes("تومان"));
});

test("polish persian punctuation", () => {
  const p = polishPersian("سلام ,دنیا?");
  assert.ok(p.includes("،"));
  assert.ok(p.includes("؟"));
});

test("address cascade counties", () => {
  const a = addressCascade({ province: "تهران" });
  assert.ok(a.counties.length > 0);
  assert.ok(listCounties("فارس").count > 0);
});

test("villages search", () => {
  const v = searchVillages("", { province: "تهران", limit: 5 });
  assert.ok(v.villages.length >= 1);
});

test("sms mock", async () => {
  const otp = generateOtp(6, 1);
  assert.equal(otp.length, 6);
  const provider = new MockSmsProvider();
  const msg = { ...buildOtpMessage(otp), to: "09121234567" };
  const r = await provider.send(msg);
  assert.equal(r.ok, true);
});

test("moadian stub", () => {
  assert.ok(moadianSetupGuide().includes("Moadian"));
  const built = buildMoadianInvoice({
    header: { indatim: "2026-01-01", inty: 1, inp: 1, inso: 1, tins: "123" },
    body: [{ sstid: "1", sstt: "x", am: 1, fee: 1, prdis: 1, dis: 0, adis: 1, vra: 9, vam: 0, tsstam: 1 }],
  });
  assert.equal(built.warnings.length, 0);
});

test("zod fa message", () => {
  const r = nationalIdSchema.safeParse("0000000000");
  assert.equal(r.success, false);
  if (!r.success) assert.ok(r.error.issues[0]?.message.includes("کد ملی") || r.error.issues[0]?.message.length > 0);
});

test("religious events expanded", () => {
  const ev = eventsForYear(1405);
  assert.ok(ev.length >= 8);
});

test("tool count v0.5", () => {
  assert.ok(TOOL_NAMES.length >= 30);
  assert.ok(TOOL_NAMES.includes("persian_sheba_convert"));
  assert.ok(TOOL_NAMES.includes("moadian_invoice"));
  assert.ok(TOOL_NAMES.includes("iran_address"));
});
