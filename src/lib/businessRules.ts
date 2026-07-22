/** Curated Iranian e-commerce / invoice business rules (offline reference). */

export type BusinessRulePack = "shop" | "invoice" | "shipping" | "payment" | "tax";

const VAT_RATES = [
  { rate: 0, labelFa: "معاف", note: "برخی کالاهای اساسی" },
  { rate: 9, labelFa: "۹٪", note: "نرخ رایج قبلی" },
  { rate: 10, labelFa: "۱۰٪", note: "نرخ متداول فعلی — با بخشنامه تطبیق دهید" },
];

const SHIPPING_ZONES = [
  { id: "tehran", labelFa: "تهران", baseToman: 45000, etaDays: "۱–۲" },
  { id: "major", labelFa: "مراکز استان", baseToman: 65000, etaDays: "۲–۴" },
  { id: "remote", labelFa: "سایر شهرها", baseToman: 85000, etaDays: "۳–۷" },
];

const PAYMENT_METHODS = [
  { id: "ipg", labelFa: "درگاه آنلاین", requires: ["callbackUrl", "amount"] },
  { id: "cod", labelFa: "پرداخت در محل", maxToman: 50000000, note: "سقف قراردادی" },
  { id: "wallet", labelFa: "کیف پول", requires: ["userId", "balance"] },
];

const DISCOUNT_RULES = [
  { id: "percent_cap", ruleFa: "تخفیف درصدی معمولاً سقف ۹۰٪ دارد", kind: "validation" },
  { id: "stacking", ruleFa: "هم‌زمانی چند کد تخفیف را در سیاست فروشگاه مشخص کنید", kind: "policy" },
  { id: "vat_after_discount", ruleFa: "مالیات معمولاً بعد از تخفیف محاسبه می‌شود", kind: "tax" },
];

export function getBusinessRules(pack: BusinessRulePack) {
  switch (pack) {
    case "tax":
      return { pack, vatRates: VAT_RATES, disclaimer: "نرخ‌ها مرجع آفلاین — با مودیان/حسابدار تطبیق دهید" };
    case "shipping":
      return { pack, zones: SHIPPING_ZONES, currency: "toman", note: "مبالغ نمونه — در production از API پست/پیک استفاده کنید" };
    case "payment":
      return { pack, methods: PAYMENT_METHODS };
    case "invoice":
      return {
        pack,
        requiredFields: ["sellerLegalId", "buyerNationalIdOrLegalId", "lines", "vat", "total"],
        moadianHint: "برای B2B از moadian_validate استفاده کنید",
      };
    case "shop":
    default:
      return {
        pack: "shop" as const,
        checkout: ["cart", "address", "shipping", "payment", "confirm"],
        validation: ["mobile", "postalCode", "nationalIdForInvoice"],
        discounts: DISCOUNT_RULES,
        tax: VAT_RATES,
        shipping: SHIPPING_ZONES,
        payment: PAYMENT_METHODS,
      };
  }
}

export function calcSampleOrder(input: {
  subtotalToman: number;
  discountPercent?: number;
  vatRate?: number;
  shippingZone?: "tehran" | "major" | "remote";
}) {
  const discount = Math.min(90, Math.max(0, input.discountPercent ?? 0));
  const afterDiscount = Math.round(input.subtotalToman * (1 - discount / 100));
  const vatRate = input.vatRate ?? 10;
  const vat = Math.round(afterDiscount * (vatRate / 100));
  const zone = SHIPPING_ZONES.find((z) => z.id === (input.shippingZone ?? "tehran"))!;
  const total = afterDiscount + vat + zone.baseToman;
  return {
    subtotalToman: input.subtotalToman,
    discountPercent: discount,
    afterDiscountToman: afterDiscount,
    vatRate,
    vatToman: vat,
    shippingToman: zone.baseToman,
    shippingLabel: zone.labelFa,
    totalToman: total,
    disclaimer: "محاسبهٔ نمونه — گرد کردن بانکی و معافیت‌ها را در اپ اعمال کنید",
  };
}

export function listBusinessRulePacks() {
  return (["shop", "invoice", "shipping", "payment", "tax"] as BusinessRulePack[]).map((id) => ({
    id,
    summary: getBusinessRules(id),
  }));
}
