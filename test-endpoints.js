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

/**
 * A robust test runner that provides detailed logging on failure.
 * @param {string} testName - The name of the test.
 * @param {Function} testFunction - The async function that performs the test logic.
 */
const runTest = async (testName, testFunction) => {
  console.log(`\n▶️  Running: ${testName}`);
  try {
    await testFunction();
    console.log(`✅  PASSED: ${testName}`);
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

    console.log('--- Starting Comprehensive Expense Tracker API E2E Tests ---');

    // =================================================================
    // === 1. AUTHENTICATION (/auth)
    // =================================================================
    console.log('\n--- Testing Endpoint: /auth/register ---');
    await runTest('Happy Path: Should register User One successfully', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: userOne.email, password: userOne.password, name: userOne.name }, expectedStatus: 201 });
        assert.ok(body.access_token, 'Response should contain an access_token');
        userOne.authToken = body.access_token;
    });
    await runTest('Happy Path: Should register User Two successfully', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: userTwo.email, password: userTwo.password, name: userTwo.name }, expectedStatus: 201 });
        userTwo.authToken = body.access_token;
    });
    await runTest('Happy Path: Should register with minimum length password (6 chars)', async () => {
        const minPassUser = { email: `minpass_${Date.now()}@test.com`, password: '123456' };
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: minPassUser, expectedStatus: 201 });
    });

    console.log('\n--- Bad Paths & Input Validation: /auth/register ---');
    await runTest('Should fail with 409 (Conflict) for duplicate email', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: userOne.email, password: userOne.password }, expectedStatus: 409 });
    });
    await runTest('Should fail with 400 (Bad Request) for missing email', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { password: 'somepassword' }, expectedStatus: 400 });
        assert.ok(Array.isArray(body.message), "Error message should be an array of validation errors");
    });
    await runTest('Should fail with 400 (Bad Request) for invalid email format', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: 'not-an-email', password: 'somepassword' }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for null password', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: `fail_${Date.now()}@test.com`, password: null }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for empty string password', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: `fail_${Date.now()}@test.com`, password: '' }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for password too short', async () => {
        await makeRequest({ url: `${API_BASE_URL}/auth/register`, method: 'POST', body: { email: `fail_${Date.now()}@test.com`, password: '123' }, expectedStatus: 400 });
    });

    console.log('\n--- Testing Endpoint: /auth/login ---');
    await runTest('Happy Path: Should log in User One successfully', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/auth/login`, method: 'POST', body: { email: userOne.email, password: userOne.password }, expectedStatus: 200 });
        userOne.authToken = body.access_token;
    });

    // =================================================================
    // === 2. EXPENSES (/expenses)
    // =================================================================
    console.log('\n--- Testing Endpoint: POST /expenses ---');
    await runTest('Happy Path: User One creates a new expense', async () => {
        const expense = { amount: 100.50, date: new Date().toISOString(), category: 'Food' };
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: expense, expectedStatus: 201 });
        assert.ok(body.id, 'Created expense should have an ID');
        userOne.expenseId = body.id;
    });

    console.log('\n--- Bad Paths & Input Validation: POST /expenses ---');
    await runTest('Should fail with 401 (Unauthorized) if no auth token is provided', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', body: { amount: 10, date: new Date().toISOString(), category: 'Fun' }, expectedStatus: 401 });
    });
    await runTest('Should fail with 400 (Bad Request) for missing required fields (amount, date, category)', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: {}, expectedStatus: 400 });
        assert.ok(Array.isArray(body.message) && body.message.length >= 3, "Should report multiple validation errors");
    });
    await runTest('Should fail with 400 (Bad Request) for amount = 0', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: 0, date: new Date().toISOString(), category: 'Test' }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for negative amount', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: -50, date: new Date().toISOString(), category: 'Test' }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for non-numeric amount', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: "not-a-number", date: new Date().toISOString(), category: 'Test' }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for invalid date format', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: 20, date: 'yesterday', category: 'Test' }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for empty string category', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses`, method: 'POST', token: userOne.authToken, body: { amount: 20, date: new Date().toISOString(), category: '' }, expectedStatus: 400 });
    });
    
    console.log('\n--- Bad Paths & Input Validation: GET /expenses (Query Filters) ---');
    await runTest('Should fail with 400 (Bad Request) for invalid startDate query', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses?startDate=invalid-date`, method: 'GET', token: userOne.authToken, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for invalid endDate query', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses?endDate=invalid-date`, method: 'GET', token: userOne.authToken, expectedStatus: 400 });
    });
    
    // =================================================================
    // === 3. EXPENSE ACCESS & MODIFICATION (/expenses/:id)
    // =================================================================
    console.log('\n--- Testing Endpoint: GET /expenses/:id ---');
    await runTest('Happy Path: User One can retrieve their own expense', async () => {
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', token: userOne.authToken, expectedStatus: 200 });
        assert.strictEqual(body.id, userOne.expenseId);
    });

    console.log('\n--- CRITICAL SECURITY TEST: Verifying Data Isolation ---');
    await runTest('GET: Should fail with 403 (Forbidden) when User Two requests User One\'s expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', token: userTwo.authToken, expectedStatus: 403 });
    });
    await runTest('PATCH: Should fail with 403 (Forbidden) when User Two updates User One\'s expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userTwo.authToken, body: { amount: 1 }, expectedStatus: 403 });
    });
    await runTest('DELETE: Should fail with 403 (Forbidden) when User Two deletes User One\'s expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'DELETE', token: userTwo.authToken, expectedStatus: 403 });
    });
    
    console.log('\n--- Testing Endpoint: PATCH /expenses/:id ---');
    await runTest('Happy Path: User One can update their own expense', async () => {
        const updatePayload = { amount: 150.25, note: 'Updated Note' };
        const body = await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userOne.authToken, body: updatePayload, expectedStatus: 200 });
        assert.strictEqual(body.amount, updatePayload.amount, "Amount should be updated");
        assert.strictEqual(body.note, updatePayload.note, "Note should be updated");
    });
    
    console.log('\n--- Bad Paths & Input Validation: PATCH /expenses/:id ---');
    await runTest('Should fail with 400 (Bad Request) for negative amount on update', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userOne.authToken, body: { amount: -10 }, expectedStatus: 400 });
    });
    await runTest('Should fail with 400 (Bad Request) for invalid date on update', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'PATCH', token: userOne.authToken, body: { date: 'not-a-valid-date' }, expectedStatus: 400 });
    });

    // =================================================================
    // === 4. DELETION
    // =================================================================
    console.log('\n--- Testing Endpoint: DELETE /expenses/:id ---');
    await runTest('Happy Path: User One can delete their own expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'DELETE', token: userOne.authToken, expectedStatus: 204 });
    });
    
    await runTest('Should fail with 404 (Not Found) when trying to get a deleted expense', async () => {
        await makeRequest({ url: `${API_BASE_URL}/expenses/${userOne.expenseId}`, method: 'GET', token: userOne.authToken, expectedStatus: 404 });
    });
    
    console.log('\n-----------------------------------------------');
    console.log('✅ All E2E tests passed successfully!');
    console.log('-----------------------------------------------');
};

// Run the main async function
main().catch(err => {
    // The runTest function already handles detailed logging and process exit.
    // This catch is a final safety net.
    console.error('\n--- A critical, unhandled error occurred during the test run ---');
    console.error(err);
    process.exit(1);
});