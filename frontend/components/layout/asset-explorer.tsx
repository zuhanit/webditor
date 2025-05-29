"use client";

import { useUsemapStore } from "@/store/mapStore";
import { Usemap } from "@/types/schemas/Usemap";
import React from "react";
import { AssetResult } from "@/types/asset";
import { AssetCard } from "../core/asset";
import { useDroppableContext } from "@/hooks/useDraggableAsset";
import { Unit } from "@/types/schemas/Unit";
import { UnitDefinition } from "@/types/schemas/UnitDefinition";

function unitDefinitionToUnit(def: UnitDefinition): Unit {
  return {
    id: 0,
    name: def.name,
    kind: "Unit",
    use_default: false,
    resource_amount: 0,
    hangar: 0,
    unit_state: 0,
    relation_type: 0,
    related_unit: 0,
    special_properties: 0,
    valid_properties: 0,
    serial_number: 0,
    unit_definition: def,
    transform: {
      id: 0,
      name: "transform",
      position: {
        current: 0,
        max: 0,
        x: 0,
        y: 0,
      },
    },
  };
}
function collectDefaultAssets(gameMap: Usemap): AssetResult {
  let assetID = 0;
  const result: AssetResult = {};
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

  result["unit_definition"] = gameMap.unit_definitions.map((unit_def) => {
    return {
      id: assetID++,
      item: {
        label: unit_def.name,
        path: ["unit_definitions", unit_def.id],
        properties: unit_def,
      },
    };
  });

  result["unit"] = gameMap.unit_definitions.map((def) => {
    return {
      id: assetID++,
      item: {
        label: def.name,
        path: ["units", def.id],
        properties: unitDefinitionToUnit(def),
      },
    };
  });

  return result;
}

interface AssetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function AssetContainer({ children }: AssetContainerProps) {
  const gameMap = useUsemapStore((state) => state.usemap);

  const { isOver, setNodeRef } = useDroppableContext({
    id: "AssetContainer",
    kind: "asset-container",
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
