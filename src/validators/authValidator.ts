
import { z } from 'zod';

// Validasi POST /auth/register
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(150, 'email maksimal 150 karakter')
    .email('Format email tidak valid'),

  password: z
    .string()
    .min(8, 'password minimal 8 karakter')
    .max(72, 'password maksimal 72 karakter'),
});

// Validasi POST /auth/login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Format email tidak valid'),

  password: z
    .string()
    .min(1, 'password wajib diisi'),
});
