import { Asset } from "@/types/asset"
import { create } from "zustand";

interface AssetEditorStore {
  assets: Asset[];
  activatedAsset: Asset | null;
  setAssets: (assets: Asset[]) => void;
  setActivatedAsset: (asset: Asset) => void;
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
