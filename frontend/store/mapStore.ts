"use client";

import api from "@/lib/api";
import { Map } from "@/types/schemas/Map";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";

interface GameMapStore {
  rawMap: Map | null;
  setRawMap: (map: Map) => void;
  updateRawMap: (updater: (prev: Map) => void) => void;
}

export const useRawMapStore = create<GameMapStore>((set) => ({
  rawMap: null,
  setRawMap: (data) => set({ rawMap: data }),
  updateRawMap: (updater: (prev: Map) => void) =>
    set((state) => {
      if (!state.rawMap) return {};
      const copy = structuredClone(state.rawMap);
      updater(copy);
      return { rawMap: copy };
    }),
}));
