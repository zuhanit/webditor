import { create } from "zustand";
import { Asset } from "@/types/schemas/asset/Asset";

interface AssetExplorerStore {
  currentAsset: Asset & { children?: Asset[] } | null;
  setCurrentAsset: (asset: Asset & { children?: Asset[] }) => void;
}

export const useAssetExplorerStore = create<AssetExplorerStore>((set) => ({
  currentAsset: null,
  setCurrentAsset: (asset) => set({ currentAsset: asset }),
}));