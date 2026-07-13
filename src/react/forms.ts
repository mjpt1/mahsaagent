/**
 * Optional React Hook Form helpers for Iranian fields.
 * Peer: react-hook-form (optional).
 */
import { useEffect } from "react";
import {
  detectBankInput,
  getJalaliNow,
} from "./core.js";
import { shebaToAccount, accountToSheba, enrichBank } from "../lib/shebaConvert.js";
import { findBankByShebaCode } from "../data/banks.js";
import { digitsFaToEn } from "@persian-tools/persian-tools";

export type BankSyncState = {
  kind: "sheba" | "card" | "account" | "unknown";
  sheba?: string;
  account?: string;
  bankCode?: string;
  bank?: ReturnType<typeof enrichBank> | { name?: string } | null;
  valid?: boolean;
};

/** Sync sheba ↔ account + bank logo when either field changes. */
export function useBankSync(input: {
  sheba?: string;
  account?: string;
  bankCode?: string;
}): BankSyncState {
  const sheba = input.sheba?.trim() ?? "";
  const account = input.account?.trim() ?? "";
  const bankCode = input.bankCode?.trim() ?? "";

  if (sheba) {
    const det = detectBankInput(sheba);
    const conv = shebaToAccount(sheba);
    return {
      kind: "sheba",
      sheba: conv.normalized,
      account: conv.accountNumber ?? undefined,
      bankCode: conv.bankCode ?? undefined,
      bank: conv.bank ? enrichBank(conv.bank) : det.kind !== "unknown" ? (det as { bank?: BankSyncState["bank"] }).bank : null,
      valid: conv.ok,
    };
  }

  if (account && bankCode) {
    const built = accountToSheba(bankCode, account);
    const bank = findBankByShebaCode(digitsFaToEn(bankCode).padStart(3, "0"));
    return {
      kind: "account",
      account,
      bankCode,
      sheba: built.sheba ?? undefined,
      bank: enrichBank(bank),
      valid: built.ok,
    };
  }

  return { kind: "unknown", valid: false };
}

export function useJalaliDefault(digits: "fa" | "en" = "fa") {
  return getJalaliNow(digits);
}

/** Tiny effect helper: when sheba changes, call onAccount with extracted account. */
export function useShebaAccountBridge(
  sheba: string,
  onAccount: (account: string, bankCode: string | null) => void
) {
  useEffect(() => {
    if (!sheba) return;
    const r = shebaToAccount(sheba);
    if (r.ok && r.accountNumber) onAccount(r.accountNumber, r.bankCode);
  }, [sheba, onAccount]);
}

export type { BankSyncState as MahsaBankSyncState };
