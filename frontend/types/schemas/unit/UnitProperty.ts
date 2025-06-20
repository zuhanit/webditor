import { z } from "zod";

export const UnitPropertySchema = z
  .object({
    id: z.number().int().default(0),
    name: z.string().default("Object"),
    special_properties: z.number().int(),
    valid_properties: z.number().int(),
    owner: z.number().int().lte(1).default(0),
    hit_point_percent: z.number().int().gte(0).lte(100).default(1),
    shield_point_percent: z.number().int().gte(0).lte(100).default(1),
    energy_point_percent: z.number().int().gte(0).lte(100).default(1),
    resource_amount: z.number().int(),
    units_in_hangar: z.number().int(),
    flags: z.number().int(),
  })
  .describe("Create units with properties trigger used.");
export type UnitProperty = z.infer<typeof UnitPropertySchema>;
