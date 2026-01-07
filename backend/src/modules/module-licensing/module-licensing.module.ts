import { Module } from '@nestjs/common';
import { ModuleLicensingService } from './module-licensing.service';
import { ModuleLicensingController } from './module-licensing.controller';
import { DataArchivalService } from './data-archival.service';
import { ModuleExpirationScheduler } from './module-expiration.scheduler';

@Module({
  providers: [
    ModuleLicensingService,
    DataArchivalService,
    ModuleExpirationScheduler,
  ],
  controllers: [ModuleLicensingController],
  exports: [ModuleLicensingService, DataArchivalService],
})
export class ModuleLicensingModule {}
