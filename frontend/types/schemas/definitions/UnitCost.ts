import { z } from "zod";

export const UnitCostSchema = z.object({
  name: z.string().default("Unit Cost"),
  cost: z.object({
    mineral: z.number().int().gte(0).default(0),
    gas: z.number().int().gte(0).default(0),
    time: z.number().int().gte(0).default(0),
  }),
  build_score: z.number().int(),
  destroy_score: z.number().int(),
  is_broodwar: z.boolean(),
  supply: z.object({ required: z.number().int(), provided: z.number().int() }),
  space: z.object({ required: z.number().int(), provided: z.number().int() }),
});
export type UnitCost = z.infer<typeof UnitCostSchema>;
