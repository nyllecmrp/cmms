import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { canAccessModule, ModuleKey, UserRole } from '../constants/role-permissions.constant';

export const REQUIRED_MODULE_KEY = 'requiredModule';
export const RequireModule = (module: ModuleKey) => SetMetadata(REQUIRED_MODULE_KEY, module);

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModule = this.reflector.getAllAndOverride<ModuleKey>(
      REQUIRED_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredModule) {
      // No module requirement specified, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Superadmins have access to all modules
    if (user.isSuperAdmin) {
      return true;
    }

    // Use roleId from JWT token (users have roleId, not role)
    const userRole = (user.roleId || user.role) as UserRole;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    // Check if user's role has access to this module
    if (!canAccessModule(userRole, requiredModule)) {
      throw new ForbiddenException(
        `Your role (${userRole}) does not have access to the ${requiredModule} module`,
      );
    }

    return true;
  }
}
