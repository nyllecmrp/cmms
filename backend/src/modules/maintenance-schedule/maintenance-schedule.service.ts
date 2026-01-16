import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface GenerateScheduleDto {
  assetId: string;
  year: number;
  parts: Array<{
    assetPartId: string;
    partNumber: string;
    partName: string;
    frequencyPM?: string;
    frequencyAM?: string;
    maintenanceTimeMinutes?: number;
  }>;
}

@Injectable()
export class MaintenanceScheduleService {
  constructor(private db: DatabaseService) {}

  /**
   * Get maintenance schedule for an asset and year
   */
  async getSchedule(assetId: string, year: number) {
    const schedule = await this.db.query(
      `SELECT
        ms.*,
        ap.partNumber,
        ap.partName
       FROM MaintenanceSchedule ms
       LEFT JOIN AssetPart ap ON ms.assetPartId = ap.id
       WHERE ms.assetId = ? AND ms.year = ?
       ORDER BY ms.weekNumber, ms.maintenanceType`,
      [assetId, year]
    );

    return schedule;
  }

  /**
   * Generate maintenance schedule based on component frequencies
   */
  async generateSchedule(data: GenerateScheduleDto) {
    const { assetId, year, parts } = data;

    // Clear existing schedule for this year
    await this.db.execute(
      'DELETE FROM MaintenanceSchedule WHERE assetId = ? AND year = ?',
      [assetId, year]
    );

    const tasksToCreate: any[] = [];

    for (const part of parts) {
      // Generate PM tasks based on frequency
      if (part.frequencyPM) {
        const pmTasks = this.calculateWeeksFromFrequency(part.frequencyPM, year);
        pmTasks.forEach(week => {
          tasksToCreate.push({
            id: randomBytes(16).toString('hex'),
            assetPartId: part.assetPartId,
            assetId,
            weekNumber: week,
            year,
            maintenanceType: 'PM',
            status: 'planned',
            partNumber: part.partNumber,
            partName: part.partName,
          });
        });
      }

      // Generate AM tasks based on frequency
      if (part.frequencyAM) {
        const amTasks = this.calculateWeeksFromFrequency(part.frequencyAM, year);
        amTasks.forEach(week => {
          tasksToCreate.push({
            id: randomBytes(16).toString('hex'),
            assetPartId: part.assetPartId,
            assetId,
            weekNumber: week,
            year,
            maintenanceType: 'AM',
            status: 'planned',
            partNumber: part.partNumber,
            partName: part.partName,
          });
        });
      }
    }

    // Insert all tasks
    for (const task of tasksToCreate) {
      await this.db.execute(
        `INSERT INTO MaintenanceSchedule (
          id, assetPartId, assetId, organizationId, weekNumber, year, maintenanceType, partNumber, partName, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, 'org-test-1', ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          task.id,
          task.assetPartId,
          task.assetId,
          task.weekNumber,
          task.year,
          task.maintenanceType,
          task.partNumber,
          task.partName,
          task.status,
        ]
      );
    }

    return { success: true, tasksCreated: tasksToCreate.length };
  }

  /**
   * Calculate week numbers from frequency string (e.g., "3M" = every 3 months)
   */
  private calculateWeeksFromFrequency(frequency: string, year: number): number[] {
    const weeks: number[] = [];

    // Parse frequency: 1W, 2W, M, 3M, 6M, 12M, 24M
    if (frequency === '1W') {
      // Every week
      for (let i = 1; i <= 52; i++) weeks.push(i);
    } else if (frequency === '2W') {
      // Every 2 weeks
      for (let i = 1; i <= 52; i += 2) weeks.push(i);
    } else if (frequency === 'M' || frequency === '1M') {
      // Monthly (every 4 weeks)
      for (let i = 1; i <= 52; i += 4) weeks.push(i);
    } else if (frequency === '3M') {
      // Quarterly (every 13 weeks)
      weeks.push(1, 14, 27, 40);
    } else if (frequency === '6M') {
      // Semi-annually (every 26 weeks)
      weeks.push(1, 27);
    } else if (frequency === '12M') {
      // Annually (week 1)
      weeks.push(1);
    } else if (frequency === '24M') {
      // Biennial - only if current year
      if (year % 2 === 0) weeks.push(1);
    }

    return weeks;
  }

  /**
   * Update a maintenance task
   */
  async updateTask(taskId: string, updates: { status?: string; completedDate?: string; notes?: string }) {
    const setParts: string[] = [];
    const values: any[] = [];

    if (updates.status) {
      setParts.push('status = ?');
      values.push(updates.status);
    }
    if (updates.completedDate !== undefined) {
      setParts.push('completedDate = ?');
      values.push(updates.completedDate);
    }
    if (updates.notes !== undefined) {
      setParts.push('notes = ?');
      values.push(updates.notes);
    }

    setParts.push("updatedAt = datetime('now')");
    values.push(taskId);

    await this.db.execute(
      `UPDATE MaintenanceSchedule SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );

    return { success: true };
  }

  /**
   * Delete a maintenance task
   */
  async deleteTask(taskId: string) {
    await this.db.execute('DELETE FROM MaintenanceSchedule WHERE id = ?', [taskId]);
    return { success: true };
  }
}
