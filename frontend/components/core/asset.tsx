import { useAsseEditortStore } from "@/store/assetEditorStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarProvider,
} from "../ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ReactNode, useEffect, useState } from "react";
import { SCImageRenderer } from "./renderer";
import { AssetSchema } from "@/types/schemas/asset/Asset";
import { Button } from "../ui/button";
import { UsemapEditor } from "./usemap-editor";
import { useUsemapStore } from "@/components/pages/editor-page";
import { Toolbar } from "../ui/toolbar";
import { X } from "lucide-react";
import { Resizable } from "re-resizable";
import { useDraggableAsset } from "@/hooks/useDraggableAsset";
import { Asset } from "@/types/asset";

export function AssetEditorImage({ asset }: { asset: Asset }) {
  const [image, setImage] = useState<ReactNode | null>(null);
  const usemap = useUsemapStore((state) => state.usemap);

  const result = AssetSchema.safeParse(asset);
  useEffect(() => {
    if (!usemap) return;

    if (result.data?.type === "file") {
      if (result.data.preview) {
        setImage(
          <SCImageRenderer
            frame={0}
            version="sd"
            imageIndex={result.data.preview}
          />,
        );
      }
    }
  }, [result.success, usemap]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {image}
    </div>
  );
}

export function AssetEditor() {
  const {
    assets,
    setAssets,
    isEditorOpen,
    closeEditor,
    activatedAsset,
    setActivatedAsset,
    editorPosition,
  } = useAsseEditortStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggableAsset({
    id: "main",
    kind: "asset-editor",
  });

  if (!assets.length || !isEditorOpen || !activatedAsset) return null;

  // FIXME: Using ID, or something else to identify asset
  const onClickClose = (asset: Asset) => {
    const currentActivatedAssetIndex = assets.findIndex((a) => a === asset);
    const nextActivatedAssetIndex =
      currentActivatedAssetIndex === assets.length - 1
        ? 0
        : currentActivatedAssetIndex + 1;
    const nextActivatedAsset = assets[nextActivatedAssetIndex];
    const f = assets.filter((a) => a !== asset);
    setAssets(f);
    setActivatedAsset(nextActivatedAsset);
  };

  return (
    <div
      ref={setNodeRef}
      className="absolute flex bg-background-primary shadow-md"
      style={
        {
          transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
          top: `${editorPosition.y}px`,
          left: `${editorPosition.x}px`,
        } as React.CSSProperties
      }
    >
      <Resizable
        defaultSize={{
          width: 800,
          height: 800,
        }}
        minWidth={800}
        minHeight={800}
        className="flex flex-col"
      >
        <Toolbar
          className="border-b border-text-muted"
          {...listeners}
          {...attributes}
        >
          <span className="absolute left-1/2 -translate-x-1/2 text-center text-lg font-medium">
            Asset Editor
          </span>
          <div className="ml-auto flex items-center">
            <Button variant="ghost" onClick={closeEditor}>
              <X />
            </Button>
          </div>
        </Toolbar>
        <Tabs
          defaultValue={activatedAsset.name}
          className="flex flex-1 flex-col"
        >
          <TabsList>
            {assets.map((asset) => (
              <div key={asset.name} className="flex items-center gap-2">
                <TabsTrigger
                  value={asset.name}
                  onClick={() => setActivatedAsset(asset)}
                >
                  {asset.name}
                </TabsTrigger>
                <button onClick={() => onClickClose(asset)}>
                  <X />
                </button>
              </div>
            ))}
          </TabsList>
          <div className="flex h-full">
            <SidebarProvider>
              <Sidebar variant="floating">
                <SidebarContent>
                  <SidebarGroup>
                    {assets.map((asset) => (
                      <TabsContent
                        className="flex h-0 min-h-0"
                        key={asset.name}
                        value={asset.name}
                      >
                        <UsemapEditor kind="assets" asset={asset} />
                      </TabsContent>
                    ))}
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
            </SidebarProvider>
            <div className="flex-1">
              <AssetEditorImage asset={activatedAsset} />
            </div>
          </div>
        </Tabs>
      </Resizable>
    </div>
  );
}
