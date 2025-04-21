import { Item } from "./InspectorItem";
import { WObject } from "./schemas/WObject";

export type AssetType = { id: number; item: Item };
export type AssetResult = Record<string, AssetType[]>;
