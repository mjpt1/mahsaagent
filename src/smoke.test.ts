import test from "node:test";
import assert from "node:assert/strict";
import {
  gregorianToJalali,
  jalaliToGregorian,
  formatJalali,
  formatJalaliLong,
  isValidJalali,
  parseJalaliString,
  addJalaliDays,
  diffJalaliDays,
} from "./lib/jalali.ts";
import { jalaliMonthCalendar, summarizeMonth } from "./lib/calendar.ts";
import {
  normalizePersian,
  validateNationalId,
  validateSheba,
  validatePostalCode,
  slugifyPersian,
  convertDigits,
  amountToPersianWords,
  formatAmountFa,
  wordsToAmount,
  batchValidate,
  listOrFindProvinces,
} from "./lib/text.ts";
import { integerToPersianWords } from "./lib/numberWords.ts";
import { persianWordsToInteger } from "./lib/wordsToNumber.ts";
import { solarHolidaysOn } from "./data/holidays.ts";
import { PROVINCES } from "./data/provinces.ts";
import { TOOL_NAMES } from "./server.ts";

test("Nowruz 1403 is 2024-03-20", () => {
  const j = gregorianToJalali(2024, 3, 20);
  assert.equal(j.year, 1403);
  assert.equal(j.month, 1);
  assert.equal(j.day, 1);
});

test("jalali round-trip", () => {
  const g = jalaliToGregorian(1403, 1, 1);
  const j = gregorianToJalali(g.year, g.month, g.day);
  assert.deepEqual(j, { year: 1403, month: 1, day: 1 });
});

test("formatJalali fa digits", () => {
  assert.equal(
    formatJalali({ year: 1403, month: 1, day: 1 }, { digits: "fa" }),
    "۱۴۰۳/۰۱/۰۱"
  );
});

test("formatJalaliLong includes month name", () => {
  const s = formatJalaliLong({ year: 1403, month: 1, day: 1 }, { digits: "fa" });
  assert.ok(s.includes("فروردین"));
});

test("parseJalaliString", () => {
  assert.deepEqual(parseJalaliString("۱۴۰۳/۰۱/۰۱"), { year: 1403, month: 1, day: 1 });
  assert.equal(parseJalaliString("nope"), null);
});

test("add/diff days", () => {
  const a = { year: 1403, month: 1, day: 1 };
  const b = addJalaliDays(a, 10);
  assert.equal(diffJalaliDays(b, a), 10);
});

test("isValidJalali", () => {
  assert.equal(isValidJalali(1403, 1, 1), true);
  assert.equal(isValidJalali(1403, 12, 31), false);
});

test("solar holiday Nowruz", () => {
  assert.ok(solarHolidaysOn(1, 1).length >= 1);
});

test("month calendar Farvardin has 31 days", () => {
  const cal = jalaliMonthCalendar(1403, 1, "en");
  assert.ok(!("error" in cal));
  if (!("error" in cal)) assert.equal(cal.days.length, 31);
  const sum = summarizeMonth(1403, 1);
  assert.ok(!("error" in sum));
  if (!("error" in sum)) assert.ok(sum.holidayCount >= 5);
});

test("normalizePersian ye/kaf", () => {
  const out = normalizePersian("علي", { halfSpace: false });
  assert.ok(out.length > 0);
});

test("national id sample", () => {
  const r = validateNationalId("0499370899");
  assert.equal(r.valid, true);
});

test("sheba sample", () => {
  const r = validateSheba("IR820540102680020817909002");
  assert.equal(r.valid, true);
});

test("postal code", () => {
  assert.equal(validatePostalCode("1234567890").valid, true);
  assert.equal(validatePostalCode("0123456789").valid, false);
});

test("slugify", () => {
  const s = slugifyPersian("سلام دنیا");
  assert.ok(s.includes("سلام"));
});

test("digits", () => {
  assert.equal(convertDigits("123", "en_to_fa"), "۱۲۳");
});

test("amount words", () => {
  assert.equal(integerToPersianWords(0), "صفر");
  assert.ok(amountToPersianWords(1234567).includes("میلیون"));
  assert.ok(formatAmountFa(1234567).includes("۱"));
});

test("words to number", () => {
  assert.equal(persianWordsToInteger("یک میلیون"), 1_000_000);
  assert.equal(wordsToAmount("دویست و سی").value, 230);
});

test("batch validate", () => {
  const r = batchValidate([
    { kind: "national_id", value: "0499370899" },
    { kind: "postal_code", value: "0123" },
  ]);
  assert.equal(r[0]!.valid, true);
  assert.equal(r[1]!.valid, false);
});

test("provinces", () => {
  assert.equal(PROVINCES.length, 31);
  assert.ok(listOrFindProvinces("تهران").count >= 1);
});

test("tool count", () => {
  assert.ok(TOOL_NAMES.length >= 18);
});
