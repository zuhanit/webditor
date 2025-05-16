// frontend/hooks/useElementResize.ts
import { useEffect } from "react";

type ResizeHandler = (entry: ResizeObserverEntry) => void;

/**
 * 특정 엘리먼트의 크기를 감시하고 크기가 변할 때마다 handler 를 호출한다.
 *
 * @param ref   크기를 감시할 DOM ref
 * @param onResize  (optional) ResizeObserverEntry 를 인자로 받는 콜백
 */
export function useElementResize(
  ref: React.RefObject<Element>,
  onResize: ResizeHandler,
) {
  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new ResizeObserver((entries) => onResize(entries[0]));
    observer.observe(target);

    return () => observer.disconnect();
  }, [ref, onResize]);
}
