import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreateWorkOrderDto {
  workOrderNumber: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  assetId?: string;
  assignedToId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedHours?: number;
  notes?: string;
  customFields?: string;
  organizationId: string;
  createdById: string;
}

export interface UpdateWorkOrderDto {
  workOrderNumber?: string;
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  assetId?: string;
  assignedToId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedHours?: number;
  actualHours?: number;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  notes?: string;
  customFields?: string;
}

@Injectable()
export class WorkOrdersService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateWorkOrderDto) {
    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO WorkOrder (
        id, workOrderNumber, title, description, type, priority, status,
        assetId, assignedToId, scheduledStart, scheduledEnd, estimatedHours,
        notes, customFields, organizationId, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.workOrderNumber,
        data.title,
        data.description || null,
        data.type || 'corrective',
        data.priority || 'medium',
        data.status || 'open',
        data.assetId || null,
        data.assignedToId || null,
        data.scheduledStart || null,
        data.scheduledEnd || null,
        data.estimatedHours || null,
        data.notes || null,
        data.customFields || null,
        data.organizationId,
        data.createdById,
      ]
    );

    // Fetch the created work order with relations
    const workOrders = await this.db.query(
      `SELECT
        w.*,
        a.id as asset_id, a.assetNumber as asset_assetNumber, a.name as asset_name,
        assigned.id as assignedTo_id, assigned.email as assignedTo_email,
        assigned.firstName as assignedTo_firstName, assigned.lastName as assignedTo_lastName,
        creator.id as createdBy_id, creator.email as createdBy_email,
        creator.firstName as createdBy_firstName, creator.lastName as createdBy_lastName
      FROM WorkOrder w
      LEFT JOIN Asset a ON w.assetId = a.id
      LEFT JOIN User assigned ON w.assignedToId = assigned.id
      LEFT JOIN User creator ON w.createdById = creator.id
      WHERE w.id = ?`,
      [id]
    );

    return this.formatWorkOrderWithRelations(workOrders[0]);
  }

  async findAll(organizationId: string) {
    const workOrders = await this.db.query(
      `SELECT
        w.*,
        a.id as asset_id, a.assetNumber as asset_assetNumber, a.name as asset_name,
        assigned.id as assignedTo_id, assigned.email as assignedTo_email,
        assigned.firstName as assignedTo_firstName, assigned.lastName as assignedTo_lastName,
        creator.id as createdBy_id, creator.email as createdBy_email,
        creator.firstName as createdBy_firstName, creator.lastName as createdBy_lastName
      FROM WorkOrder w
      LEFT JOIN Asset a ON w.assetId = a.id
      LEFT JOIN User assigned ON w.assignedToId = assigned.id
      LEFT JOIN User creator ON w.createdById = creator.id
      WHERE w.organizationId = ?
      ORDER BY w.createdAt DESC`,
      [organizationId]
    );

    return workOrders.map(wo => this.formatWorkOrderWithRelations(wo));
  }

  async findOne(id: string) {
    const workOrders = await this.db.query(
      `SELECT
        w.*,
        a.id as asset_id, a.assetNumber as asset_assetNumber, a.name as asset_name,
        a.description as asset_description, a.category as asset_category,
        a.manufacturer as asset_manufacturer, a.model as asset_model,
        a.serialNumber as asset_serialNumber, a.status as asset_status,
        assigned.id as assignedTo_id, assigned.email as assignedTo_email,
        assigned.firstName as assignedTo_firstName, assigned.lastName as assignedTo_lastName,
        creator.id as createdBy_id, creator.email as createdBy_email,
        creator.firstName as createdBy_firstName, creator.lastName as createdBy_lastName
      FROM WorkOrder w
      LEFT JOIN Asset a ON w.assetId = a.id
      LEFT JOIN User assigned ON w.assignedToId = assigned.id
      LEFT JOIN User creator ON w.createdById = creator.id
      WHERE w.id = ?`,
      [id]
    );

    if (workOrders.length === 0) {
      return null;
    }

    return this.formatWorkOrderWithRelations(workOrders[0], true);
  }

  async update(id: string, data: UpdateWorkOrderDto) {
    // Get current work order state
    const currentRows = await this.db.query(
      'SELECT * FROM WorkOrder WHERE id = ?',
      [id]
    );

    if (currentRows.length === 0) {
      throw new Error('Work order not found');
    }

    const current = currentRows[0];

    // Status transition validation
    const validTransitions: Record<string, string[]> = {
      'open': ['assigned', 'in_progress', 'on_hold'],
      'assigned': ['in_progress', 'on_hold', 'completed'],
      'in_progress': ['completed', 'on_hold'],
      'on_hold': ['assigned', 'in_progress'],
      'completed': ['closed'],
      'closed': [],
    };

    // Check if status transition is valid
    if (data.status && current.status !== data.status) {
      const allowedTransitions = validTransitions[current.status] || [];
      if (!allowedTransitions.includes(data.status)) {
        throw new Error(
          `Invalid status transition from '${current.status}' to '${data.status}'. Allowed: ${allowedTransitions.join(', ')}`,
        );
      }
    }

    // Auto-set completedAt when status changes to completed
    if (data.status === 'completed' && current.status !== 'completed' && !data.actualEnd) {
      data.actualEnd = new Date().toISOString();
    }

    // Auto-change status to 'assigned' when user is assigned (if currently open)
    if (data.assignedToId && !current.assignedToId && current.status === 'open') {
      data.status = 'assigned';
    }

    // Auto-set actualStart when status changes to 'in_progress'
    if (data.status === 'in_progress' && current.status !== 'in_progress' && !data.actualStart) {
      data.actualStart = new Date().toISOString();
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.workOrderNumber !== undefined) {
      updates.push('workOrderNumber = ?');
      values.push(data.workOrderNumber);
    }
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.assetId !== undefined) {
      updates.push('assetId = ?');
      values.push(data.assetId);
    }
    if (data.assignedToId !== undefined) {
      updates.push('assignedToId = ?');
      values.push(data.assignedToId);
    }
    if (data.scheduledStart !== undefined) {
      updates.push('scheduledStart = ?');
      values.push(data.scheduledStart);
    }
    if (data.scheduledEnd !== undefined) {
      updates.push('scheduledEnd = ?');
      values.push(data.scheduledEnd);
    }
    if (data.actualStart !== undefined) {
      updates.push('actualStart = ?');
      values.push(data.actualStart);
    }
    if (data.actualEnd !== undefined) {
      updates.push('actualEnd = ?');
      values.push(data.actualEnd);
    }
    if (data.estimatedHours !== undefined) {
      updates.push('estimatedHours = ?');
      values.push(data.estimatedHours);
    }
    if (data.actualHours !== undefined) {
      updates.push('actualHours = ?');
      values.push(data.actualHours);
    }
    if (data.laborCost !== undefined) {
      updates.push('laborCost = ?');
      values.push(data.laborCost);
    }
    if (data.partsCost !== undefined) {
      updates.push('partsCost = ?');
      values.push(data.partsCost);
    }
    if (data.totalCost !== undefined) {
      updates.push('totalCost = ?');
      values.push(data.totalCost);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }
    if (data.customFields !== undefined) {
      updates.push('customFields = ?');
      values.push(data.customFields);
    }

    // Auto-set completedAt
    if (data.status === 'completed' && current.status !== 'completed') {
      updates.push('completedAt = datetime(\'now\')');
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    console.log('Updating work order with data:', JSON.stringify(data, null, 2));

    await this.db.execute(
      `UPDATE WorkOrder SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch the updated work order with relations
    const workOrders = await this.db.query(
      `SELECT
        w.*,
        a.id as asset_id, a.assetNumber as asset_assetNumber, a.name as asset_name,
        a.description as asset_description, a.category as asset_category,
        a.manufacturer as asset_manufacturer, a.model as asset_model,
        a.serialNumber as asset_serialNumber, a.status as asset_status,
        assigned.id as assignedTo_id, assigned.email as assignedTo_email,
        assigned.firstName as assignedTo_firstName, assigned.lastName as assignedTo_lastName,
        creator.id as createdBy_id, creator.email as createdBy_email,
        creator.firstName as createdBy_firstName, creator.lastName as createdBy_lastName
      FROM WorkOrder w
      LEFT JOIN Asset a ON w.assetId = a.id
      LEFT JOIN User assigned ON w.assignedToId = assigned.id
      LEFT JOIN User creator ON w.createdById = creator.id
      WHERE w.id = ?`,
      [id]
    );

    console.log('Work order updated successfully:', workOrders[0].workOrderNumber);
    return this.formatWorkOrderWithRelations(workOrders[0], true);
  }

  async remove(id: string) {
    await this.db.execute('DELETE FROM WorkOrder WHERE id = ?', [id]);
    return { id };
  }

  private formatWorkOrderWithRelations(row: any, includeFullAsset = false) {
    if (!row) return null;

    const workOrder: any = {
      id: row.id,
      workOrderNumber: row.workOrderNumber,
      title: row.title,
      description: row.description,
      type: row.type,
      priority: row.priority,
      status: row.status,
      assetId: row.assetId,
      assignedToId: row.assignedToId,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      actualStart: row.actualStart,
      actualEnd: row.actualEnd,
      completedAt: row.completedAt,
      estimatedHours: row.estimatedHours,
      actualHours: row.actualHours,
      laborCost: row.laborCost,
      partsCost: row.partsCost,
      totalCost: row.totalCost,
      notes: row.notes,
      customFields: row.customFields,
      organizationId: row.organizationId,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    if (row.asset_id) {
      if (includeFullAsset) {
        workOrder.asset = {
          id: row.asset_id,
          assetNumber: row.asset_assetNumber,
          name: row.asset_name,
          description: row.asset_description,
          category: row.asset_category,
          manufacturer: row.asset_manufacturer,
          model: row.asset_model,
          serialNumber: row.asset_serialNumber,
          status: row.asset_status,
        };
      } else {
        workOrder.asset = {
          id: row.asset_id,
          assetNumber: row.asset_assetNumber,
          name: row.asset_name,
        };
      }
    }

    if (row.assignedTo_id) {
      workOrder.assignedTo = {
        id: row.assignedTo_id,
        email: row.assignedTo_email,
        firstName: row.assignedTo_firstName,
        lastName: row.assignedTo_lastName,
      };
    }

    if (row.createdBy_id) {
      workOrder.createdBy = {
        id: row.createdBy_id,
        email: row.createdBy_email,
        firstName: row.createdBy_firstName,
        lastName: row.createdBy_lastName,
      };
    }

    return workOrder;
  }
}
