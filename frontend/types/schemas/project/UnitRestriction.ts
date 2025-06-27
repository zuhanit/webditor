import { z } from "zod";

export const UnitRestrictionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  availability: z.array(z.boolean()),
  global_availability: z.boolean(),
  uses_defaults: z.array(z.boolean()),
});
export type UnitRestriction = z.infer<typeof UnitRestrictionSchema>;
