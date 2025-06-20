import { z } from "zod";

export const SplashSchema = z.object({
  inner: z.number().int(),
  medium: z.number().int(),
  outer: z.number().int(),
});
export type Splash = z.infer<typeof SplashSchema>;
