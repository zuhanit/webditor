"use client";

import { useEffect, useRef } from "react";
import { useRawMapStore } from "@/store/mapStore";
import { useViewportImage } from "@/hooks/useImage";
import { TILE_SIZE } from "@/lib/scterrain";

export const MapImage = () => {
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const entireMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawmap = useRawMapStore((state) => state.rawMap);
  const viewportImage = useViewportImage();

  const viewportRef = useRef({
    startX: 0,
    startY: 0,
    tileWidth: 40,
    tileHeight: 75,
  });

  useEffect(() => {
    if (!rawmap) return;

    const mapCanvas = document.createElement("canvas");
    mapCanvas.width = rawmap.terrain.size.width * 32;
    mapCanvas.height = rawmap.terrain.size.height * 32;

    const mapCtx = mapCanvas.getContext("2d")!;
    if (viewportImage.terrain) mapCtx.drawImage(viewportImage.terrain, 0, 0);
    if (viewportImage.unit) mapCtx.drawImage(viewportImage.unit, 0, 0);
    if (viewportImage.sprite) mapCtx.drawImage(viewportImage.sprite, 0, 0);
    if (viewportImage.location) mapCtx.drawImage(viewportImage.location, 0, 0);
    entireMapCanvasRef.current = mapCanvas;
  }, [rawmap, viewportImage]);

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
