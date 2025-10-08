import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const organizations = await this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            moduleLicenses: { where: { status: 'active' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      email: org.email,
      phone: org.phone,
      tier: org.tier,
      status: org.status,
      industry: org.industry,
      users: org._count.users,
      activeModules: org._count.moduleLicenses,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }));
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
        moduleLicenses: {
          select: {
            id: true,
            moduleCode: true,
            tierLevel: true,
            status: true,
            activatedAt: true,
            expiresAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            moduleLicenses: { where: { status: 'active' } },
            assets: true,
            workOrders: true,
          },
        },
      },
    });

    if (!organization) {
      return null;
    }

    return {
      ...organization,
      userCount: organization._count.users,
      activeModulesCount: organization._count.moduleLicenses,
      assetCount: organization._count.assets,
      workOrderCount: organization._count.workOrders,
    };
  }

  async create(createData: any) {
    const organization = await this.prisma.organization.create({
      data: {
        name: createData.name,
        email: createData.email,
        phone: createData.phone,
        address: createData.address,
        city: createData.city,
        country: createData.country || 'Philippines',
        industry: createData.industry,
        tier: createData.tier || 'starter',
        status: 'active',
        maxUsers: createData.maxUsers || 10,
      },
    });

    return { organization, message: 'Organization created successfully' };
  }

  async update(id: string, updateData: any) {
    const organization = await this.prisma.organization.update({
      where: { id },
      data: {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        city: updateData.city,
        country: updateData.country,
        industry: updateData.industry,
      },
    });

    return { organization, message: 'Organization updated successfully' };
  }
}
