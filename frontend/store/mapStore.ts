"use client";

import api from "@/lib/api";
import { Usemap } from "@/types/schemas/Usemap";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { produce } from "immer";

function resolveReferences(raw: Usemap): void {
  for (const unit of raw.placed_unit) {
    const [groundWeaponID, airWeaponID] = [
      unit.weapons.ground_weapon?.id,
      unit.weapons.air_weapon?.id,
    ];

    if (groundWeaponID != undefined) {
      unit.weapons.ground_weapon = raw.weapons[groundWeaponID];
    }

    if (airWeaponID != undefined) {
      unit.weapons.air_weapon = raw.weapons[airWeaponID];
    }
  }
}
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
