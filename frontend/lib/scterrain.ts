import { Terrain } from "@/types/schemas/Terrain";

export const TILE_SIZE = 32;

export function drawMegatile(
  ctx: OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  rgbData: Uint8Array,
) {
  const imageData = ctx.createImageData(TILE_SIZE, TILE_SIZE);

  for (let i = 0; i < TILE_SIZE * TILE_SIZE; i++) {
    const r = rgbData[i * 3];
    const g = rgbData[i * 3 + 1];
    const b = rgbData[i * 3 + 2];

    imageData.data[i * 4] = r;
    imageData.data[i * 4 + 1] = g;
    imageData.data[i * 4 + 2] = b;
    imageData.data[i * 4 + 3] = 255; // Alpha
  }

  ctx.putImageData(imageData, x * TILE_SIZE, y * TILE_SIZE);
}

export function getTerrainImage(
  terrain: Terrain,
  tileGroup: number[][],
  tilesetData: Uint8Array,
) {
  const terrainCanvas = new OffscreenCanvas(
    terrain.size.width * TILE_SIZE,
    terrain.size.height * TILE_SIZE,
  );
  const terrainCtx = terrainCanvas.getContext("2d")!;

  for (let y = 0; y < terrain.size.height; y++) {
    for (let x = 0; x < terrain.size.width; x++) {
      const tile = terrain.tile_id[y][x];
      const megatileID = tileGroup[tile.group][tile.id];
      const offset = megatileID * 3072;
      const rgbData = tilesetData.slice(offset, offset + 3072);
      drawMegatile(terrainCtx, x, y, rgbData);
    }
  }

  return terrainCanvas.transferToImageBitmap();
}
