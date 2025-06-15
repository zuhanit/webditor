"use client";

import { Usemap } from "@/types/schemas/project/Usemap";
import { createStore } from "zustand";
import { produce } from "immer";
import { Entity } from "@/types/schemas/entities/Entity";
import { Asset } from "@/types/asset";
import api from "@/lib/api";

// export const useUsemapStore = create<UsemapStore>((set, get) => ({
//   usemap: null,
//   setUsemap: (data) => {
//     set({ usemap: data });
//   },
//   updateEntity: (entity: Asset<Entity>) => {
//     set(
//       produce((state: UsemapStore) => {
//         if (!state.usemap) return;
//         state.usemap.entities = state.usemap.entities.map((e) =>
//           e.id === entity.id ? entity : e,
//         );
//       }),
//     );
//   },
// }));

export type UsemapState = {
  usemap: Usemap | null;
};

export type UsemapActions = {
  addEntity: (entity: Asset<Entity>) => void;
  deleteEntity: (entity: Asset<Entity>) => void;
  fetchUsemap: (mapName: string) => Promise<void>;
  updateEntity: (id: number, path: string[], value: any) => void;
  addAsset: (asset: Asset) => void;
  deleteAsset: (asset: Asset) => void;
  updateAsset: (id: number, path: string[], value: any) => void;
};

export type UsemapStore = UsemapState & UsemapActions;

export const createUsemapStore = () => {
  const update = (obj: any, keys: string[], value: any) => {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
  };

  return createStore<UsemapStore>()((set) => ({
    usemap: null,
    fetchUsemap: async (mapName: string) => {
      try {
        const res = await api.get<Usemap>(`/api/v1/maps/${mapName}`);
        set({ usemap: res.data });
      } catch (error) {
        console.error("Failed to fetch usemap:", error);
      }
    },
    addEntity: (entity: Asset<Entity>) =>
      set((state) => ({
        usemap: produce(state.usemap, (draft: Usemap) => {
          draft.entities.push(entity);
        }),
      })),
    deleteEntity: (entity: Asset<Entity>) =>
      set((state) => ({
        usemap: produce(state.usemap, (draft: Usemap) => {
          draft.entities = draft.entities.filter(
            (e: Asset<Entity>) => e.id !== entity.id,
          );
          // maybe can replaced with delete draft.entities[entity.id]?
        }),
      })),
    updateEntity: (id: number, path: string[], value: any) =>
      set((state) => ({
        usemap: produce(state.usemap, (draft: Usemap) => {
          draft.entities = draft.entities.map((e) =>
            e.id === id ? { ...e, data: update(e.data, path, value) } : e,
          );
        }),
      })),
    addAsset: (asset: Asset) =>
      set((state) => ({
        usemap: produce(state.usemap, (draft: Usemap) => {
          draft.assets.push(asset);
        }),
      })),
    deleteAsset: (asset: Asset) =>
      set((state) => ({
        usemap: produce(state.usemap, (draft: Usemap) => {
          draft.assets = draft.assets.filter((a) => a.id !== asset.id);
        }),
      })),
    updateAsset: (id: number, path: string[], value: any) =>
      set((state) => ({
        usemap: produce(state.usemap, (draft: Usemap) => {
          draft.assets = draft.assets.map((a) =>
            a.id === id ? { ...a, data: update(a.data, path, value) } : a,
          );
        }),
      })),
  }));
};
