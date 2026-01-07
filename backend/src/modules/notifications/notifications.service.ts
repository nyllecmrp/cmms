import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a notification
   */
  async create(dto: CreateNotificationDto) {
    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO Notification (
        id, userId, title, message, type, link, metadata, isRead, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        id,
        dto.userId,
        dto.title,
        dto.message,
        dto.type,
        dto.link || null,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        0, // isRead = false
      ]
    );

    const notifications = await this.db.query(
      'SELECT * FROM Notification WHERE id = ?',
      [id]
    );

    return notifications[0];
  }

  /**
   * Get notifications for a user
   */
  async findByUser(userId: string, unreadOnly: boolean = false) {
    let query = 'SELECT * FROM Notification WHERE userId = ?';
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ' AND isRead = 0';
    }

    query += ' ORDER BY createdAt DESC LIMIT 50';

    const notifications = await this.db.query(query, params);
    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    await this.db.execute(
      `UPDATE Notification SET isRead = 1, updatedAt = datetime('now')
      WHERE id = ?`,
      [id]
    );

    const notifications = await this.db.query(
      'SELECT * FROM Notification WHERE id = ?',
      [id]
    );

    return notifications[0];
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await this.db.execute(
      `UPDATE Notification SET isRead = 1, updatedAt = datetime('now')
      WHERE userId = ? AND isRead = 0`,
      [userId]
    );

    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Delete a notification
   */
  async delete(id: string) {
    await this.db.execute('DELETE FROM Notification WHERE id = ?', [id]);
    return { success: true, message: 'Notification deleted' };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND isRead = 0',
      [userId]
    );

    return result[0]?.count || 0;
  }

  /**
   * Create module expiration notification
   */
  async createModuleExpirationNotification(
    userId: string,
    moduleName: string,
    daysUntilExpiration: number,
    organizationId: string,
  ) {
    return this.create({
      userId,
      title: 'Module Expiring Soon',
      message: `Your ${moduleName} module license will expire in ${daysUntilExpiration} ${
        daysUntilExpiration === 1 ? 'day' : 'days'
      }. Please renew to maintain access.`,
      type: 'warning',
      link: '/dashboard/modules',
      metadata: {
        moduleExpiration: true,
        daysRemaining: daysUntilExpiration,
        organizationId,
      },
    });
  }

  /**
   * Create module expired notification
   */
  async createModuleExpiredNotification(
    userId: string,
    moduleName: string,
    gracePeriodDays: number,
  ) {
    return this.create({
      userId,
      title: 'Module License Expired',
      message: `Your ${moduleName} module license has expired. You have ${gracePeriodDays} days of read-only access remaining. Please renew to restore full access.`,
      type: 'error',
      link: '/dashboard/modules',
      metadata: {
        moduleExpired: true,
        gracePeriodDays,
      },
    });
  }

  /**
   * Create trial started notification
   */
  async createTrialStartedNotification(
    userId: string,
    moduleName: string,
    trialDays: number,
  ) {
    return this.create({
      userId,
      title: 'Trial Activated',
      message: `Your ${trialDays}-day free trial for ${moduleName} is now active! Explore all features and see how it can help your organization.`,
      type: 'success',
      link: '/dashboard/modules',
      metadata: {
        trialStarted: true,
        trialDays,
      },
    });
  }

  /**
   * Create trial ending notification
   */
  async createTrialEndingNotification(
    userId: string,
    moduleName: string,
    daysRemaining: number,
  ) {
    return this.create({
      userId,
      title: 'Trial Ending Soon',
      message: `Your free trial for ${moduleName} will end in ${daysRemaining} ${
        daysRemaining === 1 ? 'day' : 'days'
      }. Upgrade now to continue using this module.`,
      type: 'warning',
      link: '/dashboard/modules',
      metadata: {
        trialEnding: true,
        daysRemaining,
      },
    });
  }

  /**
   * Create module activated notification
   */
  async createModuleActivatedNotification(
    userId: string,
    moduleName: string,
  ) {
    return this.create({
      userId,
      title: 'Module Activated',
      message: `The ${moduleName} module has been activated for your organization. You can now access all its features!`,
      type: 'success',
      link: '/dashboard/modules',
      metadata: {
        moduleActivated: true,
      },
    });
  }

  /**
   * Send bulk notifications to organization admins
   */
  async notifyOrganizationAdmins(
    organizationId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    link?: string,
  ) {
    // Get all admins for the organization
    const admins = await this.db.query(
      `SELECT id FROM User
      WHERE organizationId = ?
      AND roleId IN ('admin', 'super_admin')`,
      [organizationId]
    );

    const notifications: any[] = [];

    for (const admin of admins) {
      const notification = await this.create({
        userId: admin.id,
        title,
        message,
        type,
        link,
      });
      notifications.push(notification);
    }

    return notifications;
  }
}
