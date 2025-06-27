import { z } from "zod";

export const UpgradeRestrictionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  player_maximum_level: z.array(z.number().int()).min(12).max(12),
  player_minimum_level: z.array(z.number().int()).min(12).max(12),
  default_maximum_level: z.number().int(),
  default_minimum_level: z.number().int(),
  uses_default: z.array(z.boolean()).min(12).max(12),
});
export type UpgradeRestriction = z.infer<typeof UpgradeRestrictionSchema>;
