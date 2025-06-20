import { z } from "zod";

export const MaskSchema = z
  .object({
    id: z.number().int().default(0),
    name: z.string().default("Object"),
    transform: z
      .object({
        id: z.number().int().default(0),
        name: z.string().default("Object"),
        position: z.object({
          x: z.number().int().default(0),
          y: z.number().int().default(0),
        }),
        size: z.object({ height: z.number().int(), width: z.number().int() }),
      })
      .describe("An entity component can have spatial data."),
    kind: z.enum(["Unit", "Sprite", "Location", "Tile", "Mask"]),
    flags: z.number().int(),
  })
  .describe("Fog of War");
export type Mask = z.infer<typeof MaskSchema>;
