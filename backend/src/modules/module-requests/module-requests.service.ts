import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateModuleRequestDto {
  moduleCode: string;
  requestType: string;
  justification?: string;
  expectedUsage?: string;
  organizationId: string;
  requestedById: string;
}

export interface ReviewModuleRequestDto {
  status: string;
  reviewNotes?: string;
  reviewedById: string;
}

@Injectable()
export class ModuleRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateModuleRequestDto) {
    return this.prisma.moduleRequest.create({
      data,
      include: {
        requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async findPending() {
    return this.prisma.moduleRequest.findMany({
      where: { status: 'pending' },
      include: {
        organization: { select: { id: true, name: true, tier: true } },
        requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.moduleRequest.findMany({
      where: { organizationId },
      include: {
        requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.moduleRequest.findUnique({
      where: { id },
      include: {
        requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async review(id: string, data: ReviewModuleRequestDto) {
    return this.prisma.moduleRequest.update({
      where: { id },
      data: {
        status: data.status,
        reviewNotes: data.reviewNotes,
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
      },
      include: {
        requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }
}
