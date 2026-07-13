import {
  todayJalali,
  addJalaliDays,
  isValidJalali,
  jalaliToGregorian,
  holidaysForJalaliDate,
  allSolarHolidays,
  type JalaliParts,
} from "./jalali.js";
import { jalaliWeekdayIndex } from "../data/months.js";

/** Friday = weekend in Iran (weekdayIndex 6). Optionally treat Thursday afternoon — we mark Friday only. */
export function isWeekendJalali(parts: JalaliParts): boolean {
  const g = jalaliToGregorian(parts.year, parts.month, parts.day);
  const d = new Date(g.year, g.month - 1, g.day);
  return jalaliWeekdayIndex(d) === 6; // جمعه
}

export function isOfficialSolarHoliday(parts: JalaliParts): boolean {
  return holidaysForJalaliDate(parts.year, parts.month, parts.day).length > 0;
}

export function isBusinessDay(parts: JalaliParts): boolean {
  if (!isValidJalali(parts.year, parts.month, parts.day)) return false;
  if (isWeekendJalali(parts)) return false;
  if (isOfficialSolarHoliday(parts)) return false;
  return true;
}

export function nextBusinessDay(parts: JalaliParts, maxLookahead = 30): JalaliParts {
  let cur = { ...parts };
  for (let i = 0; i < maxLookahead; i++) {
    cur = addJalaliDays(cur, 1);
    if (isBusinessDay(cur)) return cur;
  }
  return cur;
}

export function businessDaysBetween(from: JalaliParts, to: JalaliParts): number {
  let a = { ...from };
  let count = 0;
  // inclusive of neither endpoints' direction: count days strictly after from until to inclusive? 
  // Count business days in (from, to] by walking
  const steps = Math.abs(
    (() => {
      const ga = jalaliToGregorian(from.year, from.month, from.day);
      const gb = jalaliToGregorian(to.year, to.month, to.day);
      return Math.round(
        (Date.UTC(gb.year, gb.month - 1, gb.day) - Date.UTC(ga.year, ga.month - 1, ga.day)) /
          86_400_000
      );
    })()
  );
  const dir = (() => {
    const ga = jalaliToGregorian(from.year, from.month, from.day);
    const gb = jalaliToGregorian(to.year, to.month, to.day);
    return Date.UTC(gb.year, gb.month - 1, gb.day) >= Date.UTC(ga.year, ga.month - 1, ga.day)
      ? 1
      : -1;
  })();
  for (let i = 0; i < steps; i++) {
    a = addJalaliDays(a, dir);
    if (isBusinessDay(a)) count += 1;
  }
  return count;
}

export function todayBusinessInfo() {
  const t = todayJalali();
  return {
    date: t,
    isBusinessDay: isBusinessDay(t),
    isWeekend: isWeekendJalali(t),
    isHoliday: isOfficialSolarHoliday(t),
    holidays: holidaysForJalaliDate(t.year, t.month, t.day),
    nextBusinessDay: nextBusinessDay(t),
    allSolarHolidays: allSolarHolidays(),
  };
}
