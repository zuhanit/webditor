import { z } from "zod";

export const RawTerrainSchema = z
  .object({
    size: z.object({ height: z.number().int(), width: z.number().int() }),
    tileset: z.enum([
      "Ashworld",
      "Badlands",
      "Desert",
      "Ice",
      "Installation",
      "Jungle",
      "Platform",
      "Twilight",
    ]),
  })
  .describe(
    "Raw terrain model.\n\n`RawTerrain` only have non converted tile data(e.g. tile image), because chk doesn't need\nto know how tile renders.",
  );
export type RawTerrain = z.infer<typeof RawTerrainSchema>;
