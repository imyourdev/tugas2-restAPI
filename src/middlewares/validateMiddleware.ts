
import type { RequestHandler } from 'express';
import { z } from 'zod';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (
  schema: z.ZodType,
  source: ValidationSource = 'body'
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        status: 'fail',
        message: 'Validasi gagal',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    // Simpan data yang sudah divalidasi oleh Zod
    res.locals.validated ??= {};
    res.locals.validated[source] = result.data;

    next();
  };
};
