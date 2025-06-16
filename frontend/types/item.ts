import { Asset } from "./asset";

export interface EditorItem {
  asset: Asset;
  kind: "entities" | "assets";
}
