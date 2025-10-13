import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreatePMScheduleDto {
  organizationId: string;
  name: string;
  description?: string;
  assetId?: string;
  frequency: string;
  frequencyValue?: number;
  priority?: string;
  assignedToId?: string;
  lastCompleted?: string;
  nextDue: string;
  tasks?: string;
  parts?: string;
  estimatedHours?: number;
  createdById: string;
}

export interface UpdatePMScheduleDto {
  name?: string;
  description?: string;
  assetId?: string;
  frequency?: string;
  frequencyValue?: number;
  priority?: string;
  status?: string;
  assignedToId?: string;
  lastCompleted?: string;
  nextDue?: string;
  tasks?: string;
  parts?: string;
  estimatedHours?: number;
}

@Injectable()
export class PMSchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(createPMScheduleDto: CreatePMScheduleDto) {
    const { lastCompleted, nextDue, ...data } = createPMScheduleDto;
    
    return this.prisma.pMSchedule.create({
      data: {
        ...data,
        lastCompleted: lastCompleted ? new Date(lastCompleted) : null,
        nextDue: new Date(nextDue),
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.pMSchedule.findMany({
      where: { organizationId },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { nextDue: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.pMSchedule.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, updatePMScheduleDto: UpdatePMScheduleDto) {
    const { lastCompleted, nextDue, ...data } = updatePMScheduleDto;
    
    const updateData: any = { ...data };
    
    if (lastCompleted !== undefined) {
      updateData.lastCompleted = lastCompleted ? new Date(lastCompleted) : null;
    }
    
    if (nextDue !== undefined) {
      updateData.nextDue = new Date(nextDue);
    }

    return this.prisma.pMSchedule.update({
      where: { id },
      data: updateData,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.pMSchedule.delete({
      where: { id },
    });
  }

  async getStats(organizationId: string) {
    const [total, dueSoon, overdue, completedThisMonth] = await Promise.all([
      this.prisma.pMSchedule.count({
        where: { organizationId },
      }),
      this.prisma.pMSchedule.count({
        where: {
          organizationId,
          nextDue: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: { not: 'completed' },
        },
      }),
      this.prisma.pMSchedule.count({
        where: {
          organizationId,
          nextDue: { lt: new Date() },
          status: { not: 'completed' },
        },
      }),
      this.prisma.pMSchedule.count({
        where: {
          organizationId,
          lastCompleted: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          },
        },
      }),
    ]);

    return {
      total,
      dueSoon,
      overdue,
      completedThisMonth,
    };
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.pMSchedule.update({
      where: { id },
      data: { status },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetNumber: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}