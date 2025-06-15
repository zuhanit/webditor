import { z } from "zod";
import { AssetSchema } from "./schemas/asset/Asset";

export type Asset<T = any> = z.infer<typeof AssetSchema> & { data?: T | null };