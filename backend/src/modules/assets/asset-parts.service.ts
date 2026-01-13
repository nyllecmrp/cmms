import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface AddAssetPartDto {
  assetId: string;
  itemId?: string; // Optional - for linking to inventory
  // Standalone part fields (for BOM entries without inventory)
  partNumber?: string;
  sapNumber?: string; // SAP material number (different from partNumber)
  partName?: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure?: string;
  quantity: number;
  isPrimary?: boolean;
  componentClassification?: string; // WCM: ABC (A=Critical, B=Important, C=Standard)
  maintenanceTimeMinutes?: number; // WCM: time to replace/service (minutes)
  maintenanceInterval?: number;
  lastReplacedDate?: string;
  nextReplacementDue?: string;
  notes?: string;
  createdById: string;
  // WCM Fields
  pmType?: string; // TBM, CBM, BDM
  smpNumber?: number;
  frequencyPM?: string; // 3M, 6M, 12M, etc
  machineStopRequired?: string; // STOP, Running
  inspectionStandard?: string; // C, I, L, T
  frequencyAM?: string; // 1W, 2W, M, 3M, etc
  qaMatrixNo?: number;
  qmMatrixNo?: number;
  kaizenType?: string; // Cost, Reliability, Availability
  kaizenNo?: string;
  storeroomLocation?: string;
  vendor?: string;
  drawingPicture?: string;
}

export interface UpdateAssetPartDto {
  quantity?: number;
  isPrimary?: boolean;
  maintenanceInterval?: number;
  lastReplacedDate?: string;
  nextReplacementDue?: string;
  notes?: string;
}

export interface BulkAddAssetPartsDto {
  assetId: string;
  parts: Array<{
    itemId?: string;
    partNumber?: string;
    sapNumber?: string;
    partName?: string;
    description?: string;
    manufacturer?: string;
    modelNumber?: string;
    unitOfMeasure?: string;
    quantity: number;
    isPrimary?: boolean;
    componentClassification?: string;
    maintenanceTimeMinutes?: number;
    maintenanceInterval?: number;
    notes?: string;
    // WCM Fields
    pmType?: string;
    smpNumber?: number;
    frequencyPM?: string;
    machineStopRequired?: string;
    inspectionStandard?: string;
    frequencyAM?: string;
    qaMatrixNo?: number;
    qmMatrixNo?: number;
    kaizenType?: string;
    kaizenNo?: string;
    storeroomLocation?: string;
    vendor?: string;
    drawingPicture?: string;
  }>;
  createdById: string;
}

@Injectable()
export class AssetPartsService {
  constructor(private db: DatabaseService) {}

  /**
   * Add a single part to an asset
   * Supports both standalone parts (BOM) and inventory-linked parts
   */
  async addPartToAsset(data: AddAssetPartDto) {
    // Validate: must have either itemId OR partNumber+partName
    if (!data.itemId && (!data.partNumber || !data.partName)) {
      throw new Error('Must provide either itemId (for inventory) or partNumber+partName (for standalone BOM entry)');
    }

    // Check if part already exists (by itemId or partNumber)
    let existing;
    if (data.itemId) {
      existing = await this.db.query(
        'SELECT id FROM AssetPart WHERE assetId = ? AND itemId = ?',
        [data.assetId, data.itemId]
      );
    } else {
      existing = await this.db.query(
        'SELECT id FROM AssetPart WHERE assetId = ? AND partNumber = ?',
        [data.assetId, data.partNumber]
      );
    }

    if (existing && existing.length > 0) {
      throw new Error('This part is already on this asset. Use update instead.');
    }

    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO AssetPart (
        id, assetId, itemId, partNumber, sapNumber, partName, description,
        manufacturer, modelNumber, unitOfMeasure, quantity, isPrimary,
        componentClassification, maintenanceTimeMinutes,
        maintenanceInterval, lastReplacedDate, nextReplacementDue,
        notes, createdById, createdAt, updatedAt,
        pmType, smpNumber, frequencyPM, machineStopRequired,
        inspectionStandard, frequencyAM, qaMatrixNo, qmMatrixNo,
        kaizenType, kaizenNo, storeroomLocation, vendor, drawingPicture
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.assetId,
        data.itemId || null,
        data.partNumber || null,
        data.sapNumber || null,
        data.partName || null,
        data.description || null,
        data.manufacturer || null,
        data.modelNumber || null,
        data.unitOfMeasure || 'EA',
        data.quantity,
        data.isPrimary ? 1 : 0,
        data.componentClassification || null,
        data.maintenanceTimeMinutes || null,
        data.maintenanceInterval || null,
        data.lastReplacedDate || null,
        data.nextReplacementDue || null,
        data.notes || null,
        data.createdById,
        data.pmType || null,
        data.smpNumber || null,
        data.frequencyPM || null,
        data.machineStopRequired || null,
        data.inspectionStandard || null,
        data.frequencyAM || null,
        data.qaMatrixNo || null,
        data.qmMatrixNo || null,
        data.kaizenType || null,
        data.kaizenNo || null,
        data.storeroomLocation || null,
        data.vendor || null,
        data.drawingPicture || null,
      ]
    );

    return this.getAssetPart(id);
  }

  /**
   * Bulk add multiple parts to an asset (for importing hundreds/thousands of parts)
   * Supports both standalone BOM entries and inventory-linked parts
   */
  async bulkAddPartsToAsset(data: BulkAddAssetPartsDto) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ part: string; error: string }>,
    };

    for (const part of data.parts) {
      try {
        const id = randomBytes(16).toString('hex');
        const partIdentifier = part.itemId || part.partNumber || `Part ${results.success + results.failed + 1}`;

        // Check if already exists (by itemId or partNumber)
        let existing;
        if (part.itemId) {
          existing = await this.db.query(
            'SELECT id FROM AssetPart WHERE assetId = ? AND itemId = ?',
            [data.assetId, part.itemId]
          );
        } else if (part.partNumber) {
          existing = await this.db.query(
            'SELECT id FROM AssetPart WHERE assetId = ? AND partNumber = ?',
            [data.assetId, part.partNumber]
          );
        }

        if (existing && existing.length > 0) {
          // Update existing instead
          await this.db.execute(
            `UPDATE AssetPart
             SET quantity = ?, isPrimary = ?, maintenanceInterval = ?,
                 notes = ?, updatedAt = datetime('now')
             WHERE id = ?`,
            [
              part.quantity,
              part.isPrimary ? 1 : 0,
              part.maintenanceInterval || null,
              part.notes || null,
              existing[0].id,
            ]
          );
        } else {
          await this.db.execute(
            `INSERT INTO AssetPart (
              id, assetId, itemId, partNumber, sapNumber, partName, description,
              manufacturer, modelNumber, unitOfMeasure, quantity, isPrimary,
              componentClassification, maintenanceTimeMinutes,
              maintenanceInterval, notes, createdById, createdAt, updatedAt,
              pmType, smpNumber, frequencyPM, machineStopRequired,
              inspectionStandard, frequencyAM, qaMatrixNo, qmMatrixNo,
              kaizenType, kaizenNo, storeroomLocation, vendor, drawingPicture
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              data.assetId,
              part.itemId || null,
              part.partNumber || null,
              part.sapNumber || null,
              part.partName || null,
              part.description || null,
              part.manufacturer || null,
              part.modelNumber || null,
              part.unitOfMeasure || 'EA',
              part.quantity,
              part.isPrimary ? 1 : 0,
              part.componentClassification || null,
              part.maintenanceTimeMinutes || null,
              part.maintenanceInterval || null,
              part.notes || null,
              data.createdById,
              part.pmType || null,
              part.smpNumber || null,
              part.frequencyPM || null,
              part.machineStopRequired || null,
              part.inspectionStandard || null,
              part.frequencyAM || null,
              part.qaMatrixNo || null,
              part.qmMatrixNo || null,
              part.kaizenType || null,
              part.kaizenNo || null,
              part.storeroomLocation || null,
              part.vendor || null,
              part.drawingPicture || null,
            ]
          );
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          part: part.itemId || part.partNumber || 'Unknown',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get all parts for an asset
   * Includes both standalone BOM entries and inventory-linked parts
   */
  async getAssetParts(assetId: string) {
    const parts = await this.db.query(
      `SELECT
        ap.*,
        ii.partNumber as inv_partNumber,
        ii.name as inv_name,
        ii.description as inv_description,
        ii.manufacturer as inv_manufacturer,
        ii.modelNumber as inv_modelNumber,
        ii.unitOfMeasure as inv_unitOfMeasure,
        ii.unitCost,
        ii.currency,
        ic.name as categoryName,
        COALESCE(SUM(ist.quantity), 0) as totalStock,
        COALESCE(SUM(ist.availableQuantity), 0) as availableStock
      FROM AssetPart ap
      LEFT JOIN InventoryItem ii ON ap.itemId = ii.id
      LEFT JOIN InventoryCategory ic ON ii.categoryId = ic.id
      LEFT JOIN InventoryStock ist ON ii.id = ist.itemId
      WHERE ap.assetId = ?
      GROUP BY ap.id
      ORDER BY ap.isPrimary DESC, COALESCE(ap.partName, ii.name) ASC`,
      [assetId]
    );

    return parts.map(p => this.formatAssetPart(p));
  }

  /**
   * Get a single asset part
   */
  async getAssetPart(id: string) {
    const parts = await this.db.query(
      `SELECT
        ap.*,
        ii.partNumber as inv_partNumber,
        ii.name as inv_name,
        ii.description as inv_description,
        ii.manufacturer as inv_manufacturer,
        ii.modelNumber as inv_modelNumber,
        ii.unitOfMeasure as inv_unitOfMeasure,
        ii.unitCost,
        ii.currency
      FROM AssetPart ap
      LEFT JOIN InventoryItem ii ON ap.itemId = ii.id
      WHERE ap.id = ?`,
      [id]
    );

    if (!parts || parts.length === 0) {
      return null;
    }

    return this.formatAssetPart(parts[0]);
  }

  /**
   * Update an asset part
   */
  async updateAssetPart(id: string, data: UpdateAssetPartDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(data.quantity);
    }
    if (data.isPrimary !== undefined) {
      updates.push('isPrimary = ?');
      values.push(data.isPrimary ? 1 : 0);
    }
    if (data.maintenanceInterval !== undefined) {
      updates.push('maintenanceInterval = ?');
      values.push(data.maintenanceInterval);
    }
    if (data.lastReplacedDate !== undefined) {
      updates.push('lastReplacedDate = ?');
      values.push(data.lastReplacedDate);
    }
    if (data.nextReplacementDue !== undefined) {
      updates.push('nextReplacementDue = ?');
      values.push(data.nextReplacementDue);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE AssetPart SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getAssetPart(id);
  }

  /**
   * Remove a part from an asset
   */
  async removePartFromAsset(id: string) {
    await this.db.execute('DELETE FROM AssetPart WHERE id = ?', [id]);
    return { id };
  }

  /**
   * Remove multiple parts from an asset at once
   */
  async bulkRemovePartsFromAsset(assetId: string, itemIds: string[]) {
    if (itemIds.length === 0) {
      return { deleted: 0 };
    }

    const placeholders = itemIds.map(() => '?').join(',');
    const result = await this.db.execute(
      `DELETE FROM AssetPart WHERE assetId = ? AND itemId IN (${placeholders})`,
      [assetId, ...itemIds]
    );

    return { deleted: itemIds.length };
  }

  /**
   * Get assets that use a specific part
   */
  async getAssetsUsingPart(itemId: string, organizationId: string) {
    const assets = await this.db.query(
      `SELECT
        a.id,
        a.assetNumber,
        a.name,
        a.category,
        a.status,
        ap.quantity,
        ap.isPrimary,
        ap.maintenanceInterval,
        ap.lastReplacedDate,
        ap.nextReplacementDue
      FROM AssetPart ap
      JOIN Asset a ON ap.assetId = a.id
      WHERE ap.itemId = ? AND a.organizationId = ?
      ORDER BY a.name ASC`,
      [itemId, organizationId]
    );

    return assets;
  }

  /**
   * Search inventory items to add to asset (with filters)
   */
  async searchInventoryItems(
    organizationId: string,
    searchTerm?: string,
    categoryId?: string,
    limit: number = 50
  ) {
    let query = `
      SELECT
        ii.*,
        ic.name as categoryName,
        COALESCE(SUM(ist.quantity), 0) as totalStock,
        COALESCE(SUM(ist.availableQuantity), 0) as availableStock
      FROM InventoryItem ii
      LEFT JOIN InventoryCategory ic ON ii.categoryId = ic.id
      LEFT JOIN InventoryStock ist ON ii.id = ist.itemId
      WHERE ii.organizationId = ? AND ii.isActive = 1
    `;

    const params: any[] = [organizationId];

    if (searchTerm) {
      query += ` AND (ii.partNumber LIKE ? OR ii.name LIKE ? OR ii.description LIKE ?)`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (categoryId) {
      query += ` AND ii.categoryId = ?`;
      params.push(categoryId);
    }

    query += ` GROUP BY ii.id ORDER BY ii.name ASC LIMIT ?`;
    params.push(limit);

    const items = await this.db.query(query, params);
    return items;
  }

  private formatAssetPart(row: any) {
    // Use standalone part data if available, otherwise use inventory data
    const partNumber = row.partNumber || row.inv_partNumber;
    const sapNumber = row.sapNumber; // SAP number is only in BOM, not in inventory
    const partName = row.partName || row.inv_name;
    const description = row.description || row.inv_description;
    const manufacturer = row.manufacturer || row.inv_manufacturer;
    const modelNumber = row.modelNumber || row.inv_modelNumber;
    const unitOfMeasure = row.unitOfMeasure || row.inv_unitOfMeasure || 'EA';

    return {
      id: row.id,
      assetId: row.assetId,
      itemId: row.itemId,
      // Standalone part fields (BOM data)
      partNumber,
      sapNumber,
      partName,
      description,
      manufacturer,
      modelNumber,
      unitOfMeasure,
      quantity: row.quantity,
      isPrimary: row.isPrimary === 1,
      componentClassification: row.componentClassification,
      maintenanceTimeMinutes: row.maintenanceTimeMinutes,
      maintenanceInterval: row.maintenanceInterval,
      lastReplacedDate: row.lastReplacedDate,
      nextReplacementDue: row.nextReplacementDue,
      notes: row.notes,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      // Inventory data (if linked)
      inventory: row.itemId ? {
        unitCost: row.unitCost,
        currency: row.currency,
        categoryName: row.categoryName,
        totalStock: row.totalStock,
        availableStock: row.availableStock,
      } : null,
    };
  }
}
