import { z } from "zod";
import { createIranSchemas } from "../zod/index.js";
import { labelsForSchema } from "./schemaLabels.js";

export type FormPreset =
  | "signup"
  | "checkout"
  | "kyc"
  | "address"
  | "bank"
  | "invoice"
  | "support";

const PRESETS: Record<FormPreset, string[]> = {
  signup: ["firstName", "lastName", "mobile", "email", "password"],
  checkout: ["fullName", "mobile", "postalCode", "province", "city", "address", "sheba"],
  kyc: ["nationalId", "birthDate", "mobile", "postalCode", "address"],
  address: ["province", "city", "postalCode", "address"],
  bank: ["card", "sheba", "bankCode"],
  invoice: ["legalId", "nationalId", "postalCode", "amount"],
  support: ["fullName", "mobile", "email", "otp"],
};

const ZOD_MAP: Record<string, string> = {
  nationalId: "nationalIdSchema",
  mobile: "mobileSchema",
  sheba: "shebaSchema",
  card: "cardSchema",
  postalCode: "postalCodeSchema",
  jalaliDate: "jalaliDateSchema",
  birthDate: "jalaliDateSchema",
  legalId: "legalIdSchema",
  passport: "passportSchema",
};

/** Build a runnable Zod object schema for a preset (locale=fa). */
export function createPresetZodSchema(preset: FormPreset, locale: "fa" | "en" = "fa") {
  const fields = PRESETS[preset];
  const fa = createIranSchemas(locale) as Record<string, z.ZodTypeAny>;
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    const key = ZOD_MAP[f];
    if (key && fa[key]) {
      shape[f] = fa[key]!;
    } else if (f === "email") {
      shape[f] = z.string().email(locale === "fa" ? "ایمیل معتبر نیست" : "Invalid email");
    } else if (f === "password") {
      shape[f] = z.string().min(8, locale === "fa" ? "رمز حداقل ۸ کاراکتر" : "Min 8 chars");
    } else if (f === "amount") {
      shape[f] = z.union([z.number().positive(), z.string().min(1)]);
    } else if (f === "otp") {
      shape[f] = z.string().regex(/^\d{4,8}$/, locale === "fa" ? "کد تأیید نامعتبر" : "Invalid OTP");
    } else if (f === "bankCode") {
      shape[f] = z.string().regex(/^\d{3}$/, locale === "fa" ? "کد بانک ۳ رقم" : "3-digit bank code");
    } else {
      shape[f] = z.string().min(1, locale === "fa" ? "الزامی" : "Required");
    }
  }
  return z.object(shape);
}

export function validateFormValues(
  preset: FormPreset,
  values: Record<string, unknown>,
  locale: "fa" | "en" = "fa"
) {
  const schema = createPresetZodSchema(preset, locale);
  const parsed = schema.safeParse(values);
  if (parsed.success) {
    return { ok: true as const, preset, data: parsed.data, errors: [] as Array<{ path: string; message: string }> };
  }
  return {
    ok: false as const,
    preset,
    data: null,
    errors: parsed.error.issues.map((i) => ({
      path: i.path.join(".") || "(root)",
      message: i.message,
    })),
  };
}

export function buildPersianFormSchema(preset: FormPreset) {
  const fields = PRESETS[preset];
  const labels = labelsForSchema(fields);
  const zodImports = fields.map((f) => {
    const schema = ZOD_MAP[f];
    return schema
      ? { field: f, zod: schema }
      : { field: f, zod: f === "email" ? "z.string().email()" : "z.string().min(1)" };
  });
  const schemaKeys = [...new Set(zodImports.map((z) => z.zod).filter((s) => String(s).endsWith("Schema")))];

  return {
    preset,
    fields,
    labels,
    zodImports,
    runnable: true,
    rhfHint: "react-hook-form + zodResolver(createPresetZodSchema('checkout'))",
    template: "templates/next-rtl-iran",
    example: `import { createPresetZodSchema, validateFormValues } from "mahsaagent";\nconst schema = createPresetZodSchema("${preset}");`,
    importLine:
      schemaKeys.length > 0
        ? `import { ${schemaKeys.join(", ")}, createIranSchemas } from "mahsaagent/zod";`
        : `import { createPresetZodSchema } from "mahsaagent";`,
  };
}

export function listFormPresets() {
  return Object.entries(PRESETS).map(([id, fields]) => ({
    id: id as FormPreset,
    fieldCount: fields.length,
    fields,
  }));
}
