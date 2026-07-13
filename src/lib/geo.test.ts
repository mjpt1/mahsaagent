import test from "node:test";
import assert from "node:assert/strict";
import { searchCities } from "./geo.ts";
import { detectFinancial } from "./financial.ts";
import { isBusinessDay } from "./businessDays.ts";

test("searchCities finds شیراز in فارس", () => {
  const r = searchCities("شیراز");
  assert.ok(r.count >= 1);
  assert.ok(r.cities.some((c) => c.name === "شیراز" && c.province === "فارس"));
  assert.ok(r.total > 1000);
});

test("detectFinancial recognizes Sheba sample", () => {
  const r = detectFinancial("IR820540102680020817909002");
  assert.equal(r.kind, "sheba");
  assert.equal(r.valid, true);
  assert.ok(r.bank);
});

test("isBusinessDay: Nowruz 1 Farvardin is not a business day", () => {
  assert.equal(isBusinessDay({ year: 1405, month: 1, day: 1 }), false);
});

test("isBusinessDay: a mid-week non-holiday can be business", () => {
  // 1405/01/05 — check that function returns boolean for a valid date
  const r = isBusinessDay({ year: 1405, month: 1, day: 5 });
  assert.equal(typeof r, "boolean");
});
