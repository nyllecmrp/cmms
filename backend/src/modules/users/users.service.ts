import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        roleId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
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

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId,
        organizationId: data.organizationId,
        status: 'pending',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
        status: true,
      },
    });

    // TODO: Send email with temp password
    return {
      user,
      tempPassword, // In production, don't return this - send via email
      message: 'User invited successfully',
    };
  }

  async update(id: string, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        roleId: updateData.roleId,
        status: updateData.status,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        roleId: true,
        status: true,
      },
    });

    return { user, message: 'User updated successfully' };
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User removed successfully' };
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        // Note: pushNotifications field doesn't exist in current schema
        // This method is a placeholder for future notification preferences
      },
      select: {
        id: true,
        email: true,
      },
    });

    return { user, message: 'Notification preferences updated successfully' };
  }
}
