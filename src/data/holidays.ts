/**
 * Official fixed solar (Jalali) holidays for Iran.
 * Religious/lunar dates move each year — those are not listed here as exact days.
 */
export type Holiday = {
  month: number;
  day: number;
  title: string;
  titleEn: string;
};

export const SOLAR_HOLIDAYS: Holiday[] = [
  { month: 1, day: 1, title: "جشن نوروز", titleEn: "Nowruz" },
  { month: 1, day: 2, title: "عید نوروز", titleEn: "Nowruz holiday" },
  { month: 1, day: 3, title: "عید نوروز", titleEn: "Nowruz holiday" },
  { month: 1, day: 4, title: "عید نوروز", titleEn: "Nowruz holiday" },
  { month: 1, day: 12, title: "روز جمهوری اسلامی", titleEn: "Islamic Republic Day" },
  { month: 1, day: 13, title: "روز طبیعت", titleEn: "Nature Day (Sizdah Bedar)" },
  { month: 3, day: 14, title: "رحلت امام خمینی", titleEn: "Demise of Imam Khomeini" },
  { month: 3, day: 15, title: "قیام ۱۵ خرداد", titleEn: "15 Khordad uprising" },
  { month: 11, day: 22, title: "پیروزی انقلاب اسلامی", titleEn: "Victory of the Islamic Revolution" },
  { month: 12, day: 29, title: "ملی شدن صنعت نفت", titleEn: "Nationalization of Oil Industry" },
];

export function solarHolidaysOn(month: number, day: number): Holiday[] {
  return SOLAR_HOLIDAYS.filter((h) => h.month === month && h.day === day);
}

export function solarHolidaysInMonth(month: number): Holiday[] {
  return SOLAR_HOLIDAYS.filter((h) => h.month === month);
}
