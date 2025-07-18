
/**
 * DTOs for User entity
 * - Used for validation, serialization, and Swagger documentation
 * - Ensures separation of concerns and future extensibility
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for creating a user
 */
export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;
}

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;
}

/**
 * DTO for returning user data
 */
export class UserDto {
    @ApiProperty()
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    createdAt: Date;
}
