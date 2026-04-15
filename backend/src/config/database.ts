import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Singleton Database Client
 * Ensures only one PrismaClient instance exists across the application.
 */
class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
      logger.info('Database client initialized (Singleton)');
    }
    return DatabaseClient.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Connected to database');
    } catch (error) {
      logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    DatabaseClient.instance = null;
    logger.info('Database connection closed');
  }
}

// Export a convenience accessor
export const db = DatabaseClient.getInstance();
export const prisma = db.getClient();
export { DatabaseClient };
