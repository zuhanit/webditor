import { z } from "zod";

export const StringSchema = z.object({
  id: z.number().int(),
  content: z.string(),
});
export type String = z.infer<typeof StringSchema>;
