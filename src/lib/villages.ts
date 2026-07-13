import villages from "../data/villages.json" with { type: "json" };
import { listCounties, listDistricts, addressCascade } from "./address.js";

export type Village = {
  id: number;
  name: string;
  provinceId: number;
  province: string;
  countyId: number;
  county: string;
  districtId: number;
  district: string;
  kind: string;
};

const VILLAGES = villages as Village[];

export function searchVillages(
  query: string,
  opts: { province?: string; county?: string; district?: string; limit?: number } = {}
) {
  const q = query.trim();
  let rows = VILLAGES;
  if (opts.province) rows = rows.filter((v) => v.province.includes(opts.province!));
  if (opts.county) rows = rows.filter((v) => v.county.includes(opts.county!));
  if (opts.district) rows = rows.filter((v) => v.district.includes(opts.district!));
  if (q) rows = rows.filter((v) => v.name.includes(q) || v.district.includes(q) || v.county.includes(q));
  const limit = opts.limit ?? 40;
  return { count: rows.length, villages: rows.slice(0, limit) };
}

export function villagesByDistrict(districtId: number, limit = 40) {
  const rows = VILLAGES.filter((v) => v.districtId === districtId);
  return { count: rows.length, villages: rows.slice(0, limit) };
}

export { listCounties, listDistricts, addressCascade, VILLAGES };
