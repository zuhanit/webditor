import { Asset } from "./asset";

export interface EditorItem {
  label: string;
  icon?: React.ReactNode;
  asset: Asset;
  kind: "entities" | "assets";
}
