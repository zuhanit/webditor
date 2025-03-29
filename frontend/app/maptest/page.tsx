"use client";

import { useEffect, useRef } from "react";
import useTileGroup from "@/hooks/useTileGroup";
import useTilesetData from "@/hooks/useTilesetData";
import useRawMap from "@/hooks/useRawMap";

function logRgbTable(rgbData: Uint8Array) {
  const rgbTable = [];

  for (let i = 0; i < rgbData.length; i += 3) {
    rgbTable.push({
      index: i / 3,
      R: rgbData[i],
      G: rgbData[i + 1],
      B: rgbData[i + 2],
    });
  }

  console.table(rgbTable);
}

function drawMegatile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rgbData: Uint8Array,
) {
  logRgbTable(rgbData);
  const tileSize = 32;
  const imageData = ctx.createImageData(tileSize, tileSize);

  for (let i = 0; i < tileSize * tileSize; i++) {
    const r = rgbData[i * 3];
    const g = rgbData[i * 3 + 1];
    const b = rgbData[i * 3 + 2];

    imageData.data[i * 4] = r;
    imageData.data[i * 4 + 1] = g;
    imageData.data[i * 4 + 2] = b;
    imageData.data[i * 4 + 3] = 255; // Alpha
  }

  ctx.putImageData(imageData, x * tileSize, y * tileSize);
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tileGroup = useTileGroup();
  const tilesetData = useTilesetData();
  const rawmap = useRawMap();

  useEffect(() => {
    if (!rawmap || !tileGroup || !tilesetData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tileSize = 32;
    const height = rawmap.terrain.size.height;
    const width = rawmap.terrain.size.width;

    canvas.width = width * tileSize;
    canvas.height = height * tileSize;

    console.log(`width: ${width}, height: ${height}`);

    for (let y = 0; y < rawmap.terrain.tile_id.length; y++) {
      for (let x = 0; x < rawmap.terrain.tile_id[y].length; x++) {
        const tile = rawmap.terrain.tile_id[y][x];
        const megatileID = tileGroup[tile.group][tile.id];

        const offset = megatileID * 3072;
        const rgbData = tilesetData.slice(offset, offset + 3072);

        drawMegatile(ctx, x, y, rgbData);
      }
    }
    console.log(tilesetData);
    console.log("Fetch Succesful");
  }, [rawmap, tilesetData, tileGroup]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
    </div>
  );
}
