"use client";

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
import {
  CheckSquare,
  GalleryVerticalEnd,
  Minus,
  Plus,
  SquareDashed,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { SearchForm } from "../form/search-form";
import { useEntityStore } from "@/store/entityStore";
import { Entity } from "@/types/schemas/entities/Entity";
import fuzzysort from "fuzzysort";
import { useState } from "react";

export function EntitySidebar() {
  const placedEntities = usePlacedEntities();
  const {
    entity: currentEntity,
    setEntity,
    checkedEntities,
    setCheckedEntities,
  } = useEntityStore((state) => state);

  const toggleCheckedEntity = (entity: Entity) => {
    console.log(entity);
    if (checkedEntities.includes(entity)) {
      setCheckedEntities(checkedEntities.filter((e) => e !== entity));
    } else {
      setCheckedEntities([...checkedEntities, entity]);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const filteredEntities = searchTerm
    ? Object.entries(placedEntities)
        .map(([key, entities]) => {
          const results = fuzzysort.go(searchTerm, entities.data, {
            key: "name",
          });
          return [
            key,
            {
              ...entities,
              data: results.map((result) => result.obj) as Entity[],
            },
          ] as [string, { data: Entity[]; label: string }];
        })
        .filter(([, entities]) => entities.data.length > 0)
    : (Object.entries(placedEntities) as [
        string,
        { data: Entity[]; label: string },
      ][]);

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
        <SearchForm onSearch={setSearchTerm} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredEntities.map(([key, entities]) => (
              <Collapsible key={key} className="group/collapsible">
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
                              onClick={() => toggleCheckedEntity(entity)}
                              className="justify-start"
                            >
                              {checkedEntities.includes(entity) ? (
                                <CheckSquare className="text-blue" />
                              ) : (
                                <SquareDashed className="text-blue" />
                              )}
                            </SidebarMenuSubButton>
                            <SidebarMenuSubButton
                              onClick={() => {
                                console.log(entity);
                                setEntity(entity);
                              }}
                              isActive={entity === currentEntity}
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
