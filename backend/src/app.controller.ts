import { Controller, Get, Post } from '@nestjs/common';
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
  async seedDatabase() {
    try {
      console.log('🌱 Starting seed...');

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
        update: {},
        create: {
          email: 'admin@acme.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+63 917 234 5678',
          status: 'active',
          organizationId: org1.id,
          isSuperAdmin: false,
        },
      });

      await this.prisma.user.upsert({
        where: { email: 'admin@metrohospital.ph' },
        update: {},
        create: {
          email: 'admin@metrohospital.ph',
          password: hashedPassword,
          firstName: 'Maria',
          lastName: 'Santos',
          phone: '+63 917 345 6789',
          status: 'active',
          organizationId: org2.id,
          isSuperAdmin: false,
        },
      });

      return {
        success: true,
        message: '✅ Database seeded successfully!',
        users: [
          'superadmin@cmms.com',
          'admin@acme.com',
          'admin@metrohospital.ph'
        ]
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
