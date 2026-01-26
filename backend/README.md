# CMMS Backend - Module Licensing System

NestJS backend with Prisma ORM and SQLite database implementing the CMMS Module Licensing Framework.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed the database with test data
npm run prisma:seed

# Start development server
npm run start:dev
```

Server runs at: `http://localhost:3000`

## 📋 Test Credentials

- **Superadmin**: superadmin@cmms.com / admin123
- **Acme Manufacturing Admin**: admin@acme.com / admin123
- **Metro Hospital Admin**: admin@metrohospital.ph / admin123

## 🔧 Tech Stack

- **NestJS** - Enterprise-grade Node.js framework
- **Prisma** - Modern ORM for TypeScript
- **SQLite** - Local development database
- **TypeScript** - Type-safe development

## 📊 Database Schema

### Core Tables
- `Organization` - Multi-tenant organizations
- `User` - Users with RBAC
- `Role` - Custom roles and permissions

### Module Licensing
- `ModuleLicense` - Active module licenses
- `ModuleUsageTracking` - Usage metrics per module
- `ModuleAccessLog` - Audit trail of module access

### CMMS Core
- `Asset` - Equipment and facilities
- `WorkOrder` - Maintenance tasks
- `Location` - Asset locations

## 🔐 Module Licensing API

### Get Organization Modules
```bash
GET /module-licensing/organization/:organizationId/modules
```

### Check Module Access
```bash
GET /module-licensing/organization/:organizationId/module/:moduleCode/access
```

### Activate Module (Superadmin)
```bash
POST /module-licensing/activate
{
  "organizationId": "org-test-1",
  "moduleCode": "predictive_maintenance",
  "expiresAt": "2026-12-31",
  "maxUsers": 50,
  "activatedById": "user-id"
}
```

### Deactivate Module (Superadmin)
```bash
DELETE /module-licensing/deactivate
{
  "organizationId": "org-test-1",
  "moduleCode": "predictive_maintenance",
  "deactivatedById": "user-id"
}
```

### Activate Tier Modules (Superadmin)
```bash
POST /module-licensing/activate-tier
{
  "organizationId": "org-test-1",
  "tier": "enterprise",
  "activatedById": "user-id",
  "expiresAt": "2026-12-31"
}
```

### Start Trial
```bash
POST /module-licensing/start-trial
{
  "organizationId": "org-test-1",
  "moduleCode": "predictive_maintenance",
  "userId": "user-id",
  "days": 30
}
```

### Get Usage Statistics
```bash
GET /module-licensing/organization/:organizationId/usage?moduleCode=preventive_maintenance
```

## 🛡️ Module Access Guard

Protect routes with module licensing:

```typescript
import { RequireModule } from './common/decorators/require-module.decorator';
import { ModuleAccessGuard } from './common/guards/module-access.guard';
import { ModuleCode } from './common/constants/modules.constant';

@Controller('predictive-maintenance')
@UseGuards(ModuleAccessGuard)
export class PredictiveMaintenanceController {

  @Get()
  @RequireModule(ModuleCode.PREDICTIVE_MAINTENANCE)
  async getAll() {
    // Only accessible if org has predictive_maintenance licensed
    return [];
  }
}
```

## 📦 Available Modules

### Core (Always Enabled)
- User Management
- Asset Management (Basic)
- Work Order Management (Basic)
- Mobile Application (Basic)
- Basic Reporting

### Standard Tier
- Preventive Maintenance
- Inventory Management
- Scheduling & Planning
- Asset Management (Advanced)
- Work Order Management (Advanced)
- Document Management
- Meter Reading

### Advanced Tier
- Predictive Maintenance
- Purchasing & Procurement
- Advanced Analytics & BI
- Safety & Compliance
- Calibration Management
- Failure Analysis
- Project Management
- Energy Management
- Mobile Application (Advanced)

### Premium Tier
- Vendor Management
- Audit & Quality
- Integration Hub & API
- Multi-tenancy Management
- Advanced Workflow Engine
- AI-Powered Optimization

## 🗂️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Test data
│   └── migrations/            # Database migrations
├── src/
│   ├── common/
│   │   ├── constants/
│   │   │   └── modules.constant.ts    # Module definitions
│   │   ├── decorators/
│   │   │   └── require-module.decorator.ts
│   │   └── guards/
│   │       └── module-access.guard.ts  # Module licensing guard
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── modules/
│   │   └── module-licensing/
│   │       ├── module-licensing.module.ts
│   │       ├── module-licensing.service.ts
│   │       └── module-licensing.controller.ts
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

## 🔄 Migration to Turso

When ready for production:

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database:
   ```bash
   turso db create cmms-prod
   ```
3. Get connection string:
   ```bash
   turso db show cmms-prod --url
   ```
4. Update `.env`:
   ```
   DATABASE_URL="libsql://your-db.turso.io?authToken=your-token"
   ```
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 📈 Next Steps

1. ✅ Module licensing system implemented
2. ⏳ Add authentication (JWT, Passport)
3. ⏳ Implement remaining CMMS modules
4. ⏳ Build superadmin UI
5. ⏳ Create customer portal
6. ⏳ Add payment integration

## 🧪 Testing

```bash
# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Test module access
curl http://localhost:3000/module-licensing/organization/org-test-1/modules
```

## 📝 License

Proprietary - CMMS Module Licensing System
