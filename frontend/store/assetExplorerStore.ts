import { create } from "zustand";
import { AssetType } from "@/types/asset";

interface AssetExplorerStore {
  currentAsset: AssetType | null;
  setCurrentAsset: (asset: AssetType) => void;
}

export const useAssetExplorerStore = create<AssetExplorerStore>((set) => ({
  currentAsset: null,
  setCurrentAsset: (asset) => set({ currentAsset: asset }),
}));