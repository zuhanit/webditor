import { Container, Texture } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { Tile } from "@/types/schemas/entities/Tile";

const TILE_SIZE = 32;
const MEGATILE_BYTES = 3072; // 32 * 32 * 3 (RGB)

export class TerrainLayer extends Container {
  private tilemap = new CompositeTilemap();
  private _tiles: Tile[] = [];
  private _tileGroup: number[][] = [];
  private _tilesetData: Uint8Array | null = null;
  private textureCache = new Map<number, Texture>();

  constructor() {
    super();
    this.addChild(this.tilemap);
  }

  set tiles(value: Tile[]) {
    this._tiles = value;
    if (this.tilemap) this.rebuild();
  }

  set tileGroup(value: number[][]) {
    this._tileGroup = value;
    if (this.tilemap) this.rebuild();
  }

  set tilesetData(value: Uint8Array | null) {
    this._tilesetData = value;
    this.textureCache?.clear();
    if (this.tilemap) this.rebuild();
  }

  private getMegatileTexture(megatileID: number): Texture | null {
    if (!this._tilesetData) return null;

    const cached = this.textureCache.get(megatileID);
    if (cached) return cached;

    const offset = megatileID * MEGATILE_BYTES;
    const rgbData = this._tilesetData.slice(offset, offset + MEGATILE_BYTES);

    // Convert RGB to RGBA
    const rgba = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
    for (let i = 0; i < TILE_SIZE * TILE_SIZE; i++) {
      rgba[i * 4] = rgbData[i * 3];
      rgba[i * 4 + 1] = rgbData[i * 3 + 1];
      rgba[i * 4 + 2] = rgbData[i * 3 + 2];
      rgba[i * 4 + 3] = 255;
    }

    const texture = Texture.from({
      resource: rgba,
      width: TILE_SIZE,
      height: TILE_SIZE,
    });

    this.textureCache.set(megatileID, texture);
    return texture;
  }

  private rebuild() {
    if (!this._tiles.length || !this._tileGroup.length || !this._tilesetData) {
      return;
    }

    this.tilemap.clear();

    for (const tile of this._tiles) {
      const group = this._tileGroup[tile.group];
      if (!group) continue;

      const megatileID = group[tile.tile_id];
      if (megatileID === undefined) continue;

      const texture = this.getMegatileTexture(megatileID);
      if (!texture) continue;

      this.tilemap.tile(
        texture,
        tile.transform.position.x * TILE_SIZE,
        tile.transform.position.y * TILE_SIZE,
      );
    }
  }

  changeTile(x: number, y: number, tile: Tile) {
    const idx = this._tiles.findIndex(
      (t) =>
        t.transform.position.x === x && t.transform.position.y === y,
    );
    if (idx !== -1) {
      this._tiles[idx] = tile;
    }
    this.rebuild();
  }

  destroy() {
    this.textureCache.forEach((tex) => tex.destroy(true));
    this.textureCache.clear();
    super.destroy({ children: true });
  }
}
