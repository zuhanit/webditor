import { Entity } from "@/types/schemas/Entity";
import { create } from "zustand";

interface EntityStore {
  entity: Entity | null;
  setEntity: (entity: Entity) => void;
}

export const useEntityStore = create<EntityStore>((set) => ({
  entity: null,
  setEntity: (entity) => {
    set({ entity });
  },
}));
