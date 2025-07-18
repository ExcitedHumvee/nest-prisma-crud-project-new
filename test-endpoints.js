// e2e-test.js

const assert = require('assert');

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000'; // Replace with your API's base URL
// --- End of Configuration ---


// --- Global State ---
// We will store tokens and IDs for two different users
let userOne = {
  email: `userOne_${Date.now()}@example.com`,
  password: 'password123',
  name: 'User One',
  authToken: '',
  expenseId: null,
};

let userTwo = {
  email: `userTwo_${Date.now()}@example.com`,
  password: 'password456',
  name: 'User Two',
  authToken: '',
};

// --- Test Runner & Helpers ---

// Test statistics tracking
let testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  startTime: null,
  endTime: null,
  categories: {
    authentication: { passed: 0, failed: 0 },
    expenses: { passed: 0, failed: 0 },
    security: { passed: 0, failed: 0 },
    validation: { passed: 0, failed: 0 }
  }
};

/**
 * A robust test runner that provides detailed logging on failure.
 * @param {string} testName - The name of the test.
 * @param {Function} testFunction - The async function that performs the test logic.
 * @param {string} category - Optional category for grouping tests
 */
const runTest = async (testName, testFunction, category = 'general') => {
  console.log(`\n▶️  Running: ${testName}`);
  testStats.total++;
  
  try {
    await testFunction();
    console.log(`✅  PASSED: ${testName}`);
    testStats.passed++;
    
    // Update category stats
    if (testStats.categories[category]) {
      testStats.categories[category].passed++;
    }
  } catch (error) {
    console.error(`❌  FAILED: ${testName}`);
    console.error('   Error Message:', error.message);
    
    if (error.request) {
      console.error('   Request:', {
        method: error.request.method,
        url: error.request.url,
        body: error.request.body ? JSON.parse(error.request.body) : 'No Body',
      });
    }
    if (error.response) {
      console.error('   Response:', {
        status: error.response.status,
        body: error.response.body,
      });
    }
    
    testStats.failed++;
    if (testStats.categories[category]) {
      testStats.categories[category].failed++;
    }
    
    process.exit(1); // Exit with a failure code
  }
};

/**
 * A centralized fetch handler to attach detailed error context.
 * @param {Function} fetch - The fetch function from node-fetch.
 * @returns {Function} A configured request function.
 */
const createRequestHandler = (fetch) => async (requestDetails) => {
  const { url, method, body, token, expectedStatus } = requestDetails;
  
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, options);
  let responseBody;
  const contentType = response.headers.get("content-type");

  try {
    if (response.status === 204) {
      responseBody = null;
    } else if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
    } else {
        responseBody = await response.text();
    }
  } catch(e) {
    responseBody = "[Could not parse response body]";
  }

  if (response.status !== expectedStatus) {
    const error = new Error(`Expected status ${expectedStatus} but got ${response.status}`);
    error.request = { method, url, body: options.body };
    error.response = { status: response.status, body: responseBody };
    throw error;
  }

  return responseBody;
};


/**
 * Main function to run all tests.
 */
const main = async () => {
    // Dynamically import node-fetch and create our request handler
    const fetch = (await import('node-fetch')).default;
    const makeRequest = createRequestHandler(fetch);

    // Initialize test timing
    testStats.startTime = new Date();
    
    console.log('='.repeat(80));
    console.log('🚀 STARTING COMPREHENSIVE EXPENSE TRACKER API E2E TESTS');
    console.log('='.repeat(80));
    console.log(`📅 Test started at: ${testStats.startTime.toISOString()}`);
    console.log(`🌐 Testing API at: ${API_BASE_URL}`);
    console.log('='.repeat(80));

    // =================================================================
    // === 1. AUTHENTICATION (/auth)
    // =================================================================
    console.log('\n--- Testing Endpoint: /auth/register ---');
    await runTest('Happy Path: Should register User One successfully', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: userOne.email, password: userOne.password, name: userOne.name }, expectedStatus: 201 });
        assert.ok(body.access_token, 'Response should contain an access_token');
        userOne.authToken = body.access_token;
    }, 'authentication');
    await runTest('Happy Path: Should register User Two successfully', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: userTwo.email, password: userTwo.password, name: userTwo.name }, expectedStatus: 201 });
        userTwo.authToken = body.access_token;
    }, 'authentication');
    await runTest('Happy Path: Should register with minimum length password (6 chars)', async () => {
        const minPassUser = { email: `minpass_${Date.now()}@test.com`, password: '123456' };
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: minPassUser, expectedStatus: 201 });
    }, 'authentication');

    console.log('\n--- Bad Paths & Input Validation: /auth/register ---');
    await runTest('Should fail with 409 (Conflict) for duplicate email', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: userOne.email, password: userOne.password }, expectedStatus: 409 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for missing email', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { password: 'somepassword' }, expectedStatus: 400 });
        assert.ok(Array.isArray(body.message), "Error message should be an array of validation errors");
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for invalid email format', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: 'not-an-email', password: 'somepassword' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for null password', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: `fail_${Date.now()}@test.com`, password: null }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for empty string password', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: `fail_${Date.now()}@test.com`, password: '' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for password too short', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: `fail_${Date.now()}@test.com`, password: '123' }, expectedStatus: 400 });
    }, 'validation');

    console.log('\n--- Testing Endpoint: /auth/login ---');
    await runTest('Happy Path: Should log in User One successfully', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { email: userOne.email, password: userOne.password }, expectedStatus: 200 });
        userOne.authToken = body.access_token;
    }, 'authentication');

    console.log('\n--- Bad Paths & Input Validation: /auth/login ---');
    await runTest('Should fail with 401 (Unauthorized) for invalid email', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { email: 'nonexistent@example.com', password: 'somepassword' }, expectedStatus: 401 });
    }, 'validation');
    await runTest('Should fail with 401 (Unauthorized) for invalid password', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { email: userOne.email, password: 'wrongpassword' }, expectedStatus: 401 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for missing email', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { password: 'somepassword' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for missing password', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { email: userOne.email }, expectedStatus: 400 });
    }, 'validation');

    // =================================================================
    // === 2. EXPENSES (/expenses)
    // =================================================================
    console.log('\n--- Testing Endpoint: POST /expenses ---');
    await runTest('Happy Path: User One creates a new expense', async () => {
        const expense = { amount: 100.50, date: new Date().toISOString(), category: 'Food' };
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: expense, expectedStatus: 201 });
        assert.ok(body.id, 'Created expense should have an ID');
        userOne.expenseId = body.id;
    }, 'expenses');
    await runTest('Happy Path: User One creates another expense for filtering tests', async () => {
        const expense = { amount: 50.75, date: new Date(Date.now() - 86400000).toISOString(), category: 'Transport', note: 'Bus ticket' };
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: expense, expectedStatus: 201 });
        assert.ok(body.id, 'Created expense should have an ID');
    }, 'expenses');
    await runTest('Happy Path: User Two creates an expense (for security tests)', async () => {
        const expense = { amount: 25.00, date: new Date().toISOString(), category: 'Food' };
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userTwo.authToken, body: expense, expectedStatus: 201 });
        assert.ok(body.id, 'Created expense should have an ID');
    }, 'expenses');

    console.log('\n--- Bad Paths & Input Validation: POST /expenses ---');
    await runTest('Should fail with 401 (Unauthorized) if no auth token is provided', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', body: { amount: 10, date: new Date().toISOString(), category: 'Fun' }, expectedStatus: 401 });
    }, 'security');
    await runTest('Should fail with 400 (Bad Request) for missing required fields (amount, date, category)', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: {}, expectedStatus: 400 });
        assert.ok(Array.isArray(body.message) && body.message.length >= 3, "Should report multiple validation errors");
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for amount = 0', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: 0, date: new Date().toISOString(), category: 'Test' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for negative amount', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: -50, date: new Date().toISOString(), category: 'Test' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for non-numeric amount', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: "not-a-number", date: new Date().toISOString(), category: 'Test' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for invalid date format', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: 20, date: 'yesterday', category: 'Test' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for empty string category', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: 20, date: new Date().toISOString(), category: '' }, expectedStatus: 400 });
    }, 'validation');
    
    console.log('\n--- Bad Paths & Input Validation: GET /expenses (Query Filters) ---');
    await runTest('Should fail with 400 (Bad Request) for invalid startDate query', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses?startDate=invalid-date`, method: 'GET', token: userOne.authToken, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for invalid endDate query', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses?endDate=invalid-date`, method: 'GET', token: userOne.authToken, expectedStatus: 400 });
    }, 'validation');
    
    console.log('\n--- Testing Endpoint: GET /expenses (Happy Paths) ---');
    await runTest('Happy Path: User One can retrieve all their expenses', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.ok(Array.isArray(body), 'Response should be an array');
        assert.ok(body.length >= 2, 'Should have at least 2 expenses');
    }, 'expenses');
    await runTest('Happy Path: User One can filter expenses by category', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses?category=Food`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.ok(Array.isArray(body), 'Response should be an array');
        body.forEach(expense => assert.strictEqual(expense.category, 'Food', 'All expenses should be Food category'));
    }, 'expenses');
    await runTest('Happy Path: User One can filter expenses by date range', async () => {
        const today = new Date().toISOString().split('T')[0];
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses?startDate=${today}T00:00:00Z&endDate=${today}T23:59:59Z`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.ok(Array.isArray(body), 'Response should be an array');
    }, 'expenses');
    await runTest('Should fail with 401 (Unauthorized) for GET /expenses without token', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'GET', expectedStatus: 401 });
    }, 'security');

    console.log('\n--- Testing Endpoint: GET /expenses/summary/monthly ---');
    await runTest('Happy Path: User One can get monthly summary', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/summary/monthly`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.ok(typeof body.totalSpent === 'number', 'Should have totalSpent');
        assert.ok(typeof body.month === 'string', 'Should have month');
        assert.ok(Array.isArray(body.categories), 'Should have categories array');
    }, 'expenses');
    await runTest('Happy Path: User One can get monthly summary with specific year and month', async () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/summary/monthly?year=${currentYear}&month=${currentMonth}`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.ok(typeof body.totalSpent === 'number', 'Should have totalSpent');
        assert.ok(typeof body.month === 'string', 'Should have month');
    }, 'expenses');
    await runTest('Should fail with 401 (Unauthorized) for GET /expenses/summary/monthly without token', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/summary/monthly`, method: 'GET', expectedStatus: 401 });
    }, 'security');

    console.log('\n--- Testing Endpoint: GET /expenses/recent ---');
    await runTest('Happy Path: User One can get recent expenses', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/recent`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.ok(Array.isArray(body), 'Response should be an array');
        assert.ok(body.length <= 5, 'Should have at most 5 expenses');
    }, 'expenses');
    await runTest('Should fail with 401 (Unauthorized) for GET /expenses/recent without token', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/recent`, method: 'GET', expectedStatus: 401 });
    }, 'security');
    
    // =================================================================
    // === 3. EXPENSE ACCESS & MODIFICATION (/expenses/:id)
    // =================================================================
    console.log('\n--- Testing Endpoint: GET /expenses/:id ---');
    await runTest('Happy Path: User One can retrieve their own expense', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.strictEqual(body.id, userOne.expenseId);
    }, 'expenses');
    await runTest('Should fail with 401 (Unauthorized) for GET /expenses/:id without token', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', expectedStatus: 401 });
    }, 'security');
    await runTest('Should fail with 404 (Not Found) for GET with non-existent expense ID', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/999999`, method: 'GET', token: userOne.authToken, expectedStatus: 404 });
    }, 'validation');

    console.log('\n--- CRITICAL SECURITY TEST: Verifying Data Isolation ---');
    await runTest('GET: Should fail with 403 (Forbidden) when User Two requests User One\'s expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', token: userTwo.authToken, expectedStatus: 403 });
    }, 'security');
    await runTest('PATCH: Should fail with 403 (Forbidden) when User Two updates User One\'s expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userTwo.authToken, body: { amount: 1 }, expectedStatus: 403 });
    }, 'security');
    await runTest('DELETE: Should fail with 403 (Forbidden) when User Two deletes User One\'s expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'DELETE', token: userTwo.authToken, expectedStatus: 403 });
    }, 'security');
    
    console.log('\n--- Testing Endpoint: PATCH /expenses/:id ---');
    await runTest('Happy Path: User One can update their own expense', async () => {
        const updatePayload = { amount: 150.25, note: 'Updated Note' };
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userOne.authToken, body: updatePayload, expectedStatus: 200 });
        assert.strictEqual(body.amount, updatePayload.amount, "Amount should be updated");
        assert.strictEqual(body.note, updatePayload.note, "Note should be updated");
    }, 'expenses');
    
    console.log('\n--- Bad Paths & Input Validation: PATCH /expenses/:id ---');
    await runTest('Should fail with 400 (Bad Request) for negative amount on update', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userOne.authToken, body: { amount: -10 }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 400 (Bad Request) for invalid date on update', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userOne.authToken, body: { date: 'not-a-valid-date' }, expectedStatus: 400 });
    }, 'validation');
    await runTest('Should fail with 401 (Unauthorized) for PATCH /expenses/:id without token', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', body: { amount: 100 }, expectedStatus: 401 });
    }, 'security');
    await runTest('Should fail with 404 (Not Found) for PATCH with non-existent expense ID', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/999999`, method: 'PATCH', token: userOne.authToken, body: { amount: 100 }, expectedStatus: 404 });
    }, 'validation');

    // =================================================================
    // === 4. DELETION
    // =================================================================
    console.log('\n--- Testing Endpoint: DELETE /expenses/:id ---');
    await runTest('Should fail with 401 (Unauthorized) for DELETE /expenses/:id without token', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'DELETE', expectedStatus: 401 });
    }, 'security');
    await runTest('Should fail with 404 (Not Found) for DELETE with non-existent expense ID', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/999999`, method: 'DELETE', token: userOne.authToken, expectedStatus: 404 });
    }, 'validation');
    await runTest('Happy Path: User One can delete their own expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'DELETE', token: userOne.authToken, expectedStatus: 204 });
    }, 'expenses');
    
    await runTest('Should fail with 404 (Not Found) when trying to get a deleted expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', token: userOne.authToken, expectedStatus: 404 });
    }, 'expenses');
    
    // End test timing and display comprehensive summary
    testStats.endTime = new Date();
    const duration = testStats.endTime - testStats.startTime;
    const durationSeconds = (duration / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST EXECUTION SUMMARY');
    console.log('='.repeat(80));
    
    // Overall results
    console.log(`🎯 OVERALL RESULTS:`);
    console.log(`   ✅ Tests Passed: ${testStats.passed}`);
    console.log(`   ❌ Tests Failed: ${testStats.failed}`);
    console.log(`   📈 Total Tests: ${testStats.total}`);
    console.log(`   📊 Success Rate: ${((testStats.passed / testStats.total) * 100).toFixed(1)}%`);
    
    // Test breakdown by category
    console.log(`\n📋 TEST BREAKDOWN BY CATEGORY:`);
    Object.entries(testStats.categories).forEach(([category, stats]) => {
        if (stats.passed > 0 || stats.failed > 0) {
            const total = stats.passed + stats.failed;
            const successRate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : '0.0';
            console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${stats.passed}/${total} passed (${successRate}%)`);
        }
    });
    
    // Timing information
    console.log(`\n⏱️  TIMING INFORMATION:`);
    console.log(`   🚀 Started: ${testStats.startTime.toISOString()}`);
    console.log(`   🏁 Finished: ${testStats.endTime.toISOString()}`);
    console.log(`   ⏰ Duration: ${durationSeconds} seconds`);
    console.log(`   📏 Avg per test: ${(duration / testStats.total / 1000).toFixed(3)} seconds`);
    
    // Test coverage areas
    console.log(`\n🔍 TEST COVERAGE AREAS:`);
    console.log(`   🔐 Authentication & Authorization`);
    console.log(`   💰 Expense CRUD Operations`);
    console.log(`   🔒 Security & Data Isolation`);
    console.log(`   ✅ Input Validation & Error Handling`);
    console.log(`   🎯 Edge Cases & Boundary Conditions`);
    
    // Final status
    if (testStats.failed === 0) {
        console.log(`\n🎉 ALL TESTS PASSED! The Expense Tracker API is working perfectly! 🎉`);
        console.log(`✨ Ready for production deployment! ✨`);
    } else {
        console.log(`\n⚠️  ${testStats.failed} test(s) failed. Please review and fix issues before deployment.`);
    }
    
    console.log('='.repeat(80));
    console.log(`🏆 TEST SUITE EXECUTION COMPLETED`);
    console.log('='.repeat(80));
};

// Run the main async function
main().catch(err => {
    // The runTest function already handles detailed logging and process exit.
    // This catch is a final safety net.
    console.error('\n--- A critical, unhandled error occurred during the test run ---');
    console.error(err);
    process.exit(1);
});