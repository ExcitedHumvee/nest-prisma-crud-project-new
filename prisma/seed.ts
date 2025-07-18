import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive database seeding...');

  // Clear existing data
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users with different password complexities
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedPasswordStrong = await bcrypt.hash('StrongP@ssw0rd!', 10);
  const hashedPasswordSimple = await bcrypt.hash('simple123', 10);

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

  const user3 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password: hashedPasswordStrong,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Wilson',
      password: hashedPasswordSimple,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      password: hashedPassword,
    },
  });

  const user6 = await prisma.user.create({
    data: {
      email: 'diana@example.com',
      name: 'Diana Prince',
      password: hashedPasswordStrong,
    },
  });

  console.log('Created 6 sample users with varied profiles');

  // Create comprehensive expense data for testing
  const categories = [
    'Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 
    'Health', 'Education', 'Travel', 'Insurance', 'Home', 'Personal Care',
    'Technology', 'Sports', 'Books', 'Subscriptions', 'Gifts', 'Emergency',
    'Investment', 'Charity', 'Business'
  ];

  const expenseData = [];

  // Generate expenses for John Doe (Heavy spender, diverse categories)
  const johnExpenses = [
    // January 2025 - Current month
    { amount: 45.50, date: new Date('2025-01-18T12:00:00Z'), category: 'Food', note: 'Lunch at restaurant', userId: user1.id },
    { amount: 120.00, date: new Date('2025-01-17T09:00:00Z'), category: 'Transportation', note: 'Monthly bus pass', userId: user1.id },
    { amount: 25.99, date: new Date('2025-01-16T19:30:00Z'), category: 'Entertainment', note: 'Movie tickets', userId: user1.id },
    { amount: 75.00, date: new Date('2025-01-15T10:15:00Z'), category: 'Shopping', note: 'New shoes', userId: user1.id },
    { amount: 12.50, date: new Date('2025-01-14T08:00:00Z'), category: 'Food', note: 'Coffee and pastry', userId: user1.id },
    { amount: 200.00, date: new Date('2025-01-13T14:00:00Z'), category: 'Utilities', note: 'Electricity bill', userId: user1.id },
    { amount: 35.75, date: new Date('2025-01-12T18:00:00Z'), category: 'Food', note: 'Groceries', userId: user1.id },
    { amount: 50.00, date: new Date('2025-01-11T16:00:00Z'), category: 'Health', note: 'Pharmacy', userId: user1.id },
    { amount: 15.00, date: new Date('2025-01-10T11:00:00Z'), category: 'Transportation', note: 'Taxi ride', userId: user1.id },
    { amount: 80.00, date: new Date('2025-01-09T20:00:00Z'), category: 'Entertainment', note: 'Concert tickets', userId: user1.id },
    { amount: 299.99, date: new Date('2025-01-08T15:00:00Z'), category: 'Technology', note: 'Smart watch', userId: user1.id },
    { amount: 67.50, date: new Date('2025-01-07T13:00:00Z'), category: 'Personal Care', note: 'Haircut and styling', userId: user1.id },
    { amount: 89.99, date: new Date('2025-01-06T10:00:00Z'), category: 'Sports', note: 'Gym membership', userId: user1.id },
    { amount: 150.00, date: new Date('2025-01-05T14:00:00Z'), category: 'Home', note: 'Kitchen appliances', userId: user1.id },
    { amount: 29.99, date: new Date('2025-01-04T16:00:00Z'), category: 'Subscriptions', note: 'Streaming services', userId: user1.id },
    { amount: 42.75, date: new Date('2025-01-03T11:30:00Z'), category: 'Food', note: 'Dinner with friends', userId: user1.id },
    { amount: 18.50, date: new Date('2025-01-02T09:00:00Z'), category: 'Books', note: 'Programming books', userId: user1.id },
    { amount: 125.00, date: new Date('2025-01-01T20:00:00Z'), category: 'Entertainment', note: 'New Year party', userId: user1.id },
    
    // December 2024 - Previous month for monthly summary testing
    { amount: 300.00, date: new Date('2024-12-30T10:00:00Z'), category: 'Food', note: 'Holiday dinner', userId: user1.id },
    { amount: 150.00, date: new Date('2024-12-25T15:00:00Z'), category: 'Shopping', note: 'Christmas gifts', userId: user1.id },
    { amount: 100.00, date: new Date('2024-12-20T12:00:00Z'), category: 'Entertainment', note: 'Holiday party', userId: user1.id },
    { amount: 275.50, date: new Date('2024-12-18T14:00:00Z'), category: 'Travel', note: 'Flight tickets', userId: user1.id },
    { amount: 95.75, date: new Date('2024-12-15T16:00:00Z'), category: 'Gifts', note: 'Birthday present', userId: user1.id },
    { amount: 200.00, date: new Date('2024-12-12T11:00:00Z'), category: 'Insurance', note: 'Car insurance', userId: user1.id },
    { amount: 50.00, date: new Date('2024-12-10T13:00:00Z'), category: 'Charity', note: 'Donation', userId: user1.id },
    { amount: 180.00, date: new Date('2024-12-08T09:00:00Z'), category: 'Utilities', note: 'Internet and phone', userId: user1.id },
    { amount: 65.25, date: new Date('2024-12-05T17:00:00Z'), category: 'Health', note: 'Vitamins and supplements', userId: user1.id },
    { amount: 45.00, date: new Date('2024-12-03T12:00:00Z'), category: 'Transportation', note: 'Parking fees', userId: user1.id },
    { amount: 220.00, date: new Date('2024-12-01T10:00:00Z'), category: 'Education', note: 'Online course', userId: user1.id },
    
    // November 2024 - Historical data
    { amount: 400.00, date: new Date('2024-11-28T14:00:00Z'), category: 'Emergency', note: 'Car repair', userId: user1.id },
    { amount: 125.50, date: new Date('2024-11-25T11:00:00Z'), category: 'Food', note: 'Thanksgiving dinner', userId: user1.id },
    { amount: 89.99, date: new Date('2024-11-22T16:00:00Z'), category: 'Technology', note: 'Wireless headphones', userId: user1.id },
    { amount: 55.00, date: new Date('2024-11-20T13:00:00Z'), category: 'Personal Care', note: 'Spa treatment', userId: user1.id },
    { amount: 175.00, date: new Date('2024-11-18T15:00:00Z'), category: 'Shopping', note: 'Winter clothes', userId: user1.id },
    { amount: 35.75, date: new Date('2024-11-15T10:00:00Z'), category: 'Entertainment', note: 'Board game night', userId: user1.id },
    { amount: 90.00, date: new Date('2024-11-12T12:00:00Z'), category: 'Sports', note: 'Tennis lessons', userId: user1.id },
    { amount: 260.00, date: new Date('2024-11-10T09:00:00Z'), category: 'Home', note: 'Furniture', userId: user1.id },
    { amount: 48.50, date: new Date('2024-11-08T18:00:00Z'), category: 'Food', note: 'Pizza night', userId: user1.id },
    { amount: 120.00, date: new Date('2024-11-05T14:00:00Z'), category: 'Health', note: 'Dental checkup', userId: user1.id },
  ];

  // Generate expenses for Jane Smith (Moderate spender, budget-conscious)
  const janeExpenses = [
    // January 2025
    { amount: 55.25, date: new Date('2025-01-18T13:00:00Z'), category: 'Food', note: 'Lunch meeting', userId: user2.id },
    { amount: 200.00, date: new Date('2025-01-17T10:00:00Z'), category: 'Health', note: 'Doctor visit', userId: user2.id },
    { amount: 40.00, date: new Date('2025-01-16T16:00:00Z'), category: 'Transportation', note: 'Gas for car', userId: user2.id },
    { amount: 95.50, date: new Date('2025-01-15T11:00:00Z'), category: 'Shopping', note: 'Clothing', userId: user2.id },
    { amount: 30.00, date: new Date('2025-01-14T18:00:00Z'), category: 'Entertainment', note: 'Book purchase', userId: user2.id },
    { amount: 125.00, date: new Date('2025-01-13T15:00:00Z'), category: 'Utilities', note: 'Water bill', userId: user2.id },
    { amount: 22.50, date: new Date('2025-01-12T12:00:00Z'), category: 'Food', note: 'Brunch', userId: user2.id },
    { amount: 65.00, date: new Date('2025-01-11T09:00:00Z'), category: 'Personal Care', note: 'Skincare products', userId: user2.id },
    { amount: 45.75, date: new Date('2025-01-10T17:00:00Z'), category: 'Transportation', note: 'Public transport', userId: user2.id },
    { amount: 85.00, date: new Date('2025-01-09T14:00:00Z'), category: 'Education', note: 'Online workshop', userId: user2.id },
    { amount: 38.99, date: new Date('2025-01-08T16:00:00Z'), category: 'Books', note: 'Self-help books', userId: user2.id },
    { amount: 75.00, date: new Date('2025-01-07T11:00:00Z'), category: 'Home', note: 'Cleaning supplies', userId: user2.id },
    { amount: 15.99, date: new Date('2025-01-06T13:00:00Z'), category: 'Subscriptions', note: 'Music streaming', userId: user2.id },
    { amount: 52.25, date: new Date('2025-01-05T10:00:00Z'), category: 'Food', note: 'Grocery shopping', userId: user2.id },
    { amount: 28.50, date: new Date('2025-01-04T15:00:00Z'), category: 'Entertainment', note: 'Coffee shop', userId: user2.id },
    
    // December 2024
    { amount: 180.00, date: new Date('2024-12-30T12:00:00Z'), category: 'Food', note: 'Holiday catering', userId: user2.id },
    { amount: 120.00, date: new Date('2024-12-28T14:00:00Z'), category: 'Gifts', note: 'Christmas presents', userId: user2.id },
    { amount: 89.99, date: new Date('2024-12-25T16:00:00Z'), category: 'Entertainment', note: 'Movie marathon', userId: user2.id },
    { amount: 150.00, date: new Date('2024-12-22T11:00:00Z'), category: 'Travel', note: 'Train tickets', userId: user2.id },
    { amount: 95.50, date: new Date('2024-12-20T13:00:00Z'), category: 'Shopping', note: 'Winter gear', userId: user2.id },
    { amount: 200.00, date: new Date('2024-12-18T10:00:00Z'), category: 'Insurance', note: 'Health insurance', userId: user2.id },
    { amount: 42.75, date: new Date('2024-12-15T17:00:00Z'), category: 'Personal Care', note: 'Makeup', userId: user2.id },
    { amount: 65.00, date: new Date('2024-12-12T09:00:00Z'), category: 'Utilities', note: 'Gas bill', userId: user2.id },
    { amount: 35.00, date: new Date('2024-12-10T14:00:00Z'), category: 'Transportation', note: 'Uber rides', userId: user2.id },
    { amount: 78.50, date: new Date('2024-12-08T12:00:00Z'), category: 'Health', note: 'Pharmacy', userId: user2.id },
  ];

  // Generate expenses for Alice Johnson (Tech-savvy, high earner)
  const aliceExpenses = [
    // January 2025
    { amount: 1299.99, date: new Date('2025-01-18T14:00:00Z'), category: 'Technology', note: 'New laptop', userId: user3.id },
    { amount: 89.99, date: new Date('2025-01-17T11:00:00Z'), category: 'Food', note: 'Sushi dinner', userId: user3.id },
    { amount: 250.00, date: new Date('2025-01-16T15:00:00Z'), category: 'Education', note: 'Programming course', userId: user3.id },
    { amount: 199.99, date: new Date('2025-01-15T12:00:00Z'), category: 'Technology', note: 'Mechanical keyboard', userId: user3.id },
    { amount: 45.00, date: new Date('2025-01-14T16:00:00Z'), category: 'Subscriptions', note: 'Cloud storage', userId: user3.id },
    { amount: 325.00, date: new Date('2025-01-13T13:00:00Z'), category: 'Business', note: 'Co-working space', userId: user3.id },
    { amount: 75.50, date: new Date('2025-01-12T10:00:00Z'), category: 'Food', note: 'Organic groceries', userId: user3.id },
    { amount: 150.00, date: new Date('2025-01-11T17:00:00Z'), category: 'Home', note: 'Smart home devices', userId: user3.id },
    { amount: 120.00, date: new Date('2025-01-10T14:00:00Z'), category: 'Transportation', note: 'Premium gas', userId: user3.id },
    { amount: 299.99, date: new Date('2025-01-09T09:00:00Z'), category: 'Technology', note: 'Wireless earbuds', userId: user3.id },
    { amount: 65.00, date: new Date('2025-01-08T18:00:00Z'), category: 'Entertainment', note: 'VR games', userId: user3.id },
    { amount: 180.00, date: new Date('2025-01-07T15:00:00Z'), category: 'Health', note: 'Fitness tracker', userId: user3.id },
    { amount: 55.75, date: new Date('2025-01-06T12:00:00Z'), category: 'Personal Care', note: 'Premium skincare', userId: user3.id },
    { amount: 400.00, date: new Date('2025-01-05T11:00:00Z'), category: 'Investment', note: 'Stock purchase', userId: user3.id },
    { amount: 89.99, date: new Date('2025-01-04T16:00:00Z'), category: 'Books', note: 'Tech books', userId: user3.id },
    
    // December 2024
    { amount: 500.00, date: new Date('2024-12-30T13:00:00Z'), category: 'Travel', note: 'Hotel booking', userId: user3.id },
    { amount: 350.00, date: new Date('2024-12-28T15:00:00Z'), category: 'Gifts', note: 'Tech gifts', userId: user3.id },
    { amount: 220.00, date: new Date('2024-12-25T12:00:00Z'), category: 'Entertainment', note: 'Gaming console', userId: user3.id },
    { amount: 1200.00, date: new Date('2024-12-22T10:00:00Z'), category: 'Technology', note: 'Monitor upgrade', userId: user3.id },
    { amount: 95.00, date: new Date('2024-12-20T14:00:00Z'), category: 'Food', note: 'Fine dining', userId: user3.id },
    { amount: 180.00, date: new Date('2024-12-18T16:00:00Z'), category: 'Business', note: 'Office supplies', userId: user3.id },
    { amount: 75.50, date: new Date('2024-12-15T11:00:00Z'), category: 'Subscriptions', note: 'Software licenses', userId: user3.id },
    { amount: 250.00, date: new Date('2024-12-12T13:00:00Z'), category: 'Education', note: 'Conference ticket', userId: user3.id },
    { amount: 125.00, date: new Date('2024-12-10T17:00:00Z'), category: 'Health', note: 'Wellness check', userId: user3.id },
    { amount: 89.99, date: new Date('2024-12-08T09:00:00Z'), category: 'Home', note: 'Smart lighting', userId: user3.id },
  ];

  // Generate expenses for Bob Wilson (Budget-conscious, family man)
  const bobExpenses = [
    // January 2025
    { amount: 150.00, date: new Date('2025-01-18T10:00:00Z'), category: 'Food', note: 'Family groceries', userId: user4.id },
    { amount: 80.00, date: new Date('2025-01-17T15:00:00Z'), category: 'Transportation', note: 'Gas for week', userId: user4.id },
    { amount: 25.00, date: new Date('2025-01-16T12:00:00Z'), category: 'Entertainment', note: 'Kids movie', userId: user4.id },
    { amount: 45.50, date: new Date('2025-01-15T14:00:00Z'), category: 'Shopping', note: 'School supplies', userId: user4.id },
    { amount: 200.00, date: new Date('2025-01-14T11:00:00Z'), category: 'Utilities', note: 'Electric bill', userId: user4.id },
    { amount: 30.00, date: new Date('2025-01-13T16:00:00Z'), category: 'Health', note: 'Kids medicine', userId: user4.id },
    { amount: 65.00, date: new Date('2025-01-12T13:00:00Z'), category: 'Home', note: 'Household items', userId: user4.id },
    { amount: 18.99, date: new Date('2025-01-11T09:00:00Z'), category: 'Food', note: 'Fast food dinner', userId: user4.id },
    { amount: 120.00, date: new Date('2025-01-10T17:00:00Z'), category: 'Insurance', note: 'Family insurance', userId: user4.id },
    { amount: 35.00, date: new Date('2025-01-09T10:00:00Z'), category: 'Transportation', note: 'Public transport', userId: user4.id },
    { amount: 55.75, date: new Date('2025-01-08T18:00:00Z'), category: 'Food', note: 'Pizza night', userId: user4.id },
    { amount: 40.00, date: new Date('2025-01-07T14:00:00Z'), category: 'Personal Care', note: 'Barbershop', userId: user4.id },
    { amount: 22.50, date: new Date('2025-01-06T11:00:00Z'), category: 'Entertainment', note: 'Park admission', userId: user4.id },
    { amount: 95.00, date: new Date('2025-01-05T15:00:00Z'), category: 'Shopping', note: 'Kids clothes', userId: user4.id },
    { amount: 28.75, date: new Date('2025-01-04T12:00:00Z'), category: 'Food', note: 'Lunch out', userId: user4.id },
    
    // December 2024
    { amount: 250.00, date: new Date('2024-12-30T14:00:00Z'), category: 'Food', note: 'Holiday feast', userId: user4.id },
    { amount: 180.00, date: new Date('2024-12-28T11:00:00Z'), category: 'Gifts', note: 'Christmas toys', userId: user4.id },
    { amount: 75.00, date: new Date('2024-12-25T16:00:00Z'), category: 'Entertainment', note: 'Family activities', userId: user4.id },
    { amount: 200.00, date: new Date('2024-12-22T13:00:00Z'), category: 'Travel', note: 'Visit relatives', userId: user4.id },
    { amount: 125.50, date: new Date('2024-12-20T10:00:00Z'), category: 'Shopping', note: 'Winter clothes', userId: user4.id },
    { amount: 85.00, date: new Date('2024-12-18T17:00:00Z'), category: 'Utilities', note: 'Heating bill', userId: user4.id },
    { amount: 45.75, date: new Date('2024-12-15T14:00:00Z'), category: 'Health', note: 'Family checkup', userId: user4.id },
    { amount: 65.00, date: new Date('2024-12-12T12:00:00Z'), category: 'Home', note: 'Home repairs', userId: user4.id },
    { amount: 38.50, date: new Date('2024-12-10T15:00:00Z'), category: 'Transportation', note: 'Car maintenance', userId: user4.id },
    { amount: 55.00, date: new Date('2024-12-08T09:00:00Z'), category: 'Food', note: 'Grocery run', userId: user4.id },
  ];

  // Generate expenses for Charlie Brown (Student, minimal spending)
  const charlieExpenses = [
    // January 2025
    { amount: 25.00, date: new Date('2025-01-18T12:00:00Z'), category: 'Food', note: 'Campus meal', userId: user5.id },
    { amount: 15.50, date: new Date('2025-01-17T14:00:00Z'), category: 'Transportation', note: 'Bus fare', userId: user5.id },
    { amount: 12.99, date: new Date('2025-01-16T16:00:00Z'), category: 'Entertainment', note: 'Movie rental', userId: user5.id },
    { amount: 45.00, date: new Date('2025-01-15T10:00:00Z'), category: 'Books', note: 'Textbooks', userId: user5.id },
    { amount: 8.75, date: new Date('2025-01-14T13:00:00Z'), category: 'Food', note: 'Coffee', userId: user5.id },
    { amount: 35.00, date: new Date('2025-01-13T15:00:00Z'), category: 'Personal Care', note: 'Laundry', userId: user5.id },
    { amount: 18.50, date: new Date('2025-01-12T11:00:00Z'), category: 'Food', note: 'Lunch', userId: user5.id },
    { amount: 20.00, date: new Date('2025-01-11T17:00:00Z'), category: 'Entertainment', note: 'Gaming', userId: user5.id },
    { amount: 50.00, date: new Date('2025-01-10T09:00:00Z'), category: 'Education', note: 'Study materials', userId: user5.id },
    { amount: 14.25, date: new Date('2025-01-09T14:00:00Z'), category: 'Transportation', note: 'Bike repair', userId: user5.id },
    { amount: 32.50, date: new Date('2025-01-08T12:00:00Z'), category: 'Food', note: 'Groceries', userId: user5.id },
    { amount: 9.99, date: new Date('2025-01-07T16:00:00Z'), category: 'Subscriptions', note: 'Student app', userId: user5.id },
    { amount: 22.00, date: new Date('2025-01-06T10:00:00Z'), category: 'Health', note: 'Vitamins', userId: user5.id },
    { amount: 28.75, date: new Date('2025-01-05T18:00:00Z'), category: 'Shopping', note: 'Stationery', userId: user5.id },
    { amount: 15.00, date: new Date('2025-01-04T13:00:00Z'), category: 'Food', note: 'Snacks', userId: user5.id },
    
    // December 2024
    { amount: 80.00, date: new Date('2024-12-30T15:00:00Z'), category: 'Travel', note: 'Bus home', userId: user5.id },
    { amount: 45.50, date: new Date('2024-12-28T12:00:00Z'), category: 'Gifts', note: 'Small gifts', userId: user5.id },
    { amount: 25.00, date: new Date('2024-12-25T14:00:00Z'), category: 'Entertainment', note: 'Holiday movie', userId: user5.id },
    { amount: 60.00, date: new Date('2024-12-22T11:00:00Z'), category: 'Food', note: 'Holiday meal', userId: user5.id },
    { amount: 35.75, date: new Date('2024-12-20T16:00:00Z'), category: 'Books', note: 'Study guides', userId: user5.id },
    { amount: 18.50, date: new Date('2024-12-18T10:00:00Z'), category: 'Personal Care', note: 'Haircut', userId: user5.id },
    { amount: 40.00, date: new Date('2024-12-15T13:00:00Z'), category: 'Transportation', note: 'Monthly pass', userId: user5.id },
    { amount: 22.25, date: new Date('2024-12-12T17:00:00Z'), category: 'Food', note: 'Delivery', userId: user5.id },
    { amount: 55.00, date: new Date('2024-12-10T09:00:00Z'), category: 'Education', note: 'Online course', userId: user5.id },
    { amount: 12.99, date: new Date('2024-12-08T14:00:00Z'), category: 'Entertainment', note: 'Streaming', userId: user5.id },
  ];

  // Generate expenses for Diana Prince (Professional, balanced spender)
  const dianaExpenses = [
    // January 2025
    { amount: 125.00, date: new Date('2025-01-18T11:00:00Z'), category: 'Food', note: 'Business lunch', userId: user6.id },
    { amount: 89.99, date: new Date('2025-01-17T13:00:00Z'), category: 'Shopping', note: 'Professional attire', userId: user6.id },
    { amount: 45.50, date: new Date('2025-01-16T15:00:00Z'), category: 'Transportation', note: 'Commute', userId: user6.id },
    { amount: 200.00, date: new Date('2025-01-15T09:00:00Z'), category: 'Health', note: 'Gym membership', userId: user6.id },
    { amount: 75.25, date: new Date('2025-01-14T17:00:00Z'), category: 'Personal Care', note: 'Salon visit', userId: user6.id },
    { amount: 180.00, date: new Date('2025-01-13T12:00:00Z'), category: 'Utilities', note: 'Monthly bills', userId: user6.id },
    { amount: 55.00, date: new Date('2025-01-12T14:00:00Z'), category: 'Food', note: 'Organic food', userId: user6.id },
    { amount: 95.99, date: new Date('2025-01-11T10:00:00Z'), category: 'Technology', note: 'Phone accessories', userId: user6.id },
    { amount: 65.75, date: new Date('2025-01-10T16:00:00Z'), category: 'Entertainment', note: 'Theater tickets', userId: user6.id },
    { amount: 120.00, date: new Date('2025-01-09T11:00:00Z'), category: 'Education', note: 'Professional development', userId: user6.id },
    { amount: 38.50, date: new Date('2025-01-08T13:00:00Z'), category: 'Books', note: 'Business books', userId: user6.id },
    { amount: 220.00, date: new Date('2025-01-07T18:00:00Z'), category: 'Home', note: 'Apartment decor', userId: user6.id },
    { amount: 25.99, date: new Date('2025-01-06T15:00:00Z'), category: 'Subscriptions', note: 'Professional apps', userId: user6.id },
    { amount: 85.00, date: new Date('2025-01-05T09:00:00Z'), category: 'Sports', note: 'Yoga classes', userId: user6.id },
    { amount: 42.75, date: new Date('2025-01-04T17:00:00Z'), category: 'Food', note: 'Healthy meal prep', userId: user6.id },
    
    // December 2024
    { amount: 300.00, date: new Date('2024-12-30T16:00:00Z'), category: 'Travel', note: 'Weekend getaway', userId: user6.id },
    { amount: 250.00, date: new Date('2024-12-28T13:00:00Z'), category: 'Gifts', note: 'Professional gifts', userId: user6.id },
    { amount: 150.00, date: new Date('2024-12-25T11:00:00Z'), category: 'Entertainment', note: 'Holiday events', userId: user6.id },
    { amount: 189.99, date: new Date('2024-12-22T14:00:00Z'), category: 'Shopping', note: 'Winter wardrobe', userId: user6.id },
    { amount: 95.50, date: new Date('2024-12-20T10:00:00Z'), category: 'Health', note: 'Wellness package', userId: user6.id },
    { amount: 125.00, date: new Date('2024-12-18T15:00:00Z'), category: 'Business', note: 'Networking event', userId: user6.id },
    { amount: 65.75, date: new Date('2024-12-15T12:00:00Z'), category: 'Personal Care', note: 'Spa day', userId: user6.id },
    { amount: 180.00, date: new Date('2024-12-12T17:00:00Z'), category: 'Home', note: 'Holiday decorations', userId: user6.id },
    { amount: 45.50, date: new Date('2024-12-10T11:00:00Z'), category: 'Transportation', note: 'Premium transport', userId: user6.id },
    { amount: 220.00, date: new Date('2024-12-08T16:00:00Z'), category: 'Investment', note: 'Retirement fund', userId: user6.id },
  ];

  // Combine all expenses
  const allExpenses = [...johnExpenses, ...janeExpenses, ...aliceExpenses, ...bobExpenses, ...charlieExpenses, ...dianaExpenses];

  console.log(`Preparing to create ${allExpenses.length} diverse expense records...`);

  // Insert all expenses in batches for better performance
  const batchSize = 50;
  for (let i = 0; i < allExpenses.length; i += batchSize) {
    const batch = allExpenses.slice(i, i + batchSize);
    await prisma.expense.createMany({
      data: batch,
    });
    console.log(`Created batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allExpenses.length / batchSize)}`);
  }

  console.log('Successfully created all expense records');

  // Display comprehensive summary
  const totalUsers = await prisma.user.count();
  const totalExpenses = await prisma.expense.count();
  const totalAmount = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  // Get expense breakdown by category
  const categoryBreakdown = await prisma.expense.groupBy({
    by: ['category'],
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  // Get user spending summary
  const userSpendingSummary = await prisma.expense.groupBy({
    by: ['userId'],
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  console.log('\n' + '='.repeat(60));
  console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  
  console.log(`Total users created: ${totalUsers}`);
  console.log(`Total expenses created: ${totalExpenses}`);
  console.log(`Total amount seeded: $${totalAmount._sum.amount?.toFixed(2) || '0.00'}`);
  console.log(`Average expense: $${totalAmount._sum.amount ? (totalAmount._sum.amount / totalExpenses).toFixed(2) : '0.00'}`);

  console.log('\n--- EXPENSE BREAKDOWN BY CATEGORY ---');
  categoryBreakdown
    .sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0))
    .forEach(category => {
      console.log(`${category.category}: ${category._count.id} expenses, $${category._sum.amount?.toFixed(2) || '0.00'}`);
    });

  console.log('\n--- USER SPENDING SUMMARY ---');
  const users = await prisma.user.findMany();
  for (const userSummary of userSpendingSummary) {
    const user = users.find(u => u.id === userSummary.userId);
    console.log(`${user?.name || 'Unknown'}: ${userSummary._count.id} expenses, $${userSummary._sum.amount?.toFixed(2) || '0.00'}`);
  }

  console.log('\n--- SAMPLE LOGIN CREDENTIALS ---');
  console.log('Email: john@example.com | Password: password123');
  console.log('Email: jane@example.com | Password: password123');
  console.log('Email: alice@example.com | Password: StrongP@ssw0rd!');
  console.log('Email: bob@example.com | Password: simple123');
  console.log('Email: charlie@example.com | Password: password123');
  console.log('Email: diana@example.com | Password: StrongP@ssw0rd!');
  
  console.log('\n--- DATABASE FEATURES ---');
  console.log('- 6 diverse user profiles with different spending patterns');
  console.log('- 20+ expense categories covering all aspects of life');
  console.log('- Historical data spanning multiple months');
  console.log('- Realistic expense amounts and patterns');
  console.log('- Perfect for testing filtering, summaries, and analytics');
  console.log('- Comprehensive security and authorization testing data');
  
  console.log('\n='.repeat(60));
  console.log('READY FOR COMPREHENSIVE API TESTING!');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
