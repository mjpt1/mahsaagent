import { digitsFaToEn } from "@persian-tools/persian-tools";
import { BANKS, findBankByShebaCode, findBankByCard, type BankInfo } from "../data/banks.js";

/** CDN pattern for bank logos (optional UI). */
export function bankLogoUrl(bankId: string): string {
  return `https://cdn.jsdelivr.net/gh/amastaneh/IranianBankLogos@master/PNG/${bankId}.png`;
}

/**
 * Iranian IBAN: IR + 2 check digits + 3 bank code + 19 account digits (pad left).
 * Account extraction is best-effort; formatting varies by bank.
 */
export function shebaToAccount(sheba: string): {
  ok: boolean;
  bankCode: string | null;
  accountNumber: string | null;
  bank: BankInfo | null;
  normalized: string;
  error?: string;
} {
  const n = digitsFaToEn(sheba).replace(/\s+/g, "").toUpperCase();
  const withIr = n.startsWith("IR") ? n : `IR${n.replace(/\D/g, "")}`;
  const body = withIr.replace(/^IR/, "");
  if (!/^\d{24}$/.test(body)) {
    return { ok: false, bankCode: null, accountNumber: null, bank: null, normalized: withIr, error: "invalid_sheba_length" };
  }
  const bankCode = body.slice(2, 5);
  const accountRaw = body.slice(5);
  const accountNumber = accountRaw.replace(/^0+/, "") || "0";
  const bank = findBankByShebaCode(bankCode);
  return { ok: true, bankCode, accountNumber, bank, normalized: withIr };
}

/**
 * Build Sheba from bank code + account (MOD-97 check digits).
 * account should be digits only; padded to 19.
 */
export function accountToSheba(bankCode: string, account: string): {
  ok: boolean;
  sheba: string | null;
  error?: string;
} {
  const code = digitsFaToEn(bankCode).replace(/\D/g, "").padStart(3, "0");
  let acc = digitsFaToEn(account).replace(/\D/g, "");
  if (code.length !== 3) return { ok: false, sheba: null, error: "bank_code_must_be_3_digits" };
  if (!acc) return { ok: false, sheba: null, error: "empty_account" };
  if (acc.length > 19) return { ok: false, sheba: null, error: "account_too_long" };
  acc = acc.padStart(19, "0");
  const bban = `${code}${acc}`;
  // Rearrange: BBAN + "IR00" → numeric, mod 97
  const rearranged = `${bban}182700`; // I=18 R=27 + 00
  const check = 98 - mod97(rearranged);
  const checkStr = String(check).padStart(2, "0");
  return { ok: true, sheba: `IR${checkStr}${bban}` };
}

function mod97(numeric: string): number {
  let remainder = 0;
  for (const ch of numeric) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder;
}

export function enrichBank(bank: BankInfo | null) {
  if (!bank) return null;
  return {
    ...bank,
    logoUrl: bankLogoUrl(bank.id),
  };
}

export function validateBankTerminalInput(input: {
  sheba?: string;
  account?: string;
  bankCode?: string;
}) {
  if (input.sheba) {
    const r = shebaToAccount(input.sheba);
    return {
      kind: "sheba" as const,
      ...r,
      note: r.ok ? "sheba_ok" : r.error,
    };
  }
  if (input.account && input.bankCode) {
    const r = accountToSheba(input.bankCode, input.account);
    return {
      kind: "account" as const,
      ok: r.ok,
      sheba: r.sheba,
      bankCode: input.bankCode,
      account: input.account,
      note: r.ok ? "account_built" : r.error,
    };
  }
  return { kind: "unknown" as const, ok: false, note: "provide_sheba_or_account_plus_bankCode" };
}

export { BANKS, findBankByCard, findBankByShebaCode };
