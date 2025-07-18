import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
    },
  });

  console.log('Created sample users');

  // Create sample expenses for John Doe
  const johnExpenses = [
    {
      amount: 45.50,
      date: new Date('2025-01-15T12:00:00Z'),
      category: 'Food',
      note: 'Lunch at restaurant',
      userId: user1.id,
    },
    {
      amount: 120.00,
      date: new Date('2025-01-14T09:00:00Z'),
      category: 'Transportation',
      note: 'Monthly bus pass',
      userId: user1.id,
    },
    {
      amount: 25.99,
      date: new Date('2025-01-13T19:30:00Z'),
      category: 'Entertainment',
      note: 'Movie tickets',
      userId: user1.id,
    },
    {
      amount: 75.00,
      date: new Date('2025-01-12T10:15:00Z'),
      category: 'Shopping',
      note: 'New shoes',
      userId: user1.id,
    },
    {
      amount: 12.50,
      date: new Date('2025-01-11T08:00:00Z'),
      category: 'Food',
      note: 'Coffee and pastry',
      userId: user1.id,
    },
    {
      amount: 200.00,
      date: new Date('2025-01-10T14:00:00Z'),
      category: 'Utilities',
      note: 'Electricity bill',
      userId: user1.id,
    },
    {
      amount: 35.75,
      date: new Date('2025-01-09T18:00:00Z'),
      category: 'Food',
      note: 'Groceries',
      userId: user1.id,
    },
    {
      amount: 50.00,
      date: new Date('2025-01-08T16:00:00Z'),
      category: 'Health',
      note: 'Pharmacy',
      userId: user1.id,
    },
    {
      amount: 15.00,
      date: new Date('2025-01-07T11:00:00Z'),
      category: 'Transportation',
      note: 'Taxi ride',
      userId: user1.id,
    },
    {
      amount: 80.00,
      date: new Date('2025-01-06T20:00:00Z'),
      category: 'Entertainment',
      note: 'Concert tickets',
      userId: user1.id,
    },
    // December 2024 expenses for monthly summary testing
    {
      amount: 300.00,
      date: new Date('2024-12-30T10:00:00Z'),
      category: 'Food',
      note: 'Holiday dinner',
      userId: user1.id,
    },
    {
      amount: 150.00,
      date: new Date('2024-12-25T15:00:00Z'),
      category: 'Shopping',
      note: 'Christmas gifts',
      userId: user1.id,
    },
    {
      amount: 100.00,
      date: new Date('2024-12-20T12:00:00Z'),
      category: 'Entertainment',
      note: 'Holiday party',
      userId: user1.id,
    },
  ];

  // Create sample expenses for Jane Smith
  const janeExpenses = [
    {
      amount: 55.25,
      date: new Date('2025-01-15T13:00:00Z'),
      category: 'Food',
      note: 'Lunch meeting',
      userId: user2.id,
    },
    {
      amount: 200.00,
      date: new Date('2025-01-14T10:00:00Z'),
      category: 'Health',
      note: 'Doctor visit',
      userId: user2.id,
    },
    {
      amount: 40.00,
      date: new Date('2025-01-13T16:00:00Z'),
      category: 'Transportation',
      note: 'Gas for car',
      userId: user2.id,
    },
    {
      amount: 95.50,
      date: new Date('2025-01-12T11:00:00Z'),
      category: 'Shopping',
      note: 'Clothing',
      userId: user2.id,
    },
    {
      amount: 30.00,
      date: new Date('2025-01-11T18:00:00Z'),
      category: 'Entertainment',
      note: 'Book purchase',
      userId: user2.id,
    },
  ];

  // Insert all expenses
  await prisma.expense.createMany({
    data: [...johnExpenses, ...janeExpenses],
  });

  console.log('Created sample expenses');

  // Display summary
  const totalUsers = await prisma.user.count();
  const totalExpenses = await prisma.expense.count();
  const totalAmount = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  console.log(`\nSeeding completed successfully!`);
  console.log(`Total users: ${totalUsers}`);
  console.log(`Total expenses: ${totalExpenses}`);
  console.log(`Total amount: $${totalAmount._sum.amount?.toFixed(2) || '0.00'}`);

  console.log(`\nSample login credentials:`);
  console.log(`Email: john@example.com`);
  console.log(`Password: password123`);
  console.log(`\nEmail: jane@example.com`);
  console.log(`Password: password123`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
