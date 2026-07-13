import { digitsFaToEn, getPlaceByIranNationalId } from "@persian-tools/persian-tools";
import { findProvinceFromCoordinate } from "@persian-tools/persian-tools";
import { POSTAL_PREFIX_TO_PROVINCE } from "../data/postal.js";
import { POSTAL_PREFIX_TO_CITY, AREA_CODE_TO_CITY } from "../data/placeHints.js";
import { lookupPostalCode, lookupLandline } from "./geo.js";
import { verifyNationalIdChecksum } from "./nationalId.js";

/**
 * Iranian passport format check (structural only — not issuance verification).
 * Accepted pattern: one Latin letter + 8 digits (e.g. A12345678).
 */
export function validatePassport(raw: string) {
  const v = digitsFaToEn(raw).replace(/\s+/g, "").toUpperCase();
  const ok = /^[A-Z]\d{8}$/.test(v);
  return {
    valid: ok,
    normalized: v,
    pattern: "letter_plus_8_digits" as const,
    structuralOnly: true as const,
    reason: ok ? ("ok" as const) : ("format" as const),
  };
}

export type CryptoNetwork = "trc20" | "erc20" | "btc" | "unknown";

export function validateCryptoAddress(address: string) {
  const a = address.trim();
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)) {
    return { valid: true, network: "trc20" as const, normalized: a };
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(a)) {
    return { valid: true, network: "erc20" as const, normalized: a };
  }
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(a)) {
    return { valid: true, network: "btc" as const, normalized: a };
  }
  return { valid: false, network: "unknown" as const, normalized: a, reason: "unrecognized_address" };
}

export function provinceFromGps(latitude: number, longitude: number) {
  try {
    const r = findProvinceFromCoordinate({ latitude, longitude });
    return { ok: true as const, provinceFa: r.fa, provinceEn: r.en, latitude, longitude };
  } catch (err) {
    return {
      ok: false as const,
      latitude,
      longitude,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Enrich postal with province + city hint from prefix (approximate). */
export function postalToPlace(code: string) {
  const base = lookupPostalCode(code);
  const prefix = base.prefix ?? "";
  const cityHint = POSTAL_PREFIX_TO_CITY[prefix] ?? null;
  return {
    ...base,
    cityHint,
    provinceFromPrefix: base.province ?? POSTAL_PREFIX_TO_PROVINCE[prefix] ?? null,
    approximate: true as const,
    disclaimer: "Prefix-based hint only — not an authoritative address lookup.",
  };
}

/** Landline → province + city hint (approximate). */
export function landlineToPlace(phone: string) {
  const base = lookupLandline(phone);
  const area = base.areaCode ?? "";
  const hint = AREA_CODE_TO_CITY[area];
  return {
    ...base,
    cityHint: hint?.city ?? base.capitalHint ?? null,
    province: hint?.province ?? base.province,
    approximate: true as const,
    disclaimer: "Area-code hint only — not an authoritative subscriber lookup.",
  };
}

/** National ID → issuing place (city/province codes). */
export function nationalIdToPlace(id: string) {
  const check = verifyNationalIdChecksum(id);
  if (!check.valid) {
    return {
      ok: false as const,
      normalized: check.normalized,
      reason: check.reason,
      detail: check,
    };
  }
  let place: ReturnType<typeof getPlaceByIranNationalId> | null = null;
  try {
    place = getPlaceByIranNationalId(check.normalized) ?? null;
  } catch {
    place = null;
  }
  return {
    ok: true as const,
    normalized: check.normalized,
    place: place
      ? { city: place.city, province: place.province, codes: place.codes }
      : null,
  };
}
