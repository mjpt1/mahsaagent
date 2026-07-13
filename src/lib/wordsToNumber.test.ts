import test from "node:test";
import assert from "node:assert/strict";
import { persianWordsToInteger } from "./wordsToNumber.ts";

test("basic scales", () => {
  assert.equal(persianWordsToInteger("هزار"), 1000);
  assert.equal(persianWordsToInteger("یک میلیون"), 1_000_000);
  assert.equal(persianWordsToInteger("دویست و سی و چهار"), 234);
});

test("negative", () => {
  assert.equal(persianWordsToInteger("منفی ده"), -10);
});

test("invalid", () => {
  assert.equal(persianWordsToInteger("blah"), null);
});
