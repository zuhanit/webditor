import { useRawMapStore } from "@/store/mapStore";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import React, { HTMLAttributes } from "react";

interface AssetCardProps {
  id: number;
  label: string;
}

export function AssetCard({ id, label }: AssetCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex h-32 w-32 items-center justify-center bg-background-secondary p-2"
    >
      {label}
    </div>
  );
}

interface AssetContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function AssetContainer({ children }: AssetContainerProps) {
  const gameMap = useRawMapStore((state) => state.rawMap);

  const { isOver, setNodeRef } = useDroppable({
    id: "Dropabble",
  });

  return (
    <DndContext>
      <div
        ref={setNodeRef}
        className={`${
          isOver ? "bg-fills-primary" : "bg-background-primary"
        } grid max-h-full w-full auto-rows-max grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-2 overflow-auto p-2`}
      >
        {gameMap
          ? gameMap.unit.map((unit, id) => (
              <AssetCard id={id} key={id} label={unit.name} />
            ))
          : undefined}
        {children}
      </div>
    </DndContext>
  );
}
