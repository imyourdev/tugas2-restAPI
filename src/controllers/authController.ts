
import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.ts';
import {
  registerSchema,
  loginSchema,
} from '../validators/authValidator.ts';

export class AuthController {
  constructor(private service = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<Response> => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validasi gagal',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    try {
      const user = await this.service.register(result.data);

      return res.status(201).json({
        status: 'success',
        message: 'Registrasi berhasil',
        data: user,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'EMAIL_ALREADY_EXISTS'
      ) {
        return res.status(409).json({
          status: 'fail',
          message: 'Email sudah terdaftar',
        });
      }

      console.error('Register error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validasi gagal',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    try {
      const data = await this.service.login(result.data);

      return res.status(200).json({
        status: 'success',
        message: 'Login berhasil',
        data,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'INVALID_CREDENTIALS'
      ) {
        return res.status(401).json({
          status: 'fail',
          message: 'Email atau password salah',
        });
      }

      console.error('Login error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
    }
  };

  
  me = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const userId = res.locals.user.id;
      const user = await this.service.getMe(userId);

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Pengguna tidak ditemukan',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
    }
  };

}
