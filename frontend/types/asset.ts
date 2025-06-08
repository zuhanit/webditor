import { z } from "zod";

export type Asset = {
  name: string;
  type: "folder" | "file";
  children?: Asset[];
  data?: any;
  preview?: number;
}

export const AssetSchema: z.ZodType<Asset> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(["folder", "file"]),
    children: z.array(AssetSchema).optional(),
    data: z.any().optional(),
    preview: z.number().optional(),
  })
)

export type AssetType = z.infer<typeof AssetSchema>;