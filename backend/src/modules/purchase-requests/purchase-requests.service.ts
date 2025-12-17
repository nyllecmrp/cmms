import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreatePurchaseRequestDto {
  organizationId: string;
  title: string;
  description?: string;
  priority?: string;
  type?: string;
  pmScheduleId?: string;
  workOrderId?: string;
  assetId?: string;
  items: string; // JSON array of items
  estimatedCost?: number;
  notes?: string;
  requestedById: string;
}

export interface UpdatePurchaseRequestDto {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  items?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
}

export interface ApprovePurchaseRequestDto {
  approvedById: string;
}

export interface RejectPurchaseRequestDto {
  rejectedById: string;
  rejectionReason: string;
}

@Injectable()
export class PurchaseRequestsService {
  constructor(private db: DatabaseService) {}

  async create(createDto: CreatePurchaseRequestDto) {
    // Validate required fields
    if (!createDto.title || createDto.title.trim() === '') {
      throw new Error('Purchase Request Title is required.');
    }

    if (!createDto.items || createDto.items.trim() === '') {
      throw new Error('Items are required for Purchase Request.');
    }

    const id = randomBytes(16).toString('hex');

    // Generate request number
    const requestNumber = await this.generateRequestNumber(createDto.organizationId);

    await this.db.execute(
      `INSERT INTO PurchaseRequest (
        id, organizationId, requestNumber, title, description, priority, status, type,
        pmScheduleId, workOrderId, assetId, items, estimatedCost, notes,
        requestedById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        createDto.organizationId,
        requestNumber,
        createDto.title,
        createDto.description || null,
        createDto.priority || 'medium',
        'pending',
        createDto.type || 'parts',
        createDto.pmScheduleId || null,
        createDto.workOrderId || null,
        createDto.assetId || null,
        createDto.items,
        createDto.estimatedCost || null,
        createDto.notes || null,
        createDto.requestedById,
      ]
    );

    return this.findOne(id);
  }

  async findAll(organizationId: string, status?: string) {
    // Clean up orphaned PRs (PRs with pmScheduleId that no longer exists)
    await this.db.execute(`
      DELETE FROM PurchaseRequest
      WHERE organizationId = ?
      AND pmScheduleId IS NOT NULL
      AND pmScheduleId NOT IN (SELECT id FROM PMSchedule)
    `, [organizationId]);

    let query = `
      SELECT
        pr.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        pm.id as pmSchedule_id, pm.name as pmSchedule_name,
        wo.id as workOrder_id, wo.workOrderNumber as workOrder_workOrderNumber, wo.title as workOrder_title,
        requester.id as requestedBy_id, requester.firstName as requestedBy_firstName,
        requester.lastName as requestedBy_lastName, requester.email as requestedBy_email,
        approver.id as approvedBy_id, approver.firstName as approvedBy_firstName,
        approver.lastName as approvedBy_lastName
      FROM PurchaseRequest pr
      LEFT JOIN Asset a ON pr.assetId = a.id
      LEFT JOIN PMSchedule pm ON pr.pmScheduleId = pm.id
      LEFT JOIN WorkOrder wo ON pr.workOrderId = wo.id
      LEFT JOIN User requester ON pr.requestedById = requester.id
      LEFT JOIN User approver ON pr.approvedById = approver.id
      WHERE pr.organizationId = ?
    `;

    const params: any[] = [organizationId];

    if (status) {
      query += ' AND pr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY pr.createdAt DESC';

    const requests = await this.db.query(query, params);
    return requests.map(req => this.formatPurchaseRequestWithRelations(req));
  }

  async findOne(id: string) {
    const requests = await this.db.query(
      `SELECT
        pr.*,
        a.id as asset_id, a.name as asset_name, a.assetNumber as asset_assetNumber,
        pm.id as pmSchedule_id, pm.name as pmSchedule_name,
        wo.id as workOrder_id, wo.workOrderNumber as workOrder_workOrderNumber, wo.title as workOrder_title,
        requester.id as requestedBy_id, requester.firstName as requestedBy_firstName,
        requester.lastName as requestedBy_lastName, requester.email as requestedBy_email,
        approver.id as approvedBy_id, approver.firstName as approvedBy_firstName,
        approver.lastName as approvedBy_lastName
      FROM PurchaseRequest pr
      LEFT JOIN Asset a ON pr.assetId = a.id
      LEFT JOIN PMSchedule pm ON pr.pmScheduleId = pm.id
      LEFT JOIN WorkOrder wo ON pr.workOrderId = wo.id
      LEFT JOIN User requester ON pr.requestedById = requester.id
      LEFT JOIN User approver ON pr.approvedById = approver.id
      WHERE pr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return null;
    }

    return this.formatPurchaseRequestWithRelations(requests[0]);
  }

  async update(id: string, updateDto: UpdatePurchaseRequestDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (updateDto.title !== undefined) {
      updates.push('title = ?');
      values.push(updateDto.title);
    }
    if (updateDto.description !== undefined) {
      updates.push('description = ?');
      values.push(updateDto.description);
    }
    if (updateDto.priority !== undefined) {
      updates.push('priority = ?');
      values.push(updateDto.priority);
    }
    if (updateDto.status !== undefined) {
      updates.push('status = ?');
      values.push(updateDto.status);
    }
    if (updateDto.items !== undefined) {
      updates.push('items = ?');
      values.push(updateDto.items);
    }
    if (updateDto.estimatedCost !== undefined) {
      updates.push('estimatedCost = ?');
      values.push(updateDto.estimatedCost);
    }
    if (updateDto.actualCost !== undefined) {
      updates.push('actualCost = ?');
      values.push(updateDto.actualCost);
    }
    if (updateDto.notes !== undefined) {
      updates.push('notes = ?');
      values.push(updateDto.notes);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE PurchaseRequest SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findOne(id);
  }

  async approve(id: string, approveDto: ApprovePurchaseRequestDto) {
    await this.db.execute(
      `UPDATE PurchaseRequest
       SET status = 'approved',
           approvedById = ?,
           approvedAt = datetime('now'),
           updatedAt = datetime('now')
       WHERE id = ?`,
      [approveDto.approvedById, id]
    );

    return this.findOne(id);
  }

  async reject(id: string, rejectDto: RejectPurchaseRequestDto) {
    await this.db.execute(
      `UPDATE PurchaseRequest
       SET status = 'rejected',
           rejectedById = ?,
           rejectedAt = datetime('now'),
           rejectionReason = ?,
           updatedAt = datetime('now')
       WHERE id = ?`,
      [rejectDto.rejectedById, rejectDto.rejectionReason, id]
    );

    return this.findOne(id);
  }

  async markAsPurchased(id: string, actualCost?: number) {
    await this.db.execute(
      `UPDATE PurchaseRequest
       SET status = 'purchased',
           purchasedAt = datetime('now'),
           actualCost = ?,
           updatedAt = datetime('now')
       WHERE id = ?`,
      [actualCost || null, id]
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.db.execute('DELETE FROM PurchaseRequest WHERE id = ?', [id]);
    return { id };
  }

  async getStats(organizationId: string) {
    const totalResult = await this.db.query(
      'SELECT COUNT(*) as count FROM PurchaseRequest WHERE organizationId = ?',
      [organizationId]
    );

    const pendingResult = await this.db.query(
      'SELECT COUNT(*) as count FROM PurchaseRequest WHERE organizationId = ? AND status = ?',
      [organizationId, 'pending']
    );

    const approvedResult = await this.db.query(
      'SELECT COUNT(*) as count FROM PurchaseRequest WHERE organizationId = ? AND status = ?',
      [organizationId, 'approved']
    );

    const purchasedResult = await this.db.query(
      'SELECT COUNT(*) as count FROM PurchaseRequest WHERE organizationId = ? AND status = ?',
      [organizationId, 'purchased']
    );

    const totalCostResult = await this.db.query(
      'SELECT SUM(actualCost) as total FROM PurchaseRequest WHERE organizationId = ? AND status = ? AND actualCost IS NOT NULL',
      [organizationId, 'purchased']
    );

    return {
      total: totalResult[0].count,
      pending: pendingResult[0].count,
      approved: approvedResult[0].count,
      purchased: purchasedResult[0].count,
      totalSpent: totalCostResult[0]?.total || 0,
    };
  }

  private async generateRequestNumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM PurchaseRequest
       WHERE organizationId = ? AND requestNumber LIKE ?`,
      [organizationId, `PR-${year}-%`]
    );

    const count = result[0].count + 1;
    return `PR-${year}-${count.toString().padStart(4, '0')}`;
  }

  private formatPurchaseRequestWithRelations(row: any) {
    if (!row) return null;

    const request: any = {
      id: row.id,
      organizationId: row.organizationId,
      requestNumber: row.requestNumber,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      type: row.type,
      pmScheduleId: row.pmScheduleId,
      workOrderId: row.workOrderId,
      assetId: row.assetId,
      items: row.items,
      estimatedCost: row.estimatedCost,
      actualCost: row.actualCost,
      requestedById: row.requestedById,
      approvedById: row.approvedById,
      approvedAt: row.approvedAt,
      rejectedById: row.rejectedById,
      rejectedAt: row.rejectedAt,
      rejectionReason: row.rejectionReason,
      purchasedAt: row.purchasedAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    if (row.asset_id) {
      request.asset = {
        id: row.asset_id,
        name: row.asset_name,
        assetNumber: row.asset_assetNumber,
      };
    }

    if (row.pmSchedule_id) {
      request.pmSchedule = {
        id: row.pmSchedule_id,
        name: row.pmSchedule_name,
      };
    }

    if (row.workOrder_id) {
      request.workOrder = {
        id: row.workOrder_id,
        workOrderNumber: row.workOrder_workOrderNumber,
        title: row.workOrder_title,
      };
    }

    if (row.requestedBy_id) {
      request.requestedBy = {
        id: row.requestedBy_id,
        firstName: row.requestedBy_firstName,
        lastName: row.requestedBy_lastName,
        email: row.requestedBy_email,
      };
    }

    if (row.approvedBy_id) {
      request.approvedBy = {
        id: row.approvedBy_id,
        firstName: row.approvedBy_firstName,
        lastName: row.approvedBy_lastName,
      };
    }

    return request;
  }
}
