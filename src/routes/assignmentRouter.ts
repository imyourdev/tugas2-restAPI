import { Router } from 'express';
import { AssignmentController } from '../controllers/assignmentController.ts';

const assignmentRouter = Router();
const controller = new AssignmentController();

assignmentRouter.get('/users', (req, res) => {
  // #swagger.responses[200] = { description: 'Daftar pengguna tanpa password hash' }
  return controller.getUsers(req, res);
});
assignmentRouter.post('/users', (req, res) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UserInput' } }
  // #swagger.responses[201] = { description: 'Pengguna dibuat' }
  return controller.createUser(req, res);
});

assignmentRouter.get('/menu-items', (req, res) => {
  // #swagger.parameters['stallId'] = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar menu beserta data warung' }
  return controller.getMenuItems(req, res);
});
assignmentRouter.post('/menu-items', (req, res) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MenuItemInput' } }
  // #swagger.responses[201] = { description: 'Menu dibuat beserta data warung' }
  return controller.createMenuItem(req, res);
});
assignmentRouter.get('/menu-items/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  return controller.getMenuItem(req, res);
});
assignmentRouter.put('/menu-items/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/MenuItemInput' } }
  return controller.updateMenuItem(req, res);
});
assignmentRouter.delete('/menu-items/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  return controller.deleteMenuItem(req, res);
});

assignmentRouter.get('/reviews', (req, res) => {
  // #swagger.parameters['stallId'] = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar ulasan beserta data pengguna' }
  return controller.getReviews(req, res);
});
assignmentRouter.post('/reviews', (req, res) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
  return controller.createReview(req, res);
});
assignmentRouter.delete('/reviews/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  return controller.deleteReview(req, res);
});

assignmentRouter.post('/likes', (req, res) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/LikeInput' } }
  return controller.createLike(req, res);
});
assignmentRouter.delete('/likes/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  return controller.deleteLike(req, res);
});

assignmentRouter.get('/flags', (req, res) => {
  // #swagger.parameters['status'] = { in: 'query', type: 'string', enum: ['pending', 'resolved', 'dismissed'] }
  return controller.getFlags(req, res);
});
assignmentRouter.put('/flags/:id', (req, res) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/FlagStatusInput' } }
  return controller.updateFlagStatus(req, res);
});

assignmentRouter.get('/audit-logs', (req, res) => {
  // #swagger.parameters['userId'] = { in: 'query', type: 'integer' }
  // #swagger.parameters['targetTable'] = { in: 'query', type: 'string' }
  return controller.getAuditLogs(req, res);
});
assignmentRouter.post('/audit-logs', (req, res) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/AuditLogInput' } }
  return controller.createAuditLog(req, res);
});

export { assignmentRouter };
