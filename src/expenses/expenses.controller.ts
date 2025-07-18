import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, FilterExpensesDto, ExpenseResponseDto, MonthlySummaryDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../../generated/prisma';

/**
 * Expenses controller that handles all expense-related HTTP requests
 * All endpoints require JWT authentication
 */
@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * Create a new expense
   * @param user - Current authenticated user
   * @param createExpenseDto - Expense data
   * @returns Created expense
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense successfully created',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiBody({ type: CreateExpenseDto })
  async create(
    @CurrentUser() user: User,
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(user.id, createExpenseDto);
  }

  /**
   * Get all expenses for the authenticated user with optional filtering
   * @param user - Current authenticated user
   * @param filterDto - Optional filtering criteria
   * @returns Array of expenses
   */
  @Get()
  @ApiOperation({ summary: 'Get all expenses with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
    type: [ExpenseResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (ISO string)',
    example: '2025-01-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Category to filter by',
    example: 'Food',
  })
  async findAll(
    @CurrentUser() user: User,
    @Query() filterDto: FilterExpensesDto,
  ): Promise<ExpenseResponseDto[]> {
    return this.expensesService.findAll(user.id, filterDto);
  }

  /**
   * Get monthly spending summary
   * @param user - Current authenticated user
   * @param year - Year for the summary (optional)
   * @param month - Month for the summary (optional)
   * @returns Monthly summary with totals and category breakdown
   */
  @Get('summary/monthly')
  @ApiOperation({ summary: 'Get monthly spending summary' })
  @ApiResponse({
    status: 200,
    description: 'Monthly summary retrieved successfully',
    type: MonthlySummaryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year for the summary (defaults to current year)',
    example: 2025,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month for the summary (defaults to current month)',
    example: 1,
  })
  async getMonthlySummary(
    @CurrentUser() user: User,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
  ): Promise<MonthlySummaryDto> {
    return this.expensesService.getMonthlySummary(user.id, year, month);
  }

  /**
   * Get the last 5 expenses
   * @param user - Current authenticated user
   * @returns Array of the 5 most recent expenses
   */
  @Get('recent')
  @ApiOperation({ summary: 'Get the last 5 expenses' })
  @ApiResponse({
    status: 200,
    description: 'Recent expenses retrieved successfully',
    type: [ExpenseResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getRecentExpenses(
    @CurrentUser() user: User,
  ): Promise<ExpenseResponseDto[]> {
    return this.expensesService.getRecentExpenses(user.id);
  }

  /**
   * Get a specific expense by ID
   * @param user - Current authenticated user
   * @param id - Expense ID
   * @returns Expense if found and owned by user
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific expense by ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - expense belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 1,
  })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(id, user.id);
  }

  /**
   * Update an existing expense
   * @param user - Current authenticated user
   * @param id - Expense ID to update
   * @param updateExpenseDto - Updated expense data
   * @returns Updated expense
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing expense' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - expense belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 1,
  })
  @ApiBody({ type: UpdateExpenseDto })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(id, user.id, updateExpenseDto);
  }

  /**
   * Delete an expense
   * @param user - Current authenticated user
   * @param id - Expense ID to delete
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({
    status: 204,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - expense belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 1,
  })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.expensesService.remove(id, user.id);
  }
}
