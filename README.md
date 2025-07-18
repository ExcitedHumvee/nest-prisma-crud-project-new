# Expense Tracker API

A comprehensive RESTful API for managing personal expenses with JWT authentication, built with NestJS, Prisma, and SQLite.

## 🚀 Features

### Core Functionality
- **User Management**: Secure registration and login with JWT authentication
- **Expense Tracking**: Full CRUD operations for expenses
- **Advanced Filtering**: Filter expenses by date range and category
- **Monthly Summaries**: Get spending totals by category and month
- **Recent Expenses**: Quick access to last 5 expenses

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Swagger Documentation**: Interactive API documentation
- **Input Validation**: Comprehensive validation using class-validator
- **Error Handling**: Consistent error responses across all endpoints
- **Database Transactions**: All mutations wrapped in Prisma transactions
- **TypeScript**: Full type safety throughout the application
- **Docker Support**: Easy deployment with Docker

## 📋 Requirements

- Node.js (v18 or higher)
- npm or yarn
- SQLite (included with the project)

## 🚀 Quick Start

### Option 1: Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run database migrations**:
```bash
npm run migrate
```

4. **Seed the database** (optional):
```bash
npm run seed
```

5. **Start the development server**:
```bash
npm run start:dev
```

### Option 2: Docker

1. **Build and run with Docker**:
```bash
docker-compose up --build
```

## 🔧 Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run db:reset` - Reset database and run seeds
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end API tests
- `npm run test:all` - Run both unit and e2e tests
- `npm run build` - Build for production

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

### Expenses (Protected Routes)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expenses` | Create new expense |
| GET | `/expenses` | Get all expenses (with filters) |
| GET | `/expenses/:id` | Get expense by ID |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| GET | `/expenses/summary/monthly` | Get monthly summary |
| GET | `/expenses/recent` | Get last 5 expenses |

### Query Parameters for `/expenses`
- `startDate` - Filter by start date (ISO string)
- `endDate` - Filter by end date (ISO string)
- `category` - Filter by category

### Query Parameters for `/expenses/summary/monthly`
- `year` - Year for summary (defaults to current year)
- `month` - Month for summary (defaults to current month)

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Sample Login Credentials (after seeding)
```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
```

## 📊 Example Requests

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create an expense
```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "amount": 25.50,
    "date": "2025-01-15T12:00:00Z",
    "category": "Food",
    "note": "Lunch at restaurant"
  }'
```

### Get monthly summary
```bash
curl -X GET "http://localhost:3000/expenses/summary/monthly?year=2025&month=1" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📚 Documentation

- **Swagger UI**: http://localhost:3000/api
- **OpenAPI Spec**: http://localhost:3000/api/docs

## 🧪 Testing

Run unit tests:
```bash
npm test
```

The test suite includes:
- Authentication service tests
- Expense service tests
- Input validation tests
- Error handling tests

## 🗄️ Database Schema

### User
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - Optional user name
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Expense
- `id` - Primary key
- `amount` - Expense amount (positive number)
- `date` - Date of the expense
- `category` - Expense category
- `note` - Optional note
- `userId` - Foreign key to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token validation
- Input sanitization and validation
- User authorization (users can only access their own expenses)
- Environment variable configuration

## 🚀 Deployment

### Docker Deployment
```bash
docker build -t expense-tracker .
docker run -p 3000:3000 expense-tracker
```

### Environment Variables
```env
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=production
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Authentication guards
│   ├── strategies/      # JWT strategy
│   └── ...
├── expenses/            # Expenses module
│   ├── dto/             # Data transfer objects
│   └── ...
├── prisma/              # Database service
├── common/              # Shared decorators and utilities
└── main.ts              # Application entry point

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── seed.ts             # Database seeding script
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/api`
- Review the test files for usage examples
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
