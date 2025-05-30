import { Entity } from "@/types/schemas/Entity";
import { create } from "zustand";

interface EntityStore {
  entity: Entity | null;
  setEntity: (entity: Entity) => void;
  checkedEntities: Entity[]
  setCheckedEntities: (entities: Entity[]) => void;
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
