import { z } from "zod";

export const Position2DSchema = z.object({
  x: z.number().int().default(0),
  y: z.number().int().default(0),
});
export type Position2D = z.infer<typeof Position2DSchema>;
