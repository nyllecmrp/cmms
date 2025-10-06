import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateWorkOrderDto {
  workOrderNumber: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  assetId?: string;
  assignedToId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedHours?: number;
  notes?: string;
  customFields?: string;
  organizationId: string;
  createdById: string;
}

export interface UpdateWorkOrderDto {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  assetId?: string;
  assignedToId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedHours?: number;
  actualHours?: number;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  notes?: string;
  customFields?: string;
}

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        ...data,
        scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : undefined,
        scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
      },
      include: {
        asset: { select: { id: true, assetNumber: true, name: true } },
        assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.workOrder.findMany({
      where: { organizationId },
      include: {
        asset: { select: { id: true, assetNumber: true, name: true } },
        assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        asset: true,
        assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdateWorkOrderDto) {
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...data,
        scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : undefined,
        scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
        actualStart: data.actualStart ? new Date(data.actualStart) : undefined,
        actualEnd: data.actualEnd ? new Date(data.actualEnd) : undefined,
      },
      include: {
        asset: true,
        assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
