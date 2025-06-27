import { z } from "zod";

export const RectPositionSchema = z.object({
  left: z.number().int(),
  top: z.number().int(),
  right: z.number().int(),
  bottom: z.number().int(),
});
export type RectPosition = z.infer<typeof RectPositionSchema>;
