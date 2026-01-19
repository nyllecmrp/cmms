import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';

export interface CreateSupplierDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: string;
  supplierType?: string;
  status?: string;
  rating?: number;
  notes?: string;
  organizationId: string;
  createdById: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: string;
  supplierType?: string;
  status?: string;
  rating?: number;
  notes?: string;
}

@Injectable()
export class SuppliersService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateSupplierDto) {
    const id = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO Supplier (
        id, organizationId, name, contactPerson, email, phone,
        address, city, country, website, taxId, paymentTerms,
        supplierType, status, rating, notes, createdById, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        id,
        data.organizationId,
        data.name,
        data.contactPerson || null,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.city || null,
        data.country || null,
        data.website || null,
        data.taxId || null,
        data.paymentTerms || '30 days',
        data.supplierType || null,
        data.status || 'active',
        data.rating || null,
        data.notes || null,
        data.createdById,
      ]
    );

    const suppliers = await this.db.query(
      'SELECT * FROM Supplier WHERE id = ?',
      [id]
    );

    return suppliers[0];
  }

  async findAll(organizationId: string) {
    const suppliers = await this.db.query(
      `SELECT * FROM Supplier
       WHERE organizationId = ?
       ORDER BY name ASC`,
      [organizationId]
    );

    return suppliers;
  }

  async findOne(id: string) {
    const suppliers = await this.db.query(
      'SELECT * FROM Supplier WHERE id = ?',
      [id]
    );

    return suppliers.length > 0 ? suppliers[0] : null;
  }

  async update(id: string, data: UpdateSupplierDto) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.contactPerson !== undefined) {
      updates.push('contactPerson = ?');
      values.push(data.contactPerson);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      values.push(data.address);
    }
    if (data.city !== undefined) {
      updates.push('city = ?');
      values.push(data.city);
    }
    if (data.country !== undefined) {
      updates.push('country = ?');
      values.push(data.country);
    }
    if (data.website !== undefined) {
      updates.push('website = ?');
      values.push(data.website);
    }
    if (data.taxId !== undefined) {
      updates.push('taxId = ?');
      values.push(data.taxId);
    }
    if (data.paymentTerms !== undefined) {
      updates.push('paymentTerms = ?');
      values.push(data.paymentTerms);
    }
    if (data.supplierType !== undefined) {
      updates.push('supplierType = ?');
      values.push(data.supplierType);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.rating !== undefined) {
      updates.push('rating = ?');
      values.push(data.rating);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    updates.push('updatedAt = datetime(\'now\')');
    values.push(id);

    await this.db.execute(
      `UPDATE Supplier SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.db.execute('DELETE FROM Supplier WHERE id = ?', [id]);
    return { id };
  }
}
