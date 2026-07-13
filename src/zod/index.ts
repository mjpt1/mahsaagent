import { z } from "zod";
import {
  validateNationalId,
  validateSheba,
  validateCard,
  validateMobile,
  validateLegalId,
  validatePostalCode,
  parseJalaliAware,
} from "./validators.js";

/** Re-export zod for convenience */
export { z };

export const nationalIdSchema = z.string().superRefine((val, ctx) => {
  const r = validateNationalId(val);
  if (!r.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: r.detail?.reason === "check_digit_mismatch"
        ? `Invalid national ID (expected check digit ${r.detail.expectedCheckDigit})`
        : "Invalid Iranian national ID",
    });
  }
});

export const shebaSchema = z.string().superRefine((val, ctx) => {
  if (!validateSheba(val).valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Iranian Sheba/IBAN" });
  }
});

export const cardSchema = z.string().superRefine((val, ctx) => {
  if (!validateCard(val).valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Iranian bank card number" });
  }
});

export const mobileSchema = z.string().superRefine((val, ctx) => {
  if (!validateMobile(val).valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Iranian mobile number" });
  }
});

export const legalIdSchema = z.string().superRefine((val, ctx) => {
  if (!validateLegalId(val).valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Iranian legal ID" });
  }
});

export const postalCodeSchema = z.string().superRefine((val, ctx) => {
  if (!validatePostalCode(val).valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Iranian postal code" });
  }
});

export const jalaliDateSchema = z.string().superRefine((val, ctx) => {
  if (!parseJalaliAware(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid Jalali date (expected YYYY/MM/DD)",
    });
  }
});

export const iranContactSchema = z.object({
  nationalId: nationalIdSchema.optional(),
  mobile: mobileSchema.optional(),
  sheba: shebaSchema.optional(),
  postalCode: postalCodeSchema.optional(),
});
