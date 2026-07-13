import { digitsFaToEn } from "@persian-tools/persian-tools";
import { findProvinceFromCoordinate } from "@persian-tools/persian-tools";
import { POSTAL_PREFIX_TO_PROVINCE } from "../data/postal.js";
import { lookupPostalCode } from "./geo.js";

/** Iranian passport: letter + 8 digits (common pattern) or 9 alphanumeric. */
export function validatePassport(raw: string) {
  const v = digitsFaToEn(raw).replace(/\s+/g, "").toUpperCase();
  const ok = /^[A-Z]\d{8}$/.test(v) || /^[A-Z0-9]{8,9}$/.test(v);
  return {
    valid: ok,
    normalized: v,
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

/** Enrich postal with province (+ optional city hint from prefix when known). */
export function postalToPlace(code: string) {
  const base = lookupPostalCode(code);
  return {
    ...base,
    cityHint: null as string | null,
    provinceFromPrefix: base.province ?? POSTAL_PREFIX_TO_PROVINCE[base.prefix ?? ""] ?? null,
  };
}
