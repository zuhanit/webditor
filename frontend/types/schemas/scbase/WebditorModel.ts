import { z } from "zod";

export const WebditorModelSchema = z.object({});
export type WebditorModel = z.infer<typeof WebditorModelSchema>;
