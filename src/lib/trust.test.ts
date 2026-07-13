import test from "node:test";
import assert from "node:assert/strict";
import { validateLegalId } from "./text.ts";
import { validatePassport, postalToPlace } from "./extraValidate.ts";

test("legal id does not OR with legacy library", () => {
  const bad = validateLegalId("11111111111");
  assert.equal(bad.valid, false);
  assert.equal(typeof bad.legacyValid, "boolean");
  assert.equal(typeof bad.legacyAgrees, "boolean");
});

test("passport rejects alphanumeric junk", () => {
  assert.equal(validatePassport("A12345678").valid, true);
  assert.equal(validatePassport("ABCDEFGHI").valid, false);
  assert.equal(validatePassport("12345678").valid, false);
});

test("postal place hints are marked approximate", () => {
  const r = postalToPlace("1134567890");
  assert.equal(r.approximate, true);
  assert.ok(r.disclaimer);
});
