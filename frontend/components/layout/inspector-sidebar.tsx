import {
  SidebarContent,
  SidebarHeader,
  Sidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarMenuSub,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useEntityStore } from "@/store/entityStore";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent } from "react";
import { Editor } from "../core/editor";

function InspectorMenu({
  label,
  value,
  path,
}: {
  label: string;
  value: any;
  path: (string | number)[];
}) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("onChange", e.target.value);
  };

  if (typeof value === "object" && value !== null) {
    return (
      <Collapsible>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {label}
              <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
              <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {Object.entries(value).map(([key, value]) => (
                <InspectorMenu
                  key={key}
                  label={key}
                  value={value}
                  path={[...path, key]}
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
          onChange={onChange}
        />
      );
      break;
    case "number":
      input = (
        <SidebarInput type="number" defaultValue={value} onChange={onChange} />
      );
      break;
    case "string": {
      input = (
        <SidebarInput
          type={typeof value}
          defaultValue={value}
          onChange={onChange}
        />
      );
      break;
    }
    default:
      input = <div>Unsupported type</div>;
      break;
  }

  return (
    <Collapsible>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {label}
            <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
            <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>{input}</CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function InspectorSidebar() {
  const entity = useEntityStore((state) => state.entity);

  if (!entity) return <Sidebar>Loading...</Sidebar>;

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader>
        <h1>{entity.name}</h1>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <Editor
              item={{
                label: entity.name,
                path: [],
                properties: entity,
              }}
            />
            {/* {Object.entries(entity).map(([key, value]) => (
              <InspectorMenu
                key={`inspector-menu-${key}`}
                label={key}
                value={value}
                path={[key]}
              />
            ))} */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
