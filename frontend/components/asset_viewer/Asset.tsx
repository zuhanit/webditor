import { useModals } from "@/hooks/useModals";
import { useDraggable } from "@dnd-kit/core";
import AssetEditor from "./AssetEditor";
import { Item } from "@/types/InspectorItem";

interface AssetCardProps {
  item: Item;
}

export function AssetCard({ item }: AssetCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.label,
    data: item.properties,
  });
  const { open } = useModals();
  const handleDoubleClick = () => {
    open(AssetEditor, { label: item.label, item: item });
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleDoubleClick}
      className="flex h-32 w-32 items-center justify-center bg-background-secondary p-2"
    >
      <div {...listeners} {...attributes} className="cursor-move">
        {item.label}
      </div>
    </div>
  );
}
