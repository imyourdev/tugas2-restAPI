
import { Router } from 'express';
import { AssignmentController } from '../controllers/assignmentController.ts';
import { requireAuth } from '../middlewares/authMiddleware.ts';
import { requireRole } from '../middlewares/roleMiddleware.ts';

const assignmentRouter = Router();
const controller = new AssignmentController();

// GET /users - ADMIN ONLY
assignmentRouter.get(
  '/users',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.responses[200] = { description: 'Daftar pengguna tanpa password hash' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Hanya admin yang diizinkan' }

    return controller.getUsers(req, res);
  }
);

// POST /users - ADMIN ONLY
assignmentRouter.post(
  '/users',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UserInput' } }
    // #swagger.responses[201] = { description: 'Pengguna dibuat' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Hanya admin yang diizinkan' }

    return controller.createUser(req, res);
  }
);

// GET /menu-items - PUBLIC
assignmentRouter.get('/menu-items', (req, res) => {
  // #swagger.parameters['stallId'] = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar menu beserta data warung' }

  return controller.getMenuItems(req, res);
});

// POST /menu-items - ADMIN & OWNER
assignmentRouter.post(
  '/menu-items',
  requireAuth,
  requireRole('admin', 'owner'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MenuItemInput' } }
    // #swagger.responses[201] = { description: 'Menu dibuat beserta data warung' }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Tidak memiliki akses' }

    return controller.createMenuItem(req, res);
  }
);

// GET /menu-items/:id - PUBLIC
assignmentRouter.get('/menu-items/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }

  return controller.getMenuItem(req, res);
});

// PUT /menu-items/:id - ADMIN & OWNER
assignmentRouter.put(
  '/menu-items/:id',
  requireAuth,
  requireRole('admin', 'owner'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MenuItemInput' } }

    return controller.updateMenuItem(req, res);
  }
);

// DELETE /menu-items/:id - ADMIN ONLY
assignmentRouter.delete(
  '/menu-items/:id',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }

    return controller.deleteMenuItem(req, res);
  }
);

// GET /reviews - PUBLIC
assignmentRouter.get('/reviews', (req, res) => {
  // #swagger.parameters['stallId'] = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar ulasan beserta data pengguna' }

  return controller.getReviews(req, res);
});

// POST /reviews - ENDPOINT LAMA ADMIN ONLY
// Untuk user biasa gunakan POST /stalls/:id/reviews
assignmentRouter.post(
  '/reviews',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
    // #swagger.responses[401] = { description: 'Belum login' }
    // #swagger.responses[403] = { description: 'Hanya admin yang diizinkan' }

    return controller.createReview(req, res);
  }
);

// DELETE /reviews/:id - ADMIN ONLY
assignmentRouter.delete(
  '/reviews/:id',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }

    return controller.deleteReview(req, res);
  }
);

// POST /likes - USER LOGIN
assignmentRouter.post(
  '/likes',
  requireAuth,
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/LikeInput' } }

    return controller.createLike(req, res);
  }
);

// DELETE /likes/:id - USER LOGIN
assignmentRouter.delete(
  '/likes/:id',
  requireAuth,
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }

    return controller.deleteLike(req, res);
  }
);

// GET /flags - ADMIN ONLY
assignmentRouter.get(
  '/flags',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['status'] = { in: 'query', type: 'string', enum: ['pending', 'resolved', 'dismissed'] }

    return controller.getFlags(req, res);
  }
);

// PUT /flags/:id - ADMIN ONLY
assignmentRouter.put(
  '/flags/:id',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/FlagStatusInput' } }

    return controller.updateFlagStatus(req, res);
  }
);

// GET /audit-logs - ADMIN ONLY
assignmentRouter.get(
  '/audit-logs',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['userId'] = { in: 'query', type: 'integer' }
    // #swagger.parameters['targetTable'] = { in: 'query', type: 'string' }

    return controller.getAuditLogs(req, res);
  }
);

// POST /audit-logs - ADMIN ONLY
assignmentRouter.post(
  '/audit-logs',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    // #swagger.security = [{ bearerAuth: [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/AuditLogInput' } }

    return controller.createAuditLog(req, res);
  }
);

export { assignmentRouter };
