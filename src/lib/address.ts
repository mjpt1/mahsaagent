import counties from "../data/counties.json" with { type: "json" };
import districts from "../data/districts.json" with { type: "json" };
import cities from "../data/cities.json" with { type: "json" };
import { PROVINCES } from "../data/provinces.js";
import { searchCities } from "./geo.js";

type County = { id: number; name: string; provinceId: number; province: string };
type District = {
  id: number;
  name: string;
  provinceId: number;
  province: string;
  countyId: number;
  county: string;
};
type City = { id: number; name: string; provinceId: number; province: string };

const COUNTIES = counties as County[];
const DISTRICTS = districts as District[];
const CITIES = cities as City[];

export function listCounties(province?: string, limit = 50) {
  let rows = COUNTIES;
  if (province) rows = rows.filter((c) => c.province.includes(province));
  return { count: rows.length, counties: rows.slice(0, limit) };
}

export function listDistricts(opts: { province?: string; county?: string; limit?: number }) {
  let rows = DISTRICTS;
  if (opts.province) rows = rows.filter((d) => d.province.includes(opts.province!));
  if (opts.county) rows = rows.filter((d) => d.county.includes(opts.county!));
  const limit = opts.limit ?? 50;
  return { count: rows.length, districts: rows.slice(0, limit) };
}

/** Cascading address helper for forms. */
export function addressCascade(input: {
  province?: string;
  county?: string;
  cityQuery?: string;
}) {
  const provinces = PROVINCES.map((p) => ({ name: p.name, capital: p.capital, nameEn: p.nameEn }));
  const counties = input.province
    ? listCounties(input.province, 100).counties
    : [];
  const districts = input.county
    ? listDistricts({ province: input.province, county: input.county, limit: 100 }).districts
    : [];
  const cities = input.cityQuery
    ? searchCities(input.cityQuery, 30).cities
    : input.province
      ? CITIES.filter((c) => c.province.includes(input.province!)).slice(0, 40)
      : [];
  return {
    provinces,
    counties,
    districts,
    cities,
    hint: "province → county → district/city",
  };
}
