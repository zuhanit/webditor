"use client";

import api from "@/lib/api";
import { RawMap } from "@/types/schemas/RawMap";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";

interface RawMapStore {
  rawMap: RawMap | null;
  setRawMap: (map: RawMap) => void;
}

export const useRawMapStore = create<RawMapStore>((set) => ({
  rawMap: null,
  setRawMap: (data) => set({ rawMap: data }),
}));
