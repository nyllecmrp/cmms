import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.db.query(
      'SELECT id FROM User WHERE email = ?',
      [data.email]
    );

    if (existingUser && existingUser.length > 0) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate ID
    const userId = randomBytes(16).toString('hex');

    // Create user
    await this.db.execute(
      `INSERT INTO User (id, email, password, firstName, lastName, organizationId, roleId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, data.email, hashedPassword, data.firstName, data.lastName, data.organizationId, data.roleId || null]
    );

    const user = {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId || null,
      organizationId: data.organizationId,
    };

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roleId: user.roleId,
    });

    return {
      user,
      access_token: token,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDto) {
    // Find user
    const users = await this.db.query(
      'SELECT id, email, password, firstName, lastName, roleId, organizationId, isSuperAdmin FROM User WHERE email = ?',
      [data.email]
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      roleId: user.roleId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        organizationId: user.organizationId,
        isSuperAdmin: user.isSuperAdmin,
      },
      access_token: token,
    };
  }

  /**
   * Validate user from JWT payload
   */
  async validateUser(payload: any) {
    const users = await this.db.query(
      'SELECT id, email, firstName, lastName, roleId, organizationId, isSuperAdmin FROM User WHERE id = ?',
      [payload.sub]
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    return users[0];
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: any) {
    await this.db.execute(
      `UPDATE User SET firstName = ?, lastName = ?, phone = ?, updatedAt = datetime('now') WHERE id = ?`,
      [updateData.firstName, updateData.lastName, updateData.phone, userId]
    );

    const users = await this.db.query(
      'SELECT id, email, firstName, lastName, phone, roleId, organizationId FROM User WHERE id = ?',
      [userId]
    );

    return { user: users[0], message: 'Profile updated successfully' };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password
    const users = await this.db.query(
      'SELECT id, password FROM User WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = users[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.db.execute(
      `UPDATE User SET password = ?, updatedAt = datetime('now') WHERE id = ?`,
      [hashedPassword, userId]
    );

    return { message: 'Password changed successfully' };
  }
}
