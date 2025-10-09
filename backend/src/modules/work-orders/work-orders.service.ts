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
  workOrderNumber?: string;
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
    // Get current work order state
    const current = await this.prisma.workOrder.findUnique({ where: { id } });
    
    if (!current) {
      throw new Error('Work order not found');
    }

    // Status transition validation
    const validTransitions: Record<string, string[]> = {
      'open': ['assigned', 'in_progress', 'on_hold'],
      'assigned': ['in_progress', 'on_hold', 'completed'],
      'in_progress': ['completed', 'on_hold'],
      'on_hold': ['assigned', 'in_progress'],
      'completed': ['closed'], // Can only close after completion
      'closed': [], // Cannot change from closed
    };

    // Check if status transition is valid
    if (data.status && current.status !== data.status) {
      const allowedTransitions = validTransitions[current.status] || [];
      if (!allowedTransitions.includes(data.status)) {
        throw new Error(
          `Invalid status transition from '${current.status}' to '${data.status}'. Allowed: ${allowedTransitions.join(', ')}`,
        );
      }
    }

    // Auto-set completedAt when status changes to completed
    if (data.status === 'completed' && current.status !== 'completed' && !data.actualEnd) {
      data.actualEnd = new Date().toISOString();
    }

    // Auto-change status to 'assigned' when user is assigned (if currently open)
    if (data.assignedToId && !current.assignedToId && current.status === 'open') {
      data.status = 'assigned';
    }

    // Auto-set actualStart when status changes to 'in_progress'
    if (data.status === 'in_progress' && current.status !== 'in_progress' && !data.actualStart) {
      data.actualStart = new Date().toISOString();
    }

    const updateData: any = {};
    
    // Only include fields that are actually provided
    if (data.workOrderNumber !== undefined) updateData.workOrderNumber = data.workOrderNumber;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assetId !== undefined) updateData.assetId = data.assetId;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.scheduledStart) updateData.scheduledStart = new Date(data.scheduledStart);
    if (data.scheduledEnd) updateData.scheduledEnd = new Date(data.scheduledEnd);
    if (data.actualStart) updateData.actualStart = new Date(data.actualStart);
    if (data.actualEnd) updateData.actualEnd = new Date(data.actualEnd);
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
    if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;
    if (data.laborCost !== undefined) updateData.laborCost = data.laborCost;
    if (data.partsCost !== undefined) updateData.partsCost = data.partsCost;
    if (data.totalCost !== undefined) updateData.totalCost = data.totalCost;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.customFields !== undefined) updateData.customFields = data.customFields;
    
    // Auto-set completedAt
    if (data.status === 'completed' && current.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    console.log('Updating work order with data:', JSON.stringify(updateData, null, 2));

    const result = await this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    console.log('Work order updated successfully:', result.workOrderNumber);
    return result;
  }

  async remove(id: string) {
    return this.prisma.workOrder.delete({ where: { id } });
  }
}
