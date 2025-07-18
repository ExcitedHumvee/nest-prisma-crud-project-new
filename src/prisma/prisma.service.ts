import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

/**
 * Prisma service that extends PrismaClient to provide database access
 * throughout the application. Handles connection lifecycle and ensures
 * proper initialization and cleanup.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Initialize the Prisma client connection when the module loads
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Gracefully disconnect from the database when the application shuts down
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
