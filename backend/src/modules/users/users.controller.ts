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
import { ModuleAccessGuard, RequireModule } from '../../common/guards/module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';

@Controller('users')
@UseGuards(JwtAuthGuard, ModuleAccessGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireModule(ModuleKey.USERS)
  findAll(@Query('organizationId') organizationId: string) {
    return this.usersService.findAll(organizationId);
  }

  @Post()
  create(@Body() createData: any, @Request() req: any) {
    return this.usersService.create(createData);
  }

  @Post('invite')
  @RequireModule(ModuleKey.USERS)
  invite(@Body() inviteData: any, @Request() req: any) {
    return this.usersService.invite({
      ...inviteData,
      invitedBy: req.user.id,
    });
  }

  @Patch(':id')
  @RequireModule(ModuleKey.USERS)
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @RequireModule(ModuleKey.USERS)
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
