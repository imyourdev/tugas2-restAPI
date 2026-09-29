import { and, avg, count, eq, sql, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import {
  auditLogs,
  flags,
  likes,
  menuItems,
  reviews,
  stalls,
  users,
} from '../db/schema.ts';

export interface UserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'owner' | 'customer';
}

export interface MenuItemInput {
  stallId: number;
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface ReviewInput {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string | null;
}

export interface LikeInput {
  reviewId: number;
  userId: number;
}

export interface AuditLogInput {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: string | null;
}

export class AssignmentRepository {
  private async updateStallReviewStats(
    db: Pick<Awaited<ReturnType<typeof getDb>>, 'select' | 'update'>,
    stallId: number,
  ) {
    const [stats] = await db
      .select({ average: avg(reviews.rating), total: count() })
      .from(reviews)
      .where(eq(reviews.stallId, stallId));
    await db
      .update(stalls)
      .set({
        avgRating: String(stats?.average ?? 0),
        reviewCount: Number(stats?.total ?? 0),
      })
      .where(eq(stalls.id, stallId));
  }

  async findUsers() {
    const db = await getDb();
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.id);
  }

  async createUser(input: UserInput) {
    const db = await getDb();
    const inserted = await db.insert(users).output({ id: users.id }).values(input);
    const id = inserted[0]?.id;
    if (id === undefined) return undefined;
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));
    return rows[0];
  }

  async findMenuItems(stallId?: number) {
    const db = await getDb();
    return db
      .select({
        id: menuItems.id,
        stallId: menuItems.stallId,
        name: menuItems.name,
        price: menuItems.price,
        isAvailable: menuItems.isAvailable,
        stall: {
          id: stalls.id,
          name: stalls.name,
          category: stalls.category,
          location: stalls.location,
        },
      })
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
      .where(stallId === undefined ? undefined : eq(menuItems.stallId, stallId))
      .orderBy(menuItems.id);
  }

  async findMenuItemById(id: number) {
    const db = await getDb();
    const rows = await db
      .select({
        id: menuItems.id,
        stallId: menuItems.stallId,
        name: menuItems.name,
        price: menuItems.price,
        isAvailable: menuItems.isAvailable,
        stall: {
          id: stalls.id,
          name: stalls.name,
          category: stalls.category,
          location: stalls.location,
        },
      })
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
      .where(eq(menuItems.id, id));
    return rows[0];
  }

  async createMenuItem(input: MenuItemInput) {
    const db = await getDb();
    const inserted = await db.insert(menuItems).output({ id: menuItems.id }).values({
      stallId: input.stallId,
      name: input.name,
      price: input.price,
      isAvailable: input.isAvailable ?? true,
    });
    const id = inserted[0]?.id;
    return id === undefined ? undefined : this.findMenuItemById(id);
  }

  async updateMenuItem(id: number, input: Partial<MenuItemInput>) {
    const db = await getDb();
    const updated = await db
      .update(menuItems)
      .set({
        ...(input.stallId !== undefined ? { stallId: input.stallId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      })
      .where(eq(menuItems.id, id))
      .output();
    return updated.length === 0 ? undefined : this.findMenuItemById(id);
  }

  async deleteMenuItem(id: number) {
    const existing = await this.findMenuItemById(id);
    if (!existing) return undefined;
    const db = await getDb();
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return existing;
  }

  async findReviews(stallId?: number) {
    const db = await getDb();
    return db
      .select({
        id: reviews.id,
        stallId: reviews.stallId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        likeCount: reviews.likeCount,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(stallId === undefined ? undefined : eq(reviews.stallId, stallId))
      .orderBy(reviews.id);
  }

  async findReviewById(id: number) {
    const db = await getDb();
    const rows = await db
      .select({
        id: reviews.id,
        stallId: reviews.stallId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        likeCount: reviews.likeCount,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.id, id));
    return rows[0];
  }

  async createReview(input: ReviewInput) {
    const db = await getDb();
    const id = await db.transaction(async (tx) => {
      const inserted = await tx.insert(reviews).output({ id: reviews.id }).values({
        stallId: input.stallId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment ?? null,
        likeCount: 0,
      });
      const insertedId = inserted[0]?.id;
      if (insertedId === undefined) return undefined;
      await this.updateStallReviewStats(tx, input.stallId);
      return insertedId;
    });
    return id === undefined ? undefined : this.findReviewById(id);
  }

  async deleteReview(id: number) {
    const existing = await this.findReviewById(id);
    if (!existing) return undefined;
    const db = await getDb();
    const deleted = await db.transaction(async (tx) => {
      const rows = await tx.delete(reviews).where(eq(reviews.id, id)).output();
      if (rows.length === 0) return false;
      await this.updateStallReviewStats(tx, existing.stallId);
      return true;
    });
    return deleted ? existing : undefined;
  }

  async createLike(input: LikeInput) {
    const db = await getDb();
    return db.transaction(async (tx) => {
      const rows = await tx.insert(likes).output().values(input);
      const created = rows[0];
      if (created) {
        await tx
          .update(reviews)
          .set({ likeCount: sql`${reviews.likeCount} + 1` })
          .where(eq(reviews.id, input.reviewId));
      }
      return created;
    });
  }

  async deleteLike(id: number) {
    const db = await getDb();
    return db.transaction(async (tx) => {
      const rows = await tx.delete(likes).where(eq(likes.id, id)).output();
      const deleted = rows[0];
      if (deleted) {
        await tx
          .update(reviews)
          .set({
            likeCount: sql`CASE WHEN ${reviews.likeCount} > 0 THEN ${reviews.likeCount} - 1 ELSE 0 END`,
          })
          .where(eq(reviews.id, deleted.reviewId));
      }
      return deleted;
    });
  }

  async findFlags(status?: string) {
    const db = await getDb();
    return db
      .select()
      .from(flags)
      .where(status === undefined ? undefined : eq(flags.status, status))
      .orderBy(flags.id);
  }

  async updateFlagStatus(id: number, status: 'pending' | 'resolved' | 'dismissed') {
    const db = await getDb();
    const rows = await db
      .update(flags)
      .set({ status })
      .where(eq(flags.id, id))
      .output();
    return rows[0];
  }

  async findAuditLogs(userId?: number, targetTable?: string) {
    const db = await getDb();
    const conditions: SQL[] = [];
    if (userId !== undefined) conditions.push(eq(auditLogs.userId, userId));
    if (targetTable !== undefined) conditions.push(eq(auditLogs.targetTable, targetTable));
    return db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(auditLogs.id);
  }

  async createAuditLog(input: AuditLogInput) {
    const db = await getDb();
    const rows = await db.insert(auditLogs).output().values({
      userId: input.userId,
      action: input.action,
      targetTable: input.targetTable,
      targetId: input.targetId,
      metadata: input.metadata ?? null,
    });
    return rows[0];
  }
}
