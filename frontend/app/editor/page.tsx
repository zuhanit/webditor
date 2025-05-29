"use client";

import { DragHandler } from "@/components/core/drag-handler";
import { AppMenu } from "@/components/layout/app-menu";
import { AssetContainer } from "@/components/layout/asset-explorer";
import { AssetSidebar } from "@/components/layout/asset-sidebar";
import { EntitySidebar } from "@/components/layout/entity-sidebar";
import { InspectorSidebar } from "@/components/layout/inspector-sidebar";
import { MapImage } from "@/components/layout/viewport";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DndContext } from "@dnd-kit/core";
import { Resizable } from "re-resizable";
import useFetchUsemap from "@/hooks/useRawMap";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { AssetEditor } from "@/components/core/asset";

export default function Editor() {
  useFetchUsemap("test_map");
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
          <AppMenu />

          {/* Main Content */}
          <Resizable className="flex flex-1 overflow-hidden">
            {/* Left Explorer (SideBar) */}
            <Resizable>
              <EntitySidebar />
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
            <AssetContainer />
          </div>
        </DndContext>
        <AssetEditor />
      </div>
    </SidebarProvider>
  );
}
