import { z } from "zod";

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["local", "test", "preview", "staging", "production"])
    .optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(input: Record<string, string | undefined>): PublicEnv {
  return publicEnvSchema.parse(input);
}
