import { SideBarItem } from "@/components/placed_container/SideBar";
import { useRawMapStore } from "@/store/mapStore";
import { Unit, Sprite, Map } from "@/types/schemas/Map";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function getUnitItems(gameMap: Map): SideBarItem<Unit>[] {
  const items = gameMap.placed_unit.map<SideBarItem<Unit>>((unit) => ({
    label: unit.name,
    id: uuidv4(),
    data: {
      label: unit.name,
      properties: [unit],
    },
  }));

  return items;
}

function getSpriteItems(gameMap: Map): SideBarItem<Sprite>[] {
  const items = gameMap.placed_unit.map<SideBarItem<Sprite>>((sprite) => ({
    label: sprite.name,
    id: uuidv4(),
    data: {
      label: sprite.name,
      properties: [sprite],
    },
  }));

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
