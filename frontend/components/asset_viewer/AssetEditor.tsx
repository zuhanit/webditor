import { useModals } from "@/hooks/useModals";
import { TopBar, TopBarButton } from "@/components/topbar/TopBar";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { DndContext, useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useRawMapStore } from "@/store/mapStore";
import { Item } from "@/types/InspectorItem";

interface AssetEditorContentProps {
  label: string;
  value: any;
  path: (string | number)[];
  onChange: (path: string[], newValue: any) => void;
}

function AssetEditorContent({
  label,
  value,
  path,
  onChange,
}: AssetEditorContentProps) {
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

  let content: React.ReactElement;
  switch (typeof value) {
    case "boolean":
      content = (
        <input type="checkbox" defaultChecked={value} onChange={handleChange} />
      );
      break;
    case "number":
      content = (
        <input type="number" defaultValue={value} onChange={handleChange} />
      );
      break;
    case "string":
      content = (
        <input type="string" defaultValue={value} onChange={handleChange} />
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
        // useDndMonitor({
        //   onDragEnd(event) {
        //     if (event.active.data !== null) {
        //       onChange(fullPath, event.active.data.current);
        //     }
        //   },
        // });

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
            <AssetEditorContent
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
    default:
      content = <div>Not supported type</div>;
      break;
  }
  return (
    <Collapsible className="border-b p-2">
      {label}
      <CollapsibleContent>{content}</CollapsibleContent>
    </Collapsible>
  );
}

interface AssetEditorProps {
  label: string;
  item: Item;
}

export default function AssetEditor({ label, item }: AssetEditorProps) {
  const updateRawMap = useRawMapStore((state) => state.updateRawMap); // zustand 또는 context 등
  const handleChange = (path: string[], newValue: any) => {
    updateRawMap((draft) => {
      let target = draft;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = newValue;
    });
  };
  const { close } = useModals();
  const handleCloseModal = () => {
    close();
  };

  return (
    <DndContext>
      <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
        <div className="pointer-events-auto relative h-2/3 w-1/3 rounded bg-background-tertiary p-6 shadow-lg">
          <TopBar label={label} close onClickClose={handleCloseModal}></TopBar>
          <div className="h-full w-full overflow-auto">
            {Object.entries(item.properties).map(([key, prop], id) => (
              <AssetEditorContent
                label={key}
                value={prop}
                key={`asset-editor-${key}-${id}`}
                path={item.path}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
