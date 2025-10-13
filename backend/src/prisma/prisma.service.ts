import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { Database } from '@sqlitecloud/drivers';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Use SQLite Cloud if DATABASE_URL_CLOUD is set (production)
    if (process.env.DATABASE_URL_CLOUD) {
      // SQLite Cloud driver that implements libSQL-compatible interface
      const sqliteCloudDb = new Database(process.env.DATABASE_URL_CLOUD);

      // @ts-ignore - SQLite Cloud driver is compatible with libSQL adapter
      const adapter = new PrismaLibSQL(sqliteCloudDb);
      super({ adapter });
    } else {
      // Use local SQLite file for development
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
