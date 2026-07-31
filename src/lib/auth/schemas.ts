import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  locale: z.enum(["he", "fr", "en"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  locale: z.enum(["he", "fr", "en"]),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
