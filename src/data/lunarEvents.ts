/**
 * Approximate lunar/religious observances mapped onto Jalali calendars.
 * Official announcement may differ by ±1 day — treat as approximate.
 */
import type { CalendarEvent } from "./events.js";

/** Extra religious approx days beyond Fitr / Adha / Tasua / Ashura. */
export const EXTRA_RELIGIOUS_BY_YEAR: Record<number, CalendarEvent[]> = {
  1404: [
    { month: 1, day: 12, title: "لیلة‌القدر (تقریبی)", titleEn: "Laylat al-Qadr (approx)", kind: "religious_approx", approximate: true },
    { month: 2, day: 5, title: "مبعث (تقریبی)", titleEn: "Mab'ath (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 15, title: "ولادت امام علی (تقریبی)", titleEn: "Imam Ali birth (approx)", kind: "religious_approx", approximate: true },
    { month: 5, day: 24, title: "اربعین (تقریبی)", titleEn: "Arbaeen (approx)", kind: "religious_approx", approximate: true },
    { month: 6, day: 4, title: "رحلت پیامبر (تقریبی)", titleEn: "Prophet demise (approx)", kind: "religious_approx", approximate: true },
    { month: 6, day: 14, title: "ولادت پیامبر (تقریبی)", titleEn: "Prophet birth (approx)", kind: "religious_approx", approximate: true },
    { month: 9, day: 25, title: "شهادت فاطمه (تقریبی)", titleEn: "Fatima martyrdom (approx)", kind: "religious_approx", approximate: true },
    { month: 11, day: 22, title: "نیمه‌شعبان (تقریبی)", titleEn: "Mid-Sha'ban (approx)", kind: "religious_approx", approximate: true },
  ],
  1405: [
    { month: 1, day: 1, title: "لیلة‌القدر (تقریبی)", titleEn: "Laylat al-Qadr (approx)", kind: "religious_approx", approximate: true },
    { month: 1, day: 25, title: "مبعث (تقریبی)", titleEn: "Mab'ath (approx)", kind: "religious_approx", approximate: true },
    { month: 3, day: 4, title: "ولادت امام علی (تقریبی)", titleEn: "Imam Ali birth (approx)", kind: "religious_approx", approximate: true },
    { month: 5, day: 13, title: "اربعین (تقریبی)", titleEn: "Arbaeen (approx)", kind: "religious_approx", approximate: true },
    { month: 5, day: 23, title: "رحلت پیامبر (تقریبی)", titleEn: "Prophet demise (approx)", kind: "religious_approx", approximate: true },
    { month: 6, day: 3, title: "ولادت پیامبر (تقریبی)", titleEn: "Prophet birth (approx)", kind: "religious_approx", approximate: true },
    { month: 9, day: 14, title: "شهادت فاطمه (تقریبی)", titleEn: "Fatima martyrdom (approx)", kind: "religious_approx", approximate: true },
    { month: 11, day: 11, title: "نیمه‌شعبان (تقریبی)", titleEn: "Mid-Sha'ban (approx)", kind: "religious_approx", approximate: true },
  ],
  1406: [
    { month: 12, day: 20, title: "لیلة‌القدر (تقریبی)", titleEn: "Laylat al-Qadr (approx)", kind: "religious_approx", approximate: true },
    { month: 1, day: 14, title: "مبعث (تقریبی)", titleEn: "Mab'ath (approx)", kind: "religious_approx", approximate: true },
    { month: 2, day: 23, title: "ولادت امام علی (تقریبی)", titleEn: "Imam Ali birth (approx)", kind: "religious_approx", approximate: true },
    { month: 5, day: 2, title: "اربعین (تقریبی)", titleEn: "Arbaeen (approx)", kind: "religious_approx", approximate: true },
    { month: 5, day: 12, title: "رحلت پیامبر (تقریبی)", titleEn: "Prophet demise (approx)", kind: "religious_approx", approximate: true },
    { month: 5, day: 22, title: "ولادت پیامبر (تقریبی)", titleEn: "Prophet birth (approx)", kind: "religious_approx", approximate: true },
    { month: 9, day: 3, title: "شهادت فاطمه (تقریبی)", titleEn: "Fatima martyrdom (approx)", kind: "religious_approx", approximate: true },
    { month: 10, day: 30, title: "نیمه‌شعبان (تقریبی)", titleEn: "Mid-Sha'ban (approx)", kind: "religious_approx", approximate: true },
  ],
};
