import { SideBarItem } from "@/components/ui/sidebar";
import { useUsemapStore } from "@/store/mapStore";
import { Usemap } from "@/types/schemas/Usemap";
import { Unit } from "@/types/schemas/Unit";
import { Sprite } from "@/types/schemas/Sprite";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Entity } from "@/types/schemas/Entity";

function getUnitItems(gameMap: Usemap): SideBarItem<Unit>[] {
  const items = gameMap.placed_unit.map<SideBarItem<Unit>>((unit, index) => ({
    label: unit.name as string,
    id: uuidv4(),
    data: {
      label: unit.name,
      path: ["placed_unit", index],
      properties: unit,
    },
  }));

  return items;
}

function getSpriteItems(gameMap: Usemap): SideBarItem<Sprite>[] {
  const items = gameMap.placed_sprite.map<SideBarItem<Sprite>>(
    (sprite, index) => ({
      label: sprite.name as string,
      id: uuidv4(),
      data: {
        label: sprite.name,
        path: ["placed_sprite", index],
        properties: sprite,
      },
    }),
  );

  return items;
}

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
