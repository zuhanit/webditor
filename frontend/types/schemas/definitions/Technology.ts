import { z } from "zod";

export const TechnologySchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  use_default: z.boolean(),
  cost: z.object({
    mineral: z.number().int().gte(0).default(0),
    gas: z.number().int().gte(0).default(0),
    time: z.number().int().gte(0).default(0),
    energy: z.number().int().gte(0).default(0),
  }),
  energy_required: z.boolean(),
  icon: z.number().int(),
  label: z.number().int(),
  race: z.number().int(),
});
export type Technology = z.infer<typeof TechnologySchema>;
