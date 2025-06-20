import { z } from "zod";

export const UnitSizeSchema = z.object({
  name: z.string().default("Unit Size"),
  size_type: z.number().int(),
  placement_box_size: z.object({
    height: z.number().int(),
    width: z.number().int(),
  }),
  bounds: z.object({
    left: z.number().int(),
    top: z.number().int(),
    right: z.number().int(),
    bottom: z.number().int(),
  }),
  addon_position: z.union([
    z.object({
      x: z.number().int().default(0),
      y: z.number().int().default(0),
    }),
    z.null(),
  ]),
});
export type UnitSize = z.infer<typeof UnitSizeSchema>;
