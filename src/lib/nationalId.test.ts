import test from "node:test";
import assert from "node:assert/strict";
import { verifyNationalIdChecksum } from "./nationalId.ts";

test("known valid sample", () => {
  const r = verifyNationalIdChecksum("0499370899");
  assert.equal(r.valid, true);
  assert.equal(r.expectedCheckDigit, 9);
});

test("pads short codes to 10 digits", () => {
  // 0012345679 is a documented valid example in many Persian tutorials
  const r = verifyNationalIdChecksum("12345679");
  assert.equal(r.normalized.length, 10);
  assert.equal(r.normalized.startsWith("00"), true);
});

test("user-reported 1829657128 fails with expected check 7", () => {
  const r = verifyNationalIdChecksum("1829657128");
  assert.equal(r.valid, false);
  assert.equal(r.reason, "check_digit_mismatch");
  assert.equal(r.checkDigit, 8);
  assert.equal(r.expectedCheckDigit, 7);
});

test("1829657127 would pass checksum", () => {
  const r = verifyNationalIdChecksum("1829657127");
  assert.equal(r.valid, true);
});

test("rejects identical digits", () => {
  assert.equal(verifyNationalIdChecksum("1111111111").valid, false);
});
