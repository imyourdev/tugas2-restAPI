
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/authRepository.ts';
import type { z } from 'zod';
import type {
  registerSchema,
  loginSchema,
} from '../validators/authValidator.ts';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
  constructor(private repository = new AuthRepository()) {}

  async register(input: RegisterInput) {
    const existingUser = await this.repository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Password tidak disimpan dalam bentuk asli
    const passwordHash = await bcrypt.hash(input.password, 12);

    const created = await this.repository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    if (!created) {
      throw new Error('REGISTER_FAILED');
    }

    return this.repository.findById(created.id);
  }

  async login(input: LoginInput) {
    const user = await this.repository.findByEmail(input.email);

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET_NOT_CONFIGURED');
    }

    const token = jwt.sign(
      {
        role: user.role,
      },
      secret,
      {
        subject: String(user.id),
        expiresIn: '1h',
      }
    );

    return {
      token,
      tokenType: 'Bearer',
    };
  }

  async getMe(userId: number) {
    return this.repository.findById(userId);
  }
}
