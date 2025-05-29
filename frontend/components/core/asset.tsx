import { useModals } from "@/hooks/useModals";
import { useDraggable } from "@dnd-kit/core";
import AssetEditor from "../asset_viewer/AssetEditor";
import { Item } from "@/types/InspectorItem";
import { Card, CardHeader } from "../ui/card";

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
    <Card
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleDoubleClick}
      {...listeners}
      {...attributes}
    >
      <CardHeader>{item.label}</CardHeader>
    </Card>
  );
}
