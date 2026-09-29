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

const app: Application = express();
const PORT: number = 3000;

app.use(express.json());

// Dokumentasi API (Swagger UI) dari spec hasil generate swagger-autogen.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1 AS ok`);
    res.status(200).json({ status: 'success', message: 'Server dan database terhubung' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke database',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use('/api/v1/stalls', stallRouter);
app.use('/api/v1', assignmentRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    return res.status(400).json({ status: 'fail', message: 'Body JSON tidak valid' });
  }
  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
    return res.status(413).json({ status: 'fail', message: 'Ukuran body melebihi batas' });
  }
  console.error('Request middleware error:', error);
  return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
