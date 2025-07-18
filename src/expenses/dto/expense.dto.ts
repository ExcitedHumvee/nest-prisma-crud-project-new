import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for creating a new expense
 * Contains validation rules for expense input
 */
export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense amount (must be positive)',
    example: 25.50,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Date of the expense (ISO string)',
    example: '2025-01-15T10:00:00Z',
  })
  @IsNotEmpty({ message: 'Date is required' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date: string;

  @ApiProperty({
    description: 'Expense category',
    example: 'Food',
  })
  @IsNotEmpty({ message: 'Category is required' })
  @IsString({ message: 'Category must be a string' })
  category: string;

  @ApiProperty({
    description: 'Optional note about the expense',
    example: 'Lunch at restaurant',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  note?: string;
}

/**
 * Data Transfer Object for updating an existing expense
 * All fields are optional to allow partial updates
 */
export class UpdateExpenseDto {
  @ApiProperty({
    description: 'Expense amount (must be positive)',
    example: 30.00,
    minimum: 0.01,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount?: number;

  @ApiProperty({
    description: 'Date of the expense (ISO string)',
    example: '2025-01-15T14:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;

  @ApiProperty({
    description: 'Expense category',
    example: 'Transportation',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @ApiProperty({
    description: 'Optional note about the expense',
    example: 'Updated expense note',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  note?: string;
}

/**
 * Data Transfer Object for filtering expenses
 * Contains optional query parameters for expense filtering
 */
export class FilterExpensesDto {
  @ApiProperty({
    description: 'Start date for filtering (ISO string)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO string)',
    example: '2025-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;

  @ApiProperty({
    description: 'Category to filter by',
    example: 'Food',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;
}

/**
 * Data Transfer Object for expense response
 * Represents the structure of expense data returned by the API
 */
export class ExpenseResponseDto {
  @ApiProperty({
    description: 'Expense ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Expense amount',
    example: 25.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Date of the expense',
    example: '2025-01-15T10:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Expense category',
    example: 'Food',
  })
  category: string;

  @ApiProperty({
    description: 'Optional note about the expense',
    example: 'Lunch at restaurant',
    required: false,
  })
  note?: string;

  @ApiProperty({
    description: 'User ID who owns the expense',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T10:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * Data Transfer Object for monthly summary response
 * Contains aggregated spending data for a specific month
 */
export class MonthlySummaryDto {
  @ApiProperty({
    description: 'Year and month of the summary',
    example: '2025-01',
  })
  month: string;

  @ApiProperty({
    description: 'Total amount spent in the month',
    example: 1250.75,
  })
  totalSpent: number;

  @ApiProperty({
    description: 'Spending breakdown by category',
    example: [
      { category: 'Food', total: 450.25 },
      { category: 'Transportation', total: 200.50 },
      { category: 'Entertainment', total: 600.00 },
    ],
  })
  categories: {
    category: string;
    total: number;
  }[];
}
