import {
  SidebarContent,
  SidebarHeader,
  Sidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarMenu,
} from "../ui/sidebar";
import { useEntityStore } from "@/store/entityStore";
import { Editor } from "../core/editor";

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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
