import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed')
  async seedDatabase(@Query('secret') secret?: string) {
    // Simple secret protection - only allow if correct secret is provided
    const SEED_SECRET = process.env.SEED_SECRET || 'my-secret-seed-key-2025';

    if (secret !== SEED_SECRET) {
      return {
        success: false,
        message: '❌ Unauthorized. Provide ?secret=YOUR_SECRET_KEY',
      };
    }
    try {
      console.log('🌱 Starting seed...');

      // Create basic roles (no organization = system-wide)
      await this.upsertRole('admin', 'Administrator', 'Full access to all modules and settings', JSON.stringify(['all']));
      await this.upsertRole('manager', 'Manager', 'Access to operations, reporting, and team management', JSON.stringify(['work-orders', 'assets', 'reports', 'users', 'inventory']));
      await this.upsertRole('technician', 'Technician', 'Access to work orders, assets, and field operations', JSON.stringify(['work-orders', 'assets', 'preventive-maintenance']));
      await this.upsertRole('viewer', 'Viewer', 'Read-only access to reports and dashboards', JSON.stringify(['reports']));

      console.log('✅ Roles created');

      // Create test organizations
      const org1Id = 'org-test-1';
      const org2Id = 'org-test-2';

      await this.upsertOrganization(
        org1Id,
        'Acme Manufacturing',
        'admin@acme.com',
        '+63 2 1234 5678',
        'Manila',
        'Philippines',
        'manufacturing',
        'professional',
        'active',
        25
      );

      await this.upsertOrganization(
        org2Id,
        'Metro Hospital',
        'admin@metrohospital.ph',
        '+63 2 8765 4321',
        'Quezon City',
        'Philippines',
        'healthcare',
        'enterprise',
        'active',
        100
      );

      // Create users
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create superadmin user
      await this.upsertUser(
        'superadmin@cmms.com',
        hashedPassword,
        'Super',
        'Admin',
        '+63 917 123 4567',
        'active',
        null,
        null,
        true
      );

      // Create Acme admin user
      const acmeAdminId = await this.upsertUser(
        'admin@acme.com',
        hashedPassword,
        'John',
        'Doe',
        '+63 917 234 5678',
        'active',
        'admin',
        org1Id,
        false
      );

      // Create Metro Hospital admin user
      const hospitalAdminId = await this.upsertUser(
        'admin@metrohospital.ph',
        hashedPassword,
        'Maria',
        'Santos',
        '+63 917 345 6789',
        'active',
        'admin',
        org2Id,
        false
      );

      // Create Technician user for Metro Hospital
      const hospitalTechId = await this.upsertUser(
        'tech@metrohospital.ph',
        hashedPassword,
        'Jose',
        'Cruz',
        '+63 917 456 7890',
        'active',
        'technician',
        org2Id,
        false
      );

      // Create Manager user for Acme
      await this.upsertUser(
        'manager@acme.com',
        hashedPassword,
        'Maria',
        'Lopez',
        '+63 917 345 1234',
        'active',
        'manager',
        org1Id,
        false
      );

      // Create technician users for Acme
      const tech1Id = await this.upsertUser(
        'tech1@acme.com',
        hashedPassword,
        'Juan',
        'Cruz',
        '+63 917 456 7890',
        'active',
        'technician',
        org1Id,
        false
      );

      const tech2Id = await this.upsertUser(
        'tech2@acme.com',
        hashedPassword,
        'Ana',
        'Reyes',
        '+63 917 567 8901',
        'active',
        'technician',
        org1Id,
        false
      );

      // Create Viewer user for Acme
      await this.upsertUser(
        'viewer@acme.com',
        hashedPassword,
        'Pedro',
        'Garcia',
        '+63 917 789 0123',
        'active',
        'viewer',
        org1Id,
        false
      );

      console.log('✅ Users created with different roles');

      // Create locations for Acme
      const loc1Id = 'loc-1';
      const loc2Id = 'loc-2';
      const loc3Id = 'loc-3';

      await this.upsertLocation(loc1Id, org1Id, 'Building A - Production Floor', 'Building', '123 Industrial Ave', 'Manila');
      await this.upsertLocation(loc2Id, org1Id, 'Building B - Warehouse', 'Building', '125 Industrial Ave', 'Manila');
      await this.upsertLocation(loc3Id, org1Id, 'Building C - Maintenance Shop', 'Building', '127 Industrial Ave', 'Manila');

      console.log('✅ Locations created');

      // Create assets for Acme
      const asset1Id = 'asset-1';
      const asset2Id = 'asset-2';
      const asset3Id = 'asset-3';
      const asset4Id = 'asset-4';
      const asset5Id = 'asset-5';
      const asset6Id = 'asset-6';

      await this.upsertAsset(
        asset1Id,
        org1Id,
        acmeAdminId,
        'PUMP-001',
        'Hydraulic Pump Unit A',
        'Equipment',
        'operational',
        'Bosch Rexroth',
        'A10VSO',
        'BR-2024-001',
        loc1Id,
        'Main production line hydraulic pump',
        'high'
      );

      await this.upsertAsset(
        asset2Id,
        org1Id,
        acmeAdminId,
        'CONV-001',
        'Conveyor Belt System 1',
        'Equipment',
        'operational',
        'Siemens',
        'CONV-500',
        'SI-2024-002',
        loc1Id,
        'Primary conveyor for production line',
        'medium'
      );

      await this.upsertAsset(
        asset3Id,
        org1Id,
        acmeAdminId,
        'GEN-001',
        'Backup Generator',
        'Equipment',
        'operational',
        'Caterpillar',
        'C15',
        'CAT-2024-003',
        loc2Id,
        'Emergency backup power generator',
        'high'
      );

      await this.upsertAsset(
        asset4Id,
        org1Id,
        acmeAdminId,
        'HVAC-001',
        'HVAC Unit - Floor 2',
        'Equipment',
        'maintenance',
        'Carrier',
        'AquaEdge 19DV',
        'CAR-2024-004',
        loc1Id,
        'Climate control for production floor',
        'medium'
      );

      await this.upsertAsset(
        asset5Id,
        org1Id,
        acmeAdminId,
        'FORK-001',
        'Forklift #1',
        'Vehicle',
        'operational',
        'Toyota',
        '8FD25',
        'TOY-2024-005',
        loc2Id,
        'Warehouse material handling',
        'low'
      );

      await this.upsertAsset(
        asset6Id,
        org1Id,
        acmeAdminId,
        'CNC-001',
        'CNC Milling Machine',
        'Equipment',
        'operational',
        'Haas',
        'VF-2',
        'HAAS-2024-006',
        loc1Id,
        'Precision machining center',
        'high'
      );

      console.log('✅ Assets created');

      // Create work orders
      const year = new Date().getFullYear();

      await this.upsertWorkOrder(
        'wo-1',
        org1Id,
        acmeAdminId,
        `WO-${year}-001`,
        'Hydraulic Pump Oil Change',
        'Scheduled oil change and filter replacement for hydraulic pump unit',
        'preventive',
        'medium',
        'in_progress',
        asset1Id,
        tech1Id,
        '2025-10-10T08:00:00',
        '2025-10-10T12:00:00',
        4,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

      await this.upsertWorkOrder(
        'wo-2',
        org1Id,
        acmeAdminId,
        `WO-${year}-002`,
        'Conveyor Belt Alignment',
        'Belt showing signs of misalignment, needs adjustment',
        'corrective',
        'high',
        'open',
        asset2Id,
        tech2Id,
        '2025-10-11T09:00:00',
        '2025-10-11T11:00:00',
        2,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

      await this.upsertWorkOrder(
        'wo-3',
        org1Id,
        acmeAdminId,
        `WO-${year}-003`,
        'Generator Load Test',
        'Monthly load test and inspection of backup generator',
        'preventive',
        'medium',
        'assigned',
        asset3Id,
        tech1Id,
        '2025-10-15T14:00:00',
        '2025-10-15T16:00:00',
        2,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

      await this.upsertWorkOrder(
        'wo-4',
        org1Id,
        acmeAdminId,
        `WO-${year}-004`,
        'HVAC Filter Replacement',
        'Quarterly HVAC filter replacement and system inspection',
        'preventive',
        'urgent',
        'completed',
        asset4Id,
        tech2Id,
        '2025-10-01T10:00:00',
        '2025-10-01T14:00:00',
        4,
        '2025-10-01T10:15:00',
        '2025-10-01T13:45:00',
        3.5,
        1750,
        500,
        2250,
        '2025-10-01T13:45:00',
        null
      );

      await this.upsertWorkOrder(
        'wo-5',
        org1Id,
        acmeAdminId,
        `WO-${year}-005`,
        'Forklift Battery Check',
        'Weekly battery inspection and water level check',
        'preventive',
        'low',
        'open',
        asset5Id,
        null,
        '2025-10-12T08:00:00',
        '2025-10-12T09:00:00',
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

      await this.upsertWorkOrder(
        'wo-6',
        org1Id,
        acmeAdminId,
        `WO-${year}-006`,
        'CNC Machine Calibration',
        'Precision calibration and alignment check',
        'preventive',
        'high',
        'assigned',
        asset6Id,
        tech1Id,
        '2025-10-20T07:00:00',
        '2025-10-20T12:00:00',
        5,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

      console.log('✅ Work orders created');

      // Create PM Schedules for Acme
      await this.upsertPMSchedule(
        'pm-1',
        org1Id,
        'Monthly Hydraulic Pump Inspection',
        'Comprehensive inspection of hydraulic pump unit including oil analysis, pressure testing, and component wear assessment',
        asset1Id,
        'monthly',
        1,
        'high',
        'active',
        tech1Id,
        '2025-09-03',
        '2025-10-03',
        JSON.stringify([
          'Check oil level and quality',
          'Inspect pump housing for leaks',
          'Test pressure relief valve',
          'Check belt tension and alignment',
          'Clean air filters'
        ]),
        JSON.stringify([
          'Hydraulic oil (5L)',
          'Oil filter',
          'Air filter',
          'Pressure gauge'
        ]),
        2.5,
        acmeAdminId
      );

      await this.upsertPMSchedule(
        'pm-2',
        org1Id,
        'Weekly Generator Oil Check',
        'Weekly maintenance check for backup generator including oil level, coolant, and battery status',
        asset2Id,
        'weekly',
        1,
        'medium',
        'active',
        tech2Id,
        '2025-09-26',
        '2025-10-10',
        JSON.stringify([
          'Check oil level',
          'Inspect coolant level',
          'Test battery voltage',
          'Check fuel level',
          'Run generator test cycle'
        ]),
        JSON.stringify([
          'Engine oil (1L)',
          'Coolant (500ml)',
          'Battery terminal cleaner'
        ]),
        1,
        acmeAdminId
      );

      await this.upsertPMSchedule(
        'pm-3',
        org1Id,
        'Quarterly HVAC Filter Replacement',
        'Quarterly replacement of HVAC air filters and system inspection',
        asset3Id,
        'quarterly',
        1,
        'medium',
        'overdue',
        tech1Id,
        '2025-07-01',
        '2025-10-01',
        JSON.stringify([
          'Replace air filters',
          'Clean condenser coils',
          'Check refrigerant levels',
          'Inspect ductwork',
          'Test thermostat calibration'
        ]),
        JSON.stringify([
          'HEPA air filters (4x)',
          'Coil cleaner',
          'Refrigerant (if needed)',
          'Thermostat batteries'
        ]),
        3,
        acmeAdminId
      );

      // Create PM Schedules for Metro Hospital
      await this.upsertPMSchedule(
        'pm-4',
        org2Id,
        'Daily MRI Scanner Calibration',
        'Daily calibration and safety checks for MRI scanner to ensure optimal performance',
        null,
        'daily',
        1,
        'urgent',
        'active',
        hospitalTechId,
        '2025-10-09',
        '2025-10-10',
        JSON.stringify([
          'Run calibration sequence',
          'Check magnetic field strength',
          'Test RF coil functionality',
          'Verify patient safety systems',
          'Update calibration logs'
        ]),
        JSON.stringify([
          'Calibration phantom',
          'RF coil test equipment',
          'Safety checklist forms'
        ]),
        1.5,
        hospitalAdminId
      );

      await this.upsertPMSchedule(
        'pm-5',
        org2Id,
        'Monthly Ventilator Maintenance',
        'Monthly comprehensive maintenance of ICU ventilators including calibration and safety testing',
        null,
        'monthly',
        1,
        'high',
        'scheduled',
        hospitalTechId,
        '2025-09-15',
        '2025-10-15',
        JSON.stringify([
          'Calibrate pressure sensors',
          'Test alarm systems',
          'Check valve functionality',
          'Clean internal components',
          'Update firmware if needed'
        ]),
        JSON.stringify([
          'Pressure sensor calibration kit',
          'Valve replacement set',
          'Cleaning solution',
          'Firmware update files'
        ]),
        4,
        hospitalAdminId
      );

      console.log('✅ PM Schedules created');

      return {
        success: true,
        message: '✅ Database seeded successfully with comprehensive test data!',
        data: {
          organizations: 2,
          users: 5,
          locations: 3,
          assets: 6,
          workOrders: 6,
          pmSchedules: 5,
        },
        credentials: {
          superadmin: 'superadmin@cmms.com / admin123',
          acme: 'admin@acme.com / admin123',
          hospital: 'admin@metrohospital.ph / admin123',
          technician1: 'tech1@acme.com / admin123',
          technician2: 'tech2@acme.com / admin123',
        }
      };
    } catch (error) {
      console.error('Seed error:', error);
      return {
        success: false,
        message: 'Failed to seed database',
        error: error.message
      };
    }
  }

  private async upsertRole(id: string, name: string, description: string, permissions: string) {
    const existing = await this.db.query(
      'SELECT id FROM Role WHERE id = ?',
      [id]
    );

    if (existing.length > 0) {
      await this.db.execute(
        'UPDATE Role SET name = ?, description = ?, permissions = ?, updatedAt = datetime("now") WHERE id = ?',
        [name, description, permissions, id]
      );
    } else {
      await this.db.execute(
        'INSERT INTO Role (id, name, description, permissions, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
        [id, name, description, permissions]
      );
    }
  }

  private async upsertOrganization(
    id: string,
    name: string,
    email: string,
    phone: string,
    city: string,
    country: string,
    industry: string,
    tier: string,
    status: string,
    maxUsers: number
  ) {
    const existing = await this.db.query(
      'SELECT id FROM Organization WHERE id = ?',
      [id]
    );

    if (existing.length > 0) {
      await this.db.execute(
        'UPDATE Organization SET name = ?, email = ?, phone = ?, city = ?, country = ?, industry = ?, tier = ?, status = ?, maxUsers = ?, updatedAt = datetime("now") WHERE id = ?',
        [name, email, phone, city, country, industry, tier, status, maxUsers, id]
      );
    } else {
      await this.db.execute(
        'INSERT INTO Organization (id, name, email, phone, city, country, industry, tier, status, maxUsers, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [id, name, email, phone, city, country, industry, tier, status, maxUsers]
      );
    }
  }

  private async upsertUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    status: string,
    roleId: string | null,
    organizationId: string | null,
    isSuperAdmin: boolean
  ): Promise<string> {
    const existing = await this.db.query(
      'SELECT id FROM User WHERE email = ?',
      [email]
    );

    let userId: string;

    if (existing.length > 0) {
      userId = existing[0].id;
      await this.db.execute(
        'UPDATE User SET password = ?, firstName = ?, lastName = ?, phone = ?, status = ?, roleId = ?, organizationId = ?, isSuperAdmin = ?, updatedAt = datetime("now") WHERE email = ?',
        [password, firstName, lastName, phone, status, roleId, organizationId, isSuperAdmin ? 1 : 0, email]
      );
    } else {
      userId = randomBytes(16).toString('hex');
      await this.db.execute(
        'INSERT INTO User (id, email, password, firstName, lastName, phone, status, roleId, organizationId, isSuperAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [userId, email, password, firstName, lastName, phone, status, roleId, organizationId, isSuperAdmin ? 1 : 0]
      );
    }

    return userId;
  }

  private async upsertLocation(
    id: string,
    organizationId: string,
    name: string,
    type: string,
    address: string,
    city: string
  ) {
    const existing = await this.db.query(
      'SELECT id FROM Location WHERE id = ?',
      [id]
    );

    if (existing.length > 0) {
      await this.db.execute(
        'UPDATE Location SET organizationId = ?, name = ?, type = ?, address = ?, city = ?, updatedAt = datetime("now") WHERE id = ?',
        [organizationId, name, type, address, city, id]
      );
    } else {
      await this.db.execute(
        'INSERT INTO Location (id, organizationId, name, type, address, city, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [id, organizationId, name, type, address, city]
      );
    }
  }

  private async upsertAsset(
    id: string,
    organizationId: string,
    createdById: string,
    assetNumber: string,
    name: string,
    category: string,
    status: string,
    manufacturer: string,
    model: string,
    serialNumber: string,
    locationId: string,
    description: string,
    criticality: string
  ) {
    const existing = await this.db.query(
      'SELECT id FROM Asset WHERE organizationId = ? AND assetNumber = ?',
      [organizationId, assetNumber]
    );

    if (existing.length > 0) {
      await this.db.execute(
        'UPDATE Asset SET name = ?, category = ?, status = ?, manufacturer = ?, model = ?, serialNumber = ?, locationId = ?, description = ?, criticality = ?, updatedAt = datetime("now") WHERE organizationId = ? AND assetNumber = ?',
        [name, category, status, manufacturer, model, serialNumber, locationId, description, criticality, organizationId, assetNumber]
      );
    } else {
      await this.db.execute(
        'INSERT INTO Asset (id, organizationId, createdById, assetNumber, name, category, status, manufacturer, model, serialNumber, locationId, description, criticality, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [id, organizationId, createdById, assetNumber, name, category, status, manufacturer, model, serialNumber, locationId, description, criticality]
      );
    }
  }

  private async upsertWorkOrder(
    id: string,
    organizationId: string,
    createdById: string,
    workOrderNumber: string,
    title: string,
    description: string,
    type: string,
    priority: string,
    status: string,
    assetId: string,
    assignedToId: string | null,
    scheduledStart: string,
    scheduledEnd: string,
    estimatedHours: number,
    actualStart: string | null,
    actualEnd: string | null,
    actualHours: number | null,
    laborCost: number | null,
    partsCost: number | null,
    totalCost: number | null,
    completedAt: string | null,
    notes: string | null
  ) {
    const existing = await this.db.query(
      'SELECT id FROM WorkOrder WHERE organizationId = ? AND workOrderNumber = ?',
      [organizationId, workOrderNumber]
    );

    if (existing.length > 0) {
      await this.db.execute(
        'UPDATE WorkOrder SET title = ?, description = ?, type = ?, priority = ?, status = ?, assetId = ?, assignedToId = ?, scheduledStart = ?, scheduledEnd = ?, estimatedHours = ?, actualStart = ?, actualEnd = ?, actualHours = ?, laborCost = ?, partsCost = ?, totalCost = ?, completedAt = ?, notes = ?, updatedAt = datetime("now") WHERE organizationId = ? AND workOrderNumber = ?',
        [title, description, type, priority, status, assetId, assignedToId, scheduledStart, scheduledEnd, estimatedHours, actualStart, actualEnd, actualHours, laborCost, partsCost, totalCost, completedAt, notes, organizationId, workOrderNumber]
      );
    } else {
      await this.db.execute(
        'INSERT INTO WorkOrder (id, organizationId, createdById, workOrderNumber, title, description, type, priority, status, assetId, assignedToId, scheduledStart, scheduledEnd, estimatedHours, actualStart, actualEnd, actualHours, laborCost, partsCost, totalCost, completedAt, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [id, organizationId, createdById, workOrderNumber, title, description, type, priority, status, assetId, assignedToId, scheduledStart, scheduledEnd, estimatedHours, actualStart, actualEnd, actualHours, laborCost, partsCost, totalCost, completedAt, notes]
      );
    }
  }

  private async upsertPMSchedule(
    id: string,
    organizationId: string,
    name: string,
    description: string,
    assetId: string | null,
    frequency: string,
    frequencyValue: number,
    priority: string,
    status: string,
    assignedToId: string,
    lastCompleted: string,
    nextDue: string,
    tasks: string,
    parts: string,
    estimatedHours: number,
    createdById: string
  ) {
    const existing = await this.db.query(
      'SELECT id FROM PMSchedule WHERE id = ?',
      [id]
    );

    if (existing.length > 0) {
      await this.db.execute(
        'UPDATE PMSchedule SET organizationId = ?, name = ?, description = ?, assetId = ?, frequency = ?, frequencyValue = ?, priority = ?, status = ?, assignedToId = ?, lastCompleted = ?, nextDue = ?, tasks = ?, parts = ?, estimatedHours = ?, createdById = ?, updatedAt = datetime("now") WHERE id = ?',
        [organizationId, name, description, assetId, frequency, frequencyValue, priority, status, assignedToId, lastCompleted, nextDue, tasks, parts, estimatedHours, createdById, id]
      );
    } else {
      await this.db.execute(
        'INSERT INTO PMSchedule (id, organizationId, name, description, assetId, frequency, frequencyValue, priority, status, assignedToId, lastCompleted, nextDue, tasks, parts, estimatedHours, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [id, organizationId, name, description, assetId, frequency, frequencyValue, priority, status, assignedToId, lastCompleted, nextDue, tasks, parts, estimatedHours, createdById]
      );
    }
  }
}
