// e2e-test.js

const fetch = require('node-fetch');
const assert = require('assert');

// --- Configuration ---
// Replace with the base URL of your running API
const API_BASE_URL = 'http://localhost:3000';
// --- End of Configuration ---

// Global variables to store state between tests (like auth token and created expense IDs)
let authToken = '';
let createdExpenseId;

// Test data
const testUser = {
  email: `user_${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User',
};

const expenseData = {
  amount: 50.75,
  date: new Date().toISOString(),
  category: 'Groceries',
  note: 'Weekly grocery shopping',
};

const updatedExpenseData = {
  amount: 60.0,
  category: 'Food',
  note: 'Dinner with friends',
};

/**
 * A helper function to log test results in a structured way.
 * @param {string} testName - The name of the test being run.
 * @param {Function} testFunction - The async function that performs the test.
 */
const runTest = async (testName, testFunction) => {
  try {
    console.log(`\n>  Running: ${testName}`);
    await testFunction();
    console.log(`PASSED: ${testName}`);
  } catch (error) {
    console.error(`FAILED: ${testName}`);
    // Log detailed error information
    console.error('   Error:', error.message);
    if (error.body) {
        console.error('   Response Body:', error.body);
    }
    process.exit(1); // Exit with a failure code if any test fails
  }
};

/**
 * A helper to handle API responses and potential errors.
 * @param {object} response - The response object from node-fetch.
 * @param {number} expectedStatus - The HTTP status code we expect.
 * @returns {Promise<object|string>} - The JSON body or text body of the response.
 */
const handleResponse = async (response, expectedStatus) => {
    let body;
    try {
        // Handle 204 No Content, which has no body
        if (response.status === 204) {
            body = null;
        } else {
            body = await response.json();
        }
    } catch (e) {
        // If JSON parsing fails, get the raw text body for better error logging
        body = await response.text();
    }

    if (response.status !== expectedStatus) {
        const error = new Error(`Expected status ${expectedStatus} but got ${response.status}`);
        error.body = body;
        throw error;
    }
    return body;
}


/**
 * Main function to run all E2E tests in sequence.
 */
const runAllTests = async () => {
  console.log('--- Starting Expense Tracker API E2E Tests ---');

  // --- Authentication Flow ---

  await runTest('POST /auth/register - Should register a new user successfully', async () => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const body = await handleResponse(response, 201);

    assert.ok(body.access_token, 'Response body should contain an access_token');
    assert.strictEqual(body.user.email, testUser.email, 'Registered user email should match');

    // Save the token for subsequent protected requests
    authToken = body.access_token;
  });

  await runTest('POST /auth/register - Should fail if user already exists (409 Conflict)', async () => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });
    await handleResponse(response, 409);
  });

  await runTest('POST /auth/login - Should log in an existing user', async () => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const body = await handleResponse(response, 200);

    assert.ok(body.access_token, 'Login response should contain an access_token');
    authToken = body.access_token; // Re-assign token in case it expired or changed
  });

  await runTest('POST /auth/login - Should fail with invalid credentials (401 Unauthorized)', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' }),
      });
      await handleResponse(response, 401);
  });


  // --- Expenses Flow (Protected Routes) ---

  await runTest('POST /expenses - Should create a new expense', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(expenseData),
    });
    const body = await handleResponse(response, 201);

    assert.ok(body.id, 'Created expense should have an ID');
    assert.strictEqual(body.amount, expenseData.amount, 'Expense amount should match');

    // Save the ID for later tests
    createdExpenseId = body.id;
  });

  await runTest('GET /expenses - Should retrieve all expenses', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const body = await handleResponse(response, 200);

    assert.ok(Array.isArray(body), 'Response should be an array of expenses');
    assert.ok(body.length > 0, 'Expenses array should not be empty');
  });

  await runTest('GET /expenses/:id - Should retrieve a specific expense by ID', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/${createdExpenseId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const body = await handleResponse(response, 200);

    assert.strictEqual(body.id, createdExpenseId, 'The retrieved expense ID should match');
  });

  await runTest('PATCH /expenses/:id - Should update an existing expense', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/${createdExpenseId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedExpenseData),
    });
    const body = await handleResponse(response, 200);

    assert.strictEqual(body.amount, updatedExpenseData.amount, 'Updated amount should match');
    assert.strictEqual(body.category, updatedExpenseData.category, 'Updated category should match');
  });

  await runTest('GET /expenses/recent - Should retrieve the last 5 expenses', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/recent`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const body = await handleResponse(response, 200);

    assert.ok(Array.isArray(body), 'Response should be an array');
    assert.ok(body.length <= 5, 'Should return 5 or fewer expenses');
  });

  await runTest('GET /expenses/summary/monthly - Should retrieve a monthly summary', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/summary/monthly`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const body = await handleResponse(response, 200);

    assert.ok(body.totalSpent >= 0, 'Monthly summary must have a totalSpent value');
    assert.ok(Array.isArray(body.categories), 'Monthly summary must have a categories array');
  });

  await runTest('DELETE /expenses/:id - Should delete an expense', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/${createdExpenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    await handleResponse(response, 204);
  });

  await runTest('GET /expenses/:id - Should fail to retrieve a deleted expense (404 Not Found)', async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/${createdExpenseId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
    });
    await handleResponse(response, 404);
  });


  console.log('\n-----------------------------------------------');
  console.log('All E2E tests passed successfully!');
  console.log('-----------------------------------------------');
};

// Execute all tests
runAllTests().catch(err => {
  console.error('\n--- A critical error occurred during the test run ---');
  console.error(err);
  process.exit(1);
});