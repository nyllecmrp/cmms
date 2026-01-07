import { Module, Global } from '@nestjs/common';
import { SimpleModuleAccessGuard } from './guards/simple-module-access.guard';
import { ModuleAccessGuard } from './guards/module-access.guard';
import { ModuleLicensingModule } from '../modules/module-licensing/module-licensing.module';

@Global()
@Module({
  imports: [ModuleLicensingModule],
  providers: [SimpleModuleAccessGuard, ModuleAccessGuard],
  exports: [SimpleModuleAccessGuard, ModuleAccessGuard],
})
export class CommonModule {}
