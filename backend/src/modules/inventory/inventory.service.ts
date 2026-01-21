import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomUUID } from 'crypto';

export interface CreateInventoryItemDto {
  organizationId: string;
  partNumber: string;
  name: string;
  description?: string;
  categoryId?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure?: string;
  unitCost?: number;
  currency?: string;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  supplierId?: string;
  supplierPartNumber?: string;
  barcode?: string;
  storageLocation?: string;
  shelfLife?: number;
  warrantyPeriod?: number;
  notes?: string;
  createdById: string;
}

export interface UpdateInventoryItemDto {
  name?: string;
  description?: string;
  categoryId?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure?: string;
  unitCost?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  supplierId?: string;
  supplierPartNumber?: string;
  barcode?: string;
  storageLocation?: string;
  shelfLife?: number;
  warrantyPeriod?: number;
  isActive?: boolean;
  notes?: string;
}

export interface CreateTransactionDto {
  organizationId: string;
  itemId: string;
  locationId: string;
  transactionType: 'purchase' | 'usage' | 'adjustment' | 'return' | 'transfer_out' | 'transfer_in' | 'stock_take';
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  reason?: string;
  notes?: string;
  performedById: string;
}

export interface AddPartToWorkOrderDto {
  workOrderId: string;
  itemId: string;
  locationId: string;
  quantityPlanned: number;
  quantityUsed?: number;
  unitCost: number;
  installedOn?: string;
  notes?: string;
  addedById: string;
}

@Injectable()
export class InventoryService {
  constructor(private db: DatabaseService) {}

  /**
   * Create a new inventory item
   */
  async createItem(data: CreateInventoryItemDto) {
    const id = randomUUID();

    // Check if part number already exists
    const existing = await this.db.query(
      'SELECT id FROM InventoryItem WHERE organizationId = ? AND partNumber = ?',
      [data.organizationId, data.partNumber],
    );

    if (existing.length > 0) {
      throw new BadRequestException(`Part number ${data.partNumber} already exists`);
    }

    await this.db.query(
      `INSERT INTO InventoryItem (
        id, organizationId, partNumber, name, description, categoryId, manufacturer,
        modelNumber, unitOfMeasure, unitCost, currency, minimumStock, maximumStock,
        reorderPoint, reorderQuantity, leadTimeDays, supplierId, supplierPartNumber,
        barcode, storageLocation, shelfLife, warrantyPeriod, notes, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.organizationId,
        data.partNumber,
        data.name,
        data.description || null,
        data.categoryId || null,
        data.manufacturer || null,
        data.modelNumber || null,
        data.unitOfMeasure || 'piece',
        data.unitCost || 0,
        data.currency || 'PHP',
        data.minimumStock || 0,
        data.maximumStock || null,
        data.reorderPoint || 0,
        data.reorderQuantity || 0,
        data.leadTimeDays || 0,
        data.supplierId || null,
        data.supplierPartNumber || null,
        data.barcode || null,
        data.storageLocation || null,
        data.shelfLife || null,
        data.warrantyPeriod || null,
        data.notes || null,
        data.createdById,
      ],
    );

    return this.getItemById(id);
  }

  /**
   * Get all inventory items for an organization
   */
  async getItems(organizationId: string, filters?: { categoryId?: string; isActive?: boolean }) {
    let query = `
      SELECT
        i.*,
        c.name as categoryName,
        s.name as supplierName,
        COALESCE(SUM(st.quantity), 0) as totalStock,
        COALESCE(SUM(st.reservedQuantity), 0) as totalReserved,
        COALESCE(SUM(st.quantity - st.reservedQuantity), 0) as totalAvailable
      FROM InventoryItem i
      LEFT JOIN InventoryCategory c ON i.categoryId = c.id
      LEFT JOIN InventorySupplier s ON i.supplierId = s.id
      LEFT JOIN InventoryStock st ON i.id = st.itemId
      WHERE i.organizationId = ?
    `;

    const params: any[] = [organizationId];

    if (filters?.categoryId) {
      query += ' AND i.categoryId = ?';
      params.push(filters.categoryId);
    }

    if (filters?.isActive !== undefined) {
      query += ' AND i.isActive = ?';
      params.push(filters.isActive ? 1 : 0);
    }

    query += ' GROUP BY i.id ORDER BY i.name ASC';

    return this.db.query(query, params);
  }

  /**
   * Get inventory item by ID
   */
  async getItemById(id: string) {
    const items = await this.db.query(
      `SELECT
        i.*,
        c.name as categoryName,
        s.name as supplierName,
        COALESCE(SUM(st.quantity), 0) as totalStock,
        COALESCE(SUM(st.reservedQuantity), 0) as totalReserved,
        COALESCE(SUM(st.quantity - st.reservedQuantity), 0) as totalAvailable
      FROM InventoryItem i
      LEFT JOIN InventoryCategory c ON i.categoryId = c.id
      LEFT JOIN InventorySupplier s ON i.supplierId = s.id
      LEFT JOIN InventoryStock st ON i.id = st.itemId
      WHERE i.id = ?
      GROUP BY i.id`,
      [id],
    );

    if (items.length === 0) {
      throw new NotFoundException(`Inventory item not found`);
    }

    return items[0];
  }

  /**
   * Update inventory item
   */
  async updateItem(id: string, data: UpdateInventoryItemDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.categoryId !== undefined) {
      updates.push('categoryId = ?');
      values.push(data.categoryId);
    }
    if (data.manufacturer !== undefined) {
      updates.push('manufacturer = ?');
      values.push(data.manufacturer);
    }
    if (data.modelNumber !== undefined) {
      updates.push('modelNumber = ?');
      values.push(data.modelNumber);
    }
    if (data.unitOfMeasure !== undefined) {
      updates.push('unitOfMeasure = ?');
      values.push(data.unitOfMeasure);
    }
    if (data.unitCost !== undefined) {
      updates.push('unitCost = ?');
      values.push(data.unitCost);
    }
    if (data.minimumStock !== undefined) {
      updates.push('minimumStock = ?');
      values.push(data.minimumStock);
    }
    if (data.maximumStock !== undefined) {
      updates.push('maximumStock = ?');
      values.push(data.maximumStock);
    }
    if (data.reorderPoint !== undefined) {
      updates.push('reorderPoint = ?');
      values.push(data.reorderPoint);
    }
    if (data.reorderQuantity !== undefined) {
      updates.push('reorderQuantity = ?');
      values.push(data.reorderQuantity);
    }
    if (data.leadTimeDays !== undefined) {
      updates.push('leadTimeDays = ?');
      values.push(data.leadTimeDays);
    }
    if (data.supplierId !== undefined) {
      updates.push('supplierId = ?');
      values.push(data.supplierId);
    }
    if (data.supplierPartNumber !== undefined) {
      updates.push('supplierPartNumber = ?');
      values.push(data.supplierPartNumber);
    }
    if (data.barcode !== undefined) {
      updates.push('barcode = ?');
      values.push(data.barcode);
    }
    if (data.storageLocation !== undefined) {
      updates.push('storageLocation = ?');
      values.push(data.storageLocation);
    }
    if (data.shelfLife !== undefined) {
      updates.push('shelfLife = ?');
      values.push(data.shelfLife);
    }
    if (data.warrantyPeriod !== undefined) {
      updates.push('warrantyPeriod = ?');
      values.push(data.warrantyPeriod);
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(data.isActive ? 1 : 0);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.query(
      `UPDATE InventoryItem SET ${updates.join(', ')} WHERE id = ?`,
      values,
    );

    return this.getItemById(id);
  }

  /**
   * Delete inventory item
   */
  async deleteItem(id: string) {
    // Check if item has any transactions
    const transactions = await this.db.query(
      'SELECT COUNT(*) as count FROM InventoryTransaction WHERE itemId = ?',
      [id],
    );

    if (transactions[0].count > 0) {
      throw new BadRequestException('Cannot delete item with existing transactions. Set as inactive instead.');
    }

    await this.db.query('DELETE FROM InventoryItem WHERE id = ?', [id]);
    return { message: 'Item deleted successfully' };
  }

  /**
   * Create inventory transaction (stock movement)
   */
  async createTransaction(data: CreateTransactionDto) {
    const id = randomUUID();
    const totalCost = data.unitCost ? data.quantity * data.unitCost : null;

    await this.db.query(
      `INSERT INTO InventoryTransaction (
        id, organizationId, itemId, locationId, transactionType, quantity,
        unitCost, totalCost, referenceType, referenceId, fromLocationId,
        toLocationId, reason, notes, performedById, transactionDate, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.organizationId,
        data.itemId,
        data.locationId,
        data.transactionType,
        data.quantity,
        data.unitCost || null,
        totalCost,
        data.referenceType || null,
        data.referenceId || null,
        data.fromLocationId || null,
        data.toLocationId || null,
        data.reason || null,
        data.notes || null,
        data.performedById,
      ],
    );

    // Update stock levels
    await this.updateStockLevel(data.itemId, data.locationId, data.quantity);

    // Check for low stock alerts
    await this.checkStockAlerts(data.itemId, data.organizationId);

    return this.getTransactionById(id);
  }

  /**
   * Update stock level after transaction
   */
  private async updateStockLevel(itemId: string, locationId: string, quantityChange: number) {
    const existing = await this.db.query(
      'SELECT id, quantity FROM InventoryStock WHERE itemId = ? AND locationId = ?',
      [itemId, locationId],
    );

    if (existing.length === 0) {
      // Create new stock record
      await this.db.query(
        `INSERT INTO InventoryStock (id, itemId, locationId, quantity, reservedQuantity, updatedAt)
         VALUES (?, ?, ?, ?, 0, datetime('now'))`,
        [randomUUID(), itemId, locationId, Math.max(0, quantityChange)],
      );
    } else {
      // Update existing stock
      const newQuantity = Math.max(0, existing[0].quantity + quantityChange);
      await this.db.query(
        'UPDATE InventoryStock SET quantity = ?, updatedAt = datetime(\'now\') WHERE id = ?',
        [newQuantity, existing[0].id],
      );
    }
  }

  /**
   * Check and create stock alerts
   */
  private async checkStockAlerts(itemId: string, organizationId: string) {
    const item = await this.getItemById(itemId);

    // Check for existing unresolved alerts
    const existingAlerts = await this.db.query(
      'SELECT id FROM StockAlert WHERE itemId = ? AND isResolved = 0',
      [itemId],
    );

    if (existingAlerts.length > 0) {
      // Alert already exists
      return;
    }

    // Check if stock is below reorder point
    if (item.totalAvailable <= item.reorderPoint && item.reorderPoint > 0) {
      await this.db.query(
        `INSERT INTO StockAlert (id, organizationId, itemId, alertType, message, createdAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [
          randomUUID(),
          organizationId,
          itemId,
          item.totalAvailable === 0 ? 'out_of_stock' : 'low_stock',
          `${item.name} (${item.partNumber}) is ${item.totalAvailable === 0 ? 'out of stock' : 'below reorder point'}`,
        ],
      );
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    const transactions = await this.db.query(
      `SELECT
        t.*,
        i.name as itemName,
        i.partNumber,
        u.name as performedByName
      FROM InventoryTransaction t
      LEFT JOIN InventoryItem i ON t.itemId = i.id
      LEFT JOIN User u ON t.performedById = u.id
      WHERE t.id = ?`,
      [id],
    );

    if (transactions.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    return transactions[0];
  }

  /**
   * Get transaction history for an item
   */
  async getItemTransactions(itemId: string, limit = 50) {
    return this.db.query(
      `SELECT
        t.*,
        u.name as performedByName,
        l.name as locationName
      FROM InventoryTransaction t
      LEFT JOIN User u ON t.performedById = u.id
      LEFT JOIN StockLocation l ON t.locationId = l.id
      WHERE t.itemId = ?
      ORDER BY t.transactionDate DESC
      LIMIT ?`,
      [itemId, limit],
    );
  }

  /**
   * Add part to work order
   */
  async addPartToWorkOrder(data: AddPartToWorkOrderDto) {
    const id = randomUUID();

    await this.db.query(
      `INSERT INTO WorkOrderPart (
        id, workOrderId, itemId, locationId, quantityPlanned, quantityUsed,
        unitCost, status, addedById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'planned', ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.workOrderId,
        data.itemId,
        data.locationId,
        data.quantityPlanned,
        data.quantityUsed || 0,
        data.unitCost,
        data.addedById,
      ],
    );

    // Reserve stock
    await this.reserveStock(data.itemId, data.locationId, data.quantityPlanned);

    return this.getWorkOrderPart(id);
  }

  /**
   * Reserve stock for work order
   */
  private async reserveStock(itemId: string, locationId: string, quantity: number) {
    await this.db.query(
      `UPDATE InventoryStock
       SET reservedQuantity = reservedQuantity + ?, updatedAt = datetime('now')
       WHERE itemId = ? AND locationId = ?`,
      [quantity, itemId, locationId],
    );
  }

  /**
   * Get work order part
   */
  async getWorkOrderPart(id: string) {
    const parts = await this.db.query(
      `SELECT
        wop.*,
        i.name as itemName,
        i.partNumber,
        l.name as locationName
      FROM WorkOrderPart wop
      LEFT JOIN InventoryItem i ON wop.itemId = i.id
      LEFT JOIN StockLocation l ON wop.locationId = l.id
      WHERE wop.id = ?`,
      [id],
    );

    if (parts.length === 0) {
      throw new NotFoundException('Work order part not found');
    }

    return parts[0];
  }

  /**
   * Get parts for a work order
   */
  async getWorkOrderParts(workOrderId: string) {
    return this.db.query(
      `SELECT
        wop.*,
        i.name as itemName,
        i.partNumber,
        i.unitOfMeasure,
        l.name as locationName,
        st.quantity as availableStock
      FROM WorkOrderPart wop
      LEFT JOIN InventoryItem i ON wop.itemId = i.id
      LEFT JOIN StockLocation l ON wop.locationId = l.id
      LEFT JOIN InventoryStock st ON wop.itemId = st.itemId AND wop.locationId = st.locationId
      WHERE wop.workOrderId = ?
      ORDER BY wop.createdAt ASC`,
      [workOrderId],
    );
  }

  /**
   * Get stock alerts
   */
  async getStockAlerts(organizationId: string, isResolved = false) {
    return this.db.query(
      `SELECT
        sa.*,
        i.name as itemName,
        i.partNumber,
        COALESCE(SUM(st.quantity - st.reservedQuantity), 0) as availableStock
      FROM StockAlert sa
      LEFT JOIN InventoryItem i ON sa.itemId = i.id
      LEFT JOIN InventoryStock st ON sa.itemId = st.itemId
      WHERE sa.organizationId = ? AND sa.isResolved = ?
      GROUP BY sa.id
      ORDER BY sa.createdAt DESC`,
      [organizationId, isResolved ? 1 : 0],
    );
  }

  /**
   * Check availability of parts for PM schedule
   * Returns available quantity for each part by part number or name
   */
  async checkPartsAvailability(organizationId: string, parts: Array<{ name: string; partNumber?: string; quantity: number }>) {
    const availability = [];

    for (const part of parts) {
      // Try to find inventory item by part number first, then by name
      let inventoryItem;

      if (part.partNumber) {
        const byPartNumber = await this.db.query(
          `SELECT * FROM InventoryItem WHERE organizationId = ? AND partNumber = ? AND isActive = 1`,
          [organizationId, part.partNumber]
        );
        inventoryItem = byPartNumber[0];
      }

      if (!inventoryItem) {
        const byName = await this.db.query(
          `SELECT * FROM InventoryItem WHERE organizationId = ? AND name = ? AND isActive = 1`,
          [organizationId, part.name]
        );
        inventoryItem = byName[0];
      }

      if (!inventoryItem) {
        // Part not in inventory
        availability.push({
          partName: part.name,
          partNumber: part.partNumber,
          needed: part.quantity,
          available: 0,
          toOrder: part.quantity,
          inInventory: false,
          inventoryItemId: null
        });
        continue;
      }

      // Get total available stock across all locations
      const stockResult = await this.db.query(
        `SELECT COALESCE(SUM(quantity - reservedQuantity), 0) as availableStock
         FROM InventoryStock
         WHERE itemId = ?`,
        [inventoryItem.id]
      );

      const availableStock = stockResult[0]?.availableStock || 0;
      const toOrder = Math.max(0, part.quantity - availableStock);

      availability.push({
        partName: part.name,
        partNumber: part.partNumber || inventoryItem.partNumber,
        needed: part.quantity,
        available: Math.min(availableStock, part.quantity),
        toOrder: toOrder,
        inInventory: true,
        inventoryItemId: inventoryItem.id,
        unitCost: inventoryItem.unitCost
      });
    }

    return availability;
  }

  /**
   * Reserve inventory for PM schedule
   */
  async reservePartsForPM(pmScheduleId: string, organizationId: string, parts: Array<{ inventoryItemId: string; quantity: number }>) {
    for (const part of parts) {
      if (part.quantity <= 0) continue;

      // Find stock locations with available quantity (FIFO)
      const stockLocations = await this.db.query(
        `SELECT id, itemId, locationId, quantity, reservedQuantity
         FROM InventoryStock
         WHERE itemId = ? AND (quantity - reservedQuantity) > 0
         ORDER BY createdAt ASC`,
        [part.inventoryItemId]
      );

      let remainingToReserve = part.quantity;

      for (const stock of stockLocations) {
        if (remainingToReserve <= 0) break;

        const availableInLocation = stock.quantity - stock.reservedQuantity;
        const toReserve = Math.min(availableInLocation, remainingToReserve);

        // Update reserved quantity
        await this.db.execute(
          `UPDATE InventoryStock
           SET reservedQuantity = reservedQuantity + ?,
               updatedAt = datetime('now')
           WHERE id = ?`,
          [toReserve, stock.id]
        );

        // Create reservation record
        await this.db.execute(
          `INSERT INTO InventoryReservation (id, itemId, locationId, quantity, referenceType, referenceId, createdAt)
           VALUES (?, ?, ?, ?, 'PMSchedule', ?, datetime('now'))`,
          [randomUUID(), stock.itemId, stock.locationId, toReserve, pmScheduleId]
        );

        remainingToReserve -= toReserve;
      }
    }
  }

  /**
   * Release inventory reservations for PM schedule
   */
  async releaseReservationsForPM(pmScheduleId: string) {
    // Get all reservations for this PM schedule
    const reservations = await this.db.query(
      `SELECT * FROM InventoryReservation
       WHERE referenceType = 'PMSchedule' AND referenceId = ?`,
      [pmScheduleId]
    );

    for (const reservation of reservations) {
      // Decrease reserved quantity in stock
      await this.db.execute(
        `UPDATE InventoryStock
         SET reservedQuantity = reservedQuantity - ?,
             updatedAt = datetime('now')
         WHERE itemId = ? AND locationId = ?`,
        [reservation.quantity, reservation.itemId, reservation.locationId]
      );
    }

    // Delete reservation records
    await this.db.execute(
      `DELETE FROM InventoryReservation
       WHERE referenceType = 'PMSchedule' AND referenceId = ?`,
      [pmScheduleId]
    );
  }
}
