import { bench, describe } from "vitest";
import { Canvas2DBenchmark } from "./adapter";
import { terrain, tileGroup, tilesetData, tiles } from "./fixtures/terrain";
import type { Viewport } from "@/types/viewport";
import { location } from "./fixtures/location";

// -- Test fixtures ------------------------------------------------------------

// -- Benchmarks ---------------------------------------------------------------

const viewport: Viewport = {
  startX: 0,
  startY: 0,
  tileWidth: 40,
  tileHeight: 30,
};

describe("Canvas2D Renderer", () => {
  const renderer = new Canvas2DBenchmark();

  bench("updateTerrain 64x64", () => {
    renderer.updateTerrain(terrain.small, tiles.small, tileGroup, tilesetData);
  });

  bench("updateLocations 50", () => {
    renderer.updateLocations(terrain.small, location);
  });

  bench("compose 64x64", () => {
    renderer.updateTerrain(terrain.verySmall, tiles.verySmall, tileGroup, tilesetData);
    renderer.updateLocations(terrain.verySmall, location);
    renderer.compose(terrain.verySmall);
  });

  bench("compose 256x256", () => {
    renderer.updateTerrain(terrain.large, tiles.large, tileGroup, tilesetData);
    renderer.compose(terrain.large);
  });

  bench("paint viewport 40x30", () => {
    renderer.updateTerrain(terrain.small, tiles.small, tileGroup, tilesetData);
    renderer.compose(terrain.small);
    renderer.paint(viewport);
  });

  bench("paint viewport offset", () => {
    renderer.updateTerrain(terrain.small, tiles.small, tileGroup, tilesetData);
    renderer.compose(terrain.small);
    renderer.paint({ startX: 20, startY: 20, tileWidth: 40, tileHeight: 30 });
  });
});
