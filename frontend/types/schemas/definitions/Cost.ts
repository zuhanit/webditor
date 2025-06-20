import { z } from "zod";

export const CostSchema = z.object({
  mineral: z.number().int().gte(0).default(0),
  gas: z.number().int().gte(0).default(0),
  time: z.number().int().gte(0).default(0),
});
export type Cost = z.infer<typeof CostSchema>;
