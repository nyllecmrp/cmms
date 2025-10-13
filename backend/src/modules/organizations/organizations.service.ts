import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const organizations = await this.db.query(`
      SELECT
        o.id, o.name, o.email, o.phone, o.tier, o.status, o.industry, o.createdAt, o.updatedAt,
        (SELECT COUNT(*) FROM User WHERE organizationId = o.id) as users,
        (SELECT COUNT(*) FROM ModuleLicense WHERE organizationId = o.id AND status = 'active') as activeModules
      FROM Organization o
      ORDER BY o.createdAt DESC
    `);

    return organizations;
  }

  async findOne(id: string) {
    const orgs = await this.db.query(
      'SELECT * FROM Organization WHERE id = ?',
      [id]
    );

    if (!orgs || orgs.length === 0) {
      return null;
    }

    const organization = orgs[0];

    const users = await this.db.query(
      'SELECT id, email, firstName, lastName, status, createdAt FROM User WHERE organizationId = ?',
      [id]
    );

    const moduleLicenses = await this.db.query(
      'SELECT id, moduleCode, tierLevel, status, activatedAt, expiresAt FROM ModuleLicense WHERE organizationId = ?',
      [id]
    );

    const counts = await this.db.query(`
      SELECT
        (SELECT COUNT(*) FROM User WHERE organizationId = ?) as userCount,
        (SELECT COUNT(*) FROM ModuleLicense WHERE organizationId = ? AND status = 'active') as activeModulesCount,
        (SELECT COUNT(*) FROM Asset WHERE organizationId = ?) as assetCount,
        (SELECT COUNT(*) FROM WorkOrder WHERE organizationId = ?) as workOrderCount
    `, [id, id, id, id]);

    return {
      ...organization,
      users,
      moduleLicenses,
      ...counts[0],
    };
  }

  async create(createData: any) {
    const orgId = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO Organization (id, name, email, phone, address, city, country, industry, tier, status, maxUsers, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        orgId,
        createData.name,
        createData.email,
        createData.phone,
        createData.address,
        createData.city,
        createData.country || 'Philippines',
        createData.industry,
        createData.tier || 'starter',
        'active',
        createData.maxUsers || 10
      ]
    );

    const orgs = await this.db.query('SELECT * FROM Organization WHERE id = ?', [orgId]);

    return { organization: orgs[0], message: 'Organization created successfully' };
  }

  async update(id: string, updateData: any) {
    await this.db.execute(
      `UPDATE Organization SET name = ?, email = ?, phone = ?, address = ?, city = ?, country = ?, industry = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [
        updateData.name,
        updateData.email,
        updateData.phone,
        updateData.address,
        updateData.city,
        updateData.country,
        updateData.industry,
        id
      ]
    );

    const orgs = await this.db.query('SELECT * FROM Organization WHERE id = ?', [id]);

    return { organization: orgs[0], message: 'Organization updated successfully' };
  }
}
