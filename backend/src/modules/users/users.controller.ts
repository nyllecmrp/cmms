import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('organizationId') organizationId: string) {
    return this.usersService.findAll(organizationId);
  }

  @Post('invite')
  invite(@Body() inviteData: any, @Request() req: any) {
    return this.usersService.invite({
      ...inviteData,
      invitedBy: req.user.id,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/notifications')
  updateNotifications(
    @Param('id') id: string,
    @Body() preferences: any,
  ) {
    return this.usersService.updateNotificationPreferences(id, preferences);
  }
}
