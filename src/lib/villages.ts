/**
 * Official villages/abadi — iran-cities v3 (no placeholder data).
 */
export {
  listDehestan,
  listBakhsh,
  listShahrestan,
  officialAddressCascade as addressCascade,
  officialMeta,
} from "./officialGeo.js";

import {
  searchOfficialVillages,
} from "./officialGeo.js";
import abadi from "../data/official/abadi.json" with { type: "json" };
import ostan from "../data/official/ostan.json" with { type: "json" };
import shahrestan from "../data/official/shahrestan.json" with { type: "json" };

type AbadiRow = [number, string, number, number, number, number, number];
const ABADI = abadi as AbadiRow[];
const OSTAN = ostan as Array<{ id: number; name: string }>;
const SHAHRESTAN = shahrestan as Array<{ id: number; name: string }>;

/** Compatible search: accepts province/county aliases used by older callers. */
export function searchVillages(
  query: string,
  opts: {
    province?: string;
    county?: string;
    district?: string;
    ostan?: string;
    shahrestan?: string;
    dehestan?: string;
    limit?: number;
  } = {}
) {
  return searchOfficialVillages(query, {
    ostan: opts.ostan ?? opts.province,
    shahrestan: opts.shahrestan ?? opts.county,
    dehestan: opts.dehestan ?? opts.district,
    limit: opts.limit,
  });
}

export function villagesByDistrict(dehestanId: number, limit = 40) {
  const ostanName = (id: number) => OSTAN.find((o) => o.id === id)?.name ?? String(id);
  const countyName = (id: number) => SHAHRESTAN.find((s) => s.id === id)?.name ?? String(id);
  const villages = [];
  for (const row of ABADI) {
    const [id, name, oId, sId, bId, dId, type] = row;
    if (dId !== dehestanId) continue;
    villages.push({
      id,
      name,
      province: ostanName(oId),
      county: countyName(sId),
      bakhshId: bId,
      dehestanId: dId,
      type,
    });
    if (villages.length >= limit) break;
  }
  return { count: villages.length, villages, source: "iran-cities-v3" as const };
}
