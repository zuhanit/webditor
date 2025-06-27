"use client";

import React, { useCallback, useRef } from "react";
import { useEntireCanvas } from "@/hooks/useImage";
import { TILE_SIZE } from "@/lib/scterrain";
import { Viewport } from "@/types/viewport";
import { useDragViewport } from "@/hooks/useDragViewport";
import { useElementResize } from "@/hooks/useElementResize";
import { useDroppableContext } from "@/hooks/useDraggableAsset";
import { findEntityAtPosition } from "@/lib/entityUtils";
import { useEntityStore } from "@/store/entityStore";
import { useUsemapStore } from "../pages/editor-page";

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

    // 캔버스 완전히 지우기
    viewCtx.clearRect(0, 0, canvasWidth, canvasHeight);

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

  const usemap = useUsemapStore((state) => state.usemap);
  const setEntity = useEntityStore((state) => state.setEntity);
  const selectedEntity = useEntityStore((state) => state.entity);
  const deleteEntity = useUsemapStore((state) => state.deleteEntity);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (!usemap) return;

      // Canvas 요소의 bounding rect 가져오기
      const canvasRect = viewportCanvasRef.current!.getBoundingClientRect();

      // Canvas 내에서의 상대 좌표
      const relativeX = event.clientX - canvasRect.left;
      const relativeY = event.clientY - canvasRect.top;

      // Canvas 스케일 팩터 계산 (실제 크기 vs CSS 크기)
      const scaleX =
        viewportCanvasRef.current!.width /
        viewportCanvasRef.current!.clientWidth;
      const scaleY =
        viewportCanvasRef.current!.height /
        viewportCanvasRef.current!.clientHeight;

      // 스케일 팩터를 고려한 실제 캔버스 좌표
      const scaledX = relativeX * scaleX;
      const scaledY = relativeY * scaleY;

      // Viewport offset을 고려한 실제 맵 좌표
      const mapX = scaledX + viewportRef.current.startX * TILE_SIZE;
      const mapY = scaledY + viewportRef.current.startY * TILE_SIZE;

      const units = usemap.entities.filter((e) => e.data?.kind === "Unit");

      const clickedEntity = findEntityAtPosition(mapX, mapY, units);

      if (clickedEntity) {
        setEntity(clickedEntity);
      }
    },
    [usemap],
  );

  const handleDelete = () => {
    console.log("yay");
    if (selectedEntity) {
      deleteEntity(selectedEntity);
    }
  };
  const handleKeydown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Delete": {
        console.log("ya");
        handleDelete();
      }
    }
  };

  /**
   * Viewport dragging handling hook.
   */
  const { onMouseMove, onMouseUp, onMousedown, isDragging } = useDragViewport(
    viewportRef,
    paint,
    handleCanvasClick, // 클릭 핸들러 전달
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
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        className="h-full w-full"
        onMouseDown={onMousedown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onKeyDown={handleKeydown}
        tabIndex={0}
      />
    </div>
  );
};
