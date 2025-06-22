import { AssetNode } from "@/types/asset";
import { create } from "zustand";

interface EntityStore {
  entity: AssetNode | null;
  setEntity: (entity: AssetNode) => void;
  checkedEntities: AssetNode[];
  setCheckedEntities: (entities: AssetNode[]) => void;
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
