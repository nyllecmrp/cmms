import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Database } from '@sqlitecloud/drivers';
import BetterSqlite3 from 'better-sqlite3';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: any;
  private isLocalFile: boolean = false;
  private connectionString: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  async onModuleInit() {
    this.connectionString = process.env.DATABASE_URL || 'file:./dev.db';
    await this.connect();
  }

  private async connect() {
    console.log('🔌 Connecting to database:', this.connectionString.replace(/apikey=[^&]+/, 'apikey=***'));

    try {
      // Check if it's a local file or cloud connection
      if (this.connectionString.startsWith('file:')) {
        this.isLocalFile = true;
        const filePath = this.connectionString.replace('file:', '');
        this.db = new BetterSqlite3(filePath);
        console.log('✅ Connected to local SQLite database');
      } else {
        this.isLocalFile = false;
        this.db = new Database(this.connectionString);
        console.log('✅ Connected to SQLite Cloud database');
      }
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  private async reconnect(): Promise<void> {
    if (this.isLocalFile) {
      throw new Error('Local database connection lost');
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      throw new Error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
    }

    this.reconnectAttempts++;
    console.log(`⚠️ Connection lost. Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    try {
      if (this.db) {
        try {
          await this.db.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      this.db = new Database(this.connectionString);
      console.log('✅ Reconnected to SQLite Cloud database');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.db) {
      if (this.isLocalFile) {
        this.db.close();
      } else {
        await this.db.close();
      }
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (this.isLocalFile) {
        const stmt = this.db.prepare(sql);
        return stmt.all(...params);
      } else {
        return await this.db.sql(sql, ...params);
      }
    } catch (error: any) {
      // Check if it's a connection error
      if (error.code === 'ERR_CONNECTION_NOT_ESTABLISHED' || error.message?.includes('Connection unavailable')) {
        console.warn('⚠️ Connection error detected, attempting to reconnect...');
        await this.reconnect();
        // Retry the query after reconnection
        if (this.isLocalFile) {
          const stmt = this.db.prepare(sql);
          return stmt.all(...params);
        } else {
          return await this.db.sql(sql, ...params);
        }
      }
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    try {
      if (this.isLocalFile) {
        const stmt = this.db.prepare(sql);
        return stmt.run(...params);
      } else {
        return await this.db.sql(sql, ...params);
      }
    } catch (error: any) {
      // Check if it's a connection error
      if (error.code === 'ERR_CONNECTION_NOT_ESTABLISHED' || error.message?.includes('Connection unavailable')) {
        console.warn('⚠️ Connection error detected, attempting to reconnect...');
        await this.reconnect();
        // Retry the execute after reconnection
        if (this.isLocalFile) {
          const stmt = this.db.prepare(sql);
          return stmt.run(...params);
        } else {
          return await this.db.sql(sql, ...params);
        }
      }
      throw error;
    }
  }

  getDatabase(): any {
    return this.db;
  }
}
