"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useTileGroup from "@/hooks/useTileGroup";
import useTilesetData from "@/hooks/useTilesetData";
import { useRawMapStore } from "@/store/mapStore";
import { useImages } from "@/hooks/useImage";
import { Terrain } from "@/types/schemas/Terrain";
import { Unit } from "@/types/schemas/Unit";
import { Flingy } from "@/types/schemas/Flingy";
import { Sprite } from "@/types/schemas/Sprite";
import { SCImageBundle } from "@/types/SCImage";
import { createTeamColorUnitImage, fetchFrameImage } from "@/lib/scimage";
import { Location } from "@/types/schemas/Location";

const TILE_SIZE = 32;

function drawMegatile(
  ctx: OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  rgbData: Uint8Array,
) {
  const imageData = ctx.createImageData(TILE_SIZE, TILE_SIZE);

  for (let i = 0; i < TILE_SIZE * TILE_SIZE; i++) {
    const r = rgbData[i * 3];
    const g = rgbData[i * 3 + 1];
    const b = rgbData[i * 3 + 2];

    imageData.data[i * 4] = r;
    imageData.data[i * 4 + 1] = g;
    imageData.data[i * 4 + 2] = b;
    imageData.data[i * 4 + 3] = 255; // Alpha
  }

  ctx.putImageData(imageData, x * TILE_SIZE, y * TILE_SIZE);
}

function getTerrainImage(
  terrain: Terrain,
  tileGroup: number[][],
  tilesetData: Uint8Array,
) {
  const terrainCanvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const terrainCtx = terrainCanvas.getContext("2d")!;

  for (let y = 0; y < terrain.size.height; y++) {
    for (let x = 0; x < terrain.size.width; x++) {
      const tile = terrain.tile_id[y][x];
      const megatileID = tileGroup[tile.group][tile.id];
      const offset = megatileID * 3072;
      const rgbData = tilesetData.slice(offset, offset + 3072);
      drawMegatile(terrainCtx, x, y, rgbData);
    }
  }

  return terrainCanvas.transferToImageBitmap();
}

async function getPlacedUnitImage(
  terrain: Terrain,
  placedUnit: Unit[],
  flingy: Flingy[],
  sprite: Sprite[],
  SCImages: Map<number, SCImageBundle>,
): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  const tasks = placedUnit.map(async (unit) => {
    const flingyID = unit.unit_definition.specification.graphics;
    const spriteID = flingy[flingyID].sprite;
    const imageID = sprite[spriteID].image;
    const image = SCImages.get(imageID);

    if (!image || !image.diffuse) return;

    if (image.teamColor) {
      const playerColor = unit.owner ? unit.owner.rgb_color : [255, 255, 0];
      const diffuse = await fetchFrameImage({
        image: image.diffuse,
        frame: 0,
        meta: image.meta,
      });
      const teamColor = await fetchFrameImage({
        image: image.teamColor,
        frame: 0,
        meta: image.meta,
      });
      const colored = createTeamColorUnitImage(
        diffuse,
        teamColor,
        playerColor as [number, number, number],
      );

      ctx.drawImage(
        colored,
        unit.transform!.position.x,
        unit.transform!.position.y,
      );
    } else {
      ctx.drawImage(
        await fetchFrameImage({
          image: image.diffuse,
          frame: 0,
          meta: image.meta,
        }),
        unit.transform!.position.x,
        unit.transform!.position.y,
      );
    }
  });

  await Promise.all(tasks);

  return canvas.transferToImageBitmap();
}

async function getPlacedSpriteImages(
  terrain: Terrain,
  placedSprite: Sprite[],
  SCImages: Map<number, SCImageBundle>,
) {
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;

  const tasks = placedSprite.map(async (sprite) => {
    const imageID = sprite.image;
    const image = SCImages.get(imageID);

    if (!image) return;
    ctx.drawImage(
      await fetchFrameImage({
        image: image.diffuse,
        frame: 0,
        meta: image.meta,
      }),
      sprite.transform!.position.x,
      sprite.transform!.position.y,
    );
  });

  await Promise.all(tasks);

  return canvas.transferToImageBitmap();
}

function getLocationImage(terrain: Terrain, locations: Location[]) {
  const thickness = 3;
  const canvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const ctx = canvas.getContext("2d")!;
  console.log(locations);

  locations.forEach((location) => {
    if (location.id != 63) {
      const width = location.position.right - location.position.left;
      const height = location.position.bottom - location.position.top;
      ctx.fillStyle = "rgba(0, 0, 255, 0.15)";
      ctx.fillRect(
        location.position.left,
        location.position.top,
        width,
        height,
      );
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.strokeRect(
        location.position.left,
        location.position.top,
        width + thickness,
        height + thickness,
      );
      ctx.font = "40px serif";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillText(
        location.name,
        location.position.left,
        location.position.top,
      );
    }
  });

  return canvas.transferToImageBitmap();
}

export const MapImage = () => {
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const entireMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tileGroup = useTileGroup();
  const tilesetData = useTilesetData();
  const rawmap = useRawMapStore((state) => state.rawMap);
  const requiredImageIDs = useMemo(() => {
    const result = new Set<number>();
    if (rawmap) {
      rawmap.placed_unit.forEach((unit) => {
        const flingyID = unit.unit_definition.specification.graphics;
        const spriteID = rawmap.flingy[flingyID].sprite;
        const imageID = rawmap.sprite[spriteID].image;

        result.add(imageID);
      });

      rawmap.placed_sprite.forEach((sprite) => result.add(sprite.image));
    }
    return result;
  }, [rawmap?.placed_unit]);
  const { data: imagesData, loading: imagesLoading } = useImages(
    requiredImageIDs,
    "sd",
  );

  const viewportRef = useRef({
    startX: 0,
    startY: 0,
    tileWidth: 40,
    tileHeight: 75,
  });

  const terrainImage = useMemo<ImageBitmap | undefined>(() => {
    if (!rawmap || !tileGroup || !tilesetData) return undefined;
    return getTerrainImage(rawmap.terrain, tileGroup, tilesetData);
  }, [rawmap?.terrain, tileGroup, tilesetData]);

  const [placedUnitImage, setPlacedUnitImage] = useState<
    ImageBitmap | undefined
  >(undefined);

  const [placedSpriteImage, setPlacedSpriteImage] = useState<
    ImageBitmap | undefined
  >(undefined);

  const locationImage = useMemo<ImageBitmap | undefined>(() => {
    if (!rawmap) return;
    console.log(rawmap?.string);
    return getLocationImage(rawmap.terrain, rawmap.location);
  }, [rawmap?.terrain]);

  useEffect(() => {
    async function createImage() {
      if (!rawmap || imagesLoading) return undefined;
      const unitImage = await getPlacedUnitImage(
        rawmap.terrain,
        rawmap.placed_unit,
        rawmap.flingy,
        rawmap.sprite,
        imagesData,
      );
      const spriteImage = await getPlacedSpriteImages(
        rawmap.terrain,
        rawmap.placed_sprite,
        imagesData,
      );

      setPlacedUnitImage(unitImage);
      setPlacedSpriteImage(spriteImage);
    }
    createImage();
  }, [rawmap?.terrain, imagesLoading]);

  useEffect(() => {
    if (!rawmap) return;

    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = rawmap.terrain.size.width * 32;
    mapCanvas.height = rawmap.terrain.size.height * 32;

    const mapCtx = mapCanvas.getContext("2d")!;
    if (terrainImage) mapCtx.drawImage(terrainImage, 0, 0);
    if (placedUnitImage) mapCtx.drawImage(placedUnitImage, 0, 0);
    if (placedSpriteImage) mapCtx.drawImage(placedSpriteImage, 0, 0);
    if (locationImage) mapCtx.drawImage(locationImage, 0, 0);
    entireMapCanvasRef.current = mapCanvas;
  }, [rawmap, placedUnitImage, terrainImage, placedSpriteImage]);

  function paint() {
    const viewCanvas = viewportCanvasRef.current;
    const mapCanvas = entireMapCanvasRef.current;
    if (!viewCanvas || !mapCanvas) return;

    const viewCtx = viewCanvas.getContext("2d")!;
    const v = viewportRef.current;

    viewCanvas.width = v.tileWidth * TILE_SIZE;
    viewCanvas.height = v.tileHeight * TILE_SIZE;

    viewCtx.drawImage(
      mapCanvas,
      v.startX * TILE_SIZE,
      v.startY * TILE_SIZE,
      v.tileWidth * TILE_SIZE,
      v.tileHeight * TILE_SIZE,
      0,
      0,
      v.tileWidth * TILE_SIZE,
      v.tileHeight * TILE_SIZE,
    );
  }
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  const raf = useRef(0);
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !dragStart.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const deltaX = Math.round(dx / TILE_SIZE);
    const deltaY = Math.round(dy / TILE_SIZE);
    if (deltaX === 0 && deltaY === 0) return;

    viewportRef.current.startX = Math.max(
      0,
      viewportRef.current.startX - deltaX,
    );
    viewportRef.current.startY = Math.max(
      0,
      viewportRef.current.startY - deltaY,
    );
    dragStart.current = { x: e.clientX, y: e.clientY };

    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        paint();
        raf.current = 0;
      });
    }
  }

  function handleMouseUp() {
    isDragging.current = false;
    dragStart.current = null;
  }

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const canvas = entries[0].target as HTMLCanvasElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      viewportRef.current.tileWidth = Math.floor(width / TILE_SIZE);
      viewportRef.current.tileHeight = Math.floor(height / TILE_SIZE);
      paint();
    });

    if (viewportCanvasRef.current) {
      observer.observe(viewportCanvasRef.current);
    }

    return () => {
      if (viewportCanvasRef.current) {
        observer.unobserve(viewportCanvasRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <canvas
        ref={viewportCanvasRef}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};
