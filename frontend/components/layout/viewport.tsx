"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { Application, useApplication } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";
import { TILE_SIZE } from "@/lib/scterrain";
import { useDroppableContext } from "@/hooks/useDraggableAsset";
import { useEntityStore } from "@/store/entityStore";
import { useUsemapStore } from "../pages/editor-page";
import { useImages } from "@/hooks/useImage";
import useTileGroup from "@/hooks/useTileGroup";
import useTilesetData from "@/hooks/useTilesetData";
import { Unit } from "@/types/schemas/entities/Unit";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { Tile } from "@/types/schemas/entities/Tile";
import { Location } from "@/types/schemas/entities/Location";
import { Asset } from "@/types/asset";
import { Entity } from "@/types/schemas/entities/Entity";

import "@/lib/pixi/setup";
import "@/lib/pixi/types";

function MapContent({
  viewportInstanceRef,
}: {
  viewportInstanceRef: React.MutableRefObject<PixiViewport | null>;
}) {
  const { app } = useApplication();
  const usemap = useUsemapStore((state) => state.usemap);
  const setEntity = useEntityStore((state) => state.setEntity);
  const selectedEntity = useEntityStore((state) => state.entity);

  const tileGroup = useTileGroup();
  const tilesetData = useTilesetData();

  const tiles = useMemo(() => {
    if (!usemap) return [];
    return usemap.entities
      .filter((e) => e.data?.kind === "Tile")
      .map((e) => e.data) as Tile[];
  }, [usemap?.entities]);

  const unitAssets = useMemo(() => {
    if (!usemap) return [];
    return usemap.entities.filter(
      (e) => e.data?.kind === "Unit",
    ) as Asset<Unit>[];
  }, [usemap?.entities]);

  const spriteAssets = useMemo(() => {
    if (!usemap) return [];
    return usemap.entities.filter(
      (e) => e.data?.kind === "Sprite",
    ) as Asset<Sprite>[];
  }, [usemap?.entities]);

  const locationAssets = useMemo(() => {
    if (!usemap) return [];
    return usemap.entities.filter(
      (e) => e.data?.kind === "Location",
    ) as Asset<Location>[];
  }, [usemap?.entities]);

  const requiredImageIDs = useMemo(() => {
    const ids = new Set<number>();
    for (const asset of unitAssets) {
      ids.add(
        asset.data!.unit_definition.specification.graphics.sprite.image.id,
      );
    }
    for (const asset of spriteAssets) {
      ids.add(asset.data!.definition.image.id);
    }
    return ids;
  }, [unitAssets, spriteAssets]);

  const { data: imagesData } = useImages(requiredImageIDs, "sd");

  const handleSelect = useCallback(
    (entity: Asset<Entity>) => {
      setEntity(entity);
    },
    [setEntity],
  );

  const mapWidth = usemap?.terrain.size.width ?? 0;
  const mapHeight = usemap?.terrain.size.height ?? 0;

  if (!usemap || !app) return null;

  return (
    <pixiViewport
      ref={(ref: PixiViewport | null) => {
        viewportInstanceRef.current = ref;
        if (ref && !ref.plugins.get("drag")) {
          ref.drag().pinch().wheel().decelerate();
          ref.clamp({
            left: 0,
            top: 0,
            right: mapWidth * TILE_SIZE,
            bottom: mapHeight * TILE_SIZE,
          });
        }
      }}
      events={app.renderer.events}
      screenWidth={app.renderer.width}
      screenHeight={app.renderer.height}
      worldWidth={mapWidth * TILE_SIZE}
      worldHeight={mapHeight * TILE_SIZE}
    >
      <terrainLayer
        tiles={tiles}
        tileGroup={tileGroup ?? []}
        tilesetData={tilesetData}
      />
      <unitLayer
        units={unitAssets}
        images={imagesData}
        selectedId={selectedEntity?.data?.id ?? null}
        onSelect={handleSelect}
      />
      <spriteLayer
        sprites={spriteAssets}
        images={imagesData}
        selectedId={selectedEntity?.data?.id ?? null}
        onSelect={handleSelect}
      />
      <locationLayer
        locations={locationAssets}
        selectedId={selectedEntity?.data?.id ?? null}
        onSelect={handleSelect}
      />
    </pixiViewport>
  );
}

export const MapImage = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportInstanceRef = useRef<PixiViewport | null>(null);

  const { setNodeRef } = useDroppableContext({
    id: "viewport",
    kind: "viewport",
    data: { viewportInstance: viewportInstanceRef },
  });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  return (
    <div
      className={className}
      ref={combinedRef}
      tabIndex={0}
      style={{ cursor: "grab" }}
    >
      <Application resizeTo={containerRef as React.RefObject<HTMLDivElement>}>
        <MapContent viewportInstanceRef={viewportInstanceRef} />
      </Application>
    </div>
  );
};
