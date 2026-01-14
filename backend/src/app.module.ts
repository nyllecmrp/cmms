import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { ModuleRequestsModule } from './modules/module-requests/module-requests.module';
import { ModuleLicensingModule } from './modules/module-licensing/module-licensing.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PMSchedulesModule } from './modules/pm-schedules/pm-schedules.module';
import { PurchaseRequestsModule } from './modules/purchase-requests/purchase-requests.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MaintenanceScheduleModule } from './modules/maintenance-schedule/maintenance-schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CommonModule,
    AuthModule,
    AssetsModule,
    WorkOrdersModule,
    ModuleRequestsModule,
    ModuleLicensingModule,
    NotificationsModule,
    BillingModule,
    InventoryModule,
    MaintenanceScheduleModule,
    OrganizationsModule,
    UsersModule,
    LocationsModule,
    PMSchedulesModule,
    PurchaseRequestsModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
