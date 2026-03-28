import { createTerrain, createTiles, createTilesetData } from "./util";

export const terrain = {
  verySmall: createTerrain(64, 64),
  small: createTerrain(128, 128),
  medium: createTerrain(192, 192),
  large: createTerrain(256, 256),
};

export const tiles = {
  verySmall: createTiles(64, 64),
  small: createTiles(128, 128),
  medium: createTiles(192, 192),
  large: createTiles(256, 256),
};

export const tilesetData = createTilesetData(16);

export const tileGroup = [Array.from({ length: 16 }, (_, i) => i)];
