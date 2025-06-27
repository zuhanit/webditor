import { Asset, AssetNode } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";
import { create } from "zustand";

interface EntityStore {
  entity: Asset<Entity> | null;
  setEntity: (entity: Asset<Entity> | null) => void;
  checkedEntities: AssetNode[];
  setCheckedEntities: (entities: AssetNode[]) => void;
}

export const useEntityStore = create<EntityStore>((set) => ({
  entity: null,
  checkedEntities: [],
  setEntity: (entity) => {
    if (entity) set({ entity });
    else set({ entity: null });
  },
  setCheckedEntities: (entities) => {
    set({ checkedEntities: entities });
  },
}));
