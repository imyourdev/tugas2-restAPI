
import type { Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService.ts';
import type { AuthUser } from '../middlewares/authMiddleware.ts';

import type {
  AuditLogInput,
  MenuItemInput,
  ReviewInput,
  UserInput,
} from '../repositories/assignmentRepository.ts';

type JsonObject = Record<string, unknown>;

function bodyObject(value: unknown): JsonObject {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error('BAD_REQUEST: body harus berupa objek JSON');
  }

  return value as JsonObject;
}

function requiredString(
  body: JsonObject,
  key: string,
  maxLength: number
): string {
  const value = body[key];

  if (
    typeof value !== 'string' ||
    value.trim().length === 0 ||
    value.length > maxLength
  ) {
    throw new Error(
      `BAD_REQUEST: ${key} wajib berupa teks (maksimal ${maxLength} karakter)`
    );
  }

  return value.trim();
}

function optionalString(
  body: JsonObject,
  key: string,
  maxLength: number
): string | null | undefined {
  const value = body[key];

  if (value === undefined) return undefined;
  if (value === null) return null;

  if (
    typeof value !== 'string' ||
    value.length > maxLength
  ) {
    throw new Error(
      `BAD_REQUEST: ${key} harus berupa teks (maksimal ${maxLength} karakter)`
    );
  }

  return value;
}

function requiredInteger(
  body: JsonObject,
  key: string,
  minimum = 1
): number {
  const value = body[key];

  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < minimum
  ) {
    throw new Error(
      `BAD_REQUEST: ${key} harus berupa bilangan bulat minimal ${minimum}`
    );
  }

  return value;
}

function optionalBoolean(
  body: JsonObject,
  key: string
): boolean | undefined {
  const value = body[key];

  if (value === undefined) return undefined;

  if (typeof value !== 'boolean') {
    throw new Error(`BAD_REQUEST: ${key} harus berupa boolean`);
  }

  return value;
}

function queryInteger(
  value: unknown,
  key: string
): number | undefined {
  if (value === undefined) return undefined;

  if (
    typeof value !== 'string' ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new Error(
      `BAD_REQUEST: ${key} harus berupa bilangan bulat positif`
    );
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(
      `BAD_REQUEST: ${key} terlalu besar`
    );
  }

  return number;
}

function pathId(value: unknown): number {
  if (
    typeof value !== 'string' ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new Error(
      'BAD_REQUEST: id harus berupa bilangan bulat positif'
    );
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error('BAD_REQUEST: id terlalu besar');
  }

  return number;
}

function parseUser(value: unknown): UserInput {
  const body = bodyObject(value);
  const role = body.role;

  if (
    role !== 'admin' &&
    role !== 'owner' &&
    role !== 'customer'
  ) {
    throw new Error(
      'BAD_REQUEST: role harus admin, owner, atau customer'
    );
  }

  const email = requiredString(
    body,
    'email',
    150
  );

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('BAD_REQUEST: email tidak valid');
  }

  return {
    name: requiredString(body, 'name', 100),
    email,
    passwordHash: requiredString(
      body,
      'passwordHash',
      255
    ),
    role,
  };
}

function parseMenuItem(value: unknown): MenuItemInput;

function parseMenuItem(
  value: unknown,
  partial: true
): Partial<MenuItemInput>;

function parseMenuItem(
  value: unknown,
  partial = false
): MenuItemInput | Partial<MenuItemInput> {
  const body = bodyObject(value);
  const input: Partial<MenuItemInput> = {};

  if (!partial || body.stallId !== undefined) {
    input.stallId = requiredInteger(
      body,
      'stallId'
    );
  }

  if (!partial || body.name !== undefined) {
    input.name = requiredString(
      body,
      'name',
      100
    );
  }

  if (!partial || body.price !== undefined) {
    input.price = requiredInteger(
      body,
      'price',
      0
    );
  }

  const isAvailable = optionalBoolean(
    body,
    'isAvailable'
  );

  if (isAvailable !== undefined) {
    input.isAvailable = isAvailable;
  }

  if (Object.keys(input).length === 0) {
    throw new Error(
      'BAD_REQUEST: minimal satu field harus diubah'
    );
  }

  return input;
}

function parseReview(value: unknown): ReviewInput {
  const body = bodyObject(value);
  const rating = requiredInteger(
    body,
    'rating'
  );

  if (rating > 5) {
    throw new Error(
      'BAD_REQUEST: rating harus antara 1 dan 5'
    );
  }

  return {
    stallId: requiredInteger(body, 'stallId'),
    userId: requiredInteger(body, 'userId'),
    rating,
    comment: optionalString(
      body,
      'comment',
      4000
    ),
  };
}

function parseAuditLog(
  value: unknown
): AuditLogInput {
  const body = bodyObject(value);

  let metadata = optionalString(
    body,
    'metadata',
    Number.MAX_SAFE_INTEGER
  );

  if (
    body.metadata !== undefined &&
    body.metadata !== null &&
    typeof body.metadata !== 'string'
  ) {
    try {
      metadata = JSON.stringify(
        body.metadata
      );
    } catch {
      throw new Error(
        'BAD_REQUEST: metadata tidak dapat diserialisasi'
      );
    }
  }

  return {
    userId: requiredInteger(body, 'userId'),
    action: requiredString(
      body,
      'action',
      50
    ),
    targetTable: requiredString(
      body,
      'targetTable',
      50
    ),
    targetId: requiredInteger(
      body,
      'targetId'
    ),
    metadata,
  };
}

export class AssignmentController {
  constructor(
    private service: AssignmentService = new AssignmentService()
  ) {}

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
        message: error.message.slice(
          'BAD_REQUEST: '.length
        ),
      });
    }

    if (
      error instanceof Error &&
      error.message === 'LIKE_FORBIDDEN'
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'Anda bukan pemilik like ini',
      });
    }

    const notFound = [
      'MENU_ITEM_NOT_FOUND',
      'REVIEW_NOT_FOUND',
      'LIKE_NOT_FOUND',
      'FLAG_NOT_FOUND',
    ];

    if (
      error instanceof Error &&
      notFound.includes(error.message)
    ) {
      return res.status(404).json({
        status: 'fail',
        message: 'Data tidak ditemukan',
      });
    }

    console.error(
      'Assignment API error:',
      error
    );

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  getUsers = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(200).json({
        status: 'success',
        data: await this.service.getUsers(),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createUser = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(201).json({
        status: 'success',
        data: await this.service.createUser(
          parseUser(req.body)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getMenuItems = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const stallId = queryInteger(
        req.query.stallId,
        'stallId'
      );

      return res.status(200).json({
        status: 'success',
        data: await this.service.getMenuItems(
          stallId
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getMenuItem = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(200).json({
        status: 'success',
        data: await this.service.getMenuItem(
          pathId(req.params.id)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createMenuItem = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(201).json({
        status: 'success',
        data: await this.service.createMenuItem(
          parseMenuItem(req.body)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateMenuItem = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(200).json({
        status: 'success',
        data: await this.service.updateMenuItem(
          pathId(req.params.id),
          parseMenuItem(req.body, true)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteMenuItem = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(200).json({
        status: 'success',
        data: await this.service.deleteMenuItem(
          pathId(req.params.id)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getReviews = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const stallId = queryInteger(
        req.query.stallId,
        'stallId'
      );

      return res.status(200).json({
        status: 'success',
        data: await this.service.getReviews(
          stallId
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createReview = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(201).json({
        status: 'success',
        data: await this.service.createReview(
          parseReview(req.body)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteReview = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(200).json({
        status: 'success',
        data: await this.service.deleteReview(
          pathId(req.params.id)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // POST /likes:
  // userId selalu diambil dari JWT.
  createLike = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const user = res.locals.user as
        | AuthUser
        | undefined;

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Autentikasi diperlukan',
        });
      }

      const body = bodyObject(req.body);

      if ('userId' in body) {
        return res.status(400).json({
          status: 'fail',
          message: 'userId tidak boleh dikirim melalui body',
        });
      }

      const reviewId = requiredInteger(
        body,
        'reviewId'
      );

      return res.status(201).json({
        status: 'success',
        data: await this.service.createLike({
          reviewId,
          userId: user.id,
        }),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // DELETE /likes/:id:
  // Admin boleh hapus semua; user hanya like sendiri.
  deleteLike = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const user = res.locals.user as
        | AuthUser
        | undefined;

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Autentikasi diperlukan',
        });
      }

      const likeId = pathId(
        req.params.id
      );

      const deletedLike =
        await this.service.deleteLike(
          likeId,
          user.id,
          user.role
        );

      return res.status(200).json({
        status: 'success',
        data: deletedLike,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getFlags = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const status = req.query.status;
      let filterStatus: string | undefined;

      if (status !== undefined) {
        if (
          typeof status !== 'string' ||
          ![
            'pending',
            'resolved',
            'dismissed',
          ].includes(status)
        ) {
          throw new Error(
            'BAD_REQUEST: status harus pending, resolved, atau dismissed'
          );
        }

        filterStatus = status;
      }

      return res.status(200).json({
        status: 'success',
        data: await this.service.getFlags(
          filterStatus
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateFlagStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const body = bodyObject(req.body);
      const status = body.status;

      if (
        status !== 'pending' &&
        status !== 'resolved' &&
        status !== 'dismissed'
      ) {
        throw new Error(
          'BAD_REQUEST: status harus pending, resolved, atau dismissed'
        );
      }

      return res.status(200).json({
        status: 'success',
        data: await this.service.updateFlagStatus(
          pathId(req.params.id),
          status
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getAuditLogs = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const userId = queryInteger(
        req.query.userId,
        'userId'
      );

      const targetTable =
        req.query.targetTable;

      if (
        targetTable !== undefined &&
        typeof targetTable !== 'string'
      ) {
        throw new Error(
          'BAD_REQUEST: targetTable harus berupa teks'
        );
      }

      return res.status(200).json({
        status: 'success',
        data: await this.service.getAuditLogs(
          userId,
          targetTable
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createAuditLog = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      return res.status(201).json({
        status: 'success',
        data: await this.service.createAuditLog(
          parseAuditLog(req.body)
        ),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
