import { UserService } from './user.service';
import { User } from '../../generated/prisma';

describe('UserService', () => {
    let service: UserService;
    let mockPrisma: any;

    const user: User = { id: 1, name: 'John', email: 'john@example.com', createdAt: new Date() };
    const userArray: User[] = [user];

    beforeEach(() => {
        mockPrisma = {
            user: {
                create: jest.fn().mockResolvedValue(user),
                findMany: jest.fn().mockResolvedValue(userArray),
                findUnique: jest.fn().mockResolvedValue(user),
                update: jest.fn().mockResolvedValue(user),
                delete: jest.fn().mockResolvedValue(user),
            },
            $transaction: jest.fn(async (cb) => cb(mockPrisma)),
        };
        service = new UserService();
        // @ts-ignore
        service['prisma'] = mockPrisma;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a user', async () => {
        expect(await service.create({ name: 'John', email: 'john@example.com' })).toEqual(user);
        expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: { name: 'John', email: 'john@example.com' } });
    });

    it('should return all users', async () => {
        expect(await service.findAll()).toEqual(userArray);
        expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it('should return one user', async () => {
        expect(await service.findOne(1)).toEqual(user);
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should update a user', async () => {
        expect(await service.update(1, { name: 'Johnny' })).toEqual(user);
        expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'Johnny' } });
    });

    it('should delete a user', async () => {
        expect(await service.remove(1)).toEqual(user);
        expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
});
