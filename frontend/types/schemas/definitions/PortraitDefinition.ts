import { z } from "zod";

export const PortraitDefinitionSchema = z.object({
  id: z.number().int().default(0),
  name: z.string().default("Definition"),
  ref_type: z.literal("Definition").default("Definition"),
  portrait_file: z.number().int(),
  smk_change: z.number().int(),
  unknown1: z.number().int(),
});
export type PortraitDefinition = z.infer<typeof PortraitDefinitionSchema>;
