import { useImage } from "@/hooks/useImage";
import { useEffect, useRef } from "react";
import { SCImageType } from "@/types/SCImage";

interface RendererProps extends SCImageType {
  frame: number;
}

export function SCImageRenderer({ version, imageIndex, frame }: RendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data, isLoading } = useImage({ version, imageIndex });

  useEffect(() => {
    if (!data?.diffuse) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const url = URL.createObjectURL(data.diffuse);
    const img = new Image();

    img.onload = () => {
      // If meta + frame rect exists, draw only that region
      const rect = data.meta?.[frame];
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          0,
          0,
          rect.width,
          rect.height,
        );
      } else {
        // Fallback: draw full image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [data?.diffuse, data?.meta, frame]);

  if (!data || !data.diffuse || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
