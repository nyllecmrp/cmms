import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

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
  constructor(private db: DatabaseService) {}

  async create(data: CreateModuleRequestDto) {
    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO ModuleRequest (
        id, moduleCode, requestType, justification, expectedUsage,
        organizationId, requestedById, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.moduleCode,
        data.requestType,
        data.justification || null,
        data.expectedUsage || null,
        data.organizationId,
        data.requestedById,
        'pending',
      ]
    );

    // Fetch the created module request with relations
    const requests = await this.db.query(
      `SELECT
        mr.*,
        u.id as requestedBy_id, u.email as requestedBy_email,
        u.firstName as requestedBy_firstName, u.lastName as requestedBy_lastName
      FROM ModuleRequest mr
      LEFT JOIN User u ON mr.requestedById = u.id
      WHERE mr.id = ?`,
      [id]
    );

    return this.formatModuleRequestWithRelations(requests[0]);
  }

  async findPending() {
    const requests = await this.db.query(
      `SELECT
        mr.*,
        o.id as organization_id, o.name as organization_name, o.tier as organization_tier,
        requester.id as requestedBy_id, requester.email as requestedBy_email,
        requester.firstName as requestedBy_firstName, requester.lastName as requestedBy_lastName,
        reviewer.id as reviewedBy_id, reviewer.email as reviewedBy_email,
        reviewer.firstName as reviewedBy_firstName, reviewer.lastName as reviewedBy_lastName
      FROM ModuleRequest mr
      LEFT JOIN Organization o ON mr.organizationId = o.id
      LEFT JOIN User requester ON mr.requestedById = requester.id
      LEFT JOIN User reviewer ON mr.reviewedById = reviewer.id
      WHERE mr.status = 'pending'
      ORDER BY mr.createdAt DESC`,
      []
    );

    return requests.map(req => this.formatModuleRequestWithRelations(req, true));
  }

  async findAll(organizationId: string) {
    const requests = await this.db.query(
      `SELECT
        mr.*,
        requester.id as requestedBy_id, requester.email as requestedBy_email,
        requester.firstName as requestedBy_firstName, requester.lastName as requestedBy_lastName,
        reviewer.id as reviewedBy_id, reviewer.email as reviewedBy_email,
        reviewer.firstName as reviewedBy_firstName, reviewer.lastName as reviewedBy_lastName
      FROM ModuleRequest mr
      LEFT JOIN User requester ON mr.requestedById = requester.id
      LEFT JOIN User reviewer ON mr.reviewedById = reviewer.id
      WHERE mr.organizationId = ?
      ORDER BY mr.createdAt DESC`,
      [organizationId]
    );

    return requests.map(req => this.formatModuleRequestWithRelations(req));
  }

  async findOne(id: string) {
    const requests = await this.db.query(
      `SELECT
        mr.*,
        requester.id as requestedBy_id, requester.email as requestedBy_email,
        requester.firstName as requestedBy_firstName, requester.lastName as requestedBy_lastName,
        reviewer.id as reviewedBy_id, reviewer.email as reviewedBy_email,
        reviewer.firstName as reviewedBy_firstName, reviewer.lastName as reviewedBy_lastName
      FROM ModuleRequest mr
      LEFT JOIN User requester ON mr.requestedById = requester.id
      LEFT JOIN User reviewer ON mr.reviewedById = reviewer.id
      WHERE mr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return null;
    }

    return this.formatModuleRequestWithRelations(requests[0]);
  }

  async review(id: string, data: ReviewModuleRequestDto) {
    await this.db.execute(
      `UPDATE ModuleRequest
      SET status = ?, reviewNotes = ?, reviewedById = ?, reviewedAt = datetime('now'), updatedAt = datetime('now')
      WHERE id = ?`,
      [data.status, data.reviewNotes || null, data.reviewedById, id]
    );

    // Fetch the updated module request with relations
    const requests = await this.db.query(
      `SELECT
        mr.*,
        requester.id as requestedBy_id, requester.email as requestedBy_email,
        requester.firstName as requestedBy_firstName, requester.lastName as requestedBy_lastName,
        reviewer.id as reviewedBy_id, reviewer.email as reviewedBy_email,
        reviewer.firstName as reviewedBy_firstName, reviewer.lastName as reviewedBy_lastName
      FROM ModuleRequest mr
      LEFT JOIN User requester ON mr.requestedById = requester.id
      LEFT JOIN User reviewer ON mr.reviewedById = reviewer.id
      WHERE mr.id = ?`,
      [id]
    );

    return this.formatModuleRequestWithRelations(requests[0]);
  }

  private formatModuleRequestWithRelations(row: any, includeOrganization = false) {
    if (!row) return null;

    const request: any = {
      id: row.id,
      moduleCode: row.moduleCode,
      requestType: row.requestType,
      justification: row.justification,
      expectedUsage: row.expectedUsage,
      organizationId: row.organizationId,
      requestedById: row.requestedById,
      status: row.status,
      reviewNotes: row.reviewNotes,
      reviewedById: row.reviewedById,
      reviewedAt: row.reviewedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    if (includeOrganization && row.organization_id) {
      request.organization = {
        id: row.organization_id,
        name: row.organization_name,
        tier: row.organization_tier,
      };
    }

    if (row.requestedBy_id) {
      request.requestedBy = {
        id: row.requestedBy_id,
        email: row.requestedBy_email,
        firstName: row.requestedBy_firstName,
        lastName: row.requestedBy_lastName,
      };
    }

    if (row.reviewedBy_id) {
      request.reviewedBy = {
        id: row.reviewedBy_id,
        email: row.reviewedBy_email,
        firstName: row.reviewedBy_firstName,
        lastName: row.reviewedBy_lastName,
      };
    }

    return request;
  }
}
