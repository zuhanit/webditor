import { z } from "zod";

export const BulletSchema = z.object({
  behaviour: z.number().int(),
  remove_after: z.number().int(),
  attack_angle: z.number().int(),
  launch_spin: z.number().int(),
  x_offset: z.number().int(),
  y_offset: z.number().int(),
});
export type Bullet = z.infer<typeof BulletSchema>;
