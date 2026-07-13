/**
 * Minimal example: Zod schemas from Mahsaagent for Iranian forms.
 * Run from repo root after build: npx tsx examples/basic-form/validate.ts
 */
import {
  nationalIdSchema,
  mobileSchema,
  shebaSchema,
  postalCodeSchema,
  jalaliDateSchema,
} from "../../src/zod/index.ts";

const samples = {
  nationalId: "1829657127",
  mobile: "09123456789",
  sheba: "IR820540102680020817909002",
  postal: "1234567890",
  jalali: "1405/04/22",
};

for (const [k, v] of Object.entries(samples)) {
  const schema =
    k === "nationalId"
      ? nationalIdSchema
      : k === "mobile"
        ? mobileSchema
        : k === "sheba"
          ? shebaSchema
          : k === "postal"
            ? postalCodeSchema
            : jalaliDateSchema;
  const r = schema.safeParse(v);
  console.log(k, v, "→", r.success ? "OK" : r.error.issues[0]?.message);
}
