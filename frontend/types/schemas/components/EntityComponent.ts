import { z } from "zod";

export const EntityComponentSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Object"),
});
export type EntityComponent = z.infer<typeof EntityComponentSchema>;
