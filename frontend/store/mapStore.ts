"use client";

import { Usemap } from "@/types/schemas/Usemap";
import { resolveReferences } from "@/utils/resolve";
import { create } from "zustand";

interface UsemapStore {
  usemap: Usemap | null;
  setUsemap: (map: Usemap) => void;
  updateUsemap: (updater: (prev: Usemap) => void) => void;
}

export const useUsemapStore = create<UsemapStore>((set, get) => ({
  usemap: null,
  setUsemap: (data) => {
    resolveReferences(data);
    set({ usemap: data });
  },
  updateUsemap: (updater: (prev: Usemap) => void) => {
    const current = get().usemap;
    if (!current) return;

    updater(current);
    resolveReferences(current);

    set({ usemap: current });
  },
}));
