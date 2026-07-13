import test from "node:test";
import assert from "node:assert/strict";
import { postalToPlace, landlineToPlace, nationalIdToPlace } from "./extraValidate.ts";
import { validateBankTerminalInput } from "./shebaConvert.ts";
import { searchVillages } from "./villages.ts";
import { parsePersianDatePhrase } from "./dateNlp.ts";
import { TOOL_NAMES } from "../server.ts";

test("postal city hint tehran", () => {
  const r = postalToPlace("1134567890");
  assert.equal(r.valid, true);
  assert.equal(r.cityHint, "تهران");
});

test("landline city hint", () => {
  const r = landlineToPlace("02188776655");
  assert.equal(r.cityHint, "تهران");
});

test("national id place sample", () => {
  const r = nationalIdToPlace("0499370899");
  assert.equal(r.ok, true);
});

test("bank terminal sheba", () => {
  const r = validateBankTerminalInput({ sheba: "IR820540102680020817909002" });
  assert.equal(r.ok, true);
});

test("villages official not placeholder", () => {
  const v = searchVillages("", { province: "فارس", limit: 2 });
  assert.ok(v.villages.length >= 1);
  assert.equal(v.source, "iran-cities-v3");
});

test("nlp keyboard typo farda", () => {
  const r = parsePersianDatePhrase("tvnh");
  assert.equal(r.ok, true);
});

test("tools include place helpers", () => {
  assert.ok(TOOL_NAMES.includes("iran_national_id_place"));
  assert.ok(TOOL_NAMES.includes("persian_bank_terminal"));
  assert.ok(TOOL_NAMES.length >= 43);
});
