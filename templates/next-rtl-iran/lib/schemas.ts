import { z } from "zod";
import {
  nationalIdSchema,
  mobileSchema,
  shebaSchema,
  jalaliDateSchema,
} from "mahsaagent/zod";

export const iranFormSchema = z.object({
  nationalId: nationalIdSchema,
  mobile: mobileSchema,
  sheba: shebaSchema,
  jalaliDate: jalaliDateSchema,
});
