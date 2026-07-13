/** Minimal integer → Persian words (positive integers). */
const ONES = [
  "",
  "یک",
  "دو",
  "سه",
  "چهار",
  "پنج",
  "شش",
  "هفت",
  "هشت",
  "نه",
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function underThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n]!;
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${TENS[t]} و ${ONES[o]}` : TENS[t]!;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const head = HUNDREDS[h]!;
  return rest ? `${head} و ${underThousand(rest)}` : head;
}

export function integerToPersianWords(value: number): string {
  if (!Number.isFinite(value) || !Number.isInteger(value)) return "";
  if (value === 0) return "صفر";
  if (value < 0) return `منفی ${integerToPersianWords(-value)}`;

  const parts: string[] = [];
  let n = value;
  let scale = 0;
  while (n > 0 && scale < SCALES.length) {
    const chunk = n % 1000;
    if (chunk) {
      const body = underThousand(chunk);
      const scaleWord = SCALES[scale]!;
      parts.unshift(scaleWord ? `${body} ${scaleWord}` : body);
    }
    n = Math.floor(n / 1000);
    scale += 1;
  }
  return parts.join(" و ");
}
