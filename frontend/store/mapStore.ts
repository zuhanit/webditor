"use client";

import { Usemap, UsemapSchema } from "@/types/schemas/project/Usemap";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
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
  fetchUsemap: (mapName: string) => Promise<void>;
  setUsemap: (usemap: Usemap) => void;
  openUsemap: (file: File) => Promise<void>;
  addEntity: (entity: Asset<Entity>) => void;
  deleteEntity: (entity: Asset<Entity>) => void;
  updateEntityAssetName: (id: number, name: string) => void;
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

  return createStore<UsemapStore>()(
    immer((set) => ({
      usemap: null,
      fetchUsemap: async (mapName: string) => {
        try {
          const res = await api.get<Usemap>(`/api/v1/maps/${mapName}`);
          set({ usemap: res.data });
        } catch (error) {
          console.error("Failed to fetch usemap:", error);
        }
      },
      openUsemap: async (file: File) => {
        try {
          const extension = file.name.split(".").pop()?.toLowerCase();
          if (extension === "wproject") {
            const jsonData = JSON.parse(await file.text());

            // 검증만 하고 원본 데이터 사용
            const validation = UsemapSchema.safeParse(jsonData);
            if (!validation.success) {
              console.warn("Schema validation failed:", validation.error);
              // 경고만 하고 계속 진행하거나 에러 처리
            }

            set({ usemap: jsonData }); // 원본 데이터 사용
          } else if (["chk", "scx", "scm"].includes(extension || "")) {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post("/api/v1/maps/open/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            const { raw_map } = response.data;
            if (raw_map) {
              set({ usemap: raw_map });
            }
          }
        } catch (error) {
          console.error("Failed to upload usemap:", error);
          throw error; // 에러를 다시 던져서 컴포넌트에서 처리할 수 있도록
        }
      },
      setUsemap: (usemap: Usemap) => set({ usemap: usemap }),
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
      updateEntityAssetName: (id: number, name: string) =>
        set((state) => ({
          usemap: produce(state.usemap, (draft: Usemap) => {
            draft.entities = draft.entities.map((e) =>
              e.id === id ? { ...e, name: name } : e,
            );
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
    })),
  );
};
