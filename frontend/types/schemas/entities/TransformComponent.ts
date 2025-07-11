import { z } from "zod";

export const TransformComponentSchema = z
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
  .describe("An entity component can have spatial data.");
export type TransformComponent = z.infer<typeof TransformComponentSchema>;
