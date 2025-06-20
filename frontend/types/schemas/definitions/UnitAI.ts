import { z } from "zod";

export const UnitAISchema = z.object({
  name: z.string().default("Unit AI"),
  computer_idle: z.number().int(),
  human_idle: z.number().int(),
  return_to_idle: z.number().int(),
  attack_unit: z.number().int(),
  attack_and_move: z.number().int(),
  internal: z.number().int(),
  right_click: z.number().int(),
});
export type UnitAI = z.infer<typeof UnitAISchema>;
