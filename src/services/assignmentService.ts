
import {
  AssignmentRepository,
  type AuditLogInput,
  type LikeInput,
  type MenuItemInput,
  type ReviewInput,
  type UserInput,
} from '../repositories/assignmentRepository.ts';

export class AssignmentService {
  constructor(
    private repository: AssignmentRepository = new AssignmentRepository()
  ) {}

  getUsers() {
    return this.repository.findUsers();
  }

  async createUser(input: UserInput) {
    const user = await this.repository.createUser(input);
    if (!user) throw new Error('USER_CREATE_FAILED');
    return user;
  }

  getMenuItems(stallId?: number) {
    return this.repository.findMenuItems(stallId);
  }

  async getMenuItem(id: number) {
    const item = await this.repository.findMenuItemById(id);
    if (!item) throw new Error('MENU_ITEM_NOT_FOUND');
    return item;
  }

  async createMenuItem(input: MenuItemInput) {
    const item = await this.repository.createMenuItem(input);
    if (!item) throw new Error('MENU_ITEM_CREATE_FAILED');
    return item;
  }

  async updateMenuItem(
    id: number,
    input: Partial<MenuItemInput>
  ) {
    const item = await this.repository.updateMenuItem(id, input);
    if (!item) throw new Error('MENU_ITEM_NOT_FOUND');
    return item;
  }

  async deleteMenuItem(id: number) {
    const item = await this.repository.deleteMenuItem(id);
    if (!item) throw new Error('MENU_ITEM_NOT_FOUND');
    return item;
  }

  getReviews(stallId?: number) {
    return this.repository.findReviews(stallId);
  }

  async createReview(input: ReviewInput) {
    const review = await this.repository.createReview(input);
    if (!review) throw new Error('REVIEW_CREATE_FAILED');
    return review;
  }

  async deleteReview(id: number) {
    const review = await this.repository.deleteReview(id);
    if (!review) throw new Error('REVIEW_NOT_FOUND');
    return review;
  }

  async createLike(input: LikeInput) {
    const like = await this.repository.createLike(input);
    if (!like) throw new Error('LIKE_CREATE_FAILED');
    return like;
  }

  async deleteLike(
    id: number,
    userId: number,
    role: 'admin' | 'owner' | 'customer'
  ) {
    const existing = await this.repository.findLikeById(id);

    if (!existing) {
      throw new Error('LIKE_NOT_FOUND');
    }

    const isAdmin = role === 'admin';

    if (!isAdmin && existing.userId !== userId) {
      throw new Error('LIKE_FORBIDDEN');
    }

    const deleted = await this.repository.deleteLike(
      id,
      userId,
      isAdmin
    );

    if (!deleted) {
      throw new Error('LIKE_NOT_FOUND');
    }

    return deleted;
  }

  getFlags(status?: string) {
    return this.repository.findFlags(status);
  }

  async updateFlagStatus(
    id: number,
    status: 'pending' | 'resolved' | 'dismissed'
  ) {
    const flag = await this.repository.updateFlagStatus(
      id,
      status
    );

    if (!flag) throw new Error('FLAG_NOT_FOUND');
    return flag;
  }

  getAuditLogs(
    userId?: number,
    targetTable?: string
  ) {
    return this.repository.findAuditLogs(
      userId,
      targetTable
    );
  }

  async createAuditLog(input: AuditLogInput) {
    const auditLog = await this.repository.createAuditLog(
      input
    );

    if (!auditLog) throw new Error('AUDIT_LOG_CREATE_FAILED');
    return auditLog;
  }
}
