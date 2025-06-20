import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Object"),
  color: z.number().int(),
  rgb_color: z.array(z.any()).min(3).max(3),
  player_type: z.enum([
    "Inactive",
    "Computer (game)",
    "Occupied By Human Player",
    "Rescue",
    "Unused",
    "Computer",
    "Human (Open Slot)",
    "Neutral",
    "Closed Slot",
  ]),
  race: z.enum([
    "Zerg",
    "Terran",
    "Protoss",
    "Invalid (Independant)",
    "Invalid (Neutral)",
    "User Selectable",
    "Random",
    "Inactive",
  ]),
  force: z.number().int().gte(0).lt(4).default(0),
});
export type Player = z.infer<typeof PlayerSchema>;
