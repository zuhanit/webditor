import { Item } from "./item";

export type AssetType = { id: number; item: Item };
export type AssetResult = Record<string, AssetType[]>;
