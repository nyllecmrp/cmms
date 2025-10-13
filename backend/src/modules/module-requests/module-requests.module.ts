import { Module } from '@nestjs/common';
import { ModuleRequestsService } from './module-requests.service';
import { ModuleRequestsController } from './module-requests.controller';

@Module({
  imports: [],
  providers: [ModuleRequestsService],
  controllers: [ModuleRequestsController],
  exports: [ModuleRequestsService],
})
export class ModuleRequestsModule {}
