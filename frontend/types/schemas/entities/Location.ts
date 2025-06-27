import { z } from "zod";

export const LocationSchema = z.object({
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
      size: z.object({
        left: z.number().int(),
        top: z.number().int(),
        right: z.number().int(),
        bottom: z.number().int(),
      }),
    })
    .describe("An entity component can have spatial data."),
  kind: z.enum(["Unit", "Sprite", "Location", "Tile", "Mask"]),
  elevation_flags: z.number().int(),
});
export type Location = z.infer<typeof LocationSchema>;
