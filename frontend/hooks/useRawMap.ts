import api from "@/lib/api";
import { useRawMapStore } from "@/store/mapStore";
import { Usemap } from "@/types/schemas/Usemap";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

function resolveReferences(raw: Usemap): void {
  console.log("Resolving References...");
  for (const unit of raw.placed_unit) {
    const [groundWeaponID, airWeaponID] = [
      unit.weapons.ground_weapon?.id,
      unit.weapons.air_weapon?.id,
    ];

    if (groundWeaponID) {
      const weaponRef = raw.weapons[groundWeaponID];
      unit.weapons.ground_weapon = weaponRef;
    }

    if (airWeaponID) {
      const weaponRef = raw.weapons[airWeaponID];
      unit.weapons.air_weapon = weaponRef;
    }
  }
}

export default function useFetchRawMap(mapName: string) {
  const setRawMap = useRawMapStore((state) => state.setRawMap);
  const rawMap = useRawMapStore((state) => state.rawMap);
  const updateRawMap = useRawMapStore((state) => state.updateRawMap);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["rawMap", mapName],
    queryFn: async () => {
      const res = await api.get<Usemap>(`/api/v1/maps/${mapName}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      resolveReferences(data);
      setRawMap(data);
    }
  }, [isSuccess, data, setRawMap]);

  return {
    rawMap,
    updateRawMap,
    isLoading,
    isSuccess,
  };
}
