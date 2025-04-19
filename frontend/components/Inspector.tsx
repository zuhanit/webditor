import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { ListHeader } from "./ui/listheader";
import { Square } from "lucide-react";
import { SquareCheck } from "lucide-react";
import { useState } from "react";
import { Item } from "@/types/InspectorItem";
import { Resizable } from "re-resizable";
import { useRawMapStore } from "@/store/mapStore";
import { trackInspectorEdit } from "@/lib/firebase/analytics";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  useDndMonitor,
  useDroppable,
} from "@dnd-kit/core";
import { AssetType } from "@/types/Asset";
import { WObject } from "@/types/schemas/WObject";

function InspectorHeader({ label }: { label: string }) {
  const [isChecked, setIsChecked] = useState(false);

  function onClickCheck(e: React.MouseEvent<HTMLInputElement>) {
    setIsChecked(!isChecked);
  }

  return (
    <div className="flex h-11 w-full items-center justify-between">
      {label
        .split("_")
        .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
        .join(" ")}
      <label htmlFor={`${label}-checkbox`}>
        <input
          type="checkbox"
          id={`${label}-checkbox`}
          onClick={(e) => onClickCheck(e)}
          className="hidden"
        />
        {isChecked ? (
          <SquareCheck strokeWidth={1} className="text-blue" />
        ) : (
          <Square strokeWidth={1} className="" />
        )}
      </label>
    </div>
  );
}

function InspectorContent({
  label,
  value,
  onChange,
  path = [],
}: {
  label: string;
  value: any;
  onChange: (path: string[], newValue: any) => void;
  path?: string[];
}) {
  const fullPath = [...path, label];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputType = typeof value;
    const updatedValue =
      inputType === "number"
        ? parseFloat(e.target.value)
        : inputType === "boolean"
          ? e.target.checked
          : e.target.value;
    onChange(fullPath, updatedValue);
  }

  function handleEndDrop(e: DragEndEvent) {
    console.log("HANDLING");
  }

  if (!value) return <div></div>;
  let content: React.ReactNode;
  switch (typeof value) {
    case "number":
      content = (
        <input type="number" defaultValue={value} onChange={handleChange} />
      );
      break;
    case "boolean":
      content = (
        <input type="checkbox" defaultChecked={value} onChange={handleChange} />
      );
      break;
    case "function":
      content = <div>❌ Type 'function is not supported yet in Webditor.</div>;
      break;
    case "string":
      content = (
        <input type="text" defaultValue={value} onChange={handleChange} />
      );
      break;
    case "object":
      if (value === null) {
        content = <div>❌ Null is not supported</div>;
        break;
      }

      if ("ref_type" in value) {
        const { isOver, setNodeRef } = useDroppable({
          id: fullPath.join("."),
        });
        useDndMonitor({
          onDragEnd(event) {
            if (event.active.data !== null) {
              onChange(fullPath, event.active.data.current);
            }
          },
        });

        content = (
          <div
            ref={setNodeRef}
            className={`${isOver ? "bg-blue" : ""} m-2 h-full w-full border-2 border-solid p-2`}
          >
            {value["name"]}
          </div>
        );
        break;
      }

      content = (
        <div className="border-muted border-l pl-2">
          {Object.entries(value).map(([childLabel, childValue], index) => (
            <InspectorContent
              key={`${label}.${childLabel}.${index}`}
              label={childLabel}
              value={childValue}
              onChange={onChange}
              path={fullPath}
            />
          ))}
        </div>
      );
      break;
    case "symbol":
      content = <div>❌ Type 'symbol' is not supported yet in Webditor.</div>;
      break;
    case "undefined":
      content = <div>❌ Undefined type detected.</div>;
      break;
  }

  return (
    <Collapsible className="w-full border-b border-seperator-opaque pl-2 pr-4">
      <InspectorHeader label={label} />
      <CollapsibleContent> {content} </CollapsibleContent>
    </Collapsible>
  );
}

interface InspectorProps {
  item: Item | undefined;
  draggingAsset: AssetType<WObject> | null;
}

export const Inspector = ({ item, draggingAsset }: InspectorProps) => {
  const updateRawMap = useRawMapStore((state) => state.updateRawMap); // zustand 또는 context 등
  const handleChange = (path: string[], newValue: any) => {
    updateRawMap((draft) => {
      let target = draft;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = newValue;
    });

    trackInspectorEdit(item.label, path.join("."), newValue);
  };

  if (!item)
    return (
      <Resizable
        defaultSize={{ width: "25%" }}
        minWidth={"25%"}
        enable={{ left: true }}
      >
        <div></div>
      </Resizable>
    );

  return (
    <Resizable
      minWidth={"25%"}
      enable={{ left: true }}
      className="h-full overflow-auto"
    >
      <div>
        <ListHeader icon={item.icon} label={item.label} />
        {item.properties &&
          Object.entries(item.properties).map(([key, prop]) => (
            <InspectorContent
              key={`${key}`}
              label={key}
              value={prop}
              onChange={handleChange}
              path={item.path}
            />
          ))}
      </div>
    </Resizable>
  );
};
