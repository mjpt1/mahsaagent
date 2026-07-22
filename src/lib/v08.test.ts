import test from "node:test";
import assert from "node:assert/strict";
import { completeAddressForm } from "./addressForm.ts";
import { parsePersianSchedulePhrase } from "./schedulerNlp.ts";
import { validateMoadianInvoiceDetailed, explainMoadianField } from "./moadianPlus.ts";
import { adviseIpgIntegration, simulateIpgFlow } from "./ipgAdvisor.ts";
import { syncBankFormFields } from "./bankingSync.ts";
import { buildPersianFormSchema, listFormPresets } from "./formBuilder.ts";
import { getBusinessRules, calcSampleOrder } from "./businessRules.ts";
import { TOOL_NAMES } from "../server.ts";

test("address complete from postal", () => {
  const r = completeAddressForm({ postalCode: "1134567890" });
  assert.ok(r.suggestions.length >= 1 || r.filled.province);
});

test("schedule parse with time", () => {
  const r = parsePersianSchedulePhrase("پس‌فردا ساعت 3");
  assert.equal(r.ok, true);
  assert.ok(r.time);
  assert.ok(r.isoLocal?.includes("T"));
});

test("moadian validate missing fields", () => {
  const r = validateMoadianInvoiceDetailed({
    header: { indatim: "2026-01-01", inty: 1, inp: 1, inso: 1, tins: "" },
    body: [],
  });
  assert.equal(r.valid, false);
  assert.ok(r.fieldErrors.length > 0);
});

test("moadian explain field", () => {
  const r = explainMoadianField("header.tins");
  assert.ok(r.labelFa.includes("اقتصادی"));
});

test("ipg advise zarinpal", () => {
  const r = adviseIpgIntegration({ gateway: "zarinpal" });
  assert.equal(r.selected?.id, "zarinpal");
  assert.ok(r.integrationSteps.length >= 2);
});

test("ipg simulate mock", async () => {
  const r = await simulateIpgFlow({ amount: 10000, callbackUrl: "https://example.test/cb" });
  assert.equal(r.ok, true);
});

test("bank form sync parsian card", () => {
  const r = syncBankFormFields({
    card: "6219861034529007",
    sheba: "IR820540102680020817909002",
  });
  assert.ok(r.normalized.bank);
});

test("form schema checkout", () => {
  const r = buildPersianFormSchema("checkout");
  assert.ok(r.fields.includes("mobile"));
  assert.ok(listFormPresets().length >= 5);
});

test("business rules shop", () => {
  const r = getBusinessRules("shop");
  assert.ok("payment" in r);
  const order = calcSampleOrder({ subtotalToman: 1000000, discountPercent: 10 });
  assert.ok(order.totalToman > order.afterDiscountToman);
});

test("tool count v0.8", () => {
  assert.equal(TOOL_NAMES.length, 64);
  assert.ok(TOOL_NAMES.includes("iran_address_complete"));
  assert.ok(TOOL_NAMES.includes("jalali_schedule_parse"));
  assert.ok(TOOL_NAMES.includes("iran_business_rules"));
});
