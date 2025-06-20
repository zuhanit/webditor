import { z } from "zod";

export const RangeSchema = z.object({
  min: z.number().int(),
  max: z.number().int(),
});
export type Range = z.infer<typeof RangeSchema>;
