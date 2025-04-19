import { useDraggable } from "@dnd-kit/core";

interface AssetCardProps {
  id: number;
  label: string;
  data: Record<string, any>;
}

export function AssetCard({ id, label, data }: AssetCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: data,
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
