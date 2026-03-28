import { Location } from "@/types/schemas/entities/Location";
import { Tile } from "@/types/schemas/entities/Tile";
import { RawTerrain } from "@/types/schemas/terrain/RawTerrain";

export function createLocations(count: number): Location[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Location ${i}`,
    transform: {
      id: i,
      name: `Location ${i}`,
      position: { x: (i % 10) * 320, y: Math.floor(i / 10) * 320 },
      size: { left: 0, top: 0, right: 160, bottom: 160 },
    },
    kind: "Location" as const,
    elevation_flags: 0,
  }));
}

export function createTiles(width: number, height: number): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      tiles.push({
        id: i,
        name: `Tile ${i}`,
        transform: {
          id: i,
          name: `Tile ${i}`,
          position: { x, y },
          size: { left: 16, top: 16, right: 16, bottom: 16 },
        },
        kind: "Tile" as const,
        group: 0,
        tile_id: i % 16,
      });
    }
  }
  return tiles;
}

// Each megatile = 3072 bytes (32*32*3 RGB)
export function createTilesetData(megatileCount: number): Uint8Array {
  const data = new Uint8Array(megatileCount * 3072);
  for (let i = 0; i < data.length; i++) {
    data[i] = (i * 7 + 13) & 0xff;
  }
  return data;
}

export function createTerrain(width: number, height: number): RawTerrain {
  return { size: { width, height }, tileset: "Badlands" };
}
