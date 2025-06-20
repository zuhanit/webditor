import { z } from "zod";

export const WObjectSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Object"),
});
export type WObject = z.infer<typeof WObjectSchema>;
