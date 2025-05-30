import { useUsemapStore } from "@/store/mapStore";
import { useEffect, useState } from "react";
import { Entity } from "@/types/schemas/Entity";

export function usePlacedEntities(): Record<
  string,
  { label: string; data: Entity[] }
> {
  const gameMap = useUsemapStore((state) => state.usemap);
  const [entities, setDefaultPlacedEntities] = useState<
    Record<string, { label: string; data: Entity[] }>
  >({});

  useEffect(() => {
    if (!gameMap) return;

    setDefaultPlacedEntities({
      units: {
        label: "Units",
        data: gameMap.placed_unit,
      },
      sprites: {
        label: "Sprites",
        data: gameMap.placed_sprite,
      },
    });
  }, [gameMap]);

  return entities;
}
