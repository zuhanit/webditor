import { TILE_SIZE } from "@/lib/scterrain";
import { useRef } from "react";
import { Viewport } from "@/types/viewport";

/**
 * Hook for handle dragging viewport.
 * @param vpRef Viewport Ref
 * @param onViewportChange Event handler for viewport changed.
 * @returns
 */
export function useDragViewport(
  vpRef: React.MutableRefObject<Viewport>,
  onViewportChange: () => void,
) {
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>();

  const onMousedown = (e: React.MouseEvent) => {
    isDragging.current = true;
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

  function onMouseUp() {
    isDragging.current = false;
    dragStart.current = null;
  }

  return { onMousedown, onMouseMove, onMouseUp, isDragging };
}
