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
      // Parse URL to extract apikey parameter
      const urlObj = new URL(process.env.DATABASE_URL_CLOUD);
      const apikey = urlObj.searchParams.get('apikey');

      // Remove apikey from URL and pass it separately
      urlObj.searchParams.delete('apikey');
      const cleanUrl = urlObj.toString();

      const libsqlClient = createClient({
        url: cleanUrl,
        authToken: apikey || undefined,
      });
      // @ts-ignore - Type mismatch between @libsql/client versions
      const libsqlAdapter = new PrismaLibSQL(libsqlClient);
      super({ adapter: libsqlAdapter });
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
