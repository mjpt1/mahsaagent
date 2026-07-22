import { validateSheba, validateCard } from "./text.js";
import { shebaToAccount, accountToSheba, findBankByCard, enrichBank } from "./shebaConvert.js";
import { detectFinancial } from "./financial.js";

export type BankFormInput = {
  card?: string;
  sheba?: string;
  account?: string;
  bankCode?: string;
  bankName?: string;
};

export function syncBankFormFields(input: BankFormInput) {
  const fixes: Array<{ field: string; suggested: string; reasonFa: string }> = [];
  const warnings: string[] = [];
  let card = input.card?.replace(/\s+/g, "");
  let sheba = input.sheba?.replace(/\s+/g, "").toUpperCase();
  let bankCode = input.bankCode;
  let bankFromCard = card ? findBankByCard(card.replace(/\D/g, "")) : null;
  let bankFromSheba = sheba ? shebaToAccount(sheba).bank : null;

  if (card && !validateCard(card).valid) warnings.push("شماره کارت از نظر الگوریتم نامعتبر است");
  if (sheba && !validateSheba(sheba).valid) warnings.push("شبا نامعتبر است");

  if (bankFromCard && bankFromSheba && bankFromCard.id !== bankFromSheba.id) {
    warnings.push("بانک تشخیص‌داده‌شده از کارت و شبا یکی نیست");
    fixes.push({
      field: "sheba",
      suggested: "(بررسی دستی)",
      reasonFa: "کارت و شبا به بانک‌های مختلف اشاره می‌کنند",
    });
  }

  const bank = bankFromSheba ?? bankFromCard;
  const bankShebaCode = bank?.shebaCode;
  if (bank && bankCode && bankShebaCode && bankShebaCode !== bankCode.replace(/\D/g, "").padStart(3, "0")) {
    fixes.push({
      field: "bankCode",
      suggested: bankShebaCode,
      reasonFa: "کد بانک با کارت/شبا هم‌خوان نیست",
    });
    bankCode = bankShebaCode;
  } else if (bank && bankShebaCode && !bankCode) {
    bankCode = bankShebaCode;
    fixes.push({
      field: "bankCode",
      suggested: bankShebaCode,
      reasonFa: "کد بانک از کارت/شبا استخراج شد",
    });
  }

  if (sheba && input.account && bankCode) {
    const extracted = shebaToAccount(sheba);
    const built = accountToSheba(bankCode, input.account);
    if (extracted.ok && built.ok && extracted.normalized !== built.sheba) {
      warnings.push("شبا با حساب+کد بانک ساخته‌شده مطابقت ندارد");
      if (built.sheba) {
        fixes.push({
          field: "sheba",
          suggested: built.sheba,
          reasonFa: "شبا از account+bankCode بازسازی شد",
        });
        sheba = built.sheba;
      }
    }
  }

  if (!sheba && input.account && bankCode) {
    const built = accountToSheba(bankCode, input.account);
    if (built.ok && built.sheba) {
      sheba = built.sheba;
      fixes.push({ field: "sheba", suggested: built.sheba, reasonFa: "شبا از حساب ساخته شد" });
    }
  }

  const financial = card || sheba ? detectFinancial(card ?? sheba ?? "") : null;

  return {
    input,
    normalized: {
      card: card ?? null,
      sheba: sheba ?? null,
      bankCode: bankCode ?? null,
      bank: enrichBank(bank),
    },
    financial,
    fixes,
    warnings,
    consistent: warnings.length === 0,
  };
}
