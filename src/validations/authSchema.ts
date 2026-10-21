import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password must be at least 6 characters"),
  cf_turnstile_response: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Verification code must be at least 6 characters"),
  challenge_token: z.string().min(1, "Challenge token is missing"),
  email: z.string().email("Enter a valid email").optional(),
});

export const twoFactorConfirmSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit verification code"),
});




