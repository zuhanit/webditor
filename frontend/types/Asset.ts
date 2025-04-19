import { WObject } from "./schemas/WObject";

export type AssetType<T extends WObject> = { id: number; data: T };
export type AssetResult<T extends WObject> = Record<string, AssetType<T>[]>;
