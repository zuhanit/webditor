import { AssetType } from "@/types/asset";
import { create } from "zustand";

interface AssetEditorStore {
  assets: AssetType[];
  activatedAsset: AssetType | null;
  setAssets: (assets: AssetType[]) => void;
  setActivatedAsset: (asset: AssetType) => void;
  isEditorOpen: boolean;
  openEditor: () => void;
  closeEditor: () => void;
  toggleEditor: () => void;
  editorPosition: { x: number; y: number };
  setEditorPosition: (
    updater: (prev: { x: number; y: number }) => { x: number; y: number },
  ) => void;
}

export const useAsseEditortStore = create<AssetEditorStore>((set) => ({
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
