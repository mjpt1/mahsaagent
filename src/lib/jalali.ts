import jalaali from "jalaali-js";
import { solarHolidaysOn, solarHolidaysInMonth, SOLAR_HOLIDAYS, type Holiday } from "../data/holidays.js";
import { JALALI_MONTHS_FA, JALALI_WEEKDAYS_FA, jalaliWeekdayIndex } from "../data/months.js";
import { digitsEnToFa, digitsFaToEn } from "@persian-tools/persian-tools";

export type JalaliParts = { year: number; month: number; day: number };

export function todayJalali(): JalaliParts {
  const now = new Date();
  const { jy, jm, jd } = jalaali.toJalaali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );
  return { year: jy, month: jm, day: jd };
}

export function gregorianToJalali(year: number, month: number, day: number): JalaliParts {
  const { jy, jm, jd } = jalaali.toJalaali(year, month, day);
  return { year: jy, month: jm, day: jd };
}

export function jalaliToGregorian(year: number, month: number, day: number): {
  year: number;
  month: number;
  day: number;
} {
  const { gy, gm, gd } = jalaali.toGregorian(year, month, day);
  return { year: gy, month: gm, day: gd };
}

export function formatJalali(
  parts: JalaliParts,
  options: { digits?: "fa" | "en"; separator?: string } = {}
): string {
  const sep = options.separator ?? "/";
  const y = String(parts.year);
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  const raw = `${y}${sep}${m}${sep}${d}`;
  if (options.digits === "fa") return digitsEnToFa(raw);
  return raw;
}

/** e.g. شنبه ۲۱ تیر ۱۴۰۵ */
export function formatJalaliLong(
  parts: JalaliParts,
  options: { digits?: "fa" | "en"; weekday?: boolean } = {}
): string {
  const g = jalaliToGregorian(parts.year, parts.month, parts.day);
  const date = new Date(g.year, g.month - 1, g.day);
  const monthName = JALALI_MONTHS_FA[parts.month - 1] ?? "";
  let dayStr = String(parts.day);
  let yearStr = String(parts.year);
  if (options.digits !== "en") {
    dayStr = digitsEnToFa(dayStr);
    yearStr = digitsEnToFa(yearStr);
  }
  const body = `${dayStr} ${monthName} ${yearStr}`;
  if (options.weekday === false) return body;
  const wd = JALALI_WEEKDAYS_FA[jalaliWeekdayIndex(date)] ?? "";
  return `${wd} ${body}`;
}

export function isValidJalali(year: number, month: number, day: number): boolean {
  return jalaali.isValidJalaaliDate(year, month, day);
}

export function isLeapJalaliYear(year: number): boolean {
  return jalaali.isLeapJalaaliYear(year);
}

export function jalaliMonthLength(year: number, month: number): number {
  return jalaali.jalaaliMonthLength(year, month);
}

export function holidaysForJalaliDate(year: number, month: number, day: number): Holiday[] {
  void year;
  return solarHolidaysOn(month, day);
}

export function holidaysForJalaliMonth(month: number): Holiday[] {
  return solarHolidaysInMonth(month);
}

export function allSolarHolidays(): Holiday[] {
  return [...SOLAR_HOLIDAYS];
}

export function addJalaliDays(parts: JalaliParts, days: number): JalaliParts {
  const g = jalaliToGregorian(parts.year, parts.month, parts.day);
  const d = new Date(g.year, g.month - 1, g.day);
  d.setDate(d.getDate() + days);
  return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function diffJalaliDays(a: JalaliParts, b: JalaliParts): number {
  const ga = jalaliToGregorian(a.year, a.month, a.day);
  const gb = jalaliToGregorian(b.year, b.month, b.day);
  const da = Date.UTC(ga.year, ga.month - 1, ga.day);
  const db = Date.UTC(gb.year, gb.month - 1, gb.day);
  return Math.round((da - db) / 86_400_000);
}

export function parseJalaliString(input: string): JalaliParts | null {
  const en = digitsFaToEn(input.trim());
  const m = en.match(/^(\d{3,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!isValidJalali(year, month, day)) return null;
  return { year, month, day };
}
