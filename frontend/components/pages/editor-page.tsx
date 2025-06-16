"use client";

import { DragHandler } from "@/components/core/drag-handler";
import { AssetExplorer } from "@/components/layout/asset-explorer";
import { AssetSidebar } from "@/components/layout/asset-sidebar";
import {
  EntitySidebar,
  EntitySidebarProvider,
} from "@/components/layout/entity-sidebar";
import { InspectorSidebar } from "@/components/layout/inspector-sidebar";
import { MapImage } from "@/components/layout/viewport";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DndContext } from "@dnd-kit/core";
import { Resizable } from "re-resizable";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { AssetEditor } from "@/components/core/asset";
import { AppToolbar } from "@/components/layout/app-toolbar";
import { createContext, useContext, useEffect, useRef } from "react";
import { createUsemapStore, UsemapStore } from "@/store/mapStore";
import { useStore } from "zustand";

export type UsemapStoreApi = ReturnType<typeof createUsemapStore>;

export const UsemapStoreContext = createContext<UsemapStoreApi | undefined>(
  undefined,
);

export function UsemapStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<UsemapStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUsemapStore();
  }

  return (
    <UsemapStoreContext.Provider value={storeRef.current}>
      {children}
    </UsemapStoreContext.Provider>
  );
}

export const useUsemapStore = <T,>(selector: (store: UsemapStore) => T) => {
  const usemapStoreContext = useContext(UsemapStoreContext);

  if (!usemapStoreContext) {
    throw new Error("useUsemapStore must be used within a UsemapStoreProvider");
  }

  return useStore(usemapStoreContext, selector);
};

export function EditorPage() {
  const { fetchUsemap } = useUsemapStore((state) => state);

  useEffect(() => {
    fetchUsemap("test_map");
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <DndContext sensors={sensors}>
          <DragHandler />
          <AppToolbar />
          {/* Main Content */}
          <Resizable className="flex flex-1 overflow-hidden">
            {/* Left Explorer (SideBar) */}
            <Resizable>
              <EntitySidebarProvider>
                <EntitySidebar />
              </EntitySidebarProvider>
            </Resizable>

            <div className="flex w-full flex-col gap-2.5">
              {/* Layer Tab Bar */}
              <div className="flex w-full justify-center">
                <div className="bg-fills-primary flex w-[588px] items-center gap-2.5 rounded-[10px] px-2.5 py-1 text-lg font-medium">
                  <ToggleGroup>
                    <ToggleGroupItem label="Terrain" />
                    <ToggleGroupItem label="Unit" />
                    <ToggleGroupItem label="Location" />
                    <ToggleGroupItem label="Sprite" />
                    <ToggleGroupItem label="Doodads" />
                  </ToggleGroup>
                </div>
              </div>

              {/* Center Map Viewer */}
              <div className="flex h-full">
                <MapImage />
                <Resizable defaultSize={{ width: "25%" }} className="w-full">
                  <InspectorSidebar />
                </Resizable>
              </div>
            </div>
          </Resizable>

          {/* Bottom Project/Asset Container */}
          <div className="flex h-full flex-1 overflow-hidden border-t-text-muted">
            <Resizable className="h-full">
              <AssetSidebar />
            </Resizable>
            <AssetExplorer />
          </div>
          <AssetEditor />
        </DndContext>
      </div>
    </SidebarProvider>
  );
}
