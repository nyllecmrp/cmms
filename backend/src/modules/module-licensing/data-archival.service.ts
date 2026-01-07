import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';
import { ModuleCode, ModuleStatus } from '../../common/constants/modules.constant';

export interface ArchivalRecord {
  id: string;
  organizationId: string;
  moduleCode: string;
  tableName: string;
  recordId: string;
  data: any;
  archivedAt: Date;
  expiresAt: Date; // When to permanently delete (default: 90 days from archival)
  status: 'archived' | 'restored' | 'deleted';
}

@Injectable()
export class DataArchivalService {
  constructor(private db: DatabaseService) {}

  /**
   * Archive data from inactive modules
   */
  async archiveModuleData(
    organizationId: string,
    moduleCode: ModuleCode,
    retentionDays: number = 90,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    // Map module codes to their associated tables
    const moduleTableMapping = this.getModuleTableMapping(moduleCode);

    const archivedRecords: any[] = [];

    for (const tableName of moduleTableMapping) {
      try {
        // Get all records for this organization from the table
        const records = await this.db.query(
          `SELECT * FROM ${tableName} WHERE organizationId = ?`,
          [organizationId]
        );

        for (const record of records) {
          // Create archival record
          const archiveId = randomBytes(16).toString('hex');
          await this.db.execute(
            `INSERT INTO DataArchive (
              id, organizationId, moduleCode, tableName, recordId,
              data, archivedAt, expiresAt, status
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
            [
              archiveId,
              organizationId,
              moduleCode,
              tableName,
              record.id,
              JSON.stringify(record),
              expiresAt.toISOString(),
              'archived',
            ]
          );

          archivedRecords.push({
            archiveId,
            tableName,
            recordId: record.id,
          });
        }

        // Optionally: Delete original records (soft delete or hard delete)
        // For now, we'll keep them but mark as archived
        // await this.db.execute(
        //   `DELETE FROM ${tableName} WHERE organizationId = ?`,
        //   [organizationId]
        // );
      } catch (error) {
        console.error(`Failed to archive data from ${tableName}:`, error);
      }
    }

    return {
      success: true,
      archivedCount: archivedRecords.length,
      records: archivedRecords,
    };
  }

  /**
   * Restore archived data when module is reactivated
   */
  async restoreModuleData(organizationId: string, moduleCode: ModuleCode) {
    const archives = await this.db.query(
      `SELECT * FROM DataArchive
      WHERE organizationId = ? AND moduleCode = ? AND status = ?`,
      [organizationId, moduleCode, 'archived']
    );

    const restoredRecords: any[] = [];

    for (const archive of archives) {
      try {
        const data = JSON.parse(archive.data);
        const tableName = archive.tableName;

        // Check if record still exists
        const existing = await this.db.query(
          `SELECT id FROM ${tableName} WHERE id = ?`,
          [archive.recordId]
        );

        if (existing.length === 0) {
          // Restore the record
          const columns = Object.keys(data).join(', ');
          const placeholders = Object.keys(data).map(() => '?').join(', ');
          const values = Object.values(data);

          await this.db.execute(
            `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
            values
          );
        }

        // Mark archive as restored
        await this.db.execute(
          `UPDATE DataArchive SET status = ?, updatedAt = datetime('now')
          WHERE id = ?`,
          ['restored', archive.id]
        );

        restoredRecords.push({
          tableName,
          recordId: archive.recordId,
        });
      } catch (error) {
        console.error(`Failed to restore record from ${archive.tableName}:`, error);
      }
    }

    return {
      success: true,
      restoredCount: restoredRecords.length,
      records: restoredRecords,
    };
  }

  /**
   * Permanently delete expired archives
   */
  async deleteExpiredArchives() {
    const now = new Date();

    const expiredArchives = await this.db.query(
      `SELECT * FROM DataArchive WHERE expiresAt < ? AND status = ?`,
      [now.toISOString(), 'archived']
    );

    for (const archive of expiredArchives) {
      // Mark as deleted instead of physically removing
      await this.db.execute(
        `UPDATE DataArchive SET status = ?, updatedAt = datetime('now')
        WHERE id = ?`,
        ['deleted', archive.id]
      );
    }

    return {
      success: true,
      deletedCount: expiredArchives.length,
    };
  }

  /**
   * Get archived data for an organization
   */
  async getArchivedData(organizationId: string, moduleCode?: ModuleCode) {
    let query = `SELECT * FROM DataArchive WHERE organizationId = ? AND status = ?`;
    const params: any[] = [organizationId, 'archived'];

    if (moduleCode) {
      query += ' AND moduleCode = ?';
      params.push(moduleCode);
    }

    query += ' ORDER BY archivedAt DESC';

    const archives = await this.db.query(query, params);
    return archives;
  }

  /**
   * Export archived data (for customer download before deletion)
   */
  async exportArchivedData(organizationId: string, moduleCode: ModuleCode) {
    const archives = await this.db.query(
      `SELECT * FROM DataArchive
      WHERE organizationId = ? AND moduleCode = ? AND status = ?`,
      [organizationId, moduleCode, 'archived']
    );

    // Group by table name
    const exportData: Record<string, any[]> = {};

    for (const archive of archives) {
      const tableName = archive.tableName;
      if (!exportData[tableName]) {
        exportData[tableName] = [];
      }
      exportData[tableName].push(JSON.parse(archive.data));
    }

    return {
      organizationId,
      moduleCode,
      archivedAt: new Date().toISOString(),
      retentionDays: 90,
      data: exportData,
    };
  }

  /**
   * Map module codes to database tables that contain their data
   */
  private getModuleTableMapping(moduleCode: ModuleCode): string[] {
    const mapping: Record<string, string[]> = {
      [ModuleCode.PREVENTIVE_MAINTENANCE]: ['PMSchedule', 'PMTask'],
      [ModuleCode.INVENTORY_MANAGEMENT]: ['InventoryItem', 'StockTransaction'],
      [ModuleCode.PURCHASING_PROCUREMENT]: ['PurchaseRequest', 'PurchaseOrder'],
      [ModuleCode.DOCUMENT_MANAGEMENT]: ['Document', 'DocumentVersion'],
      [ModuleCode.CALIBRATION_MANAGEMENT]: ['CalibrationRecord'],
      [ModuleCode.SAFETY_COMPLIANCE]: ['SafetyIncident', 'SafetyInspection'],
      [ModuleCode.VENDOR_MANAGEMENT]: ['Vendor', 'VendorContract'],
      [ModuleCode.PREDICTIVE_MAINTENANCE]: ['SensorData', 'PredictiveAlert'],
      [ModuleCode.ADVANCED_ANALYTICS]: ['CustomReport', 'Dashboard'],
      [ModuleCode.PROJECT_MANAGEMENT]: ['Project', 'ProjectTask'],
      [ModuleCode.ENERGY_MANAGEMENT]: ['EnergyReading', 'UtilityBill'],
      [ModuleCode.FAILURE_ANALYSIS]: ['FailureReport', 'RootCauseAnalysis'],
      [ModuleCode.AUDIT_QUALITY]: ['Audit', 'AuditFinding'],
      // Add more mappings as needed
    };

    return mapping[moduleCode] || [];
  }

  /**
   * Get storage size of archived data for an organization
   */
  async getArchiveStorageSize(organizationId: string): Promise<number> {
    const archives = await this.db.query(
      `SELECT data FROM DataArchive WHERE organizationId = ? AND status = ?`,
      [organizationId, 'archived']
    );

    let totalSize = 0;
    for (const archive of archives) {
      totalSize += JSON.stringify(archive.data).length;
    }

    return totalSize; // Size in bytes
  }
}
