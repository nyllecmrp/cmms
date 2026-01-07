import { Module } from '@nestjs/common';
import { ModuleRequestsService } from './module-requests.service';
import { ModuleRequestsController } from './module-requests.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [ModuleRequestsService],
  controllers: [ModuleRequestsController],
  exports: [ModuleRequestsService],
})
export class ModuleRequestsModule {}
