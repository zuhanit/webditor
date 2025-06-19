import {
  SidebarContent,
  SidebarHeader,
  Sidebar,
  SidebarSeparator,
  SidebarGroup,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";
import { useEntityStore } from "@/store/entityStore";
import { UsemapEditor } from "../core/usemap-editor";

export function InspectorSidebar() {
  const entity = useEntityStore((state) => state.entity);

  if (!entity)
    return (
      <SidebarProvider className="absolute right-2 top-2 flex h-1/3 gap-2">
        <SidebarTrigger className="size-10 rounded-md bg-background-secondary p-2" />
        <Sidebar className="rounded-md" variant="floating">
          Loading...
        </Sidebar>
      </SidebarProvider>
    );

  return (
    <SidebarProvider className="absolute right-2 top-2 flex h-1/3 gap-2">
      <SidebarTrigger className="size-10 rounded-md bg-background-secondary p-2" />
      <Sidebar variant="floating">
        <SidebarHeader className="flex w-full items-center gap-2">
          <h1>{entity.name}</h1>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <UsemapEditor kind="entities" asset={entity} />
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
