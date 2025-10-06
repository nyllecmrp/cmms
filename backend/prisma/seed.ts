import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create test organizations
  const org1 = await prisma.organization.upsert({
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

  const org2 = await prisma.organization.upsert({
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

  console.log('✅ Organizations created');

  // Create superadmin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@cmms.com' },
    update: {},
    create: {
      email: 'superadmin@cmms.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
      status: 'active',
    },
  });

  const org1Admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      organizationId: org1.id,
      status: 'active',
    },
  });

  const org2Admin = await prisma.user.upsert({
    where: { email: 'admin@metrohospital.ph' },
    update: {},
    create: {
      email: 'admin@metrohospital.ph',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      organizationId: org2.id,
      status: 'active',
    },
  });

  console.log('✅ Users created');

  // Activate modules for Acme Manufacturing (Professional tier)
  const acmeModules = [
    'preventive_maintenance',
    'inventory_management',
    'scheduling_planning',
    'document_management',
  ];

  for (const moduleCode of acmeModules) {
    await prisma.moduleLicense.upsert({
      where: {
        organizationId_moduleCode: {
          organizationId: org1.id,
          moduleCode,
        },
      },
      update: {},
      create: {
        organizationId: org1.id,
        moduleCode,
        status: 'active',
        tierLevel: 'standard',
        activatedById: superAdmin.id,
        expiresAt: new Date('2026-12-31'),
      },
    });
  }

  console.log('✅ Acme Manufacturing modules activated');

  // Activate modules for Metro Hospital (Enterprise tier)
  const hospitalModules = [
    'preventive_maintenance',
    'calibration_management',
    'safety_compliance',
    'document_management',
    'audit_quality',
    'advanced_analytics',
  ];

  for (const moduleCode of hospitalModules) {
    await prisma.moduleLicense.upsert({
      where: {
        organizationId_moduleCode: {
          organizationId: org2.id,
          moduleCode,
        },
      },
      update: {},
      create: {
        organizationId: org2.id,
        moduleCode,
        status: 'active',
        tierLevel: moduleCode === 'audit_quality' ? 'premium' : 'advanced',
        activatedById: superAdmin.id,
        expiresAt: new Date('2026-12-31'),
      },
    });
  }

  console.log('✅ Metro Hospital modules activated');

  // Create sample assets
  const asset1 = await prisma.asset.create({
    data: {
      organizationId: org1.id,
      assetNumber: 'PUMP-001',
      name: 'Hydraulic Pump Unit A',
      description: 'Main hydraulic pump for production line 1',
      category: 'Equipment',
      manufacturer: 'Bosch Rexroth',
      model: 'A10VSO',
      serialNumber: 'BR-2023-12345',
      status: 'operational',
      criticality: 'high',
      purchaseDate: new Date('2023-01-15'),
      purchaseCost: 450000,
      createdById: org1Admin.id,
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      organizationId: org2.id,
      assetNumber: 'MED-CT-001',
      name: 'CT Scanner - Radiology',
      description: '128-slice CT scanner',
      category: 'Equipment',
      manufacturer: 'Siemens Healthineers',
      model: 'SOMATOM Definition AS+',
      serialNumber: 'SH-CT-2022-789',
      status: 'operational',
      criticality: 'critical',
      purchaseDate: new Date('2022-06-01'),
      purchaseCost: 25000000,
      warrantyExpiresAt: new Date('2027-06-01'),
      createdById: org2Admin.id,
    },
  });

  console.log('✅ Sample assets created');

  // Create sample work orders
  await prisma.workOrder.create({
    data: {
      organizationId: org1.id,
      workOrderNumber: 'WO-2025-001',
      title: 'Monthly PM - Hydraulic Pump',
      description: 'Routine preventive maintenance for PUMP-001',
      type: 'preventive',
      priority: 'medium',
      status: 'open',
      assetId: asset1.id,
      createdById: org1Admin.id,
      scheduledStart: new Date('2025-10-05'),
      estimatedHours: 2,
    },
  });

  await prisma.workOrder.create({
    data: {
      organizationId: org2.id,
      workOrderNumber: 'WO-2025-H001',
      title: 'CT Scanner Calibration',
      description: 'Quarterly calibration and quality assurance',
      type: 'preventive',
      priority: 'high',
      status: 'open',
      assetId: asset2.id,
      createdById: org2Admin.id,
      scheduledStart: new Date('2025-10-10'),
      estimatedHours: 4,
    },
  });

  console.log('✅ Sample work orders created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Superadmin: superadmin@cmms.com / admin123');
  console.log('Acme Admin: admin@acme.com / admin123');
  console.log('Hospital Admin: admin@metrohospital.ph / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
