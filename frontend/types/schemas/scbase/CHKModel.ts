import { z } from "zod";

export const CHKModelSchema = z.object({});
export type CHKModel = z.infer<typeof CHKModelSchema>;
