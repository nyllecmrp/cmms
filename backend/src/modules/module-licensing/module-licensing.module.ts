import { Module } from '@nestjs/common';
import { ModuleLicensingService } from './module-licensing.service';
import { ModuleLicensingController } from './module-licensing.controller';

@Module({
  providers: [ModuleLicensingService],
  controllers: [ModuleLicensingController]
})
export class ModuleLicensingModule {}
