import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { ModuleRequestsModule } from './modules/module-requests/module-requests.module';
import { ModuleLicensingModule } from './modules/module-licensing/module-licensing.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PMSchedulesModule } from './modules/pm-schedules/pm-schedules.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    AssetsModule,
    WorkOrdersModule,
    ModuleRequestsModule,
    ModuleLicensingModule,
    OrganizationsModule,
    UsersModule,
    LocationsModule,
    PMSchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
