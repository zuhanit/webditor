import { z } from "zod";

export const ImageDefinitionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  graphic: z.number().int(),
  turnable: z.boolean(),
  clickable: z.boolean(),
  use_full_iscript: z.boolean(),
  draw_if_cloaked: z.boolean(),
  draw_function: z.number().int(),
  remapping: z.number().int(),
  iscript_id: z.number().int(),
  shield_overlay: z.number().int(),
  attack_overlay: z.number().int(),
  damage_overlay: z.number().int(),
  special_overlay: z.number().int(),
  landing_dust_overlay: z.number().int(),
  lift_off_overlay: z.number().int(),
});
export type ImageDefinition = z.infer<typeof ImageDefinitionSchema>;
