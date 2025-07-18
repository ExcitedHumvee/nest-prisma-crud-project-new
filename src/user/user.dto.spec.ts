import { CreateUserDto, UpdateUserDto, UserDto } from './user.dto';

describe('DTOs', () => {
    it('should create a valid CreateUserDto', () => {
        const dto = new CreateUserDto();
        dto.name = 'John';
        dto.email = 'john@example.com';
        expect(dto.name).toBe('John');
        expect(dto.email).toBe('john@example.com');
    });

    it('should create a valid UpdateUserDto', () => {
        const dto = new UpdateUserDto();
        dto.name = 'Johnny';
        expect(dto.name).toBe('Johnny');
        expect(dto.email).toBeUndefined();
    });

    it('should create a valid UserDto', () => {
        const dto = new UserDto();
        dto.id = 1;
        dto.name = 'John';
        dto.email = 'john@example.com';
        dto.createdAt = new Date('2023-01-01');
        expect(dto.id).toBe(1);
        expect(dto.name).toBe('John');
        expect(dto.email).toBe('john@example.com');
        expect(dto.createdAt).toEqual(new Date('2023-01-01'));
    });
});
