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
  SidebarTrigger,
  SidebarProvider,
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
import React, { createContext, useContext, useState } from "react";
import { useUsemapStore } from "@/components/pages/editor-page";
import { Asset } from "@/types/schemas/asset/Asset";
import { useFilteredAssetTree } from "@/hooks/useAssetTree";

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

export function EntitySidebarItemLabel({
  handleCheck,
  asset,
  children,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton> & {
  handleCheck: (e: React.MouseEvent<SVGSVGElement>) => void;
  asset: Asset;
}) {
  const checkedEntities = useEntityStore((state) => state.checkedEntities);

  return (
    <SidebarMenuButton {...props}>
      {checkedEntities.includes(asset) ? (
        <CheckSquare
          className="size-5 shrink-0 text-blue"
          onClick={handleCheck}
        />
      ) : (
        <SquareDashed
          className="size-5 shrink-0 text-blue"
          onClick={handleCheck}
        />
      )}
      <span className="truncate">{asset.name}</span>
      {children}
    </SidebarMenuButton>
  );
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
              <EntitySidebarItemLabel
                asset={asset}
                handleCheck={handleCheck}
                className="flex items-center gap-2"
              >
                <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
              </EntitySidebarItemLabel>
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
          <EntitySidebarItemLabel
            asset={asset}
            handleCheck={handleCheck}
            onClick={() => setEntity(asset)}
            isActive={entity?.id === asset.id}
          />
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

  const tree = useFilteredAssetTree(usemap?.entities || [], searchTerm);

  return (
    <SidebarProvider className="absolute left-2 top-2 flex h-1/3 gap-2">
      <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2">
                <GalleryVerticalEnd className="size-4 shrink-0" />
                <div>
                  <h1 className="font-bold">
                    {usemap?.scenario_property.name.content}
                  </h1>
                  <p className="text-xs">
                    {usemap?.scenario_property.description.content}
                  </p>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
          <SearchForm className="w-full" onSearch={setSearchTerm} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {tree.map((asset) => (
              <EntitySidebarItem key={asset.id} asset={asset} />
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className="size-10 rounded-md bg-background-primary p-2">
        Close
      </SidebarTrigger>
    </SidebarProvider>
  );
}
