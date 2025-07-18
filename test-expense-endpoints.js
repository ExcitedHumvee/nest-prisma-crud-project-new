#!/usr/bin/env node
const baseUrl = process.argv[2] || 'http://localhost:3000';

const testState = {
    passed: 0,
    failed: 0,
    total: 0,
    authToken: null,
    createdExpenseId: null,
};

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

function colorize(text, color) {
    return color + text + colors.reset;
}

function writeHeader(title) {
    console.log(`\n${colors.cyan}${colors.bold}--- ${title} ---${colors.reset}`);
}

async function testEndpoint({ description, method, uri, body, expectedStatusCodes, headers = {} }) {
    testState.total++;
    let res, data, error = null;
    
    try {
        const requestHeaders = { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json',
            ...headers
        };

        res = await fetch(uri, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });
        
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await res.json();
        } else {
            data = await res.text();
        }
    } catch (e) {
        error = e;
        res = { status: -1 };
    }

    if (expectedStatusCodes.includes(res.status)) {
        testState.passed++;
        console.log(`  ${colorize('[PASS]', colors.green)} It ${description}`);
        return { success: true, data, status: res.status };
    } else {
        testState.failed++;
        console.log(`  ${colorize('[FAIL]', colors.red)} It ${description} - Expected status in [${expectedStatusCodes.join(',')}], but got ${res.status}.`);
        if (error) {
            console.log(`    ${colorize('Error:', colors.red)} ${error.message}`);
        }
        if (data && typeof data === 'object' && data.message) {
            console.log(`    ${colorize('API Error:', colors.red)} ${data.message}`);
        }
        return { success: false, data, status: res.status };
    }
}

async function checkServerReachability() {
    writeHeader('Prerequisite: Server Reachability');
    try {
        const res = await fetch(`${baseUrl}/api`, { method: 'GET' });
        if (res.status < 500) {
            console.log(`  ${colorize('[INFO]', colors.green)} Server is reachable at ${baseUrl}.`);
            return true;
        } else {
            console.log(`  ${colorize('[FATAL]', colors.red)} Server returned ${res.status}. Check if the server is running.`);
            return false;
        }
    } catch (e) {
        console.log(`  ${colorize('[FATAL]', colors.red)} Could not connect to the server at ${baseUrl}. Aborting tests.`);
        return false;
    }
}

(async () => {
    // Check server reachability
    const serverReachable = await checkServerReachability();
    if (!serverReachable) {
        process.exit(1);
    }

    // Test Authentication Endpoints
    writeHeader('Testing Authentication Endpoints');
    
    // Test user registration (optional - we'll use seeded user)
    const registrationResult = await testEndpoint({
        description: 'should register a new user (POST /auth/register)',
        method: 'POST',
        uri: `${baseUrl}/auth/register`,
        body: {
            email: 'testuser@example.com',
            password: 'password123',
            name: 'Test User'
        },
        expectedStatusCodes: [201, 409], // 409 if user already exists
    });

    // Test user login with seeded user
    const loginResult = await testEndpoint({
        description: 'should login with existing user (POST /auth/login)',
        method: 'POST',
        uri: `${baseUrl}/auth/login`,
        body: {
            email: 'john@example.com',
            password: 'password123'
        },
        expectedStatusCodes: [200],
    });

    // Extract JWT token for authenticated requests
    if (loginResult.success && loginResult.data && loginResult.data.access_token) {
        testState.authToken = loginResult.data.access_token;
        console.log(`  ${colorize('[INFO]', colors.green)} JWT token extracted successfully`);
    } else {
        console.log(`  ${colorize('[FATAL]', colors.red)} Could not extract JWT token. Skipping authenticated tests.`);
        process.exit(1);
    }

    // Test invalid login
    await testEndpoint({
        description: 'should reject invalid credentials (POST /auth/login)',
        method: 'POST',
        uri: `${baseUrl}/auth/login`,
        body: {
            email: 'john@example.com',
            password: 'wrongpassword'
        },
        expectedStatusCodes: [401],
    });

    // Test Expense Endpoints
    writeHeader('Testing Expense Endpoints');

    const authHeaders = {
        'Authorization': `Bearer ${testState.authToken}`
    };

    // Test creating an expense
    const createExpenseResult = await testEndpoint({
        description: 'should create a new expense (POST /expenses)',
        method: 'POST',
        uri: `${baseUrl}/expenses`,
        body: {
            amount: 45.75,
            date: '2025-01-18T12:00:00Z',
            category: 'Food',
            note: 'Test expense from API test'
        },
        expectedStatusCodes: [201],
        headers: authHeaders,
    });

    // Extract expense ID for subsequent tests
    if (createExpenseResult.success && createExpenseResult.data && createExpenseResult.data.id) {
        testState.createdExpenseId = createExpenseResult.data.id;
        console.log(`  ${colorize('[INFO]', colors.green)} Created expense ID: ${testState.createdExpenseId}`);
    }

    // Test getting all expenses
    await testEndpoint({
        description: 'should get all expenses (GET /expenses)',
        method: 'GET',
        uri: `${baseUrl}/expenses`,
        expectedStatusCodes: [200],
        headers: authHeaders,
    });

    // Test getting expenses with filters
    await testEndpoint({
        description: 'should get expenses with category filter (GET /expenses?category=Food)',
        method: 'GET',
        uri: `${baseUrl}/expenses?category=Food`,
        expectedStatusCodes: [200],
        headers: authHeaders,
    });

    // Test getting expenses with date filter
    await testEndpoint({
        description: 'should get expenses with date filter (GET /expenses?startDate=2025-01-01)',
        method: 'GET',
        uri: `${baseUrl}/expenses?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z`,
        expectedStatusCodes: [200],
        headers: authHeaders,
    });

    // Test getting recent expenses
    await testEndpoint({
        description: 'should get recent expenses (GET /expenses/recent)',
        method: 'GET',
        uri: `${baseUrl}/expenses/recent`,
        expectedStatusCodes: [200],
        headers: authHeaders,
    });

    // Test getting monthly summary
    await testEndpoint({
        description: 'should get monthly summary (GET /expenses/summary/monthly)',
        method: 'GET',
        uri: `${baseUrl}/expenses/summary/monthly`,
        expectedStatusCodes: [200],
        headers: authHeaders,
    });

    // Test getting monthly summary with parameters
    await testEndpoint({
        description: 'should get monthly summary for specific month (GET /expenses/summary/monthly?year=2025&month=1)',
        method: 'GET',
        uri: `${baseUrl}/expenses/summary/monthly?year=2025&month=1`,
        expectedStatusCodes: [200],
        headers: authHeaders,
    });

    if (testState.createdExpenseId) {
        writeHeader(`Testing Specific Expense Endpoints (ID: ${testState.createdExpenseId})`);

        // Test getting expense by ID
        await testEndpoint({
            description: 'should get expense by ID (GET /expenses/:id)',
            method: 'GET',
            uri: `${baseUrl}/expenses/${testState.createdExpenseId}`,
            expectedStatusCodes: [200],
            headers: authHeaders,
        });

        // Test updating expense
        await testEndpoint({
            description: 'should update expense (PATCH /expenses/:id)',
            method: 'PATCH',
            uri: `${baseUrl}/expenses/${testState.createdExpenseId}`,
            body: {
                amount: 50.00,
                note: 'Updated test expense'
            },
            expectedStatusCodes: [200],
            headers: authHeaders,
        });

        // Test deleting expense
        await testEndpoint({
            description: 'should delete expense (DELETE /expenses/:id)',
            method: 'DELETE',
            uri: `${baseUrl}/expenses/${testState.createdExpenseId}`,
            expectedStatusCodes: [204],
            headers: authHeaders,
        });

        // Test getting deleted expense (should return 404)
        await testEndpoint({
            description: 'should return 404 for deleted expense (GET /expenses/:id)',
            method: 'GET',
            uri: `${baseUrl}/expenses/${testState.createdExpenseId}`,
            expectedStatusCodes: [404],
            headers: authHeaders,
        });
    } else {
        console.log(`\n${colors.yellow}${colors.bold}--- SKIPPING EXPENSE-SPECIFIC TESTS ---${colors.reset}`);
        console.log(colorize('Could not retrieve an expense ID from the creation step. Cannot test GET/PATCH/DELETE by ID.', colors.yellow));
    }

    // Test Error Handling
    writeHeader('Testing Error Handling');

    // Test unauthorized access
    await testEndpoint({
        description: 'should reject unauthorized access (GET /expenses without token)',
        method: 'GET',
        uri: `${baseUrl}/expenses`,
        expectedStatusCodes: [401],
    });

    // Test invalid expense data
    await testEndpoint({
        description: 'should reject invalid expense data (POST /expenses with invalid data)',
        method: 'POST',
        uri: `${baseUrl}/expenses`,
        body: {
            amount: -10, // Invalid negative amount
            date: 'invalid-date',
            category: ''
        },
        expectedStatusCodes: [400],
        headers: authHeaders,
    });

    // Test non-existent expense
    await testEndpoint({
        description: 'should return 404 for non-existent expense (GET /expenses/99999)',
        method: 'GET',
        uri: `${baseUrl}/expenses/99999`,
        expectedStatusCodes: [404],
        headers: authHeaders,
    });

    // Test Swagger documentation
    writeHeader('Testing Documentation Endpoints');
    
    await testEndpoint({
        description: 'should serve Swagger documentation (GET /api)',
        method: 'GET',
        uri: `${baseUrl}/api`,
        expectedStatusCodes: [200],
    });

    // Summary
    writeHeader('TEST SUMMARY');
    console.log(`${colors.bold}Total Tests:${colors.reset} ${testState.total}`);
    console.log(`${colors.green}Passed:     ${testState.passed}${colors.reset}`);
    console.log(`${colors.red}Failed:     ${testState.failed}${colors.reset}`);
    console.log(`${colors.cyan}Success Rate: ${Math.round((testState.passed / testState.total) * 100)}%${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}--- END OF SUMMARY ---${colors.reset}`);
    
    if (testState.failed > 0) {
        process.exit(1);
    }
})();
