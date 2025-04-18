"use client";

import { useEffect, useRef, useState } from "react";
import useTileGroup from "@/hooks/useTileGroup";
import useTilesetData from "@/hooks/useTilesetData";
import { useRawMapStore } from "@/store/mapStore";

function drawMegatile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rgbData: Uint8Array,
) {
  const tileSize = 32;
  const imageData = ctx.createImageData(tileSize, tileSize);

  for (let i = 0; i < tileSize * tileSize; i++) {
    const r = rgbData[i * 3];
    const g = rgbData[i * 3 + 1];
    const b = rgbData[i * 3 + 2];

    imageData.data[i * 4] = r;
    imageData.data[i * 4 + 1] = g;
    imageData.data[i * 4 + 2] = b;
    imageData.data[i * 4 + 3] = 255; // Alpha
  }

  ctx.putImageData(imageData, x * tileSize, y * tileSize);
}

export const MapImage = () => {
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const entireMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tileGroup = useTileGroup();
  const tilesetData = useTilesetData();
  const rawmap = useRawMapStore((state) => state.rawMap);

  const [viewport, setViewport] = useState({
    startX: 0,
    startY: 0,
    tileWidth: 40,
    tileHeight: 75,
  });

  useEffect(() => {
    if (!rawmap || !tileGroup || !tilesetData) return;

    const tileSize = 32;
    const width = rawmap.terrain.size.width;
    const height = rawmap.terrain.size.height;

    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = width * tileSize;
    mapCanvas.height = height * tileSize;

    const mapCtx = mapCanvas.getContext("2d");
    if (!mapCtx) return;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = rawmap.terrain.tile_id[y][x];
        const megatileID = tileGroup[tile.group][tile.id];
        const offset = megatileID * 3072;
        const rgbData = tilesetData.slice(offset, offset + 3072);
        drawMegatile(mapCtx, x, y, rgbData);
      }
    }

    entireMapCanvasRef.current = mapCanvas;

    // Initialize viewport
    setViewport((prev) => ({ ...prev }));
  }, [rawmap, tileGroup, tilesetData]);

  useEffect(() => {
    const viewCanvas = viewportCanvasRef.current;
    const mapCanvas = entireMapCanvasRef.current;
    if (!viewCanvas || !mapCanvas) return;

    const tileSize = 32;
    const viewCtx = viewCanvas.getContext("2d");
    if (!viewCtx) return;

    viewCanvas.width = viewport.tileWidth * tileSize;
    viewCanvas.height = viewport.tileHeight * tileSize;

    viewCtx.drawImage(
      mapCanvas,
      viewport.startX * tileSize,
      viewport.startY * tileSize,
      viewport.tileWidth * tileSize,
      viewport.tileHeight * tileSize,
      0,
      0,
      viewport.tileWidth * tileSize,
      viewport.tileHeight * tileSize,
    );
  }, [viewport]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStart.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const tileSize = 32;

    const deltaX = Math.round(dx / tileSize);
    const deltaY = Math.round(dy / tileSize);

    if (deltaX !== 0 || deltaY !== 0) {
      setViewport((prev) => ({
        ...prev,
        startX: Math.max(0, prev.startX - deltaX),
        startY: Math.max(0, prev.startY - deltaY),
      }));

      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  }

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const canvas = entries[0].target as HTMLCanvasElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const tileSize = 32;

      setViewport((prev) => ({
        ...prev,
        tileWidth: Math.floor(width / tileSize),
        tileHeight: Math.floor(height / tileSize),
      }));
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

  function handleMouseUp() {
    setIsDragging(false);
    dragStart.current = null;
  }

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
