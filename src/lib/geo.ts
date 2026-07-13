import cities from "../data/cities.json" with { type: "json" };
import provincesFull from "../data/provinces-full.json" with { type: "json" };
import { POSTAL_PREFIX_TO_PROVINCE } from "../data/postal.js";
import { PROVINCES } from "../data/provinces.js";
import { digitsFaToEn } from "@persian-tools/persian-tools";

export type CityRow = {
  id: number;
  name: string;
  provinceId: number;
  province: string;
};

export type ProvinceFull = {
  id: number;
  name: string;
  slug: string;
  tel_prefix?: string;
};

const CITY_LIST = cities as CityRow[];
const PROV_FULL = provincesFull as ProvinceFull[];

export function searchCities(query: string, limit = 20) {
  const q = query.trim();
  if (!q) {
    return { count: CITY_LIST.length, cities: CITY_LIST.slice(0, limit), total: CITY_LIST.length };
  }
  const found = CITY_LIST.filter(
    (c) => c.name.includes(q) || c.province.includes(q)
  );
  return { count: found.length, cities: found.slice(0, limit), total: CITY_LIST.length };
}

export function citiesByProvince(provinceName: string, limit = 50) {
  const found = CITY_LIST.filter(
    (c) => c.province === provinceName || c.province.includes(provinceName)
  );
  return { province: provinceName, count: found.length, cities: found.slice(0, limit) };
}

export function lookupPostalCode(code: string) {
  const normalized = digitsFaToEn(code).replace(/\D/g, "");
  const formatOk = /^[1-9]\d{9}$/.test(normalized);
  const prefix2 = normalized.slice(0, 2);
  const province = POSTAL_PREFIX_TO_PROVINCE[prefix2] ?? null;
  return {
    valid: formatOk,
    normalized,
    prefix: prefix2 || null,
    province,
    note: province
      ? "Province inferred from postal prefix (approximate)."
      : formatOk
        ? "Format OK; province prefix not in local map."
        : "Invalid postal format (expect 10 digits, not starting with 0).",
  };
}

export function lookupLandline(phone: string) {
  const normalized = digitsFaToEn(phone).replace(/[\s-]/g, "");
  let digits = normalized.replace(/^\+?98/, "0");
  if (!digits.startsWith("0") && digits.length >= 10) digits = "0" + digits;

  // Match longest tel_prefix from provinces (e.g. 021, 031, 071)
  const withPrefix = [...PROV_FULL]
    .filter((p) => p.tel_prefix)
    .sort((a, b) => (b.tel_prefix!.length - a.tel_prefix!.length));

  for (const p of withPrefix) {
    const pref = p.tel_prefix!.startsWith("0") ? p.tel_prefix! : `0${p.tel_prefix}`;
    if (digits.startsWith(pref)) {
      return {
        valid: digits.length >= 10 && digits.length <= 11,
        normalized: digits,
        areaCode: pref,
        province: p.name,
        capitalHint: PROVINCES.find((x) => x.name === p.name)?.capital ?? null,
      };
    }
  }

  // Fallback: 3-digit area like 021
  const m = digits.match(/^(0\d{2,3})/);
  return {
    valid: false,
    normalized: digits,
    areaCode: m?.[1] ?? null,
    province: null,
    capitalHint: null,
    note: "Area code not found in local province tel_prefix map.",
  };
}

export function listProvinceTelPrefixes() {
  return PROV_FULL.filter((p) => p.tel_prefix).map((p) => ({
    province: p.name,
    telPrefix: p.tel_prefix!.startsWith("0") ? p.tel_prefix : `0${p.tel_prefix}`,
  }));
}
