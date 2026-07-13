import { z } from "zod";
import {
  validateNationalId,
  validateSheba,
  validateCard,
  validateMobile,
  validatePostalCode,
  parseJalaliAware,
} from "./validators.js";
import { validateLegalIdDetailed } from "../lib/generators.js";

/** Re-export zod for convenience */
export { z };

/** Persian (fa) Zod issue messages for Iranian field schemas. */
export const faMessages = {
  nationalId: "کد ملی نامعتبر است",
  nationalIdCheck: (expected: number) => `کد ملی نامعتبر است (رقم کنترل باید ${expected} باشد)`,
  sheba: "شماره شبا نامعتبر است",
  card: "شماره کارت بانکی نامعتبر است",
  mobile: "شماره موبایل نامعتبر است",
  legalId: "شناسه ملی نامعتبر است",
  postal: "کد پستی نامعتبر است",
  jalali: "تاریخ شمسی نامعتبر است (قالب: YYYY/MM/DD)",
} as const;

export type SchemaLocale = "en" | "fa";

function msg(locale: SchemaLocale, en: string, fa: string) {
  return locale === "fa" ? fa : en;
}

export function createIranSchemas(locale: SchemaLocale = "fa") {
  const nationalIdSchema = z.string().superRefine((val, ctx) => {
    const r = validateNationalId(val);
    if (!r.valid) {
      const expected = r.detail?.expectedCheckDigit;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          r.detail?.reason === "check_digit_mismatch" && expected != null
            ? msg(
                locale,
                `Invalid national ID (expected check digit ${expected})`,
                faMessages.nationalIdCheck(expected)
              )
            : msg(locale, "Invalid Iranian national ID", faMessages.nationalId),
      });
    }
  });

  const shebaSchema = z.string().superRefine((val, ctx) => {
    if (!validateSheba(val).valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg(locale, "Invalid Iranian Sheba/IBAN", faMessages.sheba),
      });
    }
  });

  const cardSchema = z.string().superRefine((val, ctx) => {
    if (!validateCard(val).valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg(locale, "Invalid Iranian bank card number", faMessages.card),
      });
    }
  });

  const mobileSchema = z.string().superRefine((val, ctx) => {
    if (!validateMobile(val).valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg(locale, "Invalid Iranian mobile number", faMessages.mobile),
      });
    }
  });

  const legalIdSchema = z.string().superRefine((val, ctx) => {
    const d = validateLegalIdDetailed(val);
    if (!d.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          d.reason === "check_digit_mismatch"
            ? msg(
                locale,
                `Invalid legal ID (expected check digit ${d.expectedCheckDigit})`,
                `شناسه ملی نامعتبر است (رقم کنترل باید ${d.expectedCheckDigit} باشد)`
              )
            : msg(locale, "Invalid Iranian legal ID", faMessages.legalId),
      });
    }
  });

  const postalCodeSchema = z.string().superRefine((val, ctx) => {
    if (!validatePostalCode(val).valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg(locale, "Invalid Iranian postal code", faMessages.postal),
      });
    }
  });

  const jalaliDateSchema = z.string().superRefine((val, ctx) => {
    if (!parseJalaliAware(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg(locale, "Invalid Jalali date (expected YYYY/MM/DD)", faMessages.jalali),
      });
    }
  });

  const iranContactSchema = z.object({
    nationalId: nationalIdSchema.optional(),
    mobile: mobileSchema.optional(),
    sheba: shebaSchema.optional(),
    postalCode: postalCodeSchema.optional(),
  });

  return {
    nationalIdSchema,
    shebaSchema,
    cardSchema,
    mobileSchema,
    legalIdSchema,
    postalCodeSchema,
    jalaliDateSchema,
    iranContactSchema,
  };
}

/** Default schemas use Persian error messages. */
const fa = createIranSchemas("fa");
export const nationalIdSchema = fa.nationalIdSchema;
export const shebaSchema = fa.shebaSchema;
export const cardSchema = fa.cardSchema;
export const mobileSchema = fa.mobileSchema;
export const legalIdSchema = fa.legalIdSchema;
export const postalCodeSchema = fa.postalCodeSchema;
export const jalaliDateSchema = fa.jalaliDateSchema;
export const iranContactSchema = fa.iranContactSchema;

/** English-message variants. */
export const schemasEn = createIranSchemas("en");

// Keep validateLegalId available for docs via validators re-export path if needed
export { validateLegalId } from "./validators.js";

