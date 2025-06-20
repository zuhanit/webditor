import { z } from "zod";

export const TechCostSchema = z.object({
  mineral: z.number().int().gte(0).default(0),
  gas: z.number().int().gte(0).default(0),
  time: z.number().int().gte(0).default(0),
  energy: z.number().int().gte(0).default(0),
});
export type TechCost = z.infer<typeof TechCostSchema>;
