import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { CORE_MODULES } from '../../common/constants/modules.constant';

@Injectable()
export class OrganizationsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const organizations = await this.db.query(`
      SELECT
        o.id, o.name, o.email, o.phone, o.tier, o.status, o.industry, o.createdAt, o.updatedAt,
        (SELECT COUNT(*) FROM User WHERE organizationId = o.id) as users,
        (5 + (SELECT COUNT(*) FROM ModuleLicense WHERE organizationId = o.id AND status = 'active')) as activeModules
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
        (5 + (SELECT COUNT(*) FROM ModuleLicense WHERE organizationId = ? AND status = 'active')) as activeModulesCount,
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

    // Automatically activate the 5 core modules for new organizations
    // For trial tier, set expiration to 15 days from now
    const isTrial = createData.tier === 'trial';
    const expiresAt = isTrial ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() : null;

    for (const moduleCode of CORE_MODULES) {
      const licenseId = randomBytes(16).toString('hex');
      await this.db.execute(
        `INSERT INTO ModuleLicense (id, organizationId, moduleCode, status, activatedAt, expiresAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, datetime('now'), ?, datetime('now'), datetime('now'))`,
        [licenseId, orgId, moduleCode, 'active', expiresAt]
      );
    }

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

  async delete(id: string) {
    // Delete organization and cascade delete related data
    await this.db.execute('DELETE FROM ModuleLicense WHERE organizationId = ?', [id]);
    await this.db.execute('DELETE FROM ModuleAccessLog WHERE organizationId = ?', [id]);
    await this.db.execute('DELETE FROM WorkOrder WHERE organizationId = ?', [id]);
    await this.db.execute('DELETE FROM Asset WHERE organizationId = ?', [id]);
    await this.db.execute('DELETE FROM Location WHERE organizationId = ?', [id]);
    await this.db.execute('DELETE FROM User WHERE organizationId = ?', [id]);
    await this.db.execute('DELETE FROM Organization WHERE id = ?', [id]);

    return { success: true, message: 'Organization deleted successfully' };
  }

  async createAdminUser(organizationId: string, password: string, fullName: string) {
    // Check if organization exists
    const orgs = await this.db.query('SELECT * FROM Organization WHERE id = ?', [organizationId]);
    if (!orgs || orgs.length === 0) {
      throw new BadRequestException('Organization not found');
    }
    const org = orgs[0];

    // Check if user already exists with this email
    const existingUsers = await this.db.query('SELECT * FROM User WHERE email = ?', [org.email]);
    if (existingUsers && existingUsers.length > 0) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomBytes(16).toString('hex');

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create admin user with 'admin' role
    await this.db.execute(
      `INSERT INTO User (id, email, password, firstName, lastName, roleId, organizationId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, org.email, hashedPassword, firstName, lastName, 'admin', organizationId, 'active']
    );

    return {
      success: true,
      message: 'Admin user created successfully',
      user: { id: userId, email: org.email, firstName, lastName, role: 'admin' }
    };
  }

  async getTrialStatus(organizationId: string) {
    // Get organization details
    const orgs = await this.db.query('SELECT * FROM Organization WHERE id = ?', [organizationId]);
    if (!orgs || orgs.length === 0) {
      throw new BadRequestException('Organization not found');
    }
    const org = orgs[0];

    // Check if it's a trial organization
    if (org.tier !== 'trial') {
      return {
        isTrial: false,
        tier: org.tier,
      };
    }

    // Get module licenses with expiration dates
    const licenses = await this.db.query(
      'SELECT expiresAt FROM ModuleLicense WHERE organizationId = ? AND expiresAt IS NOT NULL ORDER BY expiresAt ASC LIMIT 1',
      [organizationId]
    );

    if (!licenses || licenses.length === 0) {
      return {
        isTrial: true,
        tier: 'trial',
        hasExpiration: false,
      };
    }

    const expiresAt = new Date(licenses[0].expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;

    return {
      isTrial: true,
      tier: 'trial',
      hasExpiration: true,
      expiresAt: licenses[0].expiresAt,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      showWarning: daysRemaining <= 3 && daysRemaining > 0,
    };
  }
}
