
import type { RequestHandler } from 'express';
import type { AuthUser } from './authMiddleware.ts';

type Role = AuthUser['role'];

export const requireRole = (...allowedRoles: Role[]): RequestHandler => {
  return (_req, res, next) => {
    const user = res.locals.user as AuthUser | undefined;

    // User belum login
    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Autentikasi diperlukan',
      });
      return;
    }

    // User sudah login tetapi role tidak diizinkan
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'Anda tidak memiliki akses',
      });
      return;
    }

    next();
  };
};
