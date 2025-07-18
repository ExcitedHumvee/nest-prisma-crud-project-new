import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

// Mock service
const mockExpensesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ExpensesController', () => {
  let controller: ExpensesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        { provide: ExpensesService, useValue: mockExpensesService },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const user = { id: 1, name: 'Test', email: 'test@test.com', password: 'pass', createdAt: new Date(), updatedAt: new Date() };
  it('should call create', async () => {
    mockExpensesService.create.mockResolvedValue('expense');
    expect(await controller.create(user, { amount: 1, date: '2025-01-01', category: 'Food', note: 'test' })).toBe('expense');
  });

  it('should call findAll', async () => {
    mockExpensesService.findAll.mockResolvedValue(['expense']);
    expect(await controller.findAll(user, {})).toEqual(['expense']);
  });

  it('should call findOne', async () => {
    mockExpensesService.findOne.mockResolvedValue('expense');
    expect(await controller.findOne(user, 1)).toBe('expense');
  });

  it('should call update', async () => {
    mockExpensesService.update.mockResolvedValue('expense');
    expect(await controller.update(user, 1, { amount: 2 })).toBe('expense');
  });

  it('should call remove', async () => {
    mockExpensesService.remove.mockResolvedValue('deleted');
    expect(await controller.remove(user, 1)).toBe('deleted');
  });
});
