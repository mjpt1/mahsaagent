import { generateTestNationalId, generateTestSheba } from "./generators.js";
import { listOrFindProvinces } from "./text.js";
import { searchOfficialCities } from "./officialGeo.js";

const FIRST = [
  "علی",
  "مریم",
  "رضا",
  "زهرا",
  "امیر",
  "سارا",
  "محمد",
  "فاطمه",
  "حسین",
  "نرگس",
];
const LAST = [
  "احمدی",
  "محمدی",
  "رضایی",
  "حسینی",
  "کریمی",
  "جعفری",
  "موسوی",
  "نوری",
  "صادقی",
  "اکبری",
];

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

export function generateMockUserProfile(seed?: number) {
  let s = seed ?? Date.now();
  s = (s * 1664525 + 1013904223) >>> 0;
  const firstName = pick(FIRST, s);
  const lastName = pick(LAST, s >>> 3);
  const provinces = listOrFindProvinces();
  const province = pick(provinces.provinces, s >>> 5).name;
  const cities = searchOfficialCities(province, 5).cities;
  const city = cities.length ? pick(cities, s >>> 7).name : province;
  const nationalId = generateTestNationalId(s);
  const mobile = `09${String(100000000 + (s % 900000000)).slice(0, 9)}`;
  const sheba = generateTestSheba("054", s >>> 9);
  const postalCode = String(1000000000 + (s % 8999999999)).slice(0, 10);

  return {
    profile: {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      nationalId,
      mobile,
      sheba,
      postalCode,
      province,
      city,
      addressLine: `خیابان نمونه، پلاک ${(s % 200) + 1}`,
    },
    disclaimer: "دادهٔ ساختگی برای تست/دمو — شناسه‌های مالی معتبر الگوریتمی اما واقعی نیستند.",
    seed: seed ?? null,
  };
}

export function generateTestDataBatch(
  kind: "users" | "mobiles" | "national_ids",
  count: number,
  seed?: number
) {
  const n = Math.min(Math.max(count, 1), 50);
  let s = seed ?? Date.now();
  const items: unknown[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345 + i) >>> 0;
    if (kind === "users") items.push(generateMockUserProfile(s).profile);
    else if (kind === "mobiles") items.push(`09${String(100000000 + (s % 900000000)).slice(0, 9)}`);
    else items.push(generateTestNationalId(s));
  }
  return { kind, count: n, items };
}
