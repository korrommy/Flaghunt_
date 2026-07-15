import { z } from "zod";

const challengeIdSchema = z.number().int().positive();

export const submitFlagSchema = z.object({
  challenge_id: challengeIdSchema,
  flag: z.string().trim().min(1).max(200),
});
export const authSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).max(72) });
export const hintSchema = z.object({ challenge_id: challengeIdSchema });
export const writeupSchema = z.object({ challenge_id: challengeIdSchema });

export type SubmitFlagInput = z.infer<typeof submitFlagSchema>;
export type AuthInput = z.infer<typeof authSchema>;
export type HintInput = z.infer<typeof hintSchema>;
export type WriteupInput = z.infer<typeof writeupSchema>;
