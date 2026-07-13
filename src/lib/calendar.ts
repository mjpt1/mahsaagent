import {
  jalaliMonthLength,
  isValidJalali,
  jalaliToGregorian,
  formatJalali,
  formatJalaliLong,
  holidaysForJalaliDate,
  type JalaliParts,
} from "./jalali.js";
import { JALALI_WEEKDAYS_FA, jalaliWeekdayIndex } from "../data/months.js";

export type CalendarDay = {
  day: number;
  weekday: string;
  weekdayIndex: number;
  formatted: string;
  holidays: ReturnType<typeof holidaysForJalaliDate>;
};

/** Build day list for a Jalali month. */
export function jalaliMonthCalendar(
  year: number,
  month: number,
  digits: "fa" | "en" = "fa"
): { year: number; month: number; days: CalendarDay[] } | { error: string } {
  if (month < 1 || month > 12) return { error: "month must be 1–12" };
  if (!isValidJalali(year, month, 1)) return { error: "invalid year/month" };
  const len = jalaliMonthLength(year, month);
  const days: CalendarDay[] = [];
  for (let day = 1; day <= len; day++) {
    const parts: JalaliParts = { year, month, day };
    const g = jalaliToGregorian(year, month, day);
    const date = new Date(g.year, g.month - 1, g.day);
    const wi = jalaliWeekdayIndex(date);
    days.push({
      day,
      weekday: JALALI_WEEKDAYS_FA[wi] ?? "",
      weekdayIndex: wi,
      formatted: formatJalali(parts, { digits }),
      holidays: holidaysForJalaliDate(year, month, day),
    });
  }
  return { year, month, days };
}

export function summarizeMonth(year: number, month: number, digits: "fa" | "en" = "fa") {
  const cal = jalaliMonthCalendar(year, month, digits);
  if ("error" in cal) return cal;
  const holidayDays = cal.days.filter((d) => d.holidays.length > 0);
  return {
    year,
    month,
    length: cal.days.length,
    holidayCount: holidayDays.length,
    holidays: holidayDays.map((d) => ({
      day: d.day,
      formatted: d.formatted,
      titles: d.holidays.map((h) => h.title),
    })),
    sampleLong: formatJalaliLong({ year, month, day: 1 }, { digits }),
  };
}
