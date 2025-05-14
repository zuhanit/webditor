import { AssetType } from "@/types/Asset";
import { Item } from "@/types/InspectorItem";
import { DragOverlay, UniqueIdentifier, useDndMonitor } from "@dnd-kit/core";
import { useState } from "react";
import { AssetCard } from "./asset_viewer/Asset";
import { DroppableContextKind } from "@/types/dnd";
import { useRawMapStore } from "@/store/mapStore";

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
  const updateRawMap = useRawMapStore((state) => state.updateRawMap); // zustand 또는 context 등
  const handleChange = (path: (string | number)[], newValue: any) => {
    console.log(path);
    updateRawMap((draft: any) => {
      let target = draft;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = newValue;
    });
  };

  useDndMonitor({
    onDragStart(event) {
      setDraggingAsset({
        id: event.active.id as number,
        item: event.active.data.current as Item,
      });
    },
    onDragEnd(event) {
      console.log(event);
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
          //
        }
      }
    },
  });

  function dropStartsWith(id: UniqueIdentifier, kind: DroppableContextKind) {
    return id.toString().startsWith(kind);
  }

  return (
    <DragOverlay>
      {draggingAsset ? <AssetCard item={draggingAsset.item} /> : null}
    </DragOverlay>
  );
}
