# NestJS Prisma SQLite CRUD Example

This project is a basic NestJS application using Prisma ORM and SQLite, providing CRUD APIs for a User entity.

## Features
- Swagger UI for API documentation
- Raw OpenAPI spec available
- Robust error handling for empty inputs, null/undefined values, and boundary conditions (0, negative numbers, max integer values)
- Input validation using class-validator for all DTOs
- Consistent and descriptive error responses for all API endpoints
- All database mutations (create, update, delete) are wrapped in Prisma DB transactions for atomicity and reliability

## Getting Started
1. Install dependencies: `npm install`
2. Run database migration: `npx prisma migrate dev --name init`

3. Start the server: `npm run start:dev`

## Running Unit Tests
- To run all unit tests, use:
  ```
  npm test
  ```
- Or use:
  ```
  npx jest
  ```

## API Documentation
- Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)
- Raw OpenAPI spec: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- `POST /users` - Create a user
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Project Structure
- `src/` - Application source code
- `prisma/` - Prisma schema and migrations


## Design Decisions
- **Database:** SQLite is used for simplicity and local development. It requires no external server and is ideal for prototyping and small-scale apps. Prisma ORM manages migrations and queries, with the schema defined in `prisma/schema.prisma` and the database file stored as `dev.db` in the project root.
- **Prisma ORM:** Prisma provides type-safe database access and easy migrations. The Prisma client is generated in `generated/prisma`.
- **NestJS Routing & Structure:**
  - The `src/` folder contains all application code.
  - Each resource (e.g., `user`) has its own folder (`src/user/`) containing its controller, service, DTOs, and tests.
  - The main entry point is `src/main.ts`, which bootstraps the app and sets up Swagger.
  - Routes are defined in controllers (e.g., `user.controller.ts`), grouped by resource/module for clarity and scalability.
  - The root module (`app.module.ts`) imports feature modules (e.g., `user.module.ts`).

- **Error Handling:** All API endpoints include comprehensive error handling for empty inputs, null/undefined values, and boundary conditions (such as 0, negative numbers, and max integer values). Errors are caught and returned with meaningful messages and appropriate HTTP status codes.
- **Validation:** DTOs use class-validator decorators to enforce input constraints (e.g., required fields, string length, valid email format, integer boundaries). Invalid requests are rejected with clear validation error responses.
- **Error Responses:** The API returns structured error responses for validation failures, not found errors, and server errors, following REST best practices for status codes and message clarity.
- **DB Transactions:** All create, update, and delete operations are executed within Prisma transactions to ensure data consistency and atomicity. This design prevents partial updates and supports future extensibility for multi-step operations.
