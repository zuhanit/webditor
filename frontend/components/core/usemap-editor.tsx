import { EditorItem } from "@/types/item";
import { ChangeEvent } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "../ui/sidebar";
import { ChevronRight } from "lucide-react";
import { useUsemapStore } from "@/components/pages/editor-page";
import { useDroppableContext } from "@/hooks/useDraggableAsset";
import { z } from "zod";

function createSchemaFromValue(value: unknown): z.ZodType {
  if (value === null) return z.null();
  switch (typeof value) {
    case "string":
      return z.string();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "object": {
      if (Array.isArray(value)) {
        if (value.length === 0) return z.array(z.any());
        return z.array(createSchemaFromValue(value[0]));
      }
      const shape: Record<string, z.ZodType> = {};
      for (const [k, v] of Object.entries(value as object)) {
        shape[k] = createSchemaFromValue(v);
      }
      return z.object(shape);
    }
    default:
      return z.any();
  }
}

function UsemapEditorMenu({
  label,
  value,
  path,
  id,
  handleChange,
}: {
  label: string;
  value: any;
  id: number;
  path: string[];
  handleChange: (path: string[], value: any) => void;
}) {
  const onChangeString = (e: ChangeEvent<HTMLInputElement>) => {
    const timeout = setTimeout(() => {
      handleChange(path, e.target.value);
    }, 500);
    return () => clearTimeout(timeout);
  };
  const onChangeNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const timeout = setTimeout(() => {
      handleChange(path, Number(e.target.value));
    }, 500);
    return () => clearTimeout(timeout);
  };

  const fixedLabel = label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  if (typeof value === "object" && value !== null) {
    if (
      Object.keys(value).includes("ref_type") &&
      value.ref_type == "Definition"
    ) {
      const schema = createSchemaFromValue(value);
      const { isOver, setNodeRef } = useDroppableContext({
        kind: "editor-content",
        id: id,
        data: {
          schema: schema,
          handleChange: handleChange,
          path: path,
        },
      });

      return (
        <Collapsible className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="font-bold">
                <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                <span className="mr-auto font-bold">{fixedLabel}</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarInput
                type="button"
                value={value.name}
                className={`hover:bg-surface-primary ${
                  isOver && "bg-surface-primary"
                }`}
                ref={setNodeRef}
              />
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }
    return (
      <Collapsible className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="font-bold">
              <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
              <span className="mr-auto font-bold">{fixedLabel}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {Object.entries(value).map(([key, value]) => (
                <UsemapEditorMenu
                  key={key}
                  label={key}
                  value={value}
                  id={id}
                  path={[...path, key]}
                  handleChange={handleChange}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  let input: React.ReactNode;
  switch (typeof value) {
    case "boolean":
      input = (
        <SidebarInput
          type="checkbox"
          defaultChecked={value}
          onChange={onChangeString}
        />
      );
      break;
    case "number":
      input = (
        <SidebarInput
          type="number"
          defaultValue={value}
          onChange={onChangeNumber}
        />
      );
      break;
    case "string": {
      input = (
        <SidebarInput
          type={typeof value}
          defaultValue={value}
          onChange={onChangeString}
        />
      );
      break;
    }
    default:
      input = <div>Unsupported type</div>;
      break;
  }

  return (
    <Collapsible className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
            <span className="mr-auto font-bold">{fixedLabel}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>{input}</CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function UsemapEditor({ kind, asset }: EditorItem) {
  const { updateEntity, updateAsset } = useUsemapStore((state) => state);
  const handleChange = (path: string[], value: any) => {
    if (kind === "entities") {
      updateEntity(asset.id, path, value);
    } else if (kind === "assets") {
      updateAsset(asset.id, path, value);
    }
  };

  return (
    <SidebarMenu>
      {Object.entries(asset.data).map(([key, value]) => (
        <UsemapEditorMenu
          key={key}
          label={key}
          value={value}
          id={asset.id}
          path={[key]}
          handleChange={handleChange}
        />
      ))}
    </SidebarMenu>
  );
}
