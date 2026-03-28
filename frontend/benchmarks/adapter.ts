import { RawTerrain } from "@/types/schemas/terrain/RawTerrain";
import { Tile } from "@/types/schemas/entities/Tile";
import { Unit } from "@/types/schemas/entities/Unit";
import { Sprite } from "@/types/schemas/entities/Sprite";
import { Location } from "@/types/schemas/entities/Location";
import { SCImageBundle } from "@/types/SCImage";
import { Viewport } from "@/types/viewport";

export interface RendererBenchmark {
  /** Prepare terrain layer from tile data */
  updateTerrain(
    terrain: RawTerrain,
    tiles: Tile[],
    tileGroup: number[][],
    tilesetData: Uint8Array,
  ): void;

  /** Prepare unit layer */
  updateUnits(
    terrain: RawTerrain,
    units: Unit[],
    images: Map<number, SCImageBundle>,
  ): Promise<void>;

  /** Prepare sprite layer */
  updateSprites(
    terrain: RawTerrain,
    sprites: Sprite[],
    images: Map<number, SCImageBundle>,
  ): Promise<void>;

  /** Prepare location overlay layer */
  updateLocations(terrain: RawTerrain, locations: Location[]): void;

  /** Compose all layers into a single image */
  compose(terrain: RawTerrain): void;

  /** Paint the viewport region to screen */
  paint(viewport: Viewport): void;

  /** Dispose resources */
  dispose(): void;
}

// -- Canvas2D implementation --------------------------------------------------

import { getTerrainImage } from "@/lib/scterrain";
import { TILE_SIZE } from "@/lib/scterrain";
import {
  getPlacedUnitImage,
  getPlacedSpriteImages,
  getLocationImage,
} from "@/lib/scimage";

export class Canvas2DBenchmark implements RendererBenchmark {
  private terrainBitmap?: ImageBitmap;
  private unitBitmap?: ImageBitmap;
  private spriteBitmap?: ImageBitmap;
  private locationBitmap?: ImageBitmap;
  private composedBitmap?: ImageBitmap;

  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;

  constructor(width = 4096, height = 4096) {
    this.canvas = new OffscreenCanvas(width, height);
    this.ctx = this.canvas.getContext("2d")!;
  }

  updateTerrain(
    terrain: RawTerrain,
    tiles: Tile[],
    tileGroup: number[][],
    tilesetData: Uint8Array,
  ): void {
    this.terrainBitmap = getTerrainImage(
      terrain,
      tiles,
      tileGroup,
      tilesetData,
    );
  }

  async updateUnits(
    terrain: RawTerrain,
    units: Unit[],
    images: Map<number, SCImageBundle>,
  ): Promise<void> {
    this.unitBitmap = await getPlacedUnitImage(terrain, units, images);
  }

  async updateSprites(
    terrain: RawTerrain,
    sprites: Sprite[],
    images: Map<number, SCImageBundle>,
  ): Promise<void> {
    this.spriteBitmap = await getPlacedSpriteImages(terrain, sprites, images);
  }

  updateLocations(terrain: RawTerrain, locations: Location[]): void {
    this.locationBitmap = getLocationImage(terrain, locations);
  }

  compose(terrain: RawTerrain): void {
    const w = terrain.size.width * TILE_SIZE;
    const h = terrain.size.height * TILE_SIZE;

    this.canvas = new OffscreenCanvas(w, h);
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.clearRect(0, 0, w, h);

    if (this.terrainBitmap) this.ctx.drawImage(this.terrainBitmap, 0, 0);
    if (this.unitBitmap) this.ctx.drawImage(this.unitBitmap, 0, 0);
    if (this.spriteBitmap) this.ctx.drawImage(this.spriteBitmap, 0, 0);
    if (this.locationBitmap) this.ctx.drawImage(this.locationBitmap, 0, 0);

    this.composedBitmap = this.canvas.transferToImageBitmap();
  }

  paint(viewport: Viewport): void {
    if (!this.composedBitmap) return;

    const w = viewport.tileWidth * TILE_SIZE;
    const h = viewport.tileHeight * TILE_SIZE;
    const sx = viewport.startX * TILE_SIZE;
    const sy = viewport.startY * TILE_SIZE;

    const viewCanvas = new OffscreenCanvas(w, h);
    const viewCtx = viewCanvas.getContext("2d")!;
    viewCtx.clearRect(0, 0, w, h);
    viewCtx.drawImage(this.composedBitmap, sx, sy, w, h, 0, 0, w, h);
  }

  dispose(): void {
    this.terrainBitmap?.close();
    this.unitBitmap?.close();
    this.spriteBitmap?.close();
    this.locationBitmap?.close();
    this.composedBitmap?.close();
  }
}
