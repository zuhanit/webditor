import { z } from "zod";

export const DefinitionSchema = z
  .object({
    id: z.number().int().default(0),
    name: z.string().default("Definition"),
    ref_type: z.literal("Definition").default("Definition"),
  })
  .describe("Object for saving data to class.");
export type Definition = z.infer<typeof DefinitionSchema>;
