import { useAssetStore } from "@/store/assetStore";
import { useDraggable } from "@dnd-kit/core";
import { Item } from "@/types/item";
import { Card, CardHeader } from "../ui/card";
import {
  Sidebar,
  SidebarContent,
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

interface AssetCardProps {
  item: Item;
}

export function AssetCard({ item }: AssetCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.label,
    data: item.properties,
  });
  const { assets, setAssets, isEditorOpen, openEditor } = useAssetStore(
    (state) => state
  );
  const handleDoubleClick = () => {
    if (!isEditorOpen) openEditor();
    if (assets.find((asset) => asset.label === item.label)) return;
    setAssets([...assets, item]);
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
    console.log("gogi", unitResult, usemap, asset);
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
    <div className="flex h-full w-full items-center justify-center">
      {image}
    </div>
  );
}

export function AssetEditor() {
  const { assets, setAssets, isEditorOpen, closeEditor } = useAssetStore();
  const { updateUsemap } = useUsemapStore((state) => state);

  if (!assets.length || !isEditorOpen) return null;

  // FIXME: Using ID, or something else to identify asset
  const onClickClose = (label: string) => {
    const f = assets.filter((asset) => asset.label !== label);
    setAssets(f);
  };
  const onClickSave = (asset: Item) => {
    console.log(asset);
    updateUsemap((draft: any) => {
      let target = draft;
      for (let i = 0; i < asset.path.length - 1; i++) {
        target = target[asset.path[i]];
      }
      target[asset.path[asset.path.length - 1]] = asset.properties;
    });
  };
  const defaultValue = assets[0].label;

  return (
    <div className="absolute flex bg-background-primary shadow-md">
      <Sidebar>
        <Tabs defaultValue={defaultValue}>
          <SidebarHeader>
            <TabsList>
              {assets.map((asset) => (
                <div key={asset.label} className="flex items-center gap-2">
                  <TabsTrigger value={asset.label}>{asset.label}</TabsTrigger>
                  <button onClick={() => onClickClose(asset.label)}>X</button>
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
                  <Button onClick={() => onClickSave(asset)}>Save</Button>
                  <Button onClick={closeEditor}>Close</Button>
                </TabsContent>
              ))}
            </SidebarGroup>
          </SidebarContent>
        </Tabs>
      </Sidebar>
    </div>
  );
}
