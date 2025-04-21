import { useRawMapStore } from "@/store/mapStore";
import { WObject } from "@/types/schemas/WObject";
import { Usemap } from "@/types/schemas/Usemap";
import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { AssetResult, AssetType } from "@/types/Asset";
import { AssetCard } from "./Asset";

function collectDefaultAssets(gameMap: Usemap): AssetResult {
  let assetID = 0;
  let result: AssetResult = {};
  result["weapon"] = gameMap.weapons.map((weapon) => {
    return {
      id: assetID++,
      item: {
        label: weapon.name,
        path: ["weapons", weapon.id],
        properties: weapon,
      },
    };
  });

  result["unit"] = gameMap.unit_definitions.map((unit_def) => {
    return {
      id: assetID++,
      item: {
        label: unit_def.name,
        path: ["unit_definitions", unit_def.id],
        properties: unit_def,
      },
    };
  });

  return result;
}

interface AssetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  draggingAsset: AssetType | null;
}

export function AssetContainer({ children }: AssetContainerProps) {
  const gameMap = useRawMapStore((state) => state.rawMap);

  const { isOver, setNodeRef } = useDroppable({
    id: "AssetContainer",
  });

  if (gameMap === null) return <div>Loading...</div>;

  const defaultAssets = collectDefaultAssets(gameMap);

  return (
    <div
      ref={setNodeRef}
      className={`${
        isOver ? "bg-fills-primary" : "bg-background-primary"
      } grid max-h-full w-full auto-rows-max grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-2 overflow-auto p-2`}
    >
      {Object.entries(defaultAssets).map(([key, value], id) => {
        return value.map((v, vid) => (
          <AssetCard key={`asset-card-${key}-${id}-${vid}`} item={v.item} />
        ));
      })}
      {children}
    </div>
  );
}
