/**
 * Persian natural-language → Jalali date (best-effort).
 */
import { digitsFaToEn } from "@persian-tools/persian-tools";
import {
  todayJalali,
  addJalaliDays,
  jalaliMonthLength,
  jalaliToGregorian,
  type JalaliParts,
} from "./jalali.js";
import { JALALI_MONTHS_FA } from "../data/months.js";

const WEEKDAYS: Record<string, number> = {
  شنبه: 0,
  یکشنبه: 1,
  دوشنبه: 2,
  سه‌شنبه: 3,
  سهشنبه: 3,
  چهارشنبه: 4,
  پنجشنبه: 5,
  جمعه: 6,
};

const FINGLISH: Record<string, string> = {
  emrooz: "امروز",
  emruz: "امروز",
  farda: "فردا",
  diruz: "دیروز",
  derooz: "دیروز",
  hafte: "هفته",
  mah: "ماه",
  sal: "سال",
};

const NUMBER_WORDS: Record<string, number> = {
  یک: 1,
  دو: 2,
  سه: 3,
  چهار: 4,
  پنج: 5,
  شش: 6,
  هفت: 7,
  هشت: 8,
  نه: 9,
  ده: 10,
  یازده: 11,
  دوازده: 12,
  سیزده: 13,
  چهارده: 14,
  پانزده: 15,
  شانزده: 16,
  هفده: 17,
  هجده: 18,
  نوزده: 19,
  بیست: 20,
  سی: 30,
};

function normalizeNlpInput(raw: string): string {
  let t = digitsFaToEn(raw).trim().toLowerCase();
  for (const [en, fa] of Object.entries(FINGLISH)) {
    t = t.replace(new RegExp(`\\b${en}\\b`, "gi"), fa);
  }
  return t.replace(/\s+/g, " ");
}

function parseDayWord(token: string): number | null {
  if (/^\d{1,2}$/.test(token)) return Number(token);
  return NUMBER_WORDS[token] ?? null;
}

/** JS getUTCDay Sun=0..Sat=6 → Iran week شنبه=0..جمعه=6 */
function jsToIranWeekday(jsDay: number): number {
  return (jsDay + 1) % 7;
}

export type ParsedPersianDate = {
  ok: boolean;
  parts: JalaliParts | null;
  confidence: number;
  matched: string;
  note?: string;
};

/** Parse relative/absolute Persian date phrases into Jalali parts. */
export function parsePersianDatePhrase(input: string, now = todayJalali()): ParsedPersianDate {
  const text = normalizeNlpInput(input);
  if (!text) return { ok: false, parts: null, confidence: 0, matched: "", note: "empty" };

  if (text === "امروز" || text === "الان" || /^همین\s*الان$/.test(text)) {
    return { ok: true, parts: now, confidence: 0.99, matched: "امروز" };
  }
  if (text.includes("فردا") && !text.includes("پس")) {
    return { ok: true, parts: addJalaliDays(now, 1), confidence: 0.95, matched: "فردا" };
  }
  if (text.includes("پس‌فردا") || text.includes("پسفردا") || text.includes("پس فردا")) {
    return { ok: true, parts: addJalaliDays(now, 2), confidence: 0.9, matched: "پس‌فردا" };
  }
  if (text.includes("دیروز")) {
    return { ok: true, parts: addJalaliDays(now, -1), confidence: 0.95, matched: "دیروز" };
  }
  if (text.includes("پریروز")) {
    return { ok: true, parts: addJalaliDays(now, -2), confidence: 0.9, matched: "پریروز" };
  }
  if (/هفته\s*(ی\s*)?(بعد|آینده)/.test(text)) {
    return { ok: true, parts: addJalaliDays(now, 7), confidence: 0.75, matched: "هفته بعد" };
  }

  for (let i = 0; i < JALALI_MONTHS_FA.length; i++) {
    const monthName = JALALI_MONTHS_FA[i]!;
    if (!text.includes(monthName)) continue;
    const month = i + 1;
    const yearMatch = text.match(/(13|14)\d{2}/);
    const year = yearMatch ? Number(yearMatch[0]) : now.year;
    const before = text.split(monthName)[0] ?? "";
    const dayTokens = before.replace(/م\b/g, "").trim().split(/\s+/).filter(Boolean);
    let day = 1;
    if (dayTokens.length) {
      if (dayTokens.length >= 3 && dayTokens[dayTokens.length - 2] === "و") {
        const a = parseDayWord(dayTokens[dayTokens.length - 3]!);
        const b = parseDayWord(dayTokens[dayTokens.length - 1]!.replace(/ام$|م$/, ""));
        if (a != null && b != null) day = a + b;
      } else {
        const d = parseDayWord(dayTokens[dayTokens.length - 1]!.replace(/ام$|م$/, ""));
        if (d) day = d;
      }
    }
    const max = jalaliMonthLength(year, month);
    if (day < 1 || day > max) {
      return { ok: false, parts: null, confidence: 0.4, matched: monthName, note: "invalid_day" };
    }
    return {
      ok: true,
      parts: { year, month, day },
      confidence: 0.85,
      matched: `${day} ${monthName} ${year}`,
    };
  }

  for (const [name, target] of Object.entries(WEEKDAYS)) {
    if (!text.includes(name)) continue;
    const g = jalaliToGregorian(now.year, now.month, now.day);
    const js = new Date(Date.UTC(g.year, g.month - 1, g.day));
    const curIran = jsToIranWeekday(js.getUTCDay());
    let delta = (target - curIran + 7) % 7;
    if (delta === 0 && !text.includes("این")) delta = 7;
    return {
      ok: true,
      parts: addJalaliDays(now, delta),
      confidence: 0.7,
      matched: name,
      note: "weekday_next",
    };
  }

  return { ok: false, parts: null, confidence: 0, matched: text, note: "unrecognized" };
}
