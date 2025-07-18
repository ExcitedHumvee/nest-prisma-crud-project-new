import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prismaService: PrismaService;

  // Mock expense data
  const mockExpense = {
    id: 1,
    amount: 25.50,
    date: new Date('2025-01-15T12:00:00Z'),
    category: 'Food',
    note: 'Lunch at restaurant',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  const mockPrismaService = {
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createExpenseDto = {
      amount: 25.50,
      date: '2025-01-15T12:00:00Z',
      category: 'Food',
      note: 'Lunch at restaurant',
    };

    it('should successfully create an expense', async () => {
      // Arrange
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback({
          expense: {
            create: jest.fn().mockResolvedValue(mockExpense),
          },
        }),
      );

      // Act
      const result = await service.create(1, createExpenseDto);

      // Assert
      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return expenses for a user', async () => {
      // Arrange
      const userId = 1;
      const mockExpenses = [mockExpense];
      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { date: 'desc' },
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

    it('should apply filters when provided', async () => {
      // Arrange
      const userId = 1;
      const filterDto = {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        category: 'Food',
      };
      const mockExpenses = [mockExpense];
      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      // Act
      const result = await service.findAll(userId, filterDto);

      // Assert
      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: new Date(filterDto.startDate),
            lte: new Date(filterDto.endDate),
          },
          category: filterDto.category,
        },
        orderBy: { date: 'desc' },
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
  });

  describe('findOne', () => {
    it('should return an expense if found and owned by user', async () => {
      // Arrange
      const expenseId = 1;
      const userId = 1;
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);

      // Act
      const result = await service.findOne(expenseId, userId);

      // Assert
      expect(result).toEqual(mockExpense);
      expect(mockPrismaService.expense.findUnique).toHaveBeenCalledWith({
        where: { id: expenseId },
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

    it('should throw NotFoundException if expense not found', async () => {
      // Arrange
      const expenseId = 999;
      const userId = 1;
      mockPrismaService.expense.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(expenseId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the expense', async () => {
      // Arrange
      const expenseId = 1;
      const userId = 2; // Different user
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);

      // Act & Assert
      await expect(service.findOne(expenseId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const updateExpenseDto = {
      amount: 30.00,
      note: 'Updated note',
    };

    it('should successfully update an expense', async () => {
      // Arrange
      const expenseId = 1;
      const userId = 1;
      const updatedExpense = { ...mockExpense, ...updateExpenseDto };
      
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback({
          expense: {
            update: jest.fn().mockResolvedValue(updatedExpense),
          },
        }),
      );

      // Act
      const result = await service.update(expenseId, userId, updateExpenseDto);

      // Assert
      expect(result).toEqual(updatedExpense);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete an expense', async () => {
      // Arrange
      const expenseId = 1;
      const userId = 1;
      
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback({
          expense: {
            delete: jest.fn().mockResolvedValue(undefined),
          },
        }),
      );

      // Act
      await service.remove(expenseId, userId);

      // Assert
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('getMonthlySummary', () => {
    it('should return monthly summary for current month', async () => {
      // Arrange
      const userId = 1;
      const mockExpenses = [
        { amount: 25.50, category: 'Food' },
        { amount: 30.00, category: 'Food' },
        { amount: 100.00, category: 'Transportation' },
      ];
      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      // Act
      const result = await service.getMonthlySummary(userId);

      // Assert
      expect(result.totalSpent).toBe(155.50);
      expect(result.categories).toEqual([
        { category: 'Food', total: 55.50 },
        { category: 'Transportation', total: 100.00 },
      ]);
      expect(result.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getRecentExpenses', () => {
    it('should return last 5 expenses', async () => {
      // Arrange
      const userId = 1;
      const mockExpenses = [mockExpense];
      mockPrismaService.expense.findMany.mockResolvedValue(mockExpenses);

      // Act
      const result = await service.getRecentExpenses(userId);

      // Assert
      expect(result).toEqual(mockExpenses);
      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { date: 'desc' },
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
    });
  });
});
