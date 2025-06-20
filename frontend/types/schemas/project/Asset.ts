import { z } from "zod";

export const AssetSchema = z.object({
  name: z.string(),
  id: z.number().int(),
  type: z.enum(["folder", "file"]),
  preview: z.union([z.number().int(), z.null()]).default(null),
  parent_id: z.number().int().default(0),
  data: z.union([z.object({}), z.null()]).default(null),
});
export type Asset = z.infer<typeof AssetSchema>;
