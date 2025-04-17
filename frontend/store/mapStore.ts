"use client";

import api from "@/lib/api";
import { Usemap } from "@/types/schemas/Usemap";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { z } from "zod";

interface GameMapStore {
  rawMap: Usemap | null;
  setRawMap: (map: Usemap) => void;
  updateRawMap: (updater: (prev: Usemap) => void) => void;
}

export const useRawMapStore = create<GameMapStore>((set) => ({
  rawMap: null,
  setRawMap: (data) => set({ rawMap: data }),
  updateRawMap: (updater: (prev: Usemap) => void) =>
    set((state) => {
      if (!state.rawMap) return {};
      const copy = structuredClone(state.rawMap);
      updater(copy);
      return { rawMap: copy };
    }),
}));
