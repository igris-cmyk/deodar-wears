import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(256, "Password is too long.");

export function normalizeEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");

  if (at === -1) {
    return trimmed.toLowerCase();
  }

  return `${trimmed.slice(0, at).toLowerCase()}@${trimmed.slice(at + 1).toLowerCase()}`;
}

export function isSafeReturnPath(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (/[\u0000-\u001f]/.test(value)) return false;
  if (/^(javascript|data):/i.test(value)) return false;
  return true;
}

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    email: z.email().transform(normalizeEmail),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    termsAccepted: z.literal(true, {
      error: "Terms acknowledgment is required.",
    }),
    returnTo: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    if (value.returnTo && !isSafeReturnPath(value.returnTo)) {
      context.addIssue({
        code: "custom",
        path: ["returnTo"],
        message: "Return destination is not allowed.",
      });
    }
  });

export const signInSchema = z.object({
  email: z.email().transform(normalizeEmail),
  password: z.string().min(1, "Password is required.").max(256),
  returnTo: z
    .string()
    .optional()
    .refine((value) => !value || isSafeReturnPath(value), {
      message: "Return destination is not allowed.",
    }),
});

export const forgotPasswordSchema = z.object({
  email: z.email().transform(normalizeEmail),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(24).max(512),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const mfaCodeSchema = z.string().regex(/^[0-9]{6}$/, "Enter a six-digit code.");

export const recoveryCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){2,5}$/, "Recovery code format is invalid.");
