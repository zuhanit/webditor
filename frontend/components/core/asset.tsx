import { useAssetStore } from "@/store/assetStore";
import { useDraggable } from "@dnd-kit/core";
import { Item } from "@/types/item";
import { Card, CardHeader } from "../ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "../ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ReactNode, useEffect, useState } from "react";
import { SCImageRenderer } from "./renderer";
import { UnitSchema } from "@/types/schemas/Unit";
import { SpriteSchema } from "@/types/schemas/Sprite";
import { ImageSchema } from "@/types/schemas/Image";
import { WeaponDefinitionSchema } from "@/types/schemas/WeaponDefinition";
import { Button } from "../ui/button";
import { Editor } from "./editor";
import { useUsemapStore } from "@/store/mapStore";
import { Toolbar } from "../ui/toolbar";
import { Save, X } from "lucide-react";
import { Resizable } from "re-resizable";
import { useDraggableAsset } from "@/hooks/useDraggableAsset";

interface AssetCardProps {
  item: Item;
}

export function AssetCard({ item }: AssetCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.label,
    data: item.properties,
  });
  const { assets, setAssets, isEditorOpen, openEditor, setActivatedAsset } =
    useAssetStore((state) => state);
  const handleDoubleClick = () => {
    if (!isEditorOpen) openEditor();
    if (assets.find((asset) => asset.label === item.label)) return;
    setAssets([...assets, item]);
    setActivatedAsset(item);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleDoubleClick}
      {...listeners}
      {...attributes}
    >
      <CardHeader>{item.label}</CardHeader>
    </Card>
  );
}

export function AssetEditorImage({ asset }: { asset: Item }) {
  const [image, setImage] = useState<ReactNode | null>(null);
  const usemap = useUsemapStore((state) => state.usemap);

  const unitResult = UnitSchema.safeParse(asset.properties);
  const spriteResult = SpriteSchema.safeParse(asset.properties);
  const imageResult = ImageSchema.safeParse(asset.properties);
  const weaponResult = WeaponDefinitionSchema.safeParse(asset.properties);

  useEffect(() => {
    if (!usemap) return;

    if (unitResult.success) {
      const flingyID = unitResult.data.unit_definition.specification.graphics;
      const spriteID = usemap.flingy[flingyID].sprite;
      const imageID = usemap.sprite[spriteID].image;
      setImage(<SCImageRenderer frame={0} version="sd" imageIndex={imageID} />);
    }

    if (imageResult.success) {
      const i = imageResult.data.graphic;
      setImage(<SCImageRenderer frame={0} version="sd" imageIndex={i} />);
    }

    if (spriteResult.success) {
      const imageID = spriteResult.data.image;
      setImage(<SCImageRenderer frame={0} version="sd" imageIndex={imageID} />);
    }

    if (weaponResult.success) {
      const flingyID = weaponResult.data.graphics;
      const spriteID = usemap.flingy[flingyID].sprite;
      const imageID = usemap.sprite[spriteID].image;
      setImage(<SCImageRenderer frame={0} version="sd" imageIndex={imageID} />);
    }
  }, [unitResult.success, usemap]);

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
  } = useAssetStore();
  const { updateUsemap } = useUsemapStore((state) => state);
  const { attributes, listeners, setNodeRef, transform } = useDraggableAsset({
    id: "main",
    kind: "asset-editor",
  });

  if (!assets.length || !isEditorOpen || !activatedAsset) return null;

  // FIXME: Using ID, or something else to identify asset
  const onClickClose = (asset: Item) => {
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

  const onClickSave = () => {
    if (!activatedAsset) return;

    updateUsemap((draft: any) => {
      let target = draft;
      for (let i = 0; i < activatedAsset.path.length - 1; i++) {
        target = target[activatedAsset.path[i]];
      }
      target[activatedAsset.path[activatedAsset.path.length - 1]] =
        activatedAsset.properties;
    });
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
      >
        <Sidebar>
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
          <Tabs defaultValue={activatedAsset.label}>
            <SidebarHeader>
              <TabsList>
                {assets.map((asset) => (
                  <div key={asset.label} className="flex items-center gap-2">
                    <TabsTrigger
                      value={asset.label}
                      onClick={() => setActivatedAsset(asset)}
                    >
                      {asset.label}
                    </TabsTrigger>
                    <button onClick={() => onClickClose(asset)}>
                      <X />
                    </button>
                  </div>
                ))}
              </TabsList>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                {assets.map((asset) => (
                  <TabsContent
                    className="flex"
                    key={asset.label}
                    value={asset.label}
                  >
                    <Editor item={asset} />
                    <AssetEditorImage asset={asset} />
                  </TabsContent>
                ))}
              </SidebarGroup>
            </SidebarContent>
          </Tabs>
          <SidebarFooter>
            <Button variant="ghost" onClick={onClickSave}>
              <Save />
              Save
            </Button>
          </SidebarFooter>
        </Sidebar>
      </Resizable>
    </div>
  );
}
