import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './user.dto';

const userArray: UserDto[] = [
    { id: 1, name: 'John', email: 'john@example.com', createdAt: new Date() },
    { id: 2, name: 'Jane', email: 'jane@example.com', createdAt: new Date() },
];

const user: UserDto = { id: 1, name: 'John', email: 'john@example.com', createdAt: new Date() };

const mockUserService = {
    create: jest.fn().mockResolvedValue(user),
    findAll: jest.fn().mockResolvedValue(userArray),
    findOne: jest.fn().mockResolvedValue(user),
    update: jest.fn().mockResolvedValue(user),
    remove: jest.fn().mockResolvedValue(user),
};

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: UserService, useValue: mockUserService },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a user', async () => {
        const dto: CreateUserDto = { name: 'John', email: 'john@example.com' };
        expect(await controller.create(dto)).toEqual(user);
        expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });

    it('should return all users', async () => {
        expect(await controller.findAll()).toEqual(userArray);
        expect(mockUserService.findAll).toHaveBeenCalled();
    });

    it('should return one user', async () => {
        expect(await controller.findOne('1')).toEqual(user);
        expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });

    it('should update a user', async () => {
        const dto: UpdateUserDto = { name: 'Johnny' };
        expect(await controller.update('1', dto)).toEqual(user);
        expect(mockUserService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should delete a user', async () => {
        expect(await controller.remove('1')).toEqual(user);
        expect(mockUserService.remove).toHaveBeenCalledWith(1);
    });
});
