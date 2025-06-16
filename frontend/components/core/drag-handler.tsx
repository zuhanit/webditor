"use client";

import { Asset } from "@/types/asset";
import { DragOverlay, UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import { ReactElement, useEffect, useState } from "react";
import { DroppableContextKind } from "@/types/dnd";
import { useUsemapStore } from "@/components/pages/editor-page";
import { Viewport } from "@/types/viewport";
import { TILE_SIZE } from "@/lib/scterrain";
import { Unit } from "@/types/schemas/entities/Unit";
import { Entity, EntitySchema } from "@/types/schemas/entities/Entity";
import { SCImageRenderer } from "./renderer";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { useAsseEditortStore } from "@/store/assetEditorStore";
import { z } from "zod";

type DraggingAssetKind =
  | "Asset"
  | "Unit"
  | "Sprite"
  | "Terrain"
  | "Location"
  | "Tile"
  | "Mask";

/**
 * Component for handling every drag/drop event at one component.
 *
 * This component do nothing except rendering overlay of dragging asset by
 * `DragOverlay` component.
 *
 * @returns DragOverlay Component
 */
export function DragHandler() {
  const [draggingAsset, setDraggingAsset] = useState<Asset | null>(null);
  const [draggingAssetKind, setDraggingAssetKind] =
    useState<DraggingAssetKind>("Asset");
  const { setEditorPosition } = useAsseEditortStore((state) => state);

  const { usemap, addEntity } = useUsemapStore((state) => state);

  const placeEntity = (item: Entity, { x, y }: { x: number; y: number }) => {
    const copiedEntity = structuredClone(item);
    copiedEntity.transform.position.x = x;
    copiedEntity.transform.position.y = y;

    addEntity({
      id: copiedEntity.id,
      name: copiedEntity.name,
      type: "file",
      data: copiedEntity,
      parent_id: -1,
      preview: null,
    });
  };

  useEffect(() => {
    if (draggingAsset) {
      const isEntity = EntitySchema.safeParse(draggingAsset.data).success;
      if (isEntity) {
        setDraggingAssetKind(draggingAsset.data.kind);
      }
    }
  }, [draggingAsset]);

  useDndMonitor({
    onDragStart(event) {
      setDraggingAsset(event.active.data.current as Asset);
    },

    onDragEnd(event) {
      setDraggingAsset(null);
      if (event.active.id.toString().startsWith("asset-editor")) {
        setEditorPosition((prev) => ({
          x: prev.x + event.delta.x,
          y: prev.y + event.delta.y,
        }));
        return;
      }

      if (event.over) {
        if (dropStartsWith(event.over.id, "asset-container")) {
          //
        }

        if (dropStartsWith(event.over.id, "inspector")) {
          //
        }
        if (dropStartsWith(event.over.id, "editor-content")) {
          if (!draggingAsset) return;
          const { schema, handleChange, path } = event.over.data.current! as {
            schema: z.ZodType;
            handleChange: (path: string[], value: any) => void;
            path: string[];
          };
          const parsed = schema.safeParse(draggingAsset.data);
          if (parsed.success) {
            handleChange(path, parsed.data);
          }
        }

        if (dropStartsWith(event.over.id, "viewport")) {
          if (!draggingAsset) return;

          const parsed = EntitySchema.safeParse(draggingAsset.data);
          if (!parsed.success) return;

          const localX =
            event.active.rect.current.translated!.left - event.over.rect.left;
          const localY =
            event.active.rect.current.translated!.top - event.over.rect.top;

          const viewport = event.over.data.current as Viewport;
          const placementX = Math.floor(localX + viewport.startX * TILE_SIZE);
          const placementY = Math.floor(localY + viewport.startY * TILE_SIZE);

          placeEntity(draggingAsset.data, {
            x: placementX,
            y: placementY,
          });
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
        const unit = draggingAsset.data as Unit;
        overlay = (
          <SCImageRenderer
            version="sd"
            imageIndex={
              unit.unit_definition.specification.graphics.sprite.image.id
            }
            frame={0}
          />
        );
        break;
      }
      case "Sprite": {
        const sprite = draggingAsset.data as Sprite;
        overlay = (
          <SCImageRenderer
            version="sd"
            imageIndex={sprite.definition.image.id}
            frame={0}
          />
        );
      }
    }
  } else {
    overlay = null;
  }

  return <DragOverlay>{overlay}</DragOverlay>;
}
