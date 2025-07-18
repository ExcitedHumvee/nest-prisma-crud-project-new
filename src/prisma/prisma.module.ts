import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma module that provides database access throughout the application
 * This module is marked as global to avoid importing it in every feature module
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
