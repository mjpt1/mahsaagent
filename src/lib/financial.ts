import { digitsFaToEn } from "@persian-tools/persian-tools";
import { findBankByCard, findBankByShebaCode, BANKS } from "../data/banks.js";
import { validateCard, validateSheba } from "./text.js";
import { enrichBank, shebaToAccount, bankLogoUrl } from "./shebaConvert.js";

export function detectFinancial(value: string) {
  const raw = digitsFaToEn(value).replace(/[\s-]/g, "");
  const digits = raw.replace(/\D/g, "");
  const upper = raw.toUpperCase();

  // Sheba / IBAN
  if (upper.includes("IR") || (digits.length === 24 && !upper.startsWith("IR"))) {
    const sheba = validateSheba(upper.startsWith("IR") ? upper : `IR${digits}`);
    const converted = shebaToAccount(sheba.normalized);
    const bank =
      findBankByShebaCode(converted.bankCode ?? "") ??
      findBankByShebaCode(sheba.info?.code ?? "");
    return {
      kind: "sheba" as const,
      ...sheba,
      bank:
        enrichBank(bank) ??
        (sheba.info
          ? {
              name: sheba.info.persianName,
              nameEn: sheba.info.name,
              shebaCode: sheba.info.code,
            }
          : null),
      accountNumber: converted.accountNumber,
      bankCode: converted.bankCode,
    };
  }

  // Card (16 digits typical)
  if (digits.length === 16 || digits.length === 19) {
    const card = validateCard(digits);
    const bank = findBankByCard(digits);
    return {
      kind: "card" as const,
      ...card,
      bank: enrichBank(bank) ?? (card.bankName ? { name: card.bankName } : null),
    };
  }

  return {
    kind: "unknown" as const,
    valid: false,
    normalized: digits || raw,
    note: "Provide a 16-digit card or IR sheba (24 digits / IBAN).",
  };
}

export function listBanks() {
  return BANKS.map((b) => ({
    id: b.id,
    name: b.name,
    nameEn: b.nameEn,
    shebaCode: b.shebaCode ?? null,
    cardPrefixes: b.cardPrefixes,
    logoUrl: bankLogoUrl(b.id),
  }));
}

export { shebaToAccount, accountToSheba, bankLogoUrl, enrichBank } from "./shebaConvert.js";
