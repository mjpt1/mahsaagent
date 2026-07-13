import { digitsFaToEn } from "@persian-tools/persian-tools";

export type NationalIdResult = {
  valid: boolean;
  normalized: string;
  reason?: string;
  checkDigit?: number;
  expectedCheckDigit?: number;
  remainder?: number;
  weightedSum?: number;
  placePrefix?: string;
};

/**
 * Official Iranian national ID (کد ملی) check-digit algorithm
 * used by Civil Registration / common validators:
 *   sum = Σ digit[i] * (10 - i) for i in 0..8
 *   r = sum % 11
 *   expected = r < 2 ? r : 11 - r
 *   valid iff digit[9] === expected
 * Also: pad left to 10 digits when length is 8–9; reject all-same digits.
 */
export function verifyNationalIdChecksum(raw: string): NationalIdResult {
  const digitsOnly = digitsFaToEn(String(raw ?? "")).replace(/\D/g, "");

  if (!digitsOnly) {
    return { valid: false, normalized: "", reason: "empty" };
  }
  if (digitsOnly.length > 10 || digitsOnly.length < 8) {
    return {
      valid: false,
      normalized: digitsOnly,
      reason: "length_must_be_8_to_10",
    };
  }

  const normalized = digitsOnly.padStart(10, "0");

  if (/^(\d)\1{9}$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      reason: "all_digits_identical",
      placePrefix: normalized.slice(0, 3),
    };
  }

  let weightedSum = 0;
  for (let i = 0; i < 9; i++) {
    weightedSum += Number(normalized[i]) * (10 - i);
  }
  const remainder = weightedSum % 11;
  const expectedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
  const checkDigit = Number(normalized[9]);
  const valid = checkDigit === expectedCheckDigit;

  return {
    valid,
    normalized,
    reason: valid ? "ok" : "check_digit_mismatch",
    checkDigit,
    expectedCheckDigit,
    remainder,
    weightedSum,
    placePrefix: normalized.slice(0, 3),
  };
}
