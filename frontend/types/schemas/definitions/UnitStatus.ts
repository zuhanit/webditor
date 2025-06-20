import { z } from "zod";

export const UnitStatusSchema = z.object({
  name: z.string().default("Unit Status"),
  hit_points: z.object({
    current: z.number().int().gte(0).default(0),
    max: z.number().int().gte(0).default(0),
  }),
  shield_enable: z.boolean(),
  shield_points: z.object({
    current: z.number().int().gte(0).default(0),
    max: z.number().int().gte(0).default(0),
  }),
  energy_points: z.object({
    current: z.number().int().gte(0).default(0),
    max: z.number().int().gte(0).default(0),
  }),
  armor_points: z.number().int().lt(256).default(0),
  armor_upgrade: z.number().int(),
  rank: z.number().int(),
  elevation_level: z.number().int(),
});
export type UnitStatus = z.infer<typeof UnitStatusSchema>;
