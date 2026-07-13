import { toPersianChars, digitsEnToFa, digitsFaToEn, halfSpace } from "@persian-tools/persian-tools";

export type PolishOptions = {
  digits?: "fa" | "en" | "keep";
  zwnj?: boolean;
  hamzeh?: boolean;
  quotes?: boolean;
  extraSpaces?: boolean;
  kashida?: boolean;
};

/**
 * Expanded Persian text polish (virastar-inspired).
 */
export function polishPersian(text: string, options: PolishOptions = {}): string {
  let t = toPersianChars(text) ?? text;

  if (options.kashida !== false) {
    t = t.replace(/\u0640+/g, ""); // ــ
  }

  // Arabic punctuation → Persian
  t = t.replace(/,/g, "،").replace(/;/g, "؛").replace(/\?/g, "؟");

  if (options.quotes !== false) {
    t = t.replace(/"([^"]+)"/g, "«$1»").replace(/'/g, "’");
  }

  // Hamzeh / ye
  if (options.hamzeh !== false) {
    t = t.replace(/ه\s*ی\b/g, "ه‌ی").replace(/ۀ/g, "ه‌ی");
  }

  // Ellipsis
  t = t.replace(/\.{3,}/g, "…");

  // Percent spacing
  t = t.replace(/(\d)\s*%/g, "$1٪").replace(/%/g, "٪");

  // Remove zero-width extras except ZWNJ
  t = t.replace(/[\u200b\u200d\ufeff]/g, "");

  // Space before punctuation remove; ensure space after
  t = t.replace(/\s+([،؛.!؟:»…])/g, "$1");
  t = t.replace(/([،؛.!؟:«…])(\S)/g, "$1 $2");
  t = t.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

  // "و" spacing around digits ranges
  t = t.replace(/(\d)\s+تا\s+(\d)/g, "$1 تا $2");

  if (options.extraSpaces !== false) {
    t = t.replace(/[ \t]+/g, " ");
    t = t.replace(/\u200c{2,}/g, "\u200c");
    t = t.replace(/\n{3,}/g, "\n\n");
  }

  if (options.zwnj !== false) {
    try {
      const hs = halfSpace(t);
      if (typeof hs === "string" && hs.length) t = hs;
    } catch {
      t = t
        .replace(/(می|نمی)\s+/g, "$1\u200c")
        .replace(/\s+(ها|های|تر|ترین|ام|ات|اش)\b/g, "\u200c$1");
    }
  }

  if (options.digits === "fa") t = digitsEnToFa(t);
  if (options.digits === "en") t = digitsFaToEn(t);

  return t.trim();
}
