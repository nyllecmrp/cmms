import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PMSchedulesService } from './pm-schedules.service';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PMSchedulesSchedulerService {
  private readonly logger = new Logger(PMSchedulesSchedulerService.name);

  constructor(
    private readonly pmSchedulesService: PMSchedulesService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Runs every day at 1:00 AM
   * Checks for PM schedules due today and auto-generates work orders
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async autoGenerateWorkOrders() {
    this.logger.log('🔄 Starting auto-generation of work orders for PMs due today...');

    try {
      const today = new Date().toISOString().split('T')[0];

      // Find all PM schedules due today
      const pmsDueToday = await this.db.query(
        `SELECT
          pm.*,
          o.id as org_id,
          u.id as user_id, u.firstName as user_firstName, u.lastName as user_lastName
        FROM PMSchedule pm
        JOIN Organization o ON pm.organizationId = o.id
        LEFT JOIN User u ON pm.createdById = u.id
        WHERE pm.nextDue = ?
          AND pm.status = 'active'`,
        [today]
      );

      if (!pmsDueToday || pmsDueToday.length === 0) {
        this.logger.log('✅ No PMs due today. Skipping auto-generation.');
        return;
      }

      this.logger.log(`📋 Found ${pmsDueToday.length} PM(s) due today. Generating work orders...`);

      let successCount = 0;
      let errorCount = 0;

      for (const pm of pmsDueToday) {
        try {
          // Use a system user or the PM creator to generate the WO
          const userId = pm.createdById || pm.user_id;

          if (!userId) {
            this.logger.warn(`⚠️ Skipping PM "${pm.name}" (${pm.id}) - No user ID found`);
            errorCount++;
            continue;
          }

          const result = await this.pmSchedulesService.generateWorkOrder(pm.id, userId);

          this.logger.log(
            `✅ Generated WO ${result.workOrderNumber} for PM "${pm.name}" (${pm.id})`
          );

          successCount++;
        } catch (error) {
          // Check if it's a duplicate error (expected) or a real error
          if (error.message.includes('Work Order already exists')) {
            this.logger.log(
              `⏭️ Skipped PM "${pm.name}" (${pm.id}) - ${error.message}`
            );
          } else {
            this.logger.error(
              `❌ Failed to generate WO for PM "${pm.name}" (${pm.id}):`,
              error.message
            );
          }
          errorCount++;
        }
      }

      this.logger.log(
        `🎉 Auto-generation complete: ${successCount} successful, ${errorCount} failed`
      );
    } catch (error) {
      this.logger.error('❌ Error in auto-generation cron job:', error.message);
    }
  }

  /**
   * Manual trigger for testing (can be called via endpoint)
   */
  async manualTrigger() {
    this.logger.log('🔧 Manual trigger requested for auto-generation...');
    await this.autoGenerateWorkOrders();
  }
}
