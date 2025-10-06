import { SetMetadata } from '@nestjs/common';
import { ModuleCode } from '../constants/modules.constant';

/**
 * Decorator to protect routes/controllers with module licensing
 * Usage: @RequireModule(ModuleCode.PREVENTIVE_MAINTENANCE)
 */
export const REQUIRE_MODULE_KEY = 'requireModule';
export const RequireModule = (moduleCode: ModuleCode) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleCode);
