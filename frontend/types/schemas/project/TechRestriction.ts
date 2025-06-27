import { z } from "zod";

export const TechRestrictionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  player_availability: z.array(z.boolean()).min(12).max(12),
  player_already_researched: z.array(z.boolean()).min(12).max(12),
  default_availability: z.boolean(),
  default_already_researched: z.boolean(),
  uses_default: z.array(z.boolean()).min(12).max(12),
});
export type TechRestriction = z.infer<typeof TechRestrictionSchema>;
