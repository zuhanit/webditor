"use client";

import { useUsemapStore } from "@/store/mapStore";
import React from "react";
import { useDroppableContext } from "@/hooks/useDraggableAsset";
import { useAssetExplorerStore } from "@/store/assetExplorerStore";
import { AssetType } from "@/types/asset";
import { useDraggable } from "@dnd-kit/core";
import { twMerge } from "tailwind-merge";
import { useAsseEditortStore } from "@/store/assetEditorStore";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { SCImageRenderer } from "../core/renderer";

export function AssetCard({
  asset,
  className,
}: {
  asset: AssetType;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: asset.name,
    data: asset.data,
  });
  const { assets, setAssets, isEditorOpen, openEditor, setActivatedAsset } =
    useAsseEditortStore((state) => state);
  const { setCurrentAsset } = useAssetExplorerStore();

  const handleFileDoubleClick = () => {
    if (!isEditorOpen) openEditor();
    if (assets.find((openedAsset) => openedAsset.name === asset.name)) {
      console.log("ae", asset, assets);
      setActivatedAsset(asset);
    } else {
      setAssets([...assets, asset]);
    }
  };

  const handleFolderDoubleClick = () => {
    console.log(asset);
    setCurrentAsset(asset);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (asset.type === "file") {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        onDoubleClick={handleFileDoubleClick}
        className={twMerge("h-full max-h-36 w-full max-w-sm", className)}
        {...listeners}
        {...attributes}
      >
        <CardContent>
          {asset.preview ? (
            <SCImageRenderer
              frame={0}
              version="sd"
              imageIndex={asset.preview}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-muted-foreground text-sm">
                No preview available
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>{asset.name}</CardFooter>
      </Card>
    );
  } else {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        onDoubleClick={handleFolderDoubleClick}
        className={twMerge("h-36 w-36", className)}
        {...listeners}
        {...attributes}
      >
        <CardHeader>{asset.name}</CardHeader>
      </Card>
    );
  }
}

export function AssetExplorer() {
  const gameMap = useUsemapStore((state) => state.usemap);
  const { currentAsset } = useAssetExplorerStore();

  const { isOver, setNodeRef } = useDroppableContext({
    id: "AssetContainer",
    kind: "asset-container",
  });

  console.log(gameMap?.assets);

  if (gameMap === null) return <div>Loading...</div>;

  return (
    <div
      ref={setNodeRef}
      className={`${
        isOver ? "bg-fills-primary" : "bg-background-primary"
      } grid max-h-full w-full auto-rows-max grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-2 overflow-auto p-2`}
    >
      {currentAsset?.children?.map((child) => {
        return <AssetCard key={child.name + child.id} asset={child} />;
      })}
    </div>
  );
}
