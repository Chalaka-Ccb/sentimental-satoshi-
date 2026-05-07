import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
});

export type AuthFormValues = z.infer<typeof authSchema>;

export type AuthErrors = Partial<Record<keyof AuthFormValues, string>>;