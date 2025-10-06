import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyExpiresAt: data.warrantyExpiresAt ? new Date(data.warrantyExpiresAt) : undefined,
      },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.asset.findMany({
      where: { organizationId },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, data: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyExpiresAt: data.warrantyExpiresAt ? new Date(data.warrantyExpiresAt) : undefined,
      },
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }

  async getStatsByCategory(organizationId: string) {
    const assets = await this.prisma.asset.groupBy({
      by: ['category'],
      where: { organizationId },
      _count: true,
    });

    return assets.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = item._count;
      }
      return acc;
    }, {} as Record<string, number>);
  }
}
