import { Item } from "./InspectorItem";

export type AssetType = { id: number; item: Item };
export type AssetResult = Record<string, AssetType[]>;
