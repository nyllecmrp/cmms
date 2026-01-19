import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreatePMScheduleDto {
  organizationId: string;
  name: string;
  description?: string;
  assetId?: string;
  frequency: string;
  frequencyValue?: number;
  priority?: string;
  assignedToId?: string;
  lastCompleted?: string;
  nextDue: string;
  tasks?: string;
  parts?: string;
  estimatedHours?: number;
  createdById: string;
}

export interface UpdatePMScheduleDto {
  name?: string;
  description?: string;
  assetId?: string;
  frequency?: string;
  frequencyValue?: number;
  priority?: string;
  status?: string;
  assignedToId?: string;
  lastCompleted?: string;
  nextDue?: string;
  tasks?: string;
  parts?: string;
  estimatedHours?: number;
}

@Injectable()
export class PMSchedulesService {
  constructor(private db: DatabaseService) {}

  async create(createPMScheduleDto: CreatePMScheduleDto) {
    // Validate required fields
    if (!createPMScheduleDto.name || createPMScheduleDto.name.trim() === '') {
      throw new Error('PM Schedule Name is required.');
    }

    if (!createPMScheduleDto.frequency || createPMScheduleDto.frequency.trim() === '') {
      throw new Error('Frequency is required.');
    }

    if (!createPMScheduleDto.nextDue || createPMScheduleDto.nextDue.trim() === '') {
      throw new Error('Next Due Date is required.');
    }

    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO PMSchedule (
        id, organizationId, name, description, assetId, frequency, frequencyValue,
        priority, status, assignedToId, lastCompleted, nextDue, tasks, parts,
        estimatedHours, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        createPMScheduleDto.organizationId,
        createPMScheduleDto.name,
        createPMScheduleDto.description || null,
        createPMScheduleDto.assetId || null,
        createPMScheduleDto.frequency,
        createPMScheduleDto.frequencyValue || 1,
        createPMScheduleDto.priority || 'medium',
        'active',
        createPMScheduleDto.assignedToId || null,
        createPMScheduleDto.lastCompleted || null,
        createPMScheduleDto.nextDue,
        createPMScheduleDto.tasks || null,
        createPMScheduleDto.parts || null,
        createPMScheduleDto.estimatedHours || null,
        createPMScheduleDto.createdById,
      ]
    );

    // Fetch the created PM schedule with relations
    const schedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      LEFT JOIN User creator ON pm.createdById = creator.id
      WHERE pm.id = ?`,
      [id]
    );

    return this.formatPMScheduleWithRelations(schedules[0]);
  }

  async findAll(organizationId: string) {
    const schedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      LEFT JOIN User creator ON pm.createdById = creator.id
      WHERE pm.organizationId = ?
      ORDER BY pm.nextDue ASC`,
      [organizationId]
    );

    return schedules.map(schedule => this.formatPMScheduleWithRelations(schedule));
  }

  async findOne(id: string) {
    const schedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      LEFT JOIN User creator ON pm.createdById = creator.id
      WHERE pm.id = ?`,
      [id]
    );

    if (schedules.length === 0) {
      return null;
    }

    return this.formatPMScheduleWithRelations(schedules[0]);
  }

  async update(id: string, updatePMScheduleDto: UpdatePMScheduleDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (updatePMScheduleDto.name !== undefined) {
      updates.push('name = ?');
      values.push(updatePMScheduleDto.name);
    }
    if (updatePMScheduleDto.description !== undefined) {
      updates.push('description = ?');
      values.push(updatePMScheduleDto.description);
    }
    if (updatePMScheduleDto.assetId !== undefined) {
      updates.push('assetId = ?');
      values.push(updatePMScheduleDto.assetId);
    }
    if (updatePMScheduleDto.frequency !== undefined) {
      updates.push('frequency = ?');
      values.push(updatePMScheduleDto.frequency);
    }
    if (updatePMScheduleDto.frequencyValue !== undefined) {
      updates.push('frequencyValue = ?');
      values.push(updatePMScheduleDto.frequencyValue);
    }
    if (updatePMScheduleDto.priority !== undefined) {
      updates.push('priority = ?');
      values.push(updatePMScheduleDto.priority);
    }
    if (updatePMScheduleDto.status !== undefined) {
      updates.push('status = ?');
      values.push(updatePMScheduleDto.status);
    }
    if (updatePMScheduleDto.assignedToId !== undefined) {
      updates.push('assignedToId = ?');
      values.push(updatePMScheduleDto.assignedToId);
    }
    if (updatePMScheduleDto.lastCompleted !== undefined) {
      updates.push('lastCompleted = ?');
      values.push(updatePMScheduleDto.lastCompleted);
    }
    if (updatePMScheduleDto.nextDue !== undefined) {
      updates.push('nextDue = ?');
      values.push(updatePMScheduleDto.nextDue);
    }
    if (updatePMScheduleDto.tasks !== undefined) {
      updates.push('tasks = ?');
      values.push(updatePMScheduleDto.tasks);
    }
    if (updatePMScheduleDto.parts !== undefined) {
      updates.push('parts = ?');
      values.push(updatePMScheduleDto.parts);
    }
    if (updatePMScheduleDto.estimatedHours !== undefined) {
      updates.push('estimatedHours = ?');
      values.push(updatePMScheduleDto.estimatedHours);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE PMSchedule SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch the updated PM schedule with relations
    const schedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      LEFT JOIN User creator ON pm.createdById = creator.id
      WHERE pm.id = ?`,
      [id]
    );

    return this.formatPMScheduleWithRelations(schedules[0]);
  }

  async remove(id: string) {
    try {
      // Delete all related records in the correct order to avoid foreign key constraints

      // 1. Delete work orders associated with this PM schedule
      await this.db.execute('DELETE FROM WorkOrder WHERE pmScheduleId = ?', [id]);

      // 2. Delete maintenance schedule entries associated with this PM schedule
      await this.db.execute('DELETE FROM MaintenanceSchedule WHERE pmScheduleId = ?', [id]);

      // 3. Delete associated purchase requests
      await this.db.execute('DELETE FROM PurchaseRequest WHERE pmScheduleId = ?', [id]);

      // 4. Finally delete the PM schedule itself
      await this.db.execute('DELETE FROM PMSchedule WHERE id = ?', [id]);

      return { id };
    } catch (error) {
      console.error('Error deleting PM schedule:', error);
      throw new Error(`Failed to delete PM schedule: ${error.message}`);
    }
  }

  async getStats(organizationId: string) {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalResult = await this.db.query(
      'SELECT COUNT(*) as count FROM PMSchedule WHERE organizationId = ?',
      [organizationId]
    );

    const dueSoonResult = await this.db.query(
      `SELECT COUNT(*) as count FROM PMSchedule
      WHERE organizationId = ?
      AND nextDue >= ?
      AND nextDue <= ?
      AND status != 'completed'`,
      [organizationId, now.toISOString(), sevenDaysLater.toISOString()]
    );

    const overdueResult = await this.db.query(
      `SELECT COUNT(*) as count FROM PMSchedule
      WHERE organizationId = ?
      AND nextDue < ?
      AND status != 'completed'`,
      [organizationId, now.toISOString()]
    );

    const completedThisMonthResult = await this.db.query(
      `SELECT COUNT(*) as count FROM PMSchedule
      WHERE organizationId = ?
      AND lastCompleted >= ?
      AND lastCompleted < ?`,
      [organizationId, monthStart.toISOString(), monthEnd.toISOString()]
    );

    return {
      total: totalResult[0].count,
      dueSoon: dueSoonResult[0].count,
      overdue: overdueResult[0].count,
      completedThisMonth: completedThisMonthResult[0].count,
    };
  }

  async generateWorkOrder(pmScheduleId: string, userId: string) {
    // Fetch PM schedule details
    const schedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      WHERE pm.id = ?`,
      [pmScheduleId]
    );

    if (!schedules || schedules.length === 0) {
      throw new Error('PM Schedule not found');
    }

    const pmSchedule = schedules[0];

    // DUPLICATE PREVENTION: Check if a WO already exists for this PM's current cycle
    // A cycle is defined by the nextDue date - only one WO should exist per due date
    const existingWO = await this.db.query(
      `SELECT wo.id, wo.workOrderNumber, wo.status
       FROM WorkOrder wo
       WHERE wo.notes LIKE ?
         AND wo.scheduledStart = ?
         AND wo.organizationId = ?
       ORDER BY wo.createdAt DESC
       LIMIT 1`,
      [
        `%Generated from PM Schedule: ${pmSchedule.name}%`,
        pmSchedule.nextDue || new Date().toISOString().split('T')[0],
        pmSchedule.organizationId
      ]
    );

    if (existingWO && existingWO.length > 0) {
      const existing = existingWO[0];
      throw new Error(
        `Work Order already exists for this PM cycle. ` +
        `WO Number: ${existing.workOrderNumber}, Status: ${existing.status}. ` +
        `Please complete or delete the existing work order before generating a new one.`
      );
    }

    // Generate unique work order number with format WO-YEAR-NUMBER
    const currentYear = new Date().getFullYear();
    const existingWOs = await this.db.query(
      `SELECT workOrderNumber FROM WorkOrder
       WHERE organizationId = ? AND workOrderNumber LIKE ?
       ORDER BY workOrderNumber DESC LIMIT 1`,
      [pmSchedule.organizationId, `WO-${currentYear}-%`]
    );

    let nextNumber = 1;
    if (existingWOs.length > 0 && existingWOs[0].workOrderNumber) {
      const parts = existingWOs[0].workOrderNumber.split('-');
      if (parts.length >= 3) {
        nextNumber = parseInt(parts[2]) + 1;
      }
    }

    const woNumber = `WO-${currentYear}-${String(nextNumber).padStart(3, '0')}`;

    // Create work order from PM schedule
    const workOrderId = randomBytes(16).toString('hex');
    const now = new Date();
    const scheduledStart = pmSchedule.nextDue || now.toISOString().split('T')[0];

    await this.db.execute(
      `INSERT INTO WorkOrder (
        id, workOrderNumber, title, description, type, priority, status,
        assetId, assignedToId, scheduledStart, estimatedHours,
        notes, organizationId, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        workOrderId,
        woNumber,
        pmSchedule.name,
        pmSchedule.description || `Preventive maintenance task: ${pmSchedule.name}`,
        'preventive',
        pmSchedule.priority || 'medium',
        'open',
        pmSchedule.assetId || null,
        pmSchedule.assignedToId || null,
        scheduledStart,
        pmSchedule.estimatedHours || null,
        `Generated from PM Schedule: ${pmSchedule.name}`,
        pmSchedule.organizationId,
        userId,
      ]
    );

    // Update PM schedule lastCompleted date
    await this.db.execute(
      `UPDATE PMSchedule SET lastCompleted = datetime('now'), updatedAt = datetime('now') WHERE id = ?`,
      [pmScheduleId]
    );

    // Fetch created work order
    const workOrders = await this.db.query(
      `SELECT
        wo.*,
        a.name as asset_name,
        assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName
      FROM WorkOrder wo
      LEFT JOIN Asset a ON wo.assetId = a.id
      LEFT JOIN User assigned ON wo.assignedToId = assigned.id
      WHERE wo.id = ?`,
      [workOrderId]
    );

    return {
      success: true,
      workOrder: workOrders[0],
      workOrderNumber: woNumber,
    };
  }

  async updateStatus(id: string, status: string) {
    await this.db.execute(
      `UPDATE PMSchedule SET status = ?, updatedAt = datetime('now') WHERE id = ?`,
      [status, id]
    );

    // Fetch the updated PM schedule with relations
    const schedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      LEFT JOIN User creator ON pm.createdById = creator.id
      WHERE pm.id = ?`,
      [id]
    );

    return this.formatPMScheduleWithRelations(schedules[0]);
  }

  private calculateNextDueDate(frequency: string, frequencyValue: number = 1, fromDate?: Date): string {
    const baseDate = fromDate || new Date();
    const nextDue = new Date(baseDate);

    switch (frequency) {
      case 'Daily':
        nextDue.setDate(nextDue.getDate() + (frequencyValue || 1));
        break;
      case 'Weekly':
        nextDue.setDate(nextDue.getDate() + (7 * (frequencyValue || 1)));
        break;
      case 'Monthly':
        nextDue.setMonth(nextDue.getMonth() + (frequencyValue || 1));
        break;
      case 'Quarterly':
        nextDue.setMonth(nextDue.getMonth() + (3 * (frequencyValue || 1)));
        break;
      case 'Semi-Annually':
        nextDue.setMonth(nextDue.getMonth() + (6 * (frequencyValue || 1)));
        break;
      case 'Annually':
        nextDue.setFullYear(nextDue.getFullYear() + (frequencyValue || 1));
        break;
      case 'Custom':
        // For custom frequencies, frequencyValue represents days
        nextDue.setDate(nextDue.getDate() + (frequencyValue || 1));
        break;
      default:
        // Default to monthly if unknown
        nextDue.setMonth(nextDue.getMonth() + 1);
    }

    return nextDue.toISOString().split('T')[0];
  }

  async completePM(id: string) {
    // Fetch current PM schedule
    const schedules = await this.db.query(
      `SELECT * FROM PMSchedule WHERE id = ?`,
      [id]
    );

    if (!schedules || schedules.length === 0) {
      throw new Error('PM Schedule not found');
    }

    const pmSchedule = schedules[0];
    const now = new Date();
    const nextDue = this.calculateNextDueDate(
      pmSchedule.frequency,
      pmSchedule.frequencyValue,
      now
    );

    // Update PM schedule with completion date and new next due date
    await this.db.execute(
      `UPDATE PMSchedule
       SET lastCompleted = datetime('now'),
           nextDue = ?,
           updatedAt = datetime('now')
       WHERE id = ?`,
      [nextDue, id]
    );

    // Fetch the updated PM schedule with relations
    const updatedSchedules = await this.db.query(
      `SELECT
        pm.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        assigned.id as assignedTo_id, assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName, assigned.email as assignedTo_email,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
      FROM PMSchedule pm
      LEFT JOIN Asset a ON pm.assetId = a.id
      LEFT JOIN User assigned ON pm.assignedToId = assigned.id
      LEFT JOIN User creator ON pm.createdById = creator.id
      WHERE pm.id = ?`,
      [id]
    );

    return {
      success: true,
      pmSchedule: this.formatPMScheduleWithRelations(updatedSchedules[0]),
      oldNextDue: pmSchedule.nextDue,
      newNextDue: nextDue,
    };
  }

  private formatPMScheduleWithRelations(row: any) {
    if (!row) return null;

    const schedule: any = {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      description: row.description,
      assetId: row.assetId,
      frequency: row.frequency,
      frequencyValue: row.frequencyValue,
      priority: row.priority,
      status: row.status,
      assignedToId: row.assignedToId,
      lastCompleted: row.lastCompleted,
      nextDue: row.nextDue,
      tasks: row.tasks,
      parts: row.parts,
      estimatedHours: row.estimatedHours,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    if (row.asset_id) {
      schedule.asset = {
        id: row.asset_id,
        name: row.asset_name,
        assetNumber: row.asset_assetNumber,
      };
    }

    if (row.assignedTo_id) {
      schedule.assignedTo = {
        id: row.assignedTo_id,
        firstName: row.assignedTo_firstName,
        lastName: row.assignedTo_lastName,
        email: row.assignedTo_email,
      };
    }

    if (row.createdBy_id) {
      schedule.createdBy = {
        id: row.createdBy_id,
        firstName: row.createdBy_firstName,
        lastName: row.createdBy_lastName,
      };
    }

    return schedule;
  }
}
