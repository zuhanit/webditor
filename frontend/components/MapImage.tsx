"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRawMapStore } from "@/store/mapStore";
import { useViewportImage } from "@/hooks/useImage";
import { TILE_SIZE } from "@/lib/scterrain";
import { Viewport } from "@/types/Viewport";
import { useDragViewport } from "@/hooks/useDragViewport";

export const MapImage = () => {
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const entireMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawmap = useRawMapStore((state) => state.rawMap);

  /** Draw images on Viewport Canvas */
  const viewportImage = useViewportImage();
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

  /** Controller for dragging viewport */
  const viewportRef = useRef<Viewport>({
    startX: 0,
    startY: 0,
    tileWidth: 40,
    tileHeight: 75,
  });

  const paint = useCallback(() => {
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
  }, []);

  const { onMouseMove, onMouseUp, onMousedown, isDragging } = useDragViewport(
    viewportRef,
    paint,
  );

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
        onMouseDown={onMousedown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
    </div>
  );
};
