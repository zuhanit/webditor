"use client";

import { useCallback, useRef } from "react";
import { useEntireCanvas } from "@/hooks/useImage";
import { TILE_SIZE } from "@/lib/scterrain";
import { Viewport } from "@/types/viewport";
import { useDragViewport } from "@/hooks/useDragViewport";
import { useElementResize } from "@/hooks/useElementResize";
import { useDroppableContext } from "@/hooks/useDraggableAsset";

export const MapImage = ({ className }: { className?: string }) => {
  const viewportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { image } = useEntireCanvas();

  /** Controller for dragging viewport */
  const viewportRef = useRef<Viewport>({
    startX: 0,
    startY: 0,
    tileWidth: 40,
    tileHeight: 75,
  });

  /**
   * Viewport painting callback.
   * when user dragging, or touch-moved viewport, viewport will be changed and
   * entire viewport image need to repainted.
   *  */
  const paint = useCallback(() => {
    const viewCanvas = viewportCanvasRef.current;
    if (!viewCanvas || !image) return;

    const viewCtx = viewCanvas.getContext("2d")!;
    const v = viewportRef.current;

    // 캔버스 크기 제한 (브라우저 한계: 보통 32767px)
    const maxCanvasSize = 16000;
    const canvasWidth = Math.min(v.tileWidth * TILE_SIZE, maxCanvasSize);
    const canvasHeight = Math.min(v.tileHeight * TILE_SIZE, maxCanvasSize);

    viewCanvas.width = canvasWidth;
    viewCanvas.height = canvasHeight;

    viewCtx.drawImage(
      image,
      v.startX * TILE_SIZE,
      v.startY * TILE_SIZE,
      canvasWidth,
      canvasHeight,
      0,
      0,
      canvasWidth,
      canvasHeight,
    );
  }, [image]);

  /**
   * Viewport dragging handling hook.
   */
  const { onMouseMove, onMouseUp, onMousedown, isDragging } = useDragViewport(
    viewportRef,
    paint,
  );

  const { setNodeRef } = useDroppableContext({
    id: "viewport",
    kind: "viewport",
    data: viewportRef.current,
  });

  useElementResize(viewportCanvasRef, (entry) => {
    const { width, height } = entry.contentRect;
    viewportRef.current.tileWidth = Math.floor(width / TILE_SIZE);
    viewportRef.current.tileHeight = Math.floor(height / TILE_SIZE);
    paint();
  });

  return (
    <div className={className} ref={setNodeRef}>
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
