
import { Router } from 'express';
import { StallController } from '../controllers/stallController.ts';
import { ReviewController } from '../controllers/reviewController.ts';

import { requireAuth } from '../middlewares/authMiddleware.ts';
import { requireRole } from '../middlewares/roleMiddleware.ts';
import { requireStallOwnership } from '../middlewares/stallOwnershipMiddleware.ts';
import { validate } from '../middlewares/validateMiddleware.ts';

import {
  getStallsQuerySchema,
  createStallSchema,
  updateStallSchema,
  stallIdParamSchema,
  createReviewSchema,
} from '../validators/stallValidator.ts';

const stallRouter = Router();
const stallController = new StallController();
const reviewController = new ReviewController();

// GET /stalls - PUBLIC
stallRouter.get(
  '/',
  validate(getStallsQuerySchema, 'query'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.parameters['search'] = { in: 'query', type: 'string' }
    // #swagger.parameters['category'] = { in: 'query', type: 'string' }
    // #swagger.parameters['page'] = { in: 'query', type: 'integer' }
    // #swagger.parameters['limit'] = { in: 'query', type: 'integer' }
    // #swagger.responses[200] = { description: 'Daftar warung' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }

    return stallController.getStalls(req, res);
  }
);

// POST /stalls - ADMIN & OWNER
stallRouter.post(
  '/',
  requireAuth,
  requireRole('admin', 'owner'),
  validate(createStallSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/StallInput' } }
    // #swagger.responses[201] = { description: 'Warung dibuat' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Tidak memiliki akses' }

    return stallController.createStall(req, res);
  }
);

// GET /stalls/:id - PUBLIC
stallRouter.get(
  '/:id',
  validate(stallIdParamSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Detail warung' }
    // #swagger.responses[400] = { description: 'ID tidak valid' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }

    return stallController.getStallById(req, res);
  }
);

// PUT /stalls/:id - ADMIN & OWNER WARUNG
stallRouter.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'owner'),
  validate(stallIdParamSchema, 'params'),
  requireStallOwnership,
  validate(updateStallSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/StallInput' } }
    // #swagger.responses[200] = { description: 'Warung ter-update' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Tidak memiliki akses atau bukan pemilik warung' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }

    return stallController.updateStall(req, res);
  }
);

// DELETE /stalls/:id - ADMIN ONLY
stallRouter.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate(stallIdParamSchema, 'params'),
  (req, res) => {
    // #swagger.tags = ['Stalls']
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Warung terhapus' }
    // #swagger.responses[400] = { description: 'ID tidak valid' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Tidak memiliki akses' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }

    return stallController.deleteStall(req, res);
  }
);

// GET /stalls/:id/menus - PUBLIC
stallRouter.get('/:id/menus', (req, res) => {
  // #swagger.tags = ['Stalls']
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar menu' }
  // #swagger.responses[404] = { description: 'Tidak ditemukan' }

  return stallController.getStallMenus(req, res);
});

// POST /stalls/:id/reviews - SEMUA USER LOGIN
stallRouter.post(
  '/:id/reviews',
  requireAuth,
  requireRole('customer'),
  validate(stallIdParamSchema, 'params'),
  validate(createReviewSchema, 'body'),
  (req, res) => {
    // #swagger.tags = ['Reviews']
    // #swagger.summary = 'Menambahkan review warung'
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { rating: 5, comment: 'Makanannya enak' } }
    // #swagger.responses[201] = { description: 'Review berhasil dibuat' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Hanya customer yang boleh membuat review' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }

    return reviewController.createReview(req, res);
  }
);

export { stallRouter };
