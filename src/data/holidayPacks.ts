/**
 * Year-pack holidays: official solar + curated religious (approx ±1 day).
 * Used by jalali_holidays / business-day checks when year is known.
 */
import { SOLAR_HOLIDAYS, type Holiday } from "./holidays.js";
import { RELIGIOUS_BY_YEAR, type CalendarEvent } from "./events.js";

export type YearHoliday = Holiday & {
  kind: "official_solar" | "religious_approx";
  approximate?: boolean;
};

export function holidaysForYear(year: number): YearHoliday[] {
  const solar: YearHoliday[] = SOLAR_HOLIDAYS.map((h) => ({
    ...h,
    kind: "official_solar" as const,
  }));
  const religious: YearHoliday[] = (RELIGIOUS_BY_YEAR[year] ?? []).map((e: CalendarEvent) => ({
    month: e.month,
    day: e.day,
    title: e.title,
    titleEn: e.titleEn,
    kind: "religious_approx" as const,
    approximate: true,
  }));
  return [...solar, ...religious].sort((a, b) => a.month - b.month || a.day - b.day);
}

export function isHolidayDate(year: number, month: number, day: number): YearHoliday[] {
  return holidaysForYear(year).filter((h) => h.month === month && h.day === day);
}
