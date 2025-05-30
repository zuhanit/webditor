import { Item } from "@/types/item";
import { create } from "zustand";

interface AssetStore {
  assets: Item[];
  activatedAsset: Item | null;
  setAssets: (assets: Item[]) => void;
  setActivatedAsset: (asset: Item) => void;
  isEditorOpen: boolean;
  openEditor: () => void;
  closeEditor: () => void;
  toggleEditor: () => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: [],
  activatedAsset: null,
  setAssets: (assets) => {
    set({ assets });
  },
  setActivatedAsset: (asset) => {
    set({ activatedAsset: asset });
  },
  isEditorOpen: false,
  openEditor: () => set({ isEditorOpen: true }),
  closeEditor: () => set({ isEditorOpen: false }),
  toggleEditor: () => set((state) => ({ isEditorOpen: !state.isEditorOpen })),
}));
