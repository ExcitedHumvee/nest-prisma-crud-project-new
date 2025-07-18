import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    mockAuthService.register.mockResolvedValue('user');
    expect(await controller.register({ email: 'test@test.com', password: 'pass123', name: 'Test' })).toBe('user');
  });

  it('should call login', async () => {
    mockAuthService.login.mockResolvedValue('token');
    expect(await controller.login({ email: 'test@test.com', password: 'pass123' })).toBe('token');
  });
});
