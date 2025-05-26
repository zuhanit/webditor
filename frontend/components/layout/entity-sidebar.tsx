import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Sidebar,
} from "@/components/ui/sidebar";
import { usePlacedEntities } from "@/hooks/usePlacedEntities";
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { SearchForm } from "../form/search-form";
import { useEntityStore } from "@/store/entityStore";

export function EntitySidebar() {
  const placedEntities = usePlacedEntities();
  const setEntity = useEntityStore((state) => state.setEntity);

  return (
    <Sidebar className="h-full bg-background-secondary">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <GalleryVerticalEnd className="size-4" />
              <div>
                <h1 className="font-bold">Webditor</h1>
                <p className="text-xs">v1.0.0</p>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {Object.entries(placedEntities).map(([key, entities]) => (
              <Collapsible key={key}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {entities.label}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenuSub>
                        {entities.data.map((entity, index) => (
                          <SidebarMenuSubItem key={`${key}-${index}`}>
                            <SidebarMenuSubButton
                              onClick={() => {
                                console.log(entity);
                                setEntity(entity);
                              }}
                            >
                              {entity.name}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
