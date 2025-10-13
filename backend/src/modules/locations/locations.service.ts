import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreateLocationDto {
  organizationId: string;
  name: string;
  type?: string; // Building, Floor, Room, Site
  parentId?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationDto {
  name?: string;
  type?: string;
  parentId?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class LocationsService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateLocationDto) {
    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO Location (
        id, organizationId, name, type, parentId, address, city, latitude, longitude,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.organizationId,
        data.name,
        data.type || null,
        data.parentId || null,
        data.address || null,
        data.city || null,
        data.latitude || null,
        data.longitude || null,
      ]
    );

    // Fetch the created location with assets
    const locations = await this.db.query(
      'SELECT * FROM Location WHERE id = ?',
      [id]
    );

    const location = locations[0];

    // Fetch assets for this location
    const assets = await this.db.query(
      `SELECT id, assetNumber, name FROM Asset WHERE locationId = ?`,
      [id]
    );

    location.assets = assets;

    return location;
  }

  async findAll(organizationId: string) {
    const locations = await this.db.query(
      `SELECT * FROM Location
      WHERE organizationId = ?
      ORDER BY createdAt DESC`,
      [organizationId]
    );

    // Fetch assets for each location
    for (const location of locations) {
      const assets = await this.db.query(
        `SELECT id, assetNumber, name, status FROM Asset WHERE locationId = ?`,
        [location.id]
      );
      location.assets = assets;
    }

    return locations;
  }

  async findOne(id: string) {
    const locations = await this.db.query(
      'SELECT * FROM Location WHERE id = ?',
      [id]
    );

    if (locations.length === 0) {
      return null;
    }

    const location = locations[0];

    // Fetch assets with creator info
    const assets = await this.db.query(
      `SELECT
        a.*,
        u.id as createdBy_id, u.email as createdBy_email,
        u.firstName as createdBy_firstName, u.lastName as createdBy_lastName
      FROM Asset a
      LEFT JOIN User u ON a.createdById = u.id
      WHERE a.locationId = ?`,
      [id]
    );

    location.assets = assets.map(asset => ({
      ...asset,
      createdBy: asset.createdBy_id ? {
        id: asset.createdBy_id,
        email: asset.createdBy_email,
        firstName: asset.createdBy_firstName,
        lastName: asset.createdBy_lastName,
      } : null,
    }));

    return location;
  }

  async update(id: string, data: UpdateLocationDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.parentId !== undefined) {
      updates.push('parentId = ?');
      values.push(data.parentId);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(data.longitude);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE Location SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch the updated location with assets
    const locations = await this.db.query(
      'SELECT * FROM Location WHERE id = ?',
      [id]
    );

    const location = locations[0];

    // Fetch assets for this location
    const assets = await this.db.query(
      `SELECT id, assetNumber, name FROM Asset WHERE locationId = ?`,
      [id]
    );

    location.assets = assets;

    return location;
  }

  async remove(id: string) {
    // Check if location has assets
    const assets = await this.db.query(
      'SELECT COUNT(*) as count FROM Asset WHERE locationId = ?',
      [id]
    );

    const assetCount = assets[0].count;

    if (assetCount > 0) {
      throw new Error(
        `Cannot delete location with ${assetCount} assets. Please reassign assets first.`,
      );
    }

    await this.db.execute('DELETE FROM Location WHERE id = ?', [id]);
    return { id };
  }

  async getLocationStats(organizationId: string) {
    const locations = await this.db.query(
      'SELECT * FROM Location WHERE organizationId = ?',
      [organizationId]
    );

    const stats: any[] = [];

    for (const location of locations) {
      const assets = await this.db.query(
        'SELECT status FROM Asset WHERE locationId = ?',
        [location.id]
      );

      stats.push({
        id: location.id,
        name: location.name,
        type: location.type,
        totalAssets: assets.length,
        operationalAssets: assets.filter((a: any) => a.status === 'operational').length,
        downAssets: assets.filter((a: any) => a.status === 'down').length,
        maintenanceAssets: assets.filter((a: any) => a.status === 'maintenance').length,
      });
    }

    return stats;
  }
}
