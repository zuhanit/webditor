import { AssetType } from "@/types/Asset";
import { Item } from "@/types/InspectorItem";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { useState } from "react";
import { AssetCard } from "./asset_viewer/Asset";

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

  useDndMonitor({
    onDragStart(event) {
      if (event.active === null) return;
      setDraggingAsset({
        id: event.active.id as number,
        item: event.active.data.current as Item,
      });
    },
    onDragEnd(event) {
      console.log(event);
      setDraggingAsset(null);
    },
  });

  return (
    <DragOverlay>
      {draggingAsset ? <AssetCard item={draggingAsset.item} /> : null}
    </DragOverlay>
  );
}
