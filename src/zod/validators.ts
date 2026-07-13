/** Thin re-exports so zod schemas do not import the full text graph cyclically. */
export {
  validateNationalId,
  validateSheba,
  validateCard,
  validateMobile,
  validateLegalId,
  validatePostalCode,
} from "../lib/text.js";
export { parseJalaliString as parseJalaliAware } from "../lib/jalali.js";
