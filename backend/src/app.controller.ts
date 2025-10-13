import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
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
      const adminRole = await this.prisma.role.upsert({
        where: { id: 'admin' },
        update: {},
        create: {
          id: 'admin',
          name: 'Administrator',
          description: 'Full access to all modules and settings',
          permissions: JSON.stringify(['all']),
        },
      });

      const managerRole = await this.prisma.role.upsert({
        where: { id: 'manager' },
        update: {},
        create: {
          id: 'manager',
          name: 'Manager',
          description: 'Access to operations, reporting, and team management',
          permissions: JSON.stringify(['work-orders', 'assets', 'reports', 'users', 'inventory']),
        },
      });

      const technicianRole = await this.prisma.role.upsert({
        where: { id: 'technician' },
        update: {},
        create: {
          id: 'technician',
          name: 'Technician',
          description: 'Access to work orders, assets, and field operations',
          permissions: JSON.stringify(['work-orders', 'assets', 'preventive-maintenance']),
        },
      });

      const viewerRole = await this.prisma.role.upsert({
        where: { id: 'viewer' },
        update: {},
        create: {
          id: 'viewer',
          name: 'Viewer',
          description: 'Read-only access to reports and dashboards',
          permissions: JSON.stringify(['reports']),
        },
      });

      console.log('✅ Roles created');

      // Create test organizations
      const org1 = await this.prisma.organization.upsert({
        where: { id: 'org-test-1' },
        update: {},
        create: {
          id: 'org-test-1',
          name: 'Acme Manufacturing',
          email: 'admin@acme.com',
          phone: '+63 2 1234 5678',
          city: 'Manila',
          country: 'Philippines',
          industry: 'manufacturing',
          tier: 'professional',
          status: 'active',
          maxUsers: 25,
        },
      });

      const org2 = await this.prisma.organization.upsert({
        where: { id: 'org-test-2' },
        update: {},
        create: {
          id: 'org-test-2',
          name: 'Metro Hospital',
          email: 'admin@metrohospital.ph',
          phone: '+63 2 8765 4321',
          city: 'Quezon City',
          country: 'Philippines',
          industry: 'healthcare',
          tier: 'enterprise',
          status: 'active',
          maxUsers: 100,
        },
      });

      // Create superadmin user
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await this.prisma.user.upsert({
        where: { email: 'superadmin@cmms.com' },
        update: {},
        create: {
          email: 'superadmin@cmms.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+63 917 123 4567',
          status: 'active',
          isSuperAdmin: true,
        },
      });

      await this.prisma.user.upsert({
        where: { email: 'admin@acme.com' },
        update: { roleId: 'admin' }, // Add role to existing user
        create: {
          email: 'admin@acme.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+63 917 234 5678',
          status: 'active',
          roleId: 'admin',
          organizationId: org1.id,
          isSuperAdmin: false,
        },
      });

      const hospitalAdmin = await this.prisma.user.upsert({
        where: { email: 'admin@metrohospital.ph' },
        update: { roleId: 'admin' }, // Add role to existing user
        create: {
          email: 'admin@metrohospital.ph',
          password: hashedPassword,
          firstName: 'Maria',
          lastName: 'Santos',
          phone: '+63 917 345 6789',
          status: 'active',
          roleId: 'admin',
          organizationId: org2.id,
          isSuperAdmin: false,
        },
      });

      // Create Technician user for Metro Hospital
      const hospitalTech = await this.prisma.user.upsert({
        where: { email: 'tech@metrohospital.ph' },
        update: { roleId: 'technician' },
        create: {
          email: 'tech@metrohospital.ph',
          password: hashedPassword,
          firstName: 'Jose',
          lastName: 'Cruz',
          phone: '+63 917 456 7890',
          status: 'active',
          roleId: 'technician',
          organizationId: org2.id,
          isSuperAdmin: false,
        },
      });

      // Create Manager user for Acme
      const manager1 = await this.prisma.user.upsert({
        where: { email: 'manager@acme.com' },
        update: { roleId: 'manager' },
        create: {
          email: 'manager@acme.com',
          password: hashedPassword,
          firstName: 'Maria',
          lastName: 'Lopez',
          phone: '+63 917 345 1234',
          status: 'active',
          roleId: 'manager',
          organizationId: org1.id,
          isSuperAdmin: false,
        },
      });

      // Create technician users for Acme
      const tech1 = await this.prisma.user.upsert({
        where: { email: 'tech1@acme.com' },
        update: { roleId: 'technician' },
        create: {
          email: 'tech1@acme.com',
          password: hashedPassword,
          firstName: 'Juan',
          lastName: 'Cruz',
          phone: '+63 917 456 7890',
          status: 'active',
          roleId: 'technician',
          organizationId: org1.id,
          isSuperAdmin: false,
        },
      });

      const tech2 = await this.prisma.user.upsert({
        where: { email: 'tech2@acme.com' },
        update: { roleId: 'technician' },
        create: {
          email: 'tech2@acme.com',
          password: hashedPassword,
          firstName: 'Ana',
          lastName: 'Reyes',
          phone: '+63 917 567 8901',
          status: 'active',
          roleId: 'technician',
          organizationId: org1.id,
          isSuperAdmin: false,
        },
      });

      // Create Viewer user for Acme
      const viewer1 = await this.prisma.user.upsert({
        where: { email: 'viewer@acme.com' },
        update: { roleId: 'viewer' },
        create: {
          email: 'viewer@acme.com',
          password: hashedPassword,
          firstName: 'Pedro',
          lastName: 'Garcia',
          phone: '+63 917 789 0123',
          status: 'active',
          roleId: 'viewer',
          organizationId: org1.id,
          isSuperAdmin: false,
        },
      });

      console.log('✅ Users created with different roles');

      // Create locations for Acme
      const loc1 = await this.prisma.location.upsert({
        where: { id: 'loc-1' },
        update: {},
        create: {
          id: 'loc-1',
          organizationId: org1.id,
          name: 'Building A - Production Floor',
          type: 'Building',
          address: '123 Industrial Ave',
          city: 'Manila',
        },
      });

      const loc2 = await this.prisma.location.upsert({
        where: { id: 'loc-2' },
        update: {},
        create: {
          id: 'loc-2',
          organizationId: org1.id,
          name: 'Building B - Warehouse',
          type: 'Building',
          address: '125 Industrial Ave',
          city: 'Manila',
        },
      });

      const loc3 = await this.prisma.location.upsert({
        where: { id: 'loc-3' },
        update: {},
        create: {
          id: 'loc-3',
          organizationId: org1.id,
          name: 'Building C - Maintenance Shop',
          type: 'Building',
          address: '127 Industrial Ave',
          city: 'Manila',
        },
      });

      console.log('✅ Locations created');

      // Get the admin user for createdBy
      const adminUser = await this.prisma.user.findUnique({
        where: { email: 'admin@acme.com' },
      });

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      // Create assets for Acme
      const asset1 = await this.prisma.asset.upsert({
        where: { 
          organizationId_assetNumber: {
            organizationId: org1.id,
            assetNumber: 'PUMP-001'
          }
        },
        update: {},
        create: {
          id: 'asset-1',
          organizationId: org1.id,
          createdById: adminUser.id,
          assetNumber: 'PUMP-001',
          name: 'Hydraulic Pump Unit A',
          category: 'Equipment',
          status: 'operational',
          manufacturer: 'Bosch Rexroth',
          model: 'A10VSO',
          serialNumber: 'BR-2024-001',
          locationId: loc1.id,
          description: 'Main production line hydraulic pump',
          criticality: 'high',
        },
      });

      const asset2 = await this.prisma.asset.upsert({
        where: { 
          organizationId_assetNumber: {
            organizationId: org1.id,
            assetNumber: 'CONV-001'
          }
        },
        update: {},
        create: {
          id: 'asset-2',
          organizationId: org1.id,
          createdById: adminUser.id,
          assetNumber: 'CONV-001',
          name: 'Conveyor Belt System 1',
          category: 'Equipment',
          status: 'operational',
          manufacturer: 'Siemens',
          model: 'CONV-500',
          serialNumber: 'SI-2024-002',
          locationId: loc1.id,
          description: 'Primary conveyor for production line',
          criticality: 'medium',
        },
      });

      const asset3 = await this.prisma.asset.upsert({
        where: { 
          organizationId_assetNumber: {
            organizationId: org1.id,
            assetNumber: 'GEN-001'
          }
        },
        update: {},
        create: {
          id: 'asset-3',
          organizationId: org1.id,
          createdById: adminUser.id,
          assetNumber: 'GEN-001',
          name: 'Backup Generator',
          category: 'Equipment',
          status: 'operational',
          manufacturer: 'Caterpillar',
          model: 'C15',
          serialNumber: 'CAT-2024-003',
          locationId: loc2.id,
          description: 'Emergency backup power generator',
          criticality: 'high',
        },
      });

      const asset4 = await this.prisma.asset.upsert({
        where: { 
          organizationId_assetNumber: {
            organizationId: org1.id,
            assetNumber: 'HVAC-001'
          }
        },
        update: {},
        create: {
          id: 'asset-4',
          organizationId: org1.id,
          createdById: adminUser.id,
          assetNumber: 'HVAC-001',
          name: 'HVAC Unit - Floor 2',
          category: 'Equipment',
          status: 'maintenance',
          manufacturer: 'Carrier',
          model: 'AquaEdge 19DV',
          serialNumber: 'CAR-2024-004',
          locationId: loc1.id,
          description: 'Climate control for production floor',
          criticality: 'medium',
        },
      });

      const asset5 = await this.prisma.asset.upsert({
        where: { 
          organizationId_assetNumber: {
            organizationId: org1.id,
            assetNumber: 'FORK-001'
          }
        },
        update: {},
        create: {
          id: 'asset-5',
          organizationId: org1.id,
          createdById: adminUser.id,
          assetNumber: 'FORK-001',
          name: 'Forklift #1',
          category: 'Vehicle',
          status: 'operational',
          manufacturer: 'Toyota',
          model: '8FD25',
          serialNumber: 'TOY-2024-005',
          locationId: loc2.id,
          description: 'Warehouse material handling',
          criticality: 'low',
        },
      });

      const asset6 = await this.prisma.asset.upsert({
        where: { 
          organizationId_assetNumber: {
            organizationId: org1.id,
            assetNumber: 'CNC-001'
          }
        },
        update: {},
        create: {
          id: 'asset-6',
          organizationId: org1.id,
          createdById: adminUser.id,
          assetNumber: 'CNC-001',
          name: 'CNC Milling Machine',
          category: 'Equipment',
          status: 'operational',
          manufacturer: 'Haas',
          model: 'VF-2',
          serialNumber: 'HAAS-2024-006',
          locationId: loc1.id,
          description: 'Precision machining center',
          criticality: 'high',
        },
      });

      console.log('✅ Assets created');

      // Create work orders
      const year = new Date().getFullYear();
      
      await this.prisma.workOrder.upsert({
        where: { 
          organizationId_workOrderNumber: {
            organizationId: org1.id,
            workOrderNumber: `WO-${year}-001`
          }
        },
        update: {},
        create: {
          id: 'wo-1',
          organizationId: org1.id,
          createdById: adminUser.id,
          workOrderNumber: `WO-${year}-001`,
          title: 'Hydraulic Pump Oil Change',
          description: 'Scheduled oil change and filter replacement for hydraulic pump unit',
          type: 'preventive',
          priority: 'medium',
          status: 'in_progress',
          assetId: asset1.id,
          assignedToId: tech1.id,
          scheduledStart: new Date('2025-10-10T08:00:00'),
          scheduledEnd: new Date('2025-10-10T12:00:00'),
          estimatedHours: 4,
        },
      });

      await this.prisma.workOrder.upsert({
        where: { 
          organizationId_workOrderNumber: {
            organizationId: org1.id,
            workOrderNumber: `WO-${year}-002`
          }
        },
        update: {},
        create: {
          id: 'wo-2',
          organizationId: org1.id,
          createdById: adminUser.id,
          workOrderNumber: `WO-${year}-002`,
          title: 'Conveyor Belt Alignment',
          description: 'Belt showing signs of misalignment, needs adjustment',
          type: 'corrective',
          priority: 'high',
          status: 'open',
          assetId: asset2.id,
          assignedToId: tech2.id,
          scheduledStart: new Date('2025-10-11T09:00:00'),
          scheduledEnd: new Date('2025-10-11T11:00:00'),
          estimatedHours: 2,
        },
      });

      await this.prisma.workOrder.upsert({
        where: { 
          organizationId_workOrderNumber: {
            organizationId: org1.id,
            workOrderNumber: `WO-${year}-003`
          }
        },
        update: {},
        create: {
          id: 'wo-3',
          organizationId: org1.id,
          createdById: adminUser.id,
          workOrderNumber: `WO-${year}-003`,
          title: 'Generator Load Test',
          description: 'Monthly load test and inspection of backup generator',
          type: 'preventive',
          priority: 'medium',
          status: 'assigned',
          assetId: asset3.id,
          assignedToId: tech1.id,
          scheduledStart: new Date('2025-10-15T14:00:00'),
          scheduledEnd: new Date('2025-10-15T16:00:00'),
          estimatedHours: 2,
        },
      });

      await this.prisma.workOrder.upsert({
        where: { 
          organizationId_workOrderNumber: {
            organizationId: org1.id,
            workOrderNumber: `WO-${year}-004`
          }
        },
        update: {},
        create: {
          id: 'wo-4',
          organizationId: org1.id,
          createdById: adminUser.id,
          workOrderNumber: `WO-${year}-004`,
          title: 'HVAC Filter Replacement',
          description: 'Quarterly HVAC filter replacement and system inspection',
          type: 'preventive',
          priority: 'urgent',
          status: 'completed',
          assetId: asset4.id,
          assignedToId: tech2.id,
          scheduledStart: new Date('2025-10-01T10:00:00'),
          scheduledEnd: new Date('2025-10-01T14:00:00'),
          actualStart: new Date('2025-10-01T10:15:00'),
          actualEnd: new Date('2025-10-01T13:45:00'),
          estimatedHours: 4,
          actualHours: 3.5,
          laborCost: 1750,
          partsCost: 500,
          totalCost: 2250,
          completedAt: new Date('2025-10-01T13:45:00'),
        },
      });

      await this.prisma.workOrder.upsert({
        where: { 
          organizationId_workOrderNumber: {
            organizationId: org1.id,
            workOrderNumber: `WO-${year}-005`
          }
        },
        update: {},
        create: {
          id: 'wo-5',
          organizationId: org1.id,
          createdById: adminUser.id,
          workOrderNumber: `WO-${year}-005`,
          title: 'Forklift Battery Check',
          description: 'Weekly battery inspection and water level check',
          type: 'preventive',
          priority: 'low',
          status: 'open',
          assetId: asset5.id,
          scheduledStart: new Date('2025-10-12T08:00:00'),
          scheduledEnd: new Date('2025-10-12T09:00:00'),
          estimatedHours: 1,
        },
      });

      await this.prisma.workOrder.upsert({
        where: { 
          organizationId_workOrderNumber: {
            organizationId: org1.id,
            workOrderNumber: `WO-${year}-006`
          }
        },
        update: {},
        create: {
          id: 'wo-6',
          organizationId: org1.id,
          createdById: adminUser.id,
          workOrderNumber: `WO-${year}-006`,
          title: 'CNC Machine Calibration',
          description: 'Precision calibration and alignment check',
          type: 'preventive',
          priority: 'high',
          status: 'assigned',
          assetId: asset6.id,
          assignedToId: tech1.id,
          scheduledStart: new Date('2025-10-20T07:00:00'),
          scheduledEnd: new Date('2025-10-20T12:00:00'),
          estimatedHours: 5,
        },
      });

      console.log('✅ Work orders created');

      // Create PM Schedules for Acme
      const pmSchedule1 = await this.prisma.pMSchedule.upsert({
        where: { id: 'pm-1' },
        update: {},
        create: {
          id: 'pm-1',
          organizationId: org1.id,
          name: 'Monthly Hydraulic Pump Inspection',
          description: 'Comprehensive inspection of hydraulic pump unit including oil analysis, pressure testing, and component wear assessment',
          assetId: asset1.id,
          frequency: 'monthly',
          frequencyValue: 1,
          priority: 'high',
          status: 'active',
          assignedToId: tech1.id,
          lastCompleted: new Date('2025-09-03'),
          nextDue: new Date('2025-10-03'),
          tasks: JSON.stringify([
            'Check oil level and quality',
            'Inspect pump housing for leaks',
            'Test pressure relief valve',
            'Check belt tension and alignment',
            'Clean air filters'
          ]),
          parts: JSON.stringify([
            'Hydraulic oil (5L)',
            'Oil filter',
            'Air filter',
            'Pressure gauge'
          ]),
          estimatedHours: 2.5,
          createdById: adminUser.id,
        },
      });

      const pmSchedule2 = await this.prisma.pMSchedule.upsert({
        where: { id: 'pm-2' },
        update: {},
        create: {
          id: 'pm-2',
          organizationId: org1.id,
          name: 'Weekly Generator Oil Check',
          description: 'Weekly maintenance check for backup generator including oil level, coolant, and battery status',
          assetId: asset2.id,
          frequency: 'weekly',
          frequencyValue: 1,
          priority: 'medium',
          status: 'active',
          assignedToId: tech2.id,
          lastCompleted: new Date('2025-09-26'),
          nextDue: new Date('2025-10-10'),
          tasks: JSON.stringify([
            'Check oil level',
            'Inspect coolant level',
            'Test battery voltage',
            'Check fuel level',
            'Run generator test cycle'
          ]),
          parts: JSON.stringify([
            'Engine oil (1L)',
            'Coolant (500ml)',
            'Battery terminal cleaner'
          ]),
          estimatedHours: 1,
          createdById: adminUser.id,
        },
      });

      const pmSchedule3 = await this.prisma.pMSchedule.upsert({
        where: { id: 'pm-3' },
        update: {},
        create: {
          id: 'pm-3',
          organizationId: org1.id,
          name: 'Quarterly HVAC Filter Replacement',
          description: 'Quarterly replacement of HVAC air filters and system inspection',
          assetId: asset3.id,
          frequency: 'quarterly',
          frequencyValue: 1,
          priority: 'medium',
          status: 'overdue',
          assignedToId: tech1.id,
          lastCompleted: new Date('2025-07-01'),
          nextDue: new Date('2025-10-01'),
          tasks: JSON.stringify([
            'Replace air filters',
            'Clean condenser coils',
            'Check refrigerant levels',
            'Inspect ductwork',
            'Test thermostat calibration'
          ]),
          parts: JSON.stringify([
            'HEPA air filters (4x)',
            'Coil cleaner',
            'Refrigerant (if needed)',
            'Thermostat batteries'
          ]),
          estimatedHours: 3,
          createdById: adminUser.id,
        },
      });

      // Create PM Schedules for Metro Hospital
      const pmSchedule4 = await this.prisma.pMSchedule.upsert({
        where: { id: 'pm-4' },
        update: {},
        create: {
          id: 'pm-4',
          organizationId: org2.id,
          name: 'Daily MRI Scanner Calibration',
          description: 'Daily calibration and safety checks for MRI scanner to ensure optimal performance',
          frequency: 'daily',
          frequencyValue: 1,
          priority: 'urgent',
          status: 'active',
          assignedToId: hospitalTech.id,
          lastCompleted: new Date('2025-10-09'),
          nextDue: new Date('2025-10-10'),
          tasks: JSON.stringify([
            'Run calibration sequence',
            'Check magnetic field strength',
            'Test RF coil functionality',
            'Verify patient safety systems',
            'Update calibration logs'
          ]),
          parts: JSON.stringify([
            'Calibration phantom',
            'RF coil test equipment',
            'Safety checklist forms'
          ]),
          estimatedHours: 1.5,
          createdById: hospitalAdmin.id,
        },
      });

      const pmSchedule5 = await this.prisma.pMSchedule.upsert({
        where: { id: 'pm-5' },
        update: {},
        create: {
          id: 'pm-5',
          organizationId: org2.id,
          name: 'Monthly Ventilator Maintenance',
          description: 'Monthly comprehensive maintenance of ICU ventilators including calibration and safety testing',
          frequency: 'monthly',
          frequencyValue: 1,
          priority: 'high',
          status: 'scheduled',
          assignedToId: hospitalTech.id,
          lastCompleted: new Date('2025-09-15'),
          nextDue: new Date('2025-10-15'),
          tasks: JSON.stringify([
            'Calibrate pressure sensors',
            'Test alarm systems',
            'Check valve functionality',
            'Clean internal components',
            'Update firmware if needed'
          ]),
          parts: JSON.stringify([
            'Pressure sensor calibration kit',
            'Valve replacement set',
            'Cleaning solution',
            'Firmware update files'
          ]),
          estimatedHours: 4,
          createdById: hospitalAdmin.id,
        },
      });

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
}
