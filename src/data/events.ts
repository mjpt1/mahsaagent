/**
 * Calendar events: fixed solar cultural + approximate religious (Hijri-anchored notes).
 * Religious dates may differ ±1 day from official announcement.
 */
import { EXTRA_RELIGIOUS_BY_YEAR } from "./lunarEvents.js";

export type CalendarEvent = {
  month: number;
  day: number;
  title: string;
  titleEn: string;
  kind: "official_solar" | "cultural_solar" | "religious_approx";
  approximate?: boolean;
};

/** Extra cultural solar observances (not always official public holidays). */
export const CULTURAL_SOLAR: CalendarEvent[] = [
  { month: 1, day: 1, title: "نوروز", titleEn: "Nowruz", kind: "cultural_solar" },
  { month: 1, day: 13, title: "سیزده‌بدر", titleEn: "Sizdah Bedar", kind: "cultural_solar" },
  { month: 2, day: 2, title: "روز معلم", titleEn: "Teachers' Day", kind: "cultural_solar" },
  { month: 5, day: 14, title: "روز قلم", titleEn: "Pen Day", kind: "cultural_solar" },
  { month: 7, day: 16, title: "مهرگان", titleEn: "Mehregan", kind: "cultural_solar" },
  { month: 8, day: 7, title: "روز کوروش", titleEn: "Cyrus Day (cultural)", kind: "cultural_solar" },
  { month: 9, day: 30, title: "شب یلدا", titleEn: "Yalda Night", kind: "cultural_solar" },
  { month: 10, day: 10, title: "جشن سده", titleEn: "Sadeh", kind: "cultural_solar" },
  {
    month: 12,
    day: 29,
    title: "روز ملی شدن صنعت نفت",
    titleEn: "Oil Nationalization Day",
    kind: "cultural_solar",
  },
];

/**
 * Approximate Jalali dates for common religious observances in 1404–1406.
 * Source: public calendars; treat as approximate.
 */
export const RELIGIOUS_BY_YEAR: Record<number, CalendarEvent[]> = {
  1404: [
    { month: 1, day: 13, title: "عید فطر (تقریبی)", titleEn: "Eid al-Fitr (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 23, title: "عید قربان (تقریبی)", titleEn: "Eid al-Adha (approx)", kind: "religious_approx", approximate: true },
    { month: 4, day: 14, title: "تاسوعا (تقریبی)", titleEn: "Tasua (approx)", kind: "religious_approx", approximate: true },
    { month: 4, day: 15, title: "عاشورا (تقریبی)", titleEn: "Ashura (approx)", kind: "religious_approx", approximate: true },
    ...(EXTRA_RELIGIOUS_BY_YEAR[1404] ?? []),
  ],
  1405: [
    { month: 1, day: 2, title: "عید فطر (تقریبی)", titleEn: "Eid al-Fitr (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 12, title: "عید قربان (تقریبی)", titleEn: "Eid al-Adha (approx)", kind: "religious_approx", approximate: true },
    { month: 4, day: 3, title: "تاسوعا (تقریبی)", titleEn: "Tasua (approx)", kind: "religious_approx", approximate: true },
    { month: 4, day: 4, title: "عاشورا (تقریبی)", titleEn: "Ashura (approx)", kind: "religious_approx", approximate: true },
    ...(EXTRA_RELIGIOUS_BY_YEAR[1405] ?? []),
  ],
  1406: [
    { month: 12, day: 21, title: "عید فطر (تقریبی)", titleEn: "Eid al-Fitr (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 1, title: "عید قربان (تقریبی)", titleEn: "Eid al-Adha (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 22, title: "تاسوعا (تقریبی)", titleEn: "Tasua (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 23, title: "عاشورا (تقریبی)", titleEn: "Ashura (approx)", kind: "religious_approx", approximate: true },
    ...(EXTRA_RELIGIOUS_BY_YEAR[1406] ?? []),
  ],
};

export function eventsForDate(year: number, month: number, day: number): CalendarEvent[] {
  const cultural = CULTURAL_SOLAR.filter((e) => e.month === month && e.day === day);
  const religious = (RELIGIOUS_BY_YEAR[year] ?? []).filter((e) => e.month === month && e.day === day);
  return [...cultural, ...religious];
}

export function eventsForYear(year: number): CalendarEvent[] {
  return [...CULTURAL_SOLAR, ...(RELIGIOUS_BY_YEAR[year] ?? [])];
}
