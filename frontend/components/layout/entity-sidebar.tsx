"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  Sidebar,
} from "@/components/ui/sidebar";
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
import { createContext, useContext, useMemo, useState } from "react";
import { useUsemapStore } from "@/components/pages/editor-page";
import { Asset } from "@/types/schemas/asset/Asset";
import { useEntityAssetTree } from "@/hooks/useAssetTree";

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

export function EntitySidebarItem({
  asset,
}: {
  asset: Asset & { children?: Asset[] };
}) {
  const { setEntity, entity, checkedEntities, setCheckedEntities } =
    useEntityStore();

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
                {asset.children && asset.children.length > 0 ? (
                  asset.children.map((child) => (
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
    if (asset.children && asset.children.length > 0) {
      return (
        <Collapsible key={asset.name}>
          <CollapsibleTrigger>
            <SidebarMenuButton
              onClick={() => setEntity(asset)}
              isActive={entity?.id === asset.id}
            >
              {asset.name}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {asset.children
              ? asset.children.map((child) => (
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
            isActive={entity?.id === asset.id}
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

  const filteredResult = useMemo(() => {
    return searchTerm
      ? usemap?.entities.filter((entity) => entity.name.includes(searchTerm))
      : usemap?.entities;
  }, [usemap?.entities, searchTerm]);

  const tree = useEntityAssetTree(filteredResult || []);

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
          {tree?.map((entity) => (
            <EntitySidebarItem key={entity.id} asset={entity} />
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
