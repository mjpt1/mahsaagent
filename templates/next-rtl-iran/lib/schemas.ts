import { z } from "zod";
import {
  nationalIdSchema,
  mobileSchema,
  shebaSchema,
  jalaliDateSchema,
} from "mahsaagent/zod";

export const iranFormKitSchema = z.object({
  nationalId: nationalIdSchema,
  mobile: mobileSchema,
  sheba: shebaSchema,
  jalaliDate: jalaliDateSchema,
  province: z.string().optional(),
  county: z.string().optional(),
});

export type IranFormKitValues = z.infer<typeof iranFormKitSchema>;
