import { TILE_SIZE } from "@/lib/scterrain";
import { useRef } from "react";
import { Viewport } from "@/types/viewport";

/**
 * Hook for handle dragging viewport.
 * @param vpRef Viewport Ref
 * @param onViewportChange Event handler for viewport changed.
 * @param onCanvasClick Click handler for canvas clicks (when not dragging)
 * @returns
 */
export function useDragViewport(
  vpRef: React.MutableRefObject<Viewport>,
  onViewportChange: () => void,
  onCanvasClick?: (e: React.MouseEvent) => void,
) {
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>();
  const hasDragged = useRef(false);

  const onMousedown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const raf = useRef(0);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !dragStart.current) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const deltaX = Math.round(dx / TILE_SIZE);
    const deltaY = Math.round(dy / TILE_SIZE);
    if (deltaX === 0 && deltaY === 0) return;

    hasDragged.current = true; // 드래그 했음을 기록
    vpRef.current.startX = Math.max(0, vpRef.current.startX - deltaX);
    vpRef.current.startY = Math.max(0, vpRef.current.startY - deltaY);
    dragStart.current = { x: e.clientX, y: e.clientY };

    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        onViewportChange();
        raf.current = 0;
      });
    }
  };

  function onMouseUp(e: React.MouseEvent) {
    const wasDragging = isDragging.current;
    const didDrag = hasDragged.current;
    
    isDragging.current = false;
    dragStart.current = null;
    hasDragged.current = false;

    // 드래그하지 않고 단순 클릭한 경우
    if (wasDragging && !didDrag && onCanvasClick) {
      onCanvasClick(e);
    }
  }

  return { onMousedown, onMouseMove, onMouseUp, isDragging };
}
