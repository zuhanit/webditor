"use client";

import { useState } from "react";
import { SideBar, SideBarItem } from "./ui/sidebar";
import useFetchRawMap from "@/hooks/useRawMap";
import { Item } from "@/types/InspectorItem";
import { PanelLeft } from "lucide-react";
import { Resizable } from "re-resizable";
import { AssetContainer } from "./asset_viewer/AssetContainer";
import { Inspector } from "./Inspector";
import { LayerBar, LayerBarButton } from "./LayerBar";
import { MapImage } from "./MapImage";
import { Project } from "./Project";
import { TopBar, TopBarButton } from "./topbar/TopBar";
import api from "@/lib/api";
import { DndContext } from "@dnd-kit/core";
import ModalContainer from "./ModalContainer";
import { DragHandler } from "./DragHandler";

export default function Editor() {
  const [selectedEntity, setSelectedEntity] =
    useState<SideBarItem<Item> | null>(null);
  const handleSelectedEntity = (item: SideBarItem<Item>) => {
    setSelectedEntity(item);
  };
  const rawMap = useFetchRawMap("test_map");

  if (!rawMap) return <div>Loading...</div>;

  // FIXME: Compiling test button, please remove this after.
  const onClickBuild = async () => {
    if (!rawMap) return;

    try {
      console.log("Compiling map", rawMap.rawMap);
      const response = await api.post("/api/v1/maps/build", rawMap.rawMap, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compiled_map.scx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to compile map:", error);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <DndContext>
        <DragHandler />
        {/* Upside Tab Bar */}
        <TopBar label="any-starcraft-map" minimize popup close>
          <div className="flex items-center gap-2.5">
            <TopBarButton
              label="File"
              dropdownItems={["New Project", "Download", "Compile"]}
            />
            <TopBarButton label="Edit" />
            <TopBarButton label="View" />
            <TopBarButton label="Selection" />
            <TopBarButton label="Help" />
            <TopBarButton label="Build" onClick={onClickBuild} />
          </div>
        </TopBar>

        {/* Main Content */}
        <Resizable className="flex flex-1 overflow-hidden">
          {/* Left Explorer (SideBar) */}
          <Resizable>
            <SideBar
              onSelectItem={handleSelectedEntity}
              selectedItem={selectedEntity}
              className="h-full overflow-y-scroll"
            />
          </Resizable>

          <div className="flex w-full flex-col gap-2.5">
            {/* Layer Tab Bar */}
            <div className="flex w-full justify-center">
              <div className="flex w-[588px] items-center gap-2.5 rounded-[10px] bg-fills-primary px-2.5 py-1 text-lg font-medium">
                <PanelLeft />
                <LayerBar>
                  <LayerBarButton label="Terrain" />
                  <LayerBarButton label="Unit" />
                  <LayerBarButton label="Location" />
                  <LayerBarButton label="Sprite" />
                  <LayerBarButton label="Doodads" />
                </LayerBar>
              </div>
            </div>

            {/* Center Map Viewer */}
            <div className="flex h-full">
              <MapImage />
              <Inspector item={selectedEntity?.data} />
            </div>
          </div>
        </Resizable>

        {/* Bottom Project/Asset Container */}
        <div className="flex h-full flex-1 overflow-hidden border-t-2 border-t-fills-primary">
          <Project className="overflow-auto" />
          <AssetContainer />
        </div>
      </DndContext>
      <ModalContainer />
    </div>
  );
}
