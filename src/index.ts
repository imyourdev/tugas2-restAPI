
import 'dotenv/config';

import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './docs/swagger-output.json' with { type: 'json' };

import { getDb } from './db/index.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { assignmentRouter } from './routes/assignmentRouter.ts';
import { authRouter } from './routes/authRouter.ts';

const app: Application = express();
const PORT = Number(process.env.PORT ?? 3000);

// Middleware untuk membaca JSON.
app.use(express.json());

// Swagger UI.
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// Mengecek koneksi server dan database.
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();

    await db.execute(sql`SELECT 1 AS ok`);

    return res.status(200).json({
      status: 'success',
      message: 'Server dan database terhubung',
    });
  } catch (error) {
    console.error('Health check error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke database',
    });
  }
});

// Routes utama API.
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/stalls', stallRouter);
app.use('/api/v1', assignmentRouter);

// Menangani endpoint yang tidak ditemukan.
// Letakkan setelah seluruh routes.
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    status: 'fail',
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan`,
  });
});

// Global error handler.
// Wajib diletakkan PALING AKHIR.
app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (res.headersSent) {
      _next(error);
      return;
    }

    // Body JSON salah format.
    if (
      error instanceof SyntaxError &&
      'status' in error &&
      error.status === 400
    ) {
      res.status(400).json({
        status: 'fail',
        message: 'Body JSON tidak valid',
      });
      return;
    }

    // Request body terlalu besar.
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 413
    ) {
      res.status(413).json({
        status: 'fail',
        message: 'Ukuran body melebihi batas',
      });
      return;
    }

    // Error server yang tidak tertangani.
    console.error('Unhandled API error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
);

// Menjalankan server.
app.listen(PORT, () => {
  console.log(
    `Server berjalan di http://localhost:${PORT}`
  );
});
