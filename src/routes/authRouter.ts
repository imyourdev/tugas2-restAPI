
import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';
import { requireAuth } from '../middlewares/authMiddleware.ts';

const authRouter = Router();
const authController = new AuthController();

// POST /auth/register
authRouter.post('/register', (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Registrasi pengguna baru'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { name: 'Budi', email: 'budi@example.com', password: 'password123' } }
  // #swagger.responses[201] = { description: 'Registrasi berhasil' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  // #swagger.responses[409] = { description: 'Email sudah terdaftar' }

  return authController.register(req, res);
});

// POST /auth/login
authRouter.post('/login', (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login pengguna'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { email: 'budi@example.com', password: 'password123' } }
  // #swagger.responses[200] = { description: 'Login berhasil' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  // #swagger.responses[401] = { description: 'Email atau password salah' }

  return authController.login(req, res);
});


authRouter.get('/me', requireAuth, (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Melihat profil pengguna yang sedang login'
  // #swagger.security = [{ bearerAuth: [] }]
  // #swagger.responses[200] = { description: 'Profil pengguna' }
  // #swagger.responses[401] = { description: 'Token tidak ada atau tidak valid' }

  return authController.me(req, res);
});


export { authRouter };
