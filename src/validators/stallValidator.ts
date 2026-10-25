
import { z } from 'zod';

// Validasi bilangan bulat positif dari URL/query.
// Contoh valid: "1", "10", "100"
// Contoh tidak valid: "0", "-1", "abc", "1.5"
const positiveInteger = z
  .string()
  .regex(/^[1-9]\d*$/, 'Harus berupa bilangan bulat positif')
  .transform((value) => Number(value))
  .refine(
    (value) => Number.isSafeInteger(value),
    'Angka terlalu besar'
  );

// GET /stalls
export const getStallsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, 'search maksimal 100 karakter')
    .optional(),

  category: z
    .string()
    .trim()
    .max(50, 'category maksimal 50 karakter')
    .optional(),

  page: positiveInteger.optional().transform((value) => value ?? 1),

  limit: positiveInteger
  .refine(
    (value) => value <= 100,
    'limit maksimal 100'
  )
  .optional()
  .transform((value) => value ?? 10),

  
});

// GET /stalls/:id
// PUT /stalls/:id
// DELETE /stalls/:id
export const stallIdParamSchema = z.object({
  id: positiveInteger,
});

// POST /stalls
export const createStallSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),

  category: z
    .string()
    .trim()
    .max(50, 'category maksimal 50 karakter')
    .optional(),

  location: z
    .string()
    .trim()
    .max(100, 'location maksimal 100 karakter')
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, 'description maksimal 1000 karakter')
    .optional(),
});

// PUT /stalls/:id
// Minimal satu field harus dikirim.
export const updateStallSchema = createStallSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Minimal satu field harus diubah'
  );

// POST /stalls/:id/reviews
export const createReviewSchema = z.strictObject({
  rating: z
    .number()
    .int('rating harus bilangan bulat')
    .min(1, 'rating minimal 1')
    .max(5, 'rating maksimal 5'),

  comment: z
    .string()
    .trim()
    .max(1000, 'comment maksimal 1000 karakter')
    .optional(),
});
