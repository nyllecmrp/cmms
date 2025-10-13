import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreateAssetDto {
  assetNumber: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyExpiresAt?: string;
  status?: string;
  criticality?: string;
  locationId?: string;
  parentAssetId?: string;
  imageUrl?: string;
  customFields?: string;
  organizationId: string;
  createdById: string;
}

export interface UpdateAssetDto {
  assetNumber?: string;
  name?: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyExpiresAt?: string;
  status?: string;
  criticality?: string;
  locationId?: string;
  parentAssetId?: string;
  imageUrl?: string;
  customFields?: string;
}

@Injectable()
export class AssetsService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateAssetDto) {
    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO Asset (
        id, assetNumber, name, description, category, manufacturer, model,
        serialNumber, purchaseDate, purchaseCost, warrantyExpiresAt, status,
        criticality, locationId, parentAssetId, imageUrl, customFields,
        organizationId, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.assetNumber,
        data.name,
        data.description || null,
        data.category || null,
        data.manufacturer || null,
        data.model || null,
        data.serialNumber || null,
        data.purchaseDate || null,
        data.purchaseCost || null,
        data.warrantyExpiresAt || null,
        data.status || 'operational',
        data.criticality || 'medium',
        data.locationId || null,
        data.parentAssetId || null,
        data.imageUrl || null,
        data.customFields || null,
        data.organizationId,
        data.createdById,
      ]
    );

    // Fetch the created asset with relations
    const assets = await this.db.query(
      `SELECT
        a.*,
        l.id as location_id, l.name as location_name, l.type as location_type,
        u.id as createdBy_id, u.email as createdBy_email,
        u.firstName as createdBy_firstName, u.lastName as createdBy_lastName
      FROM Asset a
      LEFT JOIN Location l ON a.locationId = l.id
      LEFT JOIN User u ON a.createdById = u.id
      WHERE a.id = ?`,
      [id]
    );

    return this.formatAssetWithRelations(assets[0]);
  }

  async findAll(organizationId: string) {
    const assets = await this.db.query(
      `SELECT
        a.*,
        l.id as location_id, l.name as location_name, l.type as location_type,
        u.id as createdBy_id, u.email as createdBy_email,
        u.firstName as createdBy_firstName, u.lastName as createdBy_lastName
      FROM Asset a
      LEFT JOIN Location l ON a.locationId = l.id
      LEFT JOIN User u ON a.createdById = u.id
      WHERE a.organizationId = ?
      ORDER BY a.createdAt DESC`,
      [organizationId]
    );

    return assets.map(asset => this.formatAssetWithRelations(asset));
  }

  async findOne(id: string) {
    const assets = await this.db.query(
      `SELECT
        a.*,
        l.id as location_id, l.name as location_name, l.type as location_type,
        u.id as createdBy_id, u.email as createdBy_email,
        u.firstName as createdBy_firstName, u.lastName as createdBy_lastName
      FROM Asset a
      LEFT JOIN Location l ON a.locationId = l.id
      LEFT JOIN User u ON a.createdById = u.id
      WHERE a.id = ?`,
      [id]
    );

    if (assets.length === 0) {
      return null;
    }

    const asset = this.formatAssetWithRelations(assets[0]);

    // Fetch work orders for this asset
    const workOrders = await this.db.query(
      `SELECT * FROM WorkOrder
      WHERE assetId = ?
      ORDER BY createdAt DESC
      LIMIT 10`,
      [id]
    );

    asset.workOrders = workOrders;

    return asset;
  }

  async update(id: string, data: UpdateAssetDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.assetNumber !== undefined) {
      updates.push('assetNumber = ?');
      values.push(data.assetNumber);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.manufacturer !== undefined) {
      updates.push('manufacturer = ?');
      values.push(data.manufacturer);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      values.push(data.model);
    }
    if (data.serialNumber !== undefined) {
      updates.push('serialNumber = ?');
      values.push(data.serialNumber);
    }
    if (data.purchaseDate !== undefined) {
      updates.push('purchaseDate = ?');
      values.push(data.purchaseDate);
    }
    if (data.purchaseCost !== undefined) {
      updates.push('purchaseCost = ?');
      values.push(data.purchaseCost);
    }
    if (data.warrantyExpiresAt !== undefined) {
      updates.push('warrantyExpiresAt = ?');
      values.push(data.warrantyExpiresAt);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.criticality !== undefined) {
      updates.push('criticality = ?');
      values.push(data.criticality);
    }
    if (data.locationId !== undefined) {
      updates.push('locationId = ?');
      values.push(data.locationId);
    }
    if (data.parentAssetId !== undefined) {
      updates.push('parentAssetId = ?');
      values.push(data.parentAssetId);
    }
    if (data.imageUrl !== undefined) {
      updates.push('imageUrl = ?');
      values.push(data.imageUrl);
    }
    if (data.customFields !== undefined) {
      updates.push('customFields = ?');
      values.push(data.customFields);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE Asset SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch the updated asset with relations
    const assets = await this.db.query(
      `SELECT
        a.*,
        l.id as location_id, l.name as location_name, l.type as location_type,
        u.id as createdBy_id, u.email as createdBy_email,
        u.firstName as createdBy_firstName, u.lastName as createdBy_lastName
      FROM Asset a
      LEFT JOIN Location l ON a.locationId = l.id
      LEFT JOIN User u ON a.createdById = u.id
      WHERE a.id = ?`,
      [id]
    );

    return this.formatAssetWithRelations(assets[0]);
  }

  async remove(id: string) {
    await this.db.execute('DELETE FROM Asset WHERE id = ?', [id]);
    return { id };
  }

  async getStatsByCategory(organizationId: string) {
    const stats = await this.db.query(
      `SELECT category, COUNT(*) as count
      FROM Asset
      WHERE organizationId = ? AND category IS NOT NULL
      GROUP BY category`,
      [organizationId]
    );

    return stats.reduce((acc, item) => {
      acc[item.category] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  private formatAssetWithRelations(row: any) {
    if (!row) return null;

    const asset: any = {
      id: row.id,
      assetNumber: row.assetNumber,
      name: row.name,
      description: row.description,
      category: row.category,
      manufacturer: row.manufacturer,
      model: row.model,
      serialNumber: row.serialNumber,
      purchaseDate: row.purchaseDate,
      purchaseCost: row.purchaseCost,
      warrantyExpiresAt: row.warrantyExpiresAt,
      status: row.status,
      criticality: row.criticality,
      locationId: row.locationId,
      parentAssetId: row.parentAssetId,
      imageUrl: row.imageUrl,
      customFields: row.customFields,
      organizationId: row.organizationId,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    if (row.location_id) {
      asset.location = {
        id: row.location_id,
        name: row.location_name,
        type: row.location_type,
      };
    }

    if (row.createdBy_id) {
      asset.createdBy = {
        id: row.createdBy_id,
        email: row.createdBy_email,
        firstName: row.createdBy_firstName,
        lastName: row.createdBy_lastName,
      };
    }

    return asset;
  }
}
