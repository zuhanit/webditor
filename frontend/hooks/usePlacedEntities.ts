import { SideBarItem } from "@/components/placed_container/SideBar";
import { useRawMapStore } from "@/store/mapStore";
import { Entity } from "@/types/schemas/Entity";
import { Unit, Sprite, Map, Unit1, Sprite1 } from "@/types/schemas/Map";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function getUnitItems(gameMap: Map): SideBarItem<Unit1>[] {
  const items = gameMap.placed_unit.map<SideBarItem<Unit1>>((unit, index) => ({
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

function getSpriteItems(gameMap: Map): SideBarItem<Sprite1>[] {
  const items = gameMap.placed_sprite.map<SideBarItem<Sprite1>>(
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

export function usePlacedEntities(): SideBarItem<any>[] {
  const gameMap = useRawMapStore((state) => state.rawMap);
  const [entities, setDefaultPlacedEntities] = useState<SideBarItem<any>[]>([]);

  useEffect(() => {
    if (!gameMap) return;

    setDefaultPlacedEntities([
      {
        id: "units-row",
        label: "Units",
        items: getUnitItems(gameMap),
      },
      {
        id: "sprite-row",
        label: "Sprites",
        items: getSpriteItems(gameMap),
      },
    ]);
  }, [gameMap]);

  return entities;
}
