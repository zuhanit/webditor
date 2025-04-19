"use client";

import { Usemap } from "@/types/schemas/Usemap";
import { resolveReferences } from "@/utils/resolve";
import { create } from "zustand";

interface GameMapStore {
  rawMap: Usemap | null;
  setRawMap: (map: Usemap) => void;
  updateRawMap: (updater: (prev: Usemap) => void) => void;
}

export const useRawMapStore = create<GameMapStore>((set, get) => ({
  rawMap: null,
  setRawMap: (data) => {
    resolveReferences(data);
    set({ rawMap: data });
  },
  updateRawMap: (updater: (prev: Usemap) => void) => {
    const current = get().rawMap;
    if (!current) return;

    updater(current);
    resolveReferences(current);

    set({ rawMap: current });
  },
}));
