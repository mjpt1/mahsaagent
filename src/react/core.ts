import { digitsFaToEn } from "@persian-tools/persian-tools";
import {
  todayJalali,
  formatJalali,
  formatJalaliLong,
  parseJalaliString,
  gregorianToJalali,
  type JalaliParts,
} from "../lib/jalali.js";
import { detectFinancial } from "../lib/financial.js";
import { enrichBank } from "../lib/shebaConvert.js";
import { findBankByCard } from "../data/banks.js";

export type JalaliState = {
  parts: JalaliParts;
  formatted: string;
  formattedLong: string;
};

/** Framework-agnostic helpers usable from React hooks. */
export function getJalaliNow(digits: "fa" | "en" = "fa"): JalaliState {
  const parts = todayJalali();
  return {
    parts,
    formatted: formatJalali(parts, { digits }),
    formattedLong: formatJalaliLong(parts, { digits }),
  };
}

export function parseJalali(input: string): JalaliParts | null {
  return parseJalaliString(input);
}

export function detectBankInput(value: string) {
  const r = detectFinancial(value);
  if (r.kind === "card") {
    const bank = findBankByCard(digitsFaToEn(value).replace(/\D/g, ""));
    return { ...r, bank: enrichBank(bank) };
  }
  if (r.kind === "sheba" && "bank" in r && r.bank && "id" in (r.bank as object)) {
    return r;
  }
  return r;
}

export function useJalaliShim(digits: "fa" | "en" = "fa") {
  // Named for React consumers; works without React (call as function).
  return getJalaliNow(digits);
}

export function useBankDetectShim(value: string) {
  return detectBankInput(value);
}

export { gregorianToJalali, formatJalali, formatJalaliLong };
