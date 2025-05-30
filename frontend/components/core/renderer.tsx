import { useImage } from "@/hooks/useImage";
import { useEffect, useRef, useState } from "react";
import { SCImage } from "@/types/SCImage";
import { fetchFrameImage } from "@/lib/scimage";

interface RendererProps extends SCImage {
  frame: number;
}

export function SCImageRenderer({ version, imageIndex, frame }: RendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data, isLoading } = useImage({ version, imageIndex });
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!data?.diffuse || !data?.meta) return;

    fetchFrameImage({ image: data.diffuse, frame: frame, meta: data.meta })
      .then((bmp) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = bmp.width;
        canvas.height = bmp.height;
        ctx.drawImage(bmp, 0, 0);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [version, imageIndex, frame, isLoading]);

  return <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />;
}
