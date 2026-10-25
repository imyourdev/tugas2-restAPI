
import type { RequestHandler } from 'express';
import { StallRepository } from '../repositories/stallRepository.ts';
import type { AuthUser } from './authMiddleware.ts';

const stallRepository = new StallRepository();

export const requireStallOwnership: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = res.locals.user as AuthUser | undefined;

    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Autentikasi diperlukan',
      });
      return;
    }

    // Parameter ID sudah divalidasi oleh Zod di stallRouter.
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        status: 'fail',
        message: 'ID warung tidak valid',
      });
      return;
    }

    // Pastikan warung ditemukan.
    const stall = await stallRepository.findById(id);

    if (!stall) {
      res.status(404).json({
        status: 'fail',
        message: 'Warung tidak ditemukan',
      });
      return;
    }

    // Admin boleh mengubah semua warung yang ada.
    if (user.role === 'admin') {
      next();
      return;
    }

    // Hanya owner yang boleh mengubah warung.
    if (user.role !== 'owner') {
      res.status(403).json({
        status: 'fail',
        message: 'Anda tidak memiliki akses',
      });
      return;
    }

    // Owner hanya boleh mengubah warung miliknya.
    if (stall.ownerId !== user.id) {
      res.status(403).json({
        status: 'fail',
        message: 'Anda bukan pemilik warung ini',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
