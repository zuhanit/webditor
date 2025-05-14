"use client";

import { useCallback, useRef } from "react";
import { useEntireCanvas } from "@/hooks/useImage";
import { TILE_SIZE } from "@/lib/scterrain";
import { Viewport } from "@/types/Viewport";
import { useDragViewport } from "@/hooks/useDragViewport";

export const MapImage = () => {
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { image } = useEntireCanvas();

  /** Controller for dragging viewport */
  const viewportRef = useRef<Viewport>({
    startX: 0,
    startY: 0,
    tileWidth: 40,
    tileHeight: 75,
  });

  const paint = useCallback(() => {
    const viewCanvas = viewportCanvasRef.current;
    if (!viewCanvas || !image) return;

    const viewCtx = viewCanvas.getContext("2d")!;
    const v = viewportRef.current;

    viewCanvas.width = v.tileWidth * TILE_SIZE;
    viewCanvas.height = v.tileHeight * TILE_SIZE;

    viewCtx.drawImage(
      image,
      v.startX * TILE_SIZE,
      v.startY * TILE_SIZE,
      v.tileWidth * TILE_SIZE,
      v.tileHeight * TILE_SIZE,
      0,
      0,
      v.tileWidth * TILE_SIZE,
      v.tileHeight * TILE_SIZE,
    );
  }, [image]);

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
