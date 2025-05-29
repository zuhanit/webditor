import { Item } from "@/types/item";
import { create } from "zustand";

interface AssetStore {
  assets: Item[];
  setAssets: (assets: Item[]) => void;
  isEditorOpen: boolean;
  openEditor: () => void;
  closeEditor: () => void;
  toggleEditor: () => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: [],
  setAssets: (assets) => {
    set({ assets });
  },
  isEditorOpen: false,
  openEditor: () => set({ isEditorOpen: true }),
  closeEditor: () => set({ isEditorOpen: false }),
  toggleEditor: () => set((state) => ({ isEditorOpen: !state.isEditorOpen })),
}));
