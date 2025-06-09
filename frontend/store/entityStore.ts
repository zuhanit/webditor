import { Asset } from "@/types/schemas/asset/Asset";
import { create } from "zustand";

interface EntityStore {
  entity: Asset | null;
  setEntity: (entity: Asset) => void;
  checkedEntities: Asset[]
  setCheckedEntities: (entities: Asset[]) => void;
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
