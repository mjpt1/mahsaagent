import { digitsEnToFa, digitsFaToEn } from "@persian-tools/persian-tools";

export type MoneyUnit = "rial" | "toman";

/** Bank-style rounding: half away from zero to integer rials. */
export function bankRound(amount: number): number {
  if (!Number.isFinite(amount)) return NaN;
  return amount >= 0 ? Math.floor(amount + 0.5) : Math.ceil(amount - 0.5);
}

export function rialToToman(rial: number): number {
  return bankRound(rial) / 10;
}

export function tomanToRial(toman: number): number {
  return bankRound(toman * 10);
}

export function convertMoney(
  amount: number | string,
  from: MoneyUnit,
  to: MoneyUnit
): { value: number; unit: MoneyUnit; formattedFa: string } {
  const n = typeof amount === "string" ? Number(digitsFaToEn(amount).replace(/,/g, "")) : amount;
  let rial = from === "rial" ? n : tomanToRial(n);
  rial = bankRound(rial);
  const value = to === "rial" ? rial : rialToToman(rial);
  const formatted = digitsEnToFa(
    Math.trunc(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
  return { value, unit: to, formattedFa: formatted };
}

export function formatMoneyFa(amount: number | string, unit: MoneyUnit = "toman"): string {
  const { formattedFa } = convertMoney(amount, unit, unit);
  return `${formattedFa} ${unit === "toman" ? "تومان" : "ریال"}`;
}
