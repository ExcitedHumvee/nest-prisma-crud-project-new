import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';

/**
 * Main application module that brings together all feature modules
 * Configures global settings and provides application-wide services
 */
@Module({
  imports: [
    // Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Core modules
    PrismaModule,
    AuthModule,
    ExpensesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
