import { digitsFaToEn } from "@persian-tools/persian-tools";
import { verifyNationalIdChecksum } from "./nationalId.js";

/** Generate a valid-looking national ID for tests (not a real person). */
export function generateTestNationalId(seed?: number): string {
  let s = seed ?? Date.now() % 1_000_000_000;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s;
  };
  for (let attempt = 0; attempt < 200; attempt++) {
    const nine = String(rnd() % 1_000_000_000).padStart(9, "0");
    // avoid all identical
    if (/^(\d)\1{8}$/.test(nine)) continue;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(nine[i]) * (10 - i);
    const r = sum % 11;
    const check = r < 2 ? r : 11 - r;
    const id = `${nine}${check}`;
    if (verifyNationalIdChecksum(id).valid) return id;
  }
  return "0499370899"; // known-valid fallback sample
}

/** Generate test Sheba for a bank code + random account. */
export function generateTestSheba(bankCode = "054", seed?: number): string {
  const { accountToSheba } = requireSheba();
  let s = seed ?? Date.now();
  s = (s * 1103515245 + 12345) >>> 0;
  const acc = String(s % 10_000_000_000).padStart(10, "0");
  const r = accountToSheba(bankCode, acc);
  return r.sheba ?? "IR820540102680020817909002";
}

function requireSheba() {
  // lazy to avoid circular init issues at module load in some bundlers
  return {
    accountToSheba: (
      bankCode: string,
      account: string
    ): { sheba: string | null } => {
      // inline minimal copy of accountToSheba for generator
      const code = digitsFaToEn(bankCode).replace(/\D/g, "").padStart(3, "0");
      let acc = digitsFaToEn(account).replace(/\D/g, "").padStart(19, "0");
      const bban = `${code}${acc}`;
      const rearranged = `${bban}182700`;
      let remainder = 0;
      for (const ch of rearranged) remainder = (remainder * 10 + Number(ch)) % 97;
      const check = String(98 - remainder).padStart(2, "0");
      return { sheba: `IR${check}${bban}` };
    },
  };
}

/** Legal ID (شناسه ملی) — 11 digits with checksum similar pattern. */
export function validateLegalIdDetailed(raw: string) {
  const normalized = digitsFaToEn(raw).replace(/\D/g, "");
  if (!/^\d{11}$/.test(normalized)) {
    return { valid: false, normalized, reason: "length_must_be_11" as const };
  }
  if (/^(\d)\1{10}$/.test(normalized)) {
    return { valid: false, normalized, reason: "all_digits_identical" as const };
  }
  // Algorithm used by many Iranian validators for شناسه ملی ۱۱ رقمی
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(normalized[i]) * (11 - i);
  }
  const r = sum % 11;
  const expected = r < 2 ? r : 11 - r;
  const check = Number(normalized[10]);
  const valid = check === expected;
  return {
    valid,
    normalized,
    reason: valid ? ("ok" as const) : ("check_digit_mismatch" as const),
    checkDigit: check,
    expectedCheckDigit: expected,
    remainder: r,
    weightedSum: sum,
  };
}
