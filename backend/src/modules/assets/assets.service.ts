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
  maintenanceParts?: string;
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
  maintenanceParts?: string;
}

@Injectable()
export class AssetsService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateAssetDto) {
    // Validate required fields
    if (!data.assetNumber || data.assetNumber.trim() === '') {
      throw new Error('Asset Number is required.');
    }

    if (!data.name || data.name.trim() === '') {
      throw new Error('Asset Name is required.');
    }

    // Validate assetNumber uniqueness within organization
    const existingAsset = await this.db.query(
      'SELECT id, assetNumber FROM Asset WHERE assetNumber = ? AND organizationId = ?',
      [data.assetNumber, data.organizationId]
    );

    if (existingAsset && existingAsset.length > 0) {
      throw new Error(`Asset Number '${data.assetNumber}' already exists in your organization. Please use a unique asset number.`);
    }

    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO Asset (
        id, assetNumber, name, description, category, manufacturer, model,
        serialNumber, purchaseDate, purchaseCost, warrantyExpiresAt, status,
        criticality, locationId, parentAssetId, imageUrl, customFields,
        maintenanceParts, organizationId, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
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
        data.maintenanceParts || null,
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
    if (data.maintenanceParts !== undefined) {
      updates.push('maintenanceParts = ?');
      values.push(data.maintenanceParts);
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

  async getMaintenanceHistory(assetId: string) {
    // Fetch asset details
    const assets = await this.db.query(
      `SELECT a.*, l.name as location_name
       FROM Asset a
       LEFT JOIN Location l ON a.locationId = l.id
       WHERE a.id = ?`,
      [assetId]
    );

    if (!assets || assets.length === 0) {
      throw new Error('Asset not found');
    }

    const asset = assets[0];

    // Fetch all work orders for this asset
    const workOrders = await this.db.query(
      `SELECT
        wo.*,
        assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName,
        creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName
       FROM WorkOrder wo
       LEFT JOIN User assigned ON wo.assignedToId = assigned.id
       LEFT JOIN User creator ON wo.createdById = creator.id
       WHERE wo.assetId = ?
       ORDER BY wo.createdAt DESC`,
      [assetId]
    );

    // Fetch all PM schedules for this asset
    const pmSchedules = await this.db.query(
      `SELECT
        pm.*,
        assigned.firstName as assignedTo_firstName,
        assigned.lastName as assignedTo_lastName
       FROM PMSchedule pm
       LEFT JOIN User assigned ON pm.assignedToId = assigned.id
       WHERE pm.assetId = ?
       ORDER BY pm.createdAt DESC`,
      [assetId]
    );

    // Calculate maintenance statistics
    const completedWorkOrders = workOrders.filter((wo: any) => wo.status === 'completed');
    const totalMaintenanceCost = completedWorkOrders.reduce((sum: number, wo: any) => {
      return sum + (wo.actualCost || 0);
    }, 0);

    const totalMaintenanceHours = completedWorkOrders.reduce((sum: number, wo: any) => {
      return sum + (wo.actualHours || 0);
    }, 0);

    // Calculate downtime (completed WOs with actual hours)
    const totalDowntimeHours = workOrders
      .filter((wo: any) => wo.type === 'corrective' && wo.status === 'completed')
      .reduce((sum: number, wo: any) => sum + (wo.actualHours || 0), 0);

    // Get maintenance timeline (work orders + PM completions combined)
    const timeline: any[] = [];

    // Fetch parts used in each work order
    const workOrderPartsMap = new Map();
    for (const wo of workOrders) {
      try {
        const parts = await this.db.query(
          `SELECT
            wop.*,
            ii.partNumber,
            ii.name as partName,
            ii.description as partDescription,
            ii.manufacturer,
            ii.modelNumber
          FROM WorkOrderPart wop
          LEFT JOIN InventoryItem ii ON wop.itemId = ii.id
          WHERE wop.workOrderId = ?`,
          [wo.id]
        );
        workOrderPartsMap.set(wo.id, parts || []);
      } catch (e) {
        workOrderPartsMap.set(wo.id, []);
      }
    }

    // Add work orders to timeline
    workOrders.forEach((wo: any) => {
      const parts = workOrderPartsMap.get(wo.id) || [];
      timeline.push({
        id: wo.id,
        type: 'work_order',
        date: wo.completedAt || wo.createdAt,
        title: wo.title,
        description: wo.description,
        status: wo.status,
        workOrderNumber: wo.workOrderNumber,
        workOrderType: wo.type,
        priority: wo.priority,
        assignedTo: wo.assignedTo_firstName
          ? `${wo.assignedTo_firstName} ${wo.assignedTo_lastName}`
          : 'Unassigned',
        cost: wo.actualCost || 0,
        hours: wo.actualHours || 0,
        notes: wo.notes,
        componentClassification: wo.componentClassification,
        maintenanceTimeMinutes: wo.maintenanceTimeMinutes,
        machineHoursAtMaintenance: wo.machineHoursAtMaintenance,
        partsUsed: parts.map((p: any) => ({
          id: p.id,
          partNumber: p.partNumber,
          partName: p.partName,
          description: p.partDescription,
          manufacturer: p.manufacturer,
          modelNumber: p.modelNumber,
          quantityPlanned: p.quantityPlanned,
          quantityUsed: p.quantityUsed,
          unitCost: p.unitCost,
          totalCost: p.totalCost,
          status: p.status,
          notes: p.notes
        }))
      });
    });

    // Add PM completions to timeline
    pmSchedules.forEach((pm: any) => {
      if (pm.lastCompleted) {
        let parsedParts = null;
        if (pm.parts) {
          try {
            parsedParts = JSON.parse(pm.parts);
          } catch (e) {
            console.error('Failed to parse PM parts:', e);
          }
        }

        timeline.push({
          id: pm.id,
          type: 'pm_completion',
          date: pm.lastCompleted,
          title: pm.name,
          description: pm.description,
          status: 'completed',
          frequency: pm.frequency,
          assignedTo: pm.assignedTo_firstName
            ? `${pm.assignedTo_firstName} ${pm.assignedTo_lastName}`
            : 'Unassigned',
          estimatedHours: pm.estimatedHours || 0,
          parts: parsedParts,
          componentClassification: pm.componentClassification,
          activityFrequencyWeeks: pm.activityFrequencyWeeks,
          basedOnMachineCycle: pm.basedOnMachineCycle === 1,
          machineCycleInterval: pm.machineCycleInterval,
          maintenanceTimeMinutes: pm.maintenanceTimeMinutes,
        });
      }
    });

    // Sort timeline by date (most recent first)
    timeline.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    // Calculate MTBF (Mean Time Between Failures) - time between corrective work orders
    const correctiveWorkOrders = workOrders
      .filter((wo: any) => wo.type === 'corrective' && wo.completedAt)
      .sort((a: any, b: any) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    let mtbf: number | null = null;
    if (correctiveWorkOrders.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < correctiveWorkOrders.length; i++) {
        const prevDate = new Date(correctiveWorkOrders[i - 1].completedAt).getTime();
        const currDate = new Date(correctiveWorkOrders[i].completedAt).getTime();
        intervals.push((currDate - prevDate) / (1000 * 60 * 60 * 24)); // Convert to days
      }
      mtbf = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    }

    // Calculate MTTR (Mean Time To Repair) - average time to complete corrective work orders
    let mttr: number | null = null;
    if (correctiveWorkOrders.length > 0) {
      const totalRepairHours = correctiveWorkOrders.reduce(
        (sum: number, wo: any) => sum + (wo.actualHours || 0),
        0
      );
      mttr = totalRepairHours / correctiveWorkOrders.length;
    }

    return {
      asset: {
        id: asset.id,
        assetNumber: asset.assetNumber,
        name: asset.name,
        description: asset.description,
        category: asset.category,
        manufacturer: asset.manufacturer,
        model: asset.model,
        serialNumber: asset.serialNumber,
        status: asset.status,
        criticality: asset.criticality,
        location: asset.location_name,
        purchaseDate: asset.purchaseDate,
        purchaseCost: asset.purchaseCost,
      },
      statistics: {
        totalWorkOrders: workOrders.length,
        completedWorkOrders: completedWorkOrders.length,
        openWorkOrders: workOrders.filter((wo: any) => wo.status === 'open' || wo.status === 'in_progress').length,
        preventiveWorkOrders: workOrders.filter((wo: any) => wo.type === 'preventive').length,
        correctiveWorkOrders: workOrders.filter((wo: any) => wo.type === 'corrective').length,
        totalPMSchedules: pmSchedules.length,
        activePMSchedules: pmSchedules.filter((pm: any) => pm.status === 'active').length,
        totalMaintenanceCost,
        totalMaintenanceHours,
        totalDowntimeHours,
        mtbf: mtbf ? Math.round(mtbf * 10) / 10 : null, // Round to 1 decimal
        mttr: mttr ? Math.round(mttr * 10) / 10 : null,
      },
      workOrders: workOrders.map((wo: any) => ({
        id: wo.id,
        workOrderNumber: wo.workOrderNumber,
        title: wo.title,
        description: wo.description,
        type: wo.type,
        priority: wo.priority,
        status: wo.status,
        assignedTo: wo.assignedTo_firstName
          ? `${wo.assignedTo_firstName} ${wo.assignedTo_lastName}`
          : 'Unassigned',
        createdBy: wo.createdBy_firstName
          ? `${wo.createdBy_firstName} ${wo.createdBy_lastName}`
          : 'Unknown',
        createdAt: wo.createdAt,
        completedAt: wo.completedAt,
        scheduledStart: wo.scheduledStart,
        actualHours: wo.actualHours || 0,
        estimatedHours: wo.estimatedHours || 0,
        actualCost: wo.actualCost || 0,
        notes: wo.notes,
      })),
      pmSchedules: pmSchedules.map((pm: any) => {
        let parsedParts = null;
        if (pm.parts) {
          try {
            parsedParts = JSON.parse(pm.parts);
          } catch (e) {
            console.error('Failed to parse PM parts:', e);
          }
        }

        return {
          id: pm.id,
          name: pm.name,
          description: pm.description,
          frequency: pm.frequency,
          status: pm.status,
          priority: pm.priority,
          assignedTo: pm.assignedTo_firstName
            ? `${pm.assignedTo_firstName} ${pm.assignedTo_lastName}`
            : 'Unassigned',
          lastCompleted: pm.lastCompleted,
          nextDue: pm.nextDue,
          estimatedHours: pm.estimatedHours || 0,
          parts: parsedParts,
          createdAt: pm.createdAt,
        };
      }),
      timeline,
    };
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
      powerState: row.powerState,
      locationId: row.locationId,
      parentAssetId: row.parentAssetId,
      imageUrl: row.imageUrl,
      customFields: row.customFields,
      maintenanceParts: row.maintenanceParts,
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
