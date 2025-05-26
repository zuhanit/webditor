"use client";

import { SidebarProvider } from "./ui/sidebar";
import useFetchRawMap from "@/hooks/useRawMap";
import { Resizable } from "re-resizable";
import { AssetContainer } from "./layout/asset-explorer";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { MapImage } from "./layout/viewport";
import { AssetSidebar } from "./layout/asset-sidebar";
import { DndContext } from "@dnd-kit/core";
import ModalContainer from "./ModalContainer";
import { DragHandler } from "./core/drag-handler";
import { EntitySidebar } from "./layout/entity-sidebar";
import { AppMenu } from "./layout/app-menu";
import { InspectorSidebar } from "./layout/inspector-sidebar";

export default function Editor() {
  const rawMap = useFetchRawMap("test_map");

  if (!rawMap) return <div>Loading...</div>;

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <DndContext>
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
                {/* <Inspector item={selectedEntity?.data} /> */}
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
        <ModalContainer />
      </div>
    </SidebarProvider>
  );
}
