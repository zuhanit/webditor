import { z } from "zod";

export const WeaponDefinitionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  damage: z.object({
    amount: z.number().int().gte(0).lte(65536),
    bonus: z.number().int().gte(0).lte(65536),
    factor: z.number().int(),
  }),
  bullet: z.object({
    behaviour: z.number().int(),
    remove_after: z.number().int(),
    attack_angle: z.number().int(),
    launch_spin: z.number().int(),
    x_offset: z.number().int(),
    y_offset: z.number().int(),
  }),
  splash: z.object({
    inner: z.number().int(),
    medium: z.number().int(),
    outer: z.number().int(),
  }),
  cooldown: z.number().int(),
  upgrade: z.number().int(),
  weapon_type: z.number().int(),
  explosion_type: z.number().int(),
  target_flags: z.number().int(),
  error_message: z.number().int(),
  icon: z.number().int(),
  graphics: z.number().int(),
});
export type WeaponDefinition = z.infer<typeof WeaponDefinitionSchema>;
