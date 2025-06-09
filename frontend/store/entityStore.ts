import { AssetType } from "@/types/asset";
import { create } from "zustand";

interface EntityStore {
  entity: AssetType | null;
  setEntity: (entity: AssetType) => void;
  checkedEntities: AssetType[]
  setCheckedEntities: (entities: AssetType[]) => void;
}

export const useEntityStore = create<EntityStore>((set) => ({
  entity: null,
  checkedEntities: [],
  setEntity: (entity) => {
    set({ entity });
  },
  setCheckedEntities: (entities) => {
    set({ checkedEntities: entities });
  },
}));
