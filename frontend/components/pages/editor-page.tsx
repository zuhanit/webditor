"use client";

import { DragHandler } from "@/components/core/drag-handler";
import {
  EntitySidebar,
  EntitySidebarProvider,
} from "@/components/layout/entity-sidebar";
import { InspectorSidebar } from "@/components/layout/inspector-sidebar";
import { MapImage } from "@/components/layout/viewport";
import { DndContext } from "@dnd-kit/core";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { AssetEditor } from "@/components/core/asset";
import { AppToolbar } from "@/components/layout/app-toolbar";
import { createContext, useContext, useEffect, useRef } from "react";
import { createUsemapStore, UsemapStore } from "@/store/mapStore";
import { useStore } from "zustand";
import { AssetContainer } from "../layout/asset-container";

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
    <div className="flex h-screen flex-col overflow-hidden">
      <DndContext sensors={sensors}>
        <DragHandler />
        <AppToolbar />
        {/* Main Content */}
        <div className="flex w-full flex-1 flex-col gap-2.5">
          {/* Layer Tab Bar */}

          <div className="relative flex-1">
            <MapImage className="absolute h-full w-full" />
            <EntitySidebarProvider>
              <EntitySidebar />
            </EntitySidebarProvider>
            <InspectorSidebar />
            <AssetContainer />
            <AssetEditor />
          </div>
        </div>
      </DndContext>
    </div>
  );
}
