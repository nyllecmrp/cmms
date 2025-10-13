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
        createPMScheduleDto.frequencyValue || null,
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
    await this.db.execute('DELETE FROM PMSchedule WHERE id = ?', [id]);
    return { id };
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
