#!/usr/bin/env node
const baseUrl = process.argv[2] || 'http://localhost:3000/users';
const rootUrl = baseUrl.replace(/\/users$/, '');

const testState = {
    passed: 0,
    failed: 0,
    total: 0,
    createdUserId: null,
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

async function testEndpoint({ description, method, uri, body, expectedStatusCodes }) {
    testState.total++;
    let res, data, error = null;
    try {
        res = await fetch(uri, {
            method,
            headers: { 'Accept': 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
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
        return { data };
    } else {
        let details = `Expected status in [${expectedStatusCodes.join(',')}], but got ${res.status}.`;
        if (error) details += ` Error: ${error.message}`;
        console.log(`  ${colorize('[FAIL]', colors.red)} It ${description} - ${details}`);
        testState.failed++;
        return null;
    }
}

function newTestUserData() {
    const guid = Math.random().toString(36).substring(2, 10);
    return { name: `User_${guid}`, email: `test_${guid}@example.com` };
}

(async function main() {
    writeHeader('Prerequisite: Server Reachability');
    try {
        const res = await fetch(rootUrl, { method: 'GET' });
        if (!res.ok && res.status !== 404) throw new Error('Unexpected status');
        console.log(`  ${colorize('[INFO]', colors.yellow)} Server is reachable at ${rootUrl}.`);
    } catch (e) {
        console.log(`  ${colorize('[FATAL]', colors.red)} Could not connect to the server at ${rootUrl}. Aborting tests.`);
        process.exit(1);
    }

    writeHeader('Testing /users (Collection Endpoint)');

    // Create user
    const createdUserResult = await testEndpoint({
        description: 'should create a new user (POST)',
        method: 'POST',
        uri: `${baseUrl}`,
        body: newTestUserData(),
        expectedStatusCodes: [200, 201],
    });
    const createdUser = createdUserResult && createdUserResult.data ? createdUserResult.data : createdUserResult;
    if (createdUser && createdUser.id) {
        testState.createdUserId = createdUser.id;
        console.log(`    -  (Validation) ${colorize('User created with ID:', colors.green)} ${testState.createdUserId}`);
    } else {
        console.log(`    -  (Validation) ${colorize('[FAIL] Response for created user is missing an id property.', colors.red)}`);
        testState.failed++;
        testState.passed--;
    }

    // Get all users
    await testEndpoint({
        description: 'should list all users (GET)',
        method: 'GET',
        uri: `${baseUrl}`,
        expectedStatusCodes: [200],
    });

    if (testState.createdUserId) {
        const userId = testState.createdUserId;
        writeHeader(`Testing /users/${userId} (Specific User Endpoint)`);
        // Test GET by ID
        await testEndpoint({
            description: 'should get the created user by ID (GET)',
            method: 'GET',
            uri: `${baseUrl}/${userId}`,
            expectedStatusCodes: [200],
        });
        // Test PUT (Update)
        const updatePayload = { name: `Updated User`, email: createdUser.email };
        await testEndpoint({
            description: 'should update the user by ID (PUT)',
            method: 'PUT',
            uri: `${baseUrl}/${userId}`,
            body: updatePayload,
            expectedStatusCodes: [200],
        });
        // Test DELETE
        await testEndpoint({
            description: 'should delete the user by ID (DELETE)',
            method: 'DELETE',
            uri: `${baseUrl}/${userId}`,
            expectedStatusCodes: [200, 204],
        });
        // Test GET after DELETE
        await testEndpoint({
            description: 'should return 404 for the deleted user',
            method: 'GET',
            uri: `${baseUrl}/${userId}`,
            expectedStatusCodes: [404],
        });
    } else {
        console.log(`\n${colors.yellow}${colors.bold}--- SKIPPING USER-SPECIFIC TESTS ---${colors.reset}`);
        console.log(colorize('Could not retrieve a user ID from the creation step. Cannot test GET/PUT/DELETE by ID.', colors.yellow));
    }

    writeHeader('TEST SUMMARY');
    console.log(`${colors.bold}Total Tests:${colors.reset} ${testState.total}`);
    console.log(`${colors.green}Passed:     ${testState.passed}${colors.reset}`);
    console.log(`${colors.red}Failed:     ${testState.failed}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}--- END OF SUMMARY ---${colors.reset}`);
    if (testState.failed > 0) process.exit(1);
})();