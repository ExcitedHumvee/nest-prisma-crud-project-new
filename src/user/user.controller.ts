/**
 * UserController
 *
 * Handles HTTP requests for the User entity.
 * Delegates business logic to UserService.
 * All endpoints are documented with Swagger decorators.
 *
 * Future features (e.g., authentication, authorization, more endpoints) can be added here.
 */
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
    /**
     * Injects UserService for business logic and DB operations.
     */
    constructor(private readonly userService: UserService) { }

    /**
     * Creates a new user.
     * @param body - DTO containing user data
     * @returns The created user
     */
    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'User created.', type: UserDto })
    create(@Body() body: CreateUserDto): Promise<UserDto> {
        return this.userService.create(body);
    }

    /**
     * Retrieves all users.
     * @returns Array of users
     */
    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of users.', type: [UserDto] })
    findAll(): Promise<UserDto[]> {
        return this.userService.findAll();
    }

    /**
     * Retrieves a user by ID.
     * @param id - User ID
     * @returns The user or null if not found
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User found.', type: UserDto })
    @ApiResponse({ status: 404, description: 'User not found.' })
    findOne(@Param('id') id: string): Promise<UserDto | null> {
        return this.userService.findOne(Number(id));
    }

    /**
     * Updates a user by ID.
     * @param id - User ID
     * @param body - DTO containing updated user data
     * @returns The updated user
     */
    @Put(':id')
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, description: 'User updated.', type: UserDto })
    update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<UserDto> {
        return this.userService.update(Number(id), body);
    }

    /**
     * Deletes a user by ID.
     * @param id - User ID
     * @returns The deleted user
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200, description: 'User deleted.', type: UserDto })
    remove(@Param('id') id: string): Promise<UserDto> {
        return this.userService.remove(Number(id));
    }
}
