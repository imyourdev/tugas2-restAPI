
import type { Request, Response } from 'express';
import { StallService } from '../services/stallService.ts';
import type { AuthUser } from '../middlewares/authMiddleware.ts';
import type { z } from 'zod';

import {
  getStallsQuerySchema,
  createStallSchema,
  updateStallSchema,
  stallIdParamSchema,
} from '../validators/stallValidator.ts';

type GetStallsQuery = z.infer<typeof getStallsQuerySchema>;
type CreateStallBody = z.infer<typeof createStallSchema>;
type UpdateStallBody = z.infer<typeof updateStallSchema>;
type StallParams = z.infer<typeof stallIdParamSchema>;

// Validasi ID untuk endpoint lama GET /stalls/:id/menus
function parseId(value: string | string[]): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new Error(
      'BAD_REQUEST: id harus berupa bilangan bulat positif'
    );
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    throw new Error('BAD_REQUEST: id tidak valid');
  }

  return id;
}

export class StallController {
  private stallService: StallService;

  constructor(stallService: StallService = new StallService()) {
    this.stallService = stallService;
  }

  // Penanganan error sementara
  private handleError(
    res: Response,
    error: unknown
  ): Response {
    if (
      error instanceof Error &&
      error.message.startsWith('BAD_REQUEST:')
    ) {
      return res.status(400).json({
        status: 'fail',
        message: error.message.slice('BAD_REQUEST: '.length),
      });
    }

    if (
      error instanceof Error &&
      error.message === 'STALL_NOT_FOUND'
    ) {
      return res.status(404).json({
        status: 'fail',
        message: 'Data warung tidak ditemukan',
      });
    }

    console.error('Stall API error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  // GET /stalls - PUBLIC
  getStalls = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const query = res.locals.validated?.query as
        | GetStallsQuery
        | undefined;

      if (!query) {
        return res.status(500).json({
          status: 'error',
          message: 'Validasi query belum dijalankan',
        });
      }

      const { search, category, page, limit } = query;

      const { data, total } =
        await this.stallService.getAllStalls({
          search,
          category,
          page,
          limit,
        });

      return res.status(200).json({
        status: 'success',
        meta: {
          page,
          limit,
          total,
        },
        data,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // GET /stalls/:id - PUBLIC
  getStallById = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const params = res.locals.validated?.params as
        | StallParams
        | undefined;

      if (!params) {
        return res.status(500).json({
          status: 'error',
          message: 'Validasi parameter belum dijalankan',
        });
      }

      const stall = await this.stallService.getStallById(
        params.id
      );

      return res.status(200).json({
        status: 'success',
        data: stall,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // GET /stalls/:id/menus - PUBLIC (endpoint Tugas 2)
  getStallMenus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const menus = await this.stallService.getStallMenus(
        parseId(req.params.id)
      );

      return res.status(200).json({
        status: 'success',
        data: menus,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // POST /stalls - ADMIN & OWNER
  createStall = async (
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

      const input = res.locals.validated?.body as
        | CreateStallBody
        | undefined;

      if (!input) {
        return res.status(500).json({
          status: 'error',
          message: 'Validasi body belum dijalankan',
        });
      }

      // ownerId diambil dari identitas pengguna pada JWT
      const stall = await this.stallService.createStall({
        ...input,
        ownerId: user.id,
      });

      return res.status(201).json({
        status: 'success',
        data: stall,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // PUT /stalls/:id - ADMIN & OWNER WARUNG
  updateStall = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const params = res.locals.validated?.params as
        | StallParams
        | undefined;

      const input = res.locals.validated?.body as
        | UpdateStallBody
        | undefined;

      if (!params || !input) {
        return res.status(500).json({
          status: 'error',
          message: 'Validasi belum dijalankan',
        });
      }

      const stall = await this.stallService.updateStall(
        params.id,
        input
      );

      return res.status(200).json({
        status: 'success',
        data: stall,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // DELETE /stalls/:id - ADMIN ONLY
  deleteStall = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const params = res.locals.validated?.params as
        | StallParams
        | undefined;

      if (!params) {
        return res.status(500).json({
          status: 'error',
          message: 'Validasi parameter belum dijalankan',
        });
      }

      const stall = await this.stallService.deleteStall(
        params.id
      );

      return res.status(200).json({
        status: 'success',
        data: stall,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
