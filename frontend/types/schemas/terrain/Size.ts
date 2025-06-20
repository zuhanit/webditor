import { z } from "zod";

export const SizeSchema = z.object({
  height: z.number().int(),
  width: z.number().int(),
});
export type Size = z.infer<typeof SizeSchema>;
