import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ModuleLicensingService } from './module-licensing.service';
import { DataArchivalService } from './data-archival.service';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ModuleExpirationScheduler {
  private readonly logger = new Logger(ModuleExpirationScheduler.name);

  constructor(
    private moduleLicensingService: ModuleLicensingService,
    private dataArchivalService: DataArchivalService,
    private db: DatabaseService,
  ) {}

  /**
   * Run daily at 2 AM - Check for expiring modules and send notifications
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleModuleExpirationNotifications() {
    this.logger.log('Running module expiration notifications check...');

    try {
      // Get modules expiring in 30 days
      const expiring30Days = await this.moduleLicensingService.getExpiringModules(30);

      // Get modules expiring in 14 days
      const expiring14Days = await this.moduleLicensingService.getExpiringModules(14);

      // Get modules expiring in 7 days
      const expiring7Days = await this.moduleLicensingService.getExpiringModules(7);

      // Send notifications
      for (const module of expiring30Days) {
        await this.sendExpirationNotification(module, 30);
      }

      for (const module of expiring14Days) {
        await this.sendExpirationNotification(module, 14);
      }

      for (const module of expiring7Days) {
        await this.sendExpirationNotification(module, 7);
      }

      this.logger.log(`Sent expiration notifications for ${expiring30Days.length + expiring14Days.length + expiring7Days.length} modules`);
    } catch (error) {
      this.logger.error('Failed to send expiration notifications:', error);
    }
  }

  /**
   * Run daily at 3 AM - Auto-expire modules past grace period
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleModuleExpiration() {
    this.logger.log('Running module expiration check...');

    try {
      await this.moduleLicensingService.expireModulesPastGracePeriod();
      this.logger.log('Successfully expired modules past grace period');
    } catch (error) {
      this.logger.error('Failed to expire modules:', error);
    }
  }

  /**
   * Run weekly on Sunday at 4 AM - Archive data from expired modules
   */
  @Cron('0 4 * * 0') // Every Sunday at 4 AM
  async handleDataArchival() {
    this.logger.log('Running data archival for expired modules...');

    try {
      // Get all expired modules
      const expiredModules = await this.db.query(
        `SELECT DISTINCT ml.organizationId, ml.moduleCode
        FROM ModuleLicense ml
        WHERE ml.status = 'expired'
        AND NOT EXISTS (
          SELECT 1 FROM DataArchive da
          WHERE da.organizationId = ml.organizationId
          AND da.moduleCode = ml.moduleCode
          AND da.status = 'archived'
        )`
      );

      let archivedCount = 0;

      for (const module of expiredModules) {
        const result = await this.dataArchivalService.archiveModuleData(
          module.organizationId,
          module.moduleCode,
          90, // 90-day retention
        );
        archivedCount += result.archivedCount;
      }

      this.logger.log(`Archived ${archivedCount} records from ${expiredModules.length} expired modules`);
    } catch (error) {
      this.logger.error('Failed to archive module data:', error);
    }
  }

  /**
   * Run monthly on 1st at 5 AM - Delete expired archives
   */
  @Cron('0 5 1 * *') // 1st of every month at 5 AM
  async handleExpiredArchiveDeletion() {
    this.logger.log('Running expired archive deletion...');

    try {
      const result = await this.dataArchivalService.deleteExpiredArchives();
      this.logger.log(`Deleted ${result.deletedCount} expired archive records`);
    } catch (error) {
      this.logger.error('Failed to delete expired archives:', error);
    }
  }

  /**
   * Send expiration notification to organization admins
   */
  private async sendExpirationNotification(module: any, daysUntilExpiration: number) {
    try {
      // Get organization admins
      const admins = await this.db.query(
        `SELECT u.* FROM User u
        WHERE u.organizationId = ?
        AND u.roleId = 'admin'`,
        [module.organizationId]
      );

      // Create notification record
      for (const admin of admins) {
        const notificationId = require('crypto').randomBytes(16).toString('hex');

        await this.db.execute(
          `INSERT INTO Notification (
            id, userId, title, message, type, isRead, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [
            notificationId,
            admin.id,
            `Module Expiring Soon`,
            `Your ${module.moduleCode} module license will expire in ${daysUntilExpiration} days. Please renew to maintain access.`,
            'warning',
            0,
          ]
        );
      }

      // TODO: Send email notification
      // await this.emailService.sendModuleExpirationEmail(admins, module, daysUntilExpiration);

      this.logger.debug(
        `Sent expiration notification for ${module.moduleCode} in ${module.organizationName} (${daysUntilExpiration} days)`
      );
    } catch (error) {
      this.logger.error(`Failed to send notification for module ${module.moduleCode}:`, error);
    }
  }

  /**
   * Manual trigger for testing - check modules expiring soon
   */
  async triggerExpirationCheck() {
    await this.handleModuleExpirationNotifications();
  }

  /**
   * Manual trigger for testing - expire modules
   */
  async triggerModuleExpiration() {
    await this.handleModuleExpiration();
  }

  /**
   * Manual trigger for testing - archive data
   */
  async triggerDataArchival() {
    await this.handleDataArchival();
  }
}
