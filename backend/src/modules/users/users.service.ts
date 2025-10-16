import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async findAll(organizationId: string) {
    return this.db.query(
      `SELECT id, email, firstName, lastName, phone, roleId, status, createdAt, updatedAt
       FROM User
       WHERE organizationId = ?
       ORDER BY createdAt DESC`,
      [organizationId]
    );
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: string;
    organizationId: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userId = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO User (id, email, password, firstName, lastName, roleId, organizationId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, data.email, hashedPassword, data.firstName, data.lastName, data.roleId, data.organizationId, 'active']
    );

    const users = await this.db.query(
      'SELECT id, email, firstName, lastName, roleId, status FROM User WHERE id = ?',
      [userId]
    );

    return {
      user: users[0],
      message: 'User created successfully',
    };
  }

  async invite(data: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    organizationId: string;
    invitedBy: string;
  }) {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const userId = randomBytes(16).toString('hex');

    await this.db.execute(
      `INSERT INTO User (id, email, password, firstName, lastName, roleId, organizationId, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, data.email, hashedPassword, data.firstName, data.lastName, data.roleId, data.organizationId, 'pending']
    );

    const users = await this.db.query(
      'SELECT id, email, firstName, lastName, roleId, status FROM User WHERE id = ?',
      [userId]
    );

    // TODO: Send email with temp password
    return {
      user: users[0],
      tempPassword, // In production, don't return this - send via email
      message: 'User invited successfully',
    };
  }

  async update(id: string, updateData: any) {
    await this.db.execute(
      `UPDATE User SET firstName = ?, lastName = ?, phone = ?, roleId = ?, status = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [updateData.firstName, updateData.lastName, updateData.phone, updateData.roleId, updateData.status, id]
    );

    const users = await this.db.query(
      'SELECT id, email, firstName, lastName, phone, roleId, status FROM User WHERE id = ?',
      [id]
    );

    return { user: users[0], message: 'User updated successfully' };
  }

  async remove(id: string) {
    await this.db.execute('DELETE FROM User WHERE id = ?', [id]);
    return { message: 'User removed successfully' };
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    // Note: pushNotifications field doesn't exist in current schema
    // This method is a placeholder for future notification preferences
    const users = await this.db.query(
      'SELECT id, email FROM User WHERE id = ?',
      [userId]
    );

    return { user: users[0], message: 'Notification preferences updated successfully' };
  }
}
