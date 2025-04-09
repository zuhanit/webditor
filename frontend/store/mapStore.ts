"use client";

import api from "@/lib/api";
import { Map } from "@/types/schemas/Map";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";

interface GameMapStore {
  rawMap: Map | null;
  setRawMap: (map: Map) => void;
}

export const useRawMapStore = create<GameMapStore>((set) => ({
  rawMap: null,
  setRawMap: (data) => set({ rawMap: data }),
}));
