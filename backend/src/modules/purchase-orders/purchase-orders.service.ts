import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreatePurchaseOrderDto {
  organizationId: string;
  purchaseRequestId?: string;
  supplierName: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  items: string; // JSON array
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  totalCost?: number;
  orderDate?: string;
  expectedDelivery?: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  shippingMethod?: string;
  createdById: string;
}

export interface UpdatePurchaseOrderDto {
  supplierName?: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  items?: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  totalCost?: number;
  status?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  shippingMethod?: string;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(private db: DatabaseService) {}

  async create(createDto: CreatePurchaseOrderDto) {
    // Validate required fields
    if (!createDto.supplierName || createDto.supplierName.trim() === '') {
      throw new Error('Supplier Name is required.');
    }

    if (!createDto.items || createDto.items.trim() === '') {
      throw new Error('Items are required for Purchase Order.');
    }

    const id = randomBytes(16).toString('hex');
    const poNumber = await this.generatePONumber(createDto.organizationId);

    await this.db.execute(
      `INSERT INTO PurchaseOrder (
        id, organizationId, poNumber, purchaseRequestId,
        supplierName, supplierContact, supplierEmail, supplierAddress,
        items, subtotal, tax, shippingCost, totalCost,
        status, orderDate, expectedDelivery, notes,
        termsAndConditions, paymentTerms, shippingMethod,
        createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        createDto.organizationId,
        poNumber,
        createDto.purchaseRequestId || null,
        createDto.supplierName,
        createDto.supplierContact || null,
        createDto.supplierEmail || null,
        createDto.supplierAddress || null,
        createDto.items,
        createDto.subtotal || 0,
        createDto.tax || 0,
        createDto.shippingCost || 0,
        createDto.totalCost || 0,
        'draft',
        createDto.orderDate || new Date().toISOString().split('T')[0],
        createDto.expectedDelivery || null,
        createDto.notes || null,
        createDto.termsAndConditions || null,
        createDto.paymentTerms || null,
        createDto.shippingMethod || null,
        createDto.createdById,
      ]
    );

    return this.findOne(id);
  }

  async findAll(organizationId: string, status?: string) {
    let query = `
      SELECT
        po.*,
        pr.id as pr_id, pr.requestNumber as pr_requestNumber, pr.title as pr_title,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName, creator.email as createdBy_email
      FROM PurchaseOrder po
      LEFT JOIN PurchaseRequest pr ON po.purchaseRequestId = pr.id
      LEFT JOIN User creator ON po.createdById = creator.id
      WHERE po.organizationId = ?
    `;

    const params: any[] = [organizationId];

    if (status) {
      query += ' AND po.status = ?';
      params.push(status);
    }

    query += ' ORDER BY po.createdAt DESC';

    const orders = await this.db.query(query, params);
    return orders.map(po => this.formatPurchaseOrderWithRelations(po));
  }

  async findOne(id: string) {
    const orders = await this.db.query(
      `SELECT
        po.*,
        pr.id as pr_id, pr.requestNumber as pr_requestNumber, pr.title as pr_title,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName, creator.email as createdBy_email,
        approver.id as approvedBy_id, approver.firstName as approvedBy_firstName,
        approver.lastName as approvedBy_lastName,
        receiver.id as receivedBy_id, receiver.firstName as receivedBy_firstName,
        receiver.lastName as receivedBy_lastName
      FROM PurchaseOrder po
      LEFT JOIN PurchaseRequest pr ON po.purchaseRequestId = pr.id
      LEFT JOIN User creator ON po.createdById = creator.id
      LEFT JOIN User approver ON po.approvedById = approver.id
      LEFT JOIN User receiver ON po.receivedById = receiver.id
      WHERE po.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return null;
    }

    return this.formatPurchaseOrderWithRelations(orders[0]);
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (updateDto.supplierName !== undefined) {
      updates.push('supplierName = ?');
      values.push(updateDto.supplierName);
    }
    if (updateDto.supplierContact !== undefined) {
      updates.push('supplierContact = ?');
      values.push(updateDto.supplierContact);
    }
    if (updateDto.supplierEmail !== undefined) {
      updates.push('supplierEmail = ?');
      values.push(updateDto.supplierEmail);
    }
    if (updateDto.supplierAddress !== undefined) {
      updates.push('supplierAddress = ?');
      values.push(updateDto.supplierAddress);
    }
    if (updateDto.items !== undefined) {
      updates.push('items = ?');
      values.push(updateDto.items);
    }
    if (updateDto.subtotal !== undefined) {
      updates.push('subtotal = ?');
      values.push(updateDto.subtotal);
    }
    if (updateDto.tax !== undefined) {
      updates.push('tax = ?');
      values.push(updateDto.tax);
    }
    if (updateDto.shippingCost !== undefined) {
      updates.push('shippingCost = ?');
      values.push(updateDto.shippingCost);
    }
    if (updateDto.totalCost !== undefined) {
      updates.push('totalCost = ?');
      values.push(updateDto.totalCost);
    }
    if (updateDto.status !== undefined) {
      updates.push('status = ?');
      values.push(updateDto.status);
    }
    if (updateDto.expectedDelivery !== undefined) {
      updates.push('expectedDelivery = ?');
      values.push(updateDto.expectedDelivery);
    }
    if (updateDto.actualDelivery !== undefined) {
      updates.push('actualDelivery = ?');
      values.push(updateDto.actualDelivery);
    }
    if (updateDto.notes !== undefined) {
      updates.push('notes = ?');
      values.push(updateDto.notes);
    }
    if (updateDto.termsAndConditions !== undefined) {
      updates.push('termsAndConditions = ?');
      values.push(updateDto.termsAndConditions);
    }
    if (updateDto.paymentTerms !== undefined) {
      updates.push('paymentTerms = ?');
      values.push(updateDto.paymentTerms);
    }
    if (updateDto.shippingMethod !== undefined) {
      updates.push('shippingMethod = ?');
      values.push(updateDto.shippingMethod);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE PurchaseOrder SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findOne(id);
  }

  async sendPO(id: string, approvedById: string) {
    await this.db.execute(
      `UPDATE PurchaseOrder
       SET status = 'sent',
           approvedById = ?,
           approvedAt = datetime('now'),
           updatedAt = datetime('now')
       WHERE id = ?`,
      [approvedById, id]
    );

    return this.findOne(id);
  }

  async receivePO(id: string, receivedById: string, actualDelivery?: string) {
    await this.db.execute(
      `UPDATE PurchaseOrder
       SET status = 'received',
           receivedById = ?,
           receivedAt = datetime('now'),
           actualDelivery = ?,
           updatedAt = datetime('now')
       WHERE id = ?`,
      [receivedById, actualDelivery || new Date().toISOString().split('T')[0], id]
    );

    return this.findOne(id);
  }

  async cancelPO(id: string) {
    await this.db.execute(
      `UPDATE PurchaseOrder
       SET status = 'cancelled',
           updatedAt = datetime('now')
       WHERE id = ?`,
      [id]
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.db.execute('DELETE FROM PurchaseOrder WHERE id = ?', [id]);
    return { id };
  }

  private async generatePONumber(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM PurchaseOrder
       WHERE organizationId = ? AND poNumber LIKE ?`,
      [organizationId, `PO-${year}-%`]
    );

    const count = result[0].count + 1;
    return `PO-${year}-${count.toString().padStart(4, '0')}`;
  }

  private formatPurchaseOrderWithRelations(row: any) {
    if (!row) return null;

    const po: any = {
      id: row.id,
      organizationId: row.organizationId,
      poNumber: row.poNumber,
      purchaseRequestId: row.purchaseRequestId,
      supplierName: row.supplierName,
      supplierContact: row.supplierContact,
      supplierEmail: row.supplierEmail,
      supplierAddress: row.supplierAddress,
      items: row.items,
      subtotal: row.subtotal,
      tax: row.tax,
      shippingCost: row.shippingCost,
      totalCost: row.totalCost,
      status: row.status,
      priority: row.priority,
      orderDate: row.orderDate,
      expectedDelivery: row.expectedDelivery,
      actualDelivery: row.actualDelivery,
      notes: row.notes,
      termsAndConditions: row.termsAndConditions,
      paymentTerms: row.paymentTerms,
      shippingMethod: row.shippingMethod,
      createdById: row.createdById,
      approvedById: row.approvedById,
      approvedAt: row.approvedAt,
      receivedById: row.receivedById,
      receivedAt: row.receivedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    if (row.pr_id) {
      po.purchaseRequest = {
        id: row.pr_id,
        requestNumber: row.pr_requestNumber,
        title: row.pr_title,
      };
    }

    if (row.createdBy_id) {
      po.createdBy = {
        id: row.createdBy_id,
        firstName: row.createdBy_firstName,
        lastName: row.createdBy_lastName,
        email: row.createdBy_email,
      };
    }

    if (row.approvedBy_id) {
      po.approvedBy = {
        id: row.approvedBy_id,
        firstName: row.approvedBy_firstName,
        lastName: row.approvedBy_lastName,
      };
    }

    if (row.receivedBy_id) {
      po.receivedBy = {
        id: row.receivedBy_id,
        firstName: row.receivedBy_firstName,
        lastName: row.receivedBy_lastName,
      };
    }

    return po;
  }
}
