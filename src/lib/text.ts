import {
  digitsEnToFa,
  digitsFaToEn,
  digitsArToFa,
  toPersianChars,
  getPlaceByIranNationalId,
  verifyIranianLegalId,
  isShebaValid,
  getShebaInfo,
  verifyCardNumber,
  getBankNameFromCardNumber,
  phoneNumberValidator,
  phoneNumberDetail,
  addCommas,
  isPersian,
  hasPersian,
  Plate,
  Bill,
  extractCardNumber,
  halfSpace as ptHalfSpace,
  timeAgo as ptTimeAgo,
  remainingTime as ptRemainingTime,
} from "@persian-tools/persian-tools";
import { integerToPersianWords } from "./numberWords.js";
import { persianWordsToInteger } from "./wordsToNumber.js";
import { findProvinces, PROVINCES } from "../data/provinces.js";
import { verifyNationalIdChecksum } from "./nationalId.js";

export function normalizePersian(
  text: string,
  options: { digits?: "fa" | "en" | "keep"; halfSpace?: boolean } = {}
): string {
  let out = toPersianChars(text) ?? text;

  if (options.halfSpace) {
    try {
      const hs = ptHalfSpace(out);
      if (typeof hs === "string" && hs.length) out = hs;
    } catch {
      /* fallback below */
    }
    out = out
      .replace(/\u200c+/g, "\u200c")
      .replace(/\s*\u200c\s*/g, "\u200c")
      .replace(/(می|نمی|نمى)\s+/g, "$1\u200c")
      .replace(/\s+(ها|های|تر|ترین)\b/g, "\u200c$1");
  }

  if (options.digits === "fa") out = digitsEnToFa(digitsArToFa(out));
  if (options.digits === "en") out = digitsFaToEn(out);

  return out;
}

export function convertDigits(
  text: string,
  direction: "en_to_fa" | "fa_to_en" | "ar_to_fa"
): string {
  switch (direction) {
    case "en_to_fa":
      return digitsEnToFa(text);
    case "fa_to_en":
      return digitsFaToEn(text);
    case "ar_to_fa":
      return digitsArToFa(text);
  }
}

export function analyzePersianText(text: string) {
  return {
    isPersian: Boolean(isPersian(text)),
    hasPersian: Boolean(hasPersian(text)),
    length: text.length,
    normalized: normalizePersian(text, { halfSpace: true, digits: "keep" }),
  };
}

export function slugifyPersian(text: string, separator = "-"): string {
  return normalizePersian(text, { halfSpace: false, digits: "en" })
    .trim()
    .replace(/\u200c/g, separator)
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s\-_+]/g, "")
    .replace(/\s+/g, separator)
    .replace(new RegExp(`${separator}+`, "g"), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
}

export function validateNationalId(id: string) {
  const check = verifyNationalIdChecksum(id);
  let place: ReturnType<typeof getPlaceByIranNationalId> | null = null;
  if (check.valid) {
    try {
      place = getPlaceByIranNationalId(check.normalized) ?? null;
    } catch {
      place = null;
    }
  }
  return {
    valid: check.valid,
    normalized: check.normalized,
    place,
    detail: {
      reason: check.reason,
      checkDigit: check.checkDigit,
      expectedCheckDigit: check.expectedCheckDigit,
      remainder: check.remainder,
      weightedSum: check.weightedSum,
      placePrefix: check.placePrefix,
    },
  };
}

export function validateLegalId(id: string) {
  const normalized = digitsFaToEn(id).replace(/\D/g, "");
  return { valid: Boolean(verifyIranianLegalId(normalized)), normalized };
}

export function validateSheba(sheba: string) {
  const normalized = digitsFaToEn(sheba).replace(/\s+/g, "").toUpperCase();
  const withIr = normalized.startsWith("IR") ? normalized : `IR${normalized}`;
  const valid = Boolean(isShebaValid(withIr));
  return { valid, info: valid ? getShebaInfo(withIr) : null, normalized: withIr };
}

export function validateCard(card: string) {
  const normalized = digitsFaToEn(card).replace(/\D/g, "");
  const valid = Boolean(verifyCardNumber(Number(normalized)));
  return {
    valid,
    bankName: valid ? getBankNameFromCardNumber(normalized) ?? null : null,
    normalized,
  };
}

export function validateMobile(phone: string) {
  const normalized = digitsFaToEn(phone).replace(/[\s-]/g, "");
  const valid = Boolean(phoneNumberValidator(normalized));
  return { valid, detail: valid ? phoneNumberDetail(normalized) : null, normalized };
}

/** Iranian postal code: 10 digits, first digit not 0. */
export function validatePostalCode(code: string) {
  const normalized = digitsFaToEn(code).replace(/\D/g, "");
  const valid = /^[1-9]\d{9}$/.test(normalized);
  return { valid, normalized };
}

export function parsePlate(plate: string) {
  try {
    const result = Plate(digitsFaToEn(plate).replace(/\s+/g, ""));
    return { ok: true as const, result };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Local shape of Bill.getResult() — BillResult is not exported from @persian-tools. */
export type ParsedBillResult = {
  amount: number;
  type: string;
  barcode: string;
  isValid: boolean;
  isValidBillId: boolean;
  isValidBillPayment: boolean;
};

export function parseBill(params: {
  billId?: string;
  paymentId?: string;
  barcode?: string;
  currency?: "toman" | "rial";
}): { ok: true; result: ParsedBillResult } | { ok: false; error: string } {
  try {
    const bill = new Bill({
      billId: params.billId ? Number(digitsFaToEn(params.billId)) : undefined,
      paymentId: params.paymentId ? Number(digitsFaToEn(params.paymentId)) : undefined,
      barcode: params.barcode ? digitsFaToEn(params.barcode) : undefined,
      currency: params.currency ?? "rial",
    });
    return { ok: true as const, result: bill.getResult() as ParsedBillResult };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export function extractCardsFromText(text: string) {
  try {
    return extractCardNumber(text, { checkValidation: true, detectBankNumber: true });
  } catch {
    return [];
  }
}

export function amountToPersianWords(amount: number | string): string {
  const raw =
    typeof amount === "string" ? digitsFaToEn(amount).replace(/,/g, "").trim() : String(amount);
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return "";
  return integerToPersianWords(n);
}

export function formatAmountFa(amount: number | string): string {
  const n =
    typeof amount === "string" ? digitsFaToEn(amount).replace(/,/g, "").trim() : String(amount);
  if (!Number.isFinite(Number(n))) return "";
  try {
    return digitsEnToFa(String(addCommas(n)));
  } catch {
    return digitsEnToFa(n);
  }
}

export function wordsToAmount(text: string) {
  const value = persianWordsToInteger(text);
  return {
    input: text,
    value,
    formattedFa: value == null ? null : formatAmountFa(value),
  };
}

export type BatchField =
  | { kind: "national_id" | "legal_id" | "sheba" | "card" | "mobile" | "postal_code"; value: string };

export function batchValidate(fields: BatchField[]) {
  return fields.map((f) => {
    switch (f.kind) {
      case "national_id":
        return { ...f, ...validateNationalId(f.value) };
      case "legal_id":
        return { ...f, ...validateLegalId(f.value) };
      case "sheba":
        return { ...f, ...validateSheba(f.value) };
      case "card":
        return { ...f, ...validateCard(f.value) };
      case "mobile":
        return { ...f, ...validateMobile(f.value) };
      case "postal_code":
        return { ...f, ...validatePostalCode(f.value) };
    }
  });
}

export function safeTimeAgo(dateInput: string) {
  try {
    const result = ptTimeAgo(dateInput);
    return { ok: true as const, result: typeof result === "string" ? result : String(result) };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export function safeRemainingTime(dateInput: string) {
  try {
    const result = ptRemainingTime(dateInput);
    const text =
      result && typeof result === "object" && "toString" in result
        ? String(result.toString())
        : String(result);
    return { ok: true as const, result: text };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
}

export function listOrFindProvinces(query?: string) {
  if (!query || !query.trim()) {
    return { count: PROVINCES.length, provinces: PROVINCES };
  }
  const found = findProvinces(query);
  return { count: found.length, provinces: found };
}
