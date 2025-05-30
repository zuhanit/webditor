import { Item } from "@/types/item";
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

function EditorMenu({
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
  const fixedLabel = label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  if (typeof value === "object" && value !== null) {
    return (
      <Collapsible className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="font-bold">
              {fixedLabel}
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {Object.entries(value).map(([key, value]) => (
                <EditorMenu
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
    <Collapsible className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <span className="font-bold">{fixedLabel}</span>
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>{input}</CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function Editor({ item }: { item: Item }) {
  return (
    <SidebarMenu>
      {Object.entries(item.properties).map(([key, value]) => (
        <EditorMenu key={key} label={key} value={value} path={[key]} />
      ))}
    </SidebarMenu>
  );
}
