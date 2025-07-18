import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, FilterExpensesDto, MonthlySummaryDto } from './dto/expense.dto';
import { Expense } from '../../generated/prisma';

/**
 * Expenses service that handles all expense-related business logic
 * Provides CRUD operations, filtering, and aggregation for expenses
 */
@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new expense for the authenticated user
   * @param userId - ID of the user creating the expense
   * @param createExpenseDto - Expense data to create
   * @returns Created expense with user information
   */
  async create(userId: number, createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { amount, date, category, note } = createExpenseDto;

    // Use Prisma transaction for data integrity
    return this.prisma.$transaction(async (prisma) => {
      return prisma.expense.create({
        data: {
          amount,
          date: new Date(date),
          category,
          note,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get all expenses for the authenticated user with optional filtering
   * @param userId - ID of the user whose expenses to retrieve
   * @param filterDto - Optional filtering criteria
   * @returns Array of expenses matching the criteria
   */
  async findAll(userId: number, filterDto?: FilterExpensesDto): Promise<Expense[]> {
    const { startDate, endDate, category } = filterDto || {};

    // Build where clause for filtering
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    if (category) {
      whereClause.category = category;
    }

    return this.prisma.expense.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get a specific expense by ID
   * @param id - Expense ID
   * @param userId - ID of the user requesting the expense
   * @returns Expense if found and owned by user
   * @throws NotFoundException if expense doesn't exist
   * @throws ForbiddenException if user doesn't own the expense
   */
  async findOne(id: number, userId: number): Promise<Expense> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('You can only access your own expenses');
    }

    return expense;
  }

  /**
   * Update an existing expense
   * @param id - Expense ID to update
   * @param userId - ID of the user updating the expense
   * @param updateExpenseDto - Updated expense data
   * @returns Updated expense
   * @throws NotFoundException if expense doesn't exist
   * @throws ForbiddenException if user doesn't own the expense
   */
  async update(id: number, userId: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    // First verify the expense exists and belongs to the user
    await this.findOne(id, userId);

    const { amount, date, category, note } = updateExpenseDto;

    // Use Prisma transaction for data integrity
    return this.prisma.$transaction(async (prisma) => {
      return prisma.expense.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(category !== undefined && { category }),
          ...(note !== undefined && { note }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  }

  /**
   * Delete an expense
   * @param id - Expense ID to delete
   * @param userId - ID of the user deleting the expense
   * @throws NotFoundException if expense doesn't exist
   * @throws ForbiddenException if user doesn't own the expense
   */
  async remove(id: number, userId: number): Promise<void> {
    // First verify the expense exists and belongs to the user
    await this.findOne(id, userId);

    // Use Prisma transaction for data integrity
    await this.prisma.$transaction(async (prisma) => {
      await prisma.expense.delete({
        where: { id },
      });
    });
  }

  /**
   * Get monthly spending summary for the authenticated user
   * @param userId - ID of the user
   * @param year - Year for the summary (defaults to current year)
   * @param month - Month for the summary (defaults to current month)
   * @returns Monthly summary with total spending and category breakdown
   */
  async getMonthlySummary(userId: number, year?: number, month?: number): Promise<MonthlySummaryDto> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    // Calculate start and end dates for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Get all expenses for the month
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    // Calculate total spending
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate spending by category
    const categoryMap = new Map<string, number>();
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    const categories = Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total,
    }));

    return {
      month: `${targetYear}-${targetMonth.toString().padStart(2, '0')}`,
      totalSpent,
      categories,
    };
  }

  /**
   * Get the last 5 expenses for the authenticated user
   * @param userId - ID of the user
   * @returns Array of the 5 most recent expenses
   */
  async getRecentExpenses(userId: number): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      where: { userId },
      orderBy: {
        date: 'desc',
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
