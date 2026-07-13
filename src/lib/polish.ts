import { toPersianChars, digitsEnToFa, digitsFaToEn } from "@persian-tools/persian-tools";

/**
 * Lightweight Persian text polish (virastar-inspired subset).
 */
export function polishPersian(
  text: string,
  options: { digits?: "fa" | "en" | "keep"; zwnj?: boolean } = {}
): string {
  let t = toPersianChars(text) ?? text;

  // Arabic punctuation → Persian
  t = t.replace(/,/g, "،").replace(/;/g, "؛").replace(/\?/g, "؟");

  // Space before punctuation remove; ensure space after
  t = t.replace(/\s+([،؛.!؟:])/g, "$1");
  t = t.replace(/([،؛.!؟:])(\S)/g, "$1 $2");

  // Collapse spaces
  t = t.replace(/[ \t]+/g, " ");
  t = t.replace(/\u200c{2,}/g, "\u200c");

  if (options.zwnj !== false) {
    t = t
      .replace(/(می|نمی)\s+/g, "$1\u200c")
      .replace(/\s+(ها|های|تر|ترین|ام|ات|اش)\b/g, "\u200c$1");
  }

  // Heh + ye forms
  t = t.replace(/ه\sی\b/g, "ه‌ی");

  if (options.digits === "fa") t = digitsEnToFa(t);
  if (options.digits === "en") t = digitsFaToEn(t);

  return t.trim();
}
