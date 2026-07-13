import { digitsFaToEn } from "@persian-tools/persian-tools";
import { Plate } from "@persian-tools/persian-tools";

export type PlateParsed = {
  ok: boolean;
  raw: string;
  category?: "car" | "motorcycle" | "unknown";
  template?: string;
  province?: string;
  type?: string;
  categoryLabel?: string;
  numbers?: string;
  letter?: string;
  serial?: string;
  error?: string;
  rawResult?: unknown;
};

/** Cleaner Iranian plate parse with structured fields when possible. */
export function parsePlateDetailed(plate: string): PlateParsed {
  const raw = digitsFaToEn(plate).replace(/\s+/g, "").toUpperCase();
  try {
    const result = Plate(raw) as {
      info?: {
        template?: string;
        province?: string;
        type?: string;
        category?: string;
      };
      isValid?: boolean;
    };
    const info = result?.info ?? {};
    const template = info.template ?? "";
    // Try extract letter and numbers from common car template like "12ب451ایران47"
    const car = template.match(/(\d{2})\s*([^\d\s]+)\s*(\d{3})\s*.*?(\d{2})/);
    const moto = template.match(/(\d{3})\s*-?\s*(\d{5})/);
    return {
      ok: result?.isValid !== false,
      raw,
      category: info.type?.toLowerCase().includes("motor")
        ? "motorcycle"
        : info.type
          ? "car"
          : "unknown",
      template,
      province: info.province,
      type: info.type,
      categoryLabel: info.category,
      numbers: car ? `${car[1]}${car[3]}` : moto ? `${moto[1]}${moto[2]}` : undefined,
      letter: car?.[2],
      serial: car?.[4] ?? moto?.[1],
      rawResult: result,
    };
  } catch (err) {
    return {
      ok: false,
      raw,
      category: "unknown",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
