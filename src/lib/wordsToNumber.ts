/**
 * Persian words → integer (positive). Covers common spoken/written forms.
 */
const ONES: Record<string, number> = {
  صفر: 0,
  یک: 1,
  یه: 1,
  دو: 2,
  سه: 3,
  چهار: 4,
  پنج: 5,
  شش: 6,
  شیش: 6,
  هفت: 7,
  هشت: 8,
  نه: 9,
  ده: 10,
  یازده: 11,
  دوازده: 12,
  سیزده: 13,
  چهارده: 14,
  پانزده: 15,
  پونزده: 15,
  شانزده: 16,
  شونزده: 16,
  هفده: 17,
  هجده: 18,
  هیجده: 18,
  نوزده: 19,
};

const TENS: Record<string, number> = {
  بیست: 20,
  سی: 30,
  چهل: 40,
  پنجاه: 50,
  شصت: 60,
  هفتاد: 70,
  هشتاد: 80,
  نود: 90,
};

const HUNDREDS: Record<string, number> = {
  صد: 100,
  یکصد: 100,
  دویست: 200,
  سیصد: 300,
  چهارصد: 400,
  پانصد: 500,
  پونصد: 500,
  ششصد: 600,
  شیشصد: 600,
  هفتصد: 700,
  هشتصد: 800,
  نهصد: 900,
};

const SCALES: Record<string, number> = {
  هزار: 1_000,
  میلیون: 1_000_000,
  میلیارد: 1_000_000_000,
  بیلیون: 1_000_000_000,
  تریلیون: 1_000_000_000_000,
};

function tokenize(input: string): string[] {
  return input
    .replace(/[،,]/g, " ")
    .replace(/\s+و\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function persianWordsToInteger(text: string): number | null {
  const cleaned = text
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, " ")
    .trim();
  if (!cleaned) return null;

  let negative = false;
  let tokens = tokenize(cleaned);
  if (tokens[0] === "منفی" || tokens[0] === "منفى") {
    negative = true;
    tokens = tokens.slice(1);
  }

  let total = 0;
  let current = 0;
  let saw = false;

  for (const tok of tokens) {
    if (tok in ONES) {
      current += ONES[tok]!;
      saw = true;
      continue;
    }
    if (tok in TENS) {
      current += TENS[tok]!;
      saw = true;
      continue;
    }
    if (tok in HUNDREDS) {
      current += HUNDREDS[tok]!;
      saw = true;
      continue;
    }
    if (tok in SCALES) {
      const scale = SCALES[tok]!;
      if (current === 0) current = 1;
      total += current * scale;
      current = 0;
      saw = true;
      continue;
    }
    return null;
  }

  if (!saw) return null;
  total += current;
  return negative ? -total : total;
}
