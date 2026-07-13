/**
 * Finglish ↔ Persian helpers for search / slug UX.
 */
const MAP: Array<[string, string]> = [
  ["kh", "خ"],
  ["gh", "ق"],
  ["sh", "ش"],
  ["ch", "چ"],
  ["zh", "ژ"],
  ["aa", "آ"],
  ["a", "ا"],
  ["b", "ب"],
  ["p", "پ"],
  ["t", "ت"],
  ["s", "س"],
  ["j", "ج"],
  ["h", "ه"],
  ["d", "د"],
  ["r", "ر"],
  ["z", "ز"],
  ["f", "ف"],
  ["q", "ق"],
  ["k", "ک"],
  ["g", "گ"],
  ["l", "ل"],
  ["m", "م"],
  ["n", "ن"],
  ["v", "و"],
  ["w", "و"],
  ["y", "ی"],
  ["i", "ی"],
  ["e", "ه"],
  ["o", "و"],
  ["u", "و"],
];

const PHRASES: Record<string, string> = {
  salam: "سلام",
  farda: "فردا",
  emrooz: "امروز",
  emruz: "امروز",
  diruz: "دیروز",
  merci: "مرسی",
  khoda: "خدا",
  iran: "ایران",
  tehran: "تهران",
  esfahan: "اصفهان",
  shiraz: "شیراز",
};

/** Best-effort Finglish → Persian (word and letter heuristics). */
export function finglishToPersian(input: string): string {
  const words = input.trim().split(/\s+/);
  return words
    .map((w) => {
      const lower = w.toLowerCase();
      if (PHRASES[lower]) return PHRASES[lower];
      let rest = lower;
      let out = "";
      while (rest.length) {
        let matched = false;
        for (const [lat, fa] of MAP) {
          if (rest.startsWith(lat)) {
            out += fa;
            rest = rest.slice(lat.length);
            matched = true;
            break;
          }
        }
        if (!matched) {
          out += rest[0];
          rest = rest.slice(1);
        }
      }
      return out;
    })
    .join(" ");
}

/** Very rough Persian → Finglish for search keys. */
export function persianToFinglish(input: string): string {
  const rev: Record<string, string> = {
    آ: "a",
    ا: "a",
    ب: "b",
    پ: "p",
    ت: "t",
    ث: "s",
    ج: "j",
    چ: "ch",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "z",
    ر: "r",
    ز: "z",
    ژ: "zh",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "z",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "gh",
    ک: "k",
    گ: "g",
    ل: "l",
    م: "m",
    ن: "n",
    و: "v",
    ه: "h",
    ی: "i",
    ء: "",
    ئ: "i",
    ؤ: "o",
  };
  return [...input]
    .map((ch) => rev[ch] ?? ch)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
