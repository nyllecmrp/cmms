import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get notifications for the current user
   * GET /notifications
   */
  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = req.user.id;
    return this.notificationsService.findByUser(
      userId,
      unreadOnly === 'true',
    );
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * Mark notification as read
   * PUT /notifications/:id/read
   */
  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  /**
   * Mark all notifications as read
   * PUT /notifications/read-all
   */
  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * Delete notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  /**
   * Create notification (admin/system only)
   * POST /notifications
   */
  @Post()
  async createNotification(
    @Body()
    body: {
      userId: string;
      title: string;
      message: string;
      type: 'info' | 'warning' | 'error' | 'success';
      link?: string;
    },
  ) {
    return this.notificationsService.create(body);
  }
}
