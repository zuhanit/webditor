import { z } from "zod";

export const ProjectSchema = z.object({
  filename: z.string(),
  path: z.string(),
  uid: z.string(),
  uploadedAt: z.string().datetime({ offset: true }),
  url: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;
