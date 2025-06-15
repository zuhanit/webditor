import {
  SidebarContent,
  SidebarHeader,
  Sidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarMenu,
} from "../ui/sidebar";
import { useEntityStore } from "@/store/entityStore";
import { UsemapEditor } from "../core/usemap-editor";

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
            <UsemapEditor kind="entities" label={entity.name} asset={entity} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
