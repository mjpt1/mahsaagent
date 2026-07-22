/** Ready-made regex patterns for common Iranian data fields. */
export const PERSIAN_REGEX_PACK = {
  national_id: {
    pattern: String.raw`\b\d{10}\b`,
    flags: "g",
    description: "۱۰ رقم کدملی (بدون اعتبارسنجی رقم کنترل)",
    example: "0499370899",
  },
  mobile: {
    pattern: String.raw`\b09\d{9}\b`,
    flags: "g",
    description: "موبایل ایران (۰۹ + ۹ رقم)",
    example: "09123456789",
  },
  sheba: {
    pattern: String.raw`\bIR\d{24}\b`,
    flags: "gi",
    description: "شماره شبا (IR + ۲۴ رقم)",
    example: "IR820540102680020817909002",
  },
  postal_code: {
    pattern: String.raw`\b\d{10}\b`,
    flags: "g",
    description: "کدپستی ۱۰ رقمی",
    example: "1234567890",
  },
  landline: {
    pattern: String.raw`\b0\d{2,3}\d{7,8}\b`,
    flags: "g",
    description: "تلفن ثابت با پیش‌شماره",
    example: "02188776655",
  },
  jalali_slash: {
    pattern: String.raw`\b1[34]\d{2}/(0?[1-9]|1[0-2])/(0?[1-9]|[12]\d|3[01])\b`,
    flags: "g",
    description: "تاریخ شمسی با اسلش (سال ۱۳xx/۱۴xx)",
    example: "1405/04/22",
  },
  card_16: {
    pattern: String.raw`\b\d{16}\b`,
    flags: "g",
    description: "شماره کارت ۱۶ رقمی",
    example: "6219861034529007",
  },
  plate_old: {
    pattern: String.raw`\b\d{2}\s?[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]\s?\d{3}\s?ایران\s?\d{2}\b`,
    flags: "g",
    description: "پلاک قدیمی ایران (تقریبی)",
    example: "12 ب 345 ایران 67",
  },
} as const;

export type RegexPackKey = keyof typeof PERSIAN_REGEX_PACK;

export function getRegexPattern(key: RegexPackKey) {
  const entry = PERSIAN_REGEX_PACK[key];
  return {
    key,
    ...entry,
    regex: new RegExp(entry.pattern, entry.flags),
  };
}

export function listRegexPatterns() {
  return Object.entries(PERSIAN_REGEX_PACK).map(([key, v]) => ({ key, ...v }));
}

export function extractWithPattern(key: RegexPackKey, text: string) {
  const { regex, description } = getRegexPattern(key);
  const matches = [...text.matchAll(regex)].map((m) => m[0]);
  return { key, description, matches, count: matches.length };
}
