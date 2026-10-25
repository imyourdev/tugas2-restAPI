
import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  role: 'admin' | 'owner' | 'customer';
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'fail',
      message: 'Token tidak ditemukan',
    });
    return;
  }

  const token = authorization.slice(7);

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      status: 'error',
      message: 'Konfigurasi JWT belum tersedia',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as JwtPayload;

    const id = Number(decoded.sub);
    const role = decoded.role;

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      (role !== 'admin' &&
        role !== 'owner' &&
        role !== 'customer')
    ) {
      res.status(401).json({
        status: 'fail',
        message: 'Token tidak valid',
      });
      return;
    }

    // Identitas user berasal dari JWT, bukan request body.
    res.locals.user = { id, role } satisfies AuthUser;

    next();
  } catch {
    res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  }
};
