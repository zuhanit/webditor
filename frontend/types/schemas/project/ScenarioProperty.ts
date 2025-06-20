import { z } from "zod";

export const ScenarioPropertySchema = z.object({
  name: z.object({ id: z.number().int(), content: z.string() }),
  description: z.object({ id: z.number().int(), content: z.string() }),
});
export type ScenarioProperty = z.infer<typeof ScenarioPropertySchema>;
