import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Use SQLite Cloud if DATABASE_URL_CLOUD is set (production)
    if (process.env.DATABASE_URL_CLOUD) {
      const libsql = createClient({
        url: process.env.DATABASE_URL_CLOUD,
      });
      const adapter = new PrismaLibSQL(libsql);
      super({ adapter: adapter as any });
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
