import { useRawMapStore } from "@/store/mapStore";
import { WObject } from "@/types/schemas/WObject";
import { Usemap } from "@/types/schemas/Usemap";
import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { AssetResult, AssetType } from "@/types/Asset";
import { AssetCard } from "./Asset";

function collectDefaultAssets(gameMap: Usemap): AssetResult<WObject> {
  let id = 0;
  let result: AssetResult<WObject> = {};
  result["weapon"] = gameMap.weapons.map((weapon) => {
    return {
      id: id++,
      data: weapon,
    };
  });

  result["unit"] = gameMap.unit.map((unit) => {
    return {
      id: id++,
      data: unit,
    };
  });

  return result;
}

interface AssetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  draggingAsset: AssetType<WObject> | null;
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
      {Object.entries(defaultAssets).map(([key, value]) => {
        return value.map((v) => (
          <AssetCard id={v.id} key={v.id} label={v.data.name} data={v.data} />
        ));
      })}
      {children}
    </div>
  );
}
