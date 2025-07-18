/**
 * UserService
 *
 * Handles all business logic and database operations for the User entity.
 * Uses Prisma ORM for type-safe queries and transactions.
 * All mutation operations are wrapped in transactions for data integrity.
 *
 * Future features (e.g., multi-step transactions, hooks, logging) can be added here.
 */
import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '../../generated/prisma';

@Injectable()
export class UserService {
    /**
     * Prisma client instance for DB operations.
     * In production, consider using dependency injection for better testability.
     */
    private prisma = new PrismaClient();

    /**
     * Creates a new user in the database.
     * Wrapped in a transaction for atomicity.
     * @param data - User creation payload
     */
    async create(data: { name: string; email: string }): Promise<User> {
        return this.prisma.$transaction(async (tx) => {
            return tx.user.create({ data });
        });
    }

    /**
     * Retrieves all users from the database.
     * @returns Array of User entities
     */
    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    /**
     * Retrieves a user by ID.
     * @param id - User ID
     * @returns User entity or null if not found
     */
    async findOne(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    /**
     * Updates a user by ID.
     * Wrapped in a transaction for atomicity.
     * @param id - User ID
     * @param data - Partial update payload
     */
    async update(id: number, data: { name?: string; email?: string }): Promise<User> {
        return this.prisma.$transaction(async (tx) => {
            return tx.user.update({ where: { id }, data });
        });
    }

    /**
     * Deletes a user by ID.
     * Wrapped in a transaction for atomicity.
     * @param id - User ID
     */
    async remove(id: number): Promise<User> {
        return this.prisma.$transaction(async (tx) => {
            return tx.user.delete({ where: { id } });
        });
    }
}
