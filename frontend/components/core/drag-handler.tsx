"use client";

import { AssetType } from "@/types/Asset";
import { DragOverlay, UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import { ReactElement, useState } from "react";
import { DroppableContextKind } from "@/types/dnd";
import { useRawMapStore } from "@/store/mapStore";
import { Viewport } from "@/types/Viewport";
import { TILE_SIZE } from "@/lib/scterrain";
import { Unit, UnitSchema } from "@/types/schemas/Unit";
import { Entity, EntitySchema } from "@/types/schemas/Entity";
import { SCImageRenderer } from "./renderer";
import { Sprite } from "@/types/schemas/Sprite";

type DraggingAssetKind = "Asset" | "Unit" | "Sprite" | "Terrain" | "Location";

/**
 * Component for handling every drag/drop event at one component.
 *
 * This component do nothing except rendering overlay of dragging asset by
 * `DragOverlay` component.
 *
 * @returns DragOverlay Component
 */
export function DragHandler() {
  const [draggingAsset, setDraggingAsset] = useState<AssetType | null>(null);
  const [draggingAssetKind, setDraggingAssetKind] =
    useState<DraggingAssetKind>("Asset");

  const usemap = useRawMapStore((state) => state.rawMap);
  const updateRawMap = useRawMapStore((state) => state.updateRawMap); // zustand 또는 context 등
  const handleChange = (path: (string | number)[], newValue: any) => {
    updateRawMap((draft: any) => {
      let target = draft;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = newValue;
    });
  };

  const placeEntity = (item: Entity, { x, y }: { x: number; y: number }) => {
    const unitParse = UnitSchema.safeParse(item);
    if (unitParse.success) {
      const unit = Object.assign({}, item) as Unit;
      unit.transform.position.x = x;
      unit.transform.position.y = y;

      updateRawMap((draft) => {
        draft.placed_unit = [...draft.placed_unit, unit];
      });
    }
  };

  useDndMonitor({
    onDragStart(event) {
      setDraggingAsset({
        id: event.active.id as number,
        item: {
          label: event.active.id as string,
          path: [],
          properties: event.active.data.current!,
        },
      });

      const isEntity = EntitySchema.safeParse(
        event.active.data.current,
      ).success;
      if (isEntity) {
        const entity = event.active.data.current as Entity;
        setDraggingAssetKind(entity.kind);
      }
    },
    onDragEnd(event) {
      setDraggingAsset(null);
      if (event.over) {
        if (dropStartsWith(event.over.id, "asset-container")) {
          //
        }

        if (dropStartsWith(event.over.id, "asset-editor")) {
          handleChange(
            event.over.data.current as any,
            event.active.data.current,
          );
        }

        if (dropStartsWith(event.over.id, "inspector")) {
          //
        }
        if (dropStartsWith(event.over.id, "inspector-content")) {
          handleChange(
            event.over.data.current as any,
            event.active.data.current,
          );
        }

        if (dropStartsWith(event.over.id, "viewport")) {
          const localX =
            event.active.rect.current.translated!.left - event.over.rect.left;
          const localY =
            event.active.rect.current.translated!.top - event.over.rect.top;

          const viewport = event.over.data.current as Viewport;
          const placementX = Math.floor(localX + viewport.startX * TILE_SIZE);
          const placementY = Math.floor(localY + viewport.startY * TILE_SIZE);

          const parsed = EntitySchema.safeParse(event.active.data.current);
          if (parsed.success) {
            const entity = event.active.data.current as Entity;
            setDraggingAssetKind(entity.kind);
            placeEntity(entity, {
              x: placementX,
              y: placementY,
            });
          }
        }
      }
    },
  });

  function dropStartsWith(id: UniqueIdentifier, kind: DroppableContextKind) {
    return id.toString().startsWith(kind);
  }

  let overlay: ReactElement | null = null;
  if (draggingAsset && usemap) {
    switch (draggingAssetKind) {
      case "Unit": {
        const unit = draggingAsset.item.properties as Unit;
        const flingyID = unit.unit_definition.specification.graphics;
        const spriteID = usemap.flingy[flingyID].sprite;
        const imageID = usemap.sprite[spriteID].image;
        overlay = (
          <SCImageRenderer version="sd" imageIndex={imageID} frame={0} />
        );
        break;
      }
      case "Sprite": {
        const sprite = draggingAsset.item.properties as Sprite;
        const imageID = usemap.sprite[sprite.image].image;
        overlay = (
          <SCImageRenderer version="sd" imageIndex={imageID} frame={0} />
        );
      }
    }
  } else {
    overlay = null;
  }

  return <DragOverlay>{overlay}</DragOverlay>;
}
