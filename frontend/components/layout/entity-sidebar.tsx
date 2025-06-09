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
import {
  CheckSquare,
  GalleryVerticalEnd,
  Minus,
  Plus,
  SquareDashed,
  Folder,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { SearchForm } from "../form/search-form";
import { useEntityStore } from "@/store/entityStore";
import fuzzysort from "fuzzysort";
import { createContext, useContext, useState } from "react";
import { useUsemapStore } from "@/store/mapStore";
import { AssetType } from "@/types/asset";

const filterEntity = (searchTerm: string, entity: AssetType) => {
  const result = fuzzysort.go(searchTerm, [
    entity.name,
    ...(entity.children?.map((child) => child.name) || []),
  ]);
  return result.length > 0;
};

interface EntitySidebarContextProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

const EntitySidebarContext = createContext<EntitySidebarContextProps | null>(
  null,
);

function useEntitySidebar() {
  const context = useContext(EntitySidebarContext);
  if (!context) {
    throw new Error(
      "useEntitySidebar must be used within an EntitySidebarProvider",
    );
  }
  return context;
}

export function EntitySidebarItem({ asset }: { asset: AssetType }) {
  const { setEntity, checkedEntities, setCheckedEntities } = useEntityStore();
  const { searchTerm } = useEntitySidebar();

  const filteredResult = searchTerm
    ? asset.children!.filter((entity) => filterEntity(searchTerm, entity))
    : asset.children;

  const handleCheck = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (checkedEntities.includes(asset)) {
      setCheckedEntities(checkedEntities.filter((a) => a !== asset));
    } else {
      setCheckedEntities([...checkedEntities, asset]);
    }
  };

  if (asset.type === "folder") {
    return (
      <SidebarMenu>
        <Collapsible key={asset.name} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="flex items-center gap-2">
                {checkedEntities.includes(asset) ? (
                  <CheckSquare className="text-blue" onClick={handleCheck} />
                ) : (
                  <SquareDashed className="text-blue" onClick={handleCheck} />
                )}
                {asset.name}
                <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {filteredResult && filteredResult.length > 0 ? (
                  filteredResult.map((child) => (
                    <SidebarMenuSubItem key={`${asset.id}-${child.id}`}>
                      <EntitySidebarItem asset={child} />
                    </SidebarMenuSubItem>
                  ))
                ) : (
                  <SidebarMenuSubItem>
                    <span className="px-2 text-text-muted">Empty</span>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    );
  }

  if (asset.type === "file") {
    if (filteredResult && filteredResult.length > 0) {
      return (
        <Collapsible key={asset.name}>
          <CollapsibleTrigger>
            <SidebarMenuButton onClick={() => setEntity(asset)}>
              {asset.name}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {filteredResult
              ? filteredResult.map((child) => (
                  <EntitySidebarItem key={child.name} asset={child} />
                ))
              : null}
          </CollapsibleContent>
        </Collapsible>
      );
    } else {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            className="flex items-center gap-2"
            onClick={() => setEntity(asset)}
          >
            {checkedEntities.includes(asset) ? (
              <CheckSquare className="text-blue" onClick={handleCheck} />
            ) : (
              <SquareDashed className="text-blue" onClick={handleCheck} />
            )}
            {asset.name}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }
  }
}

export function EntitySidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <EntitySidebarContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </EntitySidebarContext.Provider>
  );
}

export function EntitySidebar() {
  const usemap = useUsemapStore((state) => state.usemap);
  const { searchTerm, setSearchTerm } = useEntitySidebar();

  if (!usemap) return null;

  const filteredResult = searchTerm
    ? usemap.entities.children!.filter((entity) =>
        filterEntity(searchTerm, entity),
      )
    : usemap.entities.children;
  console.log(filteredResult);

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
          {filteredResult!.map((result) => (
            <EntitySidebarItem key={result.id} asset={result as AssetType} />
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
