import { z } from "zod";

export const RawTriggerSectionSchema = z
  .object({
    id: z.number().int().default(0),
    name: z.string().default("RawTrigger"),
    raw_data: z.string(),
  })
  .describe(
    "Bytes-based raw trigger section(e.g. TRIG and MBRF)\n\nWebditor uses `eudplib` for trigger programming, so every triggers need to written for eudplib. But\nuser can use his own trigger on map thanks to eudplib supports it. So TRIG and MBRF sections are used\nto only compile map.",
  );
export type RawTriggerSection = z.infer<typeof RawTriggerSectionSchema>;
