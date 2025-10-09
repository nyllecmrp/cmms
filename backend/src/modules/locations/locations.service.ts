import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateLocationDto {
  organizationId: string;
  name: string;
  type?: string; // Building, Floor, Room, Site
  parentId?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationDto {
  name?: string;
  type?: string;
  parentId?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLocationDto) {
    return this.prisma.location.create({
      data,
      include: {
        assets: {
          select: {
            id: true,
            assetNumber: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId },
      include: {
        assets: {
          select: {
            id: true,
            assetNumber: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.location.findUnique({
      where: { id },
      include: {
        assets: {
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateLocationDto) {
    return this.prisma.location.update({
      where: { id },
      data,
      include: {
        assets: {
          select: {
            id: true,
            assetNumber: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if location has assets
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        assets: true,
      },
    });

    if (location && location.assets.length > 0) {
      throw new Error(
        `Cannot delete location with ${location.assets.length} assets. Please reassign assets first.`,
      );
    }

    return this.prisma.location.delete({
      where: { id },
    });
  }

  async getLocationStats(organizationId: string) {
    const locations = await this.prisma.location.findMany({
      where: { organizationId },
      include: {
        assets: {
          select: {
            status: true,
          },
        },
      },
    });

    return locations.map((location) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      totalAssets: location.assets.length,
      operationalAssets: location.assets.filter((a) => a.status === 'operational').length,
      downAssets: location.assets.filter((a) => a.status === 'down').length,
      maintenanceAssets: location.assets.filter((a) => a.status === 'maintenance').length,
    }));
  }
}

