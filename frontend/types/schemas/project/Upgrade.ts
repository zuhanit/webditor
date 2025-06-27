import { z } from "zod";

export const UpgradeSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  use_default: z.boolean(),
  base_cost: z.object({
    mineral: z.number().int().gte(0).default(0),
    gas: z.number().int().gte(0).default(0),
    time: z.number().int().gte(0).default(0),
  }),
  factor_cost: z.object({
    mineral: z.number().int().gte(0).default(0),
    gas: z.number().int().gte(0).default(0),
    time: z.number().int().gte(0).default(0),
  }),
  icon: z.number().int(),
  label: z.number().int(),
  race: z.number().int(),
});
export type Upgrade = z.infer<typeof UpgradeSchema>;
