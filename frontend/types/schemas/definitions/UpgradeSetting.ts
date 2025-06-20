import { z } from "zod";

export const UpgradeSettingSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  uses_default: z.boolean(),
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
});
export type UpgradeSetting = z.infer<typeof UpgradeSettingSchema>;
