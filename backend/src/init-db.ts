import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function initializeDatabase() {
  // Only initialize if using SQLite Cloud
  if (process.env.DATABASE_URL_CLOUD) {
    try {
      console.log('🔄 Initializing SQLite Cloud database schema...');

      // Set DATABASE_URL to cloud for migration
      process.env.DATABASE_URL = process.env.DATABASE_URL_CLOUD;

      // Run db push to sync schema
      const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss --skip-generate');

      if (stderr && !stderr.includes('warn')) {
        console.error('⚠️ Database push stderr:', stderr);
      }

      console.log('✅ Database schema initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }
}
