"use client";

import { SideBar, SideBarItem } from "@/components/SideBar";
import { TopBar, TopBarButton } from "@/components/topbar/TopBar";
import { PanelLeft } from "lucide-react";
import { LayerBar, LayerBarButton } from "@/components/LayerBar";
import { MapImage } from "@/components/MapImage";
import { Inspector } from "@/components/Inspector";
import { defaultItems } from "@/fixtures/default_items";
import { Project } from "@/components/Project";
import { Asset } from "@/components/Asset";
import { useState } from "react";
import { Resizable } from "re-resizable";
import { Item } from "@/types/InspectorItem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<SideBarItem<Item> | null>(
    null,
  );
  const handleSelectItem = (item: SideBarItem<Item>) => {
    setSelectedItem(item);
    console.log(item, "Selected");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen flex-col">
        <TopBar>
          <div className="flex items-center gap-2.5">
            <TopBarButton label="File" />
            <TopBarButton label="Edit" />
            <TopBarButton label="View" />
            <TopBarButton label="Selection" />
            <TopBarButton label="Help" />
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
        <div className="flex flex-1">
          <Project />
          <Asset />
        </div>
      </div>
    </QueryClientProvider>
  );
}
