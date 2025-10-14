import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Database } from '@sqlitecloud/drivers';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database;

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL_CLOUD || process.env.DATABASE_URL || 'file:./dev.db';
    console.log('🔌 Connecting to database:', connectionString.replace(/apikey=[^&]+/, 'apikey=***'));
    try {
      this.db = new Database(connectionString);
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.db) {
      await this.db.close();
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    return this.db.sql(sql, ...params);
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    return this.db.sql(sql, ...params);
  }

  getDatabase(): Database {
    return this.db;
  }
}
