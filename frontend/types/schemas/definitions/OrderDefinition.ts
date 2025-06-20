import { z } from "zod";

export const OrderDefinitionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  label: z.number().int(),
  use_weapon_targeting: z.boolean(),
  can_be_interrupted: z.boolean(),
  can_be_queued: z.boolean(),
  targeting: z.number().int(),
  energy: z.number().int(),
  animation: z.number().int(),
  highlight: z.number().int(),
  obscured_order: z.number().int(),
});
export type OrderDefinition = z.infer<typeof OrderDefinitionSchema>;
