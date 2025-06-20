import { z } from "zod";

export const ForceSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Object"),
  properties: z.number().int(),
});
export type Force = z.infer<typeof ForceSchema>;
