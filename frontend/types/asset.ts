import { z } from "zod";

export type Asset<T = any> = {
  name: string;
  id: number;
  type: "folder" | "file";
  children?: Asset<T>[];
  data?: T;
  preview?: number;
}

export const AssetSchema: z.ZodType<Asset> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(["folder", "file"]),
    id: z.number(),
    children: z.array(AssetSchema).optional(),
    data: z.any().optional(),
    preview: z.number().optional(),
  })
)

export type AssetType = z.infer<typeof AssetSchema>;