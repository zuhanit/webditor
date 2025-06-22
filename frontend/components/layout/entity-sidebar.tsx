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
  SidebarInput,
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
import React, { createContext, useContext, useState, useCallback } from "react";
import { useUsemapStore } from "@/components/pages/editor-page";
import { AssetNode } from "@/types/asset";
import { useFilteredAssetTree } from "@/hooks/useAssetTree";
import { Entity } from "@/types/schemas/entities/Entity";

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

const getAllEntities = (entityAsset: AssetNode<Entity>) => {
  const entities: AssetNode<Entity>[] = [entityAsset];
  entityAsset.children.forEach((child) => {
    entities.push(...getAllEntities(child));
  });
  return entities;
};

export function EntitySidebarItemLabel({
  handleCheck,
  asset,
  children,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton> & {
  handleCheck: (e: React.MouseEvent<SVGSVGElement>) => void;
  asset: AssetNode;
}) {
  const checkedEntities = useEntityStore((state) => state.checkedEntities);
  const { deleteEntity, updateEntityAssetName } = useUsemapStore(
    (state) => state,
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [inputValue, setInputValue] = useState(asset.name);

  const handleSave = useCallback(() => {
    try {
      updateEntityAssetName(asset.id, inputValue);
    } catch (err) {
      console.error("Failed to rename asset:", err);
    }
  }, [asset.id, asset.name, inputValue]);

  const handleCancel = useCallback(() => {
    console.log("canceledd");
    setInputValue(asset.name);
    setIsRenaming(false);
  }, [asset.name]);

  const handleKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      // rename 모드일 때는 SidebarInput이 키 이벤트를 처리하도록 함
      if (isRenaming) return;

      switch (e.key) {
        case "r":
        case "R":
        case "F2": {
          e.preventDefault();
          e.stopPropagation();
          setIsRenaming(true);
          setInputValue(asset.name);
          break;
        }
        case "Delete":
          e.preventDefault();
          e.stopPropagation();
          getAllEntities(asset).forEach((e) => deleteEntity(e));
          break;
      }
    },
    [isRenaming, asset.name],
  );

  const handleInputKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleCancel();
          break;
        case "Enter":
          e.preventDefault();
          if (inputValue.trim() && inputValue.trim() !== asset.name) {
            handleSave();
          } else {
            handleCancel();
          }
          break;
      }
    },
    [inputValue, asset.name, handleCancel, handleSave],
  );

  return (
    <SidebarMenuButton onKeyDown={handleKeydown} tabIndex={0} {...props}>
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
      {isRenaming ? (
        <SidebarInput
          value={inputValue}
          onBlur={handleCancel}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeydown}
          autoFocus
        ></SidebarInput>
      ) : (
        <span className="truncate">{asset.name}</span>
      )}
      {children}
    </SidebarMenuButton>
  );
}

export function EntitySidebarItem({ asset }: { asset: AssetNode }) {
  const { setEntity, entity, checkedEntities, setCheckedEntities } =
    useEntityStore();

  const handleCheck = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();

    const allEntities = getAllEntities(asset);
    const allChecked = allEntities.every((entity) =>
      checkedEntities.includes(entity),
    );

    if (allChecked) {
      // If all entities are checked, uncheck them all
      setCheckedEntities(
        checkedEntities.filter((e) => !allEntities.includes(e)),
      );
    } else {
      // If not all entities are checked, check them all
      const newEntities = allEntities.filter(
        (entity) => !checkedEntities.includes(entity),
      );
      setCheckedEntities([...checkedEntities, ...newEntities]);
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
  const deleteEntity = useUsemapStore((state) => state.deleteEntity);
  const { searchTerm, setSearchTerm } = useEntitySidebar();
  const { entity, checkedEntities, setCheckedEntities } = useEntityStore();

  const tree = useFilteredAssetTree(usemap?.entities || [], searchTerm);

  const handleDelete = useCallback(() => {
    if (checkedEntities.length > 0) {
      checkedEntities.forEach((e) => deleteEntity(e));
    }
    console.log("Deleting entities:", checkedEntities);
    setCheckedEntities([]);
  }, [checkedEntities, tree, setCheckedEntities, deleteEntity]);

  const handleRename = useCallback(() => {
    if (entity) {
      // Start rename mode for selected entity
      console.log("Renaming entity:", entity);
    }
  }, [entity]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Delete":
          event.preventDefault();
          handleDelete();
          break;
      }
    },
    [handleDelete, handleRename],
  );

  return (
    <SidebarProvider className="absolute left-2 top-2 flex h-1/3 gap-2">
      <Sidebar variant="floating" onKeyDown={handleKeyDown} tabIndex={0}>
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
