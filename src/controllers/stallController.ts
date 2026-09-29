import type { Request, Response } from 'express';
import { StallService } from '../services/stallService.ts';
import type { CreateStallInput } from '../repositories/stallRepository.ts';

type JsonObject = Record<string, unknown>;

function parseId(value: string | string[]): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new Error('BAD_REQUEST: id harus berupa bilangan bulat positif');
  }
  return Number(value);
}

function parseQueryInteger(value: unknown, key: string, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new Error(`BAD_REQUEST: ${key} harus berupa bilangan bulat positif`);
  }
  return Number(value);
}

function parseStallInput(value: unknown): CreateStallInput;
function parseStallInput(value: unknown, partial: true): Partial<CreateStallInput>;
function parseStallInput(value: unknown, partial = false): Partial<CreateStallInput> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('BAD_REQUEST: body harus berupa objek JSON');
  }
  const body = value as JsonObject;
  const input: Partial<CreateStallInput> = {};
  if (!partial || body.ownerId !== undefined) {
    if (typeof body.ownerId !== 'number' || !Number.isInteger(body.ownerId) || body.ownerId < 1) {
      throw new Error('BAD_REQUEST: ownerId harus berupa bilangan bulat positif');
    }
    input.ownerId = body.ownerId;
  }
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100) {
      throw new Error('BAD_REQUEST: name wajib diisi (maksimal 100 karakter)');
    }
    input.name = body.name.trim();
  }
  for (const [key, maxLength] of [['category', 50], ['location', 100], ['description', Number.MAX_SAFE_INTEGER]] as const) {
    const field = body[key];
    if (field === undefined) continue;
    if (field !== null && (typeof field !== 'string' || field.length > maxLength)) {
      throw new Error(`BAD_REQUEST: ${key} tidak valid`);
    }
    input[key] = field;
  }
  if (partial && Object.keys(input).length === 0) {
    throw new Error('BAD_REQUEST: minimal satu field harus diubah');
  }
  return input;
}

export class StallController {
  private stallService: StallService;

  constructor(stallService: StallService = new StallService()) {
    this.stallService = stallService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message.startsWith('BAD_REQUEST:')) {
      return res.status(400).json({ status: 'fail', message: error.message.slice('BAD_REQUEST: '.length) });
    }
    if (error instanceof Error && error.message === 'STALL_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data warung tidak ditemukan' });
    }
    console.error('Stall API error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }

  getStalls = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseQueryInteger(req.query.page, 'page', 1);
      const limit = parseQueryInteger(req.query.limit, 'limit', 10);
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      if (req.query.search !== undefined && search === undefined) {
        throw new Error('BAD_REQUEST: search harus berupa teks');
      }
      if (req.query.category !== undefined && category === undefined) {
        throw new Error('BAD_REQUEST: category harus berupa teks');
      }

      const { data, total } = await this.stallService.getAllStalls({
        search,
        category,
        page,
        limit,
      });

      return res.status(200).json({ status: 'success', meta: { page, limit, total }, data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getStallById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const stall = await this.stallService.getStallById(parseId(req.params.id));
      return res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getStallMenus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const menus = await this.stallService.getStallMenus(parseId(req.params.id));
      return res.status(200).json({ status: 'success', data: menus });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createStall = async (req: Request, res: Response): Promise<Response> => {
    try {
      const stall = await this.stallService.createStall(parseStallInput(req.body));
      return res.status(201).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateStall = async (req: Request, res: Response): Promise<Response> => {
    try {
      const stall = await this.stallService.updateStall(
        parseId(req.params.id),
        parseStallInput(req.body, true),
      );
      return res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteStall = async (req: Request, res: Response): Promise<Response> => {
    try {
      const stall = await this.stallService.deleteStall(parseId(req.params.id));
      return res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}
