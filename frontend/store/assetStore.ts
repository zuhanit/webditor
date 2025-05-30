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
  editorPosition: { x: number; y: number };
  setEditorPosition: (
    updater: (prev: { x: number; y: number }) => { x: number; y: number },
  ) => void;
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
  editorPosition: { x: 0, y: 0 },
  setEditorPosition: (updater) =>
    set((state) => ({
      editorPosition: updater(state.editorPosition),
    })),
}));
