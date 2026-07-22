/**
 * Parse Persian scheduling phrases: date + optional time.
 * e.g. «پس‌فردا ساعت ۳»، «فردا ۱۴:۳۰»، «شنبه ۹ صبح»
 */
import { digitsFaToEn } from "@persian-tools/persian-tools";
import { parsePersianDatePhrase, type ParsedPersianDate } from "./dateNlp.js";
import { formatJalali, jalaliToGregorian, todayJalali } from "./jalali.js";

const TIME_WORDS: Record<string, number> = {
  "نیم‌شب": 0,
  "نیمشب": 0,
  "صبح": 9,
  "ظهر": 12,
  "بعدازظهر": 15,
  "عصر": 17,
  "شب": 20,
};

function parseTime(text: string): { hour: number; minute: number; matched: string } | null {
  const t = digitsFaToEn(text).replace(/\s+/g, " ");
  for (const [word, hour] of Object.entries(TIME_WORDS)) {
    if (t.includes(word)) return { hour, minute: 0, matched: word };
  }
  const colon = t.match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
  if (colon) {
    return {
      hour: Math.min(23, Number(colon[1])),
      minute: Math.min(59, Number(colon[2])),
      matched: colon[0],
    };
  }
  const saat = t.match(/ساعت\s*(\d{1,2})(?:\s*[:：]\s*(\d{2}))?/);
  if (saat) {
    return {
      hour: Math.min(23, Number(saat[1])),
      minute: saat[2] ? Math.min(59, Number(saat[2])) : 0,
      matched: saat[0],
    };
  }
  const bare = t.match(/\b(\d{1,2})\s*(?:صبح|عصر|شب)?\b/);
  if (bare && Number(bare[1]) <= 23) {
    let hour = Number(bare[1]);
    if (t.includes("عصر") && hour < 12) hour += 12;
    return { hour, minute: 0, matched: bare[0] };
  }
  return null;
}

export type ScheduledSlot = {
  ok: boolean;
  jalali: ParsedPersianDate;
  time: { hour: number; minute: number; matched: string } | null;
  isoLocal?: string;
  formattedFa?: string;
  note?: string;
};

export function parsePersianSchedulePhrase(input: string, now = todayJalali()): ScheduledSlot {
  const text = input.trim();
  const jalali = parsePersianDatePhrase(text, now);
  const time = parseTime(text);
  if (!jalali.ok || !jalali.parts) {
    return { ok: false, jalali, time, note: jalali.note ?? "date_unrecognized" };
  }
  const { year, month, day } = jalali.parts;
  const g = jalaliToGregorian(year, month, day);
  const hour = time?.hour ?? 0;
  const minute = time?.minute ?? 0;
  const isoLocal = `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return {
    ok: true,
    jalali,
    time,
    isoLocal,
    formattedFa: `${formatJalali(jalali.parts, { digits: "fa" })}${time ? ` ساعت ${hour}:${String(minute).padStart(2, "0")}` : ""}`,
    note: time ? undefined : "time_default_midnight",
  };
}
