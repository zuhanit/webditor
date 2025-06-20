import { z } from "zod";

export const ValidationSchema = z.object({ vcod: z.string(), ver: z.string() });
export type Validation = z.infer<typeof ValidationSchema>;
