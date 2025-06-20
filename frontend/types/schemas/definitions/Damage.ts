import { z } from "zod";

export const DamageSchema = z.object({
  amount: z.number().int().gte(0).lte(65536),
  bonus: z.number().int().gte(0).lte(65536),
  factor: z.number().int(),
});
export type Damage = z.infer<typeof DamageSchema>;
