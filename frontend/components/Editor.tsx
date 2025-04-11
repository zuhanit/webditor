"use client";

import { useEffect, useState } from "react";
import { SideBar, SideBarItem } from "./placed_container/SideBar";
import { defaultItems } from "@/fixtures/default_items";
import useFetchRawMap from "@/hooks/useRawMap";
import { Item } from "@/types/InspectorItem";
import { PanelLeft } from "lucide-react";
import { Resizable } from "re-resizable";
import { AssetContainer } from "./asset_viewer/Asset";
import { Inspector } from "./Inspector";
import { LayerBar, LayerBarButton } from "./LayerBar";
import { MapImage } from "./MapImage";
import { Project } from "./Project";
import { TopBar, TopBarButton } from "./topbar/TopBar";
import api from "@/lib/api";

export default function Editor() {
  const [selectedItem, setSelectedItem] = useState<SideBarItem<Item> | null>(
    null,
  );
  const handleSelectItem = (item: SideBarItem<Item>) => {
    setSelectedItem(item);
    console.log(item, "Selected");
  };
  const rawMap = useFetchRawMap("test_map");

  if (!rawMap) return <div>Loading...</div>;

  // FIXME: Compiling test button, please remove this after.
  const onClickBuild = async () => {
    if (!rawMap) return;

    try {
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
    <div className="flex h-screen flex-col">
      <TopBar>
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
      <Resizable className="flex overflow-auto" enable={{ bottom: true }}>
        <Resizable defaultSize={{ width: "25%" }} className="flex-col px-4">
          <SideBar
            items={defaultItems}
            onSelectItem={handleSelectItem}
            selectedItem={selectedItem}
          />
        </Resizable>
        <div className="flex w-full flex-col gap-2.5">
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
          <div className="flex">
            <MapImage />
            <Inspector item={selectedItem?.data} />
          </div>
        </div>
      </Resizable>
      <div className="flex h-full flex-1 overflow-hidden">
        <Project />
        <AssetContainer />
      </div>
    </div>
  );
}
