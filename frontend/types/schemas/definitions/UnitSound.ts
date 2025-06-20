import { z } from "zod";

export const UnitSoundSchema = z.object({
  name: z.string().default("Unit Sound"),
  ready: z.union([z.number().int(), z.null()]),
  what_start: z.number().int(),
  what_end: z.number().int(),
  piss_start: z.union([z.number().int(), z.null()]),
  piss_end: z.union([z.number().int(), z.null()]),
  yes_start: z.union([z.number().int(), z.null()]),
  yes_end: z.union([z.number().int(), z.null()]),
});
export type UnitSound = z.infer<typeof UnitSoundSchema>;
