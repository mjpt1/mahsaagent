import ostan from "../data/official/ostan.json" with { type: "json" };
import shahrestan from "../data/official/shahrestan.json" with { type: "json" };
import bakhsh from "../data/official/bakhsh.json" with { type: "json" };
import dehestan from "../data/official/dehestan.json" with { type: "json" };
import shahr from "../data/official/shahr.json" with { type: "json" };
import abadi from "../data/official/abadi.json" with { type: "json" };
import meta from "../data/official/meta.json" with { type: "json" };

export type OfficialOstan = { id: number; name: string; amarCode: string };
export type OfficialShahrestan = { id: number; name: string; ostanId: number; amarCode: string };
export type OfficialBakhsh = {
  id: number;
  name: string;
  ostanId: number;
  shahrestanId: number;
  amarCode: string;
};
export type OfficialDehestan = {
  id: number;
  name: string;
  ostanId: number;
  shahrestanId: number;
  bakhshId: number;
  amarCode: string;
};
export type OfficialShahr = {
  id: number;
  name: string;
  type: number;
  ostanId: number;
  shahrestanId: number;
  bakhshId: number;
  amarCode: string;
};

/** Compact: [id, name, ostanId, shahrestanId, bakhshId, dehestanId, type] */
type AbadiRow = [number, string, number, number, number, number, number];

const OSTAN = ostan as OfficialOstan[];
const SHAHRESTAN = shahrestan as OfficialShahrestan[];
const BAKHSH = bakhsh as OfficialBakhsh[];
const DEHESTAN = dehestan as OfficialDehestan[];
const SHAHR = shahr as OfficialShahr[];
const ABADI = abadi as AbadiRow[];

const ostanName = (id: number) => OSTAN.find((o) => o.id === id)?.name ?? String(id);
const shahrestanName = (id: number) => SHAHRESTAN.find((s) => s.id === id)?.name ?? String(id);

export function officialMeta() {
  return meta;
}

export function listOfficialOstans() {
  return { count: OSTAN.length, provinces: OSTAN };
}

export function listShahrestan(ostanQuery?: string, limit = 80) {
  let rows = SHAHRESTAN;
  if (ostanQuery) {
    const o = OSTAN.find((x) => x.name.includes(ostanQuery));
    if (o) rows = rows.filter((r) => r.ostanId === o.id);
    else rows = rows.filter((r) => ostanName(r.ostanId).includes(ostanQuery));
  }
  return {
    count: rows.length,
    counties: rows.slice(0, limit).map((r) => ({
      ...r,
      province: ostanName(r.ostanId),
    })),
  };
}

export function listBakhsh(opts: { ostan?: string; shahrestan?: string; limit?: number }) {
  let rows = BAKHSH;
  if (opts.ostan) {
    const o = OSTAN.find((x) => x.name.includes(opts.ostan!));
    if (o) rows = rows.filter((r) => r.ostanId === o.id);
  }
  if (opts.shahrestan) {
    rows = rows.filter(
      (r) =>
        shahrestanName(r.shahrestanId).includes(opts.shahrestan!) ||
        String(r.shahrestanId) === opts.shahrestan
    );
  }
  const limit = opts.limit ?? 80;
  return {
    count: rows.length,
    districts: rows.slice(0, limit).map((r) => ({
      ...r,
      province: ostanName(r.ostanId),
      county: shahrestanName(r.shahrestanId),
    })),
  };
}

export function listDehestan(opts: { ostan?: string; shahrestan?: string; limit?: number }) {
  let rows = DEHESTAN;
  if (opts.ostan) {
    const o = OSTAN.find((x) => x.name.includes(opts.ostan!));
    if (o) rows = rows.filter((r) => r.ostanId === o.id);
  }
  if (opts.shahrestan) {
    rows = rows.filter((r) => shahrestanName(r.shahrestanId).includes(opts.shahrestan!));
  }
  const limit = opts.limit ?? 80;
  return {
    count: rows.length,
    ruralDistricts: rows.slice(0, limit).map((r) => ({
      ...r,
      province: ostanName(r.ostanId),
      county: shahrestanName(r.shahrestanId),
    })),
  };
}

export function searchOfficialCities(query: string, limit = 40) {
  const q = query.trim();
  let rows = SHAHR;
  if (q) rows = rows.filter((c) => c.name.includes(q) || ostanName(c.ostanId).includes(q));
  return {
    count: rows.length,
    cities: rows.slice(0, limit).map((c) => ({
      ...c,
      province: ostanName(c.ostanId),
      county: shahrestanName(c.shahrestanId),
    })),
  };
}

export function searchOfficialVillages(
  query: string,
  opts: { ostan?: string; shahrestan?: string; dehestan?: string; limit?: number } = {}
) {
  const q = query.trim();
  const limit = opts.limit ?? 40;
  let ostanId: number | undefined;
  if (opts.ostan) ostanId = OSTAN.find((o) => o.name.includes(opts.ostan!))?.id;

  const out: Array<{
    id: number;
    name: string;
    province: string;
    county: string;
    bakhshId: number;
    dehestanId: number;
    type: number;
  }> = [];

  for (const row of ABADI) {
    const [id, name, oId, sId, bId, dId, type] = row;
    if (ostanId != null && oId !== ostanId) continue;
    if (opts.shahrestan && !shahrestanName(sId).includes(opts.shahrestan)) continue;
    if (opts.dehestan) {
      const d = DEHESTAN.find((x) => x.id === dId);
      if (!d?.name.includes(opts.dehestan)) continue;
    }
    if (q && !name.includes(q)) continue;
    out.push({
      id,
      name,
      province: ostanName(oId),
      county: shahrestanName(sId),
      bakhshId: bId,
      dehestanId: dId,
      type,
    });
    if (out.length >= limit) break;
  }

  return { count: out.length, villages: out, source: "iran-cities-v3" };
}

export function officialAddressCascade(input: {
  ostan?: string;
  shahrestan?: string;
  cityQuery?: string;
}) {
  const provinces = OSTAN;
  const counties = input.ostan ? listShahrestan(input.ostan, 120).counties : [];
  const districts = input.shahrestan
    ? listBakhsh({ ostan: input.ostan, shahrestan: input.shahrestan, limit: 120 }).districts
    : [];
  const ruralDistricts = input.shahrestan
    ? listDehestan({ ostan: input.ostan, shahrestan: input.shahrestan, limit: 120 }).ruralDistricts
    : [];
  const cities = input.cityQuery
    ? searchOfficialCities(input.cityQuery, 40).cities
    : input.ostan
      ? searchOfficialCities(input.ostan, 40).cities.filter((c) =>
          input.ostan ? c.province.includes(input.ostan) : true
        )
      : [];
  return {
    hint: "ostan → shahrestan → bakhsh/dehestan → shahr/abadi",
    source: "ahmadazizi/iran-cities v3",
    provinces,
    counties,
    districts,
    ruralDistricts,
    cities,
  };
}
