import { create } from "zustand";
import { Asset } from "@/types/schemas/asset/Asset";

interface AssetExplorerStore {
  currentAsset: Asset | null;
  setCurrentAsset: (asset: Asset) => void;
}

export const useAssetExplorerStore = create<AssetExplorerStore>((set) => ({
  currentAsset: null,
  setCurrentAsset: (asset) => set({ currentAsset: asset }),
}));