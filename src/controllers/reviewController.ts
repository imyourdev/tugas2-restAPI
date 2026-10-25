
import type { Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService.ts';
import { StallService } from '../services/stallService.ts';
import type { AuthUser } from '../middlewares/authMiddleware.ts';
import type { z } from 'zod';

import {
  stallIdParamSchema,
  createReviewSchema,
} from '../validators/stallValidator.ts';

type StallParams = z.infer<typeof stallIdParamSchema>;
type ReviewBody = z.infer<typeof createReviewSchema>;

export class ReviewController {
  constructor(
    private assignmentService = new AssignmentService(),
    private stallService = new StallService()
  ) {}

  createReview = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const user = res.locals.user as AuthUser | undefined;

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Autentikasi diperlukan',
        });
      }

      const params = res.locals.validated?.params as
        | StallParams
        | undefined;

      const body = res.locals.validated?.body as
        | ReviewBody
        | undefined;

      if (!params || !body) {
        return res.status(500).json({
          status: 'error',
          message: 'Validasi belum dijalankan',
        });
      }

      // Pastikan warung ada sebelum menyimpan review
      await this.stallService.getStallById(params.id);

      // userId berasal dari JWT, stallId dari URL
      const review = await this.assignmentService.createReview({
        stallId: params.id,
        userId: user.id,
        rating: body.rating,
        comment: body.comment,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Review berhasil ditambahkan',
        data: review,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'STALL_NOT_FOUND'
      ) {
        return res.status(404).json({
          status: 'fail',
          message: 'Warung tidak ditemukan',
        });
      }

      console.error('Create review error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
    }
  };
}
