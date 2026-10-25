
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

export class AuthRepository {
  // Cari user berdasarkan email untuk proses login
  async findByEmail(email: string) {
    const db = await getDb();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return rows[0];
  }

  // Cari user berdasarkan ID untuk endpoint /auth/me
  async findById(id: number) {
    const db = await getDb();

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, id));

    return rows[0];
  }

  // Simpan user baru saat register
  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    const db = await getDb();

    const rows = await db
      .insert(users)
      .output({ id: users.id })
      .values({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'customer',
      });

    return rows[0];
  }
}
